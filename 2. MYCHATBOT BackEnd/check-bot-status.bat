@echo off
echo ========================================
echo WhatsApp Bot Status Checker
echo ========================================
echo.

cd /d "%~dp0"

echo [1] PM2 Status:
pm2 status
echo.

echo [2] Port 3000 Check:
netstat -ano | findstr :3000
if errorlevel 1 (
    echo   ⚠ Port 3000 is NOT listening
    echo   Bot server is not running
) else (
    echo   ✓ Port 3000 is listening
)
echo.

echo [3] Recent Bot Logs (last 10 lines):
pm2 logs whatsapp-bot --lines 10 --nostream
echo.

echo [4] Recent Tunnel Logs (last 10 lines):
pm2 logs cloudflared-tunnel --lines 10 --nostream
echo.

echo ========================================
echo Status Summary:
echo ========================================
pm2 describe whatsapp-bot >nul 2>&1
if errorlevel 1 (
    echo   Bot: NOT RUNNING
) else (
    pm2 describe whatsapp-bot | findstr "status" | findstr "online" >nul
    if errorlevel 1 (
        echo   Bot: STOPPED/ERRORED
    ) else (
        echo   Bot: RUNNING ✓
    )
)

pm2 describe cloudflared-tunnel >nul 2>&1
if errorlevel 1 (
    echo   Tunnel: NOT RUNNING
) else (
    pm2 describe cloudflared-tunnel | findstr "status" | findstr "online" >nul
    if errorlevel 1 (
        echo   Tunnel: STOPPED/ERRORED
    ) else (
        echo   Tunnel: RUNNING ✓
    )
)

echo.
echo To start the bot, run: start-bot-check.bat
echo.
pause
