"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiciosAWS = void 0;
const Lambda_1 = require("./models/Lambda");
const Capa_1 = require("./models/Capa");
const pulumi = __importStar(require("@pulumi/pulumi"));
/**
 * Clase principal que agrupa servicios AWS utilizando Pulumi.
 */
class ServiciosAWS {
    constructor(bucket) {
        this.projectName = pulumi.getProject();
        this.ptawsBucket = bucket;
        this.capa = new Capa_1.Capa(this.ptawsBucket);
        this.funcion = new Lambda_1.Funcion(this.ptawsBucket);
    }
    crearFuncion(args) {
        return this.funcion.crearFuncion(args);
    }
    crearCapaPython(args) {
        return this.capa.crearCapaPython(args);
    }
}
exports.ServiciosAWS = ServiciosAWS;
