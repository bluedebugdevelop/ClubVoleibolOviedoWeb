import { createContext, useContext } from 'react'
import {
  noticias as noticiasBase,
  patrocinadoresActuales as patrocinadoresBase,
  equiposSemilla as equiposBase,
} from './contenido'
import { fotoPorDefecto, fotosSemilla } from './fotosSitio'

/* El contexto y sus hooks, separados del proveedor (`ProveedorContenido.jsx`)
   porque un fichero que exporta un componente Y otras cosas rompe el fast
   refresh de Vite. Aquí no hay JSX, solo datos y hooks.

   El valor por defecto son las listas de `contenido.js`: si alguien usara un
   hook fuera del proveedor, vería el contenido de siempre en vez de romperse. */

export const ContenidoContexto = createContext({
  noticias: noticiasBase,
  patrocinadores: patrocinadoresBase,
  equipos: equiposBase,
  fotos: fotosSemilla(),
  cargando: false,
})

export function useContenido() {
  return useContext(ContenidoContexto)
}

export function useNoticias() {
  return useContenido().noticias
}

export function usePatrocinadores() {
  return useContenido().patrocinadores
}

export function useEquipos() {
  return useContenido().equipos
}

/**
 * La foto de una sección (cabeceras, portada, pabellón…).
 *
 * Devuelve la que haya puesto el panel y, si no hay ninguna, la que trae el
 * código. Así una página nunca se queda sin foto de fondo, ni siquiera cuando
 * el panel guardó la clave con la ruta vacía para deshacer un cambio.
 */
export function useFoto(clave) {
  const guardada = useContenido().fotos?.find((f) => f.clave === clave)?.ruta
  return guardada || fotoPorDefecto(clave)
}
