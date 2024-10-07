import * as archive from "@pulumi/archive";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

const stat = promisify(fs.stat);

interface IComprimirCodigo {
  ruta: string;
  nombreZip: string;
  rutaSalida: string;
  archivosExcluidos?: string[] | undefined;
}

export class CrearZip {
  private crearArchivoZip(args: {
    type: string;
    sourceFile?: string;
    sourceDir?: string;
    excludes?: string[];
    excludeSymlinkDirectories?: boolean;
    outputPath: string;
  }): Promise<archive.GetFileResult> {
    return archive.getFile(args);
  }

  async comprimirCodigo(arg: IComprimirCodigo): Promise<archive.GetFileResult> {
    const rutaCompleta = path.resolve(arg.ruta);

    try {
      const stats = await stat(rutaCompleta);

      if (stats.isDirectory()) {
        if (arg.archivosExcluidos && arg.archivosExcluidos.length > 0) {
          return this.crearArchivoZip({
            type: "zip",
            sourceDir: arg.ruta,
            excludeSymlinkDirectories: true,
            excludes: arg.archivosExcluidos,
            outputPath: `${process.cwd()}/${arg.rutaSalida}/${arg.nombreZip}.zip`
          });
        } else {
          return this.crearArchivoZip({
            type: "zip",
            sourceDir: arg.ruta,
            excludeSymlinkDirectories: false,
            outputPath: `${process.cwd()}/${arg.rutaSalida}/${arg.nombreZip}.zip`
          });
        }
      } else if (stats.isFile()) {
        return this.crearArchivoZip({
          type: "zip",
          sourceFile: arg.ruta,
          outputPath: `${process.cwd()}/${arg.rutaSalida}/${arg.nombreZip}.zip`,
        });
      } else {
        throw new Error(`${rutaCompleta} no es ni un archivo ni un directorio.`);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error en comprimir archivo y/o directorio:", error.message);
        throw new Error("Error al comprimir archivo o directorio: " + error.message);
      } else {
        throw new Error("Error desconocido durante la compresión.");
      }
    }
  }
}