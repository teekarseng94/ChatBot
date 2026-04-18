@echo off
echo ========================================
echo WhatsApp Bot Startup Checker
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Checking PM2 daemon...
pm2 ping >nul 2>&1
if errorlevel 1 (
    echo   ⚠ PM2 daemon not running, starting it...
    pm2 kill >nul 2>&1
    timeout /t 2 /nobreak >nul
)

echo [2/5] Checking current PM2 status...
pm2 status
echo.

echo [3/5] Checking if bot is running...
pm2 describe whatsapp-bot >nul 2>&1
if errorlevel 1 (
    echo   ⚠ Bot not found in PM2, starting it...
    pm2 start index.js --name whatsapp-bot
) else (
    pm2 describe whatsapp-bot | findstr "status" | findstr "online" >nul
    if errorlevel 1 (
        echo   ⚠ Bot is stopped, restarting...
        pm2 restart whatsapp-bot
    ) else (
        echo   ✓ Bot is already running
    )
)

echo.
echo [4/5] Checking if tunnel is running...
pm2 describe cloudflared-tunnel >nul 2>&1
if errorlevel 1 (
    echo   ⚠ Tunnel not found in PM2, starting it...
    pm2 start cloudflared.exe --name cloudflared-tunnel -- tunnel --config config.yml run
) else (
    pm2 describe cloudflared-tunnel | findstr "status" | findstr "online" >nul
    if errorlevel 1 (
        echo   ⚠ Tunnel is stopped, restarting...
        pm2 restart cloudflared-tunnel
    ) else (
        echo   ✓ Tunnel is already running
    )
)

echo.
echo [5/5] Waiting for services to start...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Final Status Check
echo ========================================
pm2 status
echo.

echo Checking port 3000...
netstat -ano | findstr :3000 >nul
if errorlevel 1 (
    echo   ⚠ Port 3000 is NOT listening - bot may still be starting
    echo   Wait 10-15 seconds and check again
) else (
    echo   ✓ Port 3000 is listening
    netstat -ano | findstr :3000
)

echo.
echo ========================================
echo Done!
echo ========================================
echo.
echo Your bot should be accessible at:
echo   https://mychatbot.website
echo.
echo If you see errors above, check logs with:
echo   pm2 logs whatsapp-bot
echo   pm2 logs cloudflared-tunnel
echo.
pause
