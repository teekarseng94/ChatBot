# Fix Cloudflare Tunnel Error 1033

## What is Error 1033?

Error 1033 means **Cloudflare cannot resolve your tunnel**. This happens when:
- The tunnel process is not running
- The tunnel is not properly authenticated
- The credentials file is missing or incorrect
- The tunnel lost connection to Cloudflare

## Quick Fix

### Option 1: Automated Fix (Recommended)
1. **Double-click `fix-tunnel-error-1033.bat`**
   - This will automatically diagnose and fix the issue
   - It will restart the tunnel and check all configurations

2. **Wait 30-60 seconds** for the tunnel to connect

3. **Visit https://mychatbot.website**

### Option 2: Verify Setup First
1. **Double-click `verify-tunnel-setup.bat`**
   - This checks all components without making changes
   - Shows you what's wrong

2. **Fix any issues it finds**

3. **Then run `fix-tunnel-error-1033.bat`**

## Manual Fix Steps

### Step 1: Check if Tunnel is Running

```powershell
pm2 status
```

You should see `cloudflared-tunnel` with status `online`. If not, continue.

### Step 2: Check Tunnel Logs

```powershell
pm2 logs cloudflared-tunnel --lines 50
```

Look for:
- ✅ **Good signs**: "Connection established", "Connected", "Ready"
- ❌ **Bad signs**: "authentication failed", "credentials not found", "connection refused"

### Step 3: Verify Credentials File

Check if the credentials file exists:
```powershell
Test-Path "C:\Users\User\.cloudflared\38ecb120-77ef-43e3-9ab3-e16b8c8f481e.json"
```

If it doesn't exist, you need to:
1. **Authenticate**: Run `tunnel-login.bat`
2. **Create tunnel**: Run `tunnel-create.bat`
3. **Update config.yml** with the correct credentials path

### Step 4: Restart the Tunnel

```powershell
# Stop tunnel
pm2 stop cloudflared-tunnel
pm2 delete cloudflared-tunnel

# Start tunnel
pm2 start ecosystem.config.js --only cloudflared-tunnel

# Check status
pm2 status
pm2 logs cloudflared-tunnel
```

### Step 5: Verify DNS Routing

Make sure DNS is routed to your tunnel:
```powershell
.\cloudflared.exe tunnel route dns whatsapp-tunnel mychatbot.website
```

Or check in Cloudflare dashboard:
1. Go to Cloudflare Dashboard
2. Select your domain `mychatbot.website`
3. Go to DNS → Records
4. Look for CNAME record pointing to your tunnel

## Common Issues and Solutions

### Issue 1: Credentials File Not Found

**Error in logs**: `credentials file not found` or `authentication failed`

**Solution**:
1. Run `tunnel-login.bat` to authenticate
2. Run `tunnel-create.bat` to create tunnel
3. Update `config.yml` with correct path:
   ```yaml
   credentials-file: C:\Users\User\.cloudflared\<TUNNEL-ID>.json
   ```

### Issue 2: Tunnel Not Authenticated

**Error in logs**: `not authenticated` or `login required`

**Solution**:
```powershell
.\cloudflared.exe tunnel login
```
Or run `tunnel-login.bat`

### Issue 3: DNS Not Routed

**Error**: Tunnel connects but website doesn't work

**Solution**:
```powershell
.\cloudflared.exe tunnel route dns whatsapp-tunnel mychatbot.website
.\cloudflared.exe tunnel route dns whatsapp-tunnel www.mychatbot.website
```

### Issue 4: Tunnel Keeps Disconnecting

**Symptoms**: Works for a while, then Error 1033 again

**Solutions**:
1. **Check internet connection** - Tunnel needs stable internet
2. **Check firewall** - Allow cloudflared.exe through firewall
3. **Restart tunnel**:
   ```powershell
   pm2 restart cloudflared-tunnel
   ```

### Issue 5: Multiple Tunnel Instances

**Symptoms**: Conflicting connections

**Solution**:
```powershell
# Kill all cloudflared processes
taskkill /F /IM cloudflared.exe /T

# Restart with PM2
pm2 restart cloudflared-tunnel
```

## Complete Reset (If Nothing Works)

If the tunnel is completely broken:

1. **Stop everything**:
   ```powershell
   pm2 stop all
   pm2 delete all
   taskkill /F /IM cloudflared.exe /T
   ```

2. **Re-authenticate**:
   ```powershell
   .\cloudflared.exe tunnel login
   ```

3. **List existing tunnels**:
   ```powershell
   .\cloudflared.exe tunnel list
   ```

4. **Delete old tunnel** (if needed):
   ```powershell
   .\cloudflared.exe tunnel delete whatsapp-tunnel
   ```

5. **Create new tunnel**:
   ```powershell
   .\cloudflared.exe tunnel create whatsapp-tunnel
   ```

6. **Update config.yml** with new credentials path

7. **Route DNS**:
   ```powershell
   .\cloudflared.exe tunnel route dns whatsapp-tunnel mychatbot.website
   ```

8. **Start with PM2**:
   ```powershell
   pm2 start ecosystem.config.js
   ```

## Verification Checklist

After fixing, verify:

- [ ] `pm2 status` shows `cloudflared-tunnel` as `online`
- [ ] `pm2 logs cloudflared-tunnel` shows "Connection established"
- [ ] Credentials file exists at path in `config.yml`
- [ ] DNS record exists in Cloudflare dashboard
- [ ] Bot server is running on port 3000
- [ ] Website https://mychatbot.website loads (not Error 1033)

## Still Having Issues?

1. **Check all logs**:
   ```powershell
   pm2 logs cloudflared-tunnel --lines 100
   pm2 logs whatsapp-bot --lines 100
   ```

2. **Test tunnel manually** (without PM2):
   ```powershell
   .\cloudflared.exe tunnel --config config.yml run
   ```
   Keep this window open and watch for errors

3. **Check Cloudflare Dashboard**:
   - Go to Zero Trust → Networks → Tunnels
   - Check if your tunnel shows as "Connected"

4. **Contact Support**:
   - Cloudflare Community: https://community.cloudflare.com
   - Include logs and error messages

