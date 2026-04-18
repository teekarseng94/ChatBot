# Admin Guide: Adding User API Keys to Firestore

## Overview

API keys for users are managed manually by administrators in Firebase Firestore. Users cannot save their own API keys through the web interface.

## Step-by-Step Instructions

### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **chatbot20-21e3a**
3. Navigate to **Firestore Database** in the left sidebar

### Step 2: Add User API Key

1. **Open the `users` collection**
   - If the collection doesn't exist, it will be created automatically when you add the first document

2. **Click "Add document"**

3. **Set Document ID**
   - **Important:** Use the user's email address as the Document ID
   - Example: `teekarseng94@gmail.com`
   - Must be lowercase
   - Must match exactly how the user logs in

4. **Add Fields:**
   - Click **Add field** for each field below:
   
   | Field Name | Type | Value |
   |------------|------|-------|
   | `geminiApiKey` | string | The user's Google AI Studio API key (e.g., `AIzaSy...`) |
   | `email` | string | The user's email address (same as Document ID) |
   | `updatedAt` | timestamp | Click the timestamp icon to set current time (optional) |

5. **Click "Save"**

### Step 3: Verify

After adding the API key:
- The user should see their API key displayed in the dashboard (read-only)
- The system will automatically use this key when processing WhatsApp messages
- Check server logs to confirm the API key is being loaded correctly

## Example

**Collection:** `users`

**Document ID:** `teekarseng94@gmail.com`

**Fields:**
```json
{
  "geminiApiKey": "AIzaSyDzi4JLSQ5i5JPhYkPZSABd5W3cZJgDfJ0",
  "email": "teekarseng94@gmail.com",
  "updatedAt": "2025-01-25T12:00:00Z"
}
```

## Updating an Existing API Key

1. Find the user's document in the `users` collection (search by their email)
2. Click on the document to open it
3. Click the edit icon (pencil) next to the `geminiApiKey` field
4. Update the value
5. Click **Update**

## Troubleshooting

### User sees "API key not found" error

- Verify the Document ID matches the user's email exactly (case-sensitive, lowercase)
- Check that the `geminiApiKey` field exists and is not empty
- Ensure the email in the `email` field matches the Document ID

### API key not working

- Verify the API key is valid by testing it in Google AI Studio
- Check that the API key has proper permissions/quota
- Review server logs for specific error messages

### Cannot find user's document

- Make sure you're looking in the `users` collection
- Verify the email address is correct (check for typos)
- The Document ID should be the user's email in lowercase

## Security Notes

- ⚠️ **Never share API keys** - Each user should have their own API key
- ⚠️ **Protect Firestore access** - Only admins should have write access to the `users` collection
- ⚠️ **Monitor usage** - Each user's API key usage is tracked separately

## Quick Reference

**Collection:** `users`  
**Document ID:** `{user-email}` (e.g., `teekarseng94@gmail.com`)  
**Required Field:** `geminiApiKey` (string)  
**Optional Field:** `email` (string), `updatedAt` (timestamp)



