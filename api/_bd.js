// ==========================================================================
// La base de datos: la conexión y las migraciones.
//
// Postgres en Railway, en el mismo proyecto que la web. La web y la app del
// club leen y escriben aquí, que es lo que hace que sean el mismo club y no
// dos sistemas que se parecen.
//
// POR QUÉ LAS MIGRACIONES CORREN AL ARRANCAR
// Porque el despliegue de Railway es un contenedor que se levanta y ya: no hay
// un paso «ejecuta esto antes» donde encajar un comando. Correrlas en el
// arranque significa que desplegar y migrar son la misma operación, que es
// justo lo que se quiere — una versión del código nunca se encuentra con un
// esquema que no conoce.
//
// Son idempotentes y van en orden: cada fichero de `bd/migraciones/` se aplica
// una vez y se apunta en `migraciones`. Un fichero ya aplicado se salta. Se
// comparan por NOMBRE, no por contenido: una migración ya aplicada no se
// reescribe nunca —se añade otra encima—, porque en la base de datos que ya
// está en producción reescribirla no cambiaría nada y solo haría que el
// fichero mintiera sobre lo que hay.
//
// Cada una va dentro de su propia transacción. Si la de en medio falla, las
// anteriores quedan aplicadas y esa no: el arranque se detiene con el error a
// la vista en vez de dejar el esquema a medias sin decirlo.
//
// SIN BASE DE DATOS, LA WEB SIGUE EN PIE
// `DATABASE_URL` puede no estar (en local, o si alguien la borra). Entonces
// `hayBd()` es false y quien la necesite responde que no está disponible, pero
// el sitio se sirve igual. Es la misma decisión que ya tomaba el panel al
// faltarle sus variables.
// ==========================================================================

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const MIGRACIONES = path.join(raiz, 'bd', 'migraciones')

const URL_BD = (process.env.DATABASE_URL || '').trim()

export const hayBd = () => URL_BD.length > 0

/* Railway sirve Postgres con un certificado propio.

   Dentro de la red privada (`postgres.railway.internal`) el tráfico no sale de
   la máquina y no hace falta TLS. A través del proxy público sí, y el
   certificado no lo firma una CA conocida, de ahí `rejectUnauthorized: false`.
   No es una laxitud gratuita: es un certificado autofirmado de Railway y la
   alternativa sería empaquetar su CA para ganar nada. */
const esInterna = /\.railway\.internal/.test(URL_BD)

export const pool = hayBd()
  ? new pg.Pool({
      connectionString: URL_BD,
      ssl: esInterna ? false : { rejectUnauthorized: false },
      // Railway corta las conexiones ociosas; con el pool por defecto (10) y
      // este sitio, sobra de largo.
      max: 8,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    })
  : null

/** Una consulta. Lanza si no hay base de datos, que es un fallo de montaje. */
export async function consulta(texto, valores = []) {
  if (!pool) throw new Error('No hay DATABASE_URL: la base de datos no está configurada')
  return pool.query(texto, valores)
}

/** Las filas, que es lo que se quiere el 90% de las veces. */
export async function filas(texto, valores = []) {
  const r = await consulta(texto, valores)
  return r.rows
}

/** La primera fila, o `null`. */
export async function fila(texto, valores = []) {
  const r = await consulta(texto, valores)
  return r.rows[0] ?? null
}

/**
 * Varias sentencias como una sola operación.
 *
 * Lo pide todo lo que escribe en dos tablas a la vez —meter a alguien en un
 * equipo, responder a un aviso— y es lo que en Firestore había que hacer a
 * mano con `writeBatch` para que no quedara media escritura.
 */
export async function enTransaccion(trabajo) {
  if (!pool) throw new Error('No hay DATABASE_URL: la base de datos no está configurada')
  const cliente = await pool.connect()
  try {
    await cliente.query('BEGIN')
    const resultado = await trabajo(cliente)
    await cliente.query('COMMIT')
    return resultado
  } catch (e) {
    await cliente.query('ROLLBACK').catch(() => {})
    throw e
  } finally {
    cliente.release()
  }
}

// --------------------------------------------------------------- migrar

export async function migrar() {
  if (!pool) {
    console.warn('AVISO: sin DATABASE_URL. La web funciona, pero el club y la competición no.')
    return { aplicadas: 0, saltadas: 0 }
  }

  await consulta(`
    CREATE TABLE IF NOT EXISTS migraciones (
      nombre      text PRIMARY KEY,
      aplicada_en timestamptz NOT NULL DEFAULT now()
    )
  `)

  const hechas = new Set((await filas('SELECT nombre FROM migraciones')).map((f) => f.nombre))

  // Por nombre, que es lo que fija el orden: 001-, 002-, 003-...
  const ficheros = fs
    .readdirSync(MIGRACIONES)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  let aplicadas = 0
  for (const fichero of ficheros) {
    if (hechas.has(fichero)) continue

    const sql = fs.readFileSync(path.join(MIGRACIONES, fichero), 'utf8')
    const cliente = await pool.connect()
    try {
      await cliente.query('BEGIN')
      await cliente.query(sql)
      await cliente.query('INSERT INTO migraciones (nombre) VALUES ($1)', [fichero])
      await cliente.query('COMMIT')
      console.log(`bd: aplicada ${fichero}`)
      aplicadas++
    } catch (e) {
      await cliente.query('ROLLBACK').catch(() => {})
      // Se relanza en vez de seguir: arrancar con el esquema a medias es peor
      // que no arrancar, porque el fallo aparecería más tarde y en otro sitio.
      throw new Error(`La migración ${fichero} falló: ${e.message}`)
    } finally {
      cliente.release()
    }
  }

  return { aplicadas, saltadas: ficheros.length - aplicadas }
}
