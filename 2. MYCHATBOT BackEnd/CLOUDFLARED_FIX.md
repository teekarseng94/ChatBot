# Cloudflare Tunnel Setup - Fixed Commands

## The Problem
The `cloudflared` command is not recognized in PowerShell because it's not in your system PATH. However, we have `cloudflared.exe` in the project folder and a `cloudflared.bat` wrapper.

## Solution: Use the Batch Files

I've created simple batch files that you can double-click or run from PowerShell:

### Step 1: Authenticate with Cloudflare
**Double-click:** `tunnel-login.bat`
**Or run in PowerShell:**
```powershell
.\tunnel-login.bat
```

This will:
- Open your browser
- Ask you to log in to Cloudflare
- Select your domain: `mychatbot.website`
- Save authentication credentials

### Step 2: Create the Named Tunnel
**Double-click:** `tunnel-create.bat`
**Or run in PowerShell:**
```powershell
.\tunnel-create.bat
```

This creates a tunnel named `whatsapp-tunnel` and saves the credentials.

**⚠️ IMPORTANT:** After this step, note the **Tunnel ID** from the output. You may need to update `config.yml` line 2 with the correct credentials file path:
```yaml
credentials-file: C:\Users\Acer\.cloudflared\<TUNNEL-ID>.json
```

### Step 3: Route DNS
**Double-click:** `tunnel-route-dns.bat`
**Or run in PowerShell:**
```powershell
.\tunnel-route-dns.bat
```

This routes both `mychatbot.website` and `www.mychatbot.website` to your tunnel.

### Step 4: Test the Tunnel
**Double-click:** `tunnel-run.bat`
**Or run in PowerShell:**
```powershell
.\tunnel-run.bat
```

This starts the tunnel. You should see it connecting. Keep this window open.

### Step 5: Run with PM2 (Production)

Once everything works, you can run both the bot and tunnel with PM2:

```powershell
pm2 start ecosystem.config.js
```

Or if PM2 is not in PATH:
```powershell
.\pm2.bat start ecosystem.config.js
```

## Alternative: Use PowerShell Script

You can also run the automated setup script:
```powershell
.\setup-cloudflared-tunnel.ps1
```

## Verify Setup

1. **Check if tunnel is running:**
   ```powershell
   pm2 logs cloudflared-tunnel
   ```

2. **Visit your domain:**
   - https://mychatbot.website
   - Should show your dashboard

3. **Check DNS:**
   ```powershell
   nslookup mychatbot.website
   ```

## Troubleshooting

**"cloudflared not found":**
- Make sure `cloudflared.exe` is in the project folder
- Use the batch files provided

**"Unable to reach origin service":**
- Make sure your bot is running: `node index.js` or `pm2 logs whatsapp-bot`
- Check port 3000 is accessible

**"Tunnel not found":**
- Run `.\tunnel-create.bat` first
- Check `.\cloudflared.bat tunnel list` to see existing tunnels

**"Credentials file not found":**
- After creating the tunnel, check the output for the Tunnel ID
- Update `config.yml` line 2 with the correct path:
  ```yaml
  credentials-file: C:\Users\Acer\.cloudflared\<TUNNEL-ID>.json
  ```
