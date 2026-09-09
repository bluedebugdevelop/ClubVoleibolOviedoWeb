// ==========================================================================
// Freno de peticiones para los formularios públicos.
//
// Los tres formularios (contacto, inscripción, patrocinio) no pueden pedir
// login: son la puerta de entrada de gente que todavía no es del club. Lo único
// que tenían era el control de `Origin` y la trampa del campo oculto, y ninguna
// de las dos frena a un script:
//
//   · `Origin` solo la manda un NAVEGADOR. Un `curl` no la manda, y el control
//     estaba escrito como `if (origen) {...}`, así que sin cabecera se saltaba
//     entero. Comprobado el 09-09-2026.
//   · La trampa del campo oculto la esquiva cualquiera que mire el HTML una vez.
//
// Y detrás no había nada más. Los comentarios de esos ficheros decían que el
// freno «tiene que ponerse en el firewall de Vercel», pero Vercel se apagó el
// 07-08-2026: ese freno no existe desde entonces. Cada POST que pasaba era un
// correo de Resend, o sea cuota quemada y el buzón de patrocinio —el único que
// el club lee de verdad— inundado.
//
// Esto es lo que faltaba: una ventana deslizante por IP, en memoria.
//
// En memoria y no en disco, igual que el freno del login (`api/_acceso.js`): al
// reiniciar se olvida, y para un club es lo justo. Quien pueda reiniciar el
// servidor a voluntad ya tiene acceso a cosas peores que el formulario de
// contacto.
// ==========================================================================

/** @type {Map<string, number[]>} IP → marcas de tiempo de sus peticiones */
const marcas = new Map()

/* Diez cada cuarto de hora. Una persona manda UNO: puede repetir si se
   equivocó, o mandar el de inscripción y luego el de contacto. Diez es
   holgado para eso y ridículo para inundar un buzón. */
const MAX_POR_VENTANA = 10
const VENTANA = 15 * 60 * 1000

/**
 * ¿Puede esta IP mandar otro formulario?
 *
 * Devuelve `0` si sí, o los milisegundos que le quedan de espera si no.
 * Contar TODAS las peticiones, no solo las que fallan: aquí lo que se frena es
 * el volumen, no los intentos de adivinar nada.
 */
export function frenoFormulario(ip) {
  const ahora = Date.now()
  const desde = ahora - VENTANA

  const suyas = (marcas.get(ip) || []).filter((t) => t > desde)

  if (suyas.length >= MAX_POR_VENTANA) {
    marcas.set(ip, suyas)
    // cuánto falta para que la más vieja salga de la ventana
    return Math.max(0, suyas[0] + VENTANA - ahora)
  }

  suyas.push(ahora)
  marcas.set(ip, suyas)

  /* Limpieza perezosa, igual que en `_acceso.js`: sin esto el Map crecería sin
     fin con IPs de paso que no van a volver. */
  if (marcas.size > 1000) {
    for (const [k, v] of marcas) {
      const vivas = v.filter((t) => t > desde)
      if (vivas.length) marcas.set(k, vivas)
      else marcas.delete(k)
    }
  }

  return 0
}

export { MAX_POR_VENTANA, VENTANA }
