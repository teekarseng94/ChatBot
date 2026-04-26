@echo off
REM Cloudflare Tunnel Run
REM This script runs the tunnel using config.yml

cd /d "%~dp0"
.\cloudflared.bat tunnel --config config.yml run

pause
