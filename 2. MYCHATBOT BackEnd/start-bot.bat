@echo off
REM Alternative: Start bot directly without PM2 daemon
REM This bypasses the PM2 socket permission issue

echo Starting WhatsApp Bot (without PM2 daemon)...
echo Press Ctrl+C to stop
echo.

cd /d "%~dp0"
node index.js

pause







