// Descarga de páginas con reintentos y decodificación correcta.
//
// OJO con la codificación: intranet.rfevb.com declara `charset=UTF-8` en la
// cabecera pero en realidad sirve ISO-8859-1 (el byte 0xD3 es "Ó" en latin-1,
// no un carácter UTF-8 válido). Si se decodifica como UTF-8 los nombres salen
// con "�". Por eso cada fuente dice explícitamente en qué juego de caracteres
// habla, en vez de fiarnos de la cabecera.

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const espera = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * @param {string} url
 * @param {{charset?: 'utf-8'|'latin1', referer?: string, intentos?: number}} opts
 * @returns {Promise<string>}
 */
export async function bajar(url, opts = {}) {
  const { charset = 'utf-8', referer, intentos = 3 } = opts
  let ultimoError

  for (let i = 0; i < intentos; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': UA,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9',
          ...(referer ? { Referer: referer } : {}),
        },
        signal: AbortSignal.timeout(45_000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = await res.arrayBuffer()
      return new TextDecoder(charset === 'latin1' ? 'windows-1252' : 'utf-8').decode(buf)
    } catch (e) {
      ultimoError = e
      if (i < intentos - 1) await espera(800 * (i + 1))
    }
  }
  throw new Error(`No se pudo bajar ${url}: ${ultimoError?.message ?? ultimoError}`)
}

export async function bajarJson(url, opts = {}) {
  return JSON.parse(await bajar(url, opts))
}
