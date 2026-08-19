// ==========================================================================
// La noticia semanal de Instagram: se redacta sola, pero NO se publica sola.
//
//   POST /api/resumen/imagen     (bytes de la imagen)   → { ruta }
//   POST /api/resumen/borrador   { noticia, fuentes }   → { id, enlace }
//   GET  /api/resumen/ver?id=…&f=…                      → página de aprobación
//   POST /api/resumen/publicar   { id, f }              → la mete en la web
//   POST /api/resumen/descartar  { id, f }              → la tira
//
// Las dos primeras las llama el robot (`scripts/resumen-semanal.mjs`, desde
// GitHub Actions) con la cabecera `x-clave: RESUMEN_SECRETO`. Las tres últimas
// las usa Diego desde el enlace que le llega por Telegram, sin contraseña: lo
// que las autoriza es la firma `f`, un HMAC del identificador con ese mismo
// secreto.
//
// POR QUÉ UNA PÁGINA Y NO UN ENLACE QUE PUBLIQUE DIRECTO: Telegram abre los
// enlaces él solo para pintar la miniatura. Si publicar fuera un GET, la
// noticia saldría a la web en el momento en que llega el aviso, sin que nadie
// la lea. Por eso el enlace solo ENSEÑA (GET) y el botón manda un POST.
//
// Y por qué hay aprobación: un modelo escribiendo prosa pública del club sin
// que nadie la lea acabará inventando un marcador o cambiando «cadete» por
// «infantil». Esta web lleva sesiones enteras quitando datos de muestra;
// publicar sin revisar iría justo en contra.
//
// Sin RESUMEN_SECRETO todo esto responde 404: no existe.
// ==========================================================================

import crypto from 'node:crypto'

import {
  borrarImagen,
  escribir,
  escribirPrivado,
  guardarImagen,
  leer,
  leerPrivado,
  TIPOS_ACEPTADOS,
} from './_almacen.js'
import { semilla } from './contenido.js'
import { limpiaNoticia } from './panel.js'

const secreto = () => (process.env.RESUMEN_SECRETO || '').trim()

/** ¿Está montado esto? Con un secreto corto no: se podría probar a lo bruto. */
export function configurado() {
  return secreto().length >= 24
}

function firmar(id) {
  return crypto.createHmac('sha256', secreto()).update(`resumen:${id}`).digest('base64url')
}

/** Comparación en tiempo constante, igual que en el panel. */
function iguales(a, b) {
  const A = Buffer.from(String(a))
  const B = Buffer.from(String(b))
  if (A.length !== B.length) return false
  return crypto.timingSafeEqual(A, B)
}

const firmaValida = (id, f) => iguales(firmar(id), f)

/** La clave del robot, la misma que firma los enlaces. */
const claveValida = (req) => iguales(req.headers['x-clave'] || '', secreto())

const texto = (v, max = 400) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Un borrador caduca: si nadie lo aprueba en dos semanas ya no es noticia. */
const DIAS_VIVO = 14
const MAX_BORRADORES = 20

function limpiarViejos(privado) {
  const limite = Date.now() - DIAS_VIVO * 24 * 60 * 60 * 1000
  const vivos = []
  for (const b of privado.borradores) {
    const caducado = b.estado === 'borrador' && Date.parse(b.creado || '') < limite
    if (caducado || vivos.length >= MAX_BORRADORES) {
      // la foto se va con él: un borrador muerto no tiene por qué ocupar disco
      if (b.estado !== 'publicada') borrarImagen(b.noticia?.img)
      continue
    }
    vivos.push(b)
  }
  privado.borradores = vivos
}

/** El sitio público, para poder mandar un enlace absoluto por Telegram. */
function sitio(req) {
  const dominio = (process.env.DOMINIO_CANONICO || '')
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
  if (dominio) return `https://${dominio}`
  const host = req.headers.host || 'localhost'
  const local = host.startsWith('localhost') || host.startsWith('127.')
  return `${local ? 'http' : 'https'}://${host}`
}

const escapa = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

// --------------------------------------------------------------------------
// La página de aprobación. HTML a pelo, servido por el propio API: no pasa por
// el router de React a propósito. Se abre desde el móvil, con una firma en la
// URL, y cuanto menos cargue menos sitios hay por donde se escape.
// --------------------------------------------------------------------------
function paginaAprobacion(b, f) {
  const n = b.noticia
  const cerrada = b.estado !== 'borrador'
  const parrafos = n.cuerpo.map((p) => `<p>${escapa(p)}</p>`).join('\n')
  const fuentes = (b.fuentes || [])
    .map(
      (u) =>
        `<li><a href="${escapa(u)}" rel="noreferrer noopener nofollow" target="_blank">${escapa(u)}</a></li>`,
    )
    .join('\n')

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Resumen de la semana — revisar antes de publicar</title>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0 auto; padding: 1.2rem; max-width: 42rem;
         font: 1rem/1.6 system-ui, -apple-system, "Segoe UI", sans-serif; }
  img { width: 100%; border-radius: .6rem; display: block; }
  .aviso { padding: .8rem 1rem; border-radius: .6rem; background: #fff4d6; color: #4a3b00; }
  .meta { color: #777; font-size: .9rem; }
  .botones { display: flex; gap: .8rem; margin: 1.6rem 0; flex-wrap: wrap; }
  button { flex: 1 1 12rem; padding: .9rem 1rem; font-size: 1rem; font-weight: 600;
           border: 0; border-radius: .6rem; cursor: pointer; }
  .publicar { background: #0b5d3b; color: #fff; }
  .descartar { background: #e6e6e6; color: #333; }
  button[disabled] { opacity: .5; cursor: default; }
  #resultado { font-weight: 600; }
  ul { padding-left: 1.2rem; word-break: break-all; }
</style>
</head>
<body>
<p class="aviso">Esto <b>todavía no está publicado</b>. Léelo antes: lo ha
redactado un modelo a partir de los pies de foto de Instagram, y de ahí salen
los datos que puede haberse inventado.</p>

${n.img ? `<img src="${escapa(n.img)}" alt="">` : ''}
<p class="meta">${escapa(n.categoria)} · ${escapa(n.fecha)}</p>
<h1>${escapa(n.titulo)}</h1>
<p><b>${escapa(n.resumen)}</b></p>
${parrafos}

${fuentes ? `<h2>De dónde sale</h2>\n<ul>${fuentes}</ul>` : ''}

<div class="botones">
  <button class="publicar"${cerrada ? ' disabled' : ''}>Publicar en la web</button>
  <button class="descartar"${cerrada ? ' disabled' : ''}>Descartar</button>
</div>
<p id="resultado">${cerrada ? `Ya ${b.estado === 'publicada' ? 'se publicó' : 'se descartó'}.` : ''}</p>

<script>
const id = ${JSON.stringify(b.id)}
const firma = ${JSON.stringify(String(f))}
const salida = document.getElementById('resultado')
const botones = document.querySelectorAll('button')

async function mandar(accion) {
  botones.forEach((b) => { b.disabled = true })
  salida.textContent = 'Un momento…'
  try {
    const r = await fetch('/api/resumen/' + accion, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, f: firma }),
    })
    const datos = await r.json()
    if (!datos.ok) throw new Error(datos.error || 'no se pudo')
    salida.textContent = accion === 'publicar'
      ? 'Publicada. Ya está en /noticias.'
      : 'Descartada.'
  } catch (e) {
    salida.textContent = 'No salió: ' + e.message
    botones.forEach((b) => { b.disabled = false })
  }
}

document.querySelector('.publicar').addEventListener('click', () => mandar('publicar'))
document.querySelector('.descartar').addEventListener('click', () => mandar('descartar'))
</script>
</body>
</html>`
}

export default async function handler(req, res) {
  const accion = (req.params?.accion || req.url.split('/').filter(Boolean).pop() || '').split('?')[0]

  if (!configurado()) return res.status(404).json({ ok: false, error: 'No encontrado' })

  const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
  const consulta = req.query || {}

  // ---- lo que llama el robot ----

  if (accion === 'imagen') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Solo POST' })
    if (!claveValida(req)) return res.status(404).json({ ok: false, error: 'No encontrado' })

    const tipo = (req.headers['content-type'] || '').split(';')[0].trim()
    if (!TIPOS_ACEPTADOS.includes(tipo)) {
      return res.status(400).json({ ok: false, error: 'Formato no admitido.' })
    }
    if (!Buffer.isBuffer(req.body) || !req.body.length) {
      return res.status(400).json({ ok: false, error: 'No llegó ninguna imagen.' })
    }
    try {
      const ruta = guardarImagen(req.body, tipo, 'resumen-semana')
      return res.status(200).json({ ok: true, ruta })
    } catch (e) {
      return res.status(400).json({ ok: false, error: e.message })
    }
  }

  if (accion === 'borrador') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Solo POST' })
    if (!claveValida(req)) return res.status(404).json({ ok: false, error: 'No encontrado' })

    /* Se pasa por el MISMO limpiador que usa el panel: lo que escribe un modelo
       acaba pintado en la web igual que lo que escribe una persona, así que
       recibe el mismo recorte de campos y de longitudes. */
    const noticia = limpiaNoticia(cuerpo.noticia || {}, 0)
    if (!noticia.titulo || !noticia.cuerpo.length) {
      return res.status(400).json({ ok: false, error: 'Falta título o cuerpo.' })
    }

    const privado = leerPrivado()
    limpiarViejos(privado)

    const id = `r-${Date.now().toString(36)}${crypto.randomBytes(4).toString('hex')}`
    const borrador = {
      id,
      creado: new Date().toISOString(),
      estado: 'borrador',
      /* Los enlaces a los posts de los que salió. Es lo que deja comprobar de
         un vistazo si el texto se ha inventado algo. */
      fuentes: Array.isArray(cuerpo.fuentes)
        ? cuerpo.fuentes
            .map((u) => texto(u, 300))
            .filter((u) => u.startsWith('https://'))
            .slice(0, 20)
        : [],
      noticia,
    }
    privado.borradores.unshift(borrador)

    try {
      escribirPrivado(privado)
    } catch (e) {
      console.error('Resumen: no se pudo guardar el borrador', e.message)
      return res.status(500).json({ ok: false, error: 'No se pudo guardar en el disco.' })
    }

    const enlace = `${sitio(req)}/api/resumen/ver?id=${id}&f=${firmar(id)}`
    console.log(`Resumen: borrador ${id} a la espera de aprobación`)
    return res.status(200).json({ ok: true, id, enlace })
  }

  // ---- lo que toca Diego desde Telegram ----

  const id = texto(consulta.id || cuerpo.id, 60)
  const f = texto(consulta.f || cuerpo.f, 100)
  if (!id || !firmaValida(id, f)) return res.status(404).json({ ok: false, error: 'No encontrado' })

  const privado = leerPrivado()
  const borrador = privado.borradores.find((b) => b.id === id)
  if (!borrador) return res.status(404).json({ ok: false, error: 'Ese borrador ya no está.' })

  if (accion === 'ver') {
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Solo GET' })
    /* Ni caché ni referrer: la URL lleva la firma dentro, y con `no-referrer`
       no viaja a las webs que se abran desde los enlaces de las fuentes. */
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Referrer-Policy', 'no-referrer')
    res.setHeader('X-Robots-Tag', 'noindex, nofollow')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(200).send(paginaAprobacion(borrador, f))
  }

  if (accion === 'publicar' || accion === 'descartar') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Solo POST' })
    if (borrador.estado !== 'borrador') {
      return res.status(409).json({ ok: false, error: `Ese borrador ya está ${borrador.estado}.` })
    }

    if (accion === 'descartar') {
      borrador.estado = 'descartada'
      borrador.cerrada = new Date().toISOString()
      borrarImagen(borrador.noticia.img)
      borrador.noticia.img = ''
      try {
        escribirPrivado(privado)
      } catch (e) {
        console.error('Resumen: no se pudo descartar', e.message)
        return res.status(500).json({ ok: false, error: 'No se pudo guardar en el disco.' })
      }
      console.log(`Resumen: ${id} descartado`)
      return res.status(200).json({ ok: true, estado: 'descartada' })
    }

    /* Publicar es meterla la PRIMERA de la lista: en /noticias y en la portada
       el orden lo decide la posición, no la fecha. Y si el panel no ha escrito
       nunca, la lista guardada está vacía y hay que partir de la semilla, o
       publicar esta borraría la de la preinscripción. */
    const guardado = leer()
    const noticias = guardado.noticias.length ? guardado.noticias : semilla().noticias
    if (noticias.some((n) => n.slug === borrador.noticia.slug)) {
      borrador.noticia.slug = `${borrador.noticia.slug}-${Date.now().toString(36).slice(-4)}`
    }
    const despues = { ...guardado, noticias: [borrador.noticia, ...noticias].slice(0, 200) }

    try {
      escribir(despues)
      borrador.estado = 'publicada'
      borrador.cerrada = new Date().toISOString()
      escribirPrivado(privado)
    } catch (e) {
      console.error('Resumen: no se pudo publicar', e.message)
      return res.status(500).json({ ok: false, error: 'No se pudo guardar en el disco.' })
    }

    console.log(`Resumen: ${id} publicado como /noticias/${borrador.noticia.slug}`)
    return res.status(200).json({ ok: true, estado: 'publicada', slug: borrador.noticia.slug })
  }

  return res.status(404).json({ ok: false, error: 'No encontrado' })
}
