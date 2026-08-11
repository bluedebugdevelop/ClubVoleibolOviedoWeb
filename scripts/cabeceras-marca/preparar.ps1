# Recorta las capturas de movil que van en las cabeceras de las fichas de
# patrocinador y renderiza las dos escenas.
#
# Por que hay que recortar antes y no vale con CSS: para quitar la barra de
# estado de Android (hora, cobertura, bateria) y la barra de navegacion de abajo
# hay que ampliar la captura, y ampliando por alto se recorta tambien por los
# lados, que se come el contenido. Recortando el fichero se decide exactamente
# que franja se ve.
#
# DreamLeague ademas se queda solo con la parte de arriba: mas abajo salen los
# escudos de equipos de LaLiga, que no pintan nada en la web del club.
#
# Uso:  powershell -ExecutionPolicy Bypass -File scripts/cabeceras-marca/preparar.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$aqui   = $PSScriptRoot
$raiz   = Split-Path -Parent (Split-Path -Parent $aqui)
$salida = Join-Path $raiz 'public\media\patrocinadores'

# Proporcion del hueco de pantalla del movil en las escenas (191x396 CSS). Si el
# recorte sale mas ancho que esto, `object-fit:cover` lo recorta otra vez por los
# lados y se come el contenido; por eso DreamLeague se estrecha aqui.
$RATIO_PANTALLA = 191 / 396

# origen -> destino. `desde`/`hasta` es la franja vertical que se queda, en tanto
# por uno del alto. `estrechar` recorta ademas por los lados hasta dejar la
# proporcion de la pantalla, anclando por la izquierda (que es donde esta el
# contenido en DreamLeague; a la derecha solo queda el boton de crear liga).
$recortes = @(
  @{ de = 'dreamleague-screenshot.jpg'; a = 'dreamleague-recorte.jpg'; desde = 0.045; hasta = 0.64; estrechar = $true }
  @{ de = 'alignme-screenshot.jpeg';    a = 'alignme-recorte.jpg';     desde = 0.045; hasta = 0.95; estrechar = $false }
)

# Ojo: `Image.FromFile` deja el fichero abierto, y guardar el recorte con el
# original todavia cargado hace saltar un "Error generico en GDI+". Por eso se
# cierra el original ANTES de guardar.
foreach ($r in $recortes) {
  $origen  = [IO.Path]::Combine($aqui, [string]$r.de)
  $destino = [IO.Path]::Combine($aqui, [string]$r.a)

  $img = [System.Drawing.Image]::FromFile($origen)
  $y     = [int]($img.Height * $r.desde)
  $alto  = [int]($img.Height * ($r.hasta - $r.desde))
  $x     = 0
  $ancho = $img.Width
  if ($r.estrechar) {
    $ancho = [Math]::Min($img.Width, [int]($alto * $RATIO_PANTALLA))
    $x = [int]($img.Width * 0.02)   # un pelin de aire por la izquierda
    if ($x + $ancho -gt $img.Width) { $x = $img.Width - $ancho }
  }

  $dst = New-Object System.Drawing.Bitmap($ancho, $alto)
  $g   = [System.Drawing.Graphics]::FromImage($dst)
  try {
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.DrawImage($img,
      (New-Object System.Drawing.Rectangle(0, 0, $ancho, $alto)),
      (New-Object System.Drawing.Rectangle($x, $y, $ancho, $alto)),
      [System.Drawing.GraphicsUnit]::Pixel)
  } finally { $g.Dispose(); $img.Dispose() }

  $dst.Save($destino, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $dst.Dispose()
  Write-Host ("recortado {0}: {1}x{2}" -f $r.a, $ancho, $alto)
}

# --- cabeceras hechas de una foto ------------------------------------------
# Las marcas que tienen foto propia no necesitan escena: basta con recortar la
# foto a la proporcion de la banda y oscurecer la izquierda, que es por donde
# cae el titulo. El resto lo hace la web, que la pinta al 30% sobre el azul.
#
# `foco` es la altura de la foto que queda centrada en el recorte, en tanto por
# uno: 0 = arriba del todo, 0,5 = el centro, 1 = abajo. Sirve para no cortar
# cabezas ni dejar fuera el edificio.
$ANCHO_BANDA = 2000
$ALTO_BANDA  = 540
$AZUL = [System.Drawing.Color]::FromArgb(8, 33, 57)

$fotos = @(
  @{ de = 'fisan-interior.jpg';    a = 'centro-fisan-cabecera.jpg';       foco = 0.45 }
  @{ de = 'garana-exterior.jpg';   a = 'palacio-de-garana-cabecera.jpg';  foco = 0.50 }
  @{ de = 'reunidas-arenales.jpg'; a = 'funerarias-reunidas-cabecera.jpg';foco = 0.55 }
  @{ de = 'imq-esencial.jpg';      a = 'imq-asturias-cabecera.jpg';       foco = 0.50 }
  # 0,40 y no 0,50: deja la cara de la nina en el centro de la banda, que es lo
  # que Diego pidio ver. Ojo con el fichero de origen: la foto que munozdental.es
  # sirve en su portada ya viene recortada por WordPress ("cropped-...") y deja
  # la cara pegada al borde de abajo. Esta es la ORIGINAL (2048x1363), la misma
  # ruta sin el prefijo.
  @{ de = 'munoz-odontopediatria.jpg'; a = 'clinica-dental-miguel-munoz-cabecera.jpg'; foco = 0.40 }
)
# Guelita no esta en esta lista: sus fotos son de Instagram, 640 px y casi
# cuadradas, y a sangre en una banda de 3,7:1 se quedan en un primer plano
# irreconocible. Va como escena, con la foto de tarjeta (ver mas abajo).

foreach ($f in $fotos) {
  $origen  = [IO.Path]::Combine($aqui, 'fuentes', [string]$f.de)
  $destino = [IO.Path]::Combine($salida, [string]$f.a)

  $img = [System.Drawing.Image]::FromFile($origen)
  # recorte "cover": se escala por el lado que falte y se centra segun `foco`
  $escala = [Math]::Max($ANCHO_BANDA / $img.Width, $ALTO_BANDA / $img.Height)
  $w = $img.Width * $escala
  $h = $img.Height * $escala
  $x = ($ANCHO_BANDA - $w) / 2
  $y = ($ALTO_BANDA - $h) * $f.foco

  $dst = New-Object System.Drawing.Bitmap($ANCHO_BANDA, $ALTO_BANDA)
  $g   = [System.Drawing.Graphics]::FromImage($dst)
  try {
    $g.InterpolationMode  = 'HighQualityBicubic'
    $g.PixelOffsetMode    = 'HighQuality'
    $g.SmoothingMode      = 'AntiAlias'
    $g.DrawImage($img, [float]$x, [float]$y, [float]$w, [float]$h)

    # Velo azul por la izquierda: ahi va el titulo de la ficha y sin esto la
    # foto compite con las letras.
    # Ojo: el rectangulo de la BROCHA va un pixel mas ancho por cada lado que el
    # que se pinta. Si son el mismo, GDI+ repite el degradado en el ultimo pixel
    # y deja una raya vertical justo donde termina.
    $ancho   = [int]($ANCHO_BANDA * 0.62)
    $rectBrocha = New-Object System.Drawing.Rectangle(-1, -1, ($ancho + 2), ($ALTO_BANDA + 2))
    $brocha  = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
      $rectBrocha,
      [System.Drawing.Color]::FromArgb(215, $AZUL.R, $AZUL.G, $AZUL.B),
      [System.Drawing.Color]::FromArgb(0,   $AZUL.R, $AZUL.G, $AZUL.B),
      [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal)
    $g.FillRectangle($brocha, (New-Object System.Drawing.Rectangle(0, 0, $ancho, $ALTO_BANDA)))
    $brocha.Dispose()
  } finally { $g.Dispose(); $img.Dispose() }

  $dst.Save($destino, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $dst.Dispose()
  Write-Host ("cabecera {0}" -f $f.a)
}

# --- render de las dos escenas ---------------------------------------------
$chrome = @(
  "C:\Program Files\Google\Chrome\Application\chrome.exe"
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) { throw 'No encuentro Chrome para renderizar las cabeceras.' }

foreach ($marca in @('vbstats', 'bluedebug', 'sidreria-guelita')) {
  $png = Join-Path $salida "$marca-cabecera.png"
  & $chrome --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 `
    --window-size=2000,540 --screenshot="$png" ("file:///" + ((Join-Path $aqui "$marca.html") -replace '\\','/'))
  Write-Host ("renderizado {0}" -f $png)
}
