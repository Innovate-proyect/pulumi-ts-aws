"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecursosLabs = void 0;
const labs_1 = require("./labs");
class RecursosLabs {
    constructor() { }
    createBucketPrivado(nombre, carpetas, tags) {
        return (0, labs_1.createBucketPrivado)(nombre, carpetas, tags);
    }
    createBucketPublico(nombre, carpetas, tags) {
        return (0, labs_1.createBucketPublico)(nombre, carpetas, tags);
    }
    createBucketWeb(nombre, tags) {
        return (0, labs_1.createBucketWeb)(nombre, tags);
    }
    createRole(nombre, descripcion, servicio, politicasArn = [], tags) {
        return (0, labs_1.createRole)(nombre, descripcion, servicio, politicasArn, tags);
    }
    createLambdaRole(nombre, descripcion, politicasArn = [], tags) {
        return (0, labs_1.createLambdaRole)(nombre, descripcion, politicasArn, tags);
    }
    createApiGatewayRole(nombre, descripcion, tags) {
        return (0, labs_1.createApiGatewayRole)(nombre, descripcion, tags);
    }
    crearOsngPolitica(nombre, descripcion, acciones, recursos, dependencias, tags) {
        return (0, labs_1.crearOsngPolitica)(nombre, descripcion, acciones, recursos, dependencias, tags);
    }
}
exports.RecursosLabs = RecursosLabs;
