# Start Landing Page Server (Port 3001)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Landing Page Server (Port 3001)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

# Check if port 3001 is in use
Write-Host "Checking if port 3001 is available..." -ForegroundColor Yellow
$portCheck = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($portCheck) {
    Write-Host "WARNING: Port 3001 is already in use!" -ForegroundColor Red
    Write-Host "Please stop the process using port 3001 first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To find the process, run:" -ForegroundColor Yellow
    Write-Host "Get-NetTCPConnection -LocalPort 3001 | Select-Object OwningProcess" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Port 3001 is available" -ForegroundColor Green
Write-Host ""

Write-Host "Starting Vite dev server..." -ForegroundColor Yellow
Write-Host "Server will be available at:" -ForegroundColor Cyan
Write-Host "  - http://localhost:3001" -ForegroundColor White
Write-Host "  - https://mychatbot.website (via Cloudflare tunnel)" -ForegroundColor White
Write-Host "  - https://www.mychatbot.website (via Cloudflare tunnel)" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev


