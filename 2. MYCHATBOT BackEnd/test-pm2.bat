@echo off
echo Testing PM2...
echo.

where pm2
echo.

pm2 --version
echo.

pm2 status
echo.

echo If you see errors above, PM2 may not be installed or not in PATH.
pause

