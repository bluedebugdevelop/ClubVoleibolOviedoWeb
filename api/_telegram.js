// ==========================================================================
// Aviso a Telegram cuando entra una petición de publicación.
//
//   TELEGRAM_BOT_TOKEN
//   TELEGRAM_CHAT_ID
//
// Sin esas dos variables NO falla nada: simplemente no se avisa. Eso es a
// propósito. El aviso es una comodidad; la petición ya está guardada cuando se
// llama aquí. Que un bot caído o un token caducado impidan al club dejar una
// petición sería cambiar un problema pequeño por uno grande.
//
// Por lo mismo, nada de esto se espera (`await`) antes de contestar al
// navegador: se lanza y se olvida. Telegram tarda lo que quiera.
// ==========================================================================

const API = 'https://api.telegram.org'

export function telegramConfigurado() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
}

async function llamar(metodo, cuerpo) {
  const respuesta = await fetch(`${API}/bot${process.env.TELEGRAM_BOT_TOKEN}/${metodo}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, ...cuerpo }),
  })
  if (!respuesta.ok) throw new Error(`${metodo} respondió ${respuesta.status}`)
  return respuesta.json()
}

/* Telegram interpreta estos tres caracteres como formato. Un nombre con un
   guion bajo rompería el mensaje entero, así que se escapan. */
const escapa = (s) => String(s ?? '').replace(/[<>&]/g, (c) => `&#${c.charCodeAt(0)};`)

const COMO_SE_LEE = {
  alta: '🔴 Urgente',
  normal: '🟡 Normal',
  baja: '🟢 Cuando puedas',
}

/**
 * Avisa de una petición nueva. Nunca lanza: si algo va mal se queda en el log.
 *
 * @param {object} peticion  la petición ya guardada
 * @param {string} sitio     origen público, para poder enlazar el panel
 */
export function avisarPeticion(peticion, sitio) {
  if (!telegramConfigurado()) return

  const lineas = [
    `<b>Petición nueva de ${escapa(peticion.autorNombre)}</b>`,
    '',
    escapa(peticion.texto),
    '',
    `${COMO_SE_LEE[peticion.prioridad] || peticion.prioridad}`,
    peticion.paraCuando ? `Para el ${escapa(peticion.paraCuando)}` : '',
    peticion.equipo ? `Equipo: ${escapa(peticion.equipo)}` : '',
    peticion.fotos.length ? `${peticion.fotos.length} foto(s)` : 'Sin fotos',
    '',
    `${sitio}/panel`,
  ].filter(Boolean)

  const texto = lineas.join('\n')

  /* Las fotos van como álbum y el texto como pie de la primera. Con más de diez
     Telegram rechaza el grupo entero, pero el formulario ya no deja subir tantas. */
  const envio = peticion.fotos.length
    ? llamar('sendMediaGroup', {
        media: peticion.fotos.map((ruta, i) => ({
          type: 'photo',
          media: `${sitio}${ruta}`,
          ...(i === 0 ? { caption: texto, parse_mode: 'HTML' } : {}),
        })),
      })
    : llamar('sendMessage', { text: texto, parse_mode: 'HTML', disable_web_page_preview: true })

  envio.catch((e) => {
    console.warn('Telegram: no se pudo avisar de la petición', e.message)
    /* Si el álbum falló (una foto que Telegram no se pudo descargar, por
       ejemplo), al menos que llegue el texto: es lo que de verdad importa. */
    if (peticion.fotos.length) {
      llamar('sendMessage', { text: texto, parse_mode: 'HTML', disable_web_page_preview: true })
        .catch((e2) => console.warn('Telegram: tampoco salió el texto', e2.message))
    }
  })
}
