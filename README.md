# MyChatBot

A full-stack **WhatsApp AI chatbot** with a marketing landing page and a Node.js backend that connects WhatsApp (via Baileys), Google Gemini AI, and optional Firebase/Firestore.

---

## Repository structure

| Folder | Description |
|--------|-------------|
| **1.MYCHATBOT FrontEnd** | React landing page (Vite + TypeScript). Deployable to Firebase Hosting. |
| **2. MYCHATBOT BackEnd** | WhatsApp bot server (Express, Socket.io, Baileys, Gemini). Supports PM2 and Cloudflare Tunnel. |

---

## 1.MYCHATBOT FrontEnd (Landing page)

Marketing site for the WhatsApp chatbot: hero, features, pricing, dark/light theme.

### Tech stack

- **React 19** + **TypeScript**
- **Vite 6**
- **Firebase** (hosting)
- **Lucide React** (icons)

### Structure

```
1.MYCHATBOT FrontEnd/
├── App.tsx              # Main app + theme state
├── index.html, index.tsx
├── components/
│   ├── Navbar.tsx       # Top nav, mobile drawer, theme toggle
│   ├── Hero.tsx         # Hero + CTA
│   ├── Features.tsx     # Feature grid
│   └── Pricing.tsx      # Pricing plans (Starter, Essential, Growth, Ultimate)
├── config/
├── vite.config.ts      # Port 3001, GEMINI_API_KEY from env
├── firebase.json        # Hosting (dist, SPA rewrites)
└── package.json
```

### Run locally

**Prerequisites:** Node.js

```bash
cd "1.MYCHATBOT FrontEnd"
npm install
```

Optional: set `GEMINI_API_KEY` in `.env.local` if the app uses it.

```bash
npm run dev
```

Dev server: **http://localhost:3001**

### Build and deploy (Firebase)

```bash
npm run build
# Deploy with Firebase CLI (see FIREBASE_DEPLOY_SETUP.md, QUICK_DEPLOY.md in that folder)
```

---

## 2. MYCHATBOT BackEnd (WhatsApp bot server)

Node.js server that:

- Runs **WhatsApp** sessions via **Baileys** (multi-session, QR login).
- Replies using **Google Gemini** (Gemini 2.0 Flash).
- Exposes a **Web UI** and real-time updates via **Socket.io** (QR, status, message log, bot on/off).
- Can log messages and user API keys in **Firebase Firestore**.
- Supports **PM2** and **Cloudflare Tunnel** for production.

### Tech stack

- **Node.js** + **Express 5**
- **Socket.io** (real-time)
- **@whiskeysockets/baileys** (WhatsApp)
- **@google/generative-ai** (Gemini)
- **Firebase Admin** (optional: Firestore)
- **qrcode** / **qrcode-terminal** (QR for WhatsApp)
- **pino** (logging)

### Structure

```
2. MYCHATBOT BackEnd/
├── index.js             # Main entry: SessionManager, Baileys, Gemini, Express, Socket.io
├── server.js            # Alternative modular server (config/settings, config/firebase, ai/geminiService)
├── public/              # Web UI (chat dashboard)
├── sessions/            # Per-user Baileys auth (created at runtime)
├── config.yml.example   # Cloudflare Tunnel (config.yml)
├── .env.example         # GEMINI_API_KEY, PORT, Firebase credentials
├── ecosystem.config.js  # PM2 config
├── firebase.json, firestore.rules, firestore.indexes.json
├── utils/               # e.g. apiKeyEncryption
├── services/            # e.g. geminiService.ts
└── *.bat, *.ps1, *.md   # Scripts and docs (PM2, tunnel, 502 fix, etc.)
```

### Main entry

- **Default:** `npm start` → `node index.js` (single file: sessions, API, Socket.io, Baileys, Gemini).
- **Alternative:** `server.js` is a modular version (requires `config/settings`, `config/firebase`, `ai/geminiService` if present).

### API (from index.js)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Serves `public/index.html` (dashboard) |
| GET | `/api/test` | Health check |
| POST | `/api/auth/login` | Login (admin or Firestore user with API key) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/settings/:userId` | Get user settings |
| POST | `/api/settings/:userId` | Update system instruction (and API key in some setups) |
| GET | `/api/stats` | Session stats |
| POST | `/api/reset-session/:userId` | Reset WhatsApp session (new QR) |

**Socket.io:** `connection_status`, `qr_code`, `message_log`, `bot_status`; client can emit `request_qr`, `toggle_bot`.

### Run locally

**Prerequisites:** Node.js

```bash
cd "2. MYCHATBOT BackEnd"
npm install
```

1. Copy `.env.example` to `.env` and set:
   - `GEMINI_API_KEY` (required for AI replies)
   - Optional: `PORT` (default 3000), `GOOGLE_APPLICATION_CREDENTIALS` or place `serviceAccountKey.json` for Firestore

2. Start:

```bash
npm start
# or: node index.js
```

- Web UI: **http://localhost:3000**
- Open dashboard → connect with userId → scan QR with WhatsApp → bot replies using Gemini.

### Production (PM2 + Cloudflare Tunnel)

- **PM2:** `pm2 start index.js --name whatsapp-bot` (see `ecosystem.config.js`, `AUTO_START_GUIDE.md`, `PM2_TROUBLESHOOTING.md`).
- **Tunnel:** Use `config.yml` (from `config.yml.example`) and Cloudflared to expose the server (see `CLOUDFLARE_TUNNEL_SETUP.md`, `NAMED_TUNNEL_SETUP.md`, `QUICK_START_TUNNEL.md`).
- **502 / errors:** See `FIX_502_ERROR.md`, `fix-502.bat`, `check-and-fix-502.bat`, etc.

### Backend docs (high level)

- Firebase: `FIREBASE_SETUP.md`, `FIREBASE_INTEGRATION_SUMMARY.md`, `FIRESTORE_*`
- Auth/API keys: `ADMIN_API_KEY_SETUP.md`, `FIRESTORE_API_KEY_SETUP.md`, `FIX_FIREBASE_AUTH.md`
- Baileys: `BAILEYS_MIGRATION.md`, `FIX_BAILEYS_MIGRATION.md`
- Tunnel/PM2: `CLOUDFLARED_*`, `PM2_TROUBLESHOOTING.md`, `PRODUCTION_SETUP.md`
- Quick fixes: various `FIX_*.md` and `.bat` scripts

---

## Prerequisites (summary)

- **Node.js** (LTS recommended) for both frontend and backend.
- **Gemini API key** for the backend (and optionally frontend if used).
- **Firebase** (optional): project, service account key, Firestore rules/indexes for backend; Hosting for frontend.
- **Cloudflare** (optional): for exposing the backend via a tunnel.

---

## Quick start (full flow)

1. **Landing page (local):**
   ```bash
   cd "1.MYCHATBOT FrontEnd" && npm install && npm run dev
   ```
   → http://localhost:3001

2. **Bot server (local):**
   ```bash
   cd "2. MYCHATBOT BackEnd" && npm install && copy .env.example .env
   ```
   Edit `.env`: set `GEMINI_API_KEY`.
   ```bash
   npm start
   ```
   → http://localhost:3000 → open dashboard → connect → scan QR → chat.

3. **Production:** Use PM2 and Cloudflare Tunnel (and optionally Firebase Hosting for the frontend) as per the docs in each folder.

---

## License and credits

- Backend uses [Baileys](https://github.com/WhiskeySockets/Baileys) (WhatsApp) and [Google Gemini](https://ai.google.dev/).
- Frontend is a custom React landing page; deploy and branding are up to you.

© 2025 MyChatBot. All rights reserved.
