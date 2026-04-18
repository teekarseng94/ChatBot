# Fix Firebase CLI Issues
Write-Host "Fixing Firebase CLI..." -ForegroundColor Cyan

# Uninstall and reinstall Firebase CLI
Write-Host "Uninstalling old Firebase CLI..." -ForegroundColor Yellow
npm uninstall -g firebase-tools

Write-Host "Installing latest Firebase CLI..." -ForegroundColor Yellow
npm install -g firebase-tools@latest

Write-Host "Verifying installation..." -ForegroundColor Yellow
firebase --version

Write-Host ""
Write-Host "If you still see errors, try:" -ForegroundColor Yellow
Write-Host "1. Close and reopen PowerShell" -ForegroundColor Yellow
Write-Host "2. Run: npm cache clean --force" -ForegroundColor Yellow
Write-Host "3. Run: npm install -g firebase-tools@latest" -ForegroundColor Yellow


