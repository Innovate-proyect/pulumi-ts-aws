import { IFuncionArgs } from "./interfaces/ILambda";
import { TCapa, TFuncion, TPOutputAny } from "./interfaces/Iglobal";
import { Funcion } from "./models/Lambda";
import { Capa } from "./models/Capa";
import { ICapaPythonArgs } from "./interfaces/ICapa";
import * as pulumi from "@pulumi/pulumi";

/**
 * Clase principal que agrupa servicios AWS utilizando Pulumi.
 */
export class ServiciosAWS {
  private funcion: Funcion;
  private capa: Capa;
  private projectName: string;
  private ptawsBucket: TPOutputAny;

  constructor(bucket: TPOutputAny) {
    this.projectName = pulumi.getProject();
    this.ptawsBucket = bucket;
    this.capa = new Capa(this.ptawsBucket);
    this.funcion = new Funcion(this.ptawsBucket);
  }

  crearFuncion(args: IFuncionArgs): TFuncion {
    return this.funcion.crearFuncion(args);
  }

  crearCapaPython(args: ICapaPythonArgs): TCapa {
    return this.capa.crearCapaPython(args);
  }
}
