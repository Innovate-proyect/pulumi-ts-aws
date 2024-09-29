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
exports.eliminarCaracteresEspecialesYEspacios = eliminarCaracteresEspecialesYEspacios;
exports.obtenerPrimerDirectorio = obtenerPrimerDirectorio;
exports.obtenerUltimoDirectorio = obtenerUltimoDirectorio;
exports.generarHashBase64 = generarHashBase64;
exports.extraerVersion = extraerVersion;
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
// Solo permite string, number, "_" y "-"
function eliminarCaracteresEspecialesYEspacios(texto) {
    return texto.replace(/[^a-zA-Z0-9_-]/g, '');
}
function obtenerPrimerDirectorio(ruta) {
    const partesRuta = ruta.split('/');
    return partesRuta[0];
}
function obtenerUltimoDirectorio(ruta) {
    const partesRuta = ruta.split('/');
    return partesRuta[partesRuta.length - 1];
}
// Función para generar el hash SHA256 en base64 de un archivo zip
function generarHashBase64(rutaArchivo) {
    const archivoBuffer = fs.readFileSync(rutaArchivo);
    const hash = crypto.createHash('sha256');
    hash.update(archivoBuffer);
    return hash.digest('base64');
}
;
// Extrae la versión
function extraerVersion(cadena) {
    const regex = /\d+(\.\d+)*([a-z]+\d*)?/i;
    const resultado = cadena.match(regex);
    return resultado ? resultado[0] : "";
}
