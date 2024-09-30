import { TCapa } from "./Iglobal";

export interface ICapaArgs {
  nombre: string;
  versionesCompatibles: string[];
  descripcion: string;
}

export interface ICapa {
  // crearCapa(arg: ICapaArgs): TCapa;
  crearCapaPython(arg: ICapaArgs): TCapa;
}
