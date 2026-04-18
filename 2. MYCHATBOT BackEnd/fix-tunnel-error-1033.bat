@echo off
echo ========================================
echo Fix Cloudflare Tunnel Error 1033
echo ========================================
echo.
echo Error 1033 means the tunnel is not running or not connected.
echo This script will diagnose and fix the issue.
echo.

cd /d "%~dp0"

echo [Step 1/7] Checking if cloudflared.exe exists...
if exist "cloudflared.exe" (
    echo ✅ cloudflared.exe found
) else (
    echo ❌ cloudflared.exe NOT found!
    echo    Please download it from: https://github.com/cloudflare/cloudflared/releases
    echo    Save it as cloudflared.exe in this folder
    pause
    exit /b 1
)
echo.

echo [Step 2/7] Checking PM2 tunnel status...
pm2 status cloudflared-tunnel >nul 2>&1
if %errorlevel% equ 0 (
    pm2 describe cloudflared-tunnel | findstr "status" >nul
    if %errorlevel% equ 0 (
        echo ✅ Tunnel process exists in PM2
        pm2 describe cloudflared-tunnel | findstr "status"
    ) else (
        echo ⚠️ Tunnel process not found in PM2
    )
) else (
    echo ❌ PM2 not responding or tunnel not in PM2
)
echo.

echo [Step 3/7] Checking credentials file...
set "CREDS_PATH=C:\Users\User\.cloudflared\38ecb120-77ef-43e3-9ab3-e16b8c8f481e.json"
if exist "%CREDS_PATH%" (
    echo ✅ Credentials file found: %CREDS_PATH%
) else (
    echo ❌ Credentials file NOT found: %CREDS_PATH%
    echo.
    echo    You need to:
    echo    1. Authenticate: Run tunnel-login.bat
    echo    2. Create tunnel: Run tunnel-create.bat
    echo    3. Update config.yml with the correct credentials path
    echo.
    pause
    exit /b 1
)
echo.

echo [Step 4/7] Checking if config.yml exists...
if exist "config.yml" (
    echo ✅ config.yml found
    echo    Verifying credentials path in config.yml...
    findstr /C:"credentials-file" config.yml >nul
    if %errorlevel% equ 0 (
        echo ✅ credentials-file found in config.yml
        findstr "credentials-file" config.yml
    ) else (
        echo ❌ credentials-file not found in config.yml!
    )
) else (
    echo ❌ config.yml NOT found!
    pause
    exit /b 1
)
echo.

echo [Step 5/7] Stopping existing tunnel processes...
pm2 stop cloudflared-tunnel 2>nul
pm2 delete cloudflared-tunnel 2>nul
timeout /t 2 /nobreak >nul

REM Kill any cloudflared processes that might be running
taskkill /F /IM cloudflared.exe /T 2>nul
timeout /t 2 /nobreak >nul
echo ✅ Stopped existing processes
echo.

echo [Step 6/7] Starting tunnel with PM2...
REM Make sure we're using the correct path
if exist "cloudflared.exe" (
    pm2 start ecosystem.config.js --only cloudflared-tunnel
    timeout /t 5 /nobreak >nul
    echo ✅ Tunnel started
) else (
    echo ❌ cloudflared.exe not found - cannot start tunnel
    echo    Please download cloudflared.exe to this folder
)
echo.

echo [Step 7/7] Checking tunnel status and logs...
echo.
echo PM2 Status:
pm2 status
echo.

echo Recent Tunnel Logs (last 20 lines):
pm2 logs cloudflared-tunnel --lines 20 --nostream 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ Could not get logs - tunnel may not have started
)
echo.

echo ========================================
echo Diagnostic Complete
echo ========================================
echo.
echo Next steps:
echo 1. Check the logs above for connection status
echo 2. Look for "Connection established" or "Connected" messages
echo 3. If you see errors, check:
echo    - Credentials file path is correct
echo    - You're logged in: Run tunnel-login.bat
echo    - DNS is routed: Run tunnel-route-dns.bat
echo.
echo 4. Wait 30-60 seconds for tunnel to connect
echo 5. Visit: https://mychatbot.website
echo.
echo To view live logs: pm2 logs cloudflared-tunnel
echo.
pause

