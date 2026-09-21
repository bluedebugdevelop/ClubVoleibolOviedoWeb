-- ==========================================================================
-- El contenido que edita el club desde el panel.
--
-- Hasta ahora vivía en dos ficheros JSON dentro del volumen de Railway:
-- `contenido.json` (lo publicable) y `privado.json` (las cuentas del área del
-- club y las peticiones de publicación). Ese diseño era deliberado y estaba
-- bien razonado —son unas pocas decenas de elementos que se leen enteros—,
-- pero deja de tener sentido cuando hay una base de datos al lado: significa
-- dos sitios donde mirar y dos formas de hacer copia de seguridad.
--
-- Las IMÁGENES siguen en el volumen. Ahí el JSON no era el problema: un fichero
-- binario en una columna se copia entero en cada consulta que lo toque, y
-- servirlo desde disco con cabeceras de caché es lo que hay que hacer. En la
-- base van las rutas, no los bytes.
--
-- El orden de las listas se guarda en `posicion` y no se deja al orden de
-- inserción: el panel permite reordenar, y sin una columna explícita el
-- resultado dependería de cómo Postgres devolviera las filas.
-- ==========================================================================

CREATE TABLE noticias (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text NOT NULL UNIQUE,
  titulo     text NOT NULL,
  resumen    text NOT NULL DEFAULT '',
  cuerpo     text NOT NULL DEFAULT '',
  categoria  text,
  fecha      text,
  img        text,
  -- Dónde está lo importante de la foto, para recortarla sin cortar cabezas.
  foco       text,
  -- La que el club marca como la importante; sale primero en la app.
  destacada  boolean NOT NULL DEFAULT false,
  posicion   integer NOT NULL DEFAULT 0,
  creado_en  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX noticias_orden ON noticias (destacada DESC, posicion);

CREATE TABLE patrocinadores (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre    text NOT NULL,
  url       text,
  img       text,
  nivel     text,
  posicion  integer NOT NULL DEFAULT 0
);

/* La ficha PÚBLICA de un equipo en la web.

   Ojo: no es lo mismo que `equipos`. Aquella es el equipo de la app —quién
   entra, quién manda, qué chat— y esta es la página que ve un visitante. Se
   enlazan por `equipos.slug_web`, a mano, porque los dos lados se renombran
   por su cuenta: el club puede llamar «Sénior Masculino» al equipo en la app y
   «Superliga 2 Masculina» a la ficha de la web, y las dos cosas son correctas. */
CREATE TABLE equipos_web (
  slug       text PRIMARY KEY,
  nombre     text NOT NULL,
  categoria  text,
  img        text,
  foco       text,
  /* La plantilla publicada: dorsal, nombre y posición, nada más.
     Va como JSON y no como tabla a propósito: es una foto que la app EMPUJA
     hacia aquí cuando el entrenador la publica, no una relación que se
     consulte. Los correos y las cuentas no salen nunca del club. */
  plantilla  jsonb NOT NULL DEFAULT '[]',
  posicion   integer NOT NULL DEFAULT 0
);

/* Las fotos fijas de cada sección de la web (cabeceras, el club, etc.). */
CREATE TABLE fotos (
  clave  text PRIMARY KEY,
  img    text,
  foco   text
);

-- ------------------------------------------------------- lo que no se publica

/* Las cuentas del área del club (entrenadores y delegados).

   Son distintas de `usuarios`: aquellas son las de la APP y las crea un
   administrador del club; estas solo sirven para dejar peticiones de
   publicación en la web. Se mantienen separadas mientras las dos puertas sean
   distintas; unificarlas es una decisión de producto, no de esquema. */
CREATE TABLE cuentas_club (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario     text NOT NULL UNIQUE,
  nombre      text NOT NULL,
  clave_hash  text NOT NULL,
  activa      boolean NOT NULL DEFAULT true,
  creado_en   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE peticiones (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo        text NOT NULL,
  estado      text NOT NULL DEFAULT 'pendiente'
              CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
  de          text,
  datos       jsonb NOT NULL DEFAULT '{}',
  creado_en   timestamptz NOT NULL DEFAULT now(),
  resuelto_en timestamptz
);

CREATE INDEX peticiones_pendientes ON peticiones (creado_en DESC)
  WHERE estado = 'pendiente';
