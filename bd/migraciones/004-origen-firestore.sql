-- ==========================================================================
-- De dónde vino cada fila importada.
--
-- `usuarios` y `equipos` ya guardaban su id de Firestore, y por eso su
-- importación se podía repetir sin duplicar. Lo que cuelga de un equipo no lo
-- guardaba, así que una segunda pasada del importador habría metido otra vez
-- todos los avisos y todos los mensajes.
--
-- Y una segunda pasada hay que darla sí o sí: la mudanza no es instantánea, y
-- mientras la app vieja siga dando de alta gente por el lado de Firestore hay
-- que poder resincronizar. Un importador que no se puede repetir obliga a
-- acertar a la primera.
--
-- Nulo en todo lo que nazca ya aquí, que a partir de la mudanza es todo.
-- Por eso el índice es UNIQUE pero parcial: varios NULL no chocan entre sí en
-- Postgres, pero se deja explícito para que se lea la intención.
-- ==========================================================================

ALTER TABLE entrenamientos ADD COLUMN id_firestore text;
ALTER TABLE eventos        ADD COLUMN id_firestore text;
ALTER TABLE avisos         ADD COLUMN id_firestore text;
ALTER TABLE mensajes       ADD COLUMN id_firestore text;

CREATE UNIQUE INDEX entrenamientos_origen ON entrenamientos (id_firestore)
  WHERE id_firestore IS NOT NULL;
CREATE UNIQUE INDEX eventos_origen ON eventos (id_firestore)
  WHERE id_firestore IS NOT NULL;
CREATE UNIQUE INDEX avisos_origen ON avisos (id_firestore)
  WHERE id_firestore IS NOT NULL;
CREATE UNIQUE INDEX mensajes_origen ON mensajes (id_firestore)
  WHERE id_firestore IS NOT NULL;
