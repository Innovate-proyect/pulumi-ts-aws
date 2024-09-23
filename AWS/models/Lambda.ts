import { IFuncionArgs, IFuncion } from "../interfaces/ILambda";
import * as aws from "@pulumi/aws";
import { TFuncion } from "../interfaces/Iglobal";
import * as pulumi from "@pulumi/pulumi";
import { CrearZip } from './CrearZip';
import { eliminarCaracteresEspecialesYEspacios, obtenerPrimerDirectorio } from './utils';
import { IEventoS3 } from "../interfaces/IEvento";

export class Funcion implements IFuncion {
  private region: string;
  private awsAccountId: Promise<string>

  constructor() {
    const config = new pulumi.Config("aws");
    const account = aws.getCallerIdentity({});
    this.region = config.require("region");
    this.awsAccountId = account.then(id => id.accountId)
  }

  public crearFuncion(arg: IFuncionArgs): TFuncion {
    const crearzip = new CrearZip()
    const nombreDirectorio = obtenerPrimerDirectorio(arg.codigoFuente.ruta)
    const nombreFormateado = eliminarCaracteresEspecialesYEspacios(nombreDirectorio)

    const codigoFuente = crearzip.comprimirCodigo({
      nombreZip: nombreDirectorio,
      ruta: `src/funciones/${arg.codigoFuente.ruta}`,
      archivosExcluidos: arg.codigoFuente.archivosExcluidos
    });

    const funcion = new aws.lambda.Function(`sls_${nombreFormateado}`, {
      name: nombreDirectorio,
      role: arg.roleArn,
      handler: arg.handler,
      runtime: arg.runtime,
      layers: arg.capas,
      architectures: ["x86_64"],
      memorySize: arg.memoria || 128,
      timeout: arg.tiempoEjecucion || 3,
      code: new pulumi.asset.FileArchive(
        codigoFuente.then((cont) => cont.outputPath)
      ),
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
    }, {
      dependsOn: arg.dependencias
    });

    if (arg.eventos) {
      for (const evento of arg.eventos) {
        switch (evento.tipo) {
          case 's3':
            this.crearEventoS3(funcion, evento.parametros as IEventoS3, nombreFormateado);
            break;
          default:
            console.warn(`Tipo de evento no soportado: ${evento.tipo}`);
        }
      }
    }


    return funcion;
  }

  private crearEventoS3(funcion: TFuncion, eventoS3: IEventoS3, nombreFuncion: string) {
    // const nombreS3 = eventoS3.bucketArn.split(':::')[1]

    const bucket = aws.s3.getBucket({
      bucket: eventoS3.nombreBucket,
    });

    const permisosS3 = new aws.lambda.Permission(`sls_${nombreFuncion}-permiso-${eventoS3.nombreBucket}`, {
      statementId: "AllowExecutionFromS3Bucket",
      action: "lambda:InvokeFunction",
      function: funcion.arn,
      principal: "s3.amazonaws.com",
      sourceAccount: this.awsAccountId,
      sourceArn: bucket.then(s3 => s3.arn),
    }, { dependsOn: [funcion] });

    new aws.s3.BucketNotification(`sls_${eventoS3.nombreBucket}-notificacion-${nombreFuncion}`, {
      bucket: bucket.then(s3 => s3.id),
      lambdaFunctions: [
        {
          lambdaFunctionArn: funcion.arn,
          events: eventoS3.eventos,
          filterPrefix: eventoS3.prefigo,
          filterSuffix: eventoS3.extencion,
        }
      ],
    }, {
      dependsOn: [permisosS3],
    });

  }

}
