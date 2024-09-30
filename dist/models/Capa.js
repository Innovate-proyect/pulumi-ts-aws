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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Capa = void 0;
const aws = __importStar(require("@pulumi/aws"));
const pulumi = __importStar(require("@pulumi/pulumi"));
const utils_1 = require("./utils");
const child_process_1 = require("child_process");
const path = require("path");
class Capa {
    constructor() {
        const config = new pulumi.Config("aws");
        this.region = config.require("region");
    }
    crearDockerPython(capa, vPython, pathOutputZip, archivoZip) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dockerfileSource = path.join(__dirname, "../dockerfiles/Dockerfile.python");
                const dockerImageName = `python-build-${capa}`;
                (0, child_process_1.execSync)(`
        docker build -q -t ${dockerImageName} --build-arg capa=${capa} --build-arg vPython=${vPython} --build-arg nArchivo=${archivoZip} -f ${dockerfileSource} .
      `);
                (0, child_process_1.execSync)(`
        docker run --rm -v ${pathOutputZip}:/output ${dockerImageName} bash -c "cp /app/${archivoZip}.zip /output/"
      `);
                (0, child_process_1.execSync)(`docker rmi ${dockerImageName}`);
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error("Error ejecutando Docker para Python:", error.message);
                    throw new Error("Error ejecutando Docker para Python: " + error.message);
                }
                else {
                    throw new Error("Error desconocido durante la construccion del layer.");
                }
            }
        });
    }
    crearCapaPython(arg) {
        const nombreFormateado = (0, utils_1.eliminarCaracteresEspecialesYEspacios)(arg.nombre);
        const vPython = arg.versionesCompatibles[0];
        const pathOutputZip = `${process.cwd()}/build/dist`;
        const archivoZip = `lyPython${vPython}_${arg.nombre}`;
        this.crearDockerPython(arg.nombre, vPython, pathOutputZip, archivoZip);
        const codeHash = (0, utils_1.generarHashBase64)(`${pathOutputZip}/${archivoZip}.zip`);
        const capa = new aws.lambda.LayerVersion(`sls_${nombreFormateado}`, {
            code: new pulumi.asset.FileArchive(``),
            sourceCodeHash: codeHash,
            layerName: arg.nombre,
            compatibleRuntimes: arg.versionesCompatibles,
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
