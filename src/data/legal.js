// ==========================================================================
// Datos para las páginas legales (aviso legal, privacidad y cookies).
//
// Los textos describen lo que la web hace DE VERDAD hoy: qué formularios
// recogen datos, a dónde van y qué terceros intervienen. Si se toca algo de
// eso —se conecta el formulario de contacto, se mete analítica, se abre la
// tienda con pasarela de pago— hay que revisar los textos de Legal.jsx.
// ==========================================================================

export const legalActualizado = '2 de agosto de 2026'

// ---------------------------------------------------------------------------
// Identificación del titular.
//
// PENDIENTE: el CIF, el domicilio social y el número de registro del club en el
// Registro de Entidades Deportivas del Principado de Asturias. La Ley de
// Servicios de la Sociedad de la Información (art. 10 LSSI-CE) obliga a que
// estos datos figuren en el aviso legal, así que mientras falten la página los
// enseña como pendientes en vez de callarlos.
// ---------------------------------------------------------------------------
export const titular = {
  denominacion: 'Club Voleibol Oviedo',
  cif: null,
  domicilio: null,
  registro: null,
}

/**
 * Terceros que intervienen al usar la web. Se listan con su papel y dónde
 * tratan los datos, que es lo que exige informar el RGPD.
 */
export const terceros = [
  {
    nombre: 'Vercel Inc.',
    papel: 'Alojamiento de la web',
    detalle:
      'Guarda registros técnicos de acceso (dirección IP, fecha y hora, navegador) durante un tiempo limitado, para que el sitio funcione y por seguridad.',
    pais: 'Estados Unidos',
  },
  {
    nombre: 'Resend',
    papel: 'Envío de los correos de los formularios',
    detalle:
      'Recibe el contenido de la solicitud para poder entregarla en el correo del club. No se usa para nada más.',
    pais: 'Estados Unidos',
  },
  {
    nombre: 'Google (Fonts)',
    papel: 'Tipografías de la web',
    detalle:
      'Al cargar cualquier página se piden las tipografías a los servidores de Google, que reciben la dirección IP. No instala cookies.',
    pais: 'Estados Unidos',
  },
  {
    nombre: 'Google (Maps)',
    papel: 'Mapa de la página de contacto',
    detalle:
      'Solo se carga en la página de Contacto. Al mostrarse, Google recibe la dirección IP y puede instalar cookies propias en el navegador.',
    pais: 'Estados Unidos',
  },
  {
    nombre: 'Google (Forms)',
    papel: 'Formulario de inscripción',
    detalle:
      'El formulario de inscripción está alojado en Google Forms, fuera de esta web, y las respuestas se guardan en la cuenta de Google del club. Solo interviene si decides abrirlo y rellenarlo.',
    pais: 'Estados Unidos',
  },
]

/**
 * Qué recoge cada formulario y para qué. El de contacto está aparte a
 * propósito: hoy NO envía nada, y decir lo contrario sería falso.
 */
export const tratamientos = [
  {
    id: 'inscripciones',
    titulo: 'Formulario de inscripción',
    donde: 'Google Forms',
    datos:
      'Los que pida el formulario del club: normalmente el nombre del jugador o jugadora, su fecha de nacimiento, los datos de contacto del padre, madre o tutor y el equipo de interés.',
    finalidad:
      'Ponerse en contacto con la familia y asignar el equipo que corresponde por año de nacimiento y nivel.',
    base: 'El consentimiento de quien rellena el formulario.',
    gestion:
      'Este formulario no está en esta web: se rellena en Google Forms y las respuestas quedan guardadas en la cuenta de Google del club. Desde aquí solo se enlaza.',
    conservacion:
      'Mientras se gestiona la solicitud y, si acaba en inscripción, mientras dure la relación con el club.',
  },
  {
    id: 'patrocinio',
    titulo: 'Formulario de patrocinio',
    donde: '/patrocinar',
    datos:
      'Nombre de la empresa, persona de contacto, teléfono, correo electrónico, web y el mensaje que se escriba.',
    finalidad: 'Responder a la propuesta de patrocinio y poder hablarla.',
    base: 'El interés legítimo en atender una solicitud comercial hecha por la propia empresa.',
    gestion:
      'No se guarda en ninguna base de datos: lo que se escribe se envía por correo electrónico al buzón del club y ahí se queda.',
    conservacion: 'Mientras dure la conversación y, si hay acuerdo, mientras dure el patrocinio.',
  },
]
