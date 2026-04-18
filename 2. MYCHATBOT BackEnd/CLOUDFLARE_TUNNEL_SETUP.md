# Cloudflare Named Tunnel Setup Guide

This guide will help you set up a Cloudflare Named Tunnel for your domain `mychatbot.website`.

## Prerequisites

1. Your domain `mychatbot.website` must be added to Cloudflare
2. Your domain's nameservers must be pointing to Cloudflare
3. `cloudflared` must be installed on your system

## Step 1: Authenticate with Cloudflare

Open PowerShell and run:

```powershell
cloudflared tunnel login
```

This will:
- Open your browser
- Ask you to log in to Cloudflare
- Ask you to select your domain (`mychatbot.website`)
- Save credentials to `C:\Users\Acer\.cloudflared\cert.pem`

## Step 2: Create the Named Tunnel

Create a tunnel named `whatsapp-tunnel`:

```powershell
cloudflared tunnel create whatsapp-tunnel
```

This will:
- Create the tunnel in your Cloudflare account
- Generate a tunnel ID
- Save credentials to `C:\Users\Acer\.cloudflared\<tunnel-id>.json`

**Important:** After running this command, you'll see output like:
```
Tunnel credentials written to C:\Users\Acer\.cloudflared\<tunnel-id>.json
```

You need to update `config.yml` with the correct path to this JSON file.

## Step 3: Update config.yml

After creating the tunnel, update the `credentials-file` path in `config.yml`:

1. Find the tunnel ID from the output (or run `cloudflared tunnel list`)
2. Update `config.yml` line 2:
   ```yaml
   credentials-file: C:\Users\Acer\.cloudflared\<tunnel-id>.json
   ```
   Replace `<tunnel-id>` with the actual tunnel ID.

## Step 4: Route DNS

Route your domain to the tunnel:

```powershell
cloudflared tunnel route dns whatsapp-tunnel mychatbot.website
```

This creates a DNS record (CNAME) pointing `mychatbot.website` to your tunnel.

If you also want to route `www.mychatbot.website`:

```powershell
cloudflared tunnel route dns whatsapp-tunnel www.mychatbot.website
```

## Step 5: Test the Tunnel

Test the tunnel configuration:

```powershell
cloudflared tunnel --config config.yml run
```

You should see output like:
```
2024-01-XX INFO +--------------------------------------------------------------------------------------------+
2024-01-XX INFO |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
2024-01-XX INFO |  https://mychatbot.website                                                               |
2024-01-XX INFO +--------------------------------------------------------------------------------------------+
```

If you see errors, check:
- The credentials file path in `config.yml` is correct
- Your domain is properly configured in Cloudflare
- The bot server is running on `localhost:3000`

## Step 6: Run with PM2

### Option A: Run Both Bot and Tunnel with PM2

Start both services:

```powershell
pm2 start ecosystem.config.js
```

This will start:
- `whatsapp-bot` - Your Node.js bot server
- `cloudflared-tunnel` - The Cloudflare tunnel

### Option B: Run Tunnel Only with PM2

If you're already running the bot separately:

```powershell
pm2 start cloudflared --name cloudflared-tunnel -- tunnel --config config.yml run
```

### PM2 Management Commands

```powershell
# View status
pm2 status

# View logs
pm2 logs cloudflared-tunnel
pm2 logs whatsapp-bot

# Restart tunnel
pm2 restart cloudflared-tunnel

# Stop tunnel
pm2 stop cloudflared-tunnel

# Delete tunnel from PM2
pm2 delete cloudflared-tunnel

# Save PM2 configuration (survives reboots)
pm2 save
pm2 startup
```

## Troubleshooting

### Tunnel won't start
- Check that `config.yml` has the correct credentials file path
- Verify the tunnel exists: `cloudflared tunnel list`
- Check Cloudflare dashboard for tunnel status

### DNS not resolving
- Wait 5-10 minutes for DNS propagation
- Check Cloudflare DNS dashboard for the CNAME record
- Verify nameservers are pointing to Cloudflare

### Connection refused
- Ensure bot server is running on `localhost:3000`
- Check firewall isn't blocking port 3000
- Verify tunnel is running: `pm2 logs cloudflared-tunnel`

### Socket.io not connecting
- Check browser console for errors
- Verify CORS settings in `index.js`
- Ensure both bot server and tunnel are running

## Useful Commands

```powershell
# List all tunnels
cloudflared tunnel list

# Delete a tunnel (if needed)
cloudflared tunnel delete whatsapp-tunnel

# View tunnel info
cloudflared tunnel info whatsapp-tunnel
```














