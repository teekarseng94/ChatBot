@echo off
title Re-register Tunnel with Cloudflare
echo.
echo ========================================
echo    RE-REGISTER TUNNEL
echo ========================================
echo.
echo This will re-register your tunnel with Cloudflare.
echo Run this if Error 530 persists.
echo.
pause
echo.

cd /d "%~dp0"

echo Step 1: Listing existing tunnels...
if exist "cloudflared.bat" (
    call cloudflared.bat tunnel list
) else (
    cloudflared.exe tunnel list
)
echo.
pause
echo.

echo Step 2: Re-routing DNS for mychatbot.website...
if exist "cloudflared.bat" (
    call cloudflared.bat tunnel route dns whatsapp-tunnel mychatbot.website
) else (
    cloudflared.exe tunnel route dns whatsapp-tunnel mychatbot.website
)
echo.
pause
echo.

echo Step 3: Re-routing DNS for www.mychatbot.website...
if exist "cloudflared.bat" (
    call cloudflared.bat tunnel route dns whatsapp-tunnel www.mychatbot.website
) else (
    cloudflared.exe tunnel route dns whatsapp-tunnel www.mychatbot.website
)
echo.
pause
echo.

echo Step 4: Verifying DNS records...
echo.
echo Checking DNS for mychatbot.website...
nslookup mychatbot.website 2>nul
echo.

echo ========================================
echo    DONE
echo ========================================
echo.
echo Next steps:
echo 1. Make sure tunnel is running (run QUICK_FIX_1033.bat)
echo 2. Wait 60-90 seconds for DNS propagation
echo 3. Visit: https://mychatbot.website
echo.
pause
