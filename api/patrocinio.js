// ==========================================================================
// Recogida de solicitudes de patrocinio.
//
// Gemela de `inscripcion.js`: función serverless de Vercel que NO guarda nada,
// solo manda por email al club lo que llega del formulario de /patrocinar.
//
// Usa las mismas variables de entorno que las inscripciones:
//   RESEND_API_KEY      clave de https://resend.com
//   INSCRIPCIONES_TO    a dónde llegan (por defecto, el correo del club)
//   INSCRIPCIONES_FROM  remitente; de un dominio verificado en Resend
// Se reutilizan a propósito: es el mismo buzón y no tiene sentido pedirle a
// Diego que configure dos claves. Si algún día los patrocinios tienen que ir a
// otra dirección, `PATROCINIO_TO` la pisa.
//
// Sin RESEND_API_KEY responde 503 con `configurado: false` y la página enseña
// el teléfono y el correo del club. Nunca se pierde una solicitud en silencio.
// ==========================================================================

const CORREO_CLUB = 'info@clubvoleiboloviedo.com'

const CAMPOS = ['empresa', 'contacto', 'telefono', 'email', 'web', 'mensaje']
const OBLIGATORIOS = ['empresa', 'contacto', 'email']
const LIMITE = 1200

function limpia(valor) {
  if (typeof valor !== 'string') return ''
  return valor.trim().slice(0, LIMITE)
}

function escapa(texto) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Solo POST' })
  }

  // Mismo criterio que en inscripcion.js: el endpoint es público porque es un
  // formulario, pero se rechaza lo que venga desde otra web. No es un límite de
  // peticiones; para eso está el firewall de Vercel.
  const origen = req.headers.origin
  if (origen) {
    let anfitrion = ''
    try {
      anfitrion = new URL(origen).host
    } catch {
      anfitrion = ''
    }
    if (anfitrion !== req.headers.host) {
      console.warn('Solicitud de patrocinio rechazada, origen ajeno:', origen)
      return res.status(403).json({ ok: false, error: 'Origen no permitido' })
    }
  }

  const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})

  // trampa para robots: campo oculto que una persona nunca rellena
  if (limpia(cuerpo.apodo)) return res.status(200).json({ ok: true })

  const datos = {}
  for (const campo of CAMPOS) datos[campo] = limpia(cuerpo[campo])

  const faltan = OBLIGATORIOS.filter((c) => !datos[c])
  if (faltan.length) {
    return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios', faltan })
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(datos.email)) {
    return res.status(400).json({ ok: false, error: 'El email no es válido' })
  }
  if (cuerpo.consentimiento !== true) {
    return res.status(400).json({ ok: false, error: 'Falta el consentimiento' })
  }

  const clave = process.env.RESEND_API_KEY
  if (!clave) {
    return res.status(503).json({
      ok: false,
      configurado: false,
      error: 'El envío todavía no está configurado en el servidor.',
    })
  }

  const destino = process.env.PATROCINIO_TO || process.env.INSCRIPCIONES_TO || CORREO_CLUB
  const remitente = process.env.INSCRIPCIONES_FROM || 'CV Oviedo <onboarding@resend.dev>'

  const filas = [
    ['Empresa', datos.empresa],
    ['Persona de contacto', datos.contacto],
    ['Teléfono', datos.telefono || '—'],
    ['Email', datos.email],
    ['Web', datos.web || '—'],
    ['Mensaje', datos.mensaje || '—'],
  ]

  const html =
    '<h2>Nueva solicitud de patrocinio</h2><table cellpadding="6" style="border-collapse:collapse">' +
    filas
      .map(
        ([k, v]) =>
          `<tr><td style="border:1px solid #ddd"><b>${escapa(k)}</b></td>` +
          `<td style="border:1px solid #ddd">${escapa(v)}</td></tr>`,
      )
      .join('') +
    '</table><p style="color:#666;font-size:13px">Enviado desde la página de patrocinio de cvo-web.</p>'

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clave}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: remitente,
        to: [destino],
        reply_to: datos.email,
        subject: `Patrocinio · ${datos.empresa}`,
        html,
      }),
    })

    if (!r.ok) {
      console.error('Resend respondió', r.status, await r.text())
      return res.status(502).json({ ok: false, error: 'No se pudo enviar la solicitud.' })
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('Fallo al enviar la solicitud de patrocinio:', e.message)
    return res.status(502).json({ ok: false, error: 'No se pudo enviar la solicitud.' })
  }
}
