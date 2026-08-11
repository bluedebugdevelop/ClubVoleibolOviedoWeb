import { createContext, useContext } from 'react'
import { noticias as noticiasBase, patrocinadoresActuales as patrocinadoresBase } from './contenido'

/* El contexto y sus hooks, separados del proveedor (`ProveedorContenido.jsx`)
   porque un fichero que exporta un componente Y otras cosas rompe el fast
   refresh de Vite. Aquí no hay JSX, solo datos y hooks.

   El valor por defecto son las listas de `contenido.js`: si alguien usara un
   hook fuera del proveedor, vería el contenido de siempre en vez de romperse. */

export const ContenidoContexto = createContext({
  noticias: noticiasBase,
  patrocinadores: patrocinadoresBase,
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
