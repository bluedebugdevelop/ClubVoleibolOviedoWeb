# Web del Club Voleibol Oviedo

Sitio del club en React + Vite. Se despliega en Vercel desde `main`.

> **Antes de commitear: identidad de git.** El proyecto está en Vercel bajo la
> cuenta `bluedebugdevelop` con **plan Hobby**, y ese plan solo despliega los
> commits cuyo autor es el dueño de la cuenta. Un commit firmado con cualquier
> otro correo deja el despliegue *Blocked* ("Vercel user not found"). Al clonar,
> configura en el repo:
>
> ```bash
> git config user.name  "bluedebugdevelop"
> git config user.email "256811162+bluedebugdevelop@users.noreply.github.com"
> ```
>
> Es `git config` sin `--global`: solo afecta a este repositorio. Para dejar
> constancia de quién escribió cada cosa, usa `Co-Authored-By:` en el mensaje.

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

### Actualización automática (a diario, a las 00:00)

`.github/workflows/datos.yml` baja los datos **todos los días a medianoche
hora española**. Si el JSON cambia, lo commitea; el push dispara el despliegue
en Vercel y la web queda actualizada sola. Si no cambia nada, no commitea.

También se puede lanzar cuando quieras desde **Actions → Actualizar datos de
competición → Run workflow**.

Para que funcione hay que darle permiso de escritura **una sola vez**, con la
cuenta `bluedebugdevelop`:

> **Settings → Actions → General → Workflow permissions → Read and write
> permissions → Save**

Sin eso el scraper se ejecuta pero no puede commitear, y el workflow falla al
hacer push.

Detalles de la programación:

- GitHub ejecuta los cron en **UTC** y no conoce el horario de verano, así que
  hay dos programados (`0 22` y `0 23`) y el primer paso del job descarta el que
  no cae a medianoche en España. Sin ese truco, media temporada se actualizaría
  a las 23:00 y la otra media a la 01:00.
- GitHub no garantiza el minuto exacto: cuando hay mucha carga, los cron
  públicos pueden retrasarse bastantes minutos. Para esto da igual.
- El workflow commitea como `bluedebugdevelop` por lo dicho arriba: firmado con
  otro correo, Vercel deja el despliegue bloqueado.

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
