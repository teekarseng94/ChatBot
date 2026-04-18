# Firebase Deployment Setup for Landing Page

## Problem
The `firebase deploy` command fails with "No currently active project" error.

## Solution

### Step 1: Verify Firebase CLI is Installed
```powershell
firebase --version
```

If not installed, install it:
```powershell
npm install -g firebase-tools
```

### Step 2: Login to Firebase (if not already logged in)
```powershell
firebase login
```

### Step 3: Set the Firebase Project
The `.firebaserc` file has been created with project ID `chatbot20-21e3a`.

To verify or set the project manually:
```powershell
cd D:\Mychatbot\Mychatbot
firebase use chatbot20-21e3a
```

Or to add/select a project interactively:
```powershell
firebase use --add
```
Then select `chatbot20-21e3a` from the list.

### Step 4: Build the Project
```powershell
npm run build
```

This will create the `dist` folder with the production build.

### Step 5: Deploy to Firebase Hosting
```powershell
firebase deploy --only hosting
```

## Alternative: Manual Deployment

If you're using the same Firebase project for both landing page and backend, you may need to configure multiple hosting sites:

1. Update `firebase.json` to use a specific site:
```json
{
  "hosting": {
    "site": "mychatbot-landing",
    "public": "dist",
    ...
  }
}
```

2. Create the hosting site in Firebase Console:
   - Go to Firebase Console → Hosting
   - Click "Add another site"
   - Name it `mychatbot-landing` (or your preferred name)

3. Then deploy:
```powershell
firebase deploy --only hosting:mychatbot-landing
```

## Quick Deploy Script

Use the provided `deploy-firebase.bat` script:
```powershell
.\deploy-firebase.bat
```

This will:
1. Build the project
2. Verify the build
3. Check Firebase project
4. Deploy to hosting

## Troubleshooting

### Error: "No currently active project"
- Run: `firebase use chatbot20-21e3a`
- Or: `firebase use --add` and select the project

### Error: "Hosting site not found"
- Create the hosting site in Firebase Console first
- Or use the default site by removing the `site` property from `firebase.json`

### Error: "Permission denied"
- Make sure you're logged in: `firebase login`
- Verify you have access to the project in Firebase Console


