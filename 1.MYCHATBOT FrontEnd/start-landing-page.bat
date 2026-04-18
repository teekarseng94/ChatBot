@echo off
echo ========================================
echo Starting Landing Page Server (Port 3001)
echo ========================================
echo.

cd /d "%~dp0"

echo Checking if port 3001 is already in use...
netstat -ano | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo WARNING: Port 3001 is already in use!
    echo Please stop the process using port 3001 first.
    echo.
    echo To find the process, run:
    echo netstat -ano ^| findstr :3001
    pause
    exit /b 1
)

echo.
echo Starting Vite dev server...
echo Server will be available at:
echo   - http://localhost:3001
echo   - https://mychatbot.website (via Cloudflare tunnel)
echo   - https://www.mychatbot.website (via Cloudflare tunnel)
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev


