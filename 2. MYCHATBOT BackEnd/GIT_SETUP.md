# Git Setup Guide

This guide will help you initialize Git in your project so you can work on it from multiple PCs.

## Quick Setup

1. **Initialize Git Repository**
   ```bash
   git init
   ```

2. **Configure Git Identity (Required First Time)**
   
   You need to set your name and email for Git commits. Choose one:
   
   **Option A: For this repository only**
   ```bash
   git config user.name "Your Name"
   git config user.email "your.email@example.com"
   ```
   
   **Option B: For all repositories (global)**
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

3. **Add all files (respecting .gitignore)**
   ```bash
   git add .
   ```

4. **Create initial commit**
   ```bash
   git commit -m "Initial commit: WhatsApp Assistant Pro project"
   ```

4. **Set up remote repository (optional but recommended)**
   - Create a new repository on GitHub, GitLab, or Bitbucket
   - Add the remote:
     ```bash
     git remote add origin YOUR_REPO_URL
     ```
   - Push your code:
     ```bash
     git push -u origin main
     ```
     (If your default branch is `master`, use `git push -u origin master`)

## What's Excluded (.gitignore)

The following files/folders are excluded from Git:
- `node_modules/` - Dependencies (install with `npm install`)
- `sessions/` - WhatsApp session data (user-specific)
- `settings.json` - User settings
- `chatbot20-21e3a-firebase-adminsdk-*.json` - Firebase credentials (sensitive!)
- `.env` files - Environment variables
- `cloudflared.exe` - Executable (download separately)
- Build artifacts and logs

## Important Notes

⚠️ **Before pushing to a remote repository:**
1. Make sure your Firebase service account key is NOT committed (it's in .gitignore)
2. Review `config.yml` - it contains user-specific paths that may need adjustment on other PCs
3. Create a `config.yml.example` template if you want to share configuration structure

## Working on Another PC - Complete Guide

### Part 1: On Your Current PC (First Time Setup)

#### Step 1: Create a Remote Repository

1. **Choose a Git hosting service:**
   - **GitHub**: https://github.com (most popular)
   - **GitLab**: https://gitlab.com
   - **Bitbucket**: https://bitbucket.org

2. **Create a new repository:**
   - Sign in to your chosen service
   - Click "New Repository" or "Create Repository"
   - Name it (e.g., `whatsapp-assistant-pro`)
   - **DO NOT** initialize with README, .gitignore, or license (you already have these)
   - Click "Create Repository"

3. **Connect your local repository to the remote:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/whatsapp-assistant-pro.git
   ```
   (Replace with your actual repository URL)

4. **Push your code:**
   ```bash
   git branch -M main
   git push -u origin main
   ```
   (If you get an error about authentication, see "Authentication Setup" below)

#### Step 2: Prepare Files to Copy Manually

Before moving to another PC, note these files that need to be copied separately (they're excluded from Git):

- `chatbot20-21e3a-firebase-adminsdk-fbsvc-379022f43e.json` - Firebase credentials
- `settings.json` - Your settings (if you want to keep them)
- `sessions/` folder - WhatsApp session data (optional, you can start fresh)

**Tip**: Store these securely (USB drive, cloud storage, or password manager)

---

### Part 2: On Your Other PC

#### Step 1: Install Prerequisites

1. **Install Node.js** (if not already installed):
   - Download from: https://nodejs.org/
   - Install the LTS version
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **Install Git** (if not already installed):
   - Download from: https://git-scm.com/downloads
   - Verify installation:
     ```bash
     git --version
     ```

#### Step 2: Clone the Repository

1. **Open terminal/PowerShell** on your other PC

2. **Navigate to where you want the project:**
   ```bash
   cd C:\Projects
   # or wherever you want to store it
   ```

3. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/whatsapp-assistant-pro.git
   cd whatsapp-assistant-pro
   ```

#### Step 3: Install Dependencies

```bash
npm install
```

This will install all packages listed in `package.json` (React, Express, Baileys, etc.)

#### Step 4: Set Up Configuration Files

1. **Copy Firebase credentials:**
   - Copy `chatbot20-21e3a-firebase-adminsdk-fbsvc-379022f43e.json` to the project folder
   - Or download it from Firebase Console if you have access

2. **Update `config.yml`:**
   - Open `config.yml` in a text editor
   - Update the `credentials-file` path to match your new PC's user path:
     ```yaml
     credentials-file: C:\Users\YOUR_NEW_USERNAME\.cloudflared\YOUR_TUNNEL_ID.json
     ```
   - Update domain names if needed

3. **Set up Cloudflared (if using tunnels):**
   - Download `cloudflared.exe` from: https://github.com/cloudflare/cloudflared/releases
   - Place it in the project folder
   - Set up your tunnel (see your tunnel setup documentation)

4. **Create `settings.json` (if needed):**
   - This file is user-specific and excluded from Git
   - Create it manually or let the app generate it on first run

#### Step 5: Verify Setup

1. **Check Git status:**
   ```bash
   git status
   ```

2. **Test the installation:**
   ```bash
   npm run dev
   ```
   This should start the development server

---

### Part 3: Daily Workflow (Syncing Changes)

#### On Current PC (Making Changes):

1. **Make your changes** to the code

2. **Stage and commit:**
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

3. **Push to remote:**
   ```bash
   git push
   ```

#### On Other PC (Getting Latest Changes):

1. **Pull latest changes:**
   ```bash
   git pull
   ```

2. **Install any new dependencies (if package.json changed):**
   ```bash
   npm install
   ```

3. **Restart your application:**
   ```bash
   npm run dev
   # or
   npm start
   ```

---

### Authentication Setup (GitHub/GitLab)

If you get authentication errors when pushing/pulling:

**Option 1: Personal Access Token (Recommended)**
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` permissions
3. Use the token as your password when Git prompts for credentials

**Option 2: SSH Keys**
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your.email@example.com"`
2. Add public key to GitHub/GitLab
3. Use SSH URL: `git@github.com:YOUR_USERNAME/whatsapp-assistant-pro.git`

---

### Troubleshooting

**Problem**: `npm install` fails
- **Solution**: Make sure Node.js is installed and you have internet connection

**Problem**: Can't push to remote
- **Solution**: Check your authentication (see "Authentication Setup" above)

**Problem**: Missing Firebase credentials error
- **Solution**: Copy the Firebase service account JSON file to the project folder

**Problem**: WhatsApp session not working
- **Solution**: The `sessions/` folder is excluded from Git. You'll need to scan QR code again on the new PC, or manually copy the sessions folder (not recommended for security)

**Problem**: Config paths are wrong
- **Solution**: Update `config.yml` with paths matching your new PC's user directory

## Common Git Commands

- `git status` - Check repository status
- `git add .` - Stage all changes
- `git commit -m "message"` - Commit changes
- `git push` - Push to remote
- `git pull` - Pull latest changes
- `git branch` - List branches
- `git checkout -b branch-name` - Create new branch

