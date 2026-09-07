// Escudos de los clubes rivales.
// -----------------------------------------------------------------------------
// La RFEVB pone el escudo de cada club delante de su nombre en la clasificación
// (`escudoUrl` en cada fila, ver fuentes/rfevb.mjs). Aquí se bajan UNA vez, se
// encogen y se guardan en `public/media/escudos`, y la fila se queda con la
// ruta local.
//
// No se enlaza el original: son PNG de 300 kB largos servidos desde la intranet
// de la federación por http. Enlazarlos sería contenido mixto (el navegador los
// bloquea), medio mega por cada clasificación y una dependencia de que su
// intranet esté en pie cada vez que alguien abre el calendario.
//
// El encogido lo hace Chrome, que ya es la herramienta de la casa para pasar de
// HTML a PNG (ver scripts/cabeceras-marca/preparar.ps1). Si no hubiera Chrome,
// el escudo se guarda tal cual vino: pesa de más, pero se ve, y el aviso queda
// en el log.
//
// La FVBPA no publica escudos, así que los equipos de cantera se quedan sin
// ninguno: la web les pinta un monograma con sus iniciales.

import { existsSync } from 'node:fs'
import { mkdir, readdir, writeFile, rm } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { promisify } from 'node:util'

const ejecutar = promisify(execFile)

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const DESTINO = join(RAIZ, 'public', 'media', 'escudos')

/** Ruta pública (la que acaba en el JSON y en el <img> de la web). */
const publica = (archivo) => `/media/escudos/${archivo}`

/** Lado del PNG que se guarda. La web lo pinta a 22-26 px; 128 sobra para retina. */
const LADO = 128

const CHROMES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)

const buscarChrome = () => CHROMES.find((p) => existsSync(p)) ?? null

/**
 * Nombre de fichero a partir de la URL del escudo.
 *
 * La RFEVB no sirve ficheros sino una llamada con el id del equipo dentro
 * ("…/fotoEscudoEquipoTemporada?Id=71333&width=0&height=0&rnd=16"), así que el
 * nombre sale de ese id, que es único y no cambia. Si algún día vuelven a
 * servir ficheros de verdad, vale el nombre del fichero.
 */
function nombreArchivo(url) {
  const id = /[?&]Id=(\d+)/i.exec(url)?.[1]
  if (id) return `eq${id}.png`
  const base = url.split('/').pop().split('?')[0].replace(/[^a-zA-Z0-9._-]/g, '')
  return base.replace(/\.[^.]*$/, '') ? `${base.replace(/\.[^.]*$/, '')}.png` : 'escudo.png'
}

/** Baja un fichero binario. Devuelve el Buffer o null si no se pudo. */
async function bajarBinario(url) {
  try {
    const res = await fetch(url, {
      headers: { Referer: 'https://esvoley.es/', 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(30_000),
    })
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

/**
 * Encoge un PNG a LADO×LADO con Chrome, sin recortarlo (object-fit: contain) y
 * sobre fondo transparente. Devuelve true si lo consiguió.
 */
async function encoger(chrome, origen, destino) {
  const carpeta = join(tmpdir(), `escudo-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  await mkdir(carpeta, { recursive: true })
  const pagina = join(carpeta, 'escudo.html')
  const url = `file:///${origen.replace(/\\/g, '/')}`
  await writeFile(
    pagina,
    `<style>html,body{margin:0;padding:0;width:${LADO}px;height:${LADO}px;background:transparent}
img{width:${LADO}px;height:${LADO}px;object-fit:contain;display:block}</style>
<img src="${url}">`,
    'utf-8',
  )

  try {
    await ejecutar(chrome, [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--default-background-color=00000000',
      `--window-size=${LADO},${LADO}`,
      `--screenshot=${destino}`,
      `file:///${pagina.replace(/\\/g, '/')}`,
    ], { timeout: 60_000 })
    return existsSync(destino)
  } catch {
    return false
  } finally {
    await rm(carpeta, { recursive: true, force: true })
  }
}

/**
 * Resuelve los escudos de una tanda de equipos scrapeados.
 *
 * Cambia `escudoUrl` por `escudo` en cada fila de clasificación y deja en el
 * equipo un mapa `escudos` de nombre → ruta, que es lo que usa el calendario
 * para poner el escudo de los dos equipos de cada partido.
 *
 * Es idempotente: un escudo que ya esté descargado no se vuelve a pedir, así
 * que la ejecución normal de `npm run datos` no baja nada.
 */
export async function resolverEscudos(equipos, { log = () => {} } = {}) {
  const pendientes = new Map() // url → nombre de fichero

  for (const equipo of equipos) {
    for (const fila of equipo.clasificacion ?? []) {
      if (fila.escudoUrl) pendientes.set(fila.escudoUrl, nombreArchivo(fila.escudoUrl))
    }
  }

  if (pendientes.size) {
    await mkdir(DESTINO, { recursive: true })
    const yaEstan = new Set(await readdir(DESTINO).catch(() => []))
    const chrome = buscarChrome()
    let bajados = 0
    let sinEncoger = 0

    for (const [url, archivo] of pendientes) {
      if (yaEstan.has(archivo)) continue

      const datos = await bajarBinario(url)
      if (!datos) {
        log(`  ! escudo que no se pudo bajar: ${url}`)
        pendientes.delete(url)
        continue
      }

      const destino = join(DESTINO, archivo)
      const bruto = join(tmpdir(), `escudo-bruto-${archivo}`)
      await writeFile(bruto, datos)
      const encogido = chrome ? await encoger(chrome, bruto, destino) : false
      if (!encogido) {
        await writeFile(destino, datos) // sin Chrome, el original tal cual
        sinEncoger++
      }
      await rm(bruto, { force: true })
      bajados++
    }

    if (bajados) log(`  escudos nuevos: ${bajados}${sinEncoger ? ` (${sinEncoger} sin encoger, falta Chrome)` : ''}`)
    if (!chrome && sinEncoger) log('  ! sin Chrome los escudos se guardan a tamaño original (pesan de más)')
  }

  // Se reparten las rutas y se quita la URL de la intranet, que no pinta nada
  // en el JSON que se publica.
  for (const equipo of equipos) {
    const mapa = {}
    for (const fila of equipo.clasificacion ?? []) {
      const archivo = fila.escudoUrl ? pendientes.get(fila.escudoUrl) : null
      delete fila.escudoUrl
      if (!archivo || !existsSync(join(DESTINO, archivo))) continue
      fila.escudo = publica(archivo)
      mapa[fila.equipo] = fila.escudo
    }
    if (Object.keys(mapa).length) equipo.escudos = mapa
  }

  return equipos
}
