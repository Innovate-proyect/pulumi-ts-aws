"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarCaracteresEspecialesYEspacios = eliminarCaracteresEspecialesYEspacios;
exports.obtenerPrimerDirectorio = obtenerPrimerDirectorio;
exports.obtenerUltimoDirectorio = obtenerUltimoDirectorio;
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
