# Quick Firebase Deployment Guide

## Problem
Getting "No currently active project" error when trying to deploy.

## Quick Fix

### Option 1: Use the Setup Script (Recommended)
```powershell
cd D:\Mychatbot\Mychatbot
.\setup-firebase-deploy.ps1
```

### Option 2: Manual Steps

1. **Fix Firebase CLI (if needed):**
   ```powershell
   .\fix-firebase-cli.ps1
   ```

2. **Login to Firebase:**
   ```powershell
   firebase login
   ```

3. **Set the project:**
   ```powershell
   firebase use chatbot20-21e3a
   ```
   
   If that doesn't work, try:
   ```powershell
   firebase use --add
   ```
   Then select `chatbot20-21e3a` from the list.

4. **Build the project:**
   ```powershell
   npm run build
   ```

5. **Deploy:**
   ```powershell
   firebase deploy --only hosting
   ```

## If You Get "Hosting site not found" Error

You have two options:

### Option A: Use Default Site
Remove any `site` property from `firebase.json` (it should just have `public: "dist"`)

### Option B: Create a New Hosting Site
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `chatbot20-21e3a`
3. Go to Hosting
4. Click "Add another site"
5. Name it (e.g., `mychatbot-landing`)
6. Update `firebase.json`:
   ```json
   {
     "hosting": {
       "site": "mychatbot-landing",
       "public": "dist",
       ...
     }
   }
   ```
7. Deploy: `firebase deploy --only hosting:mychatbot-landing`

## Files Created
- ✅ `.firebaserc` - Firebase project configuration
- ✅ `firebase.json` - Hosting configuration
- ✅ `deploy-firebase.bat` - Batch deployment script
- ✅ `setup-firebase-deploy.ps1` - PowerShell setup script
- ✅ `fix-firebase-cli.ps1` - CLI fix script

## Current Configuration
- **Project ID:** `chatbot20-21e3a`
- **Build Output:** `dist` folder
- **Public Directory:** `dist` (as configured in firebase.json)


