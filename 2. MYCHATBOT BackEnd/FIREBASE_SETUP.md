# Firebase Integration Setup Guide

## Overview

The SessionManager now integrates with Firebase Firestore to log all incoming WhatsApp messages. The app is also "reboot-friendly" - it automatically recovers all logged-in sessions on startup.

## Features

✅ **Message Logging**: All incoming messages are logged to Firestore  
✅ **Reboot Recovery**: Automatically re-initializes all sessions after PC restart  
✅ **PM2 Compatible**: Sessions persist across PM2 restarts  

## Installation

### Step 1: Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### Step 2: Set Up Firebase Authentication

You have **3 options** for Firebase authentication:

#### Option 1: Service Account Key (Recommended for Production)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `chatbot20-21e3a`
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file as `serviceAccountKey.json` in your project root
6. **Important**: Add `serviceAccountKey.json` to `.gitignore` to keep it secure!

The app will automatically detect and use this file.

#### Option 2: Environment Variable

Set the path to your service account key:

```bash
# Windows PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"

# Windows CMD
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\serviceAccountKey.json

# Linux/Mac
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

#### Option 3: Application Default Credentials (for Google Cloud)

If running on Google Cloud Platform, it will use Application Default Credentials automatically.

## Firestore Data Structure

### Collection: `whatsapp_messages`

Each message is stored as a document with:

```javascript
{
  userId: "user123",                    // The user ID who owns the session
  sender: "1234567890@s.whatsapp.net", // WhatsApp sender JID
  message: "Hello!",                    // Message content
  reply: "Hi there! How can I help?",  // AI reply (if applicable)
  timestamp: Timestamp,                 // Server timestamp
  sessionId: "user123",                 // Session ID
  messageId: "message_id",             // WhatsApp message ID
  isFromMe: false,                      // Whether message is from bot
  isReply: true                         // Whether this is an AI reply
}
```

### Example Query

```javascript
// Get all messages for a user
const messages = await firestore
  .collection('whatsapp_messages')
  .where('userId', '==', 'user123')
  .orderBy('timestamp', 'desc')
  .limit(50)
  .get();

messages.forEach(doc => {
  const data = doc.data();
  console.log(`${data.sender}: ${data.message}`);
  if (data.reply) {
    console.log(`Bot: ${data.reply}`);
  }
});
```

## Reboot Recovery

The app automatically recovers all sessions on startup:

1. **Scans** `/sessions` folder
2. **Checks** for `creds.json` files (indicates logged-in session)
3. **Re-initializes** all valid sessions
4. **Logs** recovery status

### Example Startup Logs

```
🚀 WhatsApp Bot Server running on port 3000
📊 Session Manager initialized (Max sessions: 100)
📁 Sessions directory: C:\...\sessions
🌐 Web UI: http://localhost:3000

🔄 Starting session recovery...
📁 Found 3 session directory(ies) to check

[admin] 🔄 Recovering session...
[admin] ✅ Session recovered successfully

[user123] 🔄 Recovering session...
[user123] ✅ Session recovered successfully

[user456] ⚠️ No credentials file found, skipping (not logged in)

✅ Session recovery complete: 2/3 sessions recovered

✅ 2 session(s) automatically recovered and ready!
   Sessions: admin, user123
```

## PM2 Integration

The reboot recovery works perfectly with PM2:

```bash
# Start with PM2
pm2 start index.js --name whatsapp-bot

# Restart (sessions will auto-recover)
pm2 restart whatsapp-bot

# After PC restart, PM2 will auto-start and recover sessions
pm2 save
pm2 startup
```

## Testing

### Test Message Logging

1. Send a message to your WhatsApp bot
2. Check Firestore console: `whatsapp_messages` collection
3. You should see the message logged with:
   - `userId`
   - `sender`
   - `message`
   - `timestamp`

### Test Reboot Recovery

1. Start the bot and connect a session (scan QR)
2. Stop the bot: `pm2 stop whatsapp-bot`
3. Restart: `pm2 start whatsapp-bot`
4. Check logs - you should see session recovery messages
5. Send a test message - it should work without re-scanning QR

## Troubleshooting

### "Firebase Admin not installed"

```bash
npm install firebase-admin
```

### "Permission denied" errors

- Make sure your service account has Firestore write permissions
- Check that `serviceAccountKey.json` is valid
- Verify project ID matches: `chatbot20-21e3a`

### Sessions not recovering

- Check that `creds.json` exists in session directory
- Verify credentials are not empty/corrupted
- Check logs for specific error messages

### Messages not logging

- Verify Firebase Admin is initialized (check startup logs)
- Check Firestore rules allow writes
- Look for error messages in console

## Security Notes

⚠️ **Important**: Never commit `serviceAccountKey.json` to Git!

Add to `.gitignore`:
```
serviceAccountKey.json
*.json.key
```

## Firestore Security Rules

Make sure your Firestore rules allow writes from the service account:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /whatsapp_messages/{document=**} {
      // Allow writes from authenticated service account
      allow write: if request.auth != null;
      // Or allow writes from your backend only
      allow write: if true; // For testing - restrict in production!
    }
  }
}
```

## Next Steps

- Set up Firestore indexes for efficient queries
- Create a dashboard to view messages
- Add message filtering/search functionality
- Set up alerts for important messages
