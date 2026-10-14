# PPTX Native installer for Google Antigravity (Windows PowerShell).
#
#   irm https://raw.githubusercontent.com/siddharthrath1999/pptx-native/main/install.ps1 | iex
#
# To install into the current project instead of your home folder, set $env:PPTX_NATIVE_PROJECT = "1" first.
$ErrorActionPreference = "Stop"
$Repo = "siddharthrath1999/pptx-native"
$Skill = "pptx-native"

Write-Host "PPTX Native - installing the skill" -ForegroundColor White
$Tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("pptx-native-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $Tmp | Out-Null
try {
  $Zip = Join-Path $Tmp "repo.zip"
  Invoke-WebRequest -Uri "https://codeload.github.com/$Repo/zip/refs/heads/main" -OutFile $Zip -UseBasicParsing
  Expand-Archive -Path $Zip -DestinationPath $Tmp -Force
  $Src = Get-ChildItem -Path $Tmp -Directory -Recurse -Filter $Skill | Where-Object { Test-Path (Join-Path $_.FullName "SKILL.md") } | Select-Object -First 1
  if (-not $Src) { throw "Could not find the skill in the download. Please try again later." }

  if ($env:PPTX_NATIVE_PROJECT -eq "1") {
    $Targets = @(Join-Path (Get-Location) ".agents\skills")
  } else {
    $Targets = @((Join-Path $HOME ".gemini\antigravity\skills"), (Join-Path $HOME ".gemini\config\skills"))
  }
  foreach ($Dir in $Targets) {
    New-Item -ItemType Directory -Force -Path $Dir | Out-Null
    $Dest = Join-Path $Dir $Skill
    if (Test-Path $Dest) { Remove-Item -Recurse -Force $Dest }
    Copy-Item -Recurse -Path $Src.FullName -Destination $Dest
    Write-Host "  [ok] Skill copied to $Dest" -ForegroundColor Green
  }

  Write-Host "Checking what the skill needs" -ForegroundColor White
  $Py = (Get-Command python -ErrorAction SilentlyContinue) ; if (-not $Py) { $Py = Get-Command py -ErrorAction SilentlyContinue }
  if (-not $Py) {
    Write-Host "  [!] Python not found. Install it from python.org, then run this again." -ForegroundColor Yellow
  } else {
    & $Py.Source -c "import pptx, PIL" 2>$null
    if ($LASTEXITCODE -eq 0) {
      Write-Host "  [ok] Python packages already installed" -ForegroundColor Green
    } else {
      & $Py.Source -m pip install --user --quiet python-pptx pillow
      if ($LASTEXITCODE -eq 0) { Write-Host "  [ok] Installed python-pptx and Pillow" -ForegroundColor Green }
      else { Write-Host "  [!] Run: python -m pip install --user python-pptx pillow" -ForegroundColor Yellow }
    }
  }
  if ((Get-Command soffice -ErrorAction SilentlyContinue) -or (Test-Path "C:\Program Files\LibreOffice\program\soffice.exe")) {
    Write-Host "  [ok] LibreOffice found (used to preview slides)" -ForegroundColor Green
  } else {
    Write-Host "  [!] Optional: install LibreOffice (winget install TheDocumentFoundation.LibreOffice) so the agent can look at its slides." -ForegroundColor Yellow
  }
  Write-Host "Done. Restart Antigravity, then ask: 'Make me a 30-slide deck on ...'" -ForegroundColor White
} finally {
  Remove-Item -Recurse -Force $Tmp -ErrorAction SilentlyContinue
}
