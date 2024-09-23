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
exports.CrearZip = void 0;
const archive = __importStar(require("@pulumi/archive"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const stat = (0, util_1.promisify)(fs.stat);
class CrearZip {
    crearArchivoZip(args) {
        return archive.getFile(args);
    }
    comprimirCodigo(arg) {
        return __awaiter(this, void 0, void 0, function* () {
            const rutaCompleta = path.resolve(arg.ruta);
            try {
                const stats = yield stat(rutaCompleta);
                if (stats.isDirectory()) {
                    if (arg.archivosExcluidos && arg.archivosExcluidos.length > 0) {
                        return this.crearArchivoZip({
                            type: "zip",
                            sourceDir: arg.ruta,
                            excludeSymlinkDirectories: true,
                            excludes: arg.archivosExcluidos,
                            outputPath: `${process.cwd()}/recursosPulumi/zip/${arg.nombreZip}.zip`
                        });
                    }
                    else {
                        return this.crearArchivoZip({
                            type: "zip",
                            sourceDir: arg.ruta,
                            excludeSymlinkDirectories: false,
                            outputPath: `${process.cwd()}/recursosPulumi/zip/${arg.nombreZip}.zip`
                        });
                    }
                }
                else if (stats.isFile()) {
                    return this.crearArchivoZip({
                        type: "zip",
                        sourceFile: arg.ruta,
                        outputPath: `${process.cwd()}/recursosPulumi/zip/${arg.nombreZip}.zip`,
                    });
                }
                else {
                    throw new Error(`${rutaCompleta} no es ni un archivo ni un directorio.`);
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error("Error en comprimir archivo y/o directorio:", error.message);
                    throw new Error("Error al comprimir archivo o directorio: " + error.message);
                }
                else {
                    throw new Error("Error desconocido durante la compresión.");
                }
            }
        });
    }
}
exports.CrearZip = CrearZip;
// import * as archive from "@pulumi/archive";
// import * as fs from "fs/promises";
// import * as path from "path";
// interface IComprimirCodigo {
//   ruta: string,
//   nombreZip: string,
//   archivosExcluidos?: string[] | undefined,
// }
// export class CrearZip {
//   private crearArchivoZip(args: {
//     type: string;
//     sourceFile?: string;
//     sourceDir?: string;
//     excludes?: string[];
//     excludeSymlinkDirectories?: boolean;
//     outputPath: string;
//   }) {
//     return archive.getFile(args);
//   }
//   async comprimirCodigo(arg: IComprimirCodigo) {
//     try {
//       const rutaCompleta = path.resolve(arg.ruta);
//       const stats = await fs.stat(rutaCompleta);
//       if (stats.isDirectory()) {
//         if (arg.archivosExcluidos && arg.archivosExcluidos.length > 0) {
//           return this.crearArchivoZip({
//             type: "zip",
//             sourceDir: arg.ruta,
//             excludeSymlinkDirectories: true,
//             excludes: arg.archivosExcluidos,
//             outputPath: `${process.cwd()}/src/recursosPulumi/zip${arg.nombreZip}.zip`
//           });
//         } else {
//           return this.crearArchivoZip({
//             type: "zip",
//             sourceDir: arg.ruta,
//             excludeSymlinkDirectories: false,
//             outputPath: `${process.cwd()}/src/recursosPulumi/zip${arg.nombreZip}.zip`
//           });
//         }
//       } else if (stats.isFile()) {
//         return this.crearArchivoZip({
//           type: "zip",
//           sourceFile: arg.ruta,
//           outputPath: `${process.cwd()}/src/recursosPulumi/zip${arg.nombreZip}.zip`
//         });
//       } else {
//         console.log(`${rutaCompleta} no es ni un archivo ni un directorio.`);
//       }
//     } catch (error) {
//       console.error("Error al comprimir archivo y/o directorio:", error);
//     }
//   }
// }
