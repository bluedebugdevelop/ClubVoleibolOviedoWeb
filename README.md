# Web del Club Voleibol Oviedo

Sitio del club en React + Vite. Se despliega en **Railway** desde `main`.
`server.js` (Express) sirve `dist/` y monta los tres endpoints de `api/`.

```bash
npm install
npm run dev      # front (Vite). Pasa /api por proxy a localhost:3000
npm run dev:api  # servidor Express, para probar los formularios en local
npm run build    # build de producción
npm run start    # lo que ejecuta Railway
npm run lint     # oxlint
npm run datos    # actualiza los datos de competición (ver abajo)
npm run resumen  # redacta la noticia semanal de Instagram (ver abajo)
```

## Formularios y correo

Los tres formularios de la web mandan un correo y **no guardan nada**:

| Formulario | Endpoint | A dónde llega |
| --- | --- | --- |
| Contacto | `/api/contacto` | `CONTACTO_TO` · por defecto el buzón de patrocinio |
| Patrocinio | `/api/patrocinio` | `PATROCINIO_TO` · por defecto `cvopatrocinadores@` |
| Inscripción | `/api/inscripcion` | `INSCRIPCIONES_TO` · por defecto `info@` |

> El de inscripción **no se usa hoy**: las preinscripciones van al Google Form
> del club. El código sigue entero y vuelve poniendo `formularioInscripcionUrl`
> a `null` en `contenido.js`.

### Variables de entorno (Railway → Variables)

| Variable | Obligatoria | Para qué |
| --- | --- | --- |
| `RESEND_API_KEY` | **Sí** | Clave de [resend.com](https://resend.com). Sin ella los formularios responden 503 y la web enseña el correo del club en su lugar. |
| `MAIL_FROM` | **Sí** | Remitente, p. ej. `CV Oviedo <web@clubvoleiboloviedo.com>`. Tiene que ser de un dominio **verificado en Resend**. |
| `CONTACTO_TO` | No | Destino del formulario de contacto. |
| `PATROCINIO_TO` | No | Destino del de patrocinio. |
| `INSCRIPCIONES_TO` | No | Destino del de inscripción. |

**El dominio hay que verificarlo en Resend.** Sin verificar, el único remitente
que acepta es `onboarding@resend.dev`, y ese solo puede escribir a la dirección
del titular de la cuenta de Resend: a `cvopatrocinadores@…` no llegaría nada.
Verificar es entrar en Resend → Domains → Add Domain y copiar los registros DNS
(SPF, DKIM y DMARC) donde esté el dominio.

`INSCRIPCIONES_FROM` sigue valiendo como nombre antiguo de `MAIL_FROM`, por si
ya estuviera puesta.

## Datos de competición

Calendario, resultados y clasificaciones **no se escriben a mano**: se bajan de
las dos federaciones donde compite el club.

| Fuente | Qué cubre | De dónde sale |
| --- | --- | --- |
| **FVBPA** — Federación Asturiana | Cantera y equipos territoriales | [fvbpa.com](https://www.fvbpa.com) |
| **RFEVB** — Federación Española | Los equipos de categoría nacional | [esvoley.es](https://esvoley.es) |

> Las ligas nacionales salen **siempre de la RFEVB**, aunque la FVBPA también
> las publique: su copia va con semanas de retraso (jornadas sin meter y
> clasificaciones a medias) y no trae los parciales de cada set. Cuando el mismo
> equipo aparece en las dos fuentes, el scraper descarta el de la FVBPA.

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

> ⚠️ **La RFEVB no siempre responde desde GitHub Actions.** El 29/07/2026 la
> ejecución automática no consiguió datos de `esvoley.es`/`intranet.rfevb.com`
> (la FVBPA sí), y guardó un JSON sin los dos equipos nacionales. Desde
> entonces el scraper **se niega a escribir** si una fuente que antes daba
> equipos vuelve vacía: conserva los datos anteriores y el workflow falla, para
> que se vea. Si eso pasa, basta con ejecutar `npm run datos` en local (desde
> casa la RFEVB sí responde) y commitear.

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

## Noticias con aprobación

Una noticia se puede dejar **en borrador** en la web y publicarla después desde
el móvil, tocando un botón. La escribe quien sea —a mano o un modelo—, pero no
sale hasta que alguien la lee.

```bash
SITIO_CLAVE=… node scripts/borrador.mjs mi-noticia.json
```

Eso devuelve un enlace. Se abre, se lee y se publica o se descarta. El formato
del JSON está en la cabecera de `scripts/borrador.mjs`. Un borrador sin aprobar
caduca a los 14 días.

### La versión automática, desde Instagram (apagada)

`.github/workflows/resumen-semanal.yml` hace lo mismo pero solo: los domingos
mira lo que el club ha publicado en Instagram y redacta la noticia de la semana.

```
Instagram Graph API → ¿al menos 3 publicaciones? → Claude redacta
→ copia una foto → borrador en el volumen → aviso a Telegram → aprobación
```

**El domingo automático está apagado** (19-08-2026): faltan los secretos de
Instagram, y un workflow que falla cada semana deja de mirarse. Se enciende
descomentando las dos líneas de `cron` cuando estén puestos. Con menos de tres
publicaciones no hace nada y termina con bien: una semana floja no es un fallo.

> **Por qué no publica solo.** Un modelo escribiendo prosa pública del club sin
> que nadie la lea acabará inventando un marcador o cambiando «cadete» por
> «infantil». La página de aprobación enseña, debajo del texto, los enlaces a
> las publicaciones de las que salió, para poder comprobarlo de un vistazo.
>
> Y el enlace del aviso **solo enseña** (GET): publicar es un POST del botón.
> Telegram abre los enlaces él solo para pintar la miniatura, así que un enlace
> que publicase por sí mismo publicaría al llegar el aviso.

### Las dos mitades

| Dónde | Qué hace |
| --- | --- |
| `scripts/borrador.mjs` | Deja una noticia escrita a mano como borrador y devuelve el enlace. |
| `scripts/resumen-semanal.mjs` | Lo que corre en GitHub Actions: baja de Instagram, redacta y avisa. |
| `api/resumen.js` | Lo que corre en Railway: guarda el borrador, sirve la página de aprobación y publica. |

Los scripts y el sitio se hablan con **una clave compartida**: `RESUMEN_SECRETO` en Railway y
el mismo valor como secreto `SITIO_CLAVE` en GitHub. Esa misma cadena firma el
enlace de aprobación (HMAC del identificador del borrador). Sin ella en Railway,
`/api/resumen/*` responde 404: la función no existe.

### Variables

| Dónde | Variable | Para qué |
| --- | --- | --- |
| Railway | `RESUMEN_SECRETO` | Clave compartida y firma de los enlaces. Mínimo 24 caracteres. |
| GitHub → Secrets | `SITIO_CLAVE` | La misma cadena que la anterior. |
| GitHub → Secrets | `IG_TOKEN` | Token de larga duración de Instagram. **Caduca cada 60 días**: cuando el workflow empiece a fallar, mirar esto primero. |
| GitHub → Secrets | `IG_USER_ID` | Id de la cuenta de Instagram Business. Sin él se pregunta por `me/media`, que es lo que vale con un token de Instagram Login. |
| GitHub → Secrets | `ANTHROPIC_API_KEY` | Para redactar. |
| GitHub → Secrets | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | El aviso. Sin ellos el enlace se queda en el log del workflow. |
| GitHub → Variables | `SITIO` | Opcional; por defecto `https://clubvoleiboloviedo.com`. |

Se puede lanzar cuando se quiera desde **Actions → Resumen semanal de Instagram
→ Run workflow** (las ejecuciones a mano no comprueban la hora).

**Publicar no despliega.** El borrador aprobado entra por el mismo camino que el
panel (`api/_almacen.js` → volumen), así que sale en la web al momento.

## Datos que siguen siendo de muestra

Plantillas, cuerpo técnico, noticias, productos de la tienda y enlaces de
retransmisión están en `src/data/contenido.js` a la espera de los reales. Las
federaciones no publican esa información.
