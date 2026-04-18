@echo off
REM PM2 Wrapper Script - Use this if PM2 is not in your PATH
REM Usage: pm2.bat [command] [args...]
REM Example: pm2.bat start index.js --name whatsapp-system

"C:\Users\Acer\AppData\Roaming\npm\pm2.cmd" %*

REM Check for permission errors
if errorlevel 1 (
    echo.
    echo ERROR: PM2 command failed!
    echo.
    echo If you see "EPERM" or "rpc.sock" errors, run:
    echo   .\fix-pm2.bat
    echo.
    echo Then try your PM2 command again.
    echo.
    exit /b 1
)



