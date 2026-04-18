@echo off
echo ========================================
echo Fixing 502 Bad Gateway Error
echo ========================================
echo.

echo Step 1: Checking PM2 status...
pm2 status
echo.

echo Step 2: Checking if port 3000 is in use...
netstat -ano | findstr :3000
echo.

echo Step 3: Restarting WhatsApp bot...
pm2 restart whatsapp-bot
echo.

echo Step 4: Waiting 5 seconds...
timeout /t 5 /nobreak >nul

echo Step 5: Checking PM2 status again...
pm2 status
echo.

echo Step 6: Checking port 3000 again...
netstat -ano | findstr :3000
echo.

echo ========================================
echo Done! Check the status above.
echo If whatsapp-bot shows as "online" and port 3000 is listening,
echo the 502 error should be fixed.
echo ========================================
pause
