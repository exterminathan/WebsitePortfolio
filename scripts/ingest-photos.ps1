# Ingest curated photo exports into images/photos/ at web resolution.
#
#   powershell -File scripts\ingest-photos.ps1
#
# Writes <prefix><NNN>-FULL.jpg (1920px lightbox) + -THUMB.jpg (640px grid)
# pairs into one flat folder per album. Idempotent; re-running overwrites.
# Slugs/prefixes must match src/data/albums.js.

$ErrorActionPreference = 'Stop'
$ffmpeg = 'C:\ffmpeg\ffmpeg.exe'
$repo = Split-Path $PSScriptRoot -Parent
$destRoot = Join-Path $repo 'images\photos'
$srcRoot = 'F:\Photography\_PORTFOLIO'

function Convert-Album {
  param([System.IO.FileInfo[]]$Files, [string]$OutDir, [string]$Prefix)
  New-Item -ItemType Directory -Force $OutDir | Out-Null
  $i = 0
  foreach ($f in $Files) {
    $i++
    $n = $i.ToString('000')
    & $ffmpeg -v error -y -i $f.FullName -vf "scale=1920:1920:force_original_aspect_ratio=decrease" -q:v 3 "$OutDir\$Prefix$n-FULL.jpg"
    & $ffmpeg -v error -y -i $f.FullName -vf "scale=640:640:force_original_aspect_ratio=decrease" -q:v 5 "$OutDir\$Prefix$n-THUMB.jpg"
  }
  Write-Output ("{0}: {1} photos" -f $Prefix, $i)
}

# --- Kenya 2022 --------------------------------------------------------------
$kenya = Get-ChildItem "$srcRoot\Kenya 2022" -File |
  Where-Object { $_.Extension -match '^\.(jpe?g|png)$' } |
  Sort-Object @{ e = { [int]($_.BaseName -replace '\D', '') } }, Extension
Convert-Album -Files $kenya -OutDir (Join-Path $destRoot 'kenya-2022') -Prefix 'kenya'

# --- Japan 2025: one source folder per day, curated exports in outputs?/ -----
$japanDays = @(
  @{ src = '09.17.2025 Mt. Fuji';            slug = 'mt-fuji' },
  @{ src = '09.18.2025 Hakone';              slug = 'hakone' },
  @{ src = '09.19.2025 Narai-Juku';          slug = 'narai-juku' },
  @{ src = '09.20.2025 Kiso Valley';         slug = 'kiso-valley' },
  @{ src = '9.22.2025 Shibuya Pt.1';         slug = 'shibuya-1' },
  @{ src = '9.23.2025 Shibuya Pt. 2';        slug = 'shibuya-2' },
  @{ src = '9.24.2025 Taito City';           slug = 'taito-city' },
  @{ src = '9.25.2025 Shin-Juku';            slug = 'shinjuku' },
  @{ src = '9.26.2025 Transfer to Kyoto';    slug = 'transfer-to-kyoto' },
  @{ src = '9.27.2025 Kyoto Pt. 1';          slug = 'kyoto-1' },
  @{ src = '9.28.2025 Kyoto Pt. 2';          slug = 'kyoto-2' },
  @{ src = '9.29.2025 Gion';                 slug = 'gion' },
  @{ src = '9.30.25 Kyoto Pt. 3';            slug = 'kyoto-3' },
  @{ src = '10.1.25 Osaka';                  slug = 'osaka' },
  @{ src = '10.2.2025 - Ginkaku-ji';         slug = 'ginkaku-ji' },
  @{ src = '10.4.2025 - Tokyo General Pt. 1'; slug = 'tokyo-1' },
  @{ src = '10.5.2025';                      slug = 'tokyo-2' }
)

foreach ($day in $japanDays) {
  $dayDir = Join-Path "$srcRoot\Japan 2025" $day.src
  $outFolder = Get-ChildItem $dayDir -Directory | Where-Object { $_.Name -match '^outputs?$' }
  if (-not $outFolder) { Write-Output "SKIP (no outputs): $($day.src)"; continue }
  $files = Get-ChildItem $outFolder.FullName -File -Recurse |
    Where-Object { $_.Extension -match '^\.jpe?g$' } | Sort-Object Name
  Convert-Album -Files $files -OutDir (Join-Path $destRoot 'japan-2025') -Prefix $day.slug
}

# --- Europe 2026: RAW only so far — fix the $src names, then uncomment -------
# $europeLegs = @(
#   @{ src = 'Switzerland'; slug = 'switzerland' },
#   @{ src = 'Prague';      slug = 'prague' },
#   @{ src = 'Other';       slug = 'other' }
# )
# foreach ($leg in $europeLegs) {
#   $legDir = Join-Path "$srcRoot\Europe 2026" $leg.src
#   $outFolder = Get-ChildItem $legDir -Directory | Where-Object { $_.Name -match '^outputs?$' }
#   if (-not $outFolder) { Write-Output "SKIP (no outputs): $($leg.src)"; continue }
#   $files = Get-ChildItem $outFolder.FullName -File -Recurse |
#     Where-Object { $_.Extension -match '^\.jpe?g$' } | Sort-Object Name
#   Convert-Album -Files $files -OutDir (Join-Path $destRoot 'europe-2026') -Prefix $leg.slug
# }

Write-Output 'INGEST DONE'
