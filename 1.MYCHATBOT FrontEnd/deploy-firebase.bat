@echo off
echo ========================================
echo Firebase Deployment Script
echo ========================================
echo.

echo Step 1: Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Verifying build output...
if not exist "dist\index.html" (
    echo ERROR: dist\index.html not found!
    pause
    exit /b 1
)

echo.
echo Step 3: Checking Firebase project...
firebase use
if %errorlevel% neq 0 (
    echo ERROR: Firebase project not set!
    echo Please run: firebase use --add
    pause
    exit /b 1
)

echo.
echo Step 4: Deploying to Firebase Hosting...
firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo ERROR: Deployment failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Deployment completed successfully!
echo ========================================
pause


