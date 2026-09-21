-- ==========================================================================
-- Las horas de los partidos y de las citas son HORA DE PARED, no instantes.
--
-- EL FALLO QUE ARREGLA
-- `cuando` nació como `timestamptz`, y eso convierte. El raspador corre en un
-- portátil en Madrid y escribía «17:00» como las 15:00 UTC; el servidor de
-- Railway va en UTC y lo leía de vuelta como las 15:00. El partido del 3 de
-- octubre salía dos horas antes en la web y en la app, y en invierno habría
-- salido una, que es peor todavía porque parece que unos días va bien.
--
-- LO QUE PUBLICA LA FEDERACIÓN NO ES UN INSTANTE
-- Es «a las cinco de la tarde en el pabellón». No lleva zona porque no le hace
-- falta: el partido se juega donde se juega y todo el mundo que lo mira está
-- allí. Guardarlo como instante obliga a elegir una zona que nadie ha dicho, y
-- a partir de ahí cualquier lectura desde otra zona lo mueve.
--
-- Así que `timestamp` sin zona, y se lee con `to_char` en vez de convertirlo a
-- un Date: las cifras que entran son las que salen, corra esto donde corra.
-- Es la misma decisión que ya tomó la app en `aFecha` (lib/web/partidos.ts),
-- donde el ISO se parsea a mano justamente para que ninguna plataforma le
-- aplique su zona.
--
-- La conversión de las filas que ya están usa la zona de Madrid explícitamente,
-- que es la que tenían de hecho: las escribió el raspador desde aquí.
-- ==========================================================================

ALTER TABLE partidos
  ALTER COLUMN cuando TYPE timestamp
  USING (cuando AT TIME ZONE 'Europe/Madrid');

ALTER TABLE eventos
  ALTER COLUMN cuando TYPE timestamp
  USING (cuando AT TIME ZONE 'Europe/Madrid');
