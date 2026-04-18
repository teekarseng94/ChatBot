# PM2 Permission Fix Script for Windows
Write-Host "Fixing PM2 permission issues..." -ForegroundColor Cyan

# Kill all PM2 processes
Write-Host "`n1. Killing all PM2 processes..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -like "*pm2*" -or $_.CommandLine -like "*pm2*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Remove PM2 socket files
Write-Host "2. Cleaning PM2 socket files..." -ForegroundColor Yellow
$pm2Home = "$env:USERPROFILE\.pm2"
if (Test-Path $pm2Home) {
    $socketFiles = Get-ChildItem -Path $pm2Home -Filter "*.sock" -Recurse -ErrorAction SilentlyContinue
    foreach ($file in $socketFiles) {
        try {
            Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
            Write-Host "  └─ Removed: $($file.Name)" -ForegroundColor Gray
        } catch {
            Write-Host "  └─ Could not remove: $($file.Name)" -ForegroundColor Red
        }
    }
}

# Kill any remaining Node processes that might be PM2
Write-Host "3. Checking for remaining Node processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "  └─ Found $($nodeProcesses.Count) Node process(es)" -ForegroundColor Gray
    foreach ($proc in $nodeProcesses) {
        try {
            $procPath = $proc.Path
            if ($procPath -like "*pm2*" -or $procPath -like "*\.pm2\*") {
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                Write-Host "  └─ Killed PM2 Node process: PID $($proc.Id)" -ForegroundColor Gray
            }
        } catch {
            # Ignore errors
        }
    }
}

Write-Host "`n✓ PM2 cleanup complete!" -ForegroundColor Green
Write-Host "`nYou can now restart PM2:" -ForegroundColor Cyan
Write-Host "  .\pm2.bat start index.js --name whatsapp-system" -ForegroundColor White







