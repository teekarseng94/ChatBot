# Quick Start: Cloudflare Named Tunnel

## Quick Setup (Automated)

Run the PowerShell script:
```powershell
.\setup-tunnel.ps1
```

## Manual Setup (Step-by-Step)

### 1. Authenticate with Cloudflare
```powershell
cloudflared tunnel login
```
- Opens browser → Log in → Select domain `mychatbot.website`

### 2. Create Named Tunnel
```powershell
cloudflared tunnel create whatsapp-tunnel
```
- Creates tunnel and saves credentials
- **Note the Tunnel ID from the output**

### 3. Update config.yml
After creating the tunnel, update line 2 in `config.yml`:
```yaml
credentials-file: C:\Users\Acer\.cloudflared\<TUNNEL-ID>.json
```
Replace `<TUNNEL-ID>` with the actual ID from step 2.

**Or find the tunnel ID:**
```powershell
cloudflared tunnel list
```

### 4. Route DNS
```powershell
# Route main domain
cloudflared tunnel route dns whatsapp-tunnel mychatbot.website

# Route www subdomain (optional)
cloudflared tunnel route dns whatsapp-tunnel www.mychatbot.website
```

### 5. Test the Tunnel
```powershell
cloudflared tunnel --config config.yml run
```

## Run with PM2

### Start Both Bot and Tunnel
```powershell
pm2 start ecosystem.config.js
```

### Start Tunnel Only (if bot is running separately)
```powershell
pm2 start cloudflared --name cloudflared-tunnel -- tunnel --config config.yml run
```

### PM2 Commands
```powershell
# View status
pm2 status

# View logs
pm2 logs cloudflared-tunnel
pm2 logs whatsapp-bot

# Restart
pm2 restart cloudflared-tunnel

# Stop
pm2 stop cloudflared-tunnel

# Save configuration (survives reboots)
pm2 save
pm2 startup
```

## Verify Setup

1. **Check tunnel is running:**
   ```powershell
   pm2 logs cloudflared-tunnel
   ```

2. **Visit your domain:**
   - https://mychatbot.website
   - Should show your dashboard

3. **Check DNS propagation:**
   ```powershell
   nslookup mychatbot.website
   ```
   Should show a Cloudflare CNAME record.

## Troubleshooting

**Tunnel won't start:**
- Verify credentials file path in `config.yml` is correct
- Check: `cloudflared tunnel list`

**DNS not working:**
- Wait 5-10 minutes for propagation
- Check Cloudflare DNS dashboard

**Connection refused:**
- Ensure bot server is running: `pm2 logs whatsapp-bot`
- Check port 3000 is accessible














