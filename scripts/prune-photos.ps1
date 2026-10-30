# Delete either half of a -FULL/-THUMB pair, then run this to drop the orphan.
#
#   powershell -File scripts\prune-photos.ps1 -DryRun   # preview
#   powershell -File scripts\prune-photos.ps1           # actually delete
#
# Re-ingesting resurrects pruned photos — delete the source export on F: too
# to make a removal permanent.

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
