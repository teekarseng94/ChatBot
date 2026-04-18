# Fix 502 Bad Gateway Error for Landing Page

## Problem
Getting "502 Bad Gateway" error on https://mychatbot.website/

## Cause
The Cloudflare tunnel is working, but the Vite dev server for the landing page (port 3001) is not running.

## Solution

### Option 1: Start the Dev Server Manually (Quick Fix)

**Using Batch Script:**
```powershell
cd D:\Mychatbot\Mychatbot
.\start-landing-page.bat
```

**Using PowerShell Script:**
```powershell
cd D:\Mychatbot\Mychatbot
.\start-landing-page.ps1
```

**Or manually:**
```powershell
cd D:\Mychatbot\Mychatbot
npm run dev
```

The server should start on port 3001 and the website should work immediately.

### Option 2: Use PM2 (Recommended for Production)

If you have PM2 installed, you can use the ecosystem config:

1. **Install PM2 (if not already installed):**
   ```powershell
   npm install -g pm2
   ```

2. **Start both servers with PM2:**
   ```powershell
   cd D:\Mychatbot
   pm2 start ecosystem.config.js
   ```

3. **Check status:**
   ```powershell
   pm2 status
   ```

4. **View logs:**
   ```powershell
   pm2 logs landing-page
   ```

5. **Save PM2 configuration (auto-start on reboot):**
   ```powershell
   pm2 save
   pm2 startup
   ```

### Option 3: Check if Server is Already Running

If you think the server might already be running but not responding:

1. **Check if port 3001 is in use:**
   ```powershell
   netstat -ano | findstr :3001
   ```

2. **If a process is using it, check what it is:**
   ```powershell
   Get-NetTCPConnection -LocalPort 3001 | Select-Object OwningProcess
   ```

3. **Kill the process if needed:**
   ```powershell
   # Find the PID from step 2, then:
   taskkill /PID <PID> /F
   ```

## Verification

After starting the server, verify:

1. **Local access:**
   - Open http://localhost:3001 in your browser
   - Should see the landing page

2. **Cloudflare tunnel access:**
   - Open https://mychatbot.website
   - Should see the landing page (no 502 error)

## Troubleshooting

### Port Already in Use
If you get "port 3001 already in use":
```powershell
# Find the process
netstat -ano | findstr :3001

# Kill it (replace <PID> with the actual process ID)
taskkill /PID <PID> /F
```

### Server Starts but Still 502
1. Check Cloudflare tunnel is running:
   ```powershell
   # In Mychatbot Backend folder
   cloudflared tunnel run whatsapp-tunnel
   ```

2. Verify config.yml has correct port:
   ```yaml
   - hostname: mychatbot.website
     service: http://localhost:3001
   ```

3. Check firewall isn't blocking port 3001

### Server Crashes Immediately
1. Check for errors in the terminal
2. Verify all dependencies are installed:
   ```powershell
   cd D:\Mychatbot\Mychatbot
   npm install
   ```

3. Check Node.js version (should be 16+):
   ```powershell
   node --version
   ```

## Auto-Start on Boot (Optional)

To automatically start the landing page server when Windows boots:

1. **Using PM2 (Recommended):**
   ```powershell
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

2. **Using Task Scheduler:**
   - Create a task that runs `start-landing-page.bat` on system startup
   - Set working directory to `D:\Mychatbot\Mychatbot`

## Current Configuration

- **Landing Page:** Port 3001 (Mychatbot folder)
- **Backend/Portal:** Port 3000 (Mychatbot Backend folder)
- **Cloudflare Tunnel:** Routes mychatbot.website → localhost:3001


