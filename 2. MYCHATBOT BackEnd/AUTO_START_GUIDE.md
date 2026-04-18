# Auto-Start Guide for WhatsApp Bot

## Quick Start After PC Restart

### Option 1: Smart Startup (Recommended)
**Double-click:** `start-bot-check.bat`

This script will:
- ✅ Check if PM2 is running
- ✅ Check if bot is already running
- ✅ Start bot if it's not running
- ✅ Start tunnel if it's not running
- ✅ Show you the final status
- ✅ Verify port 3000 is listening

### Option 2: Check Status Only
**Double-click:** `check-bot-status.bat`

This shows you:
- Current PM2 status
- Port 3000 status
- Recent logs
- Summary of what's running

---

## One-Time Setup: Auto-Start on Boot

To make the bot start automatically when you turn on your PC:

### Step 1: Save PM2 Configuration
```powershell
cd "C:\Users\Acer\Desktop\Vibe Coding'\7. whatsapp-assistant-pro"
pm2 save
```

### Step 2: Setup PM2 Startup (Run as Administrator)
1. **Right-click PowerShell** → "Run as Administrator"
2. Navigate to project:
   ```powershell
   cd "C:\Users\Acer\Desktop\Vibe Coding'\7. whatsapp-assistant-pro"
   ```
3. Run:
   ```powershell
   pm2 startup
   ```
4. **Copy and run the command it outputs** (it will look like):
   ```powershell
   pm2 startup windows -u Acer --hp C:\Users\Acer
   ```

### Step 3: Verify
```powershell
pm2 save
```

**After this setup:**
- Bot will start automatically when you turn on your PC
- No manual intervention needed
- Both bot and tunnel will start automatically

---

## Manual Start (If Auto-Start Not Set Up)

### Quick Start:
**Double-click:** `start-bot-check.bat`

### Or use PM2 directly:
```powershell
cd "C:\Users\Acer\Desktop\Vibe Coding'\7. whatsapp-assistant-pro"
pm2 start ecosystem.config.js
```

### Or start individually:
```powershell
# Start bot
pm2 start index.js --name whatsapp-bot

# Start tunnel
pm2 start cloudflared.exe --name cloudflared-tunnel -- tunnel --config config.yml run
```

---

## Daily Workflow

### After Turning On Your PC:

1. **Check Status:**
   - Double-click `check-bot-status.bat`
   - Or run: `pm2 status`

2. **If Not Running:**
   - Double-click `start-bot-check.bat`
   - Or run: `pm2 start ecosystem.config.js`

3. **Verify:**
   - Wait 10-15 seconds
   - Visit: https://mychatbot.website
   - Should load without errors

---

## Troubleshooting

### Bot Not Starting?

1. **Check logs:**
   ```powershell
   pm2 logs whatsapp-bot --lines 50
   ```

2. **Check for errors:**
   ```powershell
   pm2 logs whatsapp-bot --err --lines 50
   ```

3. **Restart everything:**
   ```powershell
   pm2 restart all
   ```

### Port 3000 Not Listening?

1. **Check if something else is using it:**
   ```powershell
   netstat -ano | findstr :3000
   ```

2. **Kill the process if needed:**
   ```powershell
   taskkill /F /PID <PID_NUMBER>
   ```

3. **Restart bot:**
   ```powershell
   pm2 restart whatsapp-bot
   ```

### PM2 Not Working?

1. **Fix PM2:**
   - Double-click `fix-pm2.bat`
   - Or run: `.\fix-pm2.bat`

2. **If still not working:**
   - Run as Administrator: `.\fix-pm2-admin.bat`

---

## Useful Commands

```powershell
# Check status
pm2 status

# View logs
pm2 logs whatsapp-bot
pm2 logs cloudflared-tunnel

# Restart everything
pm2 restart all

# Stop everything
pm2 stop all

# Start everything
pm2 start ecosystem.config.js

# Save configuration
pm2 save
```

---

## Files Created

- **`start-bot-check.bat`** - Smart startup script (checks and starts if needed)
- **`check-bot-status.bat`** - Status checker (shows what's running)
- **`restart-bot.bat`** - Simple restart script
- **`AUTO_START_GUIDE.md`** - This guide

---

## Summary

**Current Setup:**
- ✅ Smart startup script created
- ✅ Status checker created
- ⚠️ Auto-start on boot: **Not configured yet**

**To Enable Auto-Start:**
1. Run `pm2 save`
2. Run `pm2 startup` (as Administrator)
3. Run the command it outputs

**Daily Use:**
- After PC restart: Double-click `start-bot-check.bat`
- To check status: Double-click `check-bot-status.bat`
