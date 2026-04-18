# Production Setup Guide

## 1. PM2 Setup

### Install PM2 globally:
```bash
npm install -g pm2
```

### Fix PM2 "not recognized" Error:

If you get `pm2 : The term 'pm2' is not recognized`, use one of these solutions:

**Option 1: Use Full Path (Quick Fix):**
```powershell
& "C:\Users\Acer\AppData\Roaming\npm\pm2.cmd" start index.js --name whatsapp-system
```

**Option 2: Add to PATH Permanently:**
1. Press `Win + X` and select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "User variables", find "Path" and click "Edit"
5. Click "New" and add: `C:\Users\Acer\AppData\Roaming\npm`
6. Click "OK" on all dialogs
7. **Close and reopen your terminal**

**Option 3: Create PowerShell Alias (Current Session Only):**
```powershell
Set-Alias pm2 "C:\Users\Acer\AppData\Roaming\npm\pm2.cmd"
```

**Option 4: Use npx (No PATH needed):**
```powershell
npx pm2 start index.js --name whatsapp-system
```

### Navigate to your project folder:
```bash
cd "C:\Users\Acer\Desktop\Vibe Coding'\7. whatsapp-assistant-pro"
```

### Start your bot with PM2:
```bash
# If PATH is fixed:
pm2 start index.js --name whatsapp-system

# Or use full path:
& "C:\Users\Acer\AppData\Roaming\npm\pm2.cmd" start index.js --name whatsapp-system

# Or use npx:
npx pm2 start index.js --name whatsapp-system
```

### Useful PM2 Commands:
```bash
# View running processes
pm2 list

# View logs (real-time)
pm2 logs whatsapp-system

# View logs (last 100 lines)
pm2 logs whatsapp-system --lines 100

# Stop the bot
pm2 stop whatsapp-system

# Restart the bot
pm2 restart whatsapp-system

# Delete the process
pm2 delete whatsapp-system

# Save PM2 configuration (auto-start on reboot)
pm2 save

# Setup PM2 to start on Windows boot
pm2 startup
# Then run the command it outputs
```

## 2. Cloudflared Quick Tunnel Setup

**📖 For detailed instructions, see `CLOUDFLARED_SETUP.md`**

### Quick Install (Manual Download - Easiest):
1. Visit: https://github.com/cloudflare/cloudflared/releases/latest
2. Download: `cloudflared-windows-amd64.exe`
3. Rename to: `cloudflared.exe`
4. Place in your project folder: `C:\Users\Acer\Desktop\Vibe Coding'\7. whatsapp-assistant-pro\`

### Create Quick Tunnel:
```powershell
.\cloudflared.bat tunnel --url http://localhost:3000
```
Or if cloudflared.exe is in project folder:
```powershell
.\cloudflared.exe tunnel --url http://localhost:3000
```

### Alternative Installation Methods:

### Install cloudflared:

**Option A: Using Chocolatey (recommended if you have it):**
```bash
choco install cloudflared
```

**Option B: Manual Download:**
1. Visit: https://github.com/cloudflare/cloudflared/releases/latest
2. Download: `cloudflared-windows-amd64.exe`
3. Rename to: `cloudflared.exe`
4. Place in a folder (e.g., `C:\cloudflared\`)
5. Add that folder to your Windows PATH environment variable

### Create Quick Tunnel:

**In a NEW terminal window**, run:
```bash
cloudflared tunnel --url http://localhost:3000
```

This will output something like:
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
|  https://random-subdomain.trycloudflare.com                                                |
+--------------------------------------------------------------------------------------------+
```

**Copy that URL** - that's your public dashboard URL!

### Keep Tunnel Running:

**Option 1: Run in PM2 (recommended):**
```bash
pm2 start cloudflared --name tunnel -- --url http://localhost:3000
pm2 logs tunnel
```

**Option 2: Keep terminal window open** (simpler, but closes if you close terminal)

## 3. Update Frontend for Tunnel URL

Once you have your cloudflared URL, update `public/index.html`:

Find this section (around line 9-12):
```javascript
<script>
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.BOT_SERVER_URL = window.location.origin;
  } else {
    window.BOT_SERVER_URL = "https://YOUR-BOT-SERVER-DOMAIN";
  }
</script>
```

Replace `"https://YOUR-BOT-SERVER-DOMAIN"` with your cloudflared URL:
```javascript
window.BOT_SERVER_URL = "https://your-tunnel-url.trycloudflare.com";
```

Or make it dynamic:
```javascript
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.BOT_SERVER_URL = window.location.origin;
} else {
  // Use cloudflared tunnel URL
  window.BOT_SERVER_URL = "https://your-tunnel-url.trycloudflare.com";
}
```

## 4. Complete Workflow

1. **Start bot with PM2:**
   ```bash
   pm2 start index.js --name whatsapp-system
   ```

2. **Start cloudflared tunnel:**
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
   OR with PM2:
   ```bash
   pm2 start cloudflared --name tunnel -- --url http://localhost:3000
   ```

3. **Copy the tunnel URL** from the output

4. **Update `public/index.html`** with the tunnel URL

5. **Access your dashboard:**
   - Open the cloudflared URL in your browser
   - Login with `admin@rdp.com` / `123456`
   - Your WhatsApp bot dashboard should work!

## 5. Monitoring

### Check bot status:
```bash
pm2 status
pm2 logs whatsapp-system
```

### Check tunnel status:
```bash
pm2 logs tunnel
```

### Restart everything:
```bash
pm2 restart all
```

## Important Notes

⚠️ **Quick Tunnel URLs are temporary:**
- They change every time you restart cloudflared
- For a permanent URL, you need to set up a Named Tunnel (more complex)

⚠️ **PM2 keeps your bot running:**
- Even if you close the terminal
- Even if you log out
- Until you explicitly stop it with `pm2 stop`

⚠️ **Tunnel must stay running:**
- If cloudflared stops, your public URL stops working
- Use PM2 to keep it running in the background

## Troubleshooting

### PM2 not found:
- Close and reopen your terminal
- Or use: `npx pm2` instead of `pm2`

### Cloudflared not found:
- Make sure it's in your PATH
- Or use full path: `C:\path\to\cloudflared.exe tunnel --url http://localhost:3000`

### Bot not connecting:
- Check logs: `pm2 logs whatsapp-system`
- Make sure port 3000 is not blocked by firewall
- Verify tunnel is running: `pm2 logs tunnel`

