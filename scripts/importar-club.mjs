// ==========================================================================
// Trae el club de Firestore a Postgres.
//
//   node scripts/importar-club.mjs          enseña lo que haría
//   node scripts/importar-club.mjs --va     lo hace
//
// Se corre UNA vez para mudarse, y se puede volver a correr sin miedo: todo va
// con ON CONFLICT, así que repetirlo actualiza en vez de duplicar. Mientras
// dure la mudanza eso vale además para resincronizar si alguien sigue dando de
// alta gente por el lado viejo.
//
// LAS CONTRASEÑAS NO SE IMPORTAN, Y ES A PROPÓSITO
// Firebase Auth guarda las contraseñas con un scrypt modificado suyo, y
// verificarlas fuera de Firebase exige sacar la clave de firma del proyecto.
// Es una credencial que abriría todas las cuentas del club de golpe si se
// filtrara, y no hace falta para conseguir lo que se quiere.
//
// En su lugar, la migración es PEREZOSA y la hace `api/_claves.js` al entrar:
// la primera vez que alguien entra con su contraseña de siempre, el servidor
// la comprueba contra Firebase, y si es correcta la guarda ya hasheada aquí
// con el scrypt de Node. A partir de esa vez esa cuenta ya no pasa por
// Firebase. Nadie cambia de contraseña, no hay que repartir nada, y Firebase
// se puede apagar cuando `clave_hash` no sea nula en ninguna fila.
//
// QUÉ SE TRAE Y QUÉ NO
// Se traen personas, equipos, plantillas, horarios, eventos, avisos y chat.
// No se traen los tokens de push: son de un dispositivo y la app los vuelve a
// registrar sola en el primer arranque contra el servidor nuevo. Importarlos
// solo conseguiría mandar avisos a instalaciones que ya no escuchan.
// ==========================================================================

import fs from 'node:fs'
import crypto from 'node:crypto'
import path from 'node:path'

import { consulta, enTransaccion, hayBd } from '../api/_bd.js'

const VA = process.argv.includes('--va')

// --------------------------------------------------------------- Firestore

function cuentaServicio() {
  const crudo = process.env.CVO_CUENTA_SERVICIO
  if (crudo) {
    return crudo.trim().startsWith('{') ? JSON.parse(crudo) : JSON.parse(fs.readFileSync(crudo, 'utf8'))
  }
  // En local, la misma que usa la app para sus scripts.
  const dir = process.env.CVO_SECRETOS || path.join('C:', 'Projects', 'CVOApp', 'secretos')
  const f = fs.existsSync(dir)
    ? fs.readdirSync(dir).find((x) => x.includes('adminsdk') && x.endsWith('.json'))
    : null
  if (!f) {
    throw new Error(
      'No encuentro la cuenta de servicio de Firebase. Exporta CVO_CUENTA_SERVICIO ' +
        'con su contenido o su ruta, o CVO_SECRETOS con la carpeta que la tiene.',
    )
  }
  return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
}

/** Token de solo lectura sobre Firestore. */
async function tokenFirestore(cuenta) {
  const b = (x) => Buffer.from(x).toString('base64url')
  const ahora = Math.floor(Date.now() / 1000)
  const cabecera = b(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const cuerpo = b(
    JSON.stringify({
      iss: cuenta.client_email,
      scope: 'https://www.googleapis.com/auth/datastore',
      aud: 'https://oauth2.googleapis.com/token',
      iat: ahora,
      exp: ahora + 3600,
    }),
  )
  const firma = crypto
    .createSign('RSA-SHA256')
    .update(`${cabecera}.${cuerpo}`)
    .sign(cuenta.private_key)
    .toString('base64url')

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${cabecera}.${cuerpo}.${firma}`,
    }),
  })
  const j = await r.json()
  if (!j.access_token) throw new Error('Google no dio token para Firestore')
  return j.access_token
}

/** Un valor de la API REST de Firestore a algo de JavaScript. */
function leer(v) {
  if (!v) return null
  if ('stringValue' in v) return v.stringValue
  if ('booleanValue' in v) return v.booleanValue
  if ('integerValue' in v) return Number(v.integerValue)
  if ('doubleValue' in v) return v.doubleValue
  if ('timestampValue' in v) return new Date(v.timestampValue)
  if ('nullValue' in v) return null
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(leer)
  if ('mapValue' in v) {
    return Object.fromEntries(Object.entries(v.mapValue.fields ?? {}).map(([k, x]) => [k, leer(x)]))
  }
  return null
}

function crearLector(proyecto, acceso) {
  const raiz = `https://firestore.googleapis.com/v1/projects/${proyecto}/databases/(default)/documents`
  return async function coleccion(ruta) {
    const salida = []
    let pagina = null
    do {
      const sufijo = pagina ? `&pageToken=${encodeURIComponent(pagina)}` : ''
      const r = await fetch(`${raiz}/${ruta}?pageSize=300${sufijo}`, {
        headers: { authorization: `Bearer ${acceso}` },
      })
      const j = await r.json()
      if (!r.ok) throw new Error(`Firestore ${r.status} en ${ruta}: ${j?.error?.message ?? ''}`)
      for (const d of j.documents ?? []) {
        salida.push({
          id: d.name.split('/').pop(),
          ...Object.fromEntries(Object.entries(d.fields ?? {}).map(([k, v]) => [k, leer(v)])),
        })
      }
      pagina = j.nextPageToken ?? null
    } while (pagina)
    return salida
  }
}

// ------------------------------------------------------------------ ayudas

const ROLES_VALIDOS = new Set(['jugador', 'entrenador', 'admin'])

/** Los roles de una ficha, admitiendo el formato viejo en singular. */
function rolesDe(doc) {
  const brutos = Array.isArray(doc.roles) && doc.roles.length > 0 ? doc.roles : [doc.rol]
  const limpios = brutos.filter((r) => typeof r === 'string' && ROLES_VALIDOS.has(r))
  // Sin nada legible, lo más inofensivo: jugador no abre ninguna puerta.
  return limpios.length > 0 ? [...new Set(limpios)] : ['jugador']
}

const texto = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null)

/** 'HH:MM' válido, o null. Un horario mal escrito no debe tumbar la importación. */
const hora = (v) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(String(v ?? '').trim()) ? String(v).trim() : null)

/** 'YYYY-MM-DDTHH:MM' del scraper y de los eventos, a Date en hora local. */
function aFecha(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(String(iso ?? ''))
  if (!m) return null
  return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0))
}

// -------------------------------------------------------------------- main

async function main() {
  if (!hayBd()) throw new Error('Falta DATABASE_URL')

  const cuenta = cuentaServicio()
  const coleccion = crearLector(cuenta.project_id, await tokenFirestore(cuenta))

  console.log(`Firestore: ${cuenta.project_id}`)
  console.log(VA ? 'Modo: ESCRIBIENDO\n' : 'Modo: ensayo (añade --va para escribir)\n')

  const usuarios = await coleccion('usuarios')
  const equipos = await coleccion('equipos')

  // Lo que cuelga de cada equipo, de una tacada.
  const porEquipo = new Map()
  for (const eq of equipos) {
    porEquipo.set(eq.id, {
      entrenamientos: await coleccion(`equipos/${eq.id}/entrenamientos`),
      eventos: await coleccion(`equipos/${eq.id}/eventos`),
      avisos: await coleccion(`equipos/${eq.id}/avisos`),
      mensajes: await coleccion(`equipos/${eq.id}/mensajes`),
    })
  }

  const cuenta_ = {
    usuarios: usuarios.length,
    equipos: equipos.length,
    entrenamientos: 0,
    eventos: 0,
    avisos: 0,
    mensajes: 0,
  }
  for (const v of porEquipo.values()) {
    cuenta_.entrenamientos += v.entrenamientos.length
    cuenta_.eventos += v.eventos.length
    cuenta_.avisos += v.avisos.length
    cuenta_.mensajes += v.mensajes.length
  }
  console.log('Encontrado en Firestore:')
  for (const [k, v] of Object.entries(cuenta_)) console.log(`  ${k.padEnd(16)} ${v}`)

  if (!VA) {
    console.log('\nNada escrito. Repite con --va.')
    return
  }

  await enTransaccion(async (bd) => {
    // ---- personas ----
    const idDe = new Map() // uid de Firebase -> uuid de Postgres
    for (const u of usuarios) {
      const email = texto(u.email)?.toLowerCase()
      if (!email) {
        console.warn(`  ! ${u.id} sin correo: se salta`)
        continue
      }
      const r = await bd.query(
        `INSERT INTO usuarios (uid_firebase, nombre, email, telefono, dorsal, posicion, activo, creado_en)
         VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, now()))
         ON CONFLICT (uid_firebase) DO UPDATE SET
           nombre = EXCLUDED.nombre, email = EXCLUDED.email, telefono = EXCLUDED.telefono,
           dorsal = EXCLUDED.dorsal, posicion = EXCLUDED.posicion, activo = EXCLUDED.activo
         RETURNING id`,
        [u.id, texto(u.nombre) ?? email, email, texto(u.telefono), texto(u.dorsal),
         texto(u.posicion), u.activo !== false, u.creadoEn ?? null],
      )
      const id = r.rows[0].id
      idDe.set(u.id, id)

      // Los roles se reescriben enteros: es la forma de que quitar uno en
      // Firestore se refleje aquí al repetir la importación.
      await bd.query('DELETE FROM roles_club WHERE usuario_id = $1', [id])
      for (const rol of rolesDe(u)) {
        await bd.query('INSERT INTO roles_club (usuario_id, rol) VALUES ($1, $2)', [id, rol])
      }
    }

    // ---- equipos ----
    const idEquipo = new Map()
    for (const eq of equipos) {
      const nombre = texto(eq.nombre)
      if (!nombre) continue
      /* La competición solo se enlaza si YA está raspada.

         El orden importa: los equipos vienen de Firestore y las competiciones
         del raspador, y si el raspador no ha corrido todavía la clave ajena
         reventaría la importación entera por un dato que llegará solo. Se deja
         a null y lo arregla la siguiente pasada del raspador. */
      const clave = texto(eq.claveCompeticion)
      const existe = clave
        ? (await bd.query('SELECT 1 FROM competiciones WHERE clave = $1', [clave])).rowCount > 0
        : false

      const r = await bd.query(
        `INSERT INTO equipos (id_firestore, nombre, categoria, genero, temporada,
                              clave_competicion, slug_web, archivado, creado_en)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8, COALESCE($9, now()))
         ON CONFLICT (id_firestore) DO UPDATE SET
           nombre = EXCLUDED.nombre, categoria = EXCLUDED.categoria, genero = EXCLUDED.genero,
           temporada = EXCLUDED.temporada, clave_competicion = EXCLUDED.clave_competicion,
           slug_web = EXCLUDED.slug_web, archivado = EXCLUDED.archivado
         RETURNING id`,
        [eq.id, nombre, texto(eq.categoria) ?? 'Sénior', texto(eq.genero) ?? 'Mixto',
         texto(eq.temporada) ?? '2026/27', existe ? clave : null, texto(eq.slugWeb),
         eq.archivado === true, eq.creadoEn ?? null],
      )
      idEquipo.set(eq.id, r.rows[0].id)
    }

    // ---- plantillas ----
    // Las dos listas del equipo se convierten en filas. El papel lo decide la
    // lista en la que estuviera; quien apareciera en las dos se queda como
    // entrenador, que es el papel con mando.
    let plantilla = 0
    for (const eq of equipos) {
      const equipoId = idEquipo.get(eq.id)
      if (!equipoId) continue
      const meter = async (uid, papel) => {
        const usuarioId = idDe.get(uid)
        if (!usuarioId) return
        await bd.query(
          `INSERT INTO plantillas (equipo_id, usuario_id, papel) VALUES ($1,$2,$3)
           ON CONFLICT (equipo_id, usuario_id) DO UPDATE SET papel = EXCLUDED.papel`,
          [equipoId, usuarioId, papel],
        )
        plantilla++
      }
      for (const uid of eq.jugadores ?? []) await meter(uid, 'jugador')
      for (const uid of eq.entrenadores ?? []) await meter(uid, 'entrenador')
    }

    // ---- horarios, eventos, avisos y chat ----
    let entrenos = 0, eventos = 0, avisos = 0, mensajes = 0

    for (const eq of equipos) {
      const equipoId = idEquipo.get(eq.id)
      if (!equipoId) continue
      const suyo = porEquipo.get(eq.id)

      for (const e of suyo.entrenamientos) {
        const ini = hora(e.inicio)
        const fin = hora(e.fin)
        // Sin horas válidas no hay entrenamiento que colocar en un calendario.
        if (!ini || !fin || ini >= fin) continue
        await bd.query(
          `INSERT INTO entrenamientos (equipo_id, dia, inicio, fin, lugar, notas, activo, id_firestore)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT (equipo_id, dia, inicio) DO UPDATE SET
             fin = EXCLUDED.fin, lugar = EXCLUDED.lugar, notas = EXCLUDED.notas,
             activo = EXCLUDED.activo, id_firestore = EXCLUDED.id_firestore`,
          [equipoId, Number(e.dia ?? 1), ini, fin, texto(e.lugar), texto(e.notas),
           e.activo !== false, e.id],
        )
        entrenos++
      }

      for (const ev of suyo.eventos) {
        const cuando = aFecha(ev.iso)
        if (!cuando || !texto(ev.titulo)) continue
        const r = await bd.query(
          `INSERT INTO eventos (equipo_id, titulo, tipo, cuando, lugar, rival, notas, id_firestore)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT (id_firestore) WHERE id_firestore IS NOT NULL DO UPDATE SET
             titulo = EXCLUDED.titulo, tipo = EXCLUDED.tipo, cuando = EXCLUDED.cuando,
             lugar = EXCLUDED.lugar, rival = EXCLUDED.rival, notas = EXCLUDED.notas
           RETURNING id`,
          [equipoId, texto(ev.titulo), ev.tipo === 'partido' ? 'partido' : 'otro', cuando,
           texto(ev.lugar), texto(ev.rival), texto(ev.notas), ev.id],
        )
        for (const uid of ev.convocados ?? []) {
          const usuarioId = idDe.get(uid)
          if (usuarioId) {
            await bd.query(
              'INSERT INTO convocatorias (evento_id, usuario_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
              [r.rows[0].id, usuarioId],
            )
          }
        }
        eventos++
      }

      for (const a of suyo.avisos) {
        if (!texto(a.titulo)) continue
        const r = await bd.query(
          `INSERT INTO avisos (equipo_id, titulo, cuerpo, tipo, autor_id, autor_nombre,
                               requiere_confirmacion, creado_en, id_firestore)
           VALUES ($1,$2,$3,$4,$5,$6,$7, COALESCE($8, now()), $9)
           ON CONFLICT (id_firestore) WHERE id_firestore IS NOT NULL DO UPDATE SET
             titulo = EXCLUDED.titulo, cuerpo = EXCLUDED.cuerpo, tipo = EXCLUDED.tipo
           RETURNING id`,
          [equipoId, texto(a.titulo), a.cuerpo ?? '', a.tipo ?? 'general',
           idDe.get(a.autor) ?? null, texto(a.autorNombre) ?? 'El club',
           a.requiereConfirmacion === true, a.creadoEn ?? null, a.id],
        )
        const avisoId = r.rows[0].id

        /* Las tres listas de Firestore se funden en una fila por persona.

           `leidoPor` da el «lo ha visto» y las otras dos el «voy / no puedo».
           Quien confirmó necesariamente lo leyó, aunque su uid no estuviera en
           `leidoPor`: eran tres arrays sueltos y nada garantizaba que
           cuadraran entre sí. */
        const respuestas = new Map()
        const anotar = (uid, cambio) => {
          const usuarioId = idDe.get(uid)
          if (!usuarioId) return
          respuestas.set(usuarioId, { ...(respuestas.get(usuarioId) ?? {}), ...cambio })
        }
        for (const uid of a.leidoPor ?? []) anotar(uid, { leido: true })
        for (const uid of a.confirmados ?? []) anotar(uid, { leido: true, asiste: true })
        for (const uid of a.rechazados ?? []) anotar(uid, { leido: true, asiste: false })

        for (const [usuarioId, v] of respuestas) {
          await bd.query(
            `INSERT INTO avisos_respuestas (aviso_id, usuario_id, leido_en, asiste)
             VALUES ($1,$2,$3,$4) ON CONFLICT (aviso_id, usuario_id) DO UPDATE SET
               leido_en = EXCLUDED.leido_en, asiste = EXCLUDED.asiste`,
            [avisoId, usuarioId, v.leido ? (a.creadoEn ?? new Date()) : null, v.asiste ?? null],
          )
        }
        avisos++
      }

      for (const m of suyo.mensajes) {
        if (!texto(m.texto)) continue
        await bd.query(
          `INSERT INTO mensajes (equipo_id, autor_id, autor_nombre, autor_papel, texto,
                                 creado_en, id_firestore)
           VALUES ($1,$2,$3,$4,$5, COALESCE($6, now()), $7)
           ON CONFLICT (id_firestore) WHERE id_firestore IS NOT NULL DO NOTHING`,
          [equipoId, idDe.get(m.autor) ?? null, texto(m.autorNombre) ?? 'Alguien',
           m.autorRol === 'entrenador' || m.autorRol === 'admin' ? 'entrenador' : 'jugador',
           String(m.texto).slice(0, 1000), m.creadoEn ?? null, m.id],
        )
        mensajes++
      }

      // La marca de «visto» del chat, que en Firestore vivía en la ficha.
      for (const u of usuarios) {
        const visto = u.lecturasChat?.[eq.id]
        const usuarioId = idDe.get(u.id)
        if (!visto || !usuarioId) continue
        await bd.query(
          `INSERT INTO lecturas_chat (equipo_id, usuario_id, visto_en) VALUES ($1,$2,$3)
           ON CONFLICT (equipo_id, usuario_id) DO UPDATE SET visto_en = EXCLUDED.visto_en`,
          [equipoId, usuarioId, visto],
        )
      }
    }

    console.log('\nImportado a Postgres:')
    console.log(`  usuarios       ${idDe.size}`)
    console.log(`  equipos        ${idEquipo.size}`)
    console.log(`  plantillas     ${plantilla}`)
    console.log(`  entrenamientos ${entrenos}`)
    console.log(`  eventos        ${eventos}`)
    console.log(`  avisos         ${avisos}`)
    console.log(`  mensajes       ${mensajes}`)
  })
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(`\n✗ ${e.message}`)
    process.exit(1)
  })
