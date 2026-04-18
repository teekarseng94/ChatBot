@echo off
echo Fixing PM2 permission issues...
echo.

echo Step 1: Killing PM2 processes...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq PM2*" 2>nul
taskkill /F /FI "WINDOWTITLE eq *pm2*" 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Cleaning PM2 socket files...
if exist "%USERPROFILE%\.pm2\*.sock" (
    del /F /Q "%USERPROFILE%\.pm2\*.sock" 2>nul
    echo   Socket files removed
)

echo Step 3: Resetting PM2 daemon...
if exist "%USERPROFILE%\.pm2\pm2.log" (
    del /F /Q "%USERPROFILE%\.pm2\pm2.log" 2>nul
)

echo.
echo Done! You can now restart PM2:
echo   .\pm2.bat start index.js --name whatsapp-system
echo.
pause







