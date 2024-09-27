import { TFuncion, TPInputArn, TPInputArrayArn, TPInputDependencias, TPInputNumero, TPInputCadena, TPInputMapCadena } from "./Iglobal";
import { IEvento } from './IEvento';
export interface IFuncionArgs {
    roleArn: TPInputArn;
    handler: TPInputCadena;
    runtime: string;
    capas?: TPInputArrayArn;
    variablesEntorno?: TPInputMapCadena;
    etiquetas: TPInputMapCadena;
    memoria?: TPInputNumero;
    tiempoEjecucion?: TPInputNumero;
    nombreGrupoLog: TPInputCadena;
    codigoFuente: {
        ruta: string;
        archivosExcluidos?: string[] | undefined;
    };
    descripcion: TPInputCadena;
    eventos?: IEvento[];
    dependencias?: TPInputDependencias;
}
export interface IFuncion {
    crearFuncion(arg: IFuncionArgs): TFuncion;
}
