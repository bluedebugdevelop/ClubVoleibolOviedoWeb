-- ==========================================================================
-- Lo que publican las federaciones (FVBPA y RFEVB), ya raspado.
--
-- Hasta ahora esto vivía en `src/data/competicion.json`, commiteado en el
-- repositorio y refrescado por una acción de GitHub que hacía un commit
-- diario. Funcionaba, pero tenía tres pegas que se notaban:
--
--   · Cada refresco era un despliegue. Un cambio de horario de la federación
--     no llegaba hasta que Railway reconstruía el sitio entero.
--   · La app no podía leer nada que no estuviera en ese JSON, así que todo
--     tenía que pasar por él.
--   · No había histórico: el JSON se sobrescribía y lo de ayer desaparecía.
--
-- Aquí el raspador escribe en la base y la web y la app leen de la base. El
-- despliegue deja de estar en medio.
--
-- LO QUE NO CAMBIA: el raspador sigue siendo el de `scripts/fuentes/`, con
-- todas sus trampas ya pagadas (las tres columnas sin cabecera de la FVBPA,
-- los partidos contra DESCANSA, el "00:00" que es «hora sin fijar» y no
-- medianoche). Lo único que cambia es dónde deja el resultado.
-- ==========================================================================

CREATE TABLE competiciones (
  /* La clave que ya usaban el JSON y la app: categoría-división-ente.
     Se mantiene como clave primaria en vez de inventar un id nuevo porque es
     lo que tienen guardado los equipos de Firestore que se van a importar, y
     lo que pide hoy la app en `/api/competicion?clave=`. */
  clave          text PRIMARY KEY,

  nombre         text NOT NULL,
  categoria      text NOT NULL,
  genero         text NOT NULL,
  division       text NOT NULL,
  grupo          text,
  ente           text NOT NULL CHECK (ente IN ('FVBPA', 'RFEVB')),
  url            text,

  /* Cómo se llama el club EN ESA competición.
     No es cosmético: es con lo que se decide si un partido se juega en casa.
     La RFEVB dice «CLUB VOLEIBOL OVIEDO» y la FVBPA «CV OVIEDO», y los dos
     nombres son correctos en su sitio. */
  equipo_club    text NOT NULL,

  temporada      text NOT NULL,
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX competiciones_temporada ON competiciones (temporada);

CREATE TABLE partidos (
  id                text PRIMARY KEY,
  competicion       text NOT NULL REFERENCES competiciones(clave) ON DELETE CASCADE,

  jornada           integer,
  fase              text,

  /* Cuándo se juega.

     `cuando` es siempre la fecha; `hora_confirmada` dice si la hora vale. La
     federación publica el partido antes de fijar la hora y entonces manda un
     "00:00" que NO es medianoche: es «todavía no se sabe». Guardarlo sin este
     booleano obliga a cada consumidor a adivinarlo otra vez, y la app acabó
     pintando partidos de madrugada por eso mismo. */
  cuando            timestamptz NOT NULL,
  hora_confirmada   boolean NOT NULL DEFAULT true,

  sede              text,
  local             text NOT NULL,
  visitante         text NOT NULL,

  /* Nulos mientras no se haya jugado.
     Lo que decide que un partido se jugó es que haya sets anotados, no el
     `finalizado` de la federación: ese viene también en los descansos y en los
     partidos sin acta. */
  sets_local        smallint,
  sets_visitante    smallint,
  parciales         text[] NOT NULL DEFAULT '{}',
  estado            text,

  actualizado_en    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX partidos_competicion ON partidos (competicion, cuando);
-- El índice del planning semanal: «qué partidos hay entre estas dos fechas».
CREATE INDEX partidos_cuando ON partidos (cuando);

CREATE TABLE clasificacion (
  competicion text NOT NULL REFERENCES competiciones(clave) ON DELETE CASCADE,
  pos         smallint NOT NULL,
  equipo      text NOT NULL,
  pts         integer NOT NULL DEFAULT 0,
  pj          integer NOT NULL DEFAULT 0,
  -- Sets a favor y en contra.
  sf          integer NOT NULL DEFAULT 0,
  sc          integer NOT NULL DEFAULT 0,
  -- La fila del CV Oviedo, que es la que se resalta en la tabla.
  es_club     boolean NOT NULL DEFAULT false,
  PRIMARY KEY (competicion, pos)
);

/* Cada pasada del raspador, con lo que encontró.

   Existe por una razón concreta: en el cambio de temporada las redes de
   seguridad se apagan —la RFEVB ya ha publicado las nacionales y la FVBPA
   todavía no ha inscrito a la cantera, y un resultado con dos equipos es la
   verdad, no un fallo—. Cuando algo salga raro, esto es lo que permite
   distinguir «la federación cambió» de «el raspador se rompió» sin tener que
   reproducirlo. */
CREATE TABLE raspados (
  id             bigserial PRIMARY KEY,
  empezado_en    timestamptz NOT NULL DEFAULT now(),
  terminado_en   timestamptz,
  ok             boolean,
  competiciones  integer,
  partidos       integer,
  detalle        jsonb
);
