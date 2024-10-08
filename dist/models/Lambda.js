"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Funcion = void 0;
const aws = __importStar(require("@pulumi/aws"));
const pulumi = __importStar(require("@pulumi/pulumi"));
const CrearZip_1 = require("./CrearZip");
const utils_1 = require("./utils");
const variables_1 = require("../env/variables");
class Funcion {
    constructor(bucket) {
        const config = new pulumi.Config("aws");
        const account = aws.getCallerIdentity({});
        this.region = config.require("region");
        this.awsAccountId = account.then((id) => id.accountId);
        this.bucket = bucket;
    }
    crearFuncion(arg) {
        const crearzip = new CrearZip_1.CrearZip();
        const nombreDirectorio = (0, utils_1.obtenerPrimerDirectorio)(arg.codigoFuente.ruta);
        const nombreFormateado = (0, utils_1.eliminarCaracteresEspecialesYEspacios)(nombreDirectorio);
        const nombreRecursoFuncion = (0, utils_1.eliminarCaracteresEspeciales)(nombreDirectorio);
        const codigoFuente = crearzip.comprimirCodigo({
            nombreZip: `fn${arg.runtime}_${nombreFormateado}`,
            ruta: `src/funciones/${arg.codigoFuente.ruta}`,
            rutaSalida: "dist/lambdas",
            archivosExcluidos: arg.codigoFuente.archivosExcluidos,
        });
        const funcionZip = new aws.s3.BucketObject(`${variables_1.PREF_S3OBJECT}${nombreFormateado}`, {
            bucket: this.bucket,
            source: new pulumi.asset.FileArchive(codigoFuente.then((cont) => cont.outputPath)),
        });
        const funcion = new aws.lambda.Function(`${variables_1.PREF_LAMBFUNTION}${(0, utils_1.eliminarCaracteresEspeciales)(nombreDirectorio)}`, {
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
        }, {
            dependsOn: arg.dependencias,
        });
        if (arg.eventos) {
            for (const evento of arg.eventos) {
                switch (evento.tipo) {
                    case "s3":
                        this.crearEventoS3(funcion, evento.parametros, nombreRecursoFuncion);
                        break;
                    default:
                        console.warn(`Tipo de evento no soportado: ${evento.tipo}`);
                }
            }
        }
        return funcion;
    }
    crearEventoS3(funcion, eventoS3, nombreRecursoFuncion) {
        // const nombreS3 = eventoS3.bucketArn.split(':::')[1]
        const bucket = aws.s3.getBucket({
            bucket: eventoS3.nombreBucket,
        });
        const permisosS3 = new aws.lambda.Permission(`${variables_1.PREF_LAMBPERMISSION}${nombreRecursoFuncion}${(0, utils_1.eliminarCaracteresEspeciales)(eventoS3.nombreBucket)}`, {
            statementId: "AllowExecutionFromS3Bucket",
            action: "lambda:InvokeFunction",
            function: funcion.arn,
            principal: "s3.amazonaws.com",
            sourceAccount: this.awsAccountId,
            sourceArn: bucket.then((s3) => s3.arn),
        }, { dependsOn: [funcion] });
        new aws.s3.BucketNotification(`${variables_1.PREF_S3NOTIFICATION}${(0, utils_1.eliminarCaracteresEspeciales)(eventoS3.nombreBucket)}${nombreRecursoFuncion}`, {
            bucket: bucket.then((s3) => s3.id),
            lambdaFunctions: [
                {
                    lambdaFunctionArn: funcion.arn,
                    events: eventoS3.eventos,
                    filterPrefix: eventoS3.prefigo,
                    filterSuffix: eventoS3.extencion,
                },
            ],
        }, {
            dependsOn: [permisosS3],
        });
    }
}
exports.Funcion = Funcion;
