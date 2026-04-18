@echo off
title Fix Error 1033 - Without PM2
color 0A
echo.
echo ========================================
echo    FIXING ERROR 1033 (NO PM2 NEEDED)
echo ========================================
echo.
echo This will start everything directly.
echo.
pause
echo.

cd /d "%~dp0"
echo Current directory: %CD%
echo.

echo [1] Stopping all existing processes...
taskkill /F /IM cloudflared.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul
echo Done.
echo.

echo [2] Checking files...
if not exist "index.js" (
    echo ERROR: index.js not found!
    pause
    exit /b 1
)
echo OK - index.js found

if not exist "cloudflared.exe" (
    echo ERROR: cloudflared.exe not found!
    pause
    exit /b 1
)
echo OK - cloudflared.exe found

if not exist "config.yml" (
    echo ERROR: config.yml not found!
    pause
    exit /b 1
)
echo OK - config.yml found
echo.

echo [3] Starting WhatsApp bot server...
start "WhatsApp Bot Server" /MIN node index.js
timeout /t 5 /nobreak >nul
echo Bot server started in background window.
echo.

echo [4] Checking if port 3000 is listening...
timeout /t 3 /nobreak >nul
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo OK - Port 3000 is listening!
    netstat -ano | findstr :3000
) else (
    echo WARNING - Port 3000 not listening yet...
    echo Waiting 5 more seconds...
    timeout /t 5 /nobreak >nul
    netstat -ano | findstr :3000 >nul
    if %errorlevel% equ 0 (
        echo OK - Port 3000 is now listening!
    ) else (
        echo ERROR - Port 3000 still not listening!
        echo Check the bot server window for errors.
    )
)
echo.

echo [5] Starting Cloudflare tunnel...
start "Cloudflare Tunnel" /MIN "cloudflared.exe" tunnel --config config.yml run
timeout /t 5 /nobreak >nul
echo Tunnel started in background window.
echo.

echo [6] Checking processes...
echo.
echo Node.js processes:
tasklist | findstr node.exe
if %errorlevel% neq 0 (
    echo   No node.exe processes found
)
echo.

echo Cloudflared processes:
tasklist | findstr cloudflared.exe
if %errorlevel% neq 0 (
    echo   No cloudflared.exe processes found
)
echo.

echo Port 3000 status:
netstat -ano | findstr :3000
if %errorlevel% neq 0 (
    echo   NOT LISTENING
) else (
    echo   LISTENING - Server is running!
)
echo.

echo ========================================
echo    STATUS
echo ========================================
echo.
echo Both processes are running in separate windows.
echo Check the minimized windows for any errors.
echo.
echo Wait 30-60 seconds for tunnel to connect.
echo Then visit: https://mychatbot.website
echo.
echo To stop everything:
echo - Close the minimized windows, OR
echo - Run: taskkill /F /IM node.exe /T
echo - Run: taskkill /F /IM cloudflared.exe /T
echo.
pause

