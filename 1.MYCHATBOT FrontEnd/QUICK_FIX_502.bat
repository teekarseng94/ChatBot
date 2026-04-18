@echo off
echo ========================================
echo Quick Fix: Start Landing Page Server
echo ========================================
echo.

cd /d "%~dp0"

echo Starting Vite dev server on port 3001...
echo This will fix the 502 Bad Gateway error.
echo.
echo The server will start and stay running.
echo Press Ctrl+C to stop it when done.
echo.

npm run dev


