// ==========================================================================
// CVO — contenido del sitio
// Todo lo marcado con "DATOS DE MUESTRA" es contenido inventado para poder
// maquetar; hay que sustituirlo por los datos reales del club antes de publicar.
// ==========================================================================

export const club = {
  nombre: 'Club Voleibol Oviedo',
  nombreCorto: 'CV Oviedo',
  fundacion: 1991,
  // Dos buzones (07-08-2026): el general para todo, y uno aparte solo para
  // patrocinio. Todo lo que cuelgue de /patrocinar —avisos del formulario,
  // enlaces de "escríbenos"— usa `emailPatrocinio`; el resto del sitio, `email`.
  //
  // OJO (08-08-2026): el buzón de patrocinio pasa de `patrocinadores@` a
  // `cvopatrocinadores@` porque así lo pidió el club por correo. Los 54
  // borradores de la campaña de captación siguen firmados con `patrocinadores@`.
  email: 'info@clubvoleiboloviedo.com',
  emailPatrocinio: 'cvopatrocinadores@clubvoleiboloviedo.com',
  // El teléfono del club NO se publica en la web (decisión del 03-08-2026): se
  // quitó del pie, de contacto, de los avisos de los formularios y del aviso
  // legal. Ojo: los campos "teléfono" de los formularios son otra cosa, ahí lo
  // escribe quien se apunta y siguen en su sitio.
  sede: 'Polideportivo José Manuel Fuente, Colloto, Oviedo',
  sedeCorta: 'Pol. José Manuel Fuente',
  localidad: 'Colloto, Oviedo',
  redes: {
    instagram: '#',
    facebook: '#',
    youtube: '#',
  },
}

// DATOS DE MUESTRA — cifras de portada
export const cifrasClub = [
  { n: '1991', label: 'Año de fundación' },
  { n: '240', label: 'Canteranos' },
  { n: '13', label: 'Equipos federados' },
  { n: '+6.700', label: 'Seguidores en redes' },
]

// ---------------------------------------------------------------------------
// Equipos principales (los tres accesos de portada)
// ---------------------------------------------------------------------------
export const equiposDestacados = [
  {
    slug: 'superliga-2-masculino',
    nombre: 'Superliga 2 Masculino',
    categoria: 'Competición nacional',
    img: '/media/equipos/senior-masculino.jpg',
    alt: 'Equipo de Superliga 2 masculino del CV Oviedo',
    resumen: '18 jugadores · Grupo B',
  },
  {
    slug: 'primera-nacional-femenina',
    nombre: 'Primera Nacional Femenina',
    categoria: 'Competición nacional',
    img: '/media/equipos/senior-femenino.jpg',
    alt: 'Equipo de Primera Nacional femenina del CV Oviedo',
    resumen: '16 jugadoras · Grupo A',
    href: '/equipos/primera-nacional-femenina',
  },
  {
    slug: 'cantera',
    nombre: 'Cantera',
    categoria: 'Base y formación',
    img: '/media/equipos/cadete-femenino-a.jpg',
    alt: 'Equipos de cantera del CV Oviedo',
    resumen: '11 equipos · 240 deportistas',
    href: '/cantera',
  },
]

// ---------------------------------------------------------------------------
// Fichas completas de equipo (Equipo.jsx) — DATOS DE MUESTRA
//
// Aquí solo van los dos equipos nacionales, que llevan ficha escrita a mano.
// Las de cantera se generan más abajo a partir de `equiposCantera` y se juntan
// con estas en el `equipos` que exporta el fichero.
// ---------------------------------------------------------------------------
const fichasNacionales = {
  'superliga-2-masculino': {
    slug: 'superliga-2-masculino',
    nombre: 'Superliga 2 Masculino',
    crumb: 'Superliga 2 Masculino',
    kicker: 'Superliga 2 · Grupo B · Temporada 2026/27',
    sub: 'La primera plantilla del club. Segunda categoría del voleibol nacional, con partidos en casa cada dos fines de semana en el José Manuel Fuente.',
    // versión "desampliada" de equipo-masc.jpg: se le quitan 200px de gradas
    // vacías por arriba y se pega en un lienzo un 44% más ancho, relleno del
    // azul de la banda y con los bordes fundidos a ese color. La banda pinta la
    // foto siempre a ancho completo (object-fit:cover), así que ensanchar es la
    // única forma de que quepan las dos filas sin subir el alto de la banda.
    // Se genera con `ensanchar.ps1`; la original sigue en la galería.
    headerImg: '/media/equipo-masc-cabecera.jpg',
    // altura a la que están las caras: por el centro solo se ven torsos
    headerFoco: 'center 22%',
    // `stats` SIN USAR desde 2026-07-29: Diego quitó la fila de cifras de la
    // ficha de equipo. Se conserva por si vuelve; si no, borrar de los dos equipos.
    stats: [
      { n: '18', label: 'Jugadores' },
      { n: '4º', label: 'Clasificación' },
      { n: '9-4', label: 'Victorias-derrotas' },
      { n: '28', label: 'Puntos' },
    ],
    fixtures: [
      { id: 'sm-1', diaSemana: 'Sáb', dia: '26', mes: 'SEP', rival: 'CV Oviedo — CV Teide', detalle: 'Jornada 14 · Pol. José Manuel Fuente · 18:00', resultado: null, tipo: 'next' },
      { id: 'sm-2', diaSemana: 'Sáb', dia: '19', mes: 'SEP', rival: 'CV Gijón — CV Oviedo', detalle: 'Jornada 13 · Pabellón La Arena', resultado: '3–1', tipo: 'w' },
      { id: 'sm-3', diaSemana: 'Sáb', dia: '12', mes: 'SEP', rival: 'CV Oviedo — CV Santander', detalle: 'Jornada 12 · Pol. José Manuel Fuente', resultado: '3–0', tipo: 'w' },
      { id: 'sm-4', diaSemana: 'Dom', dia: '06', mes: 'SEP', rival: 'CV Valladolid — CV Oviedo', detalle: 'Jornada 11 · Polideportivo Huerta del Rey', resultado: '3–2', tipo: 'l' },
      { id: 'sm-5', diaSemana: 'Sáb', dia: '29', mes: 'AGO', rival: 'CV Oviedo — CV León', detalle: 'Jornada 10 · Pol. José Manuel Fuente', resultado: '3–1', tipo: 'w' },
    ],
    staff: [
      { iniciales: 'EC', nombre: 'Nombre del entrenador', rol: 'Primer entrenador' },
      { iniciales: 'SG', nombre: 'Nombre del ayudante', rol: 'Segundo entrenador' },
      { iniciales: 'FS', nombre: 'Nombre del fisio', rol: 'Fisioterapeuta' },
    ],
    datos: [
      { label: 'Competición', valor: 'Superliga 2' },
      { label: 'Grupo', valor: 'B' },
      { label: 'Sede', valor: 'Pol. J. M. Fuente' },
      // Los horarios de entrenamiento se quitaron el 2026-07-29 (decisión de
      // Diego): eran de muestra y no van en la ficha pública.
      { label: 'Retransmisiones', valor: 'YouTube del club' },
    ],
    squad: [
      { numero: 1, nombre: 'Nombre Apellido', posicion: 'Colocador' },
      { numero: 2, nombre: 'Nombre Apellido', posicion: 'Receptor' },
      { numero: 3, nombre: 'Nombre Apellido', posicion: 'Central' },
      { numero: 5, nombre: 'Nombre Apellido', posicion: 'Opuesto' },
      { numero: 8, nombre: 'Nombre Apellido', posicion: 'Líbero' },
      { numero: 10, nombre: 'Nombre Apellido', posicion: 'Receptor' },
      { numero: 11, nombre: 'Nombre Apellido', posicion: 'Central' },
      { numero: 13, nombre: 'Nombre Apellido', posicion: 'Colocador' },
      { numero: 14, nombre: 'Nombre Apellido', posicion: 'Opuesto' },
      { numero: 15, nombre: 'Nombre Apellido', posicion: 'Receptor' },
      { numero: 17, nombre: 'Nombre Apellido', posicion: 'Central' },
      { numero: 21, nombre: 'Nombre Apellido', posicion: 'Líbero' },
    ],
    join: {
      title: '¿Quieres jugar con nosotros?',
      text: 'El Superliga 2 Masculino busca jugadores durante todo septiembre. Ven un día a entrenar y lo hablamos.',
    },
  },

  'primera-nacional-femenina': {
    slug: 'primera-nacional-femenina',
    nombre: 'Primera Nacional Femenina',
    crumb: 'Primera Nacional Femenina',
    kicker: 'Primera Nacional · Grupo A · Temporada 2026/27',
    sub: 'La primera plantilla femenina del club. Categoría nacional, con partidos en casa cada dos fines de semana en el José Manuel Fuente.',
    // equipo-fem.jpg recortada por abajo (1170x280 de 1170x583): la mitad de
    // abajo son piernas y el suelo, y en la banda se comían el sitio de las
    // caras. Sin recortar nada por arriba. La original sigue en la galería.
    headerImg: '/media/equipo-fem-cabecera.jpg',
    // con 12% sobraba pared por arriba y el grupo quedaba bajo
    headerFoco: 'center 55%',
    stats: [
      { n: '16', label: 'Jugadoras' },
      { n: '2º', label: 'Clasificación' },
      { n: '10-3', label: 'Victorias-derrotas' },
      { n: '30', label: 'Puntos' },
    ],
    fixtures: [
      { id: 'sf-1', diaSemana: 'Dom', dia: '27', mes: 'SEP', rival: 'CV Oviedo — CV Gijón', detalle: 'Jornada 14 · Pol. José Manuel Fuente · 12:00', resultado: null, tipo: 'next' },
      { id: 'sf-2', diaSemana: 'Dom', dia: '20', mes: 'SEP', rival: 'CV Santander — CV Oviedo', detalle: 'Jornada 13 · Pabellón La Albericia', resultado: '3–2', tipo: 'l' },
      { id: 'sf-3', diaSemana: 'Dom', dia: '13', mes: 'SEP', rival: 'CV Oviedo — CV Valladolid', detalle: 'Jornada 12 · Pol. José Manuel Fuente', resultado: '3–1', tipo: 'w' },
      { id: 'sf-4', diaSemana: 'Dom', dia: '06', mes: 'SEP', rival: 'CV Oviedo — CV León', detalle: 'Jornada 11 · Pol. José Manuel Fuente', resultado: '3–0', tipo: 'w' },
      { id: 'sf-5', diaSemana: 'Sáb', dia: '29', mes: 'AGO', rival: 'CV Palencia — CV Oviedo', detalle: 'Jornada 10 · Polideportivo Municipal', resultado: '1–3', tipo: 'w' },
    ],
    staff: [
      { iniciales: 'MP', nombre: 'Nombre de la entrenadora', rol: 'Primera entrenadora' },
      { iniciales: 'AR', nombre: 'Nombre de la ayudante', rol: 'Segunda entrenadora' },
      { iniciales: 'FS', nombre: 'Nombre del fisio', rol: 'Fisioterapeuta' },
    ],
    datos: [
      { label: 'Competición', valor: 'Primera Nacional' },
      { label: 'Grupo', valor: 'A' },
      { label: 'Sede', valor: 'Pol. J. M. Fuente' },
      // idem: sin horarios de entrenamiento en la ficha
      { label: 'Retransmisiones', valor: 'YouTube del club' },
    ],
    squad: [
      { numero: 1, nombre: 'Nombre Apellido', posicion: 'Colocadora' },
      { numero: 2, nombre: 'Nombre Apellido', posicion: 'Receptora' },
      { numero: 3, nombre: 'Nombre Apellido', posicion: 'Central' },
      { numero: 4, nombre: 'Nombre Apellido', posicion: 'Opuesta' },
      { numero: 5, nombre: 'Nombre Apellido', posicion: 'Líbero' },
      { numero: 6, nombre: 'Nombre Apellido', posicion: 'Receptora' },
      { numero: 7, nombre: 'Nombre Apellido', posicion: 'Central' },
      { numero: 8, nombre: 'Nombre Apellido', posicion: 'Colocadora' },
      { numero: 9, nombre: 'Nombre Apellido', posicion: 'Opuesta' },
      { numero: 10, nombre: 'Nombre Apellido', posicion: 'Receptora' },
      { numero: 12, nombre: 'Nombre Apellido', posicion: 'Central' },
      { numero: 14, nombre: 'Nombre Apellido', posicion: 'Líbero' },
      { numero: 16, nombre: 'Nombre Apellido', posicion: 'Receptora' },
      { numero: 18, nombre: 'Nombre Apellido', posicion: 'Central' },
      { numero: 19, nombre: 'Nombre Apellido', posicion: 'Opuesta' },
      { numero: 20, nombre: 'Nombre Apellido', posicion: 'Colocadora' },
    ],
    join: {
      title: '¿Quieres jugar con nosotras?',
      text: 'La Primera Nacional Femenina busca jugadoras durante todo septiembre. Ven un día a entrenar y lo hablamos.',
    },
  },

  // El segundo equipo sénior masculino NO tiene ficha propia aquí: se decidió
  // el 03-08-2026 que su sitio es la página de Cantera, con el resto de equipos
  // de base, porque es la continuación natural para quien sale del júnior. Está
  // el primero de `equiposCantera`, justo aquí abajo.
}

// ---------------------------------------------------------------------------
// Cantera — los equipos de base (Cantera.jsx) — DATOS DE MUESTRA
//
// El `slug` es la dirección de su ficha (/equipos/<slug>), así que no se toca a
// la ligera: cambiarlo rompe los enlaces que ya estén por ahí compartidos.
// ---------------------------------------------------------------------------
export const equiposCantera = [
  // No es el de Superliga 2: es el segundo equipo sénior, donde siguen jugando
  // los que salen del júnior. Sin foto propia todavía, va una de juego.
  { slug: 'senior-masculino', nombre: 'Sénior Masculino', categoria: 'Sénior', img: '/media/plancha.jpg', alt: 'Segundo equipo sénior masculino del CV Oviedo', liga: 'Segunda División · FVBPA' },
  { slug: 'junior-masculino', nombre: 'Júnior Masculino', categoria: 'Sub-19', img: '/media/equipos/junior-masculino.jpg', alt: 'Equipo júnior masculino del CV Oviedo', liga: 'Liga Asturiana' },
  { slug: 'juvenil-femenino', nombre: 'Juvenil Femenino', categoria: 'Sub-17', img: '/media/equipos/juvenil-femenino.jpg', alt: 'Equipo juvenil femenino del CV Oviedo', liga: 'Liga Asturiana' },
  { slug: 'cadete-masculino', nombre: 'Cadete Masculino', categoria: 'Sub-15', img: '/media/equipos/cadete-masculino.jpg', alt: 'Equipo cadete masculino del CV Oviedo', liga: 'Liga Asturiana' },
  { slug: 'cadete-femenino-a', nombre: 'Cadete Femenino A', categoria: 'Sub-15', img: '/media/equipos/cadete-femenino-a.jpg', alt: 'Equipo cadete femenino A del CV Oviedo', liga: 'Liga Asturiana' },
  { slug: 'cadete-femenino-b', nombre: 'Cadete Femenino B', categoria: 'Sub-15', img: '/media/equipos/cadete-femenino-b.jpg', alt: 'Equipo cadete femenino B del CV Oviedo', liga: 'Liga Asturiana' },
  { slug: 'infantil-masculino', nombre: 'Infantil Masculino', categoria: 'Sub-13', img: '/media/equipos/infantil-masculino.jpg', alt: 'Equipo infantil masculino del CV Oviedo', liga: 'Liga Asturiana' },
  { slug: 'infantil-femenino-a', nombre: 'Infantil Femenino A', categoria: 'Sub-13', img: '/media/equipos/infantil-femenino-a.jpg', alt: 'Equipo infantil femenino A del CV Oviedo', liga: 'Liga Asturiana' },
  { slug: 'infantil-femenino-b', nombre: 'Infantil Femenino B', categoria: 'Sub-13', img: '/media/equipos/infantil-femenino-b.jpg', alt: 'Equipo infantil femenino B del CV Oviedo', liga: 'Liga Asturiana' },
  // Alevín NO lleva A/B como cadete e infantil (corregido el 07-08-2026): son
  // dos equipos distintos, el federado y el que no compite en liga. El segundo
  // no tiene foto propia todavía: se reutiliza la del alevín hasta que la haya.
  { slug: 'alevin-federado', nombre: 'Alevín Federado', categoria: 'Sub-11', img: '/media/equipos/alevin.jpg', alt: 'Equipo alevín federado del CV Oviedo', liga: 'Liga Asturiana' },
  { slug: 'alevin', nombre: 'Alevín', categoria: 'Sub-11', img: '/media/equipos/alevin.jpg', alt: 'Equipo alevín del CV Oviedo', liga: 'Liga Asturiana' },
]

// ---------------------------------------------------------------------------
// Fichas de los equipos de cantera
//
// No se escriben a mano: se generan de `equiposCantera` para que un equipo
// nuevo tenga ficha con solo añadirlo a la lista de arriba.
//
// La plantilla y el cuerpo técnico salen con los mismos huecos de muestra que
// los dos equipos nacionales —dorsal, "Nombre Apellido" y posición, con la
// interrogación en el sitio de la foto—: así se ve la ficha montada aunque no
// tengamos los nombres. Cuando lleguen los reales se sustituyen aquí.
// ---------------------------------------------------------------------------

// Dorsales con los huecos de siempre (falta el 4, el 6…), como en el masculino:
// una lista del 1 al 12 seguida canta a relleno.
const DORSALES_MUESTRA = [1, 2, 3, 5, 8, 10, 11, 13, 14, 15, 17, 21]

// La posición se escribe distinto según el equipo. Cuando el nombre no dice el
// género —Alevín, por ejemplo, que es mixto— se usa la forma con barra, que es
// la misma que ya emplea el desplegable del formulario de inscripción.
const POSICIONES = {
  m: ['Colocador', 'Receptor', 'Central', 'Opuesto', 'Líbero'],
  f: ['Colocadora', 'Receptora', 'Central', 'Opuesta', 'Líbero'],
  x: ['Colocador/a', 'Receptor/a', 'Central', 'Opuesto/a', 'Líbero'],
}

// Reparto de posiciones a lo largo del equipo: dos colocadores, tres receptores,
// tres centrales, dos opuestos y dos líberos. Es el reparto normal de un equipo
// de voleibol, no un orden al azar.
const REPARTO = [0, 1, 2, 3, 4, 1, 2, 0, 3, 1, 2, 4]

const generoDe = (nombre) => {
  if (nombre.includes('Femenino')) return 'f'
  if (nombre.includes('Masculino')) return 'm'
  return 'x'
}

const plantillaMuestra = (nombre) => {
  const posiciones = POSICIONES[generoDe(nombre)]
  return DORSALES_MUESTRA.map((numero, i) => ({
    numero,
    nombre: 'Nombre Apellido',
    posicion: posiciones[REPARTO[i]],
  }))
}

const TECNICOS = {
  m: [
    { iniciales: 'EC', nombre: 'Nombre del entrenador', rol: 'Primer entrenador' },
    { iniciales: 'SG', nombre: 'Nombre del ayudante', rol: 'Segundo entrenador' },
  ],
  f: [
    { iniciales: 'EC', nombre: 'Nombre de la entrenadora', rol: 'Primera entrenadora' },
    { iniciales: 'SG', nombre: 'Nombre de la ayudante', rol: 'Segunda entrenadora' },
  ],
  x: [
    { iniciales: 'EC', nombre: 'Nombre del entrenador/a', rol: 'Primer entrenador/a' },
    { iniciales: 'SG', nombre: 'Nombre del ayudante', rol: 'Segundo entrenador/a' },
  ],
}

const fichaDeCantera = (eq) => ({
  slug: eq.slug,
  nombre: eq.nombre,
  crumb: eq.nombre,
  // migas de pan: estos equipos cuelgan de Cantera, no de la portada
  padre: { to: '/cantera', label: 'Cantera' },
  kicker: `${eq.liga} · ${eq.categoria} · Temporada 2026/27`,
  sub: `Equipo ${eq.categoria.toLowerCase()} del club. Entrena y compite en el ${club.sedeCorta}, en ${club.localidad}.`,
  // La cabecera no es la misma foto que la tarjeta: es una versión apaisada que
  // genera `scripts/cabeceras.ps1` recortando la franja donde está la gente y
  // ensanchándola con los bordes fundidos en el azul de la banda. Puesta la
  // foto original, que es casi cuadrada, la banda la ampliaba tanto que solo
  // se veían las caras. Las fotos de acción —el Sénior Masculino todavía usa
  // una— ya son apaisadas y entran bien tal cual.
  headerImg: eq.img.startsWith('/media/equipos/')
    ? eq.img.replace(/\.jpg$/, '-cabecera.jpg')
    : eq.img,
  // Tirando hacia arriba: la banda mantiene el alto y crece de ancho, así que
  // cuanto mayor es la pantalla más recorta por arriba y por abajo. Con un 12%
  // las cabezas de la fila de atrás siguen dentro incluso en un monitor ancho.
  headerFoco: 'center 12%',
  datos: [
    { label: 'Competición', valor: eq.liga },
    { label: 'Categoría', valor: eq.categoria },
    { label: 'Sede', valor: club.sedeCorta },
    { label: 'Temporada', valor: '2026/27' },
  ],
  squad: plantillaMuestra(eq.nombre),
  staff: TECNICOS[generoDe(eq.nombre)],
  join: {
    title: `¿Quieres jugar en el ${eq.nombre}?`,
    text: 'Rellena el formulario de inscripción y te decimos qué día y a qué hora entrena el grupo.',
  },
})

export const equipos = {
  ...fichasNacionales,
  ...Object.fromEntries(equiposCantera.map((eq) => [eq.slug, fichaDeCantera(eq)])),
}

// DATOS DE MUESTRA — cifras de la sección Cantera
export const cifrasCantera = [
  { n: '9', label: 'Equipos federados' },
  { n: '240', label: 'Deportistas' },
  { n: '8-19', label: 'Años' },
  // sustituye a «1 · Semana de prueba» (2026-07-29): fundado en 1991, dato real
  { n: '35', label: 'Años de club' },
]

// ---------------------------------------------------------------------------
// Cantera: dónde, cuándo y cuánto.
//
// SIN USAR desde el 02-08-2026: la página de Cantera se dejó únicamente con los
// equipos, así que ni estas listas ni `canteraSedes`, `canteraFacts` o
// `cifrasCantera` se pintan en ningún sitio. Se conservan porque son la forma
// que tendrían los datos el día que la sección vuelva; si se decide que no
// vuelve, se pueden borrar sin tocar nada más.
//
// Formato de cada uno:
//   canteraHorarios: { categoria: 'Alevín', dias: 'Martes y jueves',
//                      hora: '17:30 – 19:00', sede: 'Pol. José Manuel Fuente' }
//   canteraCuotas:   { concepto: 'Cuota anual', importe: '250 €',
//                      detalle: 'Incluye ficha federativa y equipación' }
// ---------------------------------------------------------------------------
export const canteraHorarios = []
export const canteraCuotas = []

// Lo que sí sabemos seguro y no depende de nadie
export const canteraSedes = [
  {
    nombre: 'Polideportivo José Manuel Fuente',
    direccion: 'Colloto, Oviedo',
    detalle: 'Pista homologada para competición nacional. Aquí entrenan y compiten los trece equipos del club.',
  },
]

export const canteraFacts = [
  { label: 'Dónde', valor: 'Pol. José Manuel Fuente, Colloto, Oviedo' },
  { label: 'Cuándo', valor: 'Tardes, entre semana' },
  { label: 'Competición', valor: 'Liga Asturiana (FVPA)' },
  { label: 'Temporada', valor: 'Octubre – mayo' },
  // no repetir aquí las edades: ya salen en la fila de cifras de arriba
  { label: 'Inscripción', valor: 'Abierta todo el año' },
  { label: 'Cuota', valor: 'Por confirmar' },
]

// ---------------------------------------------------------------------------
// Formulario de inscripción: el Google Form del club (02-08-2026).
//
// La web solo ENLAZA al formulario, no lo incrusta. A propósito: hoy el
// formulario pide iniciar sesión en Google, y una pantalla de login de Google
// dentro de un <iframe> no funciona —Google lo bloquea—, así que incrustarlo
// dejaría la página muerta. Si algún día se abre a cualquiera sin cuenta, se
// puede incrustar sin tocar nada más que la plantilla de Inscripciones.
//
// Poniendo esto a null vuelve el formulario propio de la web, que sigue
// entero y manda el correo con `api/inscripcion.js`.
// ---------------------------------------------------------------------------
export const formularioInscripcionUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLSd08Q58zffO-cBGtb6iNxANuPfB5QyQ1YQVxlNLjd5RJXHBPg/viewform'

// ---------------------------------------------------------------------------
// Preinscripción (08-08-2026).
//
// La inscripción NO está abierta todo el año: hay una ventana de preinscripción
// del 10 al 25 de agosto. Fuera de esa ventana la web no invita a rellenar el
// formulario, avisa de cuándo abre (o de que ya cerró) y deja el correo del club.
//
// Las fechas son las únicas dos líneas que hay que tocar cada temporada.
// ---------------------------------------------------------------------------
export const preinscripcion = {
  abre: '2026-08-10',
  cierra: '2026-08-25', // incluido: cuenta el día entero
  texto: 'del 10 al 25 de agosto',
  url: formularioInscripcionUrl,
}

/** 'antes' · 'abierta' · 'cerrada' — se calcula en cada carga, sin tocar nada. */
export function estadoPreinscripcion(hoy = new Date()) {
  const dia = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
  if (dia < preinscripcion.abre) return 'antes'
  if (dia > preinscripcion.cierra) return 'cerrada'
  return 'abierta'
}

/** Frase para las llamadas a inscripción repartidas por el sitio. */
export const textoPreinscripcion = {
  antes: `La preinscripción para la temporada 26/27 se abre ${preinscripcion.texto}. Desde los 8 años.`,
  abierta: `Preinscripción abierta para la temporada 26/27, ${preinscripcion.texto}. Desde los 8 años.`,
  cerrada: 'La preinscripción de la temporada 26/27 ya está cerrada. Escríbenos y te contamos si queda hueco.',
}

// Opciones del desplegable del formulario de inscripción. Son los nombres
// reales de los equipos: no se calcula la categoría por año de nacimiento
// porque las bandas de edad las fija la federación y las asigna el club.
export const opcionesInscripcion = [
  'No lo sé, que me lo digáis vosotros',
  'Superliga 2 Masculino',
  'Primera Nacional Femenina',
  // El Sénior Masculino NO es el de Superliga 2: es el equipo sénior de abajo,
  // la continuación natural de la cantera para los que salen del Júnior.
  'Sénior Masculino (segundo equipo)',
  ...equiposCantera.map((e) => `${e.nombre} (${e.categoria})`),
]

// Posiciones del voleibol, para quien ya juega. Es opcional a propósito: quien
// llega nuevo no tiene posición y la asigna el entrenador.
export const posicionesInscripcion = [
  'Todavía no lo sé / soy nuevo',
  'Colocador/a',
  'Opuesto/a',
  'Receptor/a-punta',
  'Central',
  'Líbero',
  'Indiferente, donde haga falta',
]

// ---------------------------------------------------------------------------
// Calendario general — DATOS DE MUESTRA
// ---------------------------------------------------------------------------
export const equiposFiltro = [
  'Todos los equipos',
  'Superliga 2 Masculino',
  'Primera Nacional Femenina',
  'Juvenil',
  'Cadete',
  'Infantil',
  'Alevín',
]

export const jornadas = [
  {
    id: 'j14',
    titulo: 'Próxima jornada · 26 y 27 de septiembre',
    partidos: [
      { id: 'p1', equipo: 'Superliga 2 Masculino', diaSemana: 'Sáb', dia: '26', mes: 'SEP', rival: 'CV Oviedo — CV Teide', detalle: 'Superliga 2 · Pol. José Manuel Fuente · 18:00', resultado: null, tipo: 'next', local: true, retransmite: true },
      { id: 'p2', equipo: 'Cadete', diaSemana: 'Sáb', dia: '26', mes: 'SEP', rival: 'CV Avilés — CV Oviedo', detalle: 'Liga Asturiana · Pabellón Quirinal · 11:00', resultado: null, tipo: 'next', local: false, retransmite: false },
      { id: 'p3', equipo: 'Primera Nacional Femenina', diaSemana: 'Dom', dia: '27', mes: 'SEP', rival: 'CV Oviedo — CV Gijón', detalle: 'Primera Nacional · Pol. José Manuel Fuente · 12:00', resultado: null, tipo: 'next', local: true, retransmite: true },
      { id: 'p4', equipo: 'Infantil', diaSemana: 'Dom', dia: '27', mes: 'SEP', rival: 'CV Oviedo — CV Langreo', detalle: 'Liga Asturiana · Pol. José Manuel Fuente · 10:00', resultado: null, tipo: 'next', local: true, retransmite: false },
    ],
  },
  {
    id: 'j13',
    titulo: 'Jornada anterior · 19 y 20 de septiembre',
    partidos: [
      { id: 'p5', equipo: 'Superliga 2 Masculino', diaSemana: 'Sáb', dia: '19', mes: 'SEP', rival: 'CV Gijón — CV Oviedo', detalle: 'Superliga 2 · Pabellón La Arena', resultado: '1–3', tipo: 'w', local: false, retransmite: false },
      { id: 'p6', equipo: 'Juvenil', diaSemana: 'Sáb', dia: '19', mes: 'SEP', rival: 'CV Oviedo — CV Siero', detalle: 'Liga Asturiana · Pol. José Manuel Fuente', resultado: '3–0', tipo: 'w', local: true, retransmite: false },
      { id: 'p7', equipo: 'Primera Nacional Femenina', diaSemana: 'Dom', dia: '20', mes: 'SEP', rival: 'CV Santander — CV Oviedo', detalle: 'Primera Nacional · Pabellón La Albericia', resultado: '3–2', tipo: 'l', local: false, retransmite: false },
      { id: 'p8', equipo: 'Cadete', diaSemana: 'Dom', dia: '20', mes: 'SEP', rival: 'CV Oviedo — CV Mieres', detalle: 'Liga Asturiana · Pol. José Manuel Fuente', resultado: '3–1', tipo: 'w', local: true, retransmite: false },
    ],
  },
  {
    id: 'j12',
    titulo: 'Jornada 12 · 12 y 13 de septiembre',
    partidos: [
      { id: 'p9', equipo: 'Superliga 2 Masculino', diaSemana: 'Sáb', dia: '12', mes: 'SEP', rival: 'CV Oviedo — CV Santander', detalle: 'Superliga 2 · Pol. José Manuel Fuente', resultado: '3–0', tipo: 'w', local: true, retransmite: false },
      { id: 'p10', equipo: 'Primera Nacional Femenina', diaSemana: 'Dom', dia: '13', mes: 'SEP', rival: 'CV Oviedo — CV Valladolid', detalle: 'Primera Nacional · Pol. José Manuel Fuente', resultado: '3–1', tipo: 'w', local: true, retransmite: false },
    ],
  },
]

// ---------------------------------------------------------------------------
// Identidad de cada competición.
//
// Los colores NO son inventados: salen del logotipo oficial de cada liga en la
// web de la Real Federación Española de Voleibol (rfevb.com, hoy esvoley.es).
// La federación pinta de rojo #dd0a16 todas las competiciones nacionales
// masculinas y de ámbar #ffad00 las femeninas:
//   · superliga-masculina-2-voleibol.svg     → .cls-3 { fill: #dd0a16 }
//   · primera-nacional-femenina-voleibol.svg → .cls-3 { fill: #ffad00 }
// La cantera juega la Liga Asturiana (FVPA), que no tiene identidad propia,
// así que se queda con el azul del club.
//
// `sobre` es el color de texto que va ENCIMA del color de liga. Va explícito
// porque el ámbar no admite texto blanco: no llega al contraste mínimo.
// ---------------------------------------------------------------------------
// `nacional` marca las dos competiciones con identidad propia de la RFEVB. Solo
// esas dos tiñen el botón del filtro; las de cantera se quedan con el azul
// marino de siempre al pulsarlas (decisión de Diego, 2026-07-29).
//
// Tres usos distintos del color, no intercambiables:
//   color → relleno macizo        · sobre → texto ENCIMA de ese relleno
//   tinte → fondo suave           · tinta → texto del color de la liga SOBRE BLANCO
// `tinta` existe porque ni el ámbar ni el rojo puro se leen bien como texto
// fino sobre blanco: van una pizca más oscuros.
export const competiciones = {
  'Superliga 2 Masculino': {
    liga: 'Superliga 2', grupo: 'Grupo B', ente: 'RFEVB', nacional: true,
    color: '#dd0a16', sobre: '#fff', tinte: '#fdeaeb', tinta: '#c00812',
  },
  'Primera Nacional Femenina': {
    liga: 'Primera Nacional', grupo: 'Grupo A', ente: 'RFEVB', nacional: true,
    color: '#ffad00', sobre: '#3d2a00', tinte: '#fff4dd', tinta: '#9a6600',
  },
  Juvenil: { liga: 'Liga Asturiana', grupo: 'Sub-17', ente: 'FVPA', color: '#1560bd', sobre: '#fff', tinte: '#eaf2fb' },
  Cadete: { liga: 'Liga Asturiana', grupo: 'Sub-15', ente: 'FVPA', color: '#1560bd', sobre: '#fff', tinte: '#eaf2fb' },
  Infantil: { liga: 'Liga Asturiana', grupo: 'Sub-13', ente: 'FVPA', color: '#1560bd', sobre: '#fff', tinte: '#eaf2fb' },
  Alevín: { liga: 'Liga Asturiana', grupo: 'Sub-11', ente: 'FVPA', color: '#1560bd', sobre: '#fff', tinte: '#eaf2fb' },
}

// Clasificación por competición: la clave es la misma que la del filtro y la
// del campo `equipo` de cada partido, para que al cambiar de categoría la
// tabla cambie con ella. DATOS DE MUESTRA.
export const clasificaciones = {
  'Superliga 2 Masculino': [
    { pos: 1, equipo: 'CV Teide', pj: 13, pts: 34, yo: false },
    { pos: 2, equipo: 'CV Santander', pj: 13, pts: 31, yo: false },
    { pos: 3, equipo: 'CV Valladolid', pj: 13, pts: 29, yo: false },
    { pos: 4, equipo: 'CV Oviedo', pj: 13, pts: 28, yo: true },
    { pos: 5, equipo: 'CV Gijón', pj: 13, pts: 24, yo: false },
    { pos: 6, equipo: 'CV León', pj: 13, pts: 21, yo: false },
    { pos: 7, equipo: 'CV Burgos', pj: 13, pts: 17, yo: false },
    { pos: 8, equipo: 'CV Palencia', pj: 13, pts: 12, yo: false },
  ],
  'Primera Nacional Femenina': [
    { pos: 1, equipo: 'CV Valladolid', pj: 13, pts: 33, yo: false },
    { pos: 2, equipo: 'CV Oviedo', pj: 13, pts: 30, yo: true },
    { pos: 3, equipo: 'CV Santander', pj: 13, pts: 28, yo: false },
    { pos: 4, equipo: 'CV Gijón', pj: 13, pts: 25, yo: false },
    { pos: 5, equipo: 'CV Palencia', pj: 13, pts: 22, yo: false },
    { pos: 6, equipo: 'CV León', pj: 13, pts: 18, yo: false },
    { pos: 7, equipo: 'CV Burgos', pj: 13, pts: 14, yo: false },
    { pos: 8, equipo: 'CV Salamanca', pj: 13, pts: 10, yo: false },
  ],
  Juvenil: [
    { pos: 1, equipo: 'CV Oviedo', pj: 11, pts: 29, yo: true },
    { pos: 2, equipo: 'Grupo Covadonga', pj: 11, pts: 26, yo: false },
    { pos: 3, equipo: 'CV Siero', pj: 11, pts: 22, yo: false },
    { pos: 4, equipo: 'CV Avilés', pj: 11, pts: 18, yo: false },
    { pos: 5, equipo: 'CV Gijón', pj: 11, pts: 14, yo: false },
    { pos: 6, equipo: 'CV Langreo', pj: 11, pts: 9, yo: false },
  ],
  Cadete: [
    { pos: 1, equipo: 'CV Avilés', pj: 12, pts: 31, yo: false },
    { pos: 2, equipo: 'CV Oviedo', pj: 12, pts: 27, yo: true },
    { pos: 3, equipo: 'CV Mieres', pj: 12, pts: 24, yo: false },
    { pos: 4, equipo: 'Grupo Covadonga', pj: 12, pts: 20, yo: false },
    { pos: 5, equipo: 'CV Siero', pj: 12, pts: 15, yo: false },
    { pos: 6, equipo: 'CV Langreo', pj: 12, pts: 11, yo: false },
  ],
  Infantil: [
    { pos: 1, equipo: 'CV Oviedo', pj: 10, pts: 26, yo: true },
    { pos: 2, equipo: 'CV Langreo', pj: 10, pts: 23, yo: false },
    { pos: 3, equipo: 'CV Gijón', pj: 10, pts: 19, yo: false },
    { pos: 4, equipo: 'CV Avilés', pj: 10, pts: 15, yo: false },
    { pos: 5, equipo: 'CV Mieres', pj: 10, pts: 10, yo: false },
  ],
  Alevín: [
    { pos: 1, equipo: 'Grupo Covadonga', pj: 8, pts: 21, yo: false },
    { pos: 2, equipo: 'CV Oviedo', pj: 8, pts: 19, yo: true },
    { pos: 3, equipo: 'CV Siero', pj: 8, pts: 14, yo: false },
    { pos: 4, equipo: 'CV Avilés', pj: 8, pts: 11, yo: false },
    { pos: 5, equipo: 'CV Gijón', pj: 8, pts: 7, yo: false },
  ],
}

// DATOS DE MUESTRA — retransmisiones (portada, equipo, calendario)
export const retransmisiones = [
  { titulo: 'Masculino — CV Teide', detalle: 'YouTube · Sáb 26 sep, 18:00' },
  { titulo: 'Femenino — CV Gijón', detalle: 'YouTube · Dom 27 sep, 12:00' },
  { titulo: 'Resumen jornada anterior', detalle: 'YouTube · Ya disponible' },
]

// ---------------------------------------------------------------------------
// Noticias — DATOS DE MUESTRA
// ---------------------------------------------------------------------------
export const noticias = [
  {
    id: 'n1',
    destacada: true,
    categoria: 'Superliga 2 Masculino',
    fecha: '12 sep 2026',
    titulo: 'Arranca la pretemporada con doble sesión',
    resumen: 'El grupo se incorpora al completo tras las vacaciones y encara seis semanas de preparación antes del inicio de la Superliga 2.',
    // NO puede ser hero-remate.jpg: es la foto de fondo de la propia página de
    // noticias y salía repetida justo debajo de sí misma. Tampoco fotos de
    // equipo: esas van solo en el apartado de equipos.
    img: '/media/defensa.jpg',
  },
  {
    id: 'n2',
    categoria: 'Cantera',
    fecha: '10 ago 2026',
    titulo: 'Abierta la preinscripción para la 26/27',
    resumen: 'Desde alevín hasta juvenil. El plazo es del 10 al 25 de agosto y el formulario está en la web.',
    img: '/media/bloqueo.jpg',
  },
  {
    id: 'n3',
    categoria: 'Primera Nacional Femenina',
    fecha: '2 sep 2026',
    titulo: 'Fichaje para la zona de ataque',
    resumen: 'El equipo femenino refuerza la plantilla de cara a una temporada con el objetivo puesto en el ascenso.',
    img: '/media/celebracion.jpg',
  },
  {
    id: 'n4',
    categoria: 'Club',
    fecha: '28 ago 2026',
    titulo: 'Nuevo acuerdo de patrocinio con VBStats',
    resumen: 'El club incorpora estadísticas en tiempo real a todos sus partidos de competición nacional.',
    img: '/media/pista-azul.jpg',
  },
  {
    id: 'n5',
    categoria: 'Superliga 2 Masculino',
    fecha: '20 ago 2026',
    titulo: 'Presentación de la plantilla 26/27',
    resumen: 'El primer equipo masculino se presentó ante la afición con un entrenamiento abierto en el José Manuel Fuente.',
    img: '/media/hero-saque.jpg',
  },
  {
    id: 'n6',
    categoria: 'Cantera',
    fecha: '15 ago 2026',
    titulo: 'Vuelven los entrenamientos de tecnificación',
    resumen: 'Un mes de trabajo técnico para los equipos de cadete e infantil antes del arranque liguero.',
    img: '/media/recepcion.jpg',
  },
  {
    id: 'n7',
    categoria: 'Club',
    fecha: '3 ago 2026',
    titulo: 'El club supera los 6.700 seguidores en redes',
    resumen: 'La comunidad del CV Oviedo sigue creciendo temporada tras temporada.',
    img: '/media/accion-vert.jpg',
  },
  {
    id: 'n8',
    categoria: 'Primera Nacional Femenina',
    fecha: '22 jul 2026',
    titulo: 'Pretemporada femenina: primer amistoso',
    resumen: 'El equipo femenino debuta en pretemporada con un amistoso ante el CV Siero.',
    img: '/media/celebracion-manos.jpg',
  },
]

// ---------------------------------------------------------------------------
// Quiénes somos — hitos CONFIRMADOS POR EL CLUB (2026-07-29). No son datos de
// muestra: no cambiarlos sin preguntar. El ascenso a Superliga 2 es de 2026,
// no de 2021 como decía antes.
//
// Los cinco deportivos los eligió Diego uno a uno (07-08-2026): los tres del
// Campeonato de España de vóley playa y los tres ascensos. NO es "todo lo de
// ámbito nacional" —de ser así entrarían también la clasificación del Juvenil
// de 2022/23 y la participación del Infantil Femenino de 2016, que se quedan
// solo en el palmarés—. Si se añade uno nuevo, preguntar antes.
//
// El orden es cronológico y la página lo pinta como un camino en zigzag: al
// añadir o quitar un hito cambia dónde gira el camino. Con nueve salen tres
// filas de tres, que es como está medido.
//
// Los textos van a UNA frase. La página los pinta en una columna estrecha
// dentro del camino; dos frases desbordan la fila y descuadran el zigzag.
// ---------------------------------------------------------------------------
export const hitos = [
  { anio: '1991', texto: 'Nace el club, con un único equipo sénior masculino.' },
  { anio: '1998', texto: 'Se crea la sección femenina.' },
  { anio: '2006', texto: 'El club se muda al Polideportivo José Manuel Fuente, en Colloto, su sede desde entonces.' },
  { anio: '2014', texto: 'La cantera pasa a cubrir todas las categorías, de alevín a júnior.' },
  { anio: '2017', texto: 'El Infantil Masculino queda tercero de España en vóley playa.' },
  { anio: '2018', texto: 'El Cadete Femenino se proclama campeón de España de vóley playa, en Ézaro.' },
  { anio: '2019', texto: 'El Cadete Masculino gana el Campeonato de España de vóley playa por clubes, en Dumbría.' },
  { anio: '2022', texto: 'Doble ascenso: el sénior masculino sube a Primera Nacional y el femenino, a Superliga 2.' },
  { anio: '2026', texto: 'El sénior masculino asciende a Superliga 2.' },
]

// ---------------------------------------------------------------------------
// Palmarés del club.
//
// INCOMPLETO a propósito: el club va pasando los datos por tandas y falta buena
// parte. La sección lo dice en voz alta al final, para que no parezca que esto
// es todo lo que hay. Se van añadiendo entradas aquí y la página se ordena y se
// pinta sola.
//
// OJO con «Sénior Masculino»: aquí es SIEMPRE el primer equipo (el de Superliga
// 2), no el segundo sénior que sale en la página de Cantera con ese mismo
// nombre. Lo aclaró Adrián el 03-08-2026.
//
// `ambito` decide el color de la etiqueta: 'España' para lo estatal y
// 'Asturias' para lo autonómico. `destacado` reserva el oro para los títulos
// de campeón de España, que son los que de verdad mandan en un palmarés.
// ---------------------------------------------------------------------------
// No hace falta ordenarlas: la página las coloca sola de la más reciente a la
// más antigua. Al añadir una nueva, basta con pegarla donde sea.
export const palmares = [
  { temporada: '2026/27', equipo: 'Sénior Masculino', logro: 'Ascenso a Superliga 2', ambito: 'España' },
  {
    temporada: '2025/26',
    equipo: 'Infantil Masculino',
    disciplina: 'Vóley playa',
    logro: 'Campeón del Circuito Asturiano',
    ambito: 'Asturias',
  },
  {
    temporada: '2022/23',
    equipo: 'Juvenil Masculino',
    logro: 'Clasificación para el Campeonato de España',
    ambito: 'España',
  },
  { temporada: '2022', equipo: 'Sénior Femenino', logro: 'Ascenso a Superliga 2 Femenina', ambito: 'España' },
  { temporada: '2021/22', equipo: 'Sénior Masculino', logro: 'Ascenso a Primera Nacional', ambito: 'España' },
  { temporada: '2019/20', equipo: 'Cadete Femenino', logro: 'Subcampeón de Asturias', ambito: 'Asturias' },
  {
    temporada: '2019',
    equipo: 'Cadete Masculino',
    disciplina: 'Vóley playa',
    logro: 'Campeón de España por clubes',
    lugar: 'Dumbría (A Coruña)',
    ambito: 'España',
    destacado: true,
  },
  {
    temporada: '2018',
    equipo: 'Cadete Femenino',
    disciplina: 'Vóley playa',
    logro: 'Campeonas de España',
    lugar: 'Ézaro (A Coruña)',
    ambito: 'España',
    destacado: true,
  },
  {
    // Era el masculino; lo confirmó Diego el 07-08-2026.
    temporada: '2017',
    equipo: 'Infantil Masculino',
    disciplina: 'Vóley playa',
    logro: 'Terceros de España',
    ambito: 'España',
  },
  {
    // PENDIENTE: falta el puesto. Se deja como participación porque es lo único
    // que consta; si quedaron en un puesto concreto, se cambia el `logro`.
    temporada: '2016',
    equipo: 'Infantil Femenino',
    logro: 'Participación en el Campeonato de España por clubes',
    lugar: 'Lorca (Murcia)',
    ambito: 'España',
  },
]

export const valores = [
  { titulo: 'Formación', texto: 'El deporte como escuela: disciplina, esfuerzo y trabajo en equipo desde alevín.' },
  { titulo: 'Cantera propia', texto: 'La mayoría de jugadores del primer equipo se han formado en el club.' },
  { titulo: 'Un solo club', texto: 'Mismo pabellón y misma camiseta para los 13 equipos, del alevín al sénior.' },
  { titulo: 'Comunidad', texto: 'Más de 240 familias y un proyecto que crece cada temporada.' },
]

// ---------------------------------------------------------------------------
// Patrocinadores
// ---------------------------------------------------------------------------
// `alcanceClub` lo usa /patrocinar (la página que SÍ busca patrocinadores).
// /patrocinadores solo enseña las marcas que ya están.
// OJO: los seguidores en redes van siempre como "+6.700", sin la cifra exacta
// el total incluye los de X, que no aparece enlazada en la web.
// PENDIENTE DE CONFIRMAR con el club: la cifra de partidos retransmitidos.
export const alcanceClub = [
  { n: '+6.700', label: 'Seguidores en redes' },
  { n: '240', label: 'Familias en el club' },
  { n: '13', label: 'Equipos federados' },
  { n: '20+', label: 'Partidos retransmitidos al año' },
]

// Página /patrocinar. Sin precios y sin niveles a propósito (decisión de Diego,
// 2026-07-29): la página explica qué es el club y qué se le puede ofrecer a una
// marca, y lo concreto se habla por teléfono o por email.
export const porQuePatrocinar = [
  {
    titulo: 'Un club de ciudad, no una marca lejana',
    texto: 'Detrás de cada canterano hay una familia de Oviedo. Patrocinar al club es aparecer en la vida diaria de 240 familias, no en un anuncio que se pasa de largo.',
  },
  {
    titulo: 'Voleibol de categoría nacional',
    texto: 'El sénior masculino compite en Superliga 2 y el femenino en Primera Nacional. Los partidos traen a Colloto equipos de toda España y prensa deportiva asturiana.',
  },
  {
    titulo: 'Visibilidad todo el año',
    texto: 'La temporada va de octubre a mayo, con partido casi todos los fines de semana y entrenamientos cinco tardes por semana. No es un patrocinio de un evento suelto.',
  },
  {
    titulo: 'Cada acuerdo se habla',
    texto: 'No trabajamos con paquetes cerrados. Nos cuentas qué buscas y qué presupuesto manejas, y montamos la contrapartida que tenga sentido para tu marca.',
  },
]

// Contrapartidas posibles. Es una lista de "qué se puede hacer", NO un paquete
// cerrado: nada de precios ni de niveles.
export const contrapartidas = [
  'Logo en la equipación de juego o de entrenamiento',
  'Banner en el pabellón José Manuel Fuente, en todos los partidos de casa',
  'Menciones en las retransmisiones de YouTube',
  'Publicaciones en las redes del club',
  'Tu marca en la página de patrocinadores de esta web, con ficha propia',
  'Presencia en los torneos y eventos que organiza el club',
]

// SIN USAR y DATOS DE MUESTRA. Ni /patrocinadores ni /patrocinar enseñan precios
// ni niveles (decisión de Diego). Se conserva por si algún día vuelve a hacer falta.
export const nivelesPatrocinio = [
  {
    nombre: 'Oro',
    precio: 'Precio por confirmar',
    incluye: [
      'Logo en la camiseta de partido de los 13 equipos',
      'Banner propio en el pabellón José Manuel Fuente',
      'Mención en todas las retransmisiones de YouTube',
      'Publicación mensual dedicada en redes sociales',
      'Enlace destacado en la web del club',
    ],
  },
  {
    nombre: 'Plata',
    precio: 'Precio por confirmar',
    incluye: [
      'Logo en la equipación de entrenamiento',
      'Banner compartido en el pabellón',
      'Mención en retransmisiones de los equipos nacionales',
      'Publicación trimestral en redes sociales',
      'Enlace en la web del club',
    ],
  },
  {
    nombre: 'Bronce',
    precio: 'Precio por confirmar',
    incluye: [
      'Logo en la página de patrocinadores de la web',
      'Mención en la memoria anual del club',
      'Publicación de bienvenida en redes sociales',
    ],
  },
]

// Patrocinadores del club. El copy NO es inventado: sale de la propia web de
// Bluedebug (`src/app/layout.tsx`) y de su ficha de producto de VBStats
// (`src/data/apps.ts`). Los colores son los de cada marca, y se usan solo para
// el brillo del aro al pasar por encima; `glow` es ese mismo color en rgba.
// Los logos los mandó el club el 08-08-2026 y están procesados en
// `public/media/patrocinadores/`: fondo blanco quitado y márgenes recortados,
// para que llenen el círculo de la ficha y la banda de portada.
//
// `web` es la página propia de cada marca (se abre en pestaña nueva). Los que
// tienen `parrafos` llevan además ficha en /patrocinadores/:slug; los que no,
// enlazan directamente fuera. PENDIENTE: Reformas Precisión y La Sidrería de
// Güelita no tienen web conocida, así que su logo se pinta sin enlace hasta que
// el club pase la dirección.
export const patrocinadoresActuales = [
  {
    slug: 'geff',
    nombre: 'GEFF',
    logo: '/media/patrocinadores/geff.png',
    tagline: 'Equipaciones deportivas personalizadas',
    web: 'https://geffsport.com/',
    webTexto: 'geffsport.com',
    color: '#111111',
    glow: 'rgba(17,17,17,.18)',
    descripcion: 'Fabricante de equipaciones deportivas personalizadas por sublimación.',
  },
  {
    slug: 'imq-asturias',
    nombre: 'IMQ Asturias',
    logo: '/media/patrocinadores/imq-asturias.png',
    tagline: 'El seguro de salud de Asturias',
    web: 'https://www.imqasturias.es/',
    webTexto: 'imqasturias.es',
    color: '#3aaa35',
    glow: 'rgba(58,170,53,.22)',
    descripcion: 'Seguros de salud con cuadro médico propio en Asturias.',
  },
  {
    slug: 'funerarias-reunidas',
    nombre: 'Funerarias Reunidas',
    logo: '/media/patrocinadores/funerarias-reunidas.png',
    tagline: 'Servicios funerarios en Asturias',
    web: 'https://funerariasreunidas.com/',
    webTexto: 'funerariasreunidas.com',
    color: '#1f4b3a',
    glow: 'rgba(31,75,58,.22)',
    descripcion: 'Servicios funerarios y tanatorios en Asturias.',
  },
  {
    slug: 'palacio-de-garana',
    nombre: 'Palacio de Garaña',
    logo: '/media/patrocinadores/palacio-de-garana.png',
    tagline: 'Hotel, camping y restaurante en Llanes',
    web: 'https://www.palaciodegarana.com/',
    webTexto: 'palaciodegarana.com',
    color: '#1c5f9e',
    glow: 'rgba(28,95,158,.22)',
    descripcion: 'Hotel, camping, restaurante y piscina bar en Garaña de Pría, Llanes.',
  },
  {
    slug: 'centro-fisan',
    nombre: 'Centro Fisan',
    logo: '/media/patrocinadores/centro-fisan.png',
    tagline: 'Fisioterapia y salud',
    web: 'https://centrofisan.es/',
    webTexto: 'centrofisan.es',
    color: '#2b9cd8',
    glow: 'rgba(43,156,216,.22)',
    descripcion: 'Centro de fisioterapia y salud: fisioterapia, entrenamiento personal y pilates.',
  },
  {
    slug: 'reformas-precision',
    nombre: 'Reformas Precisión',
    logo: '/media/patrocinadores/reformas-precision.png',
    tagline: 'Reformas y rehabilitación',
    color: '#2b3573',
    glow: 'rgba(43,53,115,.22)',
    descripcion: 'Empresa de reformas.',
  },
  {
    slug: 'sidreria-guelita',
    nombre: 'La Sidrería de Güelita',
    logo: '/media/patrocinadores/sidreria-guelita.png',
    tagline: 'Sidrería y cocina asturiana',
    color: '#b5651d',
    glow: 'rgba(181,101,29,.22)',
    descripcion: 'Sidrería de cocina asturiana.',
  },
  {
    slug: 'bluedebug',
    nombre: 'Bluedebug',
    logo: '/media/bluedebug-logo.png',
    tagline: 'Automatización y transformación digital',
    web: 'https://bluedebug.com',
    webTexto: 'bluedebug.com',
    color: '#0892d0',
    glow: 'rgba(8,146,208,.22)',
    descripcion: 'Estudio de desarrollo y automatización. Diseña y construye apps móviles y web a medida para empresas y clubes deportivos.',
    parrafos: [
      'Bluedebug es un estudio de desarrollo y automatización. Elimina tareas manuales y optimiza los procesos de sus clientes para que puedan centrarse en hacer crecer su negocio.',
      'Trabaja con pymes, startups y clubes deportivos, construyendo software a medida: aplicaciones móviles, web y automatizaciones internas. Del CV Oviedo es, además, quien mantiene esta web.',
    ],
  },
  {
    slug: 'vbstats',
    nombre: 'VBStats',
    logo: '/media/vbstats-logo.png',
    tagline: 'Estadísticas de voleibol en tiempo real',
    web: 'https://bluedebug.com/portfolio/vbstats',
    webTexto: 'bluedebug.com/portfolio/vbstats',
    color: '#e91e8c',
    glow: 'rgba(233,30,140,.22)',
    descripcion: 'App de estadísticas de voleibol en tiempo real. Registro por jugador y por set, con informes automáticos al acabar el partido.',
    parrafos: [
      'VBStats es una aplicación móvil que permite a entrenadores y cuerpos técnicos registrar y analizar estadísticas de partidos de voleibol en tiempo real. Cada acción —ataque, recepción, bloqueo, saque o defensa— se registra por jugador y por set, y genera informes automáticos al terminar el partido.',
      'La interfaz está pensada para usarse durante el juego con una sola mano, con botones grandes y respuesta táctil inmediata. Los datos se sincronizan en la nube y se pueden exportar para analizarlos después.',
    ],
  },
]

/** Solo tienen ficha propia en /patrocinadores/:slug los que traen texto escrito. */
export const tieneFicha = (marca) => Array.isArray(marca.parrafos) && marca.parrafos.length > 0

/**
 * A dónde lleva el logo de un patrocinador:
 *   - ficha interna, si tiene texto escrito
 *   - su propia web en pestaña nueva, si no
 *   - a ningún sitio, si aún no sabemos su web
 */
export function enlaceDePatrocinador(marca) {
  if (tieneFicha(marca)) return { to: `/patrocinadores/${marca.slug}` }
  if (marca.web) return { href: marca.web, target: '_blank', rel: 'noopener noreferrer' }
  return null
}

// ---------------------------------------------------------------------------
// Tienda — DATOS DE MUESTRA (precios de muestra)
//
// Las seis fotos son RENDERS generados con nano-banana, no fotos de producto de
// verdad. Los accesorios salen del escudo real (`media/escudo.png`); la ropa,
// de las fotos que hizo Diego de las prendas reales, en
// `material/01-fotos/tienda`. El guion que las genera es
// `content/content-bot/scripts/cvo-tienda.ts` — reejecutarlo si hay que
// retocarlas. Sustituirlas por fotos reales en cuanto existan.
//
// OJO con la camiseta: los patrocinadores institucionales salen mal escritos
// ('AYUNAMIENTO' en vez de 'AYUNTAMIENTO', y la línea del Principado ilegible).
// A tamaño de tarjeta no se lee, pero no vale para imprimir ni para ampliar.
// ---------------------------------------------------------------------------
// `img` es la foto de portada (packshot de estudio) y `galeria` las de ambiente
// de la ficha `/tienda/:slug`. Las tres de galería salen del propio packshot,
// así que el producto es el mismo en todas.
// ---------------------------------------------------------------------------
// La tienda está CERRADA hasta que estén cerrados productos y precios (reunión
// con Vitor, 30-07-2026). No se ha borrado nada: los productos, las fotos y la
// ficha de cada uno siguen aquí abajo y se reactivan poniendo esto en `true`.
// Mientras tanto /tienda enseña el cartel de «Próximamente» y las fichas
// sueltas (/tienda/lo-que-sea) devuelven a /tienda.
// ---------------------------------------------------------------------------
export const tiendaAbierta = false

export const productos = [
  {
    id: 'prod-1',
    slug: 'sudadera',
    nombre: 'Sudadera del club',
    categoria: 'Ropa',
    precio: '32 €',
    img: '/media/tienda/sudadera.jpg',
    resumen: 'Sudadera azul de cuello redondo con el "CV OVIEDO" al pecho.',
    descripcion: [
      'La sudadera de calle del club: felpa gruesa, cuello redondo y puños y bajo elásticos. El "CV OVIEDO" va estampado en blanco al pecho.',
      'Es la que llevan los equipos para ir y volver de los partidos, y la que más se ve en la grada del José Manuel Fuente.',
    ],
    detalles: ['Tallas de la S a la XXL', 'Felpa de algodón', 'Estampado serigrafiado'],
    galeria: ['/media/tienda/sudadera-1.jpg', '/media/tienda/sudadera-2.jpg', '/media/tienda/sudadera-3.jpg'],
  },
  {
    id: 'prod-2',
    slug: 'camiseta',
    nombre: 'Camiseta oficial',
    categoria: 'Ropa',
    precio: '24 €',
    img: '/media/tienda/camiseta.jpg',
    resumen: 'La camiseta de juego, con el escudo y los patrocinadores del club.',
    descripcion: [
      'La misma camiseta con la que juegan los equipos federados: tejido técnico ligero, azul y blanco, con el escudo al pecho y los patrocinadores del club.',
      'Se puede pedir con dorsal. Si lo quieres, dilo en el correo y te confirmamos plazo.',
    ],
    detalles: ['Tallas de la S a la XXL', 'Tejido técnico transpirable', 'Dorsal opcional'],
    galeria: ['/media/tienda/camiseta-1.jpg', '/media/tienda/camiseta-2.jpg', '/media/tienda/camiseta-3.jpg'],
  },
  {
    id: 'prod-3',
    slug: 'gorra',
    nombre: 'Gorra CVO',
    categoria: 'Accesorios',
    precio: '15 €',
    img: '/media/tienda/gorra.jpg',
    resumen: 'Gorra azul de seis paneles con el escudo bordado al frente.',
    descripcion: [
      'Gorra azul de seis paneles y visera curva, con el escudo del club bordado en el panel frontal.',
      'Talla única con cierre trasero regulable.',
    ],
    detalles: ['Talla única regulable', 'Escudo bordado', 'Visera curva'],
    galeria: ['/media/tienda/gorra-1.jpg', '/media/tienda/gorra-2.jpg', '/media/tienda/gorra-3.jpg'],
  },
  {
    id: 'prod-4',
    slug: 'botella',
    nombre: 'Botella de agua',
    categoria: 'Accesorios',
    precio: '9 €',
    img: '/media/tienda/botella.jpg',
    resumen: 'Botella de acero azul con tapón deportivo y el escudo del club.',
    descripcion: [
      'Botella de acero inoxidable con tapón deportivo, pensada para la bolsa de entrenamiento. El escudo va impreso en el centro.',
      'La que se ve en el banquillo todos los fines de semana.',
    ],
    detalles: ['Acero inoxidable', 'Tapón deportivo', 'Apta para lavavajillas'],
    galeria: ['/media/tienda/botella-1.jpg', '/media/tienda/botella-2.jpg', '/media/tienda/botella-3.jpg'],
  },
  {
    id: 'prod-5',
    slug: 'llavero',
    nombre: 'Llavero escudo',
    categoria: 'Accesorios',
    precio: '5 €',
    img: '/media/tienda/llavero.jpg',
    resumen: 'El escudo del club en metal esmaltado, con anilla y cadena.',
    descripcion: [
      'El escudo del club en metal esmaltado, de unos 4 cm, con anilla y cadena.',
      'El regalo fácil: cabe en cualquier sitio y lo lleva medio club en la mochila.',
    ],
    detalles: ['4 cm de diámetro', 'Metal esmaltado', 'Anilla y cadena'],
    galeria: ['/media/tienda/llavero-1.jpg', '/media/tienda/llavero-2.jpg', '/media/tienda/llavero-3.jpg'],
  },
  {
    id: 'prod-6',
    slug: 'bolsa',
    nombre: 'Bolsa de deporte',
    categoria: 'Accesorios',
    precio: '19 €',
    img: '/media/tienda/bolsa.jpg',
    resumen: 'Bolsa azul de viaje con bolsillo frontal y bandolera.',
    descripcion: [
      'Bolsa de deporte azul con vivos blancos, bolsillo frontal con cremallera, asas cortas y bandolera regulable.',
      'Entra una equipación completa, las rodilleras y las zapatillas.',
    ],
    detalles: ['Bolsillo frontal con cremallera', 'Bandolera regulable', 'Escudo estampado al lateral'],
    galeria: ['/media/tienda/bolsa-1.jpg', '/media/tienda/bolsa-2.jpg', '/media/tienda/bolsa-3.jpg'],
  },
]

export const categoriasTienda = ['Todos', 'Ropa', 'Accesorios']
