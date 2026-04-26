@echo off
setlocal EnableDelayedExpansion
title Reset Cloudflare Tunnel (Desktop)

echo.
echo ========================================
echo   RESET CLOUDFLARE TUNNEL (DESKTOP)
echo ========================================
echo.
echo This will create or reuse a tunnel on THIS computer
echo and update config.yml to the selected tunnel ID.
echo.

cd /d "%~dp0"

set "CF_CMD=.\cloudflared.bat"
if exist "cloudflared.exe" (
    set "CF_CMD=.\cloudflared.bat"
) else if exist "cloudflared\cloudflared.exe" (
    set "CF_CMD=.\cloudflared.bat"
) else (
    where cloudflared >nul 2>&1
    if %errorlevel% equ 0 (
        set "CF_CMD=cloudflared"
    ) else (
        echo ERROR: cloudflared not found.
        echo.
        echo Option 1: Put cloudflared.exe in this folder:
        echo   %CD%
        echo Option 2: Install cloudflared globally and ensure it is in PATH.
        echo.
        pause
        exit /b 1
    )
)

echo Step 1: Login to Cloudflare
echo (Browser will open)
if exist "%USERPROFILE%\.cloudflared\cert.pem" (
    echo Existing Cloudflare cert found. Skipping login.
) else (
    call %CF_CMD% tunnel login
    if %errorlevel% neq 0 (
        echo ERROR: Cloudflare login failed.
        pause
        exit /b 1
    )
)
echo.

set /p TUNNEL_NAME=Step 2: Enter tunnel name [whatsapp-tunnel-desktop]:
if "%TUNNEL_NAME%"=="" set "TUNNEL_NAME=whatsapp-tunnel-desktop"

echo.
echo Creating tunnel "%TUNNEL_NAME%"...
call %CF_CMD% tunnel create "%TUNNEL_NAME%"
echo.

echo Step 3: List tunnels and choose the tunnel ID to use
call %CF_CMD% tunnel list
echo.
set /p TUNNEL_ID=Paste Tunnel ID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx):
if "%TUNNEL_ID%"=="" (
    echo ERROR: Tunnel ID is required.
    pause
    exit /b 1
)

set "CRED_SRC=%USERPROFILE%\.cloudflared\%TUNNEL_ID%.json"
set "CRED_DIR=%CD%\.cloudflared"
set "CRED_DEST=%CRED_DIR%\%TUNNEL_ID%.json"

echo.
echo Step 4: Copy credential to project folder
if not exist "%CRED_SRC%" (
    echo ERROR: Credential file not found:
    echo %CRED_SRC%
    echo Re-run and verify the Tunnel ID.
    pause
    exit /b 1
)
if not exist "%CRED_DIR%" mkdir "%CRED_DIR%"
copy /Y "%CRED_SRC%" "%CRED_DEST%" >nul
echo Credential copied to:
echo %CRED_DEST%
echo.

echo Step 5: Update config.yml with new tunnel ID
if not exist "config.yml" (
    echo ERROR: config.yml not found in %CD%
    pause
    exit /b 1
)

copy /Y "config.yml" "config.yml.bak" >nul
powershell -NoProfile -Command ^
  "$p='config.yml';" ^
  "$id='%TUNNEL_ID%';" ^
  "$c=Get-Content $p -Raw;" ^
  "$c=[regex]::Replace($c,'(?m)^tunnel:\s*.*$','tunnel: '+$id);" ^
  "$c=[regex]::Replace($c,'(?m)^credentials-file:\s*.*$','credentials-file: .cloudflared/'+$id+'.json');" ^
  "Set-Content -Path $p -Value $c -NoNewline"

if %errorlevel% neq 0 (
    echo ERROR: Failed to update config.yml
    echo Restore from config.yml.bak if needed.
    pause
    exit /b 1
)
echo config.yml updated.
echo.

echo Step 6: Route DNS to this tunnel
call %CF_CMD% tunnel route dns "%TUNNEL_ID%" mychatbot.website
call %CF_CMD% tunnel route dns "%TUNNEL_ID%" www.mychatbot.website
echo DNS routing done.
echo.

echo ========================================
echo   DONE
echo ========================================
echo.
echo Next:
echo 1. Start backend (npm start or pm2)
echo 2. Run tunnel via tunnel-run.bat
echo 3. Test https://mychatbot.website
echo.
pause
