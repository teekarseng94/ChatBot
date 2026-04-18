@echo off
echo ========================================
echo Quick Fix for 502 Error
echo ========================================
echo.

echo Restarting all services...
pm2 restart all

echo.
echo Waiting 5 seconds for services to start...
timeout /t 5 /nobreak >nul

echo.
echo Checking status...
pm2 status

echo.
echo ✅ Services restarted!
echo.
echo Wait 10-15 seconds, then visit: https://mychatbot.website
echo.
echo If still getting 502, run: check-and-fix-502.bat
echo.
pause

