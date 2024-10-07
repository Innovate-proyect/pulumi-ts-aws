import { IFuncionArgs } from "./interfaces/ILambda";
import { TCapa, TFuncion, TPOutputAny } from "./interfaces/Iglobal";
import { ICapaPythonArgs } from "./interfaces/ICapa";
/**
 * Clase principal que agrupa servicios AWS utilizando Pulumi.
 */
export declare class ServiciosAWS {
    private funcion;
    private capa;
    private projectName;
    private ptawsBucket;
    constructor(bucket: TPOutputAny);
    crearFuncion(args: IFuncionArgs): TFuncion;
    crearCapaPython(args: ICapaPythonArgs): TCapa;
}
