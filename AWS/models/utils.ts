import * as crypto from "crypto";
import * as fs from "fs";

// Solo permite string, number, "_" y "-"
export function eliminarCaracteresEspecialesYEspacios(texto: string): string {
  return texto.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function obtenerPrimerDirectorio(ruta: string): string {
  const partesRuta = ruta.split('/');
  return partesRuta[0];
}

export function obtenerUltimoDirectorio(ruta: string): string {
  const partesRuta = ruta.split('/');
  return partesRuta[partesRuta.length - 1];
}

// Función para generar el hash SHA256 en base64 de un archivo zip
export function generarHashBase64(rutaArchivo: string): string {
  const archivoBuffer = fs.readFileSync(rutaArchivo);
  const hash = crypto.createHash('sha256');
  hash.update(archivoBuffer);
  return hash.digest('base64');
};

// Extrae la versión
export function extraerVersion(cadena: string): string {
  const regex = /\d+(\.\d+)*([a-z]+\d*)?/i;
  const resultado = cadena.match(regex);
  return resultado ? resultado[0] : "";



}