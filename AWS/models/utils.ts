import * as crypto from "crypto";
import * as fs from "fs";

export function eliminarCaracteresEspeciales(texto: string): string {
  return texto.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

// Solo permite string, number, "_" y "-"
export function eliminarCaracteresEspecialesYEspacios(texto: string): string {
  return texto.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
}

export function obtenerPrimerDirectorio(ruta: string): string {
  const partesRuta = ruta.split("/");
  return partesRuta[0];
}

export function obtenerUltimoDirectorio(ruta: string): string {
  const partesRuta = ruta.split("/");
  return partesRuta[partesRuta.length - 1];
}

// Función para generar el hash SHA256 en base64 de un archivo zip
export function generarHashBase64(rutaArchivo: string): string {
  const archivoBuffer = fs.readFileSync(rutaArchivo);
  const hash = crypto.createHash("sha256");
  hash.update(archivoBuffer);
  return hash.digest("base64");
}

// Extrae la versión
export function extraerVersion(cadena: string): string {
  const regex = /\d+(\.\d+)*([a-z]+\d*)?/i;
  const resultado = cadena.match(regex);
  return resultado ? resultado[0] : "";
}

// Combierte un string largo en 8 caracteres unicos
export function stringTo8Char(input: string): string {
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
