# Curate the web photo library: keep -FULL/-THUMB pairs in sync after deletions.
#
#   powershell -File scripts\prune-photos.ps1 -DryRun   # preview
#   powershell -File scripts\prune-photos.ps1           # actually delete
#
# Every photo is a pair in one flat album folder: <name>-FULL.jpg + <name>-THUMB.jpg
# (e.g. images/photos/japan-2025/hakone004-FULL.jpg). Workflow: browse an album
# folder in Explorer, delete either half of the shots you don't want, then run
# this — it deletes the orphaned other half so each photo is fully gone.
# Rebuild after. The build skips missing numbers, so gaps are harmless.
#
# NOTE: re-running scripts\ingest-photos.ps1 re-converts everything from
# F:\Photography\_PORTFOLIO and resurrects pruned photos. To make a removal
# permanent across re-ingests, also delete the source export from the
# outputs/ folder on F: (that's the real curation master).

param([switch]$DryRun)

$ErrorActionPreference = 'Stop'
$photosRoot = Join-Path (Split-Path $PSScriptRoot -Parent) 'images\photos'

$pruned = 0
foreach ($albumDir in Get-ChildItem $photosRoot -Directory) {
  $names = @(Get-ChildItem $albumDir.FullName -File | Select-Object -ExpandProperty Name)
  foreach ($n in $names) {
    if ($n -notmatch '^(?<base>.+)-(?<kind>FULL|THUMB)\.jpe?g$') { continue }
    $otherKind = if ($Matches.kind -eq 'FULL') { 'THUMB' } else { 'FULL' }
    $other = "$($Matches.base)-$otherKind.jpg"
    if ($other -in $names) { continue }
    $pruned++
    $rel = "$($albumDir.Name)\$n"
    if ($DryRun) { Write-Output "would delete: $rel" }
    else { Remove-Item (Join-Path $albumDir.FullName $n) -Confirm:$false; Write-Output "deleted: $rel" }
  }
}
Write-Output ("{0}: {1} orphaned file(s)" -f ($(if ($DryRun) { 'DRY RUN' } else { 'DONE' })), $pruned)
