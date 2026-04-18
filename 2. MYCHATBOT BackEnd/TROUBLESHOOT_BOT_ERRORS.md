# Troubleshooting Bot Errors

## Error: "Sorry, I encountered an error processing your message. Please try again."

This error occurs when the bot fails to process a message. Follow these steps to diagnose and fix:

### Step 1: Check Server Logs

When a message fails, check your server console logs. You should see detailed error messages like:

```
[userId] ❌ Error processing message:
   Error type: Error
   Error message: API key not found for user: user@example.com
   Error code: N/A
```

### Step 2: Common Issues and Solutions

#### Issue 1: API Key Not Found in Firestore

**Symptoms:**
- Error message: "API key not found for user: ..."
- Log shows: "Document does not exist for: ..."

**Solution:**
1. Go to Firebase Console → Firestore Database
2. Check if document exists in `users` collection with Document ID = user's email
3. If document doesn't exist, add it:
   - Document ID: `user@example.com` (user's email, lowercase)
   - Field: `geminiApiKey` = user's Google AI Studio API key
   - Field: `email` = user's email

**Example:**
```
Collection: users
Document ID: teekarseng94@gmail.com
Fields:
  - geminiApiKey: "AIzaSy..."
  - email: "teekarseng94@gmail.com"
```

#### Issue 2: Firestore Not Initialized

**Symptoms:**
- Error message: "Firestore not initialized"
- Log shows: "Firestore not available"

**Solution:**
1. Check if `firebase-admin` is installed: `npm install firebase-admin`
2. Verify service account key file exists in project root
3. Check server startup logs for Firebase initialization messages
4. See `FIX_FIREBASE_AUTH.md` for authentication setup

#### Issue 3: API Key Field Missing

**Symptoms:**
- Document exists but API key is null
- Log shows: "Document exists but geminiApiKey field is missing"

**Solution:**
1. Open the user's document in Firestore
2. Add the `geminiApiKey` field with the user's API key
3. Save the document

#### Issue 4: Email Mismatch

**Symptoms:**
- Document exists but API key not found
- User's login email doesn't match Document ID

**Solution:**
1. Verify the user's login email (check what they use to login)
2. Ensure Document ID in Firestore matches exactly (case-sensitive, lowercase)
3. Example: If user logs in as `teekarseng94@gmail.com`, Document ID must be `teekarseng94@gmail.com` (not `Teekarseng94@gmail.com`)

#### Issue 5: Invalid API Key

**Symptoms:**
- Error message: "INVALID_API_KEY" or "API_KEY_INVALID"
- API key exists but doesn't work

**Solution:**
1. Verify the API key is valid in Google AI Studio
2. Check if API key has proper permissions/quota
3. Regenerate API key if needed
4. Update the key in Firestore

### Step 3: Use Diagnostic Endpoint

You can check the API key status using the diagnostic endpoint:

```
GET /api/diagnostic/{userId}
```

This will return:
- Whether Firestore is initialized
- Resolved email address
- Whether API key exists
- API key length (if exists)

### Step 4: Check Detailed Logs

The enhanced logging will show:

1. **When getting model:**
   ```
   [getModelForUser] Getting model for userId: ...
   [getModelForUser] Resolving email for userId: ...
   [getModelForUser] Resolved email: ...
   [getModelForUser] Fetching API key from Firestore for: ...
   ```

2. **When fetching from Firestore:**
   ```
   [getUserApiKeyFromFirestore] Called with email: ...
   [getUserApiKeyFromFirestore] Querying Firestore: users/...
   [getUserApiKeyFromFirestore] Document exists. Fields: ...
   ```

3. **When processing message:**
   ```
   [userId] 🔄 Getting AI model for user...
   [userId] ✅ Model obtained, generating response...
   [userId] ✅ AI response generated: ...
   ```

### Step 5: Verify Firestore Document Structure

The document in Firestore should have this structure:

**Collection:** `users`  
**Document ID:** `{user-email}` (e.g., `teekarseng94@gmail.com`)

**Required Fields:**
- `geminiApiKey` (string): The Google AI Studio API key
- `email` (string): User's email address (optional but recommended)

**Example Document:**
```json
{
  "geminiApiKey": "AIzaSyDzi4JLSQ5i5JPhYkPZSABd5W3cZJgDfJ0",
  "email": "teekarseng94@gmail.com",
  "updatedAt": "2025-01-25T12:00:00Z"
}
```

### Quick Fix Checklist

- [ ] Firestore is initialized (check server startup logs)
- [ ] Document exists in `users` collection with Document ID = user's email
- [ ] Document has `geminiApiKey` field with a valid API key
- [ ] Email in Document ID matches user's login email exactly (lowercase)
- [ ] API key is valid and has quota available
- [ ] Check server logs for specific error messages

### Still Not Working?

1. **Check server console** for detailed error logs
2. **Use diagnostic endpoint** to verify API key status
3. **Verify Firestore document** structure matches requirements
4. **Test API key** directly in Google AI Studio
5. **Check Firestore permissions** - service account needs read access



