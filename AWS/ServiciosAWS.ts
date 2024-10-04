import * as aws from "@pulumi/aws";
import { IFuncionArgs } from "./interfaces/ILambda";
import { TCapa, TFuncion, TS3 } from "./interfaces/Iglobal";
import { Funcion } from "./models/Lambda";
import { Capa } from './models/Capa';
import { ICapaPythonArgs } from "./interfaces/ICapa";
import { PREF_S3BUCKET, PREFIJO } from "./env/variables";
import * as pulumi from '@pulumi/pulumi';
import { eliminarCaracteresEspeciales } from "./models/utils";

/**
 * Clase principal que agrupa servicios AWS utilizando Pulumi.
 */
export class ServiciosAWS {
  private funcion: Funcion;
  private capa: Capa
  private bucket: TS3;
  private projectName: string
  private nombreBucket: string

  constructor() {
    this.projectName = pulumi.getProject();
    this.nombreBucket = eliminarCaracteresEspeciales(this.projectName)

    this.bucket = new aws.s3.Bucket(`${PREF_S3BUCKET}${this.nombreBucket}`, {
      bucketPrefix: `${PREFIJO}-${this.nombreBucket}-`,
      acl: "private"
    });
    this.capa = new Capa(this.bucket);
    this.funcion = new Funcion();
  }

  crearFuncion(args: IFuncionArgs): TFuncion {
    return this.funcion.crearFuncion(args);
  }

  crearCapaPython(args: ICapaPythonArgs): TCapa {
    return this.capa.crearCapaPython(args);
  }
}
