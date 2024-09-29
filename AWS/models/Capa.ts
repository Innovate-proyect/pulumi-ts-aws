import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { ICapa, ICapaArgs } from "../interfaces/ICapa";
import { TCapa } from "../interfaces/Iglobal";
import { eliminarCaracteresEspecialesYEspacios, extraerVersion, generarHashBase64, obtenerPrimerDirectorio, obtenerUltimoDirectorio } from "./utils";
import { DockerPython } from "../models/DockerPython";



export class Capa implements ICapa {
  private region: string;

  constructor() {
    const config = new pulumi.Config("aws");
    this.region = config.require("region");
  }

  public crearCapa(arg: ICapaArgs): TCapa {
    const dockerPython = new DockerPython()

    const primerDirectorio = obtenerPrimerDirectorio(arg.ruta)
    const nombreCapa = obtenerUltimoDirectorio(arg.ruta)
    const nombreFormateado = eliminarCaracteresEspecialesYEspacios(nombreCapa)
    const runTimes = arg.compatibleRuntimes[0]
    const vRunTime = extraerVersion(runTimes)

    const pathOutputZip = `${process.cwd()}/build/dist`;
    let archivoZip = `ly${runTimes}_${nombreCapa}`;

    if (primerDirectorio == "python") {
      dockerPython.crearLibPython(nombreCapa, vRunTime, pathOutputZip, archivoZip);
    }

    const codeHash = generarHashBase64(`${pathOutputZip}/${archivoZip}.zip`)
    const capa = new aws.lambda.LayerVersion(`sls_${nombreFormateado}`, {
      code: new pulumi.asset.FileArchive(`${pathOutputZip}/${archivoZip}.zip`),
      sourceCodeHash: codeHash,
      layerName: nombreCapa,
      compatibleRuntimes: arg.compatibleRuntimes,
      description: arg.descripcion,
    });
    return capa

  }
}




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
