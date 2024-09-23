import { IFuncionArgs } from "./interfaces/ILambda";
import { TCapa, TFuncion } from "./interfaces/Iglobal";
import { ICapaArgs } from "./interfaces/ICapa";
/**
 * Clase principal que agrupa servicios AWS utilizando Pulumi.
 */
export declare class ServiciosAWS {
    private funcion;
    private capa;
    constructor();
    crearFuncion(args: IFuncionArgs): TFuncion;
    crearCapa(args: ICapaArgs): TCapa;
}
