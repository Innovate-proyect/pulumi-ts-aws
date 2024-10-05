import { ICapa, ICapaPythonArgs } from "../interfaces/ICapa";
import { TCapa } from "../interfaces/Iglobal";
export declare class Capa implements ICapa {
    private region;
    private outputDir;
    private bucket;
    constructor(bucket: string);
    crearCapaPython(arg: ICapaPythonArgs): TCapa;
}
