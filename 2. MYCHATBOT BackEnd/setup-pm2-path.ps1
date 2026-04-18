# PM2 Path Setup Script
# Run this script to add PM2 to your PATH for the current PowerShell session

$npmPath = "$env:APPDATA\npm"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($currentPath -notlike "*$npmPath*") {
    Write-Host "Adding npm global directory to PATH..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$npmPath", "User")
    Write-Host "✓ Added to PATH. Please restart your terminal for changes to take effect." -ForegroundColor Green
} else {
    Write-Host "✓ npm directory already in PATH" -ForegroundColor Green
}

# Also add to current session
$env:Path += ";$npmPath"
Write-Host "✓ Added to current session PATH" -ForegroundColor Green

Write-Host "`nYou can now use 'pm2' directly!" -ForegroundColor Cyan
Write-Host "Try: pm2 list" -ForegroundColor Cyan









