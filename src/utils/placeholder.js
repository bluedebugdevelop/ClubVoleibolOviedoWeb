// Genera una imagen placeholder como data-URI SVG con los colores del club.
// Útil para maquetar sin depender de servicios externos ni de archivos reales.
// Cuando tengas las fotos reales, sustituye las llamadas ph(...) por rutas
// tipo '/images/mi-foto.jpg' en src/data/content.js

const PALETAS = [
  ['#082139', '#1560bd'],
  ['#0b2f52', '#1d74d8'],
  ['#0f3d6b', '#3d94ef'],
  ['#05192e', '#1560bd'],
]

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function ph(label = '', w = 800, h = 600) {
  const [c1, c2] = PALETAS[hash(label) % PALETAS.length]
  const fontSize = Math.round(Math.min(w, h) / 12)
  const cx = w / 2
  const cy = h / 2
  const r = Math.min(w, h) * 0.28

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <g opacity="0.18" stroke="#ffffff" stroke-width="${Math.max(2, r * 0.03)}" fill="none">
    <circle cx="${cx}" cy="${cy}" r="${r}"/>
    <path d="M ${cx - r} ${cy} Q ${cx} ${cy - r * 0.7} ${cx + r} ${cy}"/>
    <path d="M ${cx - r * 0.7} ${cy + r * 0.7} Q ${cx} ${cy} ${cx + r * 0.2} ${cy - r}"/>
    <path d="M ${cx + r * 0.7} ${cy + r * 0.7} Q ${cx} ${cy} ${cx - r * 0.2} ${cy - r}"/>
  </g>
  <text x="50%" y="50%" fill="#ffffff" fill-opacity="0.92" font-family="Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700" text-anchor="middle" dominant-baseline="middle">${escapeXml(label)}</text>
</svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  }[c]))
}
