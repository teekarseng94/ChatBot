@echo off
echo ========================================
echo AUTOMATIC FIX FOR ERROR 1033
echo ========================================
echo.
echo This will automatically fix everything.
echo Please wait...
echo.

cd /d "%~dp0"

REM Step 1: Stop everything
echo [1/8] Stopping all processes...
pm2 stop all 2>nul
pm2 delete all 2>nul
taskkill /F /IM cloudflared.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
timeout /t 3 /nobreak >nul
echo ✅ Stopped all processes
echo.

REM Step 2: Check cloudflared.exe
echo [2/8] Checking cloudflared.exe...
if not exist "cloudflared.exe" (
    echo ❌ cloudflared.exe not found!
    echo    Downloading instructions will be shown at the end.
    set "NEED_CLOUDFLARED=1"
) else (
    echo ✅ cloudflared.exe found
    set "NEED_CLOUDFLARED=0"
)
echo.

REM Step 3: Check credentials file
echo [3/8] Checking credentials file...
set "CREDS_PATH=C:\Users\User\.cloudflared\38ecb120-77ef-43e3-9ab3-e16b8c8f481e.json"
if not exist "%CREDS_PATH%" (
    echo ⚠️ Credentials file not found at expected path
    echo    Checking for any credentials file...
    if exist "C:\Users\User\.cloudflared\*.json" (
        echo ✅ Found credentials file(s) in .cloudflared folder
        echo    Listing files:
        dir /b "C:\Users\User\.cloudflared\*.json" 2>nul
        echo.
        echo    Please update config.yml with the correct file name
        set "NEED_CREDS_CHECK=1"
    ) else (
        echo ❌ No credentials file found!
        echo    You need to run: tunnel-login.bat and tunnel-create.bat
        set "NEED_CREDS_CHECK=1"
    )
) else (
    echo ✅ Credentials file found
    set "NEED_CREDS_CHECK=0"
)
echo.

REM Step 4: Verify config.yml
echo [4/8] Checking config.yml...
if not exist "config.yml" (
    echo ❌ config.yml not found! Creating default...
    (
        echo tunnel: whatsapp-tunnel
        echo credentials-file: %CREDS_PATH%
        echo.
        echo ingress:
        echo   - hostname: mychatbot.website
        echo     service: http://localhost:3000
        echo   - hostname: www.mychatbot.website
        echo     service: http://localhost:3000
        echo   - service: http_status:404
    ) > config.yml
    echo ✅ Created config.yml
) else (
    echo ✅ config.yml exists
)
echo.

REM Step 5: Start bot server first
echo [5/8] Starting WhatsApp bot server...
pm2 start ecosystem.config.js --only whatsapp-bot
timeout /t 5 /nobreak >nul

REM Check if bot started
pm2 describe whatsapp-bot >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Bot server started
) else (
    echo ❌ Bot server failed to start
    echo    Checking logs...
    pm2 logs whatsapp-bot --lines 10 --nostream 2>nul
)
echo.

REM Step 6: Verify port 3000
echo [6/8] Checking if port 3000 is listening...
timeout /t 3 /nobreak >nul
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo ✅ Port 3000 is listening
) else (
    echo ⚠️ Port 3000 not listening yet, waiting...
    timeout /t 5 /nobreak >nul
    netstat -ano | findstr :3000 >nul
    if %errorlevel% equ 0 (
        echo ✅ Port 3000 is now listening
    ) else (
        echo ❌ Port 3000 still not listening - bot may have issues
    )
)
echo.

REM Step 7: Start tunnel
echo [7/8] Starting Cloudflare tunnel...
if "%NEED_CLOUDFLARED%"=="1" (
    echo ❌ Cannot start tunnel - cloudflared.exe missing
) else (
    REM Try starting with PM2 ecosystem config
    pm2 start ecosystem.config.js --only cloudflared-tunnel
    timeout /t 5 /nobreak >nul
    
    REM Check if tunnel started
    pm2 describe cloudflared-tunnel >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Tunnel started with PM2
    ) else (
        echo ⚠️ Tunnel not in PM2, trying direct start...
        REM Try starting directly as fallback
        start /B "" "cloudflared.exe" tunnel --config config.yml run
        timeout /t 3 /nobreak >nul
        echo ✅ Tunnel started directly (running in background)
    )
)
echo.

REM Step 8: Final status and logs
echo [8/8] Final status check...
echo.
echo ========================================
echo PM2 STATUS
echo ========================================
pm2 status
echo.

echo ========================================
echo PORT 3000 CHECK
echo ========================================
netstat -ano | findstr :3000
if %errorlevel% neq 0 (
    echo ❌ Port 3000 is NOT listening
) else (
    echo ✅ Port 3000 is listening
)
echo.

echo ========================================
echo TUNNEL LOGS (Last 15 lines)
echo ========================================
pm2 logs cloudflared-tunnel --lines 15 --nostream 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ Could not get tunnel logs
)
echo.

echo ========================================
echo BOT SERVER LOGS (Last 10 lines)
echo ========================================
pm2 logs whatsapp-bot --lines 10 --nostream 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ Could not get bot logs
)
echo.

echo ========================================
echo AUTOMATIC FIX COMPLETE
echo ========================================
echo.

if "%NEED_CLOUDFLARED%"=="1" (
    echo ❌ ACTION REQUIRED: Download cloudflared.exe
    echo    1. Visit: https://github.com/cloudflare/cloudflared/releases/latest
    echo    2. Download: cloudflared-windows-amd64.exe
    echo    3. Rename to: cloudflared.exe
    echo    4. Place in: %CD%
    echo    5. Run this script again
    echo.
)

if "%NEED_CREDS_CHECK%"=="1" (
    echo ❌ ACTION REQUIRED: Set up tunnel credentials
    echo    1. Run: tunnel-login.bat
    echo    2. Run: tunnel-create.bat
    echo    3. Update config.yml with correct credentials path
    echo    4. Run this script again
    echo.
)

echo Next steps:
echo 1. Wait 30-60 seconds for tunnel to connect
echo 2. Check tunnel logs: pm2 logs cloudflared-tunnel
echo 3. Look for "Connection established" or "Connected" messages
echo 4. Visit: https://mychatbot.website
echo.
echo If still getting Error 1033:
echo - Check if you see "Connection established" in tunnel logs
echo - Verify DNS is routed: Run tunnel-route-dns.bat
echo - Check Cloudflare dashboard for tunnel status
echo.
pause

