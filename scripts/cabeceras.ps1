# Cabeceras de las fichas de equipo de la cantera.
#
# La banda de cabecera es muy apaisada (unos 3,7:1) y las fotos de equipo son
# casi cuadradas. Metidas tal cual, el navegador las amplia un 40% y deja fuera
# dos tercios del alto: solo se ven las caras. Metidas enteras se ven todas,
# pero salen diminutas en medio de una franja de azul.
#
# La solucion es la misma que ya se uso con el primer equipo masculino:
#
#   1. recortar de la foto la franja donde esta la gente —desde un poco por
#      encima de las cabezas de la fila de atras hasta el cuerpo de los que se
#      agachan delante—, dejandola en 1,85:1
#   2. pegarla centrada en un lienzo un 44% mas ancho, relleno del azul marino
#      de la banda
#   3. fundir los dos cantos verticales con ese azul, para que no se vea el
#      borde recto de la foto
#
# Asi la foto ocupa casi todo el ancho de la banda y se ve la cara de todo el
# mundo, que es de lo que se trata.
#
# El recorte de cada foto va a mano en la tabla de abajo: `cabezas` es la altura
# a la que empiezan las cabezas de la fila de atras, medida en pixeles sobre la
# foto original. Todo lo demas sale de ahi.
#
# Uso:  powershell -ExecutionPolicy Bypass -File scripts/cabeceras.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$raiz    = Split-Path -Parent $PSScriptRoot
$carpeta = Join-Path $raiz 'public\media\equipos'

# Proporcion de la foto recortada, antes de ensanchar. 1,85:1 es la que tiene la
# del primer equipo masculino, que es la que gusta.
$RATIO_FOTO = 1.85
# Cuanto se ensancha el lienzo a los lados. Con 1,44 la foto ocupa un 69% del
# ancho, igual que en la del masculino.
$ENSANCHE = 1.44
# Azul marino de la banda: --ink en index.css. Tiene que ser exactamente ese, o
# se nota el corte entre el relleno y el fondo.
$AZUL = [System.Drawing.Color]::FromArgb(8, 33, 57)
# Ancho del fundido de cada canto, en tanto por uno del ancho de la foto.
$FUNDIDO = 0.10
# Margen que se deja por encima de las cabezas. La banda recorta ademas por
# arriba segun el ancho de la pantalla, asi que este colchon es el que evita que
# en un monitor grande se corten las coronillas.
$AIRE_SOBRE_CABEZAS = 45

$equipos = @(
  @{ fichero = 'alevin.jpg';              cabezas = 100 }
  @{ fichero = 'cadete-femenino-a.jpg';   cabezas = 95  }
  @{ fichero = 'cadete-femenino-b.jpg';   cabezas = 40  }
  @{ fichero = 'cadete-masculino.jpg';    cabezas = 120 }
  @{ fichero = 'infantil-femenino-a.jpg'; cabezas = 95  }
  @{ fichero = 'infantil-femenino-b.jpg'; cabezas = 35  }
  @{ fichero = 'infantil-masculino.jpg';  cabezas = 105 }
  @{ fichero = 'junior-masculino.jpg';    cabezas = 75  }
  @{ fichero = 'juvenil-femenino.jpg';    cabezas = 100 }
)

# Calidad del JPG de salida. 88 no deja artefactos visibles y las cabeceras
# quedan por debajo de los 200 kB.
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }
$parametros = New-Object System.Drawing.Imaging.EncoderParameters 1
$parametros.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality, [int64]88)

foreach ($eq in $equipos) {
  $origen = Join-Path $carpeta $eq.fichero
  if (-not (Test-Path $origen)) { Write-Warning "no esta $($eq.fichero)"; continue }

  $foto = [System.Drawing.Image]::FromFile($origen)
  try {
    $anchoFoto = $foto.Width
    $altoCorte = [int][math]::Round($anchoFoto / $RATIO_FOTO)

    # De donde a donde se corta. Si la franja se sale por abajo, se sube lo
    # justo para que quepa: mejor perder aire por arriba que cuerpo por abajo.
    $y = [math]::Max(0, $eq.cabezas - $AIRE_SOBRE_CABEZAS)
    if ($y + $altoCorte -gt $foto.Height) { $y = [math]::Max(0, $foto.Height - $altoCorte) }
    $alto = [math]::Min($altoCorte, $foto.Height)

    $anchoLienzo = [int][math]::Round($anchoFoto * $ENSANCHE)
    $margen      = [int][math]::Round(($anchoLienzo - $anchoFoto) / 2)

    $lienzo = New-Object System.Drawing.Bitmap($anchoLienzo, $alto)
    $g = [System.Drawing.Graphics]::FromImage($lienzo)
    try {
      $g.InterpolationMode = 'HighQualityBicubic'
      $g.Clear($AZUL)
      $g.DrawImage($foto,
        (New-Object System.Drawing.Rectangle($margen, 0, $anchoFoto, $alto)),
        (New-Object System.Drawing.Rectangle(0, $y, $anchoFoto, $alto)),
        [System.Drawing.GraphicsUnit]::Pixel)

      # Fundido de los cantos: columnas de azul con la opacidad subiendo hacia
      # fuera. A mano y pixel a pixel porque el degradado con alfa de GDI+ da
      # bandas visibles sobre un color plano.
      $ancho = [int][math]::Round($anchoFoto * $FUNDIDO)
      for ($i = 0; $i -lt $ancho; $i++) {
        # cuadratica: arranca suave y cierra rapido contra el borde
        $t = 1 - ($i / $ancho)
        $alfa = [int][math]::Round(255 * $t * $t)
        if ($alfa -le 0) { continue }
        $pincel = New-Object System.Drawing.SolidBrush(
          [System.Drawing.Color]::FromArgb($alfa, $AZUL))
        $g.FillRectangle($pincel, ($margen + $i), 0, 1, $alto)
        $g.FillRectangle($pincel, ($margen + $anchoFoto - 1 - $i), 0, 1, $alto)
        $pincel.Dispose()
      }
    } finally { $g.Dispose() }

    # El JPG se arma en memoria y se vuelca de una vez sobre el fichero. Guardar
    # con `$lienzo.Save($ruta, ...)` encima de uno que ya existe falla con un
    # "error generico en GDI+", porque por dentro intenta crearlo de cero en vez
    # de truncarlo. Escribiendo los bytes se sobrescribe sin borrar nada.
    $destino = Join-Path $carpeta ($eq.fichero -replace '\.jpg$', '-cabecera.jpg')
    $memoria = New-Object System.IO.MemoryStream
    $lienzo.Save($memoria, $codec, $parametros)
    $lienzo.Dispose()
    [System.IO.File]::WriteAllBytes($destino, $memoria.ToArray())
    $memoria.Dispose()

    $kb = [int]((Get-Item $destino).Length / 1KB)
    "{0,-30} {1}x{2}  corte y={3}  {4} kB" -f (Split-Path $destino -Leaf), $anchoLienzo, $alto, $y, $kb
  } finally { $foto.Dispose() }
}
