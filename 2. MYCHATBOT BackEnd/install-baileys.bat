@echo off
echo ========================================
echo Installing Baileys Dependencies
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Uninstalling whatsapp-web.js...
call npm uninstall whatsapp-web.js

echo.
echo Step 2: Installing Baileys and dependencies...
call npm install @whiskeysockets/baileys pino qrcode-terminal

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Dependencies installed:
echo   - @whiskeysockets/baileys
echo   - pino
echo   - qrcode-terminal
echo.
echo You can now start the bot with:
echo   node index.js
echo   or
echo   pm2 start index.js --name whatsapp-bot
echo.
pause
