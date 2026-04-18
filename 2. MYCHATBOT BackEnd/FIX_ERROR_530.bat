@echo off
title Fix Error 530 - Tunnel Unregistered
color 0C
echo.
echo ========================================
echo    FIXING ERROR 530
echo ========================================
echo.
echo Error 530 = Tunnel unregistered from Cloudflare
echo This will re-register your tunnel.
echo.
pause
echo.

cd /d "%~dp0"

echo [Step 1] Stopping all processes...
taskkill /F /IM cloudflared.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul
echo Done.
echo.

echo [Step 2] Checking files...
if not exist "cloudflared.exe" (
    echo ERROR: cloudflared.exe not found!
    pause
    exit /b 1
)
if not exist "config.yml" (
    echo ERROR: config.yml not found!
    pause
    exit /b 1
)
echo OK - Files found
echo.

echo [Step 3] Re-routing DNS to tunnel...
echo This will re-register your domain with Cloudflare.
echo.
echo Routing mychatbot.website...
if exist "cloudflared.bat" (
    call cloudflared.bat tunnel route dns whatsapp-tunnel mychatbot.website
) else (
    cloudflared.exe tunnel route dns whatsapp-tunnel mychatbot.website
)
echo.

echo Routing www.mychatbot.website...
if exist "cloudflared.bat" (
    call cloudflared.bat tunnel route dns whatsapp-tunnel www.mychatbot.website
) else (
    cloudflared.exe tunnel route dns whatsapp-tunnel www.mychatbot.website
)
echo.

echo [Step 4] Starting bot server...
start /MIN node index.js
timeout /t 5 /nobreak >nul
echo Bot server started.
echo.

echo [Step 5] Starting tunnel...
start /MIN cloudflared.exe tunnel --config config.yml run
timeout /t 5 /nobreak >nul
echo Tunnel started.
echo.

echo [Step 6] Checking status...
timeout /t 3 /nobreak >nul
echo.
echo Processes running:
tasklist | findstr node.exe
tasklist | findstr cloudflared.exe
echo.

echo Port 3000:
netstat -ano | findstr :3000
echo.

echo ========================================
echo    IMPORTANT NEXT STEPS
echo ========================================
echo.
echo 1. Wait 60-90 seconds for DNS to propagate
echo 2. The tunnel needs to reconnect to Cloudflare
echo 3. Check tunnel window for "Connection established"
echo.
echo 4. Visit: https://mychatbot.website
echo    (May take 1-2 minutes to work)
echo.
echo If still getting Error 530:
echo - Check Cloudflare dashboard: Zero Trust ^> Networks ^> Tunnels
echo - Verify tunnel shows as "Connected"
echo - Try running: RE_REGISTER_TUNNEL.bat
echo.
pause
