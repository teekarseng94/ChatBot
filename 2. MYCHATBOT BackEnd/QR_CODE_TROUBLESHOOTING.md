# QR Code Not Appearing - Troubleshooting Guide

## Common Issues

### Issue 1: Existing Credentials
**Problem:** If the session folder already has valid credentials, Baileys won't generate a QR code - it will try to connect directly.

**Solution:**
1. Click the "Reset Session" button in the dashboard
2. Or manually delete the session folder: `sessions/{userId}/`
3. Then refresh the page and login again

### Issue 2: QR Generated Before Socket Connection
**Problem:** QR code might be generated before the Socket.io connection is established.

**Solution:** The code now includes:
- Automatic QR sending when socket connects
- `request_qr` event handler
- Better logging to track QR generation

### Issue 3: Connection State Not Updating
**Problem:** Baileys connection.update might not fire immediately.

**Solution:** Added better logging to track connection updates.

## Debugging Steps

### Step 1: Check Server Logs
```bash
pm2 logs whatsapp-bot --lines 50
```

Look for:
- `[userId] Connection update:` - Shows if connection updates are firing
- `[userId] Generating QR code DataURL...` - Shows if QR is being generated
- `[userId] Emitting qr_code to X socket(s)` - Shows if QR is being sent

### Step 2: Check Browser Console
Open browser console (F12) and look for:
- Socket.io connection messages
- QR code events
- Any errors

### Step 3: Check Session Folder
```bash
# Check if session folder exists
dir sessions\admin

# If it exists and has creds.json, delete it to force new QR
del sessions\admin\creds.json
```

### Step 4: Reset Session via API
```bash
# Using curl or browser
POST https://mychatbot.website/api/reset-session/admin
```

## What to Look For in Logs

### Good Signs:
```
[admin] 📁 Session directory: ...
[admin] 🔑 Has existing credentials: false
[admin] ℹ️ No credentials found. QR code should appear shortly.
[admin] 🔄 Connection update: { connection: undefined, hasQR: true, ... }
[admin] Generating QR code DataURL...
[admin] ✅ QR code DataURL generated (... bytes) and emitted
[admin] 📤 Emitting qr_code to 1 socket(s)
```

### Bad Signs:
```
[admin] 🔑 Has existing credentials: true
[admin] ℹ️ Will try to connect with existing credentials...
# No QR will appear if credentials are valid
```

## Quick Fix

1. **Reset Session:**
   - Click "Reset Session" button in dashboard
   - Or visit: `https://mychatbot.website/api/reset-session/admin` (POST)

2. **Wait 5-10 seconds** after reset

3. **Refresh the page** and login again

4. **QR should appear** within 10-15 seconds

## If Still Not Working

1. Check PM2 status: `pm2 status`
2. Check bot logs: `pm2 logs whatsapp-bot`
3. Verify dependencies installed: `npm list @whiskeysockets/baileys`
4. Check session folder permissions
5. Try restarting the bot: `pm2 restart whatsapp-bot`
