// ==========================================================================
// La noticia semanal: lo que el club ha publicado en Instagram, contado en una
// noticia de la web.
//
// Lo lanza `.github/workflows/resumen-semanal.yml` los domingos por la tarde.
// El camino entero es:
//
//   Instagram Graph API  →  ¿hay al menos 3 publicaciones?  →  Claude redacta
//   →  se baja una foto  →  POST al sitio como BORRADOR  →  aviso a Telegram
//   con un enlace  →  Diego lo lee y decide.
//
// NO PUBLICA NADA. Lo único que deja en la web es un borrador que no se ve
// desde fuera; publicarlo es un botón que toca una persona (api/resumen.js).
// Un modelo escribiendo prosa pública del club sin que nadie la lea acabaría
// inventando un marcador o cambiando «cadete» por «infantil».
//
// Variables (GitHub → Settings → Secrets and variables → Actions):
//
//   IG_TOKEN            token de larga duración de la cuenta de Instagram
//   IG_USER_ID          id de la cuenta (el de Instagram Business, no el @)
//   ANTHROPIC_API_KEY   para redactar
//   SITIO_CLAVE         la misma cadena que RESUMEN_SECRETO en Railway
//   TELEGRAM_BOT_TOKEN  bot que avisa
//   TELEGRAM_CHAT_ID    chat de Diego
//   SITIO               opcional; por defecto https://clubvoleiboloviedo.com
//
// Si falta cualquiera de las obligatorias, el script se para y lo dice. Si
// simplemente no hay bastantes publicaciones, se calla y sale con bien: una
// semana floja no es un error.
// ==========================================================================

import Anthropic from '@anthropic-ai/sdk'

const SITIO = (process.env.SITIO || 'https://clubvoleiboloviedo.com').replace(/\/$/, '')
const CLAVE = (process.env.SITIO_CLAVE || '').trim()
const IG_TOKEN = (process.env.IG_TOKEN || '').trim()
const IG_USER_ID = (process.env.IG_USER_ID || '').trim()
const IG_VERSION = process.env.IG_VERSION || 'v21.0'

/** Cuántos días mira hacia atrás y cuántas publicaciones pide para escribir. */
const DIAS = Number(process.env.RESUMEN_DIAS || 7)
const MINIMO = Number(process.env.RESUMEN_MINIMO || 3)

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** La fecha tal como la escriben las noticias de la web: «16 ago 2026». */
function fechaCorta(d) {
  const partes = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).formatToParts(d)
  const v = (t) => Number(partes.find((p) => p.type === t).value)
  return `${v('day')} ${MESES[v('month') - 1]} ${v('year')}`
}

function faltan(...nombres) {
  const vacias = nombres.filter((n) => !process.env[n])
  if (vacias.length) {
    console.error(`Faltan variables: ${vacias.join(', ')}`)
    process.exit(1)
  }
}

// --------------------------------------------------------------------------
// 1. Instagram
// --------------------------------------------------------------------------

/**
 * Las publicaciones de los últimos días.
 *
 * Con IG_USER_ID se pregunta por el grafo de Facebook (cuenta de empresa
 * enlazada a una página); sin él, por `me/media` de graph.instagram.com, que es
 * lo que devuelve un token de Instagram Login. Las dos respuestas tienen los
 * mismos campos, así que el resto del script no nota la diferencia.
 */
async function publicaciones() {
  const campos = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp'
  const base = IG_USER_ID
    ? `https://graph.facebook.com/${IG_VERSION}/${IG_USER_ID}/media`
    : `https://graph.instagram.com/${IG_VERSION}/me/media`

  const url = `${base}?fields=${campos}&limit=50&access_token=${encodeURIComponent(IG_TOKEN)}`
  const r = await fetch(url)
  const datos = await r.json()

  if (!r.ok || datos.error) {
    /* El token de Instagram caduca cada 60 días aunque sea «de larga
       duración». Cuando este script empiece a fallar, mirar aquí primero. */
    throw new Error(`Instagram respondió ${r.status}: ${datos.error?.message || 'sin detalle'}`)
  }

  const desde = Date.now() - DIAS * 24 * 60 * 60 * 1000
  return (datos.data || [])
    .filter((p) => Date.parse(p.timestamp) >= desde)
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
}

// --------------------------------------------------------------------------
// 2. El texto
// --------------------------------------------------------------------------

const SISTEMA = `Escribes para la web del Club Voleibol Oviedo, un club de voleibol
de Oviedo (Asturias) con equipos sénior masculino y femenino y cantera de alevín
a juvenil.

Tu tarea: resumir en UNA noticia lo que el club ha publicado esta semana en
Instagram. Te paso los pies de foto tal cual.

Reglas, por orden de importancia:

1. NO INVENTES NADA. Solo puedes contar lo que diga literalmente algún pie de
   foto. Si un resultado no aparece, no hay resultado. Si no se dice qué equipo
   era, no lo digas. Nada de rivales, marcadores, jornadas, posiciones ni fechas
   que no estén escritos.
2. No cambies una categoría por otra: alevín, infantil, cadete, juvenil, júnior
   y sénior son cosas distintas.
3. Español de España, en tercera persona y llano. Ni épica ni exclamaciones ni
   emojis ni etiquetas.
4. Es una noticia de club, no un parte: si la semana da para poco, que el texto
   sea corto. Mejor tres frases ciertas que dos párrafos rellenos.
5. Ni menciones a Instagram ni llamadas a seguir la cuenta.`

async function redactar(posts) {
  const cliente = new Anthropic()

  const material = posts
    .map((p, i) => {
      const cuando = fechaCorta(new Date(p.timestamp))
      return `--- Publicación ${i + 1} (${cuando})\n${(p.caption || '(sin texto)').trim()}`
    })
    .join('\n\n')

  const respuesta = await cliente.messages.create({
    model: 'claude-opus-5',
    max_tokens: 4000,
    system: SISTEMA,
    output_config: {
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            titulo: { type: 'string', description: 'Máximo 70 caracteres, sin punto final.' },
            resumen: { type: 'string', description: 'Una frase, máximo 200 caracteres.' },
            cuerpo: {
              type: 'array',
              items: { type: 'string' },
              description: 'Los párrafos de la noticia: entre uno y cinco.',
            },
            categoria: {
              type: 'string',
              enum: ['Club', 'Cantera', 'Sénior', 'Vóley playa'],
              description: 'De qué va sobre todo la semana.',
            },
          },
          required: ['titulo', 'resumen', 'cuerpo', 'categoria'],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: 'user',
        content: `Esto es lo que el club ha publicado del ${fechaCorta(new Date(posts[0].timestamp))} al ${fechaCorta(new Date(posts.at(-1).timestamp))}:\n\n${material}`,
      },
    ],
  })

  const texto = respuesta.content.find((b) => b.type === 'text')?.text || ''
  try {
    return JSON.parse(texto)
  } catch {
    throw new Error(`Claude no devolvió JSON:\n${texto.slice(0, 400)}`)
  }
}

// --------------------------------------------------------------------------
// 3. La foto
// --------------------------------------------------------------------------

const TIPOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAXIMO = 4 * 1024 * 1024

/**
 * Baja la primera foto que sirva y la sube al sitio. Devuelve su ruta pública,
 * o '' si ninguna se deja. Sin foto la noticia sigue valiendo: se queda como
 * tarjeta sin imagen, que es mejor que no publicar nada.
 *
 * Las URL que da Instagram CADUCAN en unas horas, así que la foto se copia al
 * volumen; enlazarla directa dejaría la noticia sin imagen al día siguiente.
 */
async function foto(posts) {
  // de la más reciente hacia atrás: la portada de la noticia es lo último que
  // ha pasado, no lo del lunes
  for (const p of [...posts].reverse()) {
    const url = p.media_type === 'VIDEO' ? p.thumbnail_url : p.media_url
    if (!url) continue
    try {
      const r = await fetch(url)
      if (!r.ok) continue
      const tipo = (r.headers.get('content-type') || '').split(';')[0].trim()
      if (!TIPOS.includes(tipo)) continue
      const bytes = Buffer.from(await r.arrayBuffer())
      if (!bytes.length || bytes.length > MAXIMO) continue

      const subida = await fetch(`${SITIO}/api/resumen/imagen`, {
        method: 'POST',
        headers: { 'Content-Type': tipo, 'x-clave': CLAVE },
        body: bytes,
      })
      const datos = await subida.json()
      if (!datos.ok) throw new Error(datos.error || `respuesta ${subida.status}`)
      return datos.ruta
    } catch (e) {
      console.warn(`Foto de ${p.permalink}: ${e.message}`)
    }
  }
  return ''
}

// --------------------------------------------------------------------------
// 4. El aviso
// --------------------------------------------------------------------------

const escapa = (s) => String(s ?? '').replace(/[<>&]/g, (c) => `&#${c.charCodeAt(0)};`)

async function avisar(noticia, enlace, cuantos) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chat = process.env.TELEGRAM_CHAT_ID
  if (!token || !chat) {
    console.log(`Sin Telegram configurado. El borrador está en: ${enlace}`)
    return
  }

  /* El pie de una foto de Telegram se corta en 1024 caracteres, así que va el
     titular, el resumen y el enlace; el texto entero se lee al abrirlo. */
  const texto = [
    `<b>Resumen de la semana — sin publicar</b>`,
    '',
    `<b>${escapa(noticia.titulo)}</b>`,
    escapa(noticia.resumen),
    '',
    `De ${cuantos} publicaciones de Instagram.`,
    'Léelo y decide:',
    enlace,
  ].join('\n')

  const metodo = noticia.img ? 'sendPhoto' : 'sendMessage'
  const cuerpo = noticia.img
    ? { chat_id: chat, photo: `${SITIO}${noticia.img}`, caption: texto, parse_mode: 'HTML' }
    : { chat_id: chat, text: texto, parse_mode: 'HTML', disable_web_page_preview: true }

  const r = await fetch(`https://api.telegram.org/bot${token}/${metodo}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  })
  if (!r.ok) {
    /* Que no llegue el aviso no invalida el borrador: se apunta el enlace en
       el log del workflow y se sigue. */
    console.warn(`Telegram respondió ${r.status}. El borrador está en: ${enlace}`)
  }
}

// --------------------------------------------------------------------------

async function principal() {
  faltan('IG_TOKEN', 'ANTHROPIC_API_KEY', 'SITIO_CLAVE')

  const posts = await publicaciones()
  console.log(`${posts.length} publicaciones en los últimos ${DIAS} días.`)

  if (posts.length < MINIMO) {
    console.log(`Menos de ${MINIMO}: esta semana no hay noticia. Se sale sin hacer nada.`)
    return
  }

  const escrito = await redactar(posts)
  console.log(`Redactado: ${escrito.titulo}`)

  const img = await foto(posts)
  if (!img) console.warn('Ninguna foto se dejó copiar: la noticia irá sin imagen.')

  const hoy = new Date()
  const noticia = {
    id: `r-${hoy.toISOString().slice(0, 10)}`,
    slug: `resumen-${fechaCorta(hoy).replace(/ /g, '-')}`,
    destacada: true,
    categoria: escrito.categoria,
    fecha: fechaCorta(hoy),
    titulo: escrito.titulo,
    resumen: escrito.resumen,
    img,
    foco: 'center 50%',
    cuerpo: escrito.cuerpo,
  }

  const r = await fetch(`${SITIO}/api/resumen/borrador`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-clave': CLAVE },
    body: JSON.stringify({ noticia, fuentes: posts.map((p) => p.permalink).filter(Boolean) }),
  })
  const datos = await r.json()
  if (!datos.ok) throw new Error(`El sitio no aceptó el borrador: ${datos.error || r.status}`)

  console.log(`Borrador ${datos.id} guardado.`)
  await avisar(noticia, datos.enlace, posts.length)
}

principal().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
