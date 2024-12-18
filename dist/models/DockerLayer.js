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
class DockerLayer {
    archivosTempPython(requirements, pythonVersion, nArchivo, outputDir) {
        const workDir = path_1.default.join(outputDir, `.tmp-${Date.now()}`);
        fs.mkdirSync(workDir, { recursive: true });
        const dockerfilePath = path_1.default.join(workDir, 'Dockerfile');
        const requirementsPath = path_1.default.join(workDir, 'requirements.txt');
        const dockerfileContent = `
FROM --platform=linux/amd64 python:${pythonVersion}

WORKDIR /app

RUN apt-get update && apt-get install -y \
  python3-venv \
  zip

RUN python${pythonVersion} -m venv create_layer

RUN /bin/bash -c "source create_layer/bin/activate && pip install --upgrade pip"

COPY requirements.txt .

RUN /bin/bash -c "source create_layer/bin/activate && pip install -r requirements.txt"

RUN mkdir -p python && \
    cp -r create_layer/lib python/ && \
    zip -r ${nArchivo}.zip python/

CMD ["echo", "Layer created and packaged!"]
`;
        fs.writeFileSync(dockerfilePath, dockerfileContent);
        fs.writeFileSync(requirementsPath, requirements.join('\n'));
        return { dockerfilePath, workDir };
    }
}
exports.DockerLayer = DockerLayer;
