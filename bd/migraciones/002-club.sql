-- ==========================================================================
-- El club: quién es quién, qué equipos hay y qué hace cada equipo.
--
-- Esto sustituye a Firestore. Lo que allí eran documentos anidados dentro del
-- equipo aquí son tablas con clave ajena, que es lo que permite preguntar
-- cosas que antes había que montar a mano en el cliente: «qué tiene esta
-- persona esta semana» era leer N subcolecciones y cruzarlas en el móvil.
--
-- DOS DECISIONES QUE EXPLICAN EL RESTO
--
-- 1. Los roles van en una TABLA, no en una columna.
--    La misma persona puede entrenar al infantil y jugar en el sénior. Con una
--    columna `rol` habría que elegir cuál de sus dos vidas cuenta, que es
--    justo el error que el modelo de la app lleva evitando desde el principio.
--    Y hay dos niveles: el rol DE CLUB (lo que puede llegar a ser) vive en
--    `roles_club`, y lo que es EN UN EQUIPO concreto vive en `plantillas`.
--    Ser «entrenador» de club no da mando sobre ningún equipo por sí solo.
--
-- 2. Nada se borra: se archiva o se desactiva.
--    Una baja conserva su histórico —sus mensajes del chat siguen teniendo
--    autor— y un equipo archivado conserva su temporada entera. Por eso casi
--    todas las claves ajenas son ON DELETE RESTRICT salvo donde el borrado sí
--    tiene sentido en cascada (lo que cuelga de un equipo que se borre de
--    verdad, cosa que la aplicación no hace).
-- ==========================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- --------------------------------------------------------------- personas

CREATE TABLE usuarios (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  /* El uid que tenía en Firebase Auth.

     Se conserva después de la migración y no es decorativo: los documentos
     importados (mensajes, avisos, lecturas) venían firmados con él, y mientras
     quede una app sin actualizar en algún móvil, es lo que permite reconocer a
     quien entra. Nulo en las altas nacidas ya aquí. */
  uid_firebase  text UNIQUE,

  nombre        text NOT NULL,
  -- Se guarda en minúsculas y se compara así: nadie debe poder entrar dos
  -- veces por escribir su correo con una mayúscula.
  email         text NOT NULL UNIQUE CHECK (email = lower(email)),

  /* La contraseña, en el formato que diga su propio prefijo.

     Hay dos y conviven a propósito:
       · scrypt$<sal>$<hash>          — las nacidas aquí
       · firebase-scrypt$<sal>$<hash> — las importadas de Firebase Auth, que
         usan el scrypt MODIFICADO de Firebase y necesitan los parámetros del
         proyecto para verificarse (ver `api/_claves.js`).

     Importarlas en su formato original es lo que evita tener que repartir
     contraseña nueva a todo el club. Cuando alguien la cambia, su fila pasa
     sola al formato de aquí. */
  clave_hash    text,

  telefono      text,
  dorsal        text,
  posicion      text,

  -- Una baja no borra a nadie: le cierra la puerta y conserva su histórico.
  activo        boolean NOT NULL DEFAULT true,

  creado_en     timestamptz NOT NULL DEFAULT now(),
  creado_por    uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  ultima_sesion timestamptz
);

CREATE INDEX usuarios_activos ON usuarios (activo) WHERE activo;

CREATE TYPE rol_club AS ENUM ('jugador', 'entrenador', 'admin');

CREATE TABLE roles_club (
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  rol        rol_club NOT NULL,
  PRIMARY KEY (usuario_id, rol)
);

/* Un aparato con la app instalada. Uno por móvil, no uno por persona: mucha
   gente del club tiene la app en el teléfono y en una tablet. */
CREATE TABLE tokens_push (
  token      text PRIMARY KEY,
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  creado_en  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX tokens_push_usuario ON tokens_push (usuario_id);

-- ---------------------------------------------------------------- equipos

CREATE TABLE equipos (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- El id que tenía en Firestore, por lo mismo que `uid_firebase`.
  id_firestore       text UNIQUE,

  nombre             text NOT NULL,
  categoria          text NOT NULL,
  genero             text NOT NULL CHECK (genero IN ('Masculino', 'Femenino', 'Mixto')),
  temporada          text NOT NULL,

  /* Enlace con la competición federada. Nulo en los equipos que no compiten
     —la cantera mientras la FVBPA no los inscriba, la escuela, veteranos—.
     Sin ON DELETE CASCADE: que desaparezca una competición del scraping no
     puede llevarse por delante al equipo y con él su chat. */
  clave_competicion  text REFERENCES competiciones(clave) ON DELETE SET NULL,

  -- El slug de su ficha en la web, a la que publica su plantilla.
  slug_web           text,

  archivado          boolean NOT NULL DEFAULT false,
  creado_en          timestamptz NOT NULL DEFAULT now(),
  creado_por         uuid REFERENCES usuarios(id) ON DELETE SET NULL,

  -- Dos equipos con el mismo nombre en la misma temporada son un duplicado
  -- por error, nunca algo que el club quiera. Es lo que hace idempotente a la
  -- siembra de la temporada.
  UNIQUE (nombre, temporada)
);

CREATE INDEX equipos_temporada ON equipos (temporada) WHERE NOT archivado;

CREATE TYPE papel_equipo AS ENUM ('jugador', 'entrenador');

/* Quién está en qué equipo y como qué.

   En Firestore esto eran DOS listas duplicadas —`jugadores`/`entrenadores` en
   el equipo, y `equipos` en la ficha— que había que escribir siempre juntas
   para que no se desincronizaran. Aquí es una tabla y el problema desaparece:
   una fila es la pertenencia, y la clave primaria impide que alguien esté dos
   veces en el mismo equipo. */
CREATE TABLE plantillas (
  equipo_id  uuid NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  papel      papel_equipo NOT NULL,
  desde      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (equipo_id, usuario_id)
);

CREATE INDEX plantillas_usuario ON plantillas (usuario_id);

-- -------------------------------------------------------------- el horario

/* El entrenamiento que se repite cada semana.
   No tiene fecha: tiene día de la semana, y quien pinta el calendario lo
   coloca. `dia` va 0=domingo..6=sábado, como `Date.getDay()` en JavaScript,
   porque es lo que espera la app; traducirlo aquí crearía dos verdades sobre
   el mismo número. */
CREATE TABLE entrenamientos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipo_id  uuid NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  dia        smallint NOT NULL CHECK (dia BETWEEN 0 AND 6),
  inicio     time NOT NULL,
  fin        time NOT NULL,
  lugar      text,
  notas      text,
  -- Desactivado = suspendido esa temporada, no oculto. Se sigue viendo en el
  -- horario del entrenador, tachado.
  activo     boolean NOT NULL DEFAULT true,
  CHECK (fin > inicio),
  -- El mismo equipo no entrena dos veces el mismo día a la misma hora.
  UNIQUE (equipo_id, dia, inicio)
);

/* Lo que pasa UNA vez y no sale del calendario federado: un amistoso, un
   torneo, la comida de fin de temporada. */
CREATE TABLE eventos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipo_id  uuid NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  titulo     text NOT NULL,
  tipo       text NOT NULL DEFAULT 'otro' CHECK (tipo IN ('partido', 'otro')),
  cuando     timestamptz NOT NULL,
  lugar      text,
  rival      text,
  notas      text,
  creado_en  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX eventos_equipo_cuando ON eventos (equipo_id, cuando);

/* Convocatoria: quién está llamado a un evento.
   Sin filas = va el equipo entero, que es el caso normal. */
CREATE TABLE convocatorias (
  evento_id  uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  PRIMARY KEY (evento_id, usuario_id)
);

-- ----------------------------------------------------------------- avisos

CREATE TYPE tipo_aviso AS ENUM ('general', 'partido', 'entrenamiento', 'urgente');

CREATE TABLE avisos (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipo_id             uuid NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  titulo                text NOT NULL,
  cuerpo                text NOT NULL DEFAULT '',
  tipo                  tipo_aviso NOT NULL DEFAULT 'general',
  autor_id              uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  -- Se guarda el nombre además del autor: si alguien deja el club, su aviso
  -- sigue diciendo quién lo mandó.
  autor_nombre          text NOT NULL,
  requiere_confirmacion boolean NOT NULL DEFAULT false,
  creado_en             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX avisos_equipo ON avisos (equipo_id, creado_en DESC);

/* Lo que cada persona ha hecho con un aviso: si lo ha leído y si va.

   En Firestore eran tres arrays dentro del aviso (`leidoPor`, `confirmados`,
   `rechazados`), y con tres listas separadas nada impedía que alguien
   estuviera a la vez en «voy» y en «no puedo». Aquí es una fila por persona y
   `asiste` es un booleano que además admite NULL, que es exactamente el tercer
   estado que hacía falta: leído pero sin contestar. */
CREATE TABLE avisos_respuestas (
  aviso_id   uuid NOT NULL REFERENCES avisos(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  leido_en   timestamptz,
  asiste     boolean,
  PRIMARY KEY (aviso_id, usuario_id)
);

-- ------------------------------------------------------------------- chat

CREATE TABLE mensajes (
  id           bigserial PRIMARY KEY,
  equipo_id    uuid NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  autor_id     uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  autor_nombre text NOT NULL,
  /* El papel del autor EN ESTE EQUIPO cuando escribió.
     Se congela con el mensaje: si alguien deja de entrenar a un equipo, sus
     mensajes de entonces siguen siendo los del entrenador que era. */
  autor_papel  papel_equipo NOT NULL DEFAULT 'jugador',
  texto        text NOT NULL CHECK (length(texto) BETWEEN 1 AND 1000),
  creado_en    timestamptz NOT NULL DEFAULT now()
);

/* El índice que sostiene el chat: los últimos N de un equipo.
   Descendente porque una conversación se lee del final hacia atrás. */
CREATE INDEX mensajes_equipo ON mensajes (equipo_id, creado_en DESC);

/* Cuándo miró cada persona el chat de cada equipo.
   Es lo que alimenta el globito de no leídos. Una fila por persona y equipo, y
   no una marca por mensaje: marcar un chat como visto sería escribir en cien
   documentos. */
CREATE TABLE lecturas_chat (
  equipo_id  uuid NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  visto_en   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (equipo_id, usuario_id)
);
