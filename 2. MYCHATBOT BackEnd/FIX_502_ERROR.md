# Fix 502 Bad Gateway Error

## The Problem
502 Bad Gateway means the Cloudflare tunnel can't reach your bot server on port 3000.

## Quick Fix

### Step 1: Restart the Bot Server

**Option A: Using the batch file (Easiest)**
1. Double-click `restart-bot.bat`
2. Wait for it to complete
3. Check if port 3000 is listening

**Option B: Using PM2 manually**
```powershell
cd "C:\Users\Acer\Desktop\Vibe Coding'\7. whatsapp-assistant-pro"
pm2 delete whatsapp-bot
pm2 start index.js --name whatsapp-bot
pm2 status
```

**Option C: Start directly (for testing)**
```powershell
cd "C:\Users\Acer\Desktop\Vibe Coding'\7. whatsapp-assistant-pro"
node index.js
```
Keep this terminal open. Press Ctrl+C to stop.

### Step 2: Verify It's Working

Check if port 3000 is listening:
```powershell
netstat -ano | findstr :3000
```

You should see output like:
```
TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       12345
```

### Step 3: Check PM2 Status

```powershell
pm2 status
```

Both services should show as `online`:
- `whatsapp-bot` - should be `online`
- `cloudflared-tunnel` - should be `online`

### Step 4: Test the Website

Wait 10-15 seconds after restarting, then visit:
https://mychatbot.website

## If Still Getting 502

1. **Check bot logs:**
   ```powershell
   pm2 logs whatsapp-bot --lines 50
   ```

2. **Check tunnel logs:**
   ```powershell
   pm2 logs cloudflared-tunnel --lines 50
   ```

3. **Restart both services:**
   ```powershell
   pm2 restart all
   ```

4. **Check for errors in the logs** - look for:
   - Syntax errors
   - Port already in use
   - Browser conflicts
   - Missing dependencies

## Common Issues

### Port 3000 Already in Use
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with the actual number)
taskkill /F /PID <PID>
```

### Bot Keeps Crashing
Check the logs for errors:
```powershell
pm2 logs whatsapp-bot --err --lines 50
```

### Syntax Error Fixed
The syntax error has been fixed. The bot should now start correctly.

## After Fixing

Once the bot is running:
1. Visit https://mychatbot.website
2. Log in with: `admin@rdp.com` / `123456`
3. The QR code should appear
