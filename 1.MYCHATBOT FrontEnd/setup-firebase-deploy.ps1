# Firebase Deployment Setup Script for Landing Page
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Firebase Deployment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
Write-Host "Step 1: Checking Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version 2>&1
    Write-Host "✓ Firebase CLI found: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Firebase CLI not found. Installing..." -ForegroundColor Red
    npm install -g firebase-tools
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to install Firebase CLI" -ForegroundColor Red
        exit 1
    }
}

# Check if logged in
Write-Host ""
Write-Host "Step 2: Checking Firebase login status..." -ForegroundColor Yellow
$loginCheck = firebase projects:list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Not logged in. Please login..." -ForegroundColor Yellow
    firebase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Login failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ Already logged in" -ForegroundColor Green
}

# Set Firebase project
Write-Host ""
Write-Host "Step 3: Setting Firebase project..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
firebase use chatbot20-21e3a
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Warning: Could not set project automatically" -ForegroundColor Yellow
    Write-Host "Please run manually: firebase use chatbot20-21e3a" -ForegroundColor Yellow
    Write-Host "Or: firebase use --add" -ForegroundColor Yellow
} else {
    Write-Host "✓ Project set to: chatbot20-21e3a" -ForegroundColor Green
}

# Build the project
Write-Host ""
Write-Host "Step 4: Building the project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build completed" -ForegroundColor Green

# Verify build output
Write-Host ""
Write-Host "Step 5: Verifying build output..." -ForegroundColor Yellow
if (Test-Path "dist\index.html") {
    Write-Host "✓ dist\index.html exists" -ForegroundColor Green
} else {
    Write-Host "✗ dist\index.html not found!" -ForegroundColor Red
    exit 1
}

# Deploy
Write-Host ""
Write-Host "Step 6: Deploying to Firebase Hosting..." -ForegroundColor Yellow
Write-Host "Note: If you get a 'site not found' error, you may need to:" -ForegroundColor Yellow
Write-Host "  1. Create a hosting site in Firebase Console" -ForegroundColor Yellow
Write-Host "  2. Or use the default site by removing 'site' property from firebase.json" -ForegroundColor Yellow
Write-Host ""
firebase deploy --only hosting
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Deployment failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check if you have hosting enabled in Firebase Console" -ForegroundColor Yellow
    Write-Host "2. Run: firebase use chatbot20-21e3a" -ForegroundColor Yellow
    Write-Host "3. Check firebase.json configuration" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Deployment completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan


