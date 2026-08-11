import { useEffect, useState } from 'react'
import { ContenidoContexto } from './contenidoContexto'
import {
  noticias as noticiasBase,
  patrocinadoresActuales as patrocinadoresBase,
  equiposSemilla as equiposBase,
} from './contenido'

// Cada lista con su respaldo: si la API no la trae o viene vacía, se queda la
// de `contenido.js`. Se declara fuera del componente para que no se rehaga en
// cada render y el `useEffect` no dependa de un objeto nuevo cada vez.
const BASE = { noticias: noticiasBase, patrocinadores: patrocinadoresBase, equipos: equiposBase }

/* ---------------------------------------------------------------------------
   Noticias, patrocinadores y equipos, que ahora son EDITABLES desde /panel.

   Antes se importaban directamente de `contenido.js` y quedaban compilados en
   el bundle: cambiar una noticia obligaba a tocar código y desplegar. Ahora los
   pide el navegador a `/api/contenido` al cargar.

   Se arranca SIEMPRE con las listas de `contenido.js` y luego se sustituyen si
   la API responde. Con eso:
     · la página pinta contenido desde el primer fotograma, sin parpadeo ni
       esqueletos de carga;
     · si la API falla o el volumen está vacío, se ve lo de siempre en vez de
       una web sin noticias, sin patrocinadores o sin equipos.

   Es una sola petición para todo el sitio, no una por página.
   --------------------------------------------------------------------------- */
export function ProveedorContenido({ children }) {
  const [datos, setDatos] = useState({ ...BASE, cargando: true })

  useEffect(() => {
    let vivo = true
    fetch('/api/contenido')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => {
        if (!vivo) return
        const salida = { cargando: false }
        for (const [clave, respaldo] of Object.entries(BASE)) {
          salida[clave] = Array.isArray(d[clave]) && d[clave].length ? d[clave] : respaldo
        }
        setDatos(salida)
      })
      .catch((e) => {
        // no se le enseña nada al visitante: ya está viendo el contenido de
        // `contenido.js`, que es válido. El motivo queda en consola.
        console.warn('No se pudo cargar /api/contenido, se usa el contenido estático:', e.message)
        if (vivo) setDatos((d) => ({ ...d, cargando: false }))
      })
    return () => {
      vivo = false
    }
  }, [])

  return <ContenidoContexto.Provider value={datos}>{children}</ContenidoContexto.Provider>
}
