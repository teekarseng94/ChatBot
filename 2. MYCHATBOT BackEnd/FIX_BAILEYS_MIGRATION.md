# Fix: PM2 Running Old whatsapp-web.js Code

## The Problem
PM2 is still running the OLD `whatsapp-web.js` code even though `index.js` has been updated to use Baileys.

## Solution: Force Clean Restart

### Step 1: Stop Everything
```powershell
# Stop and delete all PM2 processes
pm2 stop all
pm2 delete all
pm2 kill

# Kill all Node.js processes
taskkill /F /IM node.exe /T

# Kill Chrome processes
taskkill /F /IM chrome.exe /T
taskkill /F /IM chromium.exe /T
```

### Step 2: Wait
```powershell
Start-Sleep -Seconds 5
```

### Step 3: Verify Code is Correct
Check that `index.js` line 6 shows:
```javascript
const { default: makeWASocket, useMultiFileAuthState, ... } = require('@whiskeysockets/baileys');
```

NOT:
```javascript
const { Client, LocalAuth } = require('whatsapp-web.js');
```

### Step 4: Install Dependencies
```powershell
npm install
```

### Step 5: Remove Old Package (if still there)
```powershell
npm uninstall whatsapp-web.js
```

### Step 6: Start Fresh
```powershell
pm2 start index.js --name whatsapp-bot --update-env
```

### Step 7: Check Logs
```powershell
pm2 logs whatsapp-bot --lines 30
```

**You should see:**
- ✅ `Using Baileys version: X.X.X`
- ✅ `Baileys socket created`
- ✅ `Connection update:`
- ❌ NO `whatsapp-web.js` errors
- ❌ NO `Puppeteer` errors
- ❌ NO `Client.initialize` errors

## Quick Fix Script

**Double-click:** `force-clean-restart.bat`

This will do everything automatically.

## If Still Seeing Old Errors

1. **Check PM2 is using correct file:**
   ```powershell
   pm2 describe whatsapp-bot
   ```
   Should show: `script: index.js`

2. **Clear PM2 cache:**
   ```powershell
   pm2 kill
   Remove-Item "$env:USERPROFILE\.pm2\*" -Recurse -Force -ErrorAction SilentlyContinue
   ```

3. **Restart PM2 daemon:**
   ```powershell
   pm2 start index.js --name whatsapp-bot
   ```

4. **Verify:**
   ```powershell
   pm2 logs whatsapp-bot --lines 20
   ```

## Expected Logs (After Fix)

```
🚀 WhatsApp Bot Server running on port 3000
📊 Client Manager initialized (Max clients: 100)
📁 Sessions directory: ...
[admin] 📁 Session directory: ...
[admin] 🔑 Has existing credentials: false
[admin] Using Baileys version: X.X.X
[admin] Baileys socket created, waiting for connection updates...
[admin] 🔄 Connection update: { connection: undefined, hasQR: true, ... }
[admin] Generating QR code DataURL...
[admin] ✅ QR code DataURL generated (... bytes) and emitted
```

## Troubleshooting

### Still seeing whatsapp-web.js errors?
- PM2 is definitely running old code
- Try: `pm2 kill` then `pm2 start index.js --name whatsapp-bot`
- Or restart your computer

### QR code still not appearing?
- Check logs for: `[admin] 🔄 Connection update:`
- Look for: `hasQR: true`
- If `hasQR: false`, credentials might exist - reset session

### Connection errors?
- Make sure Baileys is installed: `npm list @whiskeysockets/baileys`
- Check node_modules exists
- Try: `npm install` again
