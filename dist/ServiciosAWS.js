"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiciosAWS = void 0;
const Lambda_1 = require("./models/Lambda");
const Capa_1 = require("./models/Capa");
/**
 * Clase principal que agrupa servicios AWS utilizando Pulumi.
 */
class ServiciosAWS {
    constructor() {
        this.funcion = new Lambda_1.Funcion();
        this.capa = new Capa_1.Capa();
    }
    crearFuncion(args) {
        return this.funcion.crearFuncion(args);
    }
    crearCapa(args) {
        return this.capa.crearCapa(args);
    }
}
exports.ServiciosAWS = ServiciosAWS;
