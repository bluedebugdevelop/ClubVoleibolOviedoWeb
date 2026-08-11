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

  // .phead .bg → la banda azul del título, muy apaisada
  cabecera: {
    ancho: 1600,
    alto: 460,
    titulo: 'Foto de cabecera',
    ayuda: 'Es la banda de detrás del título. Muy apaisada: deja las caras en el centro.',
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
