@echo off
echo ========================================
echo FULLY AUTOMATIC FIX - ERROR 1033
echo ========================================
echo.
echo Fixing everything automatically...
echo Please DO NOT close this window.
echo.

cd /d "%~dp0"

REM Kill everything first
echo [Cleaning up...]
pm2 stop all 2>nul
pm2 delete all 2>nul
pm2 kill 2>nul
taskkill /F /IM cloudflared.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
timeout /t 3 /nobreak >nul

REM Start bot server
echo [Starting bot server...]
pm2 start index.js --name whatsapp-bot --update-env
timeout /t 8 /nobreak >nul

REM Check port 3000
netstat -ano | findstr :3000 >nul
if %errorlevel% neq 0 (
    echo [Bot server not ready, waiting...]
    timeout /t 5 /nobreak >nul
)

REM Start tunnel
echo [Starting tunnel...]
if exist "cloudflared.exe" (
    if exist "config.yml" (
        pm2 start cloudflared.exe --name cloudflared-tunnel -- tunnel --config config.yml run
        timeout /t 8 /nobreak >nul
    ) else (
        echo [ERROR] config.yml not found!
    )
) else (
    echo [ERROR] cloudflared.exe not found!
)

REM Save PM2 config
pm2 save 2>nul

REM Show status
echo.
echo ========================================
echo STATUS
echo ========================================
pm2 status
echo.

echo ========================================
echo CHECKING CONNECTIONS
echo ========================================
netstat -ano | findstr :3000
echo.

echo ========================================
echo TUNNEL LOGS (checking connection...)
echo ========================================
timeout /t 2 /nobreak >nul
pm2 logs cloudflared-tunnel --lines 10 --nostream 2>nul
echo.

echo ========================================
echo DONE!
echo ========================================
echo.
echo Wait 30-60 seconds, then visit:
echo https://mychatbot.website
echo.
echo To check if tunnel connected:
echo pm2 logs cloudflared-tunnel
echo.
echo Look for "Connection established" message.
echo.
pause

