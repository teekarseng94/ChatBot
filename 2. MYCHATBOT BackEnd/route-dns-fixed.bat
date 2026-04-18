@echo off
REM Route DNS for Cloudflare Tunnel
REM Run this AFTER deleting existing DNS records in Cloudflare Dashboard

cd /d "%~dp0"

echo ========================================
echo Routing DNS for Cloudflare Tunnel
echo ========================================
echo.

echo Step 1: Creating route for mychatbot.website...
cloudflared.exe tunnel route dns whatsapp-tunnel mychatbot.website
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to create route for mychatbot.website
    echo.
    echo Make sure you:
    echo 1. Deleted existing DNS records in Cloudflare Dashboard
    echo 2. Waited 1-2 minutes after deletion
    echo.
    pause
    exit /b 1
)

echo.
echo Step 2: Creating route for www.mychatbot.website...
cloudflared.exe tunnel route dns whatsapp-tunnel www.mychatbot.website
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to create route for www.mychatbot.website
    echo.
    echo Make sure you:
    echo 1. Deleted existing DNS records in Cloudflare Dashboard
    echo 2. Waited 1-2 minutes after deletion
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! DNS routes created.
echo ========================================
echo.
echo Your domain should now be accessible at:
echo - https://mychatbot.website
echo - https://www.mychatbot.website
echo.
echo Note: DNS changes may take 1-2 minutes to propagate.
echo.
pause
