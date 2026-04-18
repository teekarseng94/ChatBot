@echo off
echo ========================================
echo FORCE CLEAN RESTART - Baileys Migration
echo ========================================
echo.
echo This will completely stop everything and restart with Baileys.
echo.

cd /d "%~dp0"

echo [1/8] Stopping all PM2 processes...
pm2 stop all 2>nul
pm2 delete all 2>nul
pm2 kill 2>nul
timeout /t 3 /nobreak >nul

echo [2/8] Killing all Node.js processes...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo [3/8] Killing all Chrome/Chromium processes...
taskkill /F /IM chrome.exe /T 2>nul
taskkill /F /IM chromium.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo [4/8] Clearing session lock files...
for /d %%d in ("sessions\*") do (
    if exist "%%d\session-*\SingletonLock" (
        del /F /Q "%%d\session-*\SingletonLock" 2>nul
    )
    if exist "%%d\*.lock" (
        del /F /Q "%%d\*.lock" 2>nul
    )
)

echo [5/8] Verifying Baileys is in package.json...
findstr /C:"@whiskeysockets/baileys" package.json >nul
if errorlevel 1 (
    echo   ERROR: Baileys not found in package.json!
    echo   Please check package.json
    pause
    exit /b 1
) else (
    echo   Baileys found in package.json
)

echo [6/8] Installing/updating dependencies...
call npm install

echo [7/8] Verifying whatsapp-web.js is removed...
npm list whatsapp-web.js >nul 2>&1
if not errorlevel 1 (
    echo   WARNING: whatsapp-web.js still installed, removing...
    call npm uninstall whatsapp-web.js
)

echo [8/8] Starting bot with PM2 (fresh start)...
pm2 start index.js --name whatsapp-bot --update-env

echo.
echo Waiting 5 seconds for startup...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Status Check
echo ========================================
pm2 status

echo.
echo ========================================
echo Checking Logs (should see Baileys, NOT whatsapp-web.js)
echo ========================================
pm2 logs whatsapp-bot --lines 20 --nostream

echo.
echo ========================================
echo Done!
echo ========================================
echo.
echo If you see "Baileys" in the logs above, migration is working!
echo If you still see "whatsapp-web.js", PM2 may need a full restart.
echo.
pause
