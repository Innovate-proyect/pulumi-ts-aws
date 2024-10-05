import { IFuncionArgs, IFuncion } from "../interfaces/ILambda";
import { TFuncion, TS3 } from "../interfaces/Iglobal";
export declare class Funcion implements IFuncion {
    private region;
    private awsAccountId;
    private bucket;
    constructor(bucket: TS3);
    crearFuncion(arg: IFuncionArgs): TFuncion;
    private crearEventoS3;
}
