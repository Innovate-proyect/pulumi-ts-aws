import { IFuncionArgs } from "./interfaces/ILambda";
import { TCapa, TFuncion } from "./interfaces/Iglobal";
import { Funcion } from "./models/Lambda";
import { Capa } from './models/Capa';
import { ICapaArgs } from "./interfaces/ICapa";

/**
 * Clase principal que agrupa servicios AWS utilizando Pulumi.
 */
export class ServiciosAWS {
  private funcion: Funcion;
  private capa: Capa

  constructor() {
    this.funcion = new Funcion();
    this.capa = new Capa()
  }

  crearFuncion(args: IFuncionArgs): TFuncion {
    return this.funcion.crearFuncion(args);
  }

  crearCapa(args: ICapaArgs): TCapa {
    return this.capa.crearCapa(args);
  }
}
