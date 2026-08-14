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
  // El de patrocinio es `patrocinadores@`, SIN "cvo" delante. Estuvo unos días
  // como `cvopatrocinadores@` por un malentendido y se corrigió el 13-08-2026.
  // Tiene que coincidir con el destino de `api/patrocinio.js`.
  email: 'info@clubvoleiboloviedo.com',
  emailPatrocinio: 'patrocinadores@clubvoleiboloviedo.com',
  // El teléfono del club NO se publica en la web (decisión del 03-08-2026): se
  // quitó del pie, de contacto, de los avisos de los formularios y del aviso
  // legal. Ojo: los campos "teléfono" de los formularios son otra cosa, ahí lo
  // escribe quien se apunta y siguen en su sitio.
  sede: 'Polideportivo José Manuel Fuente, Colloto, Oviedo',
  sedeCorta: 'Pol. José Manuel Fuente',
  localidad: 'Colloto, Oviedo',
  // Enlaces reales de las redes del club (13-08-2026). Antes eran '#'.
  //
  // Los pintan `Nav.jsx` y `Footer.jsx` recorriendo este objeto: lo que no esté
  // aquí no sale. YouTube se quitó porque el club no ha dado su canal; para
  // devolverlo basta con añadir `youtube: 'https://…'` y aparece solo en los
  // dos sitios, con su icono.
  redes: {
    instagram: 'https://www.instagram.com/clubvoleiboloviedo/',
    facebook: 'https://www.facebook.com/voleiboloviedo?locale=es_ES',
  },
}

// DATOS DE MUESTRA — cifras de portada
// `sube: true` hace que la cifra se cuente desde cero al entrar en pantalla
// (ver Stats.jsx). Solo los seguidores: el año de fundación contando hacia
// arriba parecería un contador roto, no un dato.
export const cifrasClub = [
  { n: '1991', label: 'Año de fundación' },
  { n: '240', label: 'Canteranos' },
  { n: '13', label: 'Equipos federados' },
  { n: '+6.700', label: 'Seguidores en redes', sube: true },
]

/**
 * La tercera tarjeta de portada NO es un equipo: es la puerta a /cantera. Por
 * eso no se edita desde el panel y vive aquí aparte — el panel gestiona equipos,
 * y esto es un acceso a una sección.
 */
export const tarjetaCantera = {
  slug: 'cantera',
  nombre: 'Cantera',
  categoria: 'Base y formación',
  // Ni cadete-femenino-a.jpg ni cantera.jpg: son la misma foto del Cadete
  // Femenino A con dos recortes, y ese equipo ya sale en su propia ficha. El
  // acceso a la cantera es de todos, así que va una de juego.
  img: '/media/celebracion.jpg',
  alt: 'Equipos de cantera del CV Oviedo',
  resumen: '11 equipos · 240 deportistas',
  href: '/cantera',
}

// ---------------------------------------------------------------------------
// Equipos principales (los accesos de portada)
//
// Esta lista es SEMILLA: manda mientras el panel no haya guardado equipos. En
// cuanto lo hace, la portada pinta los que tengan `enPortada` en `equiposSemilla`
// (más abajo), que es lo mismo pero editable.
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
  tarjetaCantera,
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
  { slug: 'senior-masculino', nombre: 'Sénior Masculino', categoria: 'Sénior', img: '/media/colocacion.jpg', alt: 'Segundo equipo sénior masculino del CV Oviedo', liga: 'Segunda División · FVBPA' },
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
  // Comparte foto con el Alevín Federado a propósito (Diego, 11-08-2026): son
  // los mismos críos, no hay foto propia y prefiere esa a una de juego. Es la
  // única repetición consentida en toda la web.
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
  // Ese 12% vale para las fotos de grupo; en una de juego deja la banda en el
  // techo del pabellón, así que esas se encuadran por el centro.
  headerFoco: eq.img.startsWith('/media/equipos/') ? 'center 12%' : 'center 45%',
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

// ---------------------------------------------------------------------------
// La lista de equipos que edita el panel.
//
// Un equipo es UN objeto con todo dentro: lo que sale en la tarjeta (nombre,
// foto, categoría) y lo que sale en su ficha (cabecera, datos, plantilla,
// cuerpo técnico). Antes estaba repartido en tres sitios —`equiposDestacados`
// para la portada, `equiposCantera` para las tarjetas y `fichasNacionales` /
// `fichaDeCantera` para las fichas—, y para dar de alta un equipo desde el panel
// hay que poder tocarlo todo desde un único formulario.
//
// Las fichas de cantera se siguen generando con `fichaDeCantera`, pero AQUÍ,
// una sola vez, al construir la semilla. Lo que se guarda es el resultado ya
// escrito, así que el club puede corregir cualquier texto autogenerado en vez
// de quedar atado a la plantilla.
//
//   zona: 'nacional' → ficha colgando de la portada
//   zona: 'cantera'  → ficha colgando de /cantera y tarjeta en esa página
//   enPortada        → además sale entre los accesos de la portada
// ---------------------------------------------------------------------------
const unificar = (base, ficha, zona, enPortada) => ({
  slug: base.slug,
  zona,
  enPortada,
  nombre: base.nombre,
  categoria: base.categoria,
  liga: base.liga || '',
  img: base.img,
  alt: base.alt,
  resumen: base.resumen || '',
  crumb: ficha.crumb,
  kicker: ficha.kicker,
  sub: ficha.sub,
  headerImg: ficha.headerImg,
  headerFoco: ficha.headerFoco,
  datos: ficha.datos,
  squad: ficha.squad,
  staff: ficha.staff,
  join: ficha.join,
})

export const equiposSemilla = [
  ...equiposDestacados
    // la tarjeta de Cantera no es un equipo y no tiene ficha que unificar
    .filter((e) => fichasNacionales[e.slug])
    .map((e) => unificar(e, fichasNacionales[e.slug], 'nacional', true)),
  ...equiposCantera.map((e) => unificar(e, fichaDeCantera(e), 'cantera', false)),
]

/**
 * Los accesos de la portada: los equipos marcados, y Cantera siempre al final.
 *
 * El «11 equipos» de esa última tarjeta se cuenta aquí en vez de escribirlo a
 * mano: si el club da de alta un equipo de base desde el panel, la portada se
 * entera sola. Los deportistas sí van a mano, que eso no se deduce de nada.
 */
export const destacadosDe = (lista) => {
  const base = lista.filter((e) => e.zona === 'cantera').length
  return [
    ...lista.filter((e) => e.enPortada),
    { ...tarjetaCantera, resumen: `${base} equipos · ${cifrasCantera[1]?.n ?? '240'} deportistas` },
  ]
}

/** Las migas de pan de la ficha dependen de dónde cuelga el equipo. */
export const padreDe = (equipo) =>
  equipo.zona === 'cantera' ? { to: '/cantera', label: 'Cantera' } : { to: '/', label: 'Equipos' }

/** Iniciales para el hueco de la foto del cuerpo técnico. */
export const inicialesDe = (nombre = '') =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((t) => t[0]?.toUpperCase() || '')
    .join('')

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

/* Aquí vivía `retransmisiones`: tres tarjetas de muestra con enlaces a "#" que
   se pintaban en portada y en el calendario. Se quitaron el 14-08-2026 porque
   anunciaban partidos que no se retransmiten. Si algún día hay canal de
   YouTube de verdad, vuelve el bloque, pero con enlaces reales. */

// ---------------------------------------------------------------------------
// Noticias
//
// Cada noticia se abre en su propia página, `/noticias/<slug>` (Noticia.jsx).
// Para que sea clicable necesita `slug` y `cuerpo`; sin `cuerpo` la ficha cae a
// 404, igual que hacen las fichas de patrocinador sin texto.
//
// `cta: 'preinscripcion'` le cuelga al final el bloque del formulario, que se
// pinta según la ventana de fechas (`preinscripcion`): con el plazo cerrado no
// enseña el botón, avisa. Así la noticia no se queda invitando a rellenar un
// formulario fuera de plazo aunque nadie la toque.
// ---------------------------------------------------------------------------
export const noticias = [
  // Solo se publica la preinscripción (13-08-2026). Las otras siete eran datos
  // de muestra y se retiraron: mejor una noticia de verdad que ocho inventadas.
  // Al añadir más, la primera del array es la destacada y el resto van a la
  // rejilla de abajo.
  {
    id: 'n2',
    slug: 'preinscripcion-26-27',
    destacada: true,
    categoria: 'Cantera',
    fecha: '10 ago 2026',
    titulo: 'Abierta la preinscripción para la 26/27',
    resumen: 'Desde alevín hasta juvenil. El plazo es del 10 al 25 de agosto y el formulario está en la web.',
    // bloqueo.jpg no: es la cabecera de /cantera y la noticia va justo de eso,
    // así que se veían las dos seguidas
    img: '/media/ataque.jpg',
    foco: 'center 46%',
    cuerpo: [
      `Ya está abierta la preinscripción para la temporada 2026/27. El plazo es ${preinscripcion.texto} y entran chicos y chicas desde los 8 años, de alevín a juvenil.`,
      'Preinscribirse no compromete a nada: es decirnos que os interesa. Con esos datos asignamos el equipo que le toca por año de nacimiento y nivel, y os decimos qué día y a qué hora entrena su grupo.',
      'No hace falta haber jugado antes al voleibol. Para el primer entrenamiento basta con ropa cómoda, calzado deportivo y una botella de agua; el material lo pone el club.',
    ],
    cta: 'preinscripcion',
  },
]

/** A dónde lleva una tarjeta de noticia. Sin ficha escrita se queda en el
 *  listado, que es lo que hacía antes: nunca deja un enlace roto. */
export function enlaceNoticia(n) {
  return n && n.slug && n.cuerpo?.length ? `/noticias/${n.slug}` : '/noticias'
}

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
  { n: '+6.700', label: 'Seguidores en redes', sube: true },
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

// Patrocinadores del club. El copy NO es inventado: cada ficha se escribió
// leyendo la web de la propia marca (geffsport.com, imqasturias.es,
// funerariasreunidas.com, palaciodegarana.com, centrofisan.es) y, en el caso de
// Bluedebug y VBStats, su `src/app/layout.tsx` y su `src/data/apps.ts`. Los
// colores son los de cada marca, y se usan solo para el brillo del aro al pasar
// por encima; `glow` es ese mismo color en rgba. Los logos los mandó el club el
// 08-08-2026 y están procesados en `public/media/patrocinadores/`: fondo blanco
// quitado y márgenes recortados, para que llenen el círculo de la ficha y la
// banda de portada.
//
// `web` es la página propia de cada marca (se abre en pestaña nueva). Los que
// tienen `parrafos` llevan además ficha en /patrocinadores/:slug; los que no,
// enlazan directamente fuera. La Sidrería de Güelita no tiene web, así que su
// `web` apunta al Instagram: se confirmó que es la suya porque la foto de perfil
// es el mismo dibujo que el logo que mandó el club. PENDIENTE (10-08-2026):
// Reformas Precisión sigue sin web ni datos verificables —buscada y sin rastro
// en internet—, así que se queda sin ficha y con el logo sin enlace hasta que el
// club pase la dirección. La ficha ya aguanta marcas sin `web`: el botón solo se
// pinta si la hay.
//
// `foto` es la imagen de la banda azul de la cabecera de la ficha, igual que la
// foto de equipo en /equipos/:slug. Va al 30% de opacidad sobre el azul marino,
// así que tiene que ser apaisada (unos 3,7:1) y con los cantos ya fundidos en
// ese azul. Las de Bluedebug y VBStats se componen con
// `scripts/cabeceras-marca/preparar.ps1` a partir de capturas de sus propias
// apps. Sin `foto` la banda se queda lisa, como estaba.
//
// EL ORDEN DEL ARRAY MANDA: es el que se pinta en la banda de portada, en
// /patrocinadores y en /patrocinar, sin reordenar en ningún sitio. Bluedebug y
// VBStats van siempre las dos primeras (Diego, 10-08-2026); al añadir marcas
// nuevas, van detrás.
export const patrocinadoresActuales = [
  {
    slug: 'bluedebug',
    nombre: 'Bluedebug',
    logo: '/media/bluedebug-logo.png',
    foto: '/media/patrocinadores/bluedebug-cabecera.png',
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
    foto: '/media/patrocinadores/vbstats-cabecera.png',
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
  {
    slug: 'geff',
    nombre: 'GEFF',
    logo: '/media/patrocinadores/geff.png',
    tagline: 'Equipaciones deportivas personalizadas',
    // OJO (10-08-2026): se quitó el enlace a geffsport.com. El dominio caducó y
    // ahora es una página de aparcamiento de Sedo con un cartel de «en venta»;
    // geff.biz redirige ahí y geff.eu (el que da su LinkedIn) no resuelve. Un
    // botón del club llevando a eso es peor que no tener botón. Volver a
    // ponerlo cuando el club confirme su dirección buena. Sin web tampoco hay
    // de dónde sacarles foto de cabecera.
    color: '#111111',
    glow: 'rgba(17,17,17,.18)',
    descripcion: 'Fabricante de equipaciones deportivas personalizadas por sublimación.',
    parrafos: [
      'GEFF es una fábrica española de equipaciones deportivas personalizadas. Nació en 2010, forma parte del grupo Stampa Team y su planta de 2.000 m² es una de las mayores de Europa dedicadas a la personalización textil por sublimación.',
      'Fabrica ropa de juego para clubes de voleibol, baloncesto, rugby y otros deportes, con el diseño incluido y plazos de entrega de unos quince días laborables. Distribuye en Europa, Estados Unidos y Oriente Medio, y monta una tienda online para cada club, para que las familias hagan sus pedidos directamente.',
    ],
  },
  {
    slug: 'imq-asturias',
    nombre: 'IMQ Asturias',
    logo: '/media/patrocinadores/imq-asturias.png',
    foto: '/media/patrocinadores/imq-asturias-cabecera.jpg',
    tagline: 'El seguro de salud de Asturias',
    web: 'https://www.imqasturias.es/',
    webTexto: 'imqasturias.es',
    color: '#3aaa35',
    glow: 'rgba(58,170,53,.22)',
    descripcion: 'Seguros de salud con cuadro médico propio en Asturias.',
    parrafos: [
      'IMQ Asturias es una aseguradora de salud cien por cien asturiana. La fundó en 1954 un grupo de médicos de la región —de ahí su nombre, Igualatorio Médico-Quirúrgico y de Especialidades de Asturias— para atender a los colectivos que entonces quedaban fuera de la Seguridad Social.',
      'Hoy es una de las entidades de referencia del seguro médico en el Principado, con cuadro médico propio, oficinas en Oviedo y Gijón y pólizas que cubren especialidades, medios de diagnóstico, fisioterapia, psicología y hospitalización. Su app permite consultar el cuadro médico, pedir cita y hacer telemedicina.',
    ],
  },
  {
    slug: 'funerarias-reunidas',
    nombre: 'Funerarias Reunidas',
    logo: '/media/patrocinadores/funerarias-reunidas.png',
    foto: '/media/patrocinadores/funerarias-reunidas-cabecera.jpg',
    tagline: 'Servicios funerarios en Asturias',
    web: 'https://funerariasreunidas.com/',
    webTexto: 'funerariasreunidas.com',
    color: '#1f4b3a',
    glow: 'rgba(31,75,58,.22)',
    descripcion: 'Servicios funerarios y tanatorios en Asturias.',
    parrafos: [
      'Funerarias Reunidas es una empresa asturiana de servicios funerarios de origen familiar. Nació de la unión de varias funerarias pequeñas y lleva consolidándose en el Principado desde 1979, hasta convertirse en una de las referencias del sector en la región.',
      'Tiene las oficinas centrales en Oviedo y gestiona los tanatorios de Los Arenales, en la propia ciudad, y Puente Nora, en Lugones. Las instalaciones de Los Arenales, levantadas en 1982 junto al cementerio de El Salvador, cuentan con diecisiete salas de velatorio, capilla, cafetería-restaurante, floristería propia y crematorio. Atienden las veinticuatro horas.',
    ],
  },
  {
    slug: 'palacio-de-garana',
    nombre: 'Palacio de Garaña',
    logo: '/media/patrocinadores/palacio-de-garana.png',
    foto: '/media/patrocinadores/palacio-de-garana-cabecera.jpg',
    tagline: 'Hotel, camping y restaurante en Llanes',
    web: 'https://www.palaciodegarana.com/',
    webTexto: 'palaciodegarana.com',
    color: '#1c5f9e',
    glow: 'rgba(28,95,158,.22)',
    descripcion: 'Hotel, camping, restaurante y piscina bar en Garaña de Pría, Llanes.',
    parrafos: [
      'El Palacio de Garaña es un complejo turístico en Garaña de Pría, concejo de Llanes, montado sobre la antigua finca de los marqueses de Argüelles. Conserva la fachada del palacio de 1881, restaurado y reconvertido en hotel de dieciocho habitaciones.',
      'En la misma finca reúne hotel, camping, restaurante y piscina, a poco más de un kilómetro de la playa de Guadamía y de los bufones de Pría, y a un paso de Ribadesella y los Picos de Europa. El restaurante abre en temporada y trabaja cocina asturiana de casa: cachopo, pote, fabada y los quesos de Pría.',
    ],
  },
  {
    slug: 'centro-fisan',
    nombre: 'Centro Fisan',
    logo: '/media/patrocinadores/centro-fisan.png',
    foto: '/media/patrocinadores/centro-fisan-cabecera.jpg',
    tagline: 'Fisioterapia y salud',
    web: 'https://centrofisan.es/',
    webTexto: 'centrofisan.es',
    color: '#2b9cd8',
    glow: 'rgba(43,156,216,.22)',
    descripcion: 'Centro de fisioterapia y salud: fisioterapia, entrenamiento personal y pilates.',
    parrafos: [
      'Centro Fisan es un centro de fisioterapia y salud de Pola de Siero. Empezó en 2011 como la clínica de la fisioterapeuta Sandra Villa y en 2019 se mudó a unas instalaciones nuevas y más grandes, ya con un equipo de varios fisioterapeutas que atiende cada caso desde distintas especialidades.',
      'Su base es la terapia manual, apoyada en tecnología cuando el caso lo pide: INDIBA, ondas de choque, punción seca, electroestimulación y ecografía. Además de la consulta de fisioterapia trabaja readaptación deportiva, suelo pélvico, fisioterapia pediátrica, osteopatía, entrenamiento personal y clases de pilates.',
    ],
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
    foto: '/media/patrocinadores/sidreria-guelita-cabecera.png',
    tagline: 'Sidrería y cocina asturiana',
    web: 'https://www.instagram.com/lasidreriadeguelita/',
    webTexto: '@lasidreriadeguelita',
    color: '#b5651d',
    glow: 'rgba(181,101,29,.22)',
    descripcion: 'Sidrería de cocina asturiana en Los Campos, Corvera. Cachopo, sidra escanciada y comida de casa.',
    parrafos: [
      'La Sidrería de Güelita es una sidrería asturiana de Los Campos, en el concejo de Corvera. Cocina de casa, sidra escanciada y, por encima de todo, cachopo: presume de haber ganado el mejor cachopo de Asturias en 2021 y el premio al cachopo más popular del mundo en 2022.',
      'Está en la calle Carmen Sarmiento, y al comedor le suma menús de domingo con música en vivo y reparto a domicilio en la zona de Avilés. No tiene web: lo suyo lo cuenta en Instagram.',
    ],
  },
  {
    // Alta el 11-08-2026. El club pasó también el DNI, el móvil personal de
    // Miguel Muñoz y la razón social: eso es para el contrato y NO se publica.
    // Los dos teléfonos de las clínicas tampoco van aquí —ninguna otra ficha
    // lleva teléfono—; el club los quiere en la equipación y en el soporte
    // fijo, que es otra cosa.
    slug: 'clinica-dental-miguel-munoz',
    nombre: 'Clínica Dental Miguel Muñoz',
    logo: '/media/patrocinadores/clinica-dental-miguel-munoz.png',
    foto: '/media/patrocinadores/clinica-dental-miguel-munoz-cabecera.jpg',
    tagline: 'Clínica dental en Oviedo y Colloto',
    web: 'https://munozdental.es',
    webTexto: 'munozdental.es',
    // Muestreado del propio logo: es azul puro, no una aproximación.
    color: '#0000ff',
    glow: 'rgba(0,0,255,.20)',
    descripcion: 'Clínica dental con consultas en Oviedo y en Colloto. Implantes, ortodoncia, odontopediatría y estética dental.',
    parrafos: [
      'La Clínica Dental Miguel Muñoz atiende en dos consultas: una en Oviedo, en la calle Bermúdez de Castro, y otra en Colloto, en el Camino Real, a un paso del pabellón donde entrena el club. La dirige el doctor Miguel Muñoz Menéndez, licenciado en Odontología por la Universidad de Santiago de Compostela.',
      'Trabaja implantes y cirugía, ortodoncia, prótesis, endodoncia, periodoncia y estética dental, con un equipo en el que cada especialidad tiene su responsable. Lleva además odontopediatría, que en un club con nueve equipos de cantera no es un detalle menor.',
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
