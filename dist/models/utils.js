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
exports.eliminarCaracteresEspeciales = eliminarCaracteresEspeciales;
exports.eliminarCaracteresEspecialesYEspacios = eliminarCaracteresEspecialesYEspacios;
exports.obtenerPrimerDirectorio = obtenerPrimerDirectorio;
exports.obtenerUltimoDirectorio = obtenerUltimoDirectorio;
exports.generarHashBase64 = generarHashBase64;
exports.extraerVersion = extraerVersion;
exports.stringTo8Char = stringTo8Char;
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
function eliminarCaracteresEspeciales(texto) {
    return texto.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}
// Solo permite string, number, "_" y "-"
function eliminarCaracteresEspecialesYEspacios(texto) {
    return texto.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
}
function obtenerPrimerDirectorio(ruta) {
    const partesRuta = ruta.split("/");
    return partesRuta[0];
}
function obtenerUltimoDirectorio(ruta) {
    const partesRuta = ruta.split("/");
    return partesRuta[partesRuta.length - 1];
}
// Función para generar el hash SHA256 en base64 de un archivo zip
function generarHashBase64(rutaArchivo) {
    const archivoBuffer = fs.readFileSync(rutaArchivo);
    const hash = crypto.createHash("sha256");
    hash.update(archivoBuffer);
    return hash.digest("base64");
}
// Extrae la versión
function extraerVersion(cadena) {
    const regex = /\d+(\.\d+)*([a-z]+\d*)?/i;
    const resultado = cadena.match(regex);
    return resultado ? resultado[0] : "";
}
// Combierte un string largo en 8 caracteres unicos
function stringTo8Char(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = (hash * 31 + char) % 0xffffffff;
    }
    // Convertimos el hash a una cadena de 8 caracteres alfanuméricos
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
        // Usamos el hash para seleccionar caracteres del set alfanumérico
        result += chars[(hash >> (i * 4)) & 0x1f];
    }
    return result;
}
