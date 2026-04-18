@echo off
echo ========================================
echo Simple Fix for Error 1033
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Stopping everything...
pm2 stop all 2>nul
pm2 delete all 2>nul
taskkill /F /IM cloudflared.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul
echo Done.
echo.

echo Step 2: Starting bot server...
pm2 start index.js --name whatsapp-bot
timeout /t 5 /nobreak >nul
echo Done.
echo.

echo Step 3: Starting tunnel...
if exist "cloudflared.exe" (
    pm2 start cloudflared.exe --name cloudflared-tunnel -- tunnel --config config.yml run
    timeout /t 5 /nobreak >nul
    echo Done.
) else (
    echo ERROR: cloudflared.exe not found!
)
echo.

echo Step 4: Checking status...
pm2 status
echo.

echo Port 3000:
netstat -ano | findstr :3000
echo.

echo Tunnel process:
tasklist | findstr cloudflared.exe
echo.

echo ========================================
echo Done! Wait 30 seconds, then visit:
echo https://mychatbot.website
echo ========================================
echo.
pause

