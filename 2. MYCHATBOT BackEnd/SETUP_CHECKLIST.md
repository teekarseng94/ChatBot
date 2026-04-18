# Step-by-Step Setup Checklist for mychatbot.website

## Prerequisites
- ✅ Node.js installed
- ✅ Dependencies installed (`npm install` - already done)
- ✅ Domain `mychatbot.website` added to Cloudflare
- ✅ Domain nameservers pointing to Cloudflare

---

## Step 1: Set Up Environment Variables

### 1.1 Create `.env` file
```powershell
# Copy the example file
Copy-Item .env.example .env

# Edit .env and add your Gemini API key
notepad .env
```

**Required in `.env`:**
- `GEMINI_API_KEY=your_actual_api_key_here`

**Optional:**
- `PORT=3000` (defaults to 3000 if not set)
- `NODE_ENV=production`
- `GOOGLE_APPLICATION_CREDENTIALS=` (if using Firebase with custom path)

---

## Step 2: Set Up Cloudflare Tunnel

### 2.1 Authenticate with Cloudflare
```powershell
.\tunnel-login.bat
```
**OR:**
```powershell
.\cloudflared.exe tunnel login
```

**What happens:**
- Opens browser → Log in to Cloudflare
- Select domain: `mychatbot.website`
- Saves credentials to `C:\Users\User\.cloudflared\cert.pem`

---

### 2.2 Create Named Tunnel
```powershell
.\tunnel-create.bat
```
**OR:**
```powershell
.\cloudflared.exe tunnel create whatsapp-tunnel
```

**⚠️ IMPORTANT:** After running, you'll see output like:
```
Tunnel credentials written to C:\Users\User\.cloudflared\abc123-def456-ghi789.json
```

**Action Required:**
1. Note the **Tunnel ID** from the output (e.g., `abc123-def456-ghi789`)
2. Update `config.yml` line 6 with the correct path:
   ```yaml
   credentials-file: C:\Users\User\.cloudflared\<TUNNEL-ID>.json
   ```
   Replace `<TUNNEL-ID>` with the actual ID from the output.

**OR if you already have credentials from your old PC:**
- Copy the credentials file to: `C:\Users\User\.cloudflared\`
- Make sure the filename matches what's in `config.yml`

---

### 2.3 Route DNS to Tunnel
```powershell
.\tunnel-route-dns.bat
```
**OR:**
```powershell
.\cloudflared.exe tunnel route dns whatsapp-tunnel mychatbot.website
.\cloudflared.exe tunnel route dns whatsapp-tunnel www.mychatbot.website
```

**What happens:**
- Creates CNAME records in Cloudflare DNS
- Routes `mychatbot.website` → tunnel
- Routes `www.mychatbot.website` → tunnel

---

## Step 3: Start the Bot Server

### Option A: Test Run (Manual)
```powershell
node index.js
```
Keep this terminal window open. You should see:
```
🚀 WhatsApp Bot Server running on port 3000
```

### Option B: Start with PM2 (Production - Recommended)
```powershell
pm2 start ecosystem.config.js
```

**Verify it's running:**
```powershell
pm2 status
```
You should see `whatsapp-bot` in the list.

**View logs:**
```powershell
pm2 logs whatsapp-bot
```

---

## Step 4: Start the Cloudflare Tunnel

### Option A: Test Run (Manual)
```powershell
.\tunnel-run.bat
```
**OR:**
```powershell
.\cloudflared.exe tunnel --config config.yml run
```

Keep this terminal window open. You should see:
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at:                                         |
|  https://mychatbot.website                                                                |
+--------------------------------------------------------------------------------------------+
```

### Option B: Start with PM2 (Production - Recommended)
```powershell
pm2 start ecosystem.config.js
```

This will start both `whatsapp-bot` AND `cloudflared-tunnel` automatically.

**Verify both are running:**
```powershell
pm2 status
```
You should see both:
- `whatsapp-bot`
- `cloudflared-tunnel`

**View tunnel logs:**
```powershell
pm2 logs cloudflared-tunnel
```

---

## Step 5: Verify Everything Works

### 5.1 Check PM2 Status
```powershell
pm2 status
```
Both services should show `online` status.

### 5.2 Check Bot Server
```powershell
# Test localhost
curl http://localhost:3000/api/test
```
Should return: `{"status":"ok",...}`

### 5.3 Check Tunnel Connection
```powershell
pm2 logs cloudflared-tunnel --lines 20
```
Should show: `Connection established` or similar success messages.

### 5.4 Visit Your Website
Open browser and visit:
- **https://mychatbot.website**
- **https://www.mychatbot.website**

Both should load your chatbot dashboard.

---

## Step 6: Save PM2 Configuration (Optional - Auto-start on Reboot)

To make everything start automatically after PC restart:

```powershell
# Save current PM2 processes
pm2 save

# Setup PM2 to start on boot (run as Administrator)
pm2 startup
# Then run the command it outputs (will look like):
# pm2 startup windows -u User --hp C:\Users\User
```

---

## Quick Reference Commands

### Start Everything
```powershell
pm2 start ecosystem.config.js
```

### Stop Everything
```powershell
pm2 stop all
```

### Restart Everything
```powershell
pm2 restart all
```

### View All Logs
```powershell
pm2 logs
```

### View Specific Service Logs
```powershell
pm2 logs whatsapp-bot
pm2 logs cloudflared-tunnel
```

### Check Status
```powershell
pm2 status
```

### Delete All Processes
```powershell
pm2 delete all
```

---

## Troubleshooting

### Bot Not Starting?
```powershell
# Check logs
pm2 logs whatsapp-bot --err

# Restart
pm2 restart whatsapp-bot
```

### Tunnel Not Connecting?
```powershell
# Check tunnel logs
pm2 logs cloudflared-tunnel --err

# Verify credentials file exists
Test-Path "C:\Users\User\.cloudflared\0dd3a8c3-9a5b-4bb0-8ba6-967a1d1052ef.json"

# Verify config.yml path is correct
Get-Content config.yml
```

### Port 3000 Already in Use?
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace <PID> with actual PID)
taskkill /F /PID <PID>
```

### Website Not Loading?
1. Check DNS propagation: `nslookup mychatbot.website`
2. Verify tunnel is running: `pm2 logs cloudflared-tunnel`
3. Verify bot is running: `pm2 logs whatsapp-bot`
4. Check Cloudflare dashboard for DNS records

---

## Summary Checklist

- [ ] Step 1: Created `.env` file with `GEMINI_API_KEY`
- [ ] Step 2.1: Authenticated with Cloudflare (`tunnel login`)
- [ ] Step 2.2: Created tunnel (`tunnel create whatsapp-tunnel`)
- [ ] Step 2.2: Updated `config.yml` with correct credentials path
- [ ] Step 2.3: Routed DNS (`tunnel route dns`)
- [ ] Step 3: Started bot server (PM2 or manual)
- [ ] Step 4: Started tunnel (PM2 or manual)
- [ ] Step 5: Verified website loads at https://mychatbot.website
- [ ] Step 6: (Optional) Set up PM2 auto-start

---

## Next Steps After Setup

1. **Access Dashboard:** Visit https://mychatbot.website
2. **Scan QR Code:** Connect your WhatsApp account
3. **Test Bot:** Send a message to your WhatsApp number
4. **Monitor Logs:** Use `pm2 logs` to watch for issues

---

**Need Help?** Check the troubleshooting section or review the logs with `pm2 logs`.










