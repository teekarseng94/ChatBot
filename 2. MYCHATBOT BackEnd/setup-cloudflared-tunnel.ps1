# Cloudflare Tunnel Setup Script
# This script helps set up the Named Tunnel for mychatbot.website

Write-Host "=== Cloudflare Tunnel Setup ===" -ForegroundColor Cyan
Write-Host ""

# Get the project directory
$projectDir = $PSScriptRoot
if (-not $projectDir) {
    $projectDir = Get-Location
}

# Check if cloudflared.exe exists
$cloudflaredPath = Join-Path $projectDir "cloudflared.exe"
$cloudflaredBat = Join-Path $projectDir "cloudflared.bat"

if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "ERROR: cloudflared.exe not found in project folder!" -ForegroundColor Red
    Write-Host "Please download cloudflared.exe and place it in: $projectDir" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Found cloudflared.exe" -ForegroundColor Green
Write-Host ""

# Check if already authenticated
$credentialsPath = "$env:USERPROFILE\.cloudflared\whatsapp-tunnel.json"
$configPath = Join-Path $projectDir "config.yml"

Write-Host "Checking authentication status..." -ForegroundColor Yellow

# Try to list tunnels (this will fail if not authenticated)
$tunnelList = & $cloudflaredBat tunnel list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "⚠ Not authenticated yet. Let's authenticate now..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Step 1: Authenticate with Cloudflare" -ForegroundColor Cyan
    Write-Host "This will open your browser. Please:" -ForegroundColor White
    Write-Host "  1. Log in to Cloudflare" -ForegroundColor White
    Write-Host "  2. Select domain: mychatbot.website" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to start authentication..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    & $cloudflaredBat tunnel login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Authentication failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Authentication successful!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✓ Already authenticated" -ForegroundColor Green
    Write-Host ""
}

# Check if tunnel exists
Write-Host "Checking if tunnel 'whatsapp-tunnel' exists..." -ForegroundColor Yellow
$tunnelList = & $cloudflaredBat tunnel list 2>&1
$tunnelExists = $tunnelList -match "whatsapp-tunnel"

if (-not $tunnelExists) {
    Write-Host ""
    Write-Host "⚠ Tunnel 'whatsapp-tunnel' not found. Creating it now..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Step 2: Creating Named Tunnel" -ForegroundColor Cyan
    
    & $cloudflaredBat tunnel create whatsapp-tunnel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create tunnel!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ Tunnel created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠ IMPORTANT: Please note the Tunnel ID from the output above." -ForegroundColor Yellow
    Write-Host "   You may need to update config.yml with the correct credentials file path." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✓ Tunnel 'whatsapp-tunnel' already exists" -ForegroundColor Green
    Write-Host ""
}

# Get tunnel ID from credentials file
if (Test-Path $credentialsPath) {
    Write-Host "✓ Found credentials file: $credentialsPath" -ForegroundColor Green
} else {
    Write-Host "⚠ Credentials file not found at expected path" -ForegroundColor Yellow
    Write-Host "   Expected: $credentialsPath" -ForegroundColor Yellow
    Write-Host "   Please check the tunnel list and update config.yml manually" -ForegroundColor Yellow
}

# Check config.yml
if (Test-Path $configPath) {
    Write-Host "✓ Found config.yml" -ForegroundColor Green
} else {
    Write-Host "⚠ config.yml not found!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Route DNS (if not done yet):" -ForegroundColor White
Write-Host "   .\cloudflared.bat tunnel route dns whatsapp-tunnel mychatbot.website" -ForegroundColor Gray
Write-Host "   .\cloudflared.bat tunnel route dns whatsapp-tunnel www.mychatbot.website" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test the tunnel:" -ForegroundColor White
Write-Host "   .\cloudflared.bat tunnel --config config.yml run" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Or start with PM2:" -ForegroundColor White
Write-Host "   pm2 start ecosystem.config.js" -ForegroundColor Gray
Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Green
