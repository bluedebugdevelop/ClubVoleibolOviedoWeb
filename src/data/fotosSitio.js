/* ---------------------------------------------------------------------------
   Las fotos FIJAS de la web: las que no pertenecen a una noticia, a un
   patrocinador ni a un equipo, sino a una sección.

   Son casi todas la banda azul que hay detrás del título de cada página, más
   el primer fotograma del vídeo de portada y la foto del pabellón. Estaban
   escritas dentro del JSX de cada página, así que cambiar una obligaba a tocar
   código y desplegar. Aquí se catalogan para que el panel las liste y se puedan
   cambiar desde la web.

   Cada entrada dice:
     clave       identificador que usa el panel y el hook `useFoto`
     titulo      cómo se llama en el panel
     donde       en qué página sale, para no tener que adivinarlo
     formato     el encuadre que pide (ver `components/formatosImagen.js`)
     porDefecto  la que hay hoy; si el panel no ha cambiado nada, es la que se ve

   Al añadir una entrada nueva hay que hacer dos cosas: ponerla aquí y usar
   `useFoto('la-clave')` donde antes estaba la ruta escrita a mano.
   --------------------------------------------------------------------------- */

export const FOTOS_SITIO = [
  {
    clave: 'portada-hero',
    titulo: 'Portada — fotograma del vídeo',
    donde: 'Lo que se ve en la portada mientras carga el vídeo de fondo.',
    formato: 'hero',
    porDefecto: '/media/hero-poster.jpg',
  },
  {
    clave: 'cantera',
    titulo: 'Cantera — cabecera',
    donde: 'Banda de detrás del título en /cantera.',
    formato: 'cabecera',
    porDefecto: '/media/bloqueo.jpg',
  },
  {
    clave: 'calendario',
    titulo: 'Calendario — cabecera',
    donde: 'Banda de detrás del título en /calendario.',
    formato: 'cabecera',
    porDefecto: '/media/defensa.jpg',
  },
  {
    clave: 'noticias',
    titulo: 'Noticias — cabecera',
    donde: 'Banda de detrás del título en /noticias.',
    formato: 'cabecera',
    porDefecto: '/media/hero-remate.jpg',
  },
  {
    clave: 'quienes-somos',
    titulo: 'Quiénes somos — cabecera',
    donde: 'Banda de detrás del título en /quienes-somos.',
    formato: 'cabecera',
    porDefecto: '/media/celebracion-punto.jpg',
  },
  {
    clave: 'instalaciones',
    titulo: 'Quiénes somos — el pabellón',
    donde: 'La foto que acompaña al texto de la sede, en /quienes-somos.',
    formato: 'instalacion',
    porDefecto: '/media/pista-azul.jpg',
  },
  {
    clave: 'patrocinadores',
    titulo: 'Patrocinadores — cabecera',
    donde: 'Banda de detrás del título en /patrocinadores.',
    formato: 'cabecera',
    porDefecto: '/media/celebracion-manos.jpg',
  },
  {
    clave: 'patrocinar',
    titulo: 'Patrocinar — cabecera',
    donde: 'Banda de detrás del título en /patrocinar.',
    formato: 'cabecera',
    porDefecto: '/media/plancha.jpg',
  },
  {
    clave: 'inscripciones',
    titulo: 'Inscripciones — cabecera',
    donde: 'Banda de detrás del título en /inscripciones.',
    formato: 'cabecera',
    porDefecto: '/media/hero-saque.jpg',
  },
  {
    clave: 'tienda',
    titulo: 'Tienda — cabecera',
    donde: 'Banda de detrás del título en /tienda.',
    formato: 'cabecera',
    porDefecto: '/media/recepcion.jpg',
  },
  {
    clave: 'contacto',
    titulo: 'Contacto — cabecera',
    donde: 'Banda de detrás del título en /contacto.',
    formato: 'cabecera',
    porDefecto: '/media/bloqueo-doble.jpg',
  },
  {
    clave: 'legal',
    titulo: 'Textos legales — cabecera',
    donde: 'Banda de detrás del título en aviso legal, privacidad y cookies.',
    formato: 'cabecera',
    porDefecto: '/media/bloqueo-noche.jpg',
  },
]

/** El encuadre de cada foto, sin tener que recorrer la lista. */
export const fotoPorDefecto = (clave) =>
  FOTOS_SITIO.find((f) => f.clave === clave)?.porDefecto ?? ''

/** La lista con la que arranca el panel: todas las claves, con su foto actual. */
export const fotosSemilla = () => FOTOS_SITIO.map((f) => ({ clave: f.clave, ruta: f.porDefecto }))
