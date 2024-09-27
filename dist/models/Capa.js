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
const CrearZip_1 = require("./CrearZip");
const utils_1 = require("./utils");
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
class Capa {
    constructor() {
        const config = new pulumi.Config("aws");
        this.region = config.require("region");
    }
    optenerDependenciasPython(capa, vPython) {
        const pathInput = `${process.cwd()}/src/capas/python/${capa}`;
        const pathOutput = `${process.cwd()}/build/libs/ly_${vPython}/${capa}`;
        try {
            console.log(`Creando layers ${capa}...`);
            // Eliminar pathOutput existe
            if (fs.existsSync(pathOutput)) {
                fs.rmSync(pathOutput, { recursive: true, force: true });
            }
            (0, child_process_1.execSync)(`${vPython} -m venv ${pathOutput}/create_layer`); // Crear el entorno virtual
            (0, child_process_1.execSync)(`source ${pathOutput}/create_layer/bin/activate && pip install -r ${pathInput}/requirements.txt`, { shell: '/bin/bash' }); // Activar el entorno virtual
            (0, child_process_1.execSync)(`mkdir -p ${pathOutput}/pylayer/python`); // Crear el directorio
            (0, child_process_1.execSync)(`cp -r ${pathOutput}/create_layer/lib ${pathOutput}/pylayer/python/`); // Copiar las bibliotecas
        }
        catch (error) {
            console.error('Error ejecutando comandos:', error);
        }
    }
    crearCapa(arg) {
        const crearzip = new CrearZip_1.CrearZip();
        const primerDirectorio = (0, utils_1.obtenerPrimerDirectorio)(arg.ruta);
        const nombreCapa = (0, utils_1.obtenerUltimoDirectorio)(arg.ruta);
        const nombreFormateado = (0, utils_1.eliminarCaracteresEspecialesYEspacios)(nombreCapa);
        const runTimes = arg.compatibleRuntimes[0];
        if (primerDirectorio == "python") {
            this.optenerDependenciasPython(nombreCapa, runTimes);
        }
        const capaComprimida = crearzip.comprimirCodigo({
            nombreZip: `ly${runTimes}_${nombreFormateado}`,
            ruta: `build/libs/ly_${runTimes}/${nombreCapa}/pylayer`,
        });
        const capa = new aws.lambda.LayerVersion(`sls_${nombreFormateado}`, {
            code: new pulumi.asset.FileArchive(capaComprimida.then((cont) => cont.outputPath)),
            sourceCodeHash: capaComprimida.then((cont) => cont.outputBase64sha256),
            layerName: nombreCapa,
            compatibleRuntimes: arg.compatibleRuntimes,
            description: arg.descripcion,
        });
        return capa;
    }
}
exports.Capa = Capa;
