@echo off
setlocal enabledelayedexpansion
title Fix Error 1033 - Cloudflare Tunnel
color 0A
echo.
echo ========================================
echo    FIXING ERROR 1033 - PLEASE WAIT
echo ========================================
echo.
echo This window will show all progress.
echo DO NOT close this window!
echo.
pause
echo.

REM Change to script directory
cd /d "%~dp0" 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Could not change directory, continuing anyway...
)
echo Current directory: %CD%
echo.

REM Check if PM2 is available
echo [1] Checking PM2...
set "PM2_CMD=pm2"
where pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo PM2 not in PATH, checking for pm2.bat wrapper...
    if exist "pm2.bat" (
        echo Found pm2.bat wrapper, will use it
        set "PM2_CMD=pm2.bat"
    ) else (
        echo Checking npm global PM2...
        call npm list -g pm2 >nul 2>&1
        if %errorlevel% neq 0 (
            echo WARNING: PM2 may not be installed!
            echo Will try to continue anyway...
            set "PM2_CMD=pm2"
        ) else (
            set "PM2_CMD=pm2"
        )
    )
)
echo Will use: %PM2_CMD%
echo Testing PM2 command...
%PM2_CMD% --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: PM2 command test failed!
    echo Will try to continue anyway...
) else (
    echo PM2 is working!
)
echo.
echo Press any key to continue to next step...
pause >nul
echo.

REM Stop everything
echo [2] Stopping all processes...
%PM2_CMD% stop all 2>nul
%PM2_CMD% delete all 2>nul
%PM2_CMD% kill 2>nul
echo Killing any running processes...
taskkill /F /IM cloudflared.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
timeout /t 3 /nobreak >nul
echo OK - All processes stopped
echo.
echo Press any key to continue...
pause >nul
echo.

REM Check files
echo [3] Checking required files...
set "ERRORS=0"
if not exist "index.js" (
    echo ERROR: index.js not found!
    set "ERRORS=1"
) else (
    echo OK - index.js found
)

if not exist "cloudflared.exe" (
    echo WARNING: cloudflared.exe not found!
    echo The tunnel may not start.
    set "ERRORS=1"
) else (
    echo OK - cloudflared.exe found
)

if not exist "config.yml" (
    echo ERROR: config.yml not found!
    set "ERRORS=1"
) else (
    echo OK - config.yml found
)
echo.
if "!ERRORS!"=="1" (
    echo WARNING: Some files are missing, but continuing...
)
echo Press any key to continue...
pause >nul
echo.

REM Start bot server
echo [4] Starting WhatsApp bot server...
%PM2_CMD% start index.js --name whatsapp-bot --update-env 2>&1
set "BOT_STARTED=0"
if %errorlevel% neq 0 (
    echo WARNING: PM2 start failed, trying direct start...
    start /B node index.js 2>nul
    timeout /t 3 /nobreak >nul
    echo Started bot server directly
    set "BOT_STARTED=1"
) else (
    echo OK - Bot server starting with PM2...
    set "BOT_STARTED=1"
)
timeout /t 8 /nobreak >nul
echo.
echo Press any key to continue...
pause >nul
echo.

REM Check port 3000
echo [5] Checking if server is running on port 3000...
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
        netstat -ano | findstr :3000
    ) else (
        echo ERROR - Port 3000 still not listening!
        echo Check bot server logs for errors.
    )
)
echo.
echo Press any key to continue...
pause >nul
echo.

REM Start tunnel
echo [6] Starting Cloudflare tunnel...
if exist "cloudflared.exe" (
    if exist "config.yml" (
        echo Starting tunnel with PM2...
        %PM2_CMD% start cloudflared.exe --name cloudflared-tunnel -- tunnel --config config.yml run 2>&1
        if %errorlevel% neq 0 (
            echo WARNING - PM2 start failed, trying direct start...
            start /B "" "cloudflared.exe" tunnel --config config.yml run
            echo OK - Tunnel started directly
        ) else (
            echo OK - Tunnel command sent to PM2
        )
        timeout /t 8 /nobreak >nul
    ) else (
        echo ERROR - config.yml not found!
    )
) else (
    echo ERROR - cloudflared.exe not found!
    echo Cannot start tunnel without cloudflared.exe
)
echo.
echo Press any key to continue...
pause >nul
echo.

REM Save PM2
echo [7] Saving PM2 configuration...
%PM2_CMD% save 2>nul
echo OK - Configuration saved
echo.
echo Press any key to see final status...
pause >nul
echo.

REM Show status
echo.
echo ========================================
echo    STATUS CHECK
echo ========================================
echo.
echo PM2 Processes:
%PM2_CMD% status 2>&1
echo.

echo Port 3000 Status:
netstat -ano | findstr :3000
if %errorlevel% neq 0 (
    echo   NOT LISTENING - Bot server may not be running
) else (
    echo   LISTENING - Bot server is running!
)
echo.

echo Tunnel Process Check:
tasklist | findstr cloudflared.exe >nul
if %errorlevel% equ 0 (
    echo   RUNNING - Tunnel process found!
    tasklist | findstr cloudflared.exe
) else (
    echo   NOT RUNNING - Tunnel process not found
)
echo.

echo ========================================
echo    RECENT LOGS
echo ========================================
echo.
echo Bot Server Logs (last 5 lines):
%PM2_CMD% logs whatsapp-bot --lines 5 --nostream 2>&1
if %errorlevel% neq 0 (
    echo   Could not get bot logs - process may not be in PM2
)
echo.

echo Tunnel Logs (last 10 lines):
%PM2_CMD% logs cloudflared-tunnel --lines 10 --nostream 2>&1
if %errorlevel% neq 0 (
    echo   Could not get tunnel logs - process may not be in PM2
    echo   Checking if tunnel is running directly...
    tasklist | findstr cloudflared.exe
)
echo.

echo ========================================
echo    NEXT STEPS
echo ========================================
echo.
echo 1. Wait 30-60 seconds for tunnel to connect
echo 2. Check if tunnel connected:
echo    %PM2_CMD% logs cloudflared-tunnel
echo.
echo 3. Look for these messages in tunnel logs:
echo    - "Connection established" (GOOD!)
echo    - "Connected" (GOOD!)
echo    - "Ready" (GOOD!)
echo    - "error" or "failed" (BAD - check credentials)
echo.
echo 4. Visit: https://mychatbot.website
echo.
echo ========================================
echo.
echo Script completed! Check the status above.
echo.
echo Press any key to close this window...
pause >nul
