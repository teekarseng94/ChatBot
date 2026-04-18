@echo off
REM Fix DNS Route - Delete existing records and create tunnel routes
REM This script helps resolve DNS conflicts

echo ========================================
echo Cloudflare Tunnel DNS Route Fix
echo ========================================
echo.
echo This will help you fix DNS routing conflicts.
echo.
echo Step 1: You need to delete existing DNS records in Cloudflare Dashboard
echo.
echo Please do the following:
echo 1. Go to: https://dash.cloudflare.com
echo 2. Select your domain: mychatbot.website
echo 3. Go to DNS ^> Records
echo 4. Delete any A, AAAA, or CNAME records for:
echo    - mychatbot.website
echo    - www.mychatbot.website
echo.
echo After deleting the records, press any key to continue...
pause

echo.
echo Step 2: Creating tunnel DNS routes...
echo.

echo Creating route for mychatbot.website...
cloudflared.exe tunnel route dns whatsapp-tunnel mychatbot.website
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create route for mychatbot.website
    echo Make sure you deleted the existing DNS record in Cloudflare Dashboard
    pause
    exit /b 1
)

echo.
echo Creating route for www.mychatbot.website...
cloudflared.exe tunnel route dns whatsapp-tunnel www.mychatbot.website
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create route for www.mychatbot.website
    echo Make sure you deleted the existing DNS record in Cloudflare Dashboard
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! DNS routes created.
echo ========================================
echo.
echo Your domain should now be accessible at:
echo - https://mychatbot.website
echo - https://www.mychatbot.website
echo.
echo Note: DNS changes may take 1-2 minutes to propagate.
echo.
pause
