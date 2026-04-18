@echo off
echo ========================================
echo Quick Fix for Error 1033
echo ========================================
echo.

cd /d "%~dp0"

echo Stopping old processes...
taskkill /F /IM cloudflared.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo Starting bot server...
start /MIN node index.js
timeout /t 5 /nobreak >nul

echo Starting tunnel...
start /MIN cloudflared.exe tunnel --config config.yml run
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Done!
echo ========================================
echo.
echo Both services started in background.
echo Wait 30 seconds, then visit: https://mychatbot.website
echo.
echo To check if running:
echo   tasklist | findstr node.exe
echo   tasklist | findstr cloudflared.exe
echo.
pause

