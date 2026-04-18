@echo off
echo ========================================
echo Verify Cloudflare Tunnel Setup
echo ========================================
echo.

cd /d "%~dp0"

echo [1] Checking cloudflared.exe...
if exist "cloudflared.exe" (
    echo ✅ Found
) else (
    echo ❌ NOT FOUND - Download from GitHub releases
)
echo.

echo [2] Checking credentials file...
set "CREDS=C:\Users\User\.cloudflared\38ecb120-77ef-43e3-9ab3-e16b8c8f481e.json"
if exist "%CREDS%" (
    echo ✅ Found: %CREDS%
) else (
    echo ❌ NOT FOUND
    echo    Run: tunnel-login.bat and tunnel-create.bat
)
echo.

echo [3] Checking config.yml...
if exist "config.yml" (
    echo ✅ Found
    echo    Credentials path:
    findstr "credentials-file" config.yml
) else (
    echo ❌ NOT FOUND
)
echo.

echo [4] Checking PM2 tunnel process...
pm2 describe cloudflared-tunnel >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Tunnel process exists
    pm2 describe cloudflared-tunnel | findstr "status\|pid\|uptime"
) else (
    echo ❌ Tunnel NOT running in PM2
    echo    Start it: pm2 start ecosystem.config.js --only cloudflared-tunnel
)
echo.

echo [5] Checking if tunnel is connected...
echo    Recent logs:
pm2 logs cloudflared-tunnel --lines 10 --nostream 2>nul | findstr /i "connect\|error\|ready\|established"
if %errorlevel% neq 0 (
    echo    ⚠️ No connection messages in logs
    echo    View full logs: pm2 logs cloudflared-tunnel
)
echo.

echo [6] Checking bot server (port 3000)...
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo ✅ Port 3000 is listening (bot server is running)
) else (
    echo ❌ Port 3000 NOT listening (bot server is NOT running)
    echo    Start it: pm2 start ecosystem.config.js --only whatsapp-bot
)
echo.

echo ========================================
echo Summary
echo ========================================
echo.
echo If all checks pass, your tunnel should be working.
echo If not, run: fix-tunnel-error-1033.bat
echo.
pause

