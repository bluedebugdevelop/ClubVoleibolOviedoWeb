# Cabeceras de las fichas de equipo.
#
# La banda de cabecera es muy apaisada y las fotos de equipo son casi cuadradas.
# Metidas tal cual se quedan en un primer plano de las caras; metidas enteras
# salen diminutas en medio de una franja de azul.
#
# La solucion es la misma que ya se uso con el primer equipo masculino:
#
#   1. recortar de la foto la franja donde esta la gente —desde un poco por
#      encima de las cabezas de la fila de atras hacia abajo—
#   2. pegarla centrada en un lienzo mas ancho, relleno del azul marino de la
#      banda, hasta dar la proporcion exacta de la cabecera
#   3. fundir los dos cantos verticales con ese azul, para que no se vea el
#      borde recto de la foto
#
# Asi se ve la cara de todo el mundo, que es de lo que se trata.
#
# LA SALIDA ES 1600x380, el mismo formato al que recorta el panel
# (`FORMATOS.cabecera` en src/components/formatosImagen.js) y la misma
# proporcion que tiene el hueco de la banda en un ordenador (`.phead::before`
# en index.css). Tiene que ser ese: la foto se pinta a sangre, asi que una
# cabecera con otra forma la recortaria el navegador por su cuenta, que es
# justo lo que se quito de en medio.
#
# Solo se funden los cantos de los lados. Arriba y abajo la foto llega justo al
# borde del lienzo y ahi no hay nada que fundir: el azul de la banda empieza
# donde acaba la foto, sin costura.
#
# OJO con lo que se pierde en un movil: la banda de un movil no puede ser tan
# apaisada, asi que se queda con la franja central —un tercio del ancho— y tira
# el resto. La gente de los extremos de la foto de equipo no sale. En el
# recortador del panel eso viene marcado; aqui hay que tenerlo en la cabeza.
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

# El formato de cabecera de la web. Si cambia alli, cambia aqui.
$ANCHO_BANDA = 1600
$ALTO_BANDA  = 380

# Cuanto se ensancha el lienzo a los lados. Con 1,44 la foto ocupa un 69% del
# ancho, igual que en la del masculino, que es la que gusta.
$ENSANCHE = 1.44
# Y la proporcion a la que se recorta la foto ya no se elige: sale de las dos
# cosas de arriba. Con la banda en 4,21 y un ensanche de 1,44 toca cortar una
# franja de 2,92:1, o sea de las cabezas a poco mas de la cintura. Es lo mismo
# que se ve hoy en la web: hoy el navegador recortaba por su cuenta una foto de
# 1,85 hasta dejarla asi, y lo que se hace aqui es decidirlo nosotros en vez de
# dejarselo a el.
$RATIO_FOTO = ($ANCHO_BANDA / $ALTO_BANDA) / $ENSANCHE
# Azul marino de la banda: --ink en index.css. Tiene que ser exactamente ese, o
# se nota el corte entre el relleno y el fondo.
$AZUL = [System.Drawing.Color]::FromArgb(8, 33, 57)
# Ancho del fundido de cada canto, en tanto por uno del ancho de la foto.
$FUNDIDO = 0.10
# Margen que se deja por encima de las cabezas. Aparte de dar aire, es lo que
# mantiene las coronillas fuera del fundido de arriba que pone el CSS.
$AIRE_SOBRE_CABEZAS = 45

# `carpeta` solo para los dos senior, que sus fotos no estan en media\equipos
# sino sueltas en media. Se generan aqui con todos los demas para que las once
# cabeceras salgan del mismo sitio: antes la del masculino venia de un
# `ensanchar.ps1` que ya no existe y la del femenino era un recorte a mano sin
# fundir, y se notaba.
$equipos = @(
  @{ fichero = 'equipo-masc.jpg'; cabezas = 300; carpeta = '..' }
  # La foto ya es apaisada (2:1) y las caras estan arriba del todo: casi no hay
  # franja que recortar, se ensancha practicamente entera.
  @{ fichero = 'equipo-fem.jpg';  cabezas = 50;  carpeta = '..' }

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
  $suya   = if ($eq.ContainsKey('carpeta')) { Join-Path $carpeta $eq.carpeta } else { $carpeta }
  $origen = Join-Path $suya $eq.fichero
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

    # El lienzo se arma directamente a la medida final. La foto se coloca
    # centrada y con el alto de la banda entero: su ancho sale de mantener la
    # proporcion del recorte, no de escalar el lienzo despues.
    $anchoEnBanda = [int][math]::Round($ALTO_BANDA * ($anchoFoto / $alto))
    $margen       = [int][math]::Round(($ANCHO_BANDA - $anchoEnBanda) / 2)

    $lienzo = New-Object System.Drawing.Bitmap($ANCHO_BANDA, $ALTO_BANDA)
    $g = [System.Drawing.Graphics]::FromImage($lienzo)
    try {
      $g.InterpolationMode = 'HighQualityBicubic'
      $g.PixelOffsetMode   = 'HighQuality'
      $g.Clear($AZUL)
      $g.DrawImage($foto,
        (New-Object System.Drawing.Rectangle($margen, 0, $anchoEnBanda, $ALTO_BANDA)),
        (New-Object System.Drawing.Rectangle(0, $y, $anchoFoto, $alto)),
        [System.Drawing.GraphicsUnit]::Pixel)

      # Fundido de los cantos: columnas de azul con la opacidad subiendo hacia
      # fuera. A mano y pixel a pixel porque el degradado con alfa de GDI+ da
      # bandas visibles sobre un color plano.
      $ancho = [int][math]::Round($anchoEnBanda * $FUNDIDO)
      for ($i = 0; $i -lt $ancho; $i++) {
        # cuadratica: arranca suave y cierra rapido contra el borde
        $t = 1 - ($i / $ancho)
        $alfa = [int][math]::Round(255 * $t * $t)
        if ($alfa -le 0) { continue }
        $pincel = New-Object System.Drawing.SolidBrush(
          [System.Drawing.Color]::FromArgb($alfa, $AZUL))
        $g.FillRectangle($pincel, ($margen + $i), 0, 1, $ALTO_BANDA)
        $g.FillRectangle($pincel, ($margen + $anchoEnBanda - 1 - $i), 0, 1, $ALTO_BANDA)
        $pincel.Dispose()
      }
    } finally { $g.Dispose() }

    # El JPG se arma en memoria y se vuelca de una vez sobre el fichero. Guardar
    # con `$lienzo.Save($ruta, ...)` encima de uno que ya existe falla con un
    # "error generico en GDI+", porque por dentro intenta crearlo de cero en vez
    # de truncarlo. Escribiendo los bytes se sobrescribe sin borrar nada.
    $destino = Join-Path $suya ($eq.fichero -replace '\.jpg$', '-cabecera.jpg')
    $memoria = New-Object System.IO.MemoryStream
    $lienzo.Save($memoria, $codec, $parametros)
    $lienzo.Dispose()
    [System.IO.File]::WriteAllBytes($destino, $memoria.ToArray())
    $memoria.Dispose()

    $kb = [int]((Get-Item $destino).Length / 1KB)
    "{0,-32} foto {1} px de ancho  corte y={2}  {3} kB" -f `
      (Split-Path $destino -Leaf), $anchoEnBanda, $y, $kb
  } finally { $foto.Dispose() }
}
