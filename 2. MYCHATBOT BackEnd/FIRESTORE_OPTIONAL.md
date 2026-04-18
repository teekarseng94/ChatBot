# Firestore message logging (optional)

The bot can log WhatsApp messages to **Firestore** for history/analytics. It is **optional**. If you do not set up credentials, the bot still works; only Firestore logging is skipped.

## When Firestore is disabled

You will see at startup:
```text
ℹ️ Firestore disabled: no serviceAccountKey.json or GOOGLE_APPLICATION_CREDENTIALS (message logging to Firestore skipped)
```
No action needed; the bot runs normally.

## How to enable Firestore logging

1. **Get a service account key**
   - [Firebase Console](https://console.firebase.google.com/) → project **chatbot20-21e3a** → Project settings (gear) → **Service accounts**.
   - Click **Generate new private key** and download the JSON file.

2. **Add it to the backend**
   - Save the JSON file as **`serviceAccountKey.json`** in the backend folder: `2. MYCHATBOT BackEnd\`.
   - Do not commit this file to git (it should be in `.gitignore`).

3. **Restart the backend**
   - The server will log: `✅ Firebase Admin initialized with service account key` and `✅ Firestore ready for message logging`.

Alternatively, set the env var **`GOOGLE_APPLICATION_CREDENTIALS`** to the full path of your service account JSON file (same file as above).
