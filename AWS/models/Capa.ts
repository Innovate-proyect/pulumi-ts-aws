import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { ICapa, ICapaArgs } from "../interfaces/ICapa";
import { TCapa } from "../interfaces/Iglobal";
import { CrearZip } from './CrearZip';
import { eliminarCaracteresEspecialesYEspacios, obtenerPrimerDirectorio, obtenerUltimoDirectorio } from "./utils";

import { execSync } from 'child_process';
import * as fs from 'fs';

export class Capa implements ICapa {
  private region: string;

  constructor() {
    const config = new pulumi.Config("aws");
    this.region = config.require("region");
  }
  private optenerDependenciasPython(capa: string, vPython: string) {
    const pathInput = `${process.cwd()}/src/capas/python/${capa}`
    const pathOutput = `${process.cwd()}/build/libs/ly_${vPython}/${capa}`

    try {
      console.log(`Creando layers ${capa}...`);
      // Eliminar pathOutput existe
      if (fs.existsSync(pathOutput)) {
        fs.rmSync(pathOutput, { recursive: true, force: true });
      }
      execSync(`${vPython} -m venv ${pathOutput}/create_layer`); // Crear el entorno virtual
      execSync(`source ${pathOutput}/create_layer/bin/activate && pip install -r ${pathInput}/requirements.txt`, { shell: '/bin/bash' }); // Activar el entorno virtual
      execSync(`mkdir -p ${pathOutput}/pylayer/python`); // Crear el directorio
      execSync(`cp -r ${pathOutput}/create_layer/lib ${pathOutput}/pylayer/python/`); // Copiar las bibliotecas
    } catch (error) {
      console.error('Error ejecutando comandos:', error);
    }
  }

  public crearCapa(arg: ICapaArgs): TCapa {

    const crearzip = new CrearZip()
    const primerDirectorio = obtenerPrimerDirectorio(arg.ruta)
    const nombreCapa = obtenerUltimoDirectorio(arg.ruta)
    const nombreFormateado = eliminarCaracteresEspecialesYEspacios(nombreCapa)
    const runTimes = arg.compatibleRuntimes[0]

    if (primerDirectorio == "python") {
      this.optenerDependenciasPython(nombreCapa, runTimes)
    }

    const capaComprimida = crearzip.comprimirCodigo({
      nombreZip: `ly${runTimes}_${nombreFormateado}`,
      ruta: `build/libs/ly_${runTimes}/${nombreCapa}/pylayer`,
    });

    const capa = new aws.lambda.LayerVersion(`sls_${nombreFormateado}`, {
      code: new pulumi.asset.FileArchive(
        capaComprimida.then((cont) => cont.outputPath)
      ),
      sourceCodeHash: capaComprimida.then((cont) => cont.outputBase64sha256),
      layerName: nombreCapa,
      compatibleRuntimes: arg.compatibleRuntimes,
      description: arg.descripcion,
    });
    return capa

  }
}
