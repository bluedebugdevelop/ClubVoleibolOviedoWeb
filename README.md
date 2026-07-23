# Club Voleibol Oviedo — Web oficial

Web del **Club Voleibol Oviedo** desarrollada con React + Vite + Tailwind CSS.
Diseño moderno y profesional en la gama cromática del club (azul y blanco).

> ⚠️ **Datos de prueba.** Todo el contenido (equipos, jugadores, resultados, noticias,
> productos y patrocinadores) es de ejemplo. Sustitúyelo por los datos reales en
> [`src/data/content.js`](src/data/content.js).

## Secciones

- **Inicio** — hero, estadísticas, equipos destacados, últimas noticias, retransmisiones en directo, patrocinadores.
- **Equipos** — listado de equipos. Cada tarjeta enlaza a la ficha del equipo con **plantilla, resultados y próximo partido**.
- **Noticias** — noticia destacada, listado de noticias y **galería de fotos**.
- **Tienda** — productos oficiales (llavero, gorra, sudadera, botella…) con filtros por categoría.
- **Quiénes somos** — historia, valores e hitos del club.
- **Contacto** — datos de contacto, mapa y formulario.

## Puesta en marcha

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # build de producción en /dist
npm run preview  # previsualizar el build
```

## Tecnología

- [React 18](https://react.dev/) + [React Router 6](https://reactrouter.com/)
- [Vite 5](https://vitejs.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)

## Personalización rápida

| Qué cambiar | Dónde |
|---|---|
| Equipos, jugadores, resultados | `src/data/content.js` → `EQUIPOS` |
| Noticias y galería | `src/data/content.js` → `NOTICIAS`, `GALERIA` |
| Productos de la tienda | `src/data/content.js` → `PRODUCTOS` |
| Patrocinadores | `src/data/content.js` → `PATROCINADORES` |
| Datos del club (email, redes…) | `src/data/content.js` → `CLUB` |
| Colores corporativos | `src/index.css` → bloque `@theme` |
| Logo | `public/images/logo.jpg` |

Las imágenes actuales son *placeholders* generados con los colores del club
(`src/utils/placeholder.js`). Para usar fotos reales, colócalas en `public/images/`
y referencia su ruta (p. ej. `/images/mi-foto.jpg`) en `src/data/content.js`.

---

© Club Voleibol Oviedo
