/* ---------------------------------------------------------------------------
   Los tamaños de imagen que pide la web.

   Cada sitio donde va una foto la recorta a una proporción distinta con
   `object-fit: cover`. Si se sube una foto con otra forma, el navegador se come
   por su cuenta lo que le sobra —normalmente las cabezas—, y de ahí que las
   fichas salieran descuadradas.

   Con esto, el panel recorta ANTES de subir: quien publica ve exactamente el
   trozo que se va a ver y lo coloca a mano. Lo que llega al servidor ya tiene
   la medida buena, así que no hay nada que adivinar después.

   Los anchos son el doble de lo que ocupan en pantalla, para que se vean nítidas
   en móviles y portátiles de pantalla fina (los que tienen el doble de puntos
   por pulgada). Más allá de eso solo se gana peso.

   Las proporciones salen de `src/index.css`; si allí se cambia un
   `aspect-ratio`, hay que cambiarlo aquí también.
   --------------------------------------------------------------------------- */

export const FORMATOS = {
  // .card .ph y .destacada .ph → aspect-ratio 16/10
  noticia: {
    ancho: 1280,
    alto: 800,
    titulo: 'Foto de la noticia',
    ayuda: 'Sale en la tarjeta del listado y de fondo en la cabecera de la noticia.',
  },

  // .articulo-galeria img → las imágenes de dentro de la noticia.
  //
  // `entero` como el logo, y por el mismo motivo: aquí van carteles y
  // calendarios, y recortar un cartel es dejarlo sin la mitad de las fechas. La
  // caja es 4:5 (la de los carteles del club, 1080×1350); lo que tenga otra
  // forma se encaja dentro sin cortar nada.
  galeriaNoticia: {
    ancho: 1080,
    alto: 1350,
    entero: true,
    titulo: 'Imagen dentro de la noticia',
    ayuda: 'Va debajo del texto y entera, sin recortar. Para carteles, calendarios y gráficos.',
  },

  // .phead → la banda azul del título, muy apaisada.
  //
  // 1600×380 es EL hueco: la proporción que tiene la banda en un ordenador, de
  // 1400 px de ancho para arriba, siempre la misma (ver `.phead::before` en
  // index.css). Si se cambia una de las dos medidas hay que cambiar el
  // `aspect-ratio` y el `max-height` de allí a la vez, o el panel recortaría a
  // una forma que la web no usa.
  //
  // `zonaSegura` es la parte central del recorte que sobrevive en un móvil, en
  // tanto por uno del ancho. La banda de un móvil no puede ser tan apaisada
  // —el texto necesita su sitio—, así que se queda con una franja del centro y
  // tira el resto. El recortador la marca para que se vea dónde hay que dejar
  // lo importante.
  //
  // 0,33 es lo medido en las páginas de la web a 390 px de ancho, que es el
  // móvil normal de hoy: sale entre 0,31 y 0,38 según lo largos que sean el
  // título y la entradilla, y se coge el lado corto. En un móvil viejo de 320
  // baja hasta 0,24, así que ahí se pierde algo más de lo que marca la línea.
  //
  // `vistas` enciende el botón de «ver cómo queda». Es el único hueco donde lo
  // que se ve cambia con el dispositivo; los demás son cajas de proporción fija
  // y salen igual en todas partes.
  cabecera: {
    ancho: 1600,
    alto: 380,
    zonaSegura: 0.33,
    vistas: true,
    titulo: 'Foto de cabecera',
    ayuda: 'Es la banda de detrás del título. Lo importante, dentro de las líneas: fuera de ellas no se ve en un móvil.',
  },

  // .teams.all .ph → aspect-ratio 1/1
  equipoCantera: {
    ancho: 900,
    alto: 900,
    titulo: 'Foto del equipo',
    ayuda: 'Cuadrada, la de la tarjeta en la página de Cantera.',
  },

  // .teams .ph → aspect-ratio 4/5
  equipoPortada: {
    ancho: 900,
    alto: 1125,
    titulo: 'Foto del equipo',
    ayuda: 'Vertical, la de la tarjeta grande de la portada.',
  },

  // La portada: el vídeo de fondo es 16:9 y el fotograma tiene que casar con él
  hero: {
    ancho: 1600,
    alto: 900,
    titulo: 'Fotograma de portada',
    ayuda: 'Se ve un instante, mientras carga el vídeo. Que se parezca a su primer fotograma.',
  },

  // .instalaciones .ph → aspect-ratio 4/3
  instalacion: {
    ancho: 1200,
    alto: 900,
    titulo: 'Foto',
    ayuda: 'Apaisada, junto al texto de la sede.',
  },

  // El logo NO se recorta: se encaja entero dentro de la caja. Recortar un logo
  // es estropearlo, y además suelen venir con el fondo transparente.
  logo: {
    ancho: 600,
    alto: 400,
    entero: true,
    titulo: 'Logo',
    ayuda: 'Se encaja entero, sin recortar. Si tiene fondo transparente, se conserva.',
  },
}
