import { ICapa, ICapaArgs } from "../interfaces/ICapa";
import { TCapa } from "../interfaces/Iglobal";
export declare class Capa implements ICapa {
    private region;
    constructor();
    crearCapa(arg: ICapaArgs): TCapa;
}
