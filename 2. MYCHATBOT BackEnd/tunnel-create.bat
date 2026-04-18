@echo off
REM Cloudflare Tunnel Create
REM This script creates the named tunnel

cd /d "%~dp0"
.\cloudflared.bat tunnel create whatsapp-tunnel

echo.
echo IMPORTANT: Note the Tunnel ID from the output above.
echo You may need to update config.yml with the correct credentials file path.
echo.
pause
