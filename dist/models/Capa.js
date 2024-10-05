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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const utils_1 = require("./utils");
const variables_1 = require("../env/variables");
const child_process_1 = require("child_process");
const DockerLayer_1 = require("./DockerLayer");
class Capa {
    constructor(bucket) {
        const config = new pulumi.Config("aws");
        this.region = config.require("region");
        this.outputDir = path.join(process.cwd(), 'dist', 'layers');
        this.bucket = bucket;
    }
    crearCapaPython(arg) {
        const nombreFormateado = (0, utils_1.eliminarCaracteresEspeciales)(arg.nombre);
        const pythonVersion = arg.versionesCompatibles[0];
        const versionesCompatibles = arg.versionesCompatibles.map(v => `python${v}`);
        const nArchivo = `lyPython${pythonVersion}_${arg.nombre}`;
        const dockerImageName = `python-build-${arg.nombre}`;
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
        const { dockerfilePath, workDir } = new DockerLayer_1.DockerLayer().archivosTempPython(arg.requirements, pythonVersion, nArchivo);
        (0, child_process_1.execSync)(` docker build -q -t ${dockerImageName} -f ${dockerfilePath} ${workDir} `);
        (0, child_process_1.execSync)(`docker run --rm -v ${this.outputDir}:/output ${dockerImageName} bash -c "cp /app/${nArchivo}.zip /output/"`);
        fs.rmSync(workDir, { recursive: true, force: true });
        (0, child_process_1.execSync)(`docker rmi ${dockerImageName}`);
        const capaZip = new aws.s3.BucketObject(`${variables_1.PREF_S3OBJECT}${nombreFormateado}`, {
            bucket: this.bucket,
            source: new pulumi.asset.FileAsset(`${this.outputDir}/${nArchivo}.zip`),
        });
        const capa = new aws.lambda.LayerVersion(`${variables_1.PREF_LAMBLAYEVERSION}${nombreFormateado}`, {
            layerName: arg.nombre,
            s3Bucket: this.bucket,
            s3Key: capaZip.key,
            compatibleRuntimes: versionesCompatibles,
            description: arg.descripcion,
            sourceCodeHash: (0, utils_1.generarHashBase64)(`${this.outputDir}/${nArchivo}.zip`)
        }, { dependsOn: [capaZip] });
        return capa;
    }
}
exports.Capa = Capa;
// FROM python:${pythonVersion}
// WORKDIR /app
// COPY requirements.txt .
// RUN pip install --no-cache-dir -r requirements.txt -t /python
// RUN apt-get update && apt-get install -y zip
// RUN zip -r ${nArchivo}.zip /python
// CMD ["echo", "Python dependencies packaged!"]
//   private crearArchivosTemporales(requirements: string[], pythonVersion: string, nArchivo: string): { dockerfilePath: string, requirementsPath: string, workDir: string } {
//     const workDir = path.join(process.cwd(), 'build', 'lib', 'espacioparalayer');
//     if (!fs.existsSync(workDir)) {
//       fs.mkdirSync(workDir, { recursive: true });
//     }
//     const dockerfilePath = path.join(workDir, 'Dockerfile');
//     const requirementsPath = path.join(workDir, 'requirements.txt');
//     const dockerfileContent = `
// FROM python:${pythonVersion}
// WORKDIR /app
// COPY requirements.txt .
// RUN pip install --no-cache-dir -r requirements.txt -t /python
// RUN apt-get update && apt-get install -y zip
// RUN zip -r ${nArchivo}.zip /python
// CMD ["echo", "Python dependencies packaged!"]
// `;
//     fs.writeFileSync(dockerfilePath, dockerfileContent);
//     fs.writeFileSync(requirementsPath, requirements.join('\n'));
//     return { dockerfilePath, requirementsPath, workDir };
//   }
