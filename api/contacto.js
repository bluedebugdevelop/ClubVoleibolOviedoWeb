// ==========================================================================
// Recogida de mensajes del formulario de contacto.
//
// Tercera hermana de `inscripcion.js` y `patrocinio.js`, con el mismo trato: NO
// guarda nada, solo manda por email lo que llega del formulario de /contacto.
//
//   RESEND_API_KEY  clave de https://resend.com (compartida con las otras dos)
//   CONTACTO_TO     a dónde llegan los mensajes
//   MAIL_FROM       remitente; tiene que ser de un dominio verificado en Resend
//                   (se acepta INSCRIPCIONES_FROM, que es como se llamaba antes)
//
// Hasta el 12-08-2026 este formulario NO enviaba nada: al pulsar «enviar» solo
// cambiaba un estado en el navegador y avisaba de que no estaba conectado.
//
// El destino por defecto es el buzón de patrocinio porque es el que el club
// tiene operativo y lee (petición de Adrián, 12-08-2026). Cuando `info@` esté
// en marcha, basta con declarar CONTACTO_TO en Railway; no hay que tocar código.
//
// Sin RESEND_API_KEY responde 503 con `configurado: false` y la página enseña el
// correo del club. Nunca se pierde un mensaje en silencio.
// ==========================================================================

const CORREO_DESTINO = 'cvopatrocinadores@clubvoleiboloviedo.com'

const CAMPOS = ['nombre', 'email', 'mensaje']
const OBLIGATORIOS = ['nombre', 'email', 'mensaje']
const LIMITE = 2000

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

  // Mismo criterio que en los otros dos: el endpoint es público porque es un
  // formulario, pero se rechaza lo que venga desde otra web.
  const origen = req.headers.origin
  if (origen) {
    let anfitrion = ''
    try {
      anfitrion = new URL(origen).host
    } catch {
      anfitrion = ''
    }
    if (anfitrion !== req.headers.host) {
      console.warn('Mensaje de contacto rechazado, origen ajeno:', origen)
      return res.status(403).json({ ok: false, error: 'Origen no permitido' })
    }
  }

  const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})

  // trampa para robots: campo oculto que una persona nunca rellena. Aquí importa
  // más que en los otros dos: un formulario de contacto es el primero al que van
  // los bots de spam.
  if (limpia(cuerpo.web)) return res.status(200).json({ ok: true })

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

  const destino = process.env.CONTACTO_TO || CORREO_DESTINO
  const remitente =
    process.env.MAIL_FROM || process.env.INSCRIPCIONES_FROM || 'CV Oviedo <onboarding@resend.dev>'

  const filas = [
    ['Nombre', datos.nombre],
    ['Email', datos.email],
    ['Mensaje', datos.mensaje],
  ]

  const html =
    '<h2>Nuevo mensaje desde la web</h2><table cellpadding="6" style="border-collapse:collapse">' +
    filas
      .map(
        ([k, v]) =>
          `<tr><td style="border:1px solid #ddd;vertical-align:top"><b>${escapa(k)}</b></td>` +
          `<td style="border:1px solid #ddd">${escapa(v).replace(/\n/g, '<br>')}</td></tr>`,
      )
      .join('') +
    '</table><p style="color:#666;font-size:13px">Enviado desde el formulario de contacto de cvo-web.</p>'

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clave}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: remitente,
        to: [destino],
        // así, al darle a «responder» en el correo, se le contesta a la persona
        reply_to: datos.email,
        subject: `Contacto web · ${datos.nombre}`,
        html,
      }),
    })

    if (!r.ok) {
      console.error('Resend respondió', r.status, await r.text())
      return res.status(502).json({ ok: false, error: 'No se pudo enviar el mensaje.' })
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('Fallo al enviar el mensaje de contacto:', e.message)
    return res.status(502).json({ ok: false, error: 'No se pudo enviar el mensaje.' })
  }
}
