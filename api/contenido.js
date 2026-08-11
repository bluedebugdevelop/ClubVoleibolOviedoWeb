// ==========================================================================
// Contenido editable de la web: noticias y patrocinadores.
//
// GET /api/contenido — público, sin permisos. Lo pide el navegador al cargar.
//
// De dónde salen los datos:
//   · Si el panel ha escrito algo, de ahí (el JSON del almacén).
//   · Si no, de `src/data/contenido.js`, que sigue siendo la semilla.
//
// Así la web funciona igual el primer día, antes de que nadie toque el panel, y
// si algún día se vacía el volumen vuelve sola al contenido de siempre en vez
// de quedarse sin noticias.
// ==========================================================================

import { leer } from './_almacen.js'

// Se importa una vez al arrancar: son datos estáticos, no cambian en caliente.
const { noticias: noticiasBase, patrocinadoresActuales: patrocinadoresBase } = await import(
  '../src/data/contenido.js'
)

export function contenidoActual() {
  const guardado = leer()
  return {
    noticias: guardado.noticias.length ? guardado.noticias : noticiasBase,
    patrocinadores: guardado.patrocinadores.length ? guardado.patrocinadores : patrocinadoresBase,
    // le dice al panel si lo que está viendo ya es suyo o todavía la semilla
    origen: {
      noticias: guardado.noticias.length ? 'panel' : 'semilla',
      patrocinadores: guardado.patrocinadores.length ? 'panel' : 'semilla',
    },
  }
}

/** Las listas de partida, para cuando el panel edita por primera vez. */
export function semilla() {
  return {
    noticias: JSON.parse(JSON.stringify(noticiasBase)),
    patrocinadores: JSON.parse(JSON.stringify(patrocinadoresBase)),
  }
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'Solo GET' })
  }
  // Se revalida siempre: si el club publica una noticia, quien entre después
  // tiene que verla, no una copia de hace una hora.
  res.setHeader('Cache-Control', 'no-cache')
  return res.status(200).json(contenidoActual())
}
