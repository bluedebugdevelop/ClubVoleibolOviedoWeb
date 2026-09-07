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

**Scraping FVBPA (`scripts/fuentes/fvbpa.mjs`).** La clasificación tiene **3
columnas sin cabecera** antes de "Pts": las columnas se mapean **por nombre de
cabecera, nunca por índice**. Los partidos contra "DESCANSA" son jornadas de
descanso con un 3-0 falso: se filtran. `"00:00"` es hora sin fijar, no medianoche.

**Scraping RFEVB (`scripts/fuentes/rfevb.mjs`).** esvoley.es se rehízo entero en
2026: **ya no existen `auxCampeonato` ni `intranet.rfevb.com`**. Hoy:

1. La página del grupo lleva su id en `<input id="HiddenGrupoId">` y pide los
   datos a `rfevb.fontventa.com/api/competiciones` (`getJornadasCalendario`,
   `getClasificacionGrupo`, `getPartidosByJornada`). JSON limpio y UTF-8 de
   verdad; el apaño de latin1 solo hace falta ya para fuentes antiguas.
2. Los grupos se descubren **del menú de esvoley**, que enlaza todos los de las
   ligas sénior nacionales y además lleva escrito el nombre bonito de cada
   competición. La API los da EN MAYÚSCULAS y sin tildes.
3. Clasificación y resultados devuelven los equipos en mayúsculas;
   `getJornadasCalendario` los da bien escritos. De ahí sale el mapa de nombres.
4. `finalizado: true` viene también en los descansos y en partidos sin acta: lo
   que decide que un partido se jugó es **que haya sets anotados**.
5. En la RFEVB el club se llama **"CLUB VOLEIBOL OVIEDO"**, no "CV OVIEDO"
   (`esDelClub` reconoce las dos formas). `"0:00"` es hora sin fijar.

El descubrimiento de ids es **automático** en las dos fuentes (no hay ids
fijados) para sobrevivir al cambio de temporada. No cablear ids.

**Un club puede tener dos equipos de la misma categoría y género en divisiones
distintas** (sénior masculino en 1ª Nacional y en 2ª). La división entra en la
clave de fusión.

**En el cambio de temporada las redes de seguridad se apagan.** `scrape.mjs` se
niega a escribir si una fuente pierde todos sus equipos, pero eso solo vale
dentro de una temporada: en septiembre la RFEVB ya ha publicado las nacionales y
la FVBPA aún no tiene ni un equipo inscrito, y un JSON con dos equipos es la
verdad. La temporada que se cierra se archiva en `src/data/temporadas/`.

`.github/workflows/datos.yml` refresca los datos a diario y **commitea firmando con
el email noreply de GitHub del usuario**. Añade también `src/data/temporadas/`,
que nace sin seguimiento el día del cambio de temporada.

## Estado

- Temporada **2026/27**: el sénior masculino subió a **Superliga Masculina 2,
  Grupo C**, y el femenino sigue en **Primera División Femenina, Grupo A**. La
  FVBPA no ha inscrito todavía a la cantera, así que hasta que lo haga el JSON
  solo tiene esos dos equipos y la web los enseña solos.
- 11 equipos federados. Sede: Polideportivo José Manuel Fuente (Colloto, Oviedo).
- Los formularios de contacto, inscripción y tienda **aún no tienen envío
  automático conectado**.
- La maqueta inicial fue reemplazada por la versión de producción que trajo Diego
  desde `Diegocharro/cvo-web`. **La versión actual manda.**
