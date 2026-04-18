# Cloudflare Tunnel Setup Script
# Run this script to set up your named tunnel

Write-Host "=== Cloudflare Named Tunnel Setup ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "Step 1: Authenticating with Cloudflare..." -ForegroundColor Yellow
Write-Host "This will open your browser. Please log in and select your domain (mychatbot.website)" -ForegroundColor Gray
Write-Host ""
$login = Read-Host "Press Enter to start login (or 'skip' to skip this step)"
if ($login -ne 'skip') {
    cloudflared tunnel login
}

# Step 2: Create tunnel
Write-Host ""
Write-Host "Step 2: Creating tunnel 'whatsapp-tunnel'..." -ForegroundColor Yellow
cloudflared tunnel create whatsapp-tunnel

# Step 3: Get tunnel ID
Write-Host ""
Write-Host "Step 3: Getting tunnel information..." -ForegroundColor Yellow
$tunnelList = cloudflared tunnel list
Write-Host $tunnelList

Write-Host ""
Write-Host "Please copy the Tunnel ID from above and update config.yml" -ForegroundColor Yellow
Write-Host "The credentials file should be at: C:\Users\Acer\.cloudflared\<tunnel-id>.json" -ForegroundColor Gray
Write-Host ""

$tunnelId = Read-Host "Enter the Tunnel ID (or press Enter to skip)"
if ($tunnelId) {
    $credentialsPath = "C:\Users\Acer\.cloudflared\$tunnelId.json"
    $configContent = @"
tunnel: whatsapp-tunnel
credentials-file: $credentialsPath

ingress:
  # Route root domain to localhost:3000
  - hostname: mychatbot.website
    service: http://localhost:3000
  # Route www subdomain to localhost:3000
  - hostname: www.mychatbot.website
    service: http://localhost:3000
  # Catch-all rule (must be last)
  - service: http_status:404
"@
    Set-Content -Path "config.yml" -Value $configContent
    Write-Host "✓ config.yml updated with credentials path" -ForegroundColor Green
}

# Step 4: Route DNS
Write-Host ""
Write-Host "Step 4: Routing DNS..." -ForegroundColor Yellow
Write-Host "Creating DNS record for mychatbot.website..." -ForegroundColor Gray
cloudflared tunnel route dns whatsapp-tunnel mychatbot.website

$routeWww = Read-Host "Do you want to route www.mychatbot.website as well? (y/n)"
if ($routeWww -eq 'y') {
    cloudflared tunnel route dns whatsapp-tunnel www.mychatbot.website
    Write-Host "✓ www.mychatbot.website routed" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure your bot server is running: node index.js" -ForegroundColor Gray
Write-Host "2. Test the tunnel: cloudflared tunnel --config config.yml run" -ForegroundColor Gray
Write-Host "3. Start with PM2: pm2 start ecosystem.config.js" -ForegroundColor Gray
Write-Host ""














