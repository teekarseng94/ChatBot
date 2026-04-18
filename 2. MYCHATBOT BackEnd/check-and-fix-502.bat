@echo off
echo ========================================
echo 502 Error Diagnostic and Fix Tool
echo ========================================
echo.

echo [1/6] Checking if PM2 is installed...
where pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PM2 is not installed or not in PATH
    echo    Please install PM2: npm install -g pm2
    pause
    exit /b 1
)
echo ✅ PM2 is installed
echo.

echo [2/6] Checking PM2 process status...
pm2 status
echo.

echo [3/6] Checking if port 3000 is in use...
netstat -ano | findstr :3000
if %errorlevel% equ 0 (
    echo ✅ Port 3000 is in use (server might be running)
) else (
    echo ❌ Port 3000 is NOT in use (server is NOT running)
)
echo.

echo [4/6] Checking recent PM2 logs for errors...
echo --- whatsapp-bot logs (last 20 lines) ---
pm2 logs whatsapp-bot --lines 20 --nostream 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ Could not get logs for whatsapp-bot
)
echo.

echo [5/6] Attempting to restart services...
echo Stopping all PM2 processes...
pm2 stop all
timeout /t 2 /nobreak >nul

echo Starting whatsapp-bot...
pm2 start ecosystem.config.js --only whatsapp-bot
timeout /t 3 /nobreak >nul

echo Starting cloudflared-tunnel...
pm2 start ecosystem.config.js --only cloudflared-tunnel
timeout /t 3 /nobreak >nul

echo.
echo [6/6] Final status check...
pm2 status
echo.

echo Checking port 3000 again...
netstat -ano | findstr :3000
if %errorlevel% equ 0 (
    echo ✅ Port 3000 is now listening!
    echo ✅ Server should be accessible
) else (
    echo ❌ Port 3000 is still not listening
    echo    Check the logs above for errors
)
echo.

echo ========================================
echo Diagnostic Complete
echo ========================================
echo.
echo Next steps:
echo 1. Wait 10-15 seconds for services to fully start
echo 2. Visit https://mychatbot.website
echo 3. If still 502, check logs: pm2 logs whatsapp-bot
echo.
pause

