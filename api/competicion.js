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
// DE DÓNDE SALEN LOS DATOS
// De Postgres, que es donde los deja el raspador. El JSON del repositorio
// sigue existiendo como RED DE SEGURIDAD y se usa solo si la base no está o
// está vacía: así un problema con la base deja la web y la app con el
// calendario de la última versión desplegada en vez de sin calendario.
//
// La forma de la respuesta no cambia ni un campo. La app que ya está en las
// tiendas sigue leyendo exactamente lo mismo; lo único que ha cambiado es que
// ahora un cambio de horario de la federación llega sin desplegar nada.
//
// La caché baja de diez minutos a uno por esa misma razón: antes los datos
// solo podían cambiar con un despliegue, así que cachear de más no costaba
// nada. Ahora cambian en caliente.
// ==========================================================================

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { hayBd } from './_bd.js'
import {
  hayCompeticion,
  indiceCompeticion,
  todaLaCompeticion,
  unaCompeticion,
} from './_competicion-bd.js'

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

/** La respuesta de siempre, sacada del JSON del repositorio. */
function delJson(clave, soloIndice) {
  const cabecera = {
    generado: DATOS.generado,
    temporada: DATOS.temporada,
    fuentes: DATOS.fuentes,
  }
  if (clave) {
    const equipo = (DATOS.equipos || []).find((e) => e.clave === clave)
    return equipo ? { ...cabecera, equipo } : null
  }
  if (soloIndice) return { ...cabecera, equipos: (DATOS.equipos || []).map(resumen) }
  return { ...cabecera, equipos: DATOS.equipos || [] }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ ok: false, error: 'Solo GET' })
  }

  const clave = typeof req.query?.clave === 'string' ? req.query.clave.trim() : ''
  const soloIndice = req.query?.indice !== undefined

  res.setHeader('Cache-Control', 'public, max-age=60')

  /* Primero la base; si no da nada, el JSON.

     El `catch` no se traga el problema en silencio: lo escribe y sigue con el
     JSON. Es lo que convierte una base caída en «el calendario está un poco
     viejo» en vez de en «la app no tiene calendario», que es el fallo que ya
     se vio una vez y por el que nadie del club veía sus partidos. */
  if (hayBd()) {
    try {
      if (await hayCompeticion()) {
        res.setHeader('X-Origen', 'bd')
        if (clave) {
          const uno = await unaCompeticion(clave)
          if (uno) return res.status(200).json(uno)
          // Que no esté en la base no significa que no exista: puede ser una
          // competición vieja que solo sigue en el JSON.
        } else {
          return res
            .status(200)
            .json(soloIndice ? await indiceCompeticion() : await todaLaCompeticion())
        }
      }
    } catch (e) {
      console.warn('Competición: la base falló, se sirve el JSON —', e.message)
    }
  }

  res.setHeader('X-Origen', 'json')
  const salida = delJson(clave, soloIndice)
  if (!salida) return res.status(404).json({ ok: false, error: 'Equipo no encontrado' })
  return res.status(200).json(salida)
}
