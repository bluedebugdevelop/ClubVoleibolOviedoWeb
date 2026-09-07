// Completa con escudos un competicion.json ya generado.
//
//   npm run escudos
//
// `npm run datos` ya los resuelve al scrapear, pero eso rescrapea las dos
// federaciones enteras. Esto solo pide la clasificación de cada grupo nacional
// (una petición por grupo, que es donde la RFEVB dice el escudo de cada club),
// baja los que falten a public/media/escudos y los apunta en el JSON. El
// calendario y los resultados no se tocan.
//
// Los equipos de la FVBPA (toda la cantera) se quedan sin escudo: su federación
// no publica ninguno, y la web les pinta un monograma con las iniciales.

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { escudosDeGrupo } from './fuentes/rfevb.mjs'
import { resolverEscudos } from './lib/escudos.mjs'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const DESTINO = join(RAIZ, 'src', 'data', 'competicion.json')

const log = (...a) => console.log(...a)

/* La API devuelve los nombres A GRITOS y el JSON los tiene ya arreglados, así
   que se casan en mayúsculas (mismo criterio que fuentes/rfevb.mjs). */
const clave = (s) => String(s ?? '').replace(/\s+/g, ' ').trim().toUpperCase()

async function main() {
  const datos = JSON.parse(await readFile(DESTINO, 'utf-8'))
  const equipos = datos.equipos ?? []
  const nacionales = equipos.filter((e) => e.ente === 'RFEVB' && e.idGrupo)

  log(`Escudos · ${nacionales.length} grupos nacionales que mirar`)

  for (const equipo of nacionales) {
    const mapa = await escudosDeGrupo(equipo.idGrupo)
    let puestos = 0
    for (const fila of equipo.clasificacion ?? []) {
      const url = mapa[clave(fila.equipo)]
      if (url) {
        fila.escudoUrl = url
        puestos++
      }
    }
    log(`  ${equipo.division} ${equipo.grupo}: ${puestos} de ${equipo.clasificacion?.length ?? 0}`)
  }

  await resolverEscudos(equipos, { log })

  const conEscudo = equipos.reduce((n, e) => n + Object.keys(e.escudos ?? {}).length, 0)
  await writeFile(DESTINO, `${JSON.stringify(datos, null, 1)}\n`, 'utf-8')
  log(`\n${conEscudo} escudos apuntados. Escrito ${DESTINO}`)
}

main().catch((e) => {
  console.error('\nError inesperado:', e)
  process.exitCode = 1
})
