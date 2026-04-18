@echo off
REM Cloudflare Tunnel Route DNS
REM This script routes DNS for the domain

cd /d "%~dp0"
echo Routing DNS for mychatbot.website...
.\cloudflared.bat tunnel route dns whatsapp-tunnel mychatbot.website

echo.
echo Routing DNS for www.mychatbot.website...
.\cloudflared.bat tunnel route dns whatsapp-tunnel www.mychatbot.website

echo.
echo DNS routing complete!
pause
