# Installation & Quick Start Guide

## ✅ Complete File Checklist

Your WhatsApp CRM integration includes:

### Backend Files
- ✅ `server.js` - Main Express server with WebSocket
- ✅ `src/routes/webhook.js` - Webhook handlers (GET & POST)
- ✅ `src/services/waba.js` - WhatsApp Cloud API service
- ✅ `src/services/chatbot.js` - Chatbot integration service
- ✅ `src/services/storage.js` - SQLite database service
- ✅ `src/services/ws.js` - WebSocket service for real-time updates

### Frontend Files
- ✅ `public/whatsapp.html` - Complete CRM interface with:
  - Conversation list (left panel)
  - Message history (right panel)
  - Manual reply input
  - Bot ON/OFF toggle
  - Real-time WebSocket updates

### Configuration Files
- ✅ `package.json` - All dependencies listed
- ✅ `.gitignore` - Updated with data directory
- ✅ `.env.example` - Environment variable template
- ✅ `README.md` - Project documentation
- ✅ `SETUP.md` - Detailed setup guide

## 🚀 Installation Steps

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- express
- dotenv
- cors
- axios
- ws
- sqlite3

### Step 2: Create .env File

Copy `.env.example` to `.env` and update with your credentials:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Or manually create .env with:
ACCESS_TOKEN=EAAuTbgjU8OEBQMerayPKNq7pGtF7ZAHZC0g6zpZAZBpwBStZALaUMLLE2gJJTbL4mJ54CZBdxUMZBbiLI0bObKGNfFqj8U5nvbVT0AYwdbD57Mijo2b8xoh3KSoGm1vx0KSwondDoQLOzZCZAl5GNindKjMoyKuPDtaxJn3DkZBBZBYDbIxSV2IemvitLtaZCse7PN56ZCZCGypRdu8I9ouNdBpiCD7iZBOckrj8YfIpcZCI1Shsob8OMvjJX4kPRRLNdTkagEgdMcfz3Wd7mGRcIfMF2RbYb1MZD
VERIFY_TOKEN=my_secure_verify_token_12345
PHONE_NUMBER_ID=876206532244817
GRAPH_API_VERSION=v20.0
CHATBOT_URL=https://mydomain.com/api/chatbot
PORT=3000
```

### Step 3: Start the Server

```bash
npm start
```

You should see:
```
🚀 WhatsApp CRM Server running on port 3000
📱 Webhook URL: http://localhost:3000/webhook
💬 CRM Interface: http://localhost:3000/whatsapp.html
✅ Connected to SQLite database
✅ Database tables initialized
✅ WebSocket server initialized
```

### Step 4: Configure Meta Webhook

1. **For Local Testing** - Use ngrok:
   ```bash
   ngrok http 3000
   ```
   Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

2. **In Meta Developer Console**:
   - Go to your WhatsApp Business App
   - Navigate to **WhatsApp > Configuration**
   - Under **Webhook**, click **Edit**
   - Enter URL: `https://abc123.ngrok.io/webhook`
   - Enter Verify Token: `my_secure_verify_token_12345` (must match .env)
   - Click **Verify and Save**
   - Subscribe to `messages` field

### Step 5: Test the Integration

1. **Open CRM Interface**:
   ```
   http://localhost:3000/whatsapp.html
   ```

2. **Send a Test Message**:
   - Send a WhatsApp message to your connected number
   - It should appear in the CRM interface
   - If bot is ON, you'll get an automatic reply

3. **Test Manual Reply**:
   - Select a conversation
   - Type a message
   - Click "Send"
   - Message should be sent via WhatsApp

## 🎯 Features Verification

### ✅ Webhook Receives Messages
- Send a WhatsApp message to your number
- Check server logs: `📨 Incoming message from...`
- Message appears in CRM interface

### ✅ Chatbot Auto-Reply
- Toggle Bot ON for a conversation
- Send a message
- Bot should reply automatically

### ✅ Manual Messages
- Type a message in CRM
- Click Send
- Message sent via WhatsApp Cloud API

### ✅ Real-time Updates
- WebSocket connection shows "Connected" in navbar
- New messages appear instantly without refresh

## 🔧 Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### Database errors
- Database auto-creates in `data/` directory
- Ensure write permissions

### Webhook not receiving messages
- Verify ngrok is running
- Check webhook URL in Meta console
- Verify token matches exactly

### Messages not sending
- Check access token is valid
- Verify phone number format (no +, no spaces)
- Check server logs for API errors

## 📞 Next Steps

1. ✅ Install dependencies
2. ✅ Configure .env file
3. ✅ Start server
4. ✅ Set up Meta webhook
5. ✅ Test messaging
6. ✅ Deploy to production (when ready)

---

**Everything is ready!** 🎉 Your WhatsApp CRM is fully functional.

