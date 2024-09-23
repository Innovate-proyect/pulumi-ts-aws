import { TCapa } from "./Iglobal";

export interface ICapaArgs {
  ruta: string;
  compatibleRuntimes: string[];
  descripcion: string;
}

export interface ICapa {
  crearCapa(arg: ICapaArgs): TCapa;
}
