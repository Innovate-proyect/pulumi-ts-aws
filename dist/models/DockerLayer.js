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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerLayer = void 0;
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const os = __importStar(require("os"));
class DockerLayer {
    archivosTempPython(requirements, pythonVersion, nArchivo) {
        const workDir = fs.mkdtempSync(path_1.default.join(os.tmpdir(), 'espacioparalayer-'));
        const dockerfilePath = path_1.default.join(workDir, 'Dockerfile');
        const requirementsPath = path_1.default.join(workDir, 'requirements.txt');
        const dockerfileContent = `
FROM python:${pythonVersion}

WORKDIR /app

COPY requirements.txt .

RUN python${pythonVersion} -m venv create_layer && \
    create_layer/bin/pip install --no-cache-dir -r requirements.txt

RUN mkdir python

RUN cp -r create_layer/lib python/


RUN apt-get update && apt-get install -y zip

RUN zip -r ${nArchivo}.zip /python

CMD ["echo", "Layer created and packaged!"]
`;
        // Crear los archivos temporales
        fs.writeFileSync(dockerfilePath, dockerfileContent);
        fs.writeFileSync(requirementsPath, requirements.join('\n'));
        return { dockerfilePath, workDir };
    }
}
exports.DockerLayer = DockerLayer;
