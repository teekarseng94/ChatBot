# "Waiting for this message" on the recipient's phone

When someone sees **"Waiting for this message. This may take a while. Learn more."** for messages sent by the bot, it’s a **WhatsApp encryption key sync** issue, not a bug in your bot code.

## What’s going on

- The **recipient’s WhatsApp** doesn’t have the right keys to decrypt those messages.
- This often happens after the **phone was reinstalled**, **device was re-linked**, or the **bot session was reset** without the user re-scanning the QR.

## What we do in code (already in place)

- Auth state is saved with **useMultiFileAuthState** and **creds.update** so keys are written to disk when they change.
- Socket options are set to reduce sync load: **shouldSyncHistoryMessage: false**, **syncFullHistory: false**, **linkPreviewImageThumbnailWidth: 192**.
- **patchMessageBeforeSending** only wraps interactive messages; plain text is left unchanged.
- Messages are only processed when **session.status === 'Ready'** so we don’t send before the connection is fully ready.
- **Message cache**: Incoming and outgoing messages are stored in **session.messageCache** and returned from **getMessage(key)** when WhatsApp asks (e.g. on retry). **getMessage** returns `undefined` when not in cache (no placeholder), so retries only get real message data.
- **Send delay**: A short delay (300 ms) before each bot reply to reduce encryption burst/sync issues with WhatsApp Business.
- **makeCacheableSignalKeyStore**: Auth uses **creds** plus **makeCacheableSignalKeyStore(state.keys, logger)** so the signal key store is cached and key lookups are consistent, which can reduce "Waiting for this message" (especially on iOS).

## What the user must do when it happens

1. On the **phone** (main WhatsApp): **Settings → Linked devices** → remove the bot device if it’s listed.
2. In **MyChatBot**: open **Dashboard → Reset Session** (or delete the session folder and restart the backend).
3. **Scan the new QR** from the Dashboard with the phone (**Linked devices → Link a device**).
4. From then on, **new** messages from the bot should decrypt and show normally. Old “Waiting for this message” rows stay broken and can’t be fixed.

After a clean re-link, the problem usually stops for new messages.
