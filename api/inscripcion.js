// ==========================================================================
// Recogida de solicitudes de semana de prueba.
//
// Función serverless de Vercel (carpeta /api, sin configuración). NO guarda
// nada: coge lo que llega del formulario y lo manda por email al club. Sin
// base de datos, igual que el resto del sitio.
//
// Para que envíe de verdad hacen falta dos variables de entorno en Vercel:
//   RESEND_API_KEY      clave de https://resend.com (plan gratis: 100 correos/día)
//   INSCRIPCIONES_TO    a dónde llegan las solicitudes (por defecto, el correo del club)
// Opcional:
//   INSCRIPCIONES_FROM  remitente; tiene que ser de un dominio verificado en Resend
//
// Sin RESEND_API_KEY la función responde 503 con `configurado: false` y la
// página enseña el correo del club en su lugar. Nunca se pierde una solicitud
// en silencio.
// ==========================================================================

const CORREO_CLUB = 'info@clubvoleiboloviedo.com'

/* Solo lo imprescindible para poder llamar a la familia y asignar grupo. Ni DNI
   ni datos médicos: eso se hace en persona al formalizar la ficha federativa. */
const CAMPOS = ['jugador', 'nacimiento', 'tutor', 'telefono', 'email', 'equipo', 'posicion', 'comentarios']
const OBLIGATORIOS = ['jugador', 'nacimiento', 'telefono', 'email']
const LIMITE = 600

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

  // El endpoint es público a propósito —es un formulario de inscripción, no
  // puede pedir login—, así que al menos se rechaza lo que venga desde otra
  // web. Compara contra el propio host, para que siga valiendo el día que haya
  // dominio propio. Esto NO es un límite de peticiones: si alguien abusa a
  // base de scripts, el freno tiene que ponerse en el firewall de Vercel.
  const origen = req.headers.origin
  if (origen) {
    let anfitrion = ''
    try {
      anfitrion = new URL(origen).host
    } catch {
      anfitrion = ''
    }
    if (anfitrion !== req.headers.host) {
      console.warn('Inscripción rechazada, origen ajeno:', origen)
      return res.status(403).json({ ok: false, error: 'Origen no permitido' })
    }
  }

  const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})

  // trampa para robots: es un campo oculto que una persona nunca rellena
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

  const destino = process.env.INSCRIPCIONES_TO || CORREO_CLUB
  const remitente = process.env.INSCRIPCIONES_FROM || 'CV Oviedo <onboarding@resend.dev>'

  const filas = [
    ['Jugador/a', datos.jugador],
    ['Fecha de nacimiento', datos.nacimiento],
    ['Padre/madre/tutor', datos.tutor || '—'],
    ['Teléfono', datos.telefono],
    ['Email', datos.email],
    ['Equipo de interés', datos.equipo || 'No lo sabe / que se lo digan'],
    ['Posición', datos.posicion || 'Sin especificar'],
    ['Comentarios', datos.comentarios || '—'],
  ]

  const html =
    '<h2>Nueva solicitud de semana de prueba</h2><table cellpadding="6" style="border-collapse:collapse">' +
    filas
      .map(
        ([k, v]) =>
          `<tr><td style="border:1px solid #ddd"><b>${escapa(k)}</b></td>` +
          `<td style="border:1px solid #ddd">${escapa(v)}</td></tr>`,
      )
      .join('') +
    '</table><p style="color:#666;font-size:13px">Enviado desde el formulario de inscripciones de cvo-web.</p>'

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clave}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: remitente,
        to: [destino],
        reply_to: datos.email,
        subject: `Inscripción · ${datos.jugador}`,
        html,
      }),
    })

    if (!r.ok) {
      // el detalle del proveedor se queda en los logs, no se le enseña a quien rellena
      console.error('Resend respondió', r.status, await r.text())
      return res.status(502).json({ ok: false, error: 'No se pudo enviar la solicitud.' })
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('Fallo al enviar la inscripción:', e.message)
    return res.status(502).json({ ok: false, error: 'No se pudo enviar la solicitud.' })
  }
}
