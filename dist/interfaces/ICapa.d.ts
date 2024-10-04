import { TCapa, TPythonVersion } from "./Iglobal";
export interface ICapaArgs {
    nombre: string;
    descripcion: string;
    requirements: string[];
}
export interface ICapaPythonArgs extends ICapaArgs {
    versionesCompatibles: TPythonVersion[];
}
export interface ICapa {
    crearCapaPython(arg: ICapaPythonArgs): TCapa;
}
