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

echo [2] Checking config.yml...
if exist "config.yml" (
    echo ✅ Found
    for /f "tokens=1,* delims=:" %%A in ('findstr /b /c:"credentials-file:" config.yml') do (
        set "CREDS_RAW=%%B"
    )
) else (
    echo ❌ NOT FOUND
)
echo.

echo [3] Checking credentials file from config.yml...
setlocal EnableDelayedExpansion
if defined CREDS_RAW (
    set "CREDS=!CREDS_RAW: =!"
    set "CREDS=!CREDS:/=\!"
    if "!CREDS:~0,1!"=="." (
        set "CREDS=%CD%\!CREDS!"
    )
    echo    credentials-file: !CREDS!
    if exist "!CREDS!" (
        echo ✅ Found
    ) else (
        echo ❌ NOT FOUND
        echo    Run the desktop reset script to generate/copy credentials.
    )
) else (
    echo ❌ credentials-file not found in config.yml
)
echo.
endlocal

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

