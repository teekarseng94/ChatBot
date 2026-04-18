@echo off
echo ========================================
echo Complete 502 Error Fix
echo ========================================
echo.
echo This script will:
echo 1. Stop all PM2 processes
echo 2. Check for port conflicts
echo 3. Restart services properly
echo 4. Verify everything is working
echo.

cd /d "%~dp0"

echo [Step 1/5] Stopping all PM2 processes...
pm2 stop all 2>nul
pm2 delete all 2>nul
timeout /t 2 /nobreak >nul
echo ✅ Stopped all processes
echo.

echo [Step 2/5] Checking if port 3000 is free...
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo ⚠️ Port 3000 is still in use
    echo    Finding and killing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
        echo    Killing process %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
) else (
    echo ✅ Port 3000 is free
)
echo.

echo [Step 3/5] Starting WhatsApp Bot server...
pm2 start ecosystem.config.js --only whatsapp-bot
timeout /t 5 /nobreak >nul
echo ✅ Bot server started
echo.

echo [Step 4/5] Starting Cloudflare Tunnel...
pm2 start ecosystem.config.js --only cloudflared-tunnel
timeout /t 3 /nobreak >nul
echo ✅ Tunnel started
echo.

echo [Step 5/5] Verifying services...
echo.
echo PM2 Status:
pm2 status
echo.

echo Port 3000 Check:
netstat -ano | findstr :3000
if %errorlevel% equ 0 (
    echo ✅ Port 3000 is listening - Server is running!
) else (
    echo ❌ Port 3000 is NOT listening - Server failed to start
    echo.
    echo Checking logs for errors...
    pm2 logs whatsapp-bot --lines 30 --nostream
)
echo.

echo ========================================
echo Fix Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Wait 10-15 seconds for services to fully initialize
echo 2. Visit: https://mychatbot.website
echo 3. If still 502, check logs: pm2 logs whatsapp-bot
echo.
pause

