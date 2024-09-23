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
class Funcion {
    constructor() {
        const config = new pulumi.Config("aws");
        const account = aws.getCallerIdentity({});
        this.region = config.require("region");
        this.awsAccountId = account.then(id => id.accountId);
    }
    crearFuncion(arg) {
        const crearzip = new CrearZip_1.CrearZip();
        const nombreDirectorio = (0, utils_1.obtenerPrimerDirectorio)(arg.codigoFuente.ruta);
        const nombreFormateado = (0, utils_1.eliminarCaracteresEspecialesYEspacios)(nombreDirectorio);
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
            code: new pulumi.asset.FileArchive(codigoFuente.then((cont) => cont.outputPath)),
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
                        this.crearEventoS3(funcion, evento.parametros, nombreFormateado);
                        break;
                    default:
                        console.warn(`Tipo de evento no soportado: ${evento.tipo}`);
                }
            }
        }
        return funcion;
    }
    crearEventoS3(funcion, eventoS3, nombreFuncion) {
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
exports.Funcion = Funcion;
