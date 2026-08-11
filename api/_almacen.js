// ==========================================================================
// Dónde se guarda lo que el panel escribe.
//
// Las noticias y los patrocinadores estaban en `src/data/contenido.js`, o sea
// COMPILADOS dentro del bundle: para cambiar uno había que tocar código y
// desplegar. Para que el club los edite desde el panel tienen que ser datos que
// se lean en caliente, y eso pide un sitio donde escribirlos.
//
// Ese mismo sitio guarda hoy tres listas —noticias, patrocinadores y equipos—
// en un fichero JSON, más una carpeta de imágenes, dentro de:
//
//   DATOS_DIR  si está declarada
//   /data      si existe  → es donde Railway monta un Volume
//   .datos/    en local (ignorada por git)
//
// OJO CON RAILWAY: el disco del contenedor es EFÍMERO. Sin un Volume montado en
// /data, todo lo que publique el club desaparece en el siguiente despliegue. La
// función `esPersistente()` avisa de eso y el panel lo enseña en rojo, para que
// nadie escriba veinte noticias y las pierda.
//
// No hay base de datos a propósito: son unas pocas decenas de elementos que se
// leen enteros. Un JSON es más fácil de copiar, de mirar a
// mano y de restaurar que una tabla.
// ==========================================================================

import fs from 'node:fs'
import path from 'node:path'

function elegirCarpeta() {
  if (process.env.DATOS_DIR) return process.env.DATOS_DIR
  // Railway monta aquí el Volume; si no hay Volume, esta carpeta no existe
  try {
    if (fs.existsSync('/data') && fs.statSync('/data').isDirectory()) return '/data'
  } catch {
    /* en Windows ni se intenta */
  }
  return path.join(process.cwd(), '.datos')
}

export const CARPETA = elegirCarpeta()
export const SUBIDAS = path.join(CARPETA, 'subidas')
const FICHERO = path.join(CARPETA, 'contenido.json')

/** ¿Sobrevivirá esto a un despliegue? */
export function esPersistente() {
  return Boolean(process.env.DATOS_DIR) || CARPETA === '/data'
}

function asegurarCarpetas() {
  fs.mkdirSync(SUBIDAS, { recursive: true })
}

// Las listas que el panel sabe editar. Añadir una aquí es lo único que hay que
// tocar en el almacén: el resto del fichero ya trabaja sobre esta constante.
export const LISTAS = ['noticias', 'patrocinadores', 'equipos']

export function leer() {
  try {
    const crudo = fs.readFileSync(FICHERO, 'utf-8')
    const datos = JSON.parse(crudo)
    return Object.fromEntries(
      LISTAS.map((k) => [k, Array.isArray(datos[k]) ? datos[k] : []]),
    )
  } catch {
    // todavía no hay nada escrito: es lo normal la primera vez
    return Object.fromEntries(LISTAS.map((k) => [k, []]))
  }
}

/**
 * Escritura atómica: primero a un fichero temporal y luego se renombra. Si el
 * proceso se cae a mitad, el JSON bueno sigue entero en vez de quedarse cortado.
 */
export function escribir(datos) {
  asegurarCarpetas()
  const temp = `${FICHERO}.tmp`
  fs.writeFileSync(temp, `${JSON.stringify(datos, null, 1)}\n`, 'utf-8')
  fs.renameSync(temp, FICHERO)
}

const TIPOS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
}

export const TIPOS_ACEPTADOS = Object.keys(TIPOS)
export const TAMANO_MAXIMO = 4 * 1024 * 1024 // 4 MB

/**
 * Guarda una imagen y devuelve la ruta pública con la que se sirve.
 * El nombre lleva un trozo aleatorio para que subir dos veces la misma foto no
 * pise la anterior ni la deje cacheada con contenido viejo.
 */
export function guardarImagen(buffer, tipo, nombreOriginal = '') {
  const ext = TIPOS[tipo]
  if (!ext) throw new Error('Formato no admitido')
  if (buffer.length > TAMANO_MAXIMO) throw new Error('La imagen pesa demasiado')

  asegurarCarpetas()
  const base = path
    .basename(nombreOriginal, path.extname(nombreOriginal))
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'imagen'

  const nombre = `${base}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}${ext}`
  fs.writeFileSync(path.join(SUBIDAS, nombre), buffer)
  return `/subidas/${nombre}`
}

/** Borra una imagen subida. Solo dentro de `subidas/`, nunca fuera. */
export function borrarImagen(ruta) {
  if (typeof ruta !== 'string' || !ruta.startsWith('/subidas/')) return
  const nombre = path.basename(ruta)
  const destino = path.join(SUBIDAS, nombre)
  // comprobación extra: que el camino resuelto siga dentro de la carpeta
  if (!destino.startsWith(SUBIDAS)) return
  try {
    fs.unlinkSync(destino)
  } catch {
    /* si ya no está, no pasa nada */
  }
}
