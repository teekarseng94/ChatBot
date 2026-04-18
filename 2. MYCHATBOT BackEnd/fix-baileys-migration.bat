@echo off
echo ========================================
echo Fixing Baileys Migration
echo ========================================
echo.
echo The bot is still running OLD whatsapp-web.js code.
echo This script will clean everything and restart with Baileys.
echo.

cd /d "%~dp0"

echo [1/7] Stopping all PM2 processes...
pm2 stop all 2>nul
pm2 delete all 2>nul
timeout /t 2 /nobreak >nul

echo [2/7] Killing Chrome/Chromium processes...
taskkill /F /IM chrome.exe /T 2>nul
taskkill /F /IM chromium.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo [3/7] Clearing old session lock files...
for /d %%d in ("sessions\*") do (
    if exist "%%d\session-*\SingletonLock" del /F /Q "%%d\session-*\SingletonLock" 2>nul
    if exist "%%d\*.lock" del /F /Q "%%d\*.lock" 2>nul
)

echo [4/7] Verifying Baileys is installed...
npm list @whiskeysockets/baileys >nul 2>&1
if errorlevel 1 (
    echo   Installing Baileys...
    call npm install @whiskeysockets/baileys pino qrcode-terminal
) else (
    echo   Baileys is installed
)

echo [5/7] Verifying whatsapp-web.js is removed...
npm list whatsapp-web.js >nul 2>&1
if not errorlevel 1 (
    echo   Removing old whatsapp-web.js...
    call npm uninstall whatsapp-web.js
)

echo [6/7] Starting bot with new Baileys code...
pm2 start index.js --name whatsapp-bot

echo [7/7] Waiting for startup...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Status
echo ========================================
pm2 status

echo.
echo ========================================
echo Next Steps
echo ========================================
echo.
echo 1. Check logs to verify Baileys is running:
echo    pm2 logs whatsapp-bot --lines 30
echo.
echo 2. Look for Baileys logs (NOT whatsapp-web.js):
echo    - Should see: "Using Baileys version"
echo    - Should see: "Baileys socket created"
echo    - Should NOT see: "Client.initialize" or "Puppeteer"
echo.
echo 3. Visit: https://mychatbot.website
echo    Login and QR code should appear
echo.
pause
