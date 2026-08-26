# Napkin — Club Voleibol Oviedo (web)

Runbook curado del repo. No es un diario: si algo deja de ser útil, se borra.

## Arquitectura y despliegue

1. **Despliegue solo en Railway.** Vercel está apagado (commit `b4f9081`). El
   `vercel.json` sigue en el repo pero no despliega nada. Si no entra un cambio,
   mirar Railway, no Vercel.
2. **Los despliegues esperan aprobación manual.** Un push deja el despliegue en
   `NEEDS_APPROVAL` y GitHub lo publica como `in_progress` para siempre: eso NO
   es un build colgado. Hay CLI con sesión abierta — `railway deployment list`
   dice el estado real, y se aprueba con la mutación `deploymentApprove` de la
   API GraphQL contra `https://backboard.railway.com/graphql/v2`. El token es
   `user.accessToken` de `~/.railway/config.json` (`user.token` está a null y da
   «Not Authorized»), y la mutación hay que mandarla con variables, no con el id
   incrustado en la cadena. Del despliegue aprobado a la web nueva: ~1 min. Ver la memoria
   `deploy-solo-railway`. Aprobar es desplegar a producción: solo si Diego lo pide.
3. **`server.js` sirve el build y redirige 301 al dominio único** (`server.js:76`).
   Cualquier host alternativo acaba en `https://clubvoleiboloviedo.com`.
4. SPA de React + Vite. El contenido de cada ruta lo pinta el cliente; el HTML
   estático solo lleva `<div id="root">` más las metas de reserva.
5. **El repo lo toca más de una persona.** `git fetch` antes de empezar y antes de
   empujar; ya han rebotado pushes por commits de datos de la otra cuenta.
6. **El contenido editable no vive en el código y publicar no necesita desplegar.**
   `api/_almacen.js` guarda en el volumen y `api/contenido.js` lo mezcla con la
   semilla de `src/data/contenido.js`. Con `entrar` + `imagen` + `PUT noticias`
   (`api/panel.js`) un script publica al momento. El `PUT` sustituye la lista
   entera: hay que leer el estado y mandarlo con lo nuevo delante.
   Cada lista es un PUT distinto, así que el panel compara `listas` con
   `publicado` para saber qué falta por publicar y los manda UNO DETRÁS DE OTRO
   (en paralelo se pisarían: el servidor reescribe el fichero entero cada vez).
   Una sección nueva tiene que entrar en `EDITABLES` de `Panel.jsx` o sus
   cambios no contarán como pendientes y se perderán en silencio.
7. **Railway actualiza el despliegue pendiente en vez de crear otro.** Dos pushes
   seguidos dejan UN solo `NEEDS_APPROVAL`, ya apuntando al último commit.
   Comprobarlo por GraphQL (`deployment(id){meta}` da el `commitHash`) antes de
   aprobar, en vez de deducirlo por la hora.
8. **Dos áreas privadas y UNA puerta.** `/acceso` mira la cuenta y reparte: panel
   si es admin, `/club` si es del club. Lo que sostiene los permisos es que
   `api/panel.js` exige `sesionAdmin` y no `sesion` a secas. Ver la memoria
   `area-club-peticiones` antes de tocar nada de sesiones.
9. **Una noticia se deja en borrador y la aprueba Diego.** `scripts/borrador.mjs`
   la mete por `api/resumen.js` y devuelve un enlace; publicarla es un POST que
   dispara un botón que toca él. El enlace solo ENSEÑA, porque Telegram abre los
   enlaces él solo para la miniatura. La clave es `RESUMEN_SECRETO` (Railway) =
   `SITIO_CLAVE` (entorno del script), que además firma el enlace. La versión que
   lee Instagram (`resumen-semanal.mjs` + workflow) está escrita pero con el cron
   APAGADO: no hay token.
10. **Lo privado NO va en `LISTAS`.** Esa constante la recorre `GET /api/contenido`,
   que es público: las cuentas y las peticiones viven en `privado.json`, con sus
   propias funciones. El comentario de `LISTAS` invita a añadir listas ahí; no
   hacerlo sin mirar quién las sirve.

## SEO

1. **Está abierta a buscadores desde el 11-08-2026.** Antes iba `noindex` +
   `Disallow: /`. Los dos interruptores son `index.html:23` y `public/robots.txt`.
2. **El sitemap se genera solo** en cada build con `scripts/sitemap.mjs` a partir de
   las rutas reales. No editarlo a mano al añadir noticia, equipo o patrocinador.
3. **`src/seo.js` reescribe title/description/robots por ruta.** Las metas de
   `index.html` son solo el respaldo para robots que no ejecutan JS (WhatsApp,
   Telegram, X). Google sí ejecuta el JS y ve lo de `seo.js`.
4. El JSON-LD `SportsClub` de `index.html` duplica datos de
   `src/data/contenido.js` (clave `club`). Si cambian allí, cambiarlos también aquí.
5. **Indexada ≠ posicionada.** Antes de proponer cambios de SEO técnico, comprobar
   Search Console → Páginas → Indexadas. Prerenderizar solo si Google no está
   cogiendo las rutas internas.
6. **El JSON-LD va en dos sitios y no se pisan.** El `SportsClub` del club entero
   es fijo y vive en `index.html`; lo que cambia con la ruta lo mete
   `useJsonLd` (`src/seo.js`) en un `<script data-ruta>` que se quita al
   navegar. Los de ruta apuntan al club por `@id` (`ID_CLUB`) en vez de repetir
   sus datos. Hoy lo usan `Noticia.jsx` (NewsArticle) y `Calendario.jsx`
   (SportsEvent de los próximos partidos). Un hook no puede ir detrás del
   `return` del 404: se llama antes y se le pasa null.
7. **Un partido sin pabellón conocido no se declara.** Las federaciones dejan
   `sede` vacía a menudo; jugando fuera, el pabellón del club NO vale de
   relleno. Mismo criterio que con las fechas de las noticias: campo ausente
   antes que campo inventado.
8. **Un partido con fecha futura Y resultado es un dato equivocado, y ya se
   corrige solo.** La FVBPA publica el calendario SIN AÑO ("4 oct") y
   `fvbpa.mjs` le pone el de la temporada deducida del mes de hoy; mientras no
   publiquen la nueva siguen sirviendo la vieja, así que en agosto de 2026 los
   partidos de la 25/26 salían fechados en octubre de 2026 y en 2027, ya
   jugados (eran 150). `isoReal()` en `scrape.mjs` los detecta por el marcador
   —un partido terminado no se juega dentro de tres meses— y les quita un año.
   Para saber si un partido está por venir hay que mirar las dos cosas, fecha y
   resultado; nunca solo la fecha.
9. **La temporada sale de las fechas de los partidos, no del calendario.**
   `temporadaDe()` mira el primer partido de la lista. Por eso la web dice
   "2025/26" mientras las federaciones no suban la nueva, y cambiará sola el día
   que lo hagan. El campo `temporada` del JSON es lo que pinta la cabecera de
   /calendario.
10. **Las temporadas cerradas se archivan.** Cuando el scraper ve que los datos
   nuevos son de otra temporada, copia el JSON anterior a
   `src/data/temporadas/<etiqueta>.json` antes de pisarlo (decisión de Diego,
   21-08-2026: quiere poder consultar los años anteriores). La temporada del
   fichero viejo se vuelve a deducir de SUS fechas, no de la etiqueta que
   llevara escrita. Los ficheros se guardan pero AÚN NO HAY PÁGINA que los
   enseñe.

## Cabeceras e imágenes

1. **El hueco de cabecera es 1600×380 y la foto va a sangre.** Hay tres ficheros que
   mantener sincronizados; ver la memoria `hueco-cabecera-1600x380`.
2. Los favicons (`escudo.svg` + PNG 16/32 + apple-touch 180) salen de
   `public/media/escudo.png`. El SVG es el escudo redibujado, no el monograma.

## Método de trabajo

1. **Diego habla en español y quiere respuestas directas.** Diagnóstico primero,
   pasos concretos después, sin relleno.
2. **Los ficheros van con CRLF.** Para parchear con scripts hay que normalizar a
   LF, hacer el reemplazo y devolver el CRLF al escribir, o los anclajes de
   texto no casan nunca.
3. **Las barras invertidas no sobreviven al heredoc.** Un `d` escrito en un
   script que se manda por Bash llega como `d` y el regex queda roto sin dar
   error. Escribir los patrones sin barras (`[0-9]` en vez de `d`, un espacio
   literal en vez de `s`) y comprobar el fichero después de escribirlo.
2. **No dar por hecho lo que ve Google desde `WebSearch`.** No reproduce los
   resultados reales del usuario. Para preguntas de indexación, pedirle que haga la
   búsqueda `site:` él mismo.
3. Commits en conventional commits, en español en el cuerpo, tal como el historial
   existente (`feat(panel):`, `fix(cabeceras):`, `datos:`).
4. **Con el panel del navegador oculto no se puede verificar nada dinámico.** No
   compone fotogramas: fallan las capturas, `scrollTo` no mueve la página, y
   `IntersectionObserver` y `requestAnimationFrame` no llegan a dispararse NUNCA
   (comprobado el 14-08-2026: `rafTicks:0`, el observador sin una sola entrada
   con el elemento entero en pantalla). Sirve para leer el DOM y medir
   geometría, no para dar por buena una animación.
5. **Truco para probar una animación aun con el panel oculto**: suplantar
   `requestAnimationFrame` por `setTimeout` desde `javascript_tool` y remontar el
   componente navegando por la SPA con `.click()` en un enlace (el `pushState` no
   remonta; la suplantación sobrevive porque no hay recarga). Luego muestrear
   `textContent` cada 300 ms. Confirma la cuenta y el formato; NO confirma que el
   disparo por scroll funcione — eso lo mira Diego en su móvil.
6. **Cuando no se puede enseñar la pantalla, montar un HTML aparte** con la
   geometría real serializada del navegador y mandárselo. Con una barra para
   simular el scroll, Diego juzga el ritmo sin desplegar.
7. **Al probar con `curl`, rutas absolutas al scratchpad.** El shell vuelve al
   directorio del proyecto entre llamadas, y las cookies y salidas acaban en la
   raíz del repo. Mirar `git status` antes de commitear.
8. **El copy de redes va general y cada texto en su propio mensaje de Telegram.**
   Nada de rivales, derbis ni partidos concretos: solo cuándo empieza la liga. Y un
   fichero + un `send-text.ts` por texto, para que Diego lo copie entero sin borrar.
   Ver la memoria `copy-redes-general-y-suelto`.
9. **«He guardado y no sale» se diagnostica con `railway logs`.** El panel deja
   rastro de cada acción (`Panel: admin sube /subidas/…`, `Panel: admin guarda
   noticias (1)`), así que ahí se ve QUÉ lista se guardó de verdad y a qué hora.
   Comparado con `GET /api/contenido`, dice si el fallo está en el navegador o en
   el servidor antes de tocar una línea. Así salió el 19-08-2026 que el botón de
   guardar solo publicaba su pestaña.
10. **Levantar un servidor de verdad para probar el panel y el API.**
   `node server.js` con `PORT`, `DATOS_DIR` al scratchpad y las tres variables
   del panel (la huella se saca con `hashear()` de `api/_acceso.js`). Ahí se ven
   los fallos que el navegador esconde: así salió que ninguna cuenta nueva podía
   entrar. Para reproducir lo que ve Diego SIN su trabajo a medias, `git worktree`
   en HEAD + junction al `node_modules` + `npm run build`. Se entra por
   `fetch('/api/acceso')` desde `javascript_tool`, y se sube una foto metiendo un
   `File` de un `<canvas>` en el `input` con `DataTransfer`. Parar el proceso,
   quitar el worktree y borrar los datos al acabar.

## Quiénes somos (la página con más artesanía)

1. **Los hitos van en DOS versiones y las dos se pintan siempre**: el camino ancho
   (lienzo fijo 1240×1180, pisadas precalculadas) y, por debajo de 1080px, la lista
   con el camino vertical (alto medido en el navegador, pisadas recalculadas con
   `getPointAtLength`). Tocar una obliga a mirar la otra.
2. **`--trazo` se declara en `.camino,.hitos-lista`**, que son hermanas. Declarada
   solo en una, la otra se queda sin color y la regla entera se cae sin avisar.
3. **El estado base es todo visible**; las animaciones de scroll se montan encima
   dentro de `@supports (animation-timeline:view())`. Sin eso, en iPhone
   desaparecería el texto de los hitos, no un adorno.
4. Al medir posiciones para animar, usar `offsetTop` y no `getBoundingClientRect()`:
   el rectángulo recoge los `transform` de la propia animación y descuadra la curva.

## Noticias

1. **Una noticia puede llevar imágenes dentro** (`galeria`: `[{ruta, pie}]`), que
   van enteras debajo del texto — carteles y calendarios no se recortan. Tocan
   cuatro sitios a la vez: `limpiaNoticia` y `rutasUsadas` en `api/panel.js`
   (si la galería no entra en `rutasUsadas`, guardar cualquier otra lista borra
   sus fotos del volumen), `Noticia.jsx`, el control `Galeria` de `Panel.jsx` y
   `.articulo-galeria` en el CSS.
2. **El contenido de producción sale del panel, no de la semilla.**
   `GET /api/contenido` lo dice en `origen`. Añadir una noticia a
   `src/data/contenido.js` NO la publica: la semilla solo se usa si la lista
   guardada está vacía.
3. **El plazo de preinscripción está en DOS sitios y solo uno es código.**
   Las fechas viven en `preinscripcion` (contenido.js) y de ahí salen /inscripciones
   y todas las llamadas del sitio. Pero la noticia `preinscripcion-26-27` que sirve
   el volumen lleva la fecha escrita a mano en `resumen` y `cuerpo` (se congeló al
   publicarla desde el panel): cambiar el código NO la corrige, hay que editarla en
   /panel. Al mover las fechas, mirar siempre las dos.
