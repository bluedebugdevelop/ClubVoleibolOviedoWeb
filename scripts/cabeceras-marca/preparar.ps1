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

# --- render de las dos escenas ---------------------------------------------
$chrome = @(
  "C:\Program Files\Google\Chrome\Application\chrome.exe"
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) { throw 'No encuentro Chrome para renderizar las cabeceras.' }

foreach ($marca in @('vbstats', 'bluedebug')) {
  $png = Join-Path $salida "$marca-cabecera.png"
  & $chrome --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 `
    --window-size=2000,540 --screenshot="$png" ("file:///" + ((Join-Path $aqui "$marca.html") -replace '\\','/'))
  Write-Host ("renderizado {0}" -f $png)
}
