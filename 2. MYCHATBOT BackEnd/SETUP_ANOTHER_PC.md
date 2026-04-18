# Quick Guide: Setting Up Project on Another PC

## Quick Checklist

### On Current PC (First Time):
- [ ] Create GitHub/GitLab repository
- [ ] Push code: `git push -u origin main`
- [ ] Copy Firebase credentials file (save securely)
- [ ] Note your config.yml settings

### On New PC:
- [ ] Install Node.js (https://nodejs.org/)
- [ ] Install Git (https://git-scm.com/)
- [ ] Clone repository: `git clone YOUR_REPO_URL`
- [ ] Install dependencies: `npm install`
- [ ] Copy Firebase credentials to project folder
- [ ] Update `config.yml` with new PC paths
- [ ] Download `cloudflared.exe` if needed
- [ ] Run: `npm run dev`

## Essential Commands

```bash
# Clone repository
git clone YOUR_REPO_URL
cd whatsapp-assistant-pro

# Install dependencies
npm install

# Get latest changes
git pull

# Make and push changes
git add .
git commit -m "Your message"
git push
```

## Files You Need to Copy Manually

These are excluded from Git for security:
- `chatbot20-21e3a-firebase-adminsdk-*.json` (Firebase credentials)
- `settings.json` (optional, can start fresh)
- `sessions/` folder (optional, will need to re-scan QR code)

## Need Help?

See `GIT_SETUP.md` for detailed instructions.

