# Debugging Bot Error: "Sorry, I encountered an error processing your message"

## Quick Diagnostic Steps

### Step 1: Check Server Logs

When you send a message to the bot, check your server console. You should see detailed logs like:

```
[userId] 🔄 Getting AI model for user...
[userId] Using email for API key lookup: teekarseng94@gmail.com (session.userEmail: teekarseng94@gmail.com)
[getModelForUser] ✅ userId is already an email: teekarseng94@gmail.com
[getUserApiKeyFromFirestore] Querying Firestore: users/teekarseng94@gmail.com
```

### Step 2: Check Socket Connection Logs

When the user connects, you should see:

```
[Socket] ✅ NEW CONNECTION: User ID: ChbtldYR4zccp8n7q1NCPWfuQxe2, Email: teekarseng94@gmail.com, Socket ID: ...
```

**If email shows as "not provided"**, the email is not being sent from the frontend.

### Step 3: Use Diagnostic Endpoint

Open in browser or use curl:
```
GET https://mychatbot.website/api/diagnostic/ChbtldYR4zccp8n7q1NCPWfuQxe2
```

This will show:
- Whether Firestore is initialized
- Resolved email address
- Whether API key exists
- API key length

### Step 4: Check Firestore Document

1. Go to Firebase Console → Firestore Database
2. Open `users` collection
3. Look for document with ID: `teekarseng94@gmail.com` (user's email, lowercase)
4. Verify it has `geminiApiKey` field with a valid API key

## Common Issues

### Issue 1: Email Not Being Passed

**Symptoms:**
- Socket connection log shows: `Email: not provided`
- `session.userEmail` is `null` or `undefined`

**Solution:**
- Make sure user is logged in with Firebase auth (not just local auth)
- Check browser console for: `[Frontend] Connecting Socket.io with userId: ..., email: ...`
- If email is `not available`, the `currentUser` object doesn't have an email

### Issue 2: API Key Not Found

**Symptoms:**
- Log shows: `Document does not exist for: teekarseng94@gmail.com`
- Or: `Document exists but geminiApiKey field is missing`

**Solution:**
- Admin must add the API key to Firestore:
  - Collection: `users`
  - Document ID: `teekarseng94@gmail.com` (exact email, lowercase)
  - Field: `geminiApiKey` = user's Google AI Studio API key

### Issue 3: Email Mismatch

**Symptoms:**
- User logs in with one email, but Firestore document has different email
- Case sensitivity issues (e.g., `Teekarseng94@gmail.com` vs `teekarseng94@gmail.com`)

**Solution:**
- Ensure Document ID in Firestore matches user's login email exactly (lowercase)
- Check what email the user actually uses to login

### Issue 4: Firestore Not Initialized

**Symptoms:**
- Log shows: `Firestore not available`
- Error: `Database not configured`

**Solution:**
- Check server startup logs for Firebase initialization
- Verify service account key file exists
- See `FIX_FIREBASE_AUTH.md` for setup instructions

## Testing the Fix

1. **Restart the server** to apply all changes
2. **Have user log out and log back in** to establish new Socket.io connection with email
3. **Check server logs** when user connects - should see email in connection log
4. **Send a test message** to the bot
5. **Check server logs** for detailed error messages

## Expected Log Flow (Success)

```
[Socket] ✅ NEW CONNECTION: User ID: ChbtldYR4zccp8n7q1NCPWfuQxe2, Email: teekarseng94@gmail.com
[SessionManager] Starting new session for user: ChbtldYR4zccp8n7q1NCPWfuQxe2, email: teekarseng94@gmail.com
[userId] Processing message from 1234567890@s.whatsapp.net: Hello
[userId] 🔄 Getting AI model for user...
[userId] Using email for API key lookup: teekarseng94@gmail.com (session.userEmail: teekarseng94@gmail.com)
[getModelForUser] ✅ userId is already an email: teekarseng94@gmail.com
[getUserApiKeyFromFirestore] ✅ API key found (length: 39)
[userId] ✅ Model obtained, generating response...
[userId] ✅ AI response generated: Hello! How can I help...
[userId] ✅ Reply sent successfully
```

## Expected Log Flow (Error - API Key Missing)

```
[Socket] ✅ NEW CONNECTION: User ID: ChbtldYR4zccp8n7q1NCPWfuQxe2, Email: teekarseng94@gmail.com
[userId] Processing message from 1234567890@s.whatsapp.net: Hello
[userId] 🔄 Getting AI model for user...
[userId] Using email for API key lookup: teekarseng94@gmail.com (session.userEmail: teekarseng94@gmail.com)
[getModelForUser] ✅ userId is already an email: teekarseng94@gmail.com
[getUserApiKeyFromFirestore] ⚠️ Document does not exist for: teekarseng94@gmail.com
[getModelForUser] ❌ API key not found for user: teekarseng94@gmail.com
[userId] ❌ Error processing message:
   Error message: API key not found for user: teekarseng94@gmail.com
```

## Next Steps

1. Check server logs when user connects and sends a message
2. Share the logs if the issue persists
3. Verify API key exists in Firestore for the user's email
4. Use diagnostic endpoint to check status



