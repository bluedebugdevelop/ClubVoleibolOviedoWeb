// Utilidades mínimas de HTML. No usamos un parser completo a propósito: las dos
// federaciones sirven HTML muy plano y estable, y así el scraper no arrastra
// dependencias (importa: se ejecuta en CI y en Vercel sin instalar nada extra).

const ENTIDADES = {
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú',
  ntilde: 'ñ', Ntilde: 'Ñ', uuml: 'ü', Uuml: 'Ü', ccedil: 'ç', Ccedil: 'Ç',
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  ordm: 'º', ordf: 'ª', deg: '°', period: '.', middot: '·', ndash: '–', mdash: '—',
}

/** Convierte entidades HTML (&oacute;, &#243;, &#xF3;) a texto. */
export function entidades(s) {
  return String(s)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTIDADES[n] ?? m)
}

/** Quita etiquetas y normaliza espacios. */
export function texto(html) {
  return entidades(String(html).replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

/** Todos los trozos que casan con una expresión regular global. */
export function todos(re, s) {
  return [...String(s).matchAll(re)]
}

/**
 * Contenido de los <div class="X"> de un HTML (no anidados entre sí).
 * Devuelve el texto ya limpio de cada uno.
 */
export function divs(html, clase) {
  const re = new RegExp(`class="[^"]*\\b${clase}\\b[^"]*"[^>]*>([\\s\\S]*?)</div>`, 'g')
  return todos(re, html).map((m) => texto(m[1]))
}

/** Primer <div class="X"> (texto limpio) o '' si no está. */
export function div(html, clase) {
  return divs(html, clase)[0] ?? ''
}

/** Filas <tr>…</tr> de un HTML, cada una como array de celdas en texto. */
export function filas(html) {
  return todos(/<tr[^>]*>([\s\S]*?)<\/tr>/g, html).map((m) =>
    todos(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g, m[1]).map((c) => texto(c[1])),
  )
}
