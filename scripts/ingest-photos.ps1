# Ingest curated photo exports into images/photos/ at web resolution.
#
#   powershell -File scripts\ingest-photos.ps1
#
# Each album is ONE flat folder; every photo becomes a named pair:
#   images/photos/<album>/<prefix><NNN>-FULL.jpg   (long edge <= 1920, q3 — lightbox)
#   images/photos/<album>/<prefix><NNN>-THUMB.jpg  (long edge <= 640,  q5 — grid)
# where <prefix> is the day slug (e.g. hakone004-FULL.jpg) or, for day-less
# albums, the album's `prefix` in albums.js (e.g. kenya001-FULL.jpg).
#
# Idempotent: re-running overwrites existing output. Slugs/prefixes must match
# src/data/albums.js — the build scans these folders to generate album pages.
# Europe 2026 is absent on purpose: its output/ folders are still empty (RAW
# only) — add a mapping here once edited exports exist.

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

# --- Kenya 2022: flat folder of curated jpg/png, numbered "k22 (N).ext" ------
$kenya = Get-ChildItem "$srcRoot\Kenya 2022" -File |
  Where-Object { $_.Extension -match '^\.(jpe?g|png)$' } |
  Sort-Object @{ e = { [int]($_.BaseName -replace '\D', '') } }, Extension
Convert-Album -Files $kenya -OutDir (Join-Path $destRoot 'kenya-2022') -Prefix 'kenya'

# --- Japan 2025: one day folder per outing, curated exports in outputs?/ -----
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

Write-Output 'INGEST DONE'
