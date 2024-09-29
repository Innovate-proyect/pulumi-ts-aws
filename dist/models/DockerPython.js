"use strict";
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
exports.DockerPython = void 0;
const child_process_1 = require("child_process");
class DockerPython {
    crearLibPython(capa, vPython, pathOutputZip, archivoZip) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dockerImageName = `python-build-${capa}`;
                (0, child_process_1.execSync)(`
        docker build -q -t ${dockerImageName} --build-arg capa=${capa} --build-arg vPython=${vPython} --build-arg nArchivo=${archivoZip} -f dockerfiles/Dockerfile.python .
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
}
exports.DockerPython = DockerPython;
