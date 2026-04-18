# SessionManager Class Guide

## Overview

The `SessionManager` class manages multiple Baileys WhatsApp instances with event-based QR code emission for Firebase/Web frontend integration.

## Key Features

- ✅ **Event-based QR emission** - Emits `qr` events that can be listened to by your Firebase/Web frontend
- ✅ **Isolated sessions** - Each user gets their own session directory: `./sessions/{userId}`
- ✅ **Automatic reconnection** - Handles connection drops and reconnects automatically
- ✅ **Session cleanup** - Properly logs out and removes session files on deletion

## Class Methods

### `startSession(userId)`
Initialize a new Baileys socket for a specific user.

```javascript
const session = await sessionManager.startSession('user123');
// Returns: Session object with { userId, sock, status, qr, history, ... }
```

**What it does:**
- Creates session directory: `./sessions/user123`
- Uses `useMultiFileAuthState('./sessions/user123')` for authentication
- Sets up connection update listeners
- Emits QR codes via events when available

### `getSession(userId)`
Retrieve an active session.

```javascript
const session = sessionManager.getSession('user123');
// Returns: Session object or null if not found
```

### `deleteSession(userId)`
Logout and remove session files.

```javascript
await sessionManager.deleteSession('user123');
// - Closes Baileys socket connection
// - Removes session from memory
// - Deletes ./sessions/user123 directory and all files
// - Emits 'session_deleted' event
```

## Event System

The `SessionManager` extends `EventEmitter`, so you can listen to events:

### QR Code Event

```javascript
sessionManager.on('qr', ({ userId, qr, rawQR }) => {
    // qr: DataURL string (ready to display in <img> tag)
    // rawQR: Raw QR code string
    // userId: The user ID this QR belongs to
    
    console.log(`QR code for ${userId}:`, qr);
    
    // Send to Firebase/Web frontend
    // Example: Send to Firestore
    db.collection('users').doc(userId).update({
        qrCode: qr,
        qrGeneratedAt: new Date()
    });
});
```

### Session Deleted Event

```javascript
sessionManager.on('session_deleted', ({ userId }) => {
    console.log(`Session deleted for ${userId}`);
    // Clean up any related data in your database
});
```

## Usage Examples

### Example 1: Start a Session and Listen for QR

```javascript
const sessionManager = new SessionManager();

// Listen for QR codes
sessionManager.on('qr', ({ userId, qr }) => {
    console.log(`QR for ${userId} received!`);
    // Send to your Firebase/Web frontend
    sendQRToFrontend(userId, qr);
});

// Start a session
const session = await sessionManager.startSession('user123');
console.log('Session status:', session.status);
```

### Example 2: Get Session Status

```javascript
const session = sessionManager.getSession('user123');

if (session) {
    console.log('Status:', session.status);
    console.log('Has QR:', !!session.qr);
    console.log('Bot enabled:', session.botEnabled);
    console.log('Message history:', session.history);
} else {
    console.log('No active session');
}
```

### Example 3: Delete Session (Logout)

```javascript
// Delete session and clean up files
await sessionManager.deleteSession('user123');
console.log('Session deleted and files removed');
```

### Example 4: Firebase Integration

```javascript
const admin = require('firebase-admin');
const { SessionManager } = require('./index');

const sessionManager = new SessionManager();

// Listen for QR codes and update Firestore
sessionManager.on('qr', async ({ userId, qr }) => {
    try {
        await admin.firestore()
            .collection('whatsapp_sessions')
            .doc(userId)
            .update({
                qrCode: qr,
                qrGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'waiting_for_scan'
            });
        console.log(`✅ QR code saved to Firestore for ${userId}`);
    } catch (error) {
        console.error(`❌ Error saving QR to Firestore:`, error);
    }
});

// Listen for connection status changes
sessionManager.on('connection_status', async ({ userId, status }) => {
    await admin.firestore()
        .collection('whatsapp_sessions')
        .doc(userId)
        .update({ status });
});

// Start session when user requests
async function startUserSession(userId) {
    try {
        const session = await sessionManager.startSession(userId);
        return { success: true, sessionId: userId };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

### Example 5: Web Frontend Integration (Socket.io)

The current implementation already handles Socket.io connections. The `SessionManager` emits QR codes both:
1. Via EventEmitter (`sessionManager.on('qr', ...)`) - for Firebase/other backends
2. Via Socket.io (`socket.emit('qr_code', ...)`) - for connected web clients

## Session Object Structure

```javascript
{
    userId: 'user123',
    sock: BaileysSocket,        // The Baileys socket instance
    saveCreds: Function,        // Function to save credentials
    sessionDir: './sessions/user123',
    status: 'Ready' | 'Initializing' | 'Waiting for QR scan' | 'Connecting' | 'Reconnecting' | 'Logged Out',
    qr: '',                     // QR code DataURL (if available)
    qrGeneratedAt: Date,        // When QR was generated
    history: [],                 // Last 5 message pairs
    botEnabled: true,           // Whether bot auto-reply is enabled
    createdAt: Date,            // When session was created
    lastActivity: Date,         // Last message activity
    reconnectAttempts: 0        // Number of reconnection attempts
}
```

## Session Directory Structure

Each user gets an isolated session directory:

```
./sessions/
  └── user123/
      ├── creds.json          # Authentication credentials
      ├── app-state-sync-key-*.json
      ├── app-state-sync-version-*.json
      └── ... (other Baileys auth files)
```

## Error Handling

```javascript
try {
    const session = await sessionManager.startSession('user123');
} catch (error) {
    if (error.message.includes('Maximum session limit')) {
        console.log('Too many active sessions, please wait');
    } else {
        console.error('Error starting session:', error);
    }
}
```

## Best Practices

1. **Always check if session exists** before using:
   ```javascript
   const session = sessionManager.getSession(userId);
   if (!session) {
       await sessionManager.startSession(userId);
   }
   ```

2. **Clean up on logout**:
   ```javascript
   await sessionManager.deleteSession(userId);
   ```

3. **Listen to events early**:
   ```javascript
   // Set up listeners before starting sessions
   sessionManager.on('qr', handleQR);
   sessionManager.on('session_deleted', handleDeletion);
   ```

4. **Handle reconnections**:
   - The SessionManager automatically handles reconnections
   - QR codes will be re-emitted if connection is lost

## Current Implementation

The `SessionManager` is already integrated into the main `index.js`:

- Socket.io connections automatically start sessions
- QR codes are emitted to both EventEmitter and Socket.io
- Sessions are cleaned up on disconnect
- API endpoints use SessionManager methods

## API Endpoints

- `POST /api/reset-session/:userId` - Uses `sessionManager.deleteSession()`
- `GET /api/stats` - Uses `sessionManager.getStats()`
