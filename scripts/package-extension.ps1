param(
  [string]$OutDir = 'dist'
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root 'chrome-extension'
$manifestPath = Join-Path $src 'manifest.json'

if (-not (Test-Path $manifestPath)) { throw "Chybí $manifestPath" }

$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$fileName = "trello-rich-checklist-v$($manifest.version).zip"
$outDir = Join-Path $root $OutDir
$zipPath = Join-Path $outDir $fileName

New-Item -ItemType Directory -Force -Path $outDir | Out-Null
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# manifest.json musí být v kořeni archivu (Chrome Web Store i "Načíst rozbalené")
$staging = Join-Path ([System.IO.Path]::GetTempPath()) ("ttm-pack-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $staging | Out-Null
try {
  Copy-Item (Join-Path $src '*') $staging -Recurse -Force
  Compress-Archive -Path (Join-Path $staging '*') -DestinationPath $zipPath -CompressionLevel Optimal
}
finally {
  Remove-Item $staging -Recurse -Force -ErrorAction SilentlyContinue
}

$size = (Get-Item $zipPath).Length
Write-Host ""
Write-Host "Balíček:  $zipPath"
Write-Host ("Velikost: {0:N0} kB" -f ($size / 1KB))
Write-Host "Verze:    $($manifest.version)"
Write-Host ""

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
try {
  Write-Host "Obsah (prvních 20 položek):"
  $archive.Entries | Select-Object -First 20 | ForEach-Object { Write-Host ("  " + $_.FullName) }
  if ($archive.Entries.Count -gt 20) { Write-Host ("  … celkem " + $archive.Entries.Count + " položek") }
}
finally {
  $archive.Dispose()
}
