import { IFuncionArgs } from "./interfaces/ILambda";
import { TCapa, TFuncion } from "./interfaces/Iglobal";
import { ICapaPythonArgs } from "./interfaces/ICapa";
/**
 * Clase principal que agrupa servicios AWS utilizando Pulumi.
 */
export declare class ServiciosAWS {
    private funcion;
    private capa;
    private bucket;
    private projectName;
    private nombreBucket;
    constructor();
    crearFuncion(args: IFuncionArgs): TFuncion;
    crearCapaPython(args: ICapaPythonArgs): TCapa;
}
