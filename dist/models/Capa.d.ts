import { ICapa, ICapaPythonArgs } from "../interfaces/ICapa";
import { TCapa, TPOutputAny } from "../interfaces/Iglobal";
export declare class Capa implements ICapa {
    private region;
    private outputDir;
    private bucket;
    constructor(bucket: TPOutputAny);
    crearCapaPython(arg: ICapaPythonArgs): TCapa;
}
