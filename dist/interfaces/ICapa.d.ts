import { TCapa } from "./Iglobal";
export interface ICapaArgs {
    nombre: string;
    versionesCompatibles: string[];
    descripcion: string;
}
export interface ICapa {
    crearCapaPython(arg: ICapaArgs): TCapa;
}
