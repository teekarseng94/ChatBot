@echo off
echo ========================================
echo PM2 Permission Fix (Admin Required)
echo ========================================
echo.
echo This script requires Administrator privileges.
echo Right-click and select "Run as administrator"
echo.
pause

echo.
echo Step 1: Killing ALL Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul

echo Step 2: Removing PM2 socket files...
if exist "%USERPROFILE%\.pm2" (
    del /F /Q "%USERPROFILE%\.pm2\*.sock" 2>nul
    del /F /Q "%USERPROFILE%\.pm2\*.pid" 2>nul
    del /F /Q "%USERPROFILE%\.pm2\pm2.log" 2>nul
    echo   Socket files removed
)

echo Step 3: Waiting for processes to fully terminate...
timeout /t 5 /nobreak >nul

echo.
echo Done! Now try:
echo   .\pm2.bat start index.js --name whatsapp-system
echo.
pause







