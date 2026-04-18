# Firestore API Key Storage Setup

## Overview

This guide explains how to store user-specific Google AI Studio (Gemini) API keys in Firestore with proper security rules.

## Structure

- **Collection**: `users`
- **Document ID**: User's email address (e.g., `kakisoho@gmail.com`)
- **Field**: `geminiApiKey` (string)

## Security Rules

The Firestore security rules ensure that:
- ✅ Users can only read/write their own API key
- ✅ Authentication is required
- ✅ Email must match the document ID

Rules are defined in `firestore.rules`.

## API Endpoints

### Save API Key

**POST** `/api/users/:email/api-key`

**Request Body:**
```json
{
  "geminiApiKey": "your-api-key-here"
}
```

**Example:**
```javascript
fetch('/api/users/kakisoho@gmail.com/api-key', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    geminiApiKey: 'AIzaSy...'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

**Response:**
```json
{
  "success": true,
  "message": "API key saved successfully"
}
```

### Get API Key

**GET** `/api/users/:email/api-key`

**Example:**
```javascript
fetch('/api/users/kakisoho@gmail.com/api-key')
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('API Key:', data.geminiApiKey);
  }
});
```

**Response:**
```json
{
  "success": true,
  "geminiApiKey": "AIzaSy..."
}
```

## Backend Functions

### `saveUserApiKeyToFirestore(userEmail, apiKey)`

Saves a user's API key to Firestore.

```javascript
const success = await saveUserApiKeyToFirestore('kakisoho@gmail.com', 'AIzaSy...');
```

### `getUserApiKeyFromFirestore(userEmail)`

Retrieves a user's API key from Firestore.

```javascript
const apiKey = await getUserApiKeyFromFirestore('kakisoho@gmail.com');
```

## Deploying Firestore Rules

### Option 1: Using Firebase CLI

```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules
```

### Option 2: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `chatbot20-21e3a`
3. Go to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules`
5. Paste into the rules editor
6. Click **Publish**

## Testing Security Rules

### Test in Firebase Console

1. Go to Firestore Database → Rules
2. Click **Rules Playground**
3. Test scenarios:
   - Authenticated user accessing their own document ✅
   - Authenticated user accessing another user's document ❌
   - Unauthenticated user accessing any document ❌

### Test with Code

```javascript
// Frontend (with Firebase Auth)
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const auth = getAuth();
const db = getFirestore();

// User must be authenticated
const user = auth.currentUser;
if (user && user.email) {
  // Save API key
  await setDoc(doc(db, 'users', user.email), {
    geminiApiKey: 'your-api-key',
    updatedAt: new Date()
  }, { merge: true });
  
  // Get API key
  const userDoc = await getDoc(doc(db, 'users', user.email));
  if (userDoc.exists()) {
    const apiKey = userDoc.data().geminiApiKey;
    console.log('API Key:', apiKey);
  }
}
```

## Frontend Integration Example

```javascript
// Save API key from frontend
async function saveApiKey(email, apiKey) {
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(email)}/api-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ geminiApiKey: apiKey })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('API key saved!');
    }
  } catch (error) {
    console.error('Error saving API key:', error);
  }
}

// Get API key from frontend
async function getApiKey(email) {
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(email)}/api-key`);
    const data = await response.json();
    if (data.success) {
      return data.geminiApiKey;
    }
  } catch (error) {
    console.error('Error getting API key:', error);
  }
  return null;
}
```

## Important Notes

1. **Email Normalization**: Emails are automatically lowercased and trimmed to ensure consistency
2. **Security**: Rules require authentication and email matching
3. **Merge**: Using `merge: true` allows updating the API key without overwriting other fields
4. **Backend Access**: The backend (Firebase Admin SDK) can access all documents (bypasses security rules)
5. **Frontend Access**: The frontend (Firebase Web SDK) must follow security rules

## Troubleshooting

### "Permission denied" error

- Check if user is authenticated
- Verify email matches document ID exactly
- Ensure Firestore rules are deployed
- Check browser console for detailed error messages

### API key not saving

- Check Firestore console for errors
- Verify Firebase Admin SDK is initialized
- Check server logs for error messages
- Ensure `firestore` variable is not null

### Rules not working

- Make sure rules are deployed: `firebase deploy --only firestore:rules`
- Check rules syntax in Firebase Console
- Test in Rules Playground
- Clear browser cache and try again

