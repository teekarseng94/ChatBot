@echo off
cd /d "%~dp0"

echo Building frontend...
cd "1.MYCHATBOT FrontEnd"
call npm run build
if errorlevel 1 (
    echo Frontend build failed.
    pause
    exit /b 1
)

echo.
echo Copying frontend to backend...
cd "..\2. MYCHATBOT BackEnd"
call npm run copy-frontend
if errorlevel 1 (
    echo copy-frontend failed.
    pause
    exit /b 1
)

echo.
echo Restarting PM2...
call pm2 restart all
echo.
echo If you saw "No process found" above: your backend is not running under PM2. Restart it yourself (e.g. node index.js).
echo.
echo Done.
pause
