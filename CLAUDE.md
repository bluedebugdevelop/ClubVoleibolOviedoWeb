# CVOWeb — web del Club Voleibol Oviedo

Web oficial del club. React 19 + Vite 8 + React Router 7, **CSS propio** en
`src/index.css` (no Tailwind), lint con oxlint. Repo `bluedebugdevelop/ClubVoleibolOviedoWeb`.

## Comandos

```bash
npm run dev        # front en caliente
npm run dev:api    # endpoints de /api en local
npm run datos      # scraping de federaciones -> src/data/competicion.json
npm run build
npm start          # server.js (Express) — lo que corre en producción
npm run lint       # oxlint
```

## Dónde está qué

- `src/data/contenido.js` — **todo el contenido y los datos del sitio**, en
  constantes en español: `club`, `equipos`, `noticias`, `productos`,
  `categoriasTienda`, `hitos`, `valores`. Antes de tocar un componente para
  cambiar un texto, mirar aquí.
- `src/data/competicion.json` — calendario, resultados y clasificaciones. Lo
  genera `npm run datos` y **se commitea**. La web lee el JSON; no scrapea en caliente.
- `src/components/` — Nav, Footer, Crest, PageHead, SectionHead, Sponsors, Stats, JoinCta.
- `api/inscripcion.js`, `api/patrocinio.js` — handlers con firma `(req, res)`.
- `scripts/scrape.mjs` — el scraper.
- `server.js` — Express: sirve `dist/`, monta `api/` como rutas y devuelve
  `index.html` en el resto.

## Convenciones

- Contenido, datos y nombres de dominio **en español**. Código en inglés.
- Gama cromática azul/blanca del club.
- El contenido vive en `contenido.js`, separado de los componentes. Mantenerlo así.

## Trampas ya pagadas — no reintroducir

**Despliegue.** Está en **Railway**, no en Vercel (migrado el 2026-08-07). Vercel
Hobby solo despliega commits cuyo autor es el dueño de la cuenta, y bloqueaba los
commits automáticos del scraper. `vercel.json` sigue en el repo como escape hatch
pero **no lo lee nadie**: sus rewrites y cabeceras están replicados en `server.js`.
Railway necesita que algo escuche en `process.env.PORT` y en `0.0.0.0` (no
localhost), o el servicio queda *Unexposed*. El dominio público no existe hasta
pedirlo: Settings → Networking → Generate Domain.

**Scraping (`scripts/scrape.mjs`).** Cuatro cosas que costaron encontrarse:

1. La clasificación de FVBPA tiene **3 columnas sin cabecera** antes de "Pts". Las
   columnas se mapean **por nombre de cabecera, nunca por índice**.
2. RFEVB (`intranet.rfevb.com`) **declara UTF-8 y sirve ISO-8859-1**. Hay que
   decodificar como latin1 o los nombres salen rotos.
3. Los partidos contra "DESCANSA" son jornadas de descanso con un 3-0 falso: se filtran.
4. `"00:00"` significa hora sin fijar, no medianoche.

El descubrimiento de ids es **automático** (no hay ids fijados) para sobrevivir al
cambio de temporada. No cablear ids.

**Un club puede tener dos equipos de la misma categoría y género en divisiones
distintas** (sénior masculino en 1ª Nacional y en 2ª). La división entra en la
clave de fusión.

`.github/workflows/datos.yml` refresca los datos a diario y **commitea firmando con
el email noreply de GitHub del usuario**.

## Estado

- 11 equipos federados. Sede: Polideportivo José Manuel Fuente (Colloto, Oviedo).
- Los formularios de contacto, inscripción y tienda **aún no tienen envío
  automático conectado**.
- La maqueta inicial fue reemplazada por la versión de producción que trajo Diego
  desde `Diegocharro/cvo-web`. **La versión actual manda.**
