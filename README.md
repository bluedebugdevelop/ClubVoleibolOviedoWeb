# Web del Club Voleibol Oviedo

Sitio del club en React + Vite. Se despliega en Vercel desde `main`.

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción
npm run lint     # oxlint
npm run datos    # actualiza los datos de competición (ver abajo)
```

## Datos de competición

Calendario, resultados y clasificaciones **no se escriben a mano**: se bajan de
las dos federaciones donde compite el club.

| Fuente | Qué cubre | De dónde sale |
| --- | --- | --- |
| **FVBPA** — Federación Asturiana | Cantera y equipos territoriales | [fvbpa.com](https://www.fvbpa.com) |
| **RFEVB** — Federación Española | Los equipos de categoría nacional | [esvoley.es](https://esvoley.es) |

```bash
npm run datos            # baja los datos y escribe src/data/competicion.json
npm run datos -- --seco  # solo enseña lo que encontraría, sin escribir
```

El resultado se guarda en `src/data/competicion.json`, **que se commitea**. La
web lee ese JSON: no hay scraping en caliente, así que la página carga al
instante y una caída de las federaciones no deja el calendario en blanco.

### Cómo encuentra los equipos

El scraper **no lleva los ids de competición fijados**. Recorre todas las
categorías de la federación asturiana (de sénior a minibenjamín) y se queda con
los grupos donde aparece algún equipo del club — `CV Oviedo`, `CV Oviedo A`,
`CV Oviedo B`… Para las nacionales prueba los grupos de Superliga Masculina 2 y
Primera División Femenina y conserva aquel donde juega el club.

Esto es a propósito: cada temporada las federaciones crean competiciones nuevas
con ids distintos. Al descubrirlos solos, el cambio de temporada no obliga a
tocar código. Si el club sube, baja o mete un equipo nuevo, aparece sin más.

### Actualización automática

`.github/workflows/datos.yml` lo ejecuta a diario (y otra vez las tardes de fin
de semana). Si el JSON cambia, lo commitea y el push despliega en Vercel.
También se puede lanzar a mano desde la pestaña **Actions → Actualizar datos de
competición → Run workflow**.

> El workflow commitea con el correo de GitHub del propietario del proyecto en
> Vercel. En el plan Hobby, un commit de otro autor deja el despliegue
> **bloqueado**, así que ese dato no es cosmético.

### Estructura

```
scripts/
  scrape.mjs          punto de entrada: une las dos fuentes y escribe el JSON
  fuentes/fvbpa.mjs   federación asturiana
  fuentes/rfevb.mjs   federación española
  lib/                utilidades de red y de HTML (sin dependencias)
src/data/
  competicion.json    datos generados
  competicion.js      adapta el JSON a lo que pintan las páginas
```

`src/data/competicion.js` es la única pieza que tocan las páginas. Si el JSON
estuviera vacío, cae solo en los datos de muestra de `contenido.js`, así que la
web nunca se queda sin calendario.

## Datos que siguen siendo de muestra

Plantillas, cuerpo técnico, noticias, productos de la tienda y enlaces de
retransmisión están en `src/data/contenido.js` a la espera de los reales. Las
federaciones no publican esa información.
