@echo off
echo ========================================
echo Restart Server and Tunnel
echo ========================================
echo.

cd /d "%~dp0"

echo Stopping all processes...
echo.

REM Stop cloudflared tunnel
echo [1/4] Stopping Cloudflare tunnel...
taskkill /F /IM cloudflared.exe /T 2>nul
if %ERRORLEVEL% EQU 0 (
    echo    ✓ Cloudflare tunnel stopped
) else (
    echo    ℹ No cloudflared process found
)

REM Stop Node.js bot server
echo [2/4] Stopping bot server...
taskkill /F /IM node.exe /T 2>nul
if %ERRORLEVEL% EQU 0 (
    echo    ✓ Bot server stopped
) else (
    echo    ℹ No node.exe process found
)

REM Wait for processes to fully terminate
echo.
echo [3/4] Waiting for processes to terminate...
timeout /t 3 /nobreak >nul

REM Clear port 3000 if needed (optional)
echo [4/4] Starting services...
echo.

REM Start bot server
echo    Starting bot server...
start /MIN node index.js
if %ERRORLEVEL% EQU 0 (
    echo    ✓ Bot server started
) else (
    echo    ✗ Failed to start bot server
)

REM Wait a bit for server to initialize
timeout /t 5 /nobreak >nul

REM Start tunnel
echo    Starting Cloudflare tunnel...
if exist "cloudflared.bat" (
    start /MIN cmd /c "call cloudflared.bat tunnel --config config.yml run"
    echo    Tunnel start command sent via cloudflared.bat
) else (
    where cloudflared >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        start /MIN cloudflared tunnel --config config.yml run
        echo    Tunnel start command sent via PATH cloudflared
    ) else (
        echo    Failed to start tunnel
        echo    cloudflared not found locally or in PATH
        echo    Run: powershell -ExecutionPolicy Bypass -File .\install-cloudflared.ps1
        goto :AFTER_TUNNEL
    )
)

if %ERRORLEVEL% EQU 0 (
    echo    Bot + tunnel startup commands executed
) else (
    echo    Startup command returned an error
)
:AFTER_TUNNEL

echo.
echo ========================================
echo Restart Complete!
echo ========================================
echo.
echo Services are starting in the background.
echo Please wait 30-60 seconds for everything to initialize.
echo.
echo To check if services are running:
echo   tasklist | findstr node.exe
echo   tasklist | findstr cloudflared.exe
echo.
echo To view logs, check the minimized windows or run:
echo   node index.js
echo   cloudflared.bat tunnel --config config.yml run
echo.
echo Visit your website: https://mychatbot.website
echo.
pause




