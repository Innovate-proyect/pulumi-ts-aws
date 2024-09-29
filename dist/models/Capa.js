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
exports.Capa = void 0;
const aws = __importStar(require("@pulumi/aws"));
const pulumi = __importStar(require("@pulumi/pulumi"));
const utils_1 = require("./utils");
const DockerPython_1 = require("../models/DockerPython");
class Capa {
    constructor() {
        const config = new pulumi.Config("aws");
        this.region = config.require("region");
    }
    crearCapa(arg) {
        const dockerPython = new DockerPython_1.DockerPython();
        const primerDirectorio = (0, utils_1.obtenerPrimerDirectorio)(arg.ruta);
        const nombreCapa = (0, utils_1.obtenerUltimoDirectorio)(arg.ruta);
        const nombreFormateado = (0, utils_1.eliminarCaracteresEspecialesYEspacios)(nombreCapa);
        const runTimes = arg.compatibleRuntimes[0];
        const vRunTime = (0, utils_1.extraerVersion)(runTimes);
        const pathOutputZip = `${process.cwd()}/build/dist`;
        let archivoZip = `ly${runTimes}_${nombreCapa}`;
        if (primerDirectorio == "python") {
            dockerPython.crearLibPython(nombreCapa, vRunTime, pathOutputZip, archivoZip);
        }
        const codeHash = (0, utils_1.generarHashBase64)(`${pathOutputZip}/${archivoZip}.zip`);
        const capa = new aws.lambda.LayerVersion(`sls_${nombreFormateado}`, {
            code: new pulumi.asset.FileArchive(`${pathOutputZip}/${archivoZip}.zip`),
            sourceCodeHash: codeHash,
            layerName: nombreCapa,
            compatibleRuntimes: arg.compatibleRuntimes,
            description: arg.descripcion,
        });
        return capa;
    }
}
exports.Capa = Capa;
// import { DockerPython } from './DockerPython';
// import { DockerNode } from './DockerNode';
// class Capa {
//   public static async crearCapa(capa: string, tipo: 'python' | 'nodejs', version: string) {
//     if (tipo === 'python') {
//       await DockerPython.crearLibPython(capa, version);
//     } else if (tipo === 'nodejs') {
//       await DockerNode.crearLibPython(capa, version);
//     } else {
//       throw new Error(`Tipo de capa ${tipo} no soportado.`);
//     }
//   }
// }
// docker build--build - arg vPython = 3.10 - t python - build - capa.
