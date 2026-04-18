# Integration Settings - Quick Start Guide

## ✅ What Was Done

1. **Updated Firestore Schema** - Added `integrationSettings` to user documents
2. **Created Security Rules** - Only authenticated owners can read/write their settings
3. **Updated Signup Code** - New users automatically get `integrationSettings`
4. **Created Migration Script** - Updates existing users
5. **Added Encryption Utility** - For secure API key storage

## 📋 Files Created/Modified

### New Files
- ✅ `firestore.rules` - Security rules
- ✅ `firestore.indexes.json` - Firestore indexes config
- ✅ `migrate-users.js` - Migration script for existing users
- ✅ `utils/apiKeyEncryption.js` - API key encryption utility
- ✅ `FIRESTORE_SCHEMA_UPDATE.md` - Detailed migration guide
- ✅ `FIRESTORE_SECURITY_RULES.md` - Security rules documentation

### Modified Files
- ✅ `firebase.json` - Added Firestore configuration
- ✅ `public/index.html` - Updated signup to include `integrationSettings`

## 🚀 Quick Setup (3 Steps)

### Step 1: Deploy Security Rules

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login
firebase login

# Deploy rules
firebase deploy --only firestore:rules
```

### Step 2: Migrate Existing Users

```bash
# Run migration script
node migrate-users.js
```

This will add `integrationSettings` to all existing user documents.

### Step 3: Verify

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `chatbot20-21e3a`
3. Go to **Firestore Database**
4. Open a user document
5. Verify `integrationSettings` field exists

## 📊 Schema Structure

```javascript
{
  apiKey: string,                    // Gemini API key (existing)
  systemInstruction: string,         // AI instruction (existing)
  integrationSettings: {             // NEW
    webhookUrl: string,               // Webhook URL
    apiKey: string,                   // API key (encrypt before storing)
    isEnabled: boolean                // Enable/disable flag
  },
  createdAt: Timestamp
}
```

## 🔒 Security Rules

```javascript
// Users can only access their own document
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

**What this means:**
- ✅ User can only read/write their own user document
- ✅ `integrationSettings` is automatically protected
- ✅ Other users cannot access your settings
- ✅ Unauthenticated users cannot access any data

## 🔐 API Key Encryption (Optional but Recommended)

### Setup Encryption Key

```bash
# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Save as environment variable
# Windows PowerShell:
$env:API_KEY_ENCRYPTION_KEY="your-generated-key-here"

# Windows CMD:
set API_KEY_ENCRYPTION_KEY=your-generated-key-here

# Linux/Mac:
export API_KEY_ENCRYPTION_KEY="your-generated-key-here"
```

### Usage Example

```javascript
const { encryptApiKey, decryptApiKey } = require('./utils/apiKeyEncryption');

// Encrypt before storing
const encrypted = encryptApiKey('my-api-key-123');
await firestore.collection('users').doc(userId).update({
  'integrationSettings.apiKey': JSON.stringify(encrypted)
});

// Decrypt when reading
const userDoc = await firestore.collection('users').doc(userId).get();
const encryptedData = JSON.parse(userDoc.data().integrationSettings.apiKey);
const apiKey = decryptApiKey(encryptedData);
```

## 💻 Frontend Usage

### Read Integration Settings

```javascript
const userId = firebaseAuth.currentUser.uid;
const userDoc = await firestore.collection('users').doc(userId).get();
const settings = userDoc.data().integrationSettings;

console.log('Webhook:', settings.webhookUrl);
console.log('Enabled:', settings.isEnabled);
```

### Update Integration Settings

```javascript
const userId = firebaseAuth.currentUser.uid;
await firestore.collection('users').doc(userId).update({
  'integrationSettings.webhookUrl': 'https://example.com/webhook',
  'integrationSettings.apiKey': 'encrypted-api-key',
  'integrationSettings.isEnabled': true
});
```

## 🧪 Testing

### Test 1: User can read own settings ✅

```javascript
// Should work
const userDoc = await firestore
  .collection('users')
  .doc(currentUser.uid)
  .get();
```

### Test 2: User cannot read other user's settings ❌

```javascript
// Should fail with permission error
const userDoc = await firestore
  .collection('users')
  .doc('other-user-id')
  .get();
```

### Test 3: Unauthenticated cannot read ❌

```javascript
// Sign out first
await firebaseAuth.signOut();

// Should fail with permission error
const userDoc = await firestore
  .collection('users')
  .doc('any-id')
  .get();
```

## 📝 Next Steps

1. ✅ Deploy Firestore rules
2. ✅ Run migration script
3. ✅ Test security rules
4. ⬜ Add UI for integration settings (optional)
5. ⬜ Implement webhook functionality (optional)
6. ⬜ Add API key encryption (optional but recommended)

## 🐛 Troubleshooting

### "Missing or insufficient permissions"

- **Check**: User is authenticated (`firebaseAuth.currentUser`)
- **Check**: User's UID matches document ID
- **Check**: Rules are deployed (`firebase deploy --only firestore:rules`)

### Migration script fails

- **Check**: `serviceAccountKey.json` exists
- **Check**: Firebase Admin SDK installed (`npm install firebase-admin`)
- **Check**: Service account has Firestore permissions

### Integration settings not saving

- **Check**: User is authenticated
- **Check**: Browser console for errors
- **Check**: Firestore rules allow write access

## 📚 Documentation

- **Full Migration Guide**: `FIRESTORE_SCHEMA_UPDATE.md`
- **Security Rules**: `FIRESTORE_SECURITY_RULES.md`
- **Encryption Utility**: `utils/apiKeyEncryption.js`

## ✅ Checklist

- [ ] Deploy Firestore rules
- [ ] Run migration script
- [ ] Verify existing users have `integrationSettings`
- [ ] Test security rules (read/write own data)
- [ ] Test security rules (cannot read other users' data)
- [ ] Set up encryption key (optional)
- [ ] Test encryption/decryption (optional)
