import { IFuncionArgs, IFuncion } from "../interfaces/ILambda";
import { TFuncion } from "../interfaces/Iglobal";
export declare class Funcion implements IFuncion {
    private region;
    private awsAccountId;
    constructor();
    crearFuncion(arg: IFuncionArgs): TFuncion;
    private crearEventoS3;
}
