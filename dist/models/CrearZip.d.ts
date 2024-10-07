import * as archive from "@pulumi/archive";
interface IComprimirCodigo {
    ruta: string;
    nombreZip: string;
    rutaSalida: string;
    archivosExcluidos?: string[] | undefined;
}
export declare class CrearZip {
    private crearArchivoZip;
    comprimirCodigo(arg: IComprimirCodigo): Promise<archive.GetFileResult>;
}
export {};
