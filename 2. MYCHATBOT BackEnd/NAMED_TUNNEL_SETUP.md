# Cloudflare Named Tunnel Setup for mychatbot.website

This guide will help you set up a Cloudflare Named Tunnel for your domain `mychatbot.website` and run it with PM2.

## ✅ What's Already Configured

1. **`config.yml`** - Already configured for `mychatbot.website` pointing to `http://localhost:3000`
2. **`public/index.html`** - Socket.io connection already uses `mychatbot.website` domain
3. **`ecosystem.config.js`** - PM2 config updated to run both bot and tunnel

## 📋 Prerequisites

1. Your domain `mychatbot.website` must be added to Cloudflare
2. Your domain's nameservers must be pointing to Cloudflare
3. `cloudflared.exe` must be in your project folder (✅ already there)

## 🚀 Step-by-Step Setup

### Step 1: Authenticate with Cloudflare

This will open your browser to log in and authorize the tunnel:

```powershell
cd "C:\Users\Acer\Desktop\Vibe Coding'\7. whatsapp-assistant-pro"
.\cloudflared.bat tunnel login
```

**What happens:**
- Opens your browser
- Asks you to log in to Cloudflare
- Asks you to select your domain (`mychatbot.website`)
- Saves credentials to `C:\Users\Acer\.cloudflared\cert.pem`

### Step 2: Create the Named Tunnel

Create a tunnel named `whatsapp-tunnel`:

```powershell
.\cloudflared.bat tunnel create whatsapp-tunnel
```

**What happens:**
- Creates the tunnel in your Cloudflare account
- Generates a tunnel ID (e.g., `abc123-def456-ghi789`)
- Saves credentials to `C:\Users\Acer\.cloudflared\<tunnel-id>.json`

**⚠️ IMPORTANT:** After running this command, you'll see output like:
```
Tunnel credentials written to C:\Users\Acer\.cloudflared\abc123-def456-ghi789.json
```

**You need to update `config.yml` line 2 with the actual tunnel ID:**

1. Copy the tunnel ID from the output
2. Update `config.yml`:
   ```yaml
   credentials-file: C:\Users\Acer\.cloudflared\<TUNNEL-ID>.json
   ```
   Replace `<TUNNEL-ID>` with the actual ID (e.g., `abc123-def456-ghi789`)

**Or find the tunnel ID later:**
```powershell
.\cloudflared.bat tunnel list
```

### Step 3: Route DNS

Route your domain to the tunnel:

```powershell
# Route main domain
.\cloudflared.bat tunnel route dns whatsapp-tunnel mychatbot.website

# Route www subdomain (optional)
.\cloudflared.bat tunnel route dns whatsapp-tunnel www.mychatbot.website
```

**What happens:**
- Creates DNS CNAME records in Cloudflare
- Points `mychatbot.website` → your tunnel
- Points `www.mychatbot.website` → your tunnel

### Step 4: Test the Tunnel (Manual)

Before running with PM2, test the tunnel manually:

```powershell
.\cloudflared.bat tunnel --config config.yml run
```

**What to check:**
- Should see "Connection established" messages
- No errors about credentials or DNS
- Keep this terminal open to test

**In another terminal, start your bot:**
```powershell
node index.js
```

**Then visit:** https://mychatbot.website
- Should show your dashboard
- QR code should appear after login

If everything works, press `Ctrl+C` to stop the tunnel, then proceed to Step 5.

### Step 5: Run with PM2 (Production)

Once everything works, run both bot and tunnel with PM2:

```powershell
# Start both bot and tunnel
pm2 start ecosystem.config.js

# Or if PM2 is not in PATH:
.\pm2.bat start ecosystem.config.js
```

**This will start:**
- `whatsapp-bot` - Your Node.js bot server
- `cloudflared-tunnel` - Your Cloudflare tunnel

### Step 6: Verify PM2 Status

```powershell
# Check status
pm2 status

# View logs
pm2 logs whatsapp-bot
pm2 logs cloudflared-tunnel

# View all logs together
pm2 logs
```

### Step 7: Save PM2 Configuration (Survives Reboots)

```powershell
# Save current process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

Follow the instructions from `pm2 startup` to enable auto-start on boot.

## 🔧 Useful PM2 Commands

```powershell
# Restart both services
pm2 restart all

# Restart specific service
pm2 restart whatsapp-bot
pm2 restart cloudflared-tunnel

# Stop services
pm2 stop all

# Delete services
pm2 delete all

# View real-time logs
pm2 logs --lines 50

# Monitor resources
pm2 monit
```

## ✅ Verification Checklist

- [ ] Authenticated with Cloudflare (`tunnel login`)
- [ ] Created tunnel `whatsapp-tunnel`
- [ ] Updated `config.yml` with correct credentials file path
- [ ] Routed DNS for `mychatbot.website` and `www.mychatbot.website`
- [ ] Tested tunnel manually (works)
- [ ] Started bot and tunnel with PM2
- [ ] Can access https://mychatbot.website
- [ ] QR code appears after login
- [ ] Socket.io connection works (no errors in browser console)

## 🐛 Troubleshooting

### Tunnel won't start
- Check `config.yml` credentials file path is correct
- Verify you ran `tunnel login` and `tunnel create`
- Check logs: `pm2 logs cloudflared-tunnel`

### DNS not working
- Wait 1-2 minutes for DNS propagation
- Check Cloudflare dashboard → DNS → Records
- Verify CNAME records exist for your domain

### Bot not accessible
- Ensure bot is running: `pm2 status`
- Check bot logs: `pm2 logs whatsapp-bot`
- Verify bot is listening on port 3000: `netstat -ano | findstr :3000`

### Socket.io connection errors
- Check browser console for errors
- Verify `index.html` uses correct domain
- Check CORS settings in `index.js`

## 📝 Quick Reference

**Start everything:**
```powershell
pm2 start ecosystem.config.js
```

**Stop everything:**
```powershell
pm2 stop all
```

**Restart everything:**
```powershell
pm2 restart all
```

**View logs:**
```powershell
pm2 logs
```

**Your domain:** https://mychatbot.website
