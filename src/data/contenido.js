// ==========================================================================
// CVO — contenido del sitio
// Todo lo marcado con "DATOS DE MUESTRA" es contenido inventado para poder
// maquetar; hay que sustituirlo por los datos reales del club antes de publicar.
// ==========================================================================

export const club = {
  nombre: 'Club Voleibol Oviedo',
  nombreCorto: 'CV Oviedo',
  fundacion: 1991,
  email: 'info@clubvoleiboloviedo.com',
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
  { n: '11', label: 'Equipos federados' },
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
// ---------------------------------------------------------------------------
export const equipos = {
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
    gallery: [
      { src: '/media/hero-remate.jpg', alt: 'Remate del sénior masculino' },
      { src: '/media/hero-saque.jpg', alt: 'Saque en salto' },
      { src: '/media/pista-azul.jpg', alt: 'Partido en el pabellón' },
      { src: '/media/equipo-masc.jpg', alt: 'Foto de equipo' },
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
    gallery: [
      { src: '/media/celebracion.jpg', alt: 'Celebración del sénior femenino' },
      { src: '/media/accion-vert.jpg', alt: 'Jugada del sénior femenino' },
      { src: '/media/pista-azul.jpg', alt: 'Partido en el pabellón' },
      { src: '/media/equipo-fem.jpg', alt: 'Foto de equipo' },
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
// Cantera — los diez equipos de base (Cantera.jsx) — DATOS DE MUESTRA
// ---------------------------------------------------------------------------
export const equiposCantera = [
  // No es el de Superliga 2: es el segundo equipo sénior, donde siguen jugando
  // los que salen del júnior. Sin foto propia todavía, va una de juego.
  { nombre: 'Sénior Masculino', categoria: 'Sénior', img: '/media/plancha.jpg', alt: 'Segundo equipo sénior masculino del CV Oviedo', liga: 'Segunda División · FVBPA' },
  { nombre: 'Júnior Masculino', categoria: 'Sub-19', img: '/media/equipos/junior-masculino.jpg', alt: 'Equipo júnior masculino del CV Oviedo', liga: 'Liga Asturiana' },
  { nombre: 'Juvenil Femenino', categoria: 'Sub-17', img: '/media/equipos/juvenil-femenino.jpg', alt: 'Equipo juvenil femenino del CV Oviedo', liga: 'Liga Asturiana' },
  { nombre: 'Cadete Masculino', categoria: 'Sub-15', img: '/media/equipos/cadete-masculino.jpg', alt: 'Equipo cadete masculino del CV Oviedo', liga: 'Liga Asturiana' },
  { nombre: 'Cadete Femenino A', categoria: 'Sub-15', img: '/media/equipos/cadete-femenino-a.jpg', alt: 'Equipo cadete femenino A del CV Oviedo', liga: 'Liga Asturiana' },
  { nombre: 'Cadete Femenino B', categoria: 'Sub-15', img: '/media/equipos/cadete-femenino-b.jpg', alt: 'Equipo cadete femenino B del CV Oviedo', liga: 'Liga Asturiana' },
  { nombre: 'Infantil Masculino', categoria: 'Sub-13', img: '/media/equipos/infantil-masculino.jpg', alt: 'Equipo infantil masculino del CV Oviedo', liga: 'Liga Asturiana' },
  { nombre: 'Infantil Femenino A', categoria: 'Sub-13', img: '/media/equipos/infantil-femenino-a.jpg', alt: 'Equipo infantil femenino A del CV Oviedo', liga: 'Liga Asturiana' },
  { nombre: 'Infantil Femenino B', categoria: 'Sub-13', img: '/media/equipos/infantil-femenino-b.jpg', alt: 'Equipo infantil femenino B del CV Oviedo', liga: 'Liga Asturiana' },
  // Dos equipos alevines, con la misma A/B que cadete e infantil. El segundo
  // todavía no tiene foto propia: se reutiliza la del alevín hasta que la haya.
  { nombre: 'Alevín Federado A', categoria: 'Sub-11', img: '/media/equipos/alevin.jpg', alt: 'Equipo alevín federado A del CV Oviedo', liga: 'Liga Asturiana' },
  { nombre: 'Alevín Federado B', categoria: 'Sub-11', img: '/media/equipos/alevin.jpg', alt: 'Equipo alevín federado B del CV Oviedo', liga: 'Liga Asturiana' },
]

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
    detalle: 'Pista homologada para competición nacional. Aquí entrenan y compiten los once equipos del club.',
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
    fecha: '4 sep 2026',
    titulo: 'Abiertas las inscripciones para la 26/27',
    resumen: 'Desde alevín hasta juvenil. El formulario está abierto en la web.',
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

// galería de fotos reutilizada al final de Noticias.jsx — DATOS DE MUESTRA
// Solo fotos de juego o de celebración. Las fotos de equipo posadas se quedan
// en el apartado de equipos.
export const galeriaNoticias = [
  { src: '/media/hero-remate.jpg', alt: 'Remate del sénior masculino' },
  { src: '/media/hero-saque.jpg', alt: 'Saque en salto' },
  { src: '/media/pista-azul.jpg', alt: 'Bloqueo en la red' },
  { src: '/media/celebracion.jpg', alt: 'Celebración del sénior femenino' },
  { src: '/media/accion-vert.jpg', alt: 'Jugada de ataque' },
  { src: '/media/plancha.jpg', alt: 'Plancha en defensa' },
  { src: '/media/recepcion.jpg', alt: 'Recepción del saque' },
  { src: '/media/celebracion-punto.jpg', alt: 'Celebración de un punto' },
]

// ---------------------------------------------------------------------------
// Quiénes somos — hitos CONFIRMADOS POR EL CLUB (2026-07-29). No son datos de
// muestra: no cambiarlos sin preguntar. El ascenso a Superliga 2 es de 2026,
// no de 2021 como decía antes.
// ---------------------------------------------------------------------------
export const hitos = [
  { anio: '1991', texto: 'Fundación del Club Voleibol Oviedo, con un único equipo sénior masculino.' },
  { anio: '1998', texto: 'Se crea la sección femenina del club.' },
  { anio: '2006', texto: 'El club se traslada al Polideportivo José Manuel Fuente, en Colloto, su sede actual.' },
  { anio: '2014', texto: 'Se amplía la cantera hasta cubrir todas las categorías, de alevín a júnior.' },
  { anio: '2026', texto: 'El equipo masculino asciende a Superliga 2. El club supera los 240 canteranos y los 6.700 seguidores en redes sociales.' },
]

// ---------------------------------------------------------------------------
// Palmarés — campeonatos de España y resultados a nivel nacional.
//
// PENDIENTE (reunión con Vitor, 30-07-2026): falta la lista real. Hasta que
// llegue, la sección de Quiénes somos enseña el aviso de "pendiente" en vez de
// inventarse títulos. Para publicarlo basta con rellenar este array:
//   { anio: '2018', titulo: 'Campeonato de España', categoria: 'Cadete femenino',
//     puesto: 'Subcampeonas' }
// ---------------------------------------------------------------------------
export const palmares = []

export const valores = [
  { titulo: 'Formación', texto: 'El deporte como escuela: disciplina, esfuerzo y trabajo en equipo desde alevín.' },
  { titulo: 'Cantera propia', texto: 'La mayoría de jugadores del primer equipo se han formado en el club.' },
  { titulo: 'Un solo club', texto: 'Mismo pabellón y misma camiseta para los 11 equipos, del alevín al sénior.' },
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
  { n: '11', label: 'Equipos federados' },
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
      'Logo en la camiseta de partido de los 11 equipos',
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
export const patrocinadoresActuales = [
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
