@echo off
REM Cloudflared Wrapper Script
REM This will work if cloudflared.exe is in the project folder

if exist "cloudflared.exe" (
    cloudflared.exe %*
) else if exist "cloudflared\cloudflared.exe" (
    cloudflared\cloudflared.exe %*
) else (
    echo.
    echo ERROR: cloudflared.exe not found!
    echo.
    echo Please download cloudflared:
    echo 1. Visit: https://github.com/cloudflare/cloudflared/releases/latest
    echo 2. Download: cloudflared-windows-amd64.exe
    echo 3. Rename to: cloudflared.exe
    echo 4. Place in this folder: %CD%
    echo.
    echo Or see CLOUDFLARED_SETUP.md for detailed instructions.
    echo.
    pause
    exit /b 1
)









