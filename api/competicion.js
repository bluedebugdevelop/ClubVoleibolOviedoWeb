// ==========================================================================
// Los datos de competición, para quien no pueda leerlos del bundle.
//
// GET /api/competicion            → todo: partidos y clasificación de los 12
//                                   equipos del club que juegan federado
// GET /api/competicion?clave=x-y  → solo ese equipo
//
// La web no necesita esto: `src/data/competicion.js` importa el JSON y Vite se
// lo mete dentro, así que el navegador ya lo trae puesto. La app móvil no pasa
// por Vite, y bajarse el fichero entero (100 kB) cada vez que un jugador abre
// su calendario es tirar datos de su tarifa: de ahí el filtro por `clave`, que
// deja la respuesta en unos pocos kB.
//
// El JSON lo genera `npm run datos` (scripts/scrape.mjs) y viaja en el repo, no
// en el volumen: cambia cuando se despliega, no en caliente. Por eso se lee una
// sola vez al arrancar y se puede cachear diez minutos sin miedo a servir algo
// viejo — si no ha habido despliegue, no hay nada nuevo que servir.
// ==========================================================================

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.dirname(fileURLToPath(import.meta.url))
const FICHERO = path.join(raiz, '..', 'src', 'data', 'competicion.json')

function cargar() {
  try {
    return JSON.parse(fs.readFileSync(FICHERO, 'utf-8'))
  } catch (e) {
    // Sin datos la app enseña su aviso de "todavía no hay calendario"; es mejor
    // eso que tirar el servidor entero al arrancar por un fichero que falta.
    console.warn('Competición: no se pudo leer el JSON —', e.message)
    return { generado: null, temporada: null, fuentes: {}, equipos: [] }
  }
}

const DATOS = cargar()

/** Solo lo que la app pinta en la lista de equipos: sin partidos ni tabla. */
const resumen = (e) => ({
  clave: e.clave,
  nombre: e.nombre,
  categoria: e.categoria,
  genero: e.genero,
  division: e.division,
  grupo: e.grupo,
  ente: e.ente,
  url: e.url,
  partidos: Array.isArray(e.partidos) ? e.partidos.length : 0,
})

export default function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ ok: false, error: 'Solo GET' })
  }

  const clave = typeof req.query?.clave === 'string' ? req.query.clave.trim() : ''
  const soloIndice = req.query?.indice !== undefined

  res.setHeader('Cache-Control', 'public, max-age=600')

  const cabecera = {
    generado: DATOS.generado,
    temporada: DATOS.temporada,
    fuentes: DATOS.fuentes,
  }

  if (clave) {
    const equipo = (DATOS.equipos || []).find((e) => e.clave === clave)
    if (!equipo) return res.status(404).json({ ok: false, error: 'Equipo no encontrado' })
    return res.status(200).json({ ...cabecera, equipo })
  }

  if (soloIndice) {
    return res.status(200).json({ ...cabecera, equipos: (DATOS.equipos || []).map(resumen) })
  }

  return res.status(200).json({ ...cabecera, equipos: DATOS.equipos || [] })
}
