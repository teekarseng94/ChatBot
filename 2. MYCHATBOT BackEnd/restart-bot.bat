@echo off
echo ========================================
echo Restarting WhatsApp Bot and Tunnel
echo ========================================
echo.

cd /d "%~dp0"

echo Stopping existing processes...
pm2 delete whatsapp-bot 2>nul
pm2 delete cloudflared-tunnel 2>nul

echo.
echo Starting bot and tunnel...
pm2 start ecosystem.config.js

echo.
echo Waiting for services to start...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Status Check
echo ========================================
pm2 status
echo.

echo Checking port 3000...
netstat -ano | findstr :3000
if errorlevel 1 (
    echo   ⚠ Port 3000 is NOT listening
) else (
    echo   ✓ Port 3000 is listening
)

echo.
echo ========================================
echo Done!
echo ========================================
echo.
echo Your bot should be accessible at:
echo   https://mychatbot.website
echo.
pause
