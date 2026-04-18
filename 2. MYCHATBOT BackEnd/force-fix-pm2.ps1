# Force Fix PM2 - Run as Administrator
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PM2 Force Fix (Run as Administrator)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script requires Administrator privileges!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "✓ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Step 1: Kill all Node processes
Write-Host "Step 1: Killing ALL Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    foreach ($proc in $nodeProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction Stop
            Write-Host "  └─ Killed PID $($proc.Id)" -ForegroundColor Gray
        } catch {
            Write-Host "  └─ Failed to kill PID $($proc.Id): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  └─ No Node processes found" -ForegroundColor Gray
}

Start-Sleep -Seconds 3

# Step 2: Clean PM2 directory
Write-Host "Step 2: Cleaning PM2 directory..." -ForegroundColor Yellow
$pm2Home = "$env:USERPROFILE\.pm2"
if (Test-Path $pm2Home) {
    try {
        # Remove socket files
        Get-ChildItem -Path $pm2Home -Filter "*.sock" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
        Get-ChildItem -Path $pm2Home -Filter "*.pid" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
        Remove-Item "$pm2Home\pm2.log" -Force -ErrorAction SilentlyContinue
        Write-Host "  └─ PM2 files cleaned" -ForegroundColor Gray
    } catch {
        Write-Host "  └─ Error cleaning PM2 files: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  └─ PM2 directory doesn't exist" -ForegroundColor Gray
}

# Step 3: Verify no Node processes remain
Write-Host "Step 3: Verifying cleanup..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
$remaining = Get-Process node -ErrorAction SilentlyContinue
if ($remaining) {
    Write-Host "  └─ WARNING: $($remaining.Count) Node process(es) still running" -ForegroundColor Yellow
    Write-Host "     You may need to restart your computer" -ForegroundColor Yellow
} else {
    Write-Host "  └─ ✓ All Node processes terminated" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now try starting PM2:" -ForegroundColor Cyan
Write-Host "  .\pm2.bat start index.js --name whatsapp-system" -ForegroundColor White
Write-Host ""
pause







