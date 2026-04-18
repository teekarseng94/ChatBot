# PM2 Troubleshooting Guide

## Error: `connect EPERM //./pipe/rpc.sock`

This is a common Windows PM2 issue where the PM2 daemon socket file has permission problems or is locked.

### ⚠️ If Some Processes Can't Be Killed (Access Denied):

**Solution 1: Run as Administrator (Recommended)**

1. **Right-click PowerShell** → "Run as Administrator"
2. Navigate to your project:
   ```powershell
   cd "C:\Users\Acer\Desktop\Vibe Coding'\7. whatsapp-assistant-pro"
   ```
3. Run the force fix:
   ```powershell
   .\force-fix-pm2.ps1
   ```
   Or use the batch file:
   ```powershell
   .\fix-pm2-admin.bat
   ```

**Solution 2: Use Alternative Start Method (No PM2)**

If PM2 keeps having issues, use the direct start script:
```powershell
.\start-bot.bat
```
This runs your bot directly without PM2 (but won't auto-restart if it crashes).

**Solution 3: Restart Your Computer**

Sometimes Windows locks files until reboot. Restart your computer, then try PM2 again.

### Quick Fix (If No Access Denied Errors):

**Run the fix script:**
```powershell
.\fix-pm2.bat
```

Then restart your bot:
```powershell
.\pm2.bat start index.js --name whatsapp-system
```

---

## Manual Fix Steps:

### Method 1: Kill PM2 Processes

1. **Close all terminal windows** running PM2

2. **Kill Node processes:**
   ```powershell
   taskkill /F /IM node.exe
   ```
   ⚠️ **Warning:** This kills ALL Node.js processes. Make sure you're okay with that.

3. **Wait 5 seconds**, then restart PM2:
   ```powershell
   .\pm2.bat start index.js --name whatsapp-system
   ```

### Method 2: Delete PM2 Socket Files

1. **Close all terminals**

2. **Delete socket files:**
   ```powershell
   Remove-Item "$env:USERPROFILE\.pm2\*.sock" -Force -ErrorAction SilentlyContinue
   ```

3. **Restart PM2:**
   ```powershell
   .\pm2.bat start index.js --name whatsapp-system
   ```

### Method 3: Reset PM2 Completely

1. **Stop all PM2 processes:**
   ```powershell
   .\pm2.bat kill
   ```

2. **Delete PM2 folder** (⚠️ This removes all PM2 config):
   ```powershell
   Remove-Item "$env:USERPROFILE\.pm2" -Recurse -Force -ErrorAction SilentlyContinue
   ```

3. **Restart PM2:**
   ```powershell
   .\pm2.bat start index.js --name whatsapp-system
   ```

### Method 4: Run as Administrator

Sometimes PM2 needs admin privileges:

1. **Right-click PowerShell** → "Run as Administrator"

2. **Navigate to project:**
   ```powershell
   cd "C:\Users\Acer\Desktop\Vibe Coding'\7. whatsapp-assistant-pro"
   ```

3. **Start PM2:**
   ```powershell
   .\pm2.bat start index.js --name whatsapp-system
   ```

---

## Prevention Tips:

1. **Always stop PM2 properly:**
   ```powershell
   .\pm2.bat stop whatsapp-system
   .\pm2.bat kill
   ```

2. **Don't force-close terminals** while PM2 is running

3. **Use PM2 commands** instead of killing Node processes manually

---

## Check if PM2 is Running:

```powershell
.\pm2.bat list
```

If this works, PM2 is fine. If you get the EPERM error, use one of the fix methods above.

---

## Alternative: Use npx (Bypasses PM2 Daemon)

If PM2 keeps having issues, you can use npx which doesn't use a daemon:

```powershell
npx pm2 start index.js --name whatsapp-system --no-daemon
```

However, this won't persist after closing the terminal. For production, fix the PM2 issue instead.

---

## Still Having Issues?

1. **Check Windows Event Viewer** for permission errors
2. **Run PowerShell as Administrator** and try again
3. **Restart your computer** (sometimes Windows locks files until reboot)
4. **Check antivirus** - some antivirus software blocks socket files

