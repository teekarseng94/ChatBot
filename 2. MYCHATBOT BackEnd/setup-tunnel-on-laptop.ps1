# Create a NEW tunnel on this laptop and wire it to config + DNS
# Run from: 2. MYCHATBOT BackEnd (PowerShell)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# Run cloudflared via cmd so stderr (e.g. version warning) does not stop the script
function Invoke-Cloudflared {
    $arg = $args -join " "
    cmd /c "cd /d `"$PSScriptRoot`" && .\cloudflared $arg 2>&1"
}

Write-Host "Step 1: Creating tunnel 'whatsapp-tunnel-laptop'..." -ForegroundColor Cyan
$out = (Invoke-Cloudflared "tunnel create whatsapp-tunnel-laptop") | Out-String
Write-Host $out

if ($out -match "with id ([a-f0-9\-]{36})") {
    $tunnelId = $Matches[1]
    Write-Host "`nTunnel ID: $tunnelId" -ForegroundColor Green
} else {
    if ($out -match "already exists") {
        Write-Host "`nTunnel name already exists. Listing tunnels..." -ForegroundColor Yellow
        Invoke-Cloudflared "tunnel list" | Write-Host
        $tunnelId = Read-Host "`nPaste the Tunnel ID for whatsapp-tunnel-laptop (or the one you want to use)"
    } else {
        $tunnelId = Read-Host "`nPaste the Tunnel ID from the output above"
    }
}

if (-not $tunnelId -or $tunnelId -eq "PLACEHOLDER_TUNNEL_ID") {
    Write-Host "No valid Tunnel ID. Exit." -ForegroundColor Red
    exit 1
}

$credSrc = "$env:USERPROFILE\.cloudflared\$tunnelId.json"
$destDir = Join-Path $PSScriptRoot ".cloudflared"
$credDest = Join-Path $destDir "$tunnelId.json"

Write-Host "`nStep 2: Copying credential to project..." -ForegroundColor Cyan
if (-not (Test-Path $credSrc)) {
    Write-Host "File not found: $credSrc" -ForegroundColor Red
    Write-Host "If you just created the tunnel, it should be there. Try running this script again." -ForegroundColor Yellow
    exit 1
}
New-Item -ItemType Directory -Path $destDir -Force | Out-Null
Copy-Item -Path $credSrc -Destination $credDest -Force
Write-Host "Copied to: $credDest" -ForegroundColor Green

Write-Host "`nStep 3: Updating config.yml..." -ForegroundColor Cyan
$configPath = Join-Path $PSScriptRoot "config.yml"
(Get-Content $configPath -Raw) -replace 'PLACEHOLDER_TUNNEL_ID', $tunnelId | Set-Content $configPath -NoNewline
Write-Host "config.yml updated with credentials-file: .cloudflared/$tunnelId.json" -ForegroundColor Green

Write-Host "`nStep 4: Routing DNS (mychatbot.website -> this tunnel)..." -ForegroundColor Cyan
Invoke-Cloudflared "tunnel route dns whatsapp-tunnel-laptop mychatbot.website" | Out-Null
Invoke-Cloudflared "tunnel route dns whatsapp-tunnel-laptop www.mychatbot.website" | Out-Null
Write-Host "DNS routed." -ForegroundColor Green

Write-Host "`nDone. Next:" -ForegroundColor Green
Write-Host "  1. Start backend:  npm start" -ForegroundColor White
Write-Host "  2. Start tunnel:   .\cloudflared tunnel run whatsapp-tunnel-laptop" -ForegroundColor White
Write-Host "     (or double-click tunnel-run.bat after editing it to use whatsapp-tunnel-laptop)" -ForegroundColor Gray
