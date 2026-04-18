@echo off
echo ========================================
echo Clean Restart for Baileys Migration
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Stopping PM2 processes...
pm2 stop all 2>nul
pm2 delete all 2>nul

echo.
echo Step 2: Killing any Chrome/Chromium processes...
taskkill /F /IM chrome.exe /T 2>nul
taskkill /F /IM chromium.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Step 3: Clearing old session lock files...
if exist "sessions\admin" (
    del /F /Q "sessions\admin\session-admin\SingletonLock" 2>nul
    del /F /Q "sessions\admin\session-admin\*.lock" 2>nul
    echo   Cleared lock files for admin
)

echo.
echo Step 4: Installing Baileys dependencies...
call npm install @whiskeysockets/baileys pino qrcode-terminal

echo.
echo Step 5: Verifying dependencies...
npm list @whiskeysockets/baileys 2>nul
if errorlevel 1 (
    echo   ERROR: Baileys not installed!
    echo   Run: npm install
    pause
    exit /b 1
)

echo.
echo Step 6: Starting bot with PM2...
pm2 start index.js --name whatsapp-bot

echo.
echo Step 7: Waiting for bot to start...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Status Check
echo ========================================
pm2 status

echo.
echo Checking port 3000...
netstat -ano | findstr :3000

echo.
echo ========================================
echo Done!
echo ========================================
echo.
echo Check logs with:
echo   pm2 logs whatsapp-bot --lines 50
echo.
echo If you see Baileys-related logs (not whatsapp-web.js),
echo the migration is working!
echo.
pause
