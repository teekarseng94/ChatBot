# Firestore Security Rules - Complete Guide

## Overview

Firestore security rules ensure that only authenticated users can access their own data. The rules are configured to protect user documents and integration settings.

## Rules File

**Location**: `firestore.rules`

## Rule Breakdown

### Users Collection

```javascript
match /users/{userId} {
  // Allow read/write only if the authenticated user is the owner
  allow read, write: if isOwner(userId);
  
  // Allow creation of new user document during signup
  allow create: if isAuthenticated() && request.auth.uid == userId;
}
```

**What this does:**
- ✅ Users can only read/write their own user document
- ✅ Users cannot access other users' documents
- ✅ Unauthenticated users cannot access any user documents
- ✅ `integrationSettings` is automatically protected

### WhatsApp Messages Collection

```javascript
match /whatsapp_messages/{messageId} {
  // Allow read if user owns the message (userId matches)
  allow read: if isAuthenticated() && 
                 resource.data.userId == request.auth.uid;
  
  // Allow write from backend service account (server-side)
  // This is handled by Firebase Admin SDK with service account
  allow write: if false; // Only backend can write via Admin SDK
}
```

**What this does:**
- ✅ Users can only read their own messages
- ✅ Only backend (Admin SDK) can write messages
- ✅ Frontend cannot write messages directly

## Helper Functions

```javascript
// Check if user is authenticated
function isAuthenticated() {
  return request.auth != null;
}

// Check if user owns the document
function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}
```

## Testing Rules

### Test 1: User can read own document ✅

```javascript
// Frontend (authenticated as user123)
const userDoc = await firestore
  .collection('users')
  .doc('user123')  // Same as currentUser.uid
  .get();
// ✅ Should succeed
```

### Test 2: User cannot read other user's document ❌

```javascript
// Frontend (authenticated as user123)
const userDoc = await firestore
  .collection('users')
  .doc('other-user-id')  // Different from currentUser.uid
  .get();
// ❌ Should fail with permission error
```

### Test 3: Unauthenticated user cannot read ❌

```javascript
// Frontend (not authenticated)
await firebaseAuth.signOut();

const userDoc = await firestore
  .collection('users')
  .doc('any-user-id')
  .get();
// ❌ Should fail with permission error
```

### Test 4: User can update own integrationSettings ✅

```javascript
// Frontend (authenticated as user123)
await firestore
  .collection('users')
  .doc('user123')  // Same as currentUser.uid
  .update({
    'integrationSettings.webhookUrl': 'https://example.com/webhook',
    'integrationSettings.isEnabled': true
  });
// ✅ Should succeed
```

### Test 5: User cannot update other user's integrationSettings ❌

```javascript
// Frontend (authenticated as user123)
await firestore
  .collection('users')
  .doc('other-user-id')  // Different from currentUser.uid
  .update({
    'integrationSettings.webhookUrl': 'https://example.com/webhook'
  });
// ❌ Should fail with permission error
```

## Deploying Rules

### Method 1: Firebase CLI (Recommended)

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules
```

### Method 2: Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `chatbot20-21e3a`
3. Go to **Firestore Database** → **Rules** tab
4. Copy contents of `firestore.rules`
5. Paste into the rules editor
6. Click **Publish**

## Rule Validation

Firebase automatically validates rules before deployment. Common errors:

### Error: "Missing or insufficient permissions"

**Cause**: User is not authenticated or trying to access another user's data

**Solution**: 
- Ensure user is logged in: `firebaseAuth.currentUser`
- Verify user's UID matches document ID

### Error: "Permission denied"

**Cause**: Rule condition not met

**Solution**:
- Check rule logic matches your use case
- Verify `request.auth.uid` is set (user is authenticated)

## Security Best Practices

1. **Always Authenticate**: Never allow unauthenticated access to user data
2. **Verify Ownership**: Always check `request.auth.uid == userId`
3. **Validate Input**: Validate data before writing (can be done in rules)
4. **Least Privilege**: Only grant minimum necessary permissions
5. **Test Rules**: Test rules thoroughly before deploying

## Advanced Rules (Optional)

### Add Input Validation

```javascript
match /users/{userId} {
  allow write: if isOwner(userId) && 
                 // Validate webhook URL format
                 (!request.resource.data.diff(resource.data).keys().hasAny(['integrationSettings']) ||
                  request.resource.data.integrationSettings.webhookUrl.matches('https://.*'));
}
```

### Add Rate Limiting (requires Cloud Functions)

```javascript
// Rate limiting should be handled in Cloud Functions
// Rules can check custom claims added by Cloud Functions
match /users/{userId} {
  allow write: if isOwner(userId) && 
                 request.auth.token.rateLimit < 10; // Custom claim
}
```

## Monitoring

### View Rule Violations

1. Go to Firebase Console
2. **Firestore Database** → **Usage** tab
3. Check **Denied requests** section

### Set Up Alerts

1. Go to Firebase Console
2. **Project Settings** → **Alerts**
3. Create alert for "Firestore permission denied errors"

## Troubleshooting

### Rules not applying

- **Check deployment**: Verify rules are deployed: `firebase deploy --only firestore:rules`
- **Check cache**: Clear browser cache and try again
- **Check syntax**: Validate rules syntax in Firebase Console

### Users can't access their data

- **Check authentication**: Verify user is logged in
- **Check UID match**: Ensure `request.auth.uid == userId`
- **Check rules**: Verify rules are deployed correctly

### Backend can't write

- **Backend uses Admin SDK**: Admin SDK bypasses rules
- **Service account**: Ensure service account has proper permissions
- **Check logs**: Look for specific error messages

## Summary

✅ **Users can only access their own data**  
✅ **Integration settings are protected**  
✅ **Unauthenticated access is blocked**  
✅ **Backend can write via Admin SDK**  
✅ **Rules are easy to maintain and test**
