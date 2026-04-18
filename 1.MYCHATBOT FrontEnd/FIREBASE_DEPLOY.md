# Deploy Frontend to Firebase Hosting

**Live URL after deploy:** https://chatbot20-21e3a.web.app

## 1. Fix login after deploy (Firebase Auth) — do this if login fails

If users see **"Login failed"** or **"unauthorized domain"** on the deployed site:

1. Open [Firebase Console](https://console.firebase.google.com/) → project **chatbot20-21e3a**.
2. Go to **Authentication** → **Settings** → **Authorized domains**.
3. Ensure these domains are listed:
   - `localhost` (for local dev)
   - `chatbot20-21e3a.web.app`
   - `chatbot20-21e3a.firebaseapp.com`
   - If you use a custom domain for the app: add it (e.g. `mychatbot.website`, `www.mychatbot.website`).
4. Save.

Without the Hosting domain in Authorized domains, Firebase Auth (email/password login) will block sign-in.

## 2. Build and deploy

From the **frontend** folder (`1.MYCHATBOT FrontEnd`):

```bash
# Install deps if needed
npm install

# Build (uses .env.production → VITE_API_BASE_URL=https://www.mychatbot.website)
npm run build

# Deploy to Firebase Hosting
npx firebase deploy --only hosting
```

Or use the npm script:

```bash
npm run build && npx firebase deploy --only hosting
```

## 3. Backend URL (login / Dashboard API)

The built app uses **VITE_API_BASE_URL** from `.env.production` (default `https://www.mychatbot.website`). So:

- **Local login** (e.g. admin@rdp.com) and **Dashboard** call your backend at that URL. Ensure the backend (and tunnel, if used) is running and reachable at that URL.
- To use a different backend URL, edit `.env.production` and rebuild/redeploy.

## 4. Local login vs Firebase login

- **admin@rdp.com** → always uses backend `/api/auth/login` (no Firebase Auth).
- Other emails → try backend first, then Firebase Auth. Backend must be reachable (VITE_API_BASE_URL) for local login; Firebase Auth requires the Hosting domain to be authorized (step 1).
