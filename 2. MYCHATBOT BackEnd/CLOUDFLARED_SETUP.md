# Cloudflared Quick Tunnel Setup Guide

## Method 1: Manual Download (Recommended)

### Step 1: Download cloudflared
1. Visit: https://github.com/cloudflare/cloudflared/releases/latest
2. Download: `cloudflared-windows-amd64.exe` (or `cloudflared-windows-amd64.msi` if available)
3. Save it to your project folder: `C:\Users\Acer\Desktop\Vibe Coding'\7. whatsapp-assistant-pro\`
4. Rename it to: `cloudflared.exe`

### Step 2: Create Quick Tunnel
Open PowerShell in your project folder and run:
```powershell
.\cloudflared.exe tunnel --url http://localhost:3000
```

You'll see output like:
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at:                                         |
|  https://random-subdomain.trycloudflare.com                                                |
+--------------------------------------------------------------------------------------------+
```

**Copy that URL** - that's your public dashboard URL!

### Step 3: Keep Tunnel Running
Keep the PowerShell window open, or use PM2 to run it in background:
```powershell
.\pm2.bat start cloudflared.exe --name tunnel -- --url http://localhost:3000
```

---

## Method 2: Using Chocolatey (If Installed)

If you have Chocolatey package manager:
```powershell
choco install cloudflared
```

Then use:
```powershell
cloudflared tunnel --url http://localhost:3000
```

---

## Method 3: Add to PATH (Permanent)

1. Download `cloudflared-windows-amd64.exe` from GitHub releases
2. Rename to `cloudflared.exe`
3. Place in a folder (e.g., `C:\cloudflared\`)
4. Add to PATH:
   - Press `Win + X` → System → Advanced system settings
   - Click "Environment Variables"
   - Under "User variables", edit "Path"
   - Add: `C:\cloudflared`
   - Click OK, close and reopen terminal
5. Now you can use: `cloudflared tunnel --url http://localhost:3000`

---

## Quick Start (After Installation)

### Start tunnel:
```powershell
# If cloudflared.exe is in project folder:
.\cloudflared.exe tunnel --url http://localhost:3000

# If added to PATH:
cloudflared tunnel --url http://localhost:3000

# With PM2 (background):
.\pm2.bat start cloudflared.exe --name tunnel -- --url http://localhost:3000
```

### View tunnel logs:
```powershell
.\pm2.bat logs tunnel
```

### Stop tunnel:
```powershell
.\pm2.bat stop tunnel
```

---

## Update Frontend with Tunnel URL

Once you have your tunnel URL (e.g., `https://abc123.trycloudflare.com`), update `public/index.html`:

Find this section (around line 9-12):
```javascript
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.BOT_SERVER_URL = window.location.origin;
} else {
  window.BOT_SERVER_URL = "https://YOUR-BOT-SERVER-DOMAIN";
}
```

Replace with your tunnel URL:
```javascript
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.BOT_SERVER_URL = window.location.origin;
} else {
  window.BOT_SERVER_URL = "https://your-tunnel-url.trycloudflare.com";
}
```

---

## Important Notes

⚠️ **Quick Tunnel URLs are temporary:**
- They change every time you restart cloudflared
- For a permanent URL, you need to set up a Named Tunnel (more complex)

⚠️ **Tunnel must stay running:**
- If cloudflared stops, your public URL stops working
- Use PM2 to keep it running in the background

⚠️ **Make sure your bot is running:**
- Before starting the tunnel, ensure PM2 has your bot running:
  ```powershell
  .\pm2.bat list
  ```

---

## Troubleshooting

### "cloudflared not recognized"
- Make sure `cloudflared.exe` is in your project folder
- Use: `.\cloudflared.exe` (with `.\` prefix)
- Or add it to PATH (see Method 3 above)

### Tunnel URL not working
- Check if bot is running: `.\pm2.bat list`
- Check if tunnel is running: `.\pm2.bat logs tunnel`
- Make sure port 3000 is not blocked by firewall

### Connection refused
- Verify bot is running on port 3000
- Check PM2 logs: `.\pm2.bat logs whatsapp-system`









