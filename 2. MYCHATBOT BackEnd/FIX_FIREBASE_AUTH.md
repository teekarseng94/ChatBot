# Fix Firebase Authentication Error (UNAUTHENTICATED)

## Error Message
```
❌ Failed to save API key: 16 UNAUTHENTICATED: Request had invalid authentication credentials
```

## Solution Steps

### Step 1: Verify Service Account Permissions in Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **chatbot20-21e3a**
3. Navigate to **IAM & Admin** → **IAM**
4. Find the service account: `firebase-adminsdk-fbsvc@chatbot20-21e3a.iam.gserviceaccount.com`
5. **Ensure it has these roles:**
   - **Firebase Admin SDK Administrator Service Agent** (or **Firebase Admin**)
   - **Cloud Datastore User** (for Firestore access)
   - **Service Account User**

### Step 2: Verify Service Account is Enabled

1. Go to **IAM & Admin** → **Service Accounts**
2. Find: `firebase-adminsdk-fbsvc@chatbot20-21e3a.iam.gserviceaccount.com`
3. Make sure it's **Enabled** (not disabled)

### Step 3: Regenerate Service Account Key (if needed)

If the key is expired or invalid:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **chatbot20-21e3a**
3. Go to **Project Settings** (gear icon) → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Replace `chatbot20-21e3a-firebase-adminsdk-fbsvc-379022f43e.json` with the new file
7. **Restart your server**

### Step 4: Verify Firestore Rules Allow Admin SDK

The Admin SDK bypasses security rules, but verify your Firestore is accessible:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **chatbot20-21e3a**
3. Go to **Firestore Database** → **Rules**
4. Make sure rules are deployed (Admin SDK bypasses these anyway)

### Step 5: Test Authentication

After fixing permissions, restart your server and check the logs:

```
✅ Firebase Admin initialized with service account key: chatbot20-21e3a-firebase-adminsdk-fbsvc-379022f43e.json
   Service account email: firebase-adminsdk-fbsvc@chatbot20-21e3a.iam.gserviceaccount.com
   Project ID: chatbot20-21e3a
✅ Firestore instance created successfully
   Firestore project: chatbot20-21e3a
```

### Step 6: Grant Required IAM Roles (Quick Fix)

Run this in Google Cloud Shell or use the Console:

**Required IAM Roles:**
- `roles/firebase.admin` - Firebase Admin SDK Administrator
- `roles/datastore.user` - Cloud Datastore User

**To grant via Console:**
1. Go to **IAM & Admin** → **IAM**
2. Click **+ GRANT ACCESS**
3. Enter: `firebase-adminsdk-fbsvc@chatbot20-21e3a.iam.gserviceaccount.com`
4. Add roles:
   - **Firebase Admin SDK Administrator Service Agent**
   - **Cloud Datastore User**
5. Click **SAVE**

## Quick Test

After fixing, try saving an API key again. The error should be resolved.

## Still Not Working?

1. **Check server logs** for detailed error messages
2. **Verify the service account key file** is valid JSON
3. **Ensure the private key** has proper newlines (not escaped `\n`)
4. **Check network connectivity** to Google APIs
5. **Verify project ID** matches: `chatbot20-21e3a`

## Important Notes

- The Admin SDK **bypasses Firestore security rules**
- Service account keys should **never be committed to Git**
- Keys can be **regenerated** if compromised
- Service accounts need **explicit IAM permissions** to access Firestore



