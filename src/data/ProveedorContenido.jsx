import { useEffect, useState } from 'react'
import { ContenidoContexto } from './contenidoContexto'
import { noticias as noticiasBase, patrocinadoresActuales as patrocinadoresBase } from './contenido'

/* ---------------------------------------------------------------------------
   Noticias y patrocinadores, que ahora son EDITABLES desde /panel.

   Antes se importaban directamente de `contenido.js` y quedaban compilados en
   el bundle: cambiar una noticia obligaba a tocar código y desplegar. Ahora los
   pide el navegador a `/api/contenido` al cargar.

   Se arranca SIEMPRE con las listas de `contenido.js` y luego se sustituyen si
   la API responde. Con eso:
     · la página pinta contenido desde el primer fotograma, sin parpadeo ni
       esqueletos de carga;
     · si la API falla o el volumen está vacío, se ve lo de siempre en vez de
       una web sin noticias ni patrocinadores.

   Es una sola petición para todo el sitio, no una por página.
   --------------------------------------------------------------------------- */
export function ProveedorContenido({ children }) {
  const [datos, setDatos] = useState({
    noticias: noticiasBase,
    patrocinadores: patrocinadoresBase,
    cargando: true,
  })

  useEffect(() => {
    let vivo = true
    fetch('/api/contenido')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => {
        if (!vivo) return
        setDatos({
          noticias: Array.isArray(d.noticias) && d.noticias.length ? d.noticias : noticiasBase,
          patrocinadores:
            Array.isArray(d.patrocinadores) && d.patrocinadores.length
              ? d.patrocinadores
              : patrocinadoresBase,
          cargando: false,
        })
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
