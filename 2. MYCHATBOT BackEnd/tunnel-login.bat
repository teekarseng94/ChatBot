@echo off
REM Cloudflare Tunnel Login
REM This script runs the tunnel login command

cd /d "%~dp0"
.\cloudflared.bat tunnel login

pause
