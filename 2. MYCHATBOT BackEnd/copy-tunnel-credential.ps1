# Copy tunnel credential from user .cloudflared to project .cloudflared
# Run from: 2. MYCHATBOT BackEnd
$TUNNEL_ID = "575a256f-e335-468d-98ef-41e84dd02465"
$src = "$env:USERPROFILE\.cloudflared\$TUNNEL_ID.json"
$destDir = Join-Path $PSScriptRoot ".cloudflared"
$dest = Join-Path $destDir "$TUNNEL_ID.json"

if (-not (Test-Path $src)) {
    Write-Host "Credential file NOT found at: $src" -ForegroundColor Red
    Write-Host ""
    Write-Host "This tunnel was created on another PC. Do one of the following:" -ForegroundColor Yellow
    Write-Host "  1. Copy the file from the old PC:" -ForegroundColor White
    Write-Host "     Old PC path: C:\Users\<ThatUser>\.cloudflared\$TUNNEL_ID.json" -ForegroundColor Gray
    Write-Host "     Paste it into this folder: $destDir" -ForegroundColor Gray
    Write-Host "  2. Or create a new tunnel on this laptop:" -ForegroundColor White
    Write-Host "     .\cloudflared tunnel create whatsapp-tunnel-laptop" -ForegroundColor Gray
    Write-Host "     Then copy the new .json to .cloudflared and update config.yml" -ForegroundColor Gray
    exit 1
}

New-Item -ItemType Directory -Path $destDir -Force | Out-Null
Copy-Item -Path $src -Destination $dest -Force
Write-Host "Copied credential to: $dest" -ForegroundColor Green
Write-Host "You can run: .\cloudflared tunnel run whatsapp-tunnel" -ForegroundColor Cyan
