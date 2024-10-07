import { IFuncionArgs, IFuncion } from "../interfaces/ILambda";
import * as aws from "@pulumi/aws";
import { TFuncion, TPOutputAny } from "../interfaces/Iglobal";
import * as pulumi from "@pulumi/pulumi";
import { CrearZip } from "./CrearZip";
import {
  eliminarCaracteresEspeciales,
  eliminarCaracteresEspecialesYEspacios,
  obtenerPrimerDirectorio,
} from "./utils";
import { IEventoS3 } from "../interfaces/IEvento";
import {
  PREF_LAMBFUNTION,
  PREF_LAMBPERMISSION,
  PREF_S3NOTIFICATION,
  PREF_S3OBJECT,
} from "../env/variables";

export class Funcion implements IFuncion {
  private region: string;
  private awsAccountId: Promise<string>;
  private bucket: TPOutputAny;

  constructor(bucket: TPOutputAny) {
    const config = new pulumi.Config("aws");
    const account = aws.getCallerIdentity({});
    this.region = config.require("region");
    this.awsAccountId = account.then((id) => id.accountId);
    this.bucket = bucket;
  }
  public crearFuncion(arg: IFuncionArgs): TFuncion {
    const crearzip = new CrearZip();
    const nombreDirectorio = obtenerPrimerDirectorio(arg.codigoFuente.ruta);
    const nombreFormateado =
      eliminarCaracteresEspecialesYEspacios(nombreDirectorio);
    const nombreRecursoFuncion = eliminarCaracteresEspeciales(nombreDirectorio);

    const codigoFuente = crearzip.comprimirCodigo({
      nombreZip: `fn${arg.runtime}_${nombreFormateado}`,
      ruta: `src/funciones/${arg.codigoFuente.ruta}`,
      rutaSalida: "dist/lambdas",
      archivosExcluidos: arg.codigoFuente.archivosExcluidos,
    });

    const funcionZip = new aws.s3.BucketObject(
      `${PREF_S3OBJECT}${nombreFormateado}`,
      {
        bucket: this.bucket,
        source: new pulumi.asset.FileArchive(
          codigoFuente.then((cont) => cont.outputPath)
        ),
      }
    );

    const funcion = new aws.lambda.Function(
      `${PREF_LAMBFUNTION}${eliminarCaracteresEspeciales(nombreDirectorio)}`,
      {
        name: nombreDirectorio,
        role: arg.roleArn,
        handler: arg.handler,
        runtime: arg.runtime,
        layers: arg.capas,
        architectures: ["x86_64"],
        memorySize: arg.memoria || 128,
        timeout: arg.tiempoEjecucion || 3,
        s3Bucket: this.bucket,
        s3Key: funcionZip.key,
        sourceCodeHash: codigoFuente.then((cont) => cont.outputBase64sha256),
        environment: {
          variables: arg.variablesEntorno,
        },
        description: arg.descripcion,
        tracingConfig: {
          mode: "Active",
        },
        loggingConfig: {
          logFormat: "JSON",
          logGroup: arg.nombreGrupoLog,
          systemLogLevel: "DEBUG",
        },
        tags: arg.etiquetas,
      },
      {
        dependsOn: arg.dependencias,
      }
    );

    if (arg.eventos) {
      for (const evento of arg.eventos) {
        switch (evento.tipo) {
          case "s3":
            this.crearEventoS3(
              funcion,
              evento.parametros as IEventoS3,
              nombreRecursoFuncion
            );
            break;
          default:
            console.warn(`Tipo de evento no soportado: ${evento.tipo}`);
        }
      }
    }

    return funcion;
  }

  private crearEventoS3(
    funcion: TFuncion,
    eventoS3: IEventoS3,
    nombreRecursoFuncion: string
  ) {
    // const nombreS3 = eventoS3.bucketArn.split(':::')[1]

    const bucket = aws.s3.getBucket({
      bucket: eventoS3.nombreBucket,
    });

    const permisosS3 = new aws.lambda.Permission(
      `${PREF_LAMBPERMISSION}${nombreRecursoFuncion}${eliminarCaracteresEspeciales(
        eventoS3.nombreBucket
      )}`,
      {
        statementId: "AllowExecutionFromS3Bucket",
        action: "lambda:InvokeFunction",
        function: funcion.arn,
        principal: "s3.amazonaws.com",
        sourceAccount: this.awsAccountId,
        sourceArn: bucket.then((s3) => s3.arn),
      },
      { dependsOn: [funcion] }
    );

    new aws.s3.BucketNotification(
      `${PREF_S3NOTIFICATION}${eliminarCaracteresEspeciales(
        eventoS3.nombreBucket
      )}${nombreRecursoFuncion}`,
      {
        bucket: bucket.then((s3) => s3.id),
        lambdaFunctions: [
          {
            lambdaFunctionArn: funcion.arn,
            events: eventoS3.eventos,
            filterPrefix: eventoS3.prefigo,
            filterSuffix: eventoS3.extencion,
          },
        ],
      },
      {
        dependsOn: [permisosS3],
      }
    );
  }
}
