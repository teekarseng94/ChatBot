# Current Setup Status

## ✅ What's Working

1. **Cloudflared Installation**
   - ✓ `cloudflared.exe` is in the project folder
   - ✓ `cloudflared.bat` wrapper is working
   - ✓ Version: 2025.11.1

2. **Project Files**
   - ✓ `config.yml` is configured for `mychatbot.website`
   - ✓ `index.js` is set up with multi-client support
   - ✓ `public/index.html` uses relative paths for Socket.io (tunnel-compatible)
   - ✓ `ecosystem.config.js` is configured for PM2

3. **Helper Scripts Created**
   - ✓ `tunnel-login.bat` - Authenticate with Cloudflare
   - ✓ `tunnel-create.bat` - Create the named tunnel
   - ✓ `tunnel-route-dns.bat` - Route DNS for your domain
   - ✓ `tunnel-run.bat` - Test run the tunnel
   - ✓ `setup-cloudflared-tunnel.ps1` - Automated setup script

## 🔧 What Needs to Be Done

### Step 1: Authenticate Cloudflare
**Run this command:**
```powershell
.\tunnel-login.bat
```
Or double-click `tunnel-login.bat`

This will:
- Open your browser
- Ask you to log in to Cloudflare
- Select domain: `mychatbot.website`
- Save credentials to `C:\Users\Acer\.cloudflared\`

### Step 2: Create the Named Tunnel
**Run this command:**
```powershell
.\tunnel-create.bat
```
Or double-click `tunnel-create.bat`

**⚠️ IMPORTANT:** After running this, note the **Tunnel ID** from the output. You may need to update `config.yml` line 2:
```yaml
credentials-file: C:\Users\Acer\.cloudflared\<TUNNEL-ID>.json
```

### Step 3: Route DNS
**Run this command:**
```powershell
.\tunnel-route-dns.bat
```
Or double-click `tunnel-route-dns.bat`

This routes both `mychatbot.website` and `www.mychatbot.website` to your tunnel.

### Step 4: Start Your Bot
Make sure your bot server is running:
```powershell
node index.js
```
Or with PM2:
```powershell
pm2 start index.js --name whatsapp-bot
```

### Step 5: Test the Tunnel
**Run this command:**
```powershell
.\tunnel-run.bat
```
Or double-click `tunnel-run.bat`

Keep this window open. You should see the tunnel connecting.

### Step 6: Production Setup (PM2)
Once everything works, start both with PM2:
```powershell
pm2 start ecosystem.config.js
```

## 📋 Quick Reference

### Check Tunnel Status
```powershell
.\cloudflared.bat tunnel list
```

### Check if Bot is Running
```powershell
netstat -ano | findstr :3000
```

### View PM2 Logs
```powershell
pm2 logs whatsapp-bot
pm2 logs cloudflared-tunnel
```

### Visit Your Domain
- https://mychatbot.website
- https://www.mychatbot.website

## 🐛 Troubleshooting

### "cloudflared not recognized"
- Use the batch files: `.\tunnel-login.bat` instead of `cloudflared tunnel login`
- Or use: `.\cloudflared.bat tunnel login`

### "Unable to reach origin service"
- Make sure your bot is running: `node index.js`
- Check port 3000: `netstat -ano | findstr :3000`

### "Tunnel not found"
- Run `.\tunnel-create.bat` first
- Check existing tunnels: `.\cloudflared.bat tunnel list`

### "Credentials file not found"
- After creating the tunnel, check the output for the Tunnel ID
- Update `config.yml` line 2 with the correct path

### QR Code Not Showing
- Make sure the bot server is running
- Check Socket.io connection in browser console (F12)
- Verify the tunnel is running and accessible

## 📁 File Structure

```
project/
├── cloudflared.exe          # Cloudflare tunnel executable
├── cloudflared.bat          # Wrapper script
├── config.yml               # Tunnel configuration
├── tunnel-login.bat         # Authenticate with Cloudflare
├── tunnel-create.bat         # Create named tunnel
├── tunnel-route-dns.bat      # Route DNS
├── tunnel-run.bat            # Test run tunnel
├── setup-cloudflared-tunnel.ps1  # Automated setup
├── index.js                  # Main bot server
├── ecosystem.config.js       # PM2 configuration
└── public/
    └── index.html            # Dashboard UI
```

## 🎯 Next Steps

1. Run `.\tunnel-login.bat` to authenticate
2. Run `.\tunnel-create.bat` to create the tunnel
3. Update `config.yml` if needed (check Tunnel ID)
4. Run `.\tunnel-route-dns.bat` to route DNS
5. Start your bot: `node index.js`
6. Test tunnel: `.\tunnel-run.bat`
7. Once working, use PM2: `pm2 start ecosystem.config.js`
