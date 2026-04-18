@echo off
title Install PM2
echo.
echo ========================================
echo    INSTALLING PM2
echo ========================================
echo.
echo This will install PM2 globally using npm.
echo.
pause
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo OK - Node.js is installed
node --version
echo.

echo Checking if npm is installed...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)
echo OK - npm is installed
npm --version
echo.

echo Installing PM2 globally...
echo This may take a minute...
npm install -g pm2
if %errorlevel% neq 0 (
    echo.
    echo ERROR: PM2 installation failed!
    echo.
    echo Try running PowerShell as Administrator and run:
    echo   npm install -g pm2
    pause
    exit /b 1
)
echo.
echo OK - PM2 installed!
echo.

echo Verifying PM2 installation...
pm2 --version
if %errorlevel% neq 0 (
    echo.
    echo WARNING: PM2 installed but not in PATH
    echo You may need to restart your terminal or add npm to PATH
) else (
    echo.
    echo SUCCESS! PM2 is now working.
    echo.
    echo You can now use PM2 commands:
    echo   pm2 start index.js --name whatsapp-bot
    echo   pm2 status
    echo   pm2 logs
)
echo.
pause

