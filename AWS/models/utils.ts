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