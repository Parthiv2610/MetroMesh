# MetroMesh Run Script
$ErrorActionPreference = "Stop"
Write-Host "========================================================" -ForegroundColor Magenta
Write-Host " MetroMesh - Arrival-Aware Urban Transit Pooling Engine " -ForegroundColor White
Write-Host " BITS Hyderabad - Hack4SDG [UN SDG 11.2]               " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Magenta

$env:Path = "C:\Users\parth\AppData\Local\Python\pythoncore-3.15-64;C:\Users\parth\AppData\Local\Python\pythoncore-3.15-64\Scripts;C:\Users\parth\AppData\Local\Programs\nodejs;" + $env:Path

$repoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$repoDir\frontend"
if (!(Test-Path "dist")) {
    Write-Host "[1/2] Building Vite frontend..." -ForegroundColor Yellow
    npm run build
} else {
    Write-Host "[1/2] Frontend dist verified." -ForegroundColor Green
}

Set-Location $repoDir
Write-Host "[2/2] Launching MetroMesh Unified Engine on http://localhost:8000 ..." -ForegroundColor Cyan
Write-Host "Open your browser at: http://localhost:8000" -ForegroundColor Green
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
