# Firestore Schema Update - Integration Settings

## Overview

Updated the Firestore schema to support multi-user API integrations. Each user document now includes an `integrationSettings` object with webhook URL, API key, and enable/disable flag.

## Schema Changes

### Users Collection Structure

**Before:**
```javascript
{
  apiKey: string,
  systemInstruction: string,
  createdAt: Timestamp
}
```

**After:**
```javascript
{
  apiKey: string,                    // Gemini API key (existing)
  systemInstruction: string,         // AI system instruction (existing)
  integrationSettings: {             // NEW
    webhookUrl: string,               // Webhook URL for API integration
    apiKey: string,                   // API key (should be encrypted/hashed)
    isEnabled: boolean                // Enable/disable integration
  },
  createdAt: Timestamp
}
```

## Security Rules

Firestore security rules have been updated to ensure:
- ✅ Only authenticated users can read/write their own user document
- ✅ Users cannot access other users' data
- ✅ Integration settings are protected by the same rules

### Rules Location
- File: `firestore.rules`
- Deploy: `firebase deploy --only firestore:rules`

## Migration Steps

### Step 1: Deploy Security Rules

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules
```

### Step 2: Update Existing User Documents

You have two options:

#### Option A: Backend Migration Script (Recommended)

Create a migration script to update existing users:

```javascript
// migrate-users.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateUsers() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  
  const batch = db.batch();
  let count = 0;
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    
    // Only add integrationSettings if it doesn't exist
    if (!data.integrationSettings) {
      batch.update(doc.ref, {
        integrationSettings: {
          webhookUrl: '',
          apiKey: '',
          isEnabled: false
        }
      });
      count++;
    }
  });
  
  if (count > 0) {
    await batch.commit();
    console.log(`✅ Updated ${count} user document(s) with integrationSettings`);
  } else {
    console.log('ℹ️ All users already have integrationSettings');
  }
}

migrateUsers()
  .then(() => {
    console.log('Migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
```

Run the migration:
```bash
node migrate-users.js
```

#### Option B: Manual Update via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `chatbot20-21e3a`
3. Go to **Firestore Database**
4. Open the `users` collection
5. For each user document:
   - Click on the document
   - Click "Add field"
   - Field name: `integrationSettings`
   - Field type: `map`
   - Add nested fields:
     - `webhookUrl` (string, value: `""`)
     - `apiKey` (string, value: `""`)
     - `isEnabled` (boolean, value: `false`)

### Step 3: Update Frontend Code

The frontend signup code has already been updated to include `integrationSettings` for new users.

## API Key Encryption/Hashing

### Recommendation: Encrypt API Keys

For production, API keys should be encrypted before storing in Firestore. Here's a recommended approach:

#### Backend Encryption (Node.js)

```javascript
const crypto = require('crypto');

// Encryption key (store in environment variable!)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

function encryptApiKey(apiKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

function decryptApiKey(encryptedData) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

#### Alternative: Hashing (One-way)

If you only need to verify API keys (not decrypt them), use hashing:

```javascript
const crypto = require('crypto');

function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// Store hash, compare on verification
function verifyApiKey(apiKey, storedHash) {
  return hashApiKey(apiKey) === storedHash;
}
```

## Usage Examples

### Reading Integration Settings (Frontend)

```javascript
// Get current user's integration settings
const userId = firebaseAuth.currentUser.uid;
const userDoc = await firestore.collection('users').doc(userId).get();
const integrationSettings = userDoc.data().integrationSettings;

console.log('Webhook URL:', integrationSettings.webhookUrl);
console.log('Integration enabled:', integrationSettings.isEnabled);
```

### Updating Integration Settings (Frontend)

```javascript
// Update integration settings
const userId = firebaseAuth.currentUser.uid;
await firestore.collection('users').doc(userId).update({
  'integrationSettings.webhookUrl': 'https://example.com/webhook',
  'integrationSettings.isEnabled': true
});
```

### Backend Usage (Node.js)

```javascript
// Get user's integration settings
const userDoc = await firestore.collection('users').doc(userId).get();
const userData = userDoc.data();

if (userData.integrationSettings?.isEnabled) {
  const webhookUrl = userData.integrationSettings.webhookUrl;
  const apiKey = userData.integrationSettings.apiKey; // Decrypt if encrypted
  
  // Use webhook and API key for integration
  await sendWebhook(webhookUrl, apiKey, data);
}
```

## Security Best Practices

1. **Encrypt API Keys**: Never store API keys in plain text
2. **Use Environment Variables**: Store encryption keys in environment variables
3. **Firestore Rules**: Always enforce security rules (already done)
4. **HTTPS Only**: Ensure webhook URLs use HTTPS
5. **Validate Webhook URLs**: Validate webhook URLs before saving
6. **Rate Limiting**: Implement rate limiting for webhook calls

## Testing Security Rules

### Test 1: User can read own document
```javascript
// Should succeed
const userDoc = await firestore
  .collection('users')
  .doc(currentUser.uid)
  .get();
```

### Test 2: User cannot read other user's document
```javascript
// Should fail with permission error
const otherUserDoc = await firestore
  .collection('users')
  .doc('other-user-id')
  .get();
```

### Test 3: Unauthenticated user cannot read
```javascript
// Sign out first
await firebaseAuth.signOut();

// Should fail with permission error
const userDoc = await firestore
  .collection('users')
  .doc('any-user-id')
  .get();
```

## Firestore Rules Explanation

```javascript
match /users/{userId} {
  // Only allow read/write if authenticated user's UID matches document ID
  allow read, write: if isAuthenticated() && request.auth.uid == userId;
  
  // Allow creation during signup
  allow create: if isAuthenticated() && request.auth.uid == userId;
}
```

This ensures:
- ✅ Users can only access their own user document
- ✅ `integrationSettings` is automatically protected
- ✅ No user can read/write other users' data
- ✅ Unauthenticated users cannot access any user data

## Next Steps

1. ✅ Deploy Firestore rules
2. ✅ Run migration script for existing users
3. ✅ Update frontend to handle integration settings
4. ✅ Implement API key encryption (optional but recommended)
5. ✅ Add webhook functionality to backend
6. ✅ Test security rules

## Troubleshooting

### "Missing or insufficient permissions" error

- Check that user is authenticated: `firebaseAuth.currentUser`
- Verify user's UID matches document ID
- Check Firestore rules are deployed: `firebase deploy --only firestore:rules`

### Migration script fails

- Ensure `serviceAccountKey.json` exists and is valid
- Check Firebase Admin SDK is installed: `npm install firebase-admin`
- Verify service account has Firestore permissions

### Integration settings not saving

- Check browser console for errors
- Verify user is authenticated
- Check Firestore rules allow write access
