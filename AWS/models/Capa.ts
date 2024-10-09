import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as fs from "fs";
import * as path from "path";
import { ICapa, ICapaPythonArgs } from "../interfaces/ICapa";
import { TCapa, TPOutputAny } from "../interfaces/Iglobal";
import { eliminarCaracteresEspeciales, generarHashBase64 } from "./utils";
import { PREF_LAMBLAYEVERSION, PREF_S3OBJECT } from "../env/variables";
import { execSync } from "child_process";
import { DockerLayer } from "./DockerLayer";

export class Capa implements ICapa {
  private region: string;
  private outputDir: string;
  private bucket: TPOutputAny;

  constructor(bucket: TPOutputAny) {
    const config = new pulumi.Config("aws");
    this.region = config.require("region");
    this.outputDir = path.join(process.cwd(), "dist", "layers");
    this.bucket = bucket;
  }

  public crearCapaPython(arg: ICapaPythonArgs): TCapa {
    const nombreFormateado = eliminarCaracteresEspeciales(arg.nombre);
    const pythonVersion = arg.versionesCompatibles[0];
    const versionesCompatibles: string[] = arg.versionesCompatibles.map(
      (v) => `python${v}`
    );
    const nArchivo = `lyPython${pythonVersion}_${arg.nombre}`;
    const dockerImageName = `python-build-${arg.nombre}`;

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const { dockerfilePath, workDir } = new DockerLayer().archivosTempPython(
      arg.requirements,
      pythonVersion,
      nArchivo
    );
    execSync(
      `docker build -q -t ${dockerImageName} -f ${dockerfilePath} ${workDir}`
    );
    execSync(
      `docker run --rm -v ${this.outputDir}:/output ${dockerImageName} bash -c "cp /app/${nArchivo}.zip /output/"`
    );
    fs.rmSync(workDir, { recursive: true, force: true });
    execSync(`docker rmi ${dockerImageName}`);

    const capaZip = new aws.s3.BucketObject(
      `${PREF_S3OBJECT}${nombreFormateado}`,
      {
        bucket: this.bucket,
        source: new pulumi.asset.FileAsset(`${this.outputDir}/${nArchivo}.zip`),
      }
    );

    const capa = new aws.lambda.LayerVersion(
      `${PREF_LAMBLAYEVERSION}${nombreFormateado}`,
      {
        layerName: arg.nombre,
        s3Bucket: this.bucket,
        s3Key: capaZip.key,
        compatibleRuntimes: versionesCompatibles,
        description: arg.descripcion,
        sourceCodeHash: generarHashBase64(`${this.outputDir}/${nArchivo}.zip`),
      },
      { dependsOn: [capaZip] }
    );

    return capa;
  }
}

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
