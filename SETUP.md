# WhatsApp Cloud API CRM - Setup Guide

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- WhatsApp Business API account with access token
- Meta Developer account with WhatsApp Business API configured

## 🚀 Installation

1. **Install Dependencies**

```bash
npm install express dotenv cors axios ws sqlite3
```

Or add to your `package.json`:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "axios": "^1.6.0",
    "ws": "^8.14.2",
    "sqlite3": "^5.1.6"
  }
}
```

2. **Configure Environment Variables**

Create a `.env` file in the root directory:

```env
# WhatsApp Cloud API Configuration
ACCESS_TOKEN=EAAuTbgjU8OEBQMerayPKNq7pGtF7ZAHZC0g6zpZAZBpwBStZALaUMLLE2gJJTbL4mJ54CZBdxUMZBbiLI0bObKGNfFqj8U5nvbVT0AYwdbD57Mijo2b8xoh3KSoGm1vx0KSwondDoQLOzZCZAl5GNindKjMoyKuPDtaxJn3DkZBBZBYDbIxSV2IemvitLtaZCse7PN56ZCZCGypRdu8I9ouNdBpiCD7iZBOckrj8YfIpcZCI1Shsob8OMvjJX4kPRRLNdTkagEgdMcfz3Wd7mGRcIfMF2RbYb1MZD
VERIFY_TOKEN=my_secure_verify_token_12345
PHONE_NUMBER_ID=876206532244817
GRAPH_API_VERSION=v20.0

# Chatbot API Configuration
CHATBOT_URL=https://mydomain.com/api/chatbot
# Alternative: Use Firebase Function
# FIREBASE_FUNCTION_URL=https://your-region-your-project.cloudfunctions.net/autoreply

# Server Configuration
PORT=3000
```

**Important:** Replace the values with your actual credentials:
- `ACCESS_TOKEN`: Your WhatsApp Business API access token
- `VERIFY_TOKEN`: A secure random string (you'll use this in Meta webhook setup)
- `PHONE_NUMBER_ID`: Your WhatsApp Business phone number ID
- `CHATBOT_URL`: Your chatbot API endpoint (or use Firebase function URL)

3. **Start the Server**

```bash
node server.js
```

The server will start on `http://localhost:3000`

## 🔧 Meta Developer Console Setup

### Step 1: Configure Webhook URL

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Select your WhatsApp Business App
3. Navigate to **WhatsApp > Configuration**
4. Under **Webhook**, click **Edit**
5. Enter your webhook URL:
   ```
   https://your-domain.com/webhook
   ```
   For local testing, use a tunneling service like:
   - [ngrok](https://ngrok.com/): `ngrok http 3000`
   - [localtunnel](https://localtunnel.github.io/www/): `lt --port 3000`

6. Enter your **Verify Token** (must match `VERIFY_TOKEN` in `.env`)

### Step 2: Subscribe to Webhook Fields

1. In the same webhook configuration page
2. Click **Manage** next to Webhook fields
3. Subscribe to:
   - `messages`
   - `message_status` (optional, for delivery/read receipts)

### Step 3: Get Your Credentials

1. **Phone Number ID**: Found in WhatsApp > API Setup
2. **Access Token**: Generate a temporary token or use a permanent system user token
3. **Verify Token**: Create your own secure random string

## 📱 Testing the Integration

### Test 1: Webhook Verification

When you save the webhook URL in Meta, it will send a GET request to verify. You should see:
```
✅ Webhook verified
```

### Test 2: Send a Test Message

1. Open `http://localhost:3000/whatsapp.html`
2. The CRM interface should load
3. Wait for a WhatsApp message to be sent to your connected number
4. The message should appear in the CRM interface

### Test 3: Manual Message Sending

1. In the CRM interface, select a conversation
2. Type a message in the input box
3. Click "Send"
4. The message should be sent via WhatsApp Cloud API

### Test 4: Bot Toggle

1. Select a conversation
2. Toggle the "Bot" switch
3. When ON: Incoming messages trigger chatbot replies
4. When OFF: Only manual replies are sent

## 🏗️ Project Structure

```
/project
  /public
    whatsapp.html          # CRM frontend interface
  /src
    /routes
      webhook.js           # Webhook GET/POST handlers
    /services
      waba.js              # WhatsApp Cloud API service
      chatbot.js           # Chatbot integration service
      storage.js           # SQLite database service
      ws.js                # WebSocket service
  /data
    whatsapp_crm.db        # SQLite database (auto-created)
  server.js                # Main Express server
  .env                     # Environment variables
  package.json
```

## 🔌 API Endpoints

### Webhook Endpoints

- `GET /webhook` - Webhook verification (Meta)
- `POST /webhook` - Receive WhatsApp messages

### API Endpoints

- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/:phoneNumber` - Get messages for a conversation
- `POST /api/send-message` - Send a manual message
- `POST /api/conversations/:phoneNumber/toggle-bot` - Toggle bot status

### Frontend

- `GET /whatsapp.html` - CRM interface

## 🐛 Troubleshooting

### Webhook Not Receiving Messages

1. **Check webhook URL is accessible**: Use ngrok or similar for local testing
2. **Verify token matches**: Must match exactly in Meta and `.env`
3. **Check webhook fields**: Ensure `messages` is subscribed
4. **Check server logs**: Look for incoming webhook requests

### Messages Not Sending

1. **Check access token**: Ensure it's valid and not expired
2. **Check phone number ID**: Must match your WhatsApp Business number
3. **Check recipient format**: Phone numbers should be without + and spaces
4. **Check API response**: Look for errors in server logs

### Database Issues

1. **Check data directory**: Ensure `data/` folder exists and is writable
2. **Check SQLite**: Database file is created automatically
3. **Reset database**: Delete `data/whatsapp_crm.db` to start fresh

### WebSocket Not Connecting

1. **Check server is running**: WebSocket runs on same port as HTTP
2. **Check browser console**: Look for WebSocket connection errors
3. **Check firewall**: Ensure WebSocket port is not blocked

## 🔒 Security Notes

1. **Never commit `.env` file**: Add to `.gitignore`
2. **Use HTTPS in production**: WebSocket requires secure connection
3. **Rotate access tokens**: Regularly update your access tokens
4. **Validate webhook requests**: Consider adding request signature validation

## 📚 Additional Resources

- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta for Developers](https://developers.facebook.com/)
- [Webhook Setup Guide](https://developers.facebook.com/docs/graph-api/webhooks)

## 🆘 Support

If you encounter issues:
1. Check server logs for error messages
2. Verify all environment variables are set correctly
3. Test webhook with Meta's webhook tester
4. Check WhatsApp Business API status

---

**Ready to go!** 🚀 Your WhatsApp CRM is now set up and ready to receive and send messages.


