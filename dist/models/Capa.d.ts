import { ICapa, ICapaPythonArgs } from "../interfaces/ICapa";
import { TCapa, TS3 } from "../interfaces/Iglobal";
export declare class Capa implements ICapa {
    private region;
    private outputDir;
    private bucket;
    constructor(bucket: TS3);
    crearCapaPython(arg: ICapaPythonArgs): TCapa;
}
