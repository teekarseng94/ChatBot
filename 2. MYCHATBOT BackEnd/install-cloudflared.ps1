# Cloudflared Installation Script for Windows
Write-Host "Installing cloudflared..." -ForegroundColor Cyan

# Create cloudflared directory in project folder
$cloudflaredDir = Join-Path $PSScriptRoot "cloudflared"
if (-not (Test-Path $cloudflaredDir)) {
    New-Item -ItemType Directory -Path $cloudflaredDir | Out-Null
}

# Get latest release URL
Write-Host "Fetching latest cloudflared release..." -ForegroundColor Yellow
$latestRelease = Invoke-RestMethod -Uri "https://api.github.com/repos/cloudflare/cloudflared/releases/latest"
$asset = $latestRelease.assets |
    Where-Object {
        ($_.name -match 'windows[-_]amd64') -and
        ($_.name -match '\.exe$')
    } |
    Select-Object -First 1

if (-not $asset) {
    Write-Host "Error: Could not find Windows release" -ForegroundColor Red
    exit 1
}

$downloadUrl = $asset.browser_download_url
$outputPath = Join-Path $cloudflaredDir "cloudflared.exe"

Write-Host "Downloading cloudflared from: $downloadUrl" -ForegroundColor Yellow
Invoke-WebRequest -Uri $downloadUrl -OutFile $outputPath

if (Test-Path $outputPath) {
    Write-Host "cloudflared downloaded successfully." -ForegroundColor Green
    Write-Host "Location: $outputPath" -ForegroundColor Cyan
    
    # Create a batch file wrapper
    $batchFile = Join-Path $PSScriptRoot "cloudflared.bat"
    $batchContent = @(
        '@echo off'
        'REM Cloudflared Wrapper Script'
        "`"$outputPath`" %*"
    )
    Set-Content -Path $batchFile -Value $batchContent -Encoding ASCII
    
    Write-Host "Created cloudflared.bat wrapper." -ForegroundColor Green
    Write-Host "`nYou can now use:" -ForegroundColor Cyan
    Write-Host "  .\cloudflared.bat tunnel --url http://localhost:3000" -ForegroundColor White
} else {
    Write-Host "Error: Download failed" -ForegroundColor Red
    exit 1
}









