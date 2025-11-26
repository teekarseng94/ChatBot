# WhatsApp Cloud API CRM

A complete WhatsApp Business API integration with chatbot support, real-time messaging, and CRM interface.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
ACCESS_TOKEN=your_access_token_here
VERIFY_TOKEN=my_secure_verify_token_12345
PHONE_NUMBER_ID=your_phone_number_id_here
GRAPH_API_VERSION=v20.0
CHATBOT_URL=https://mydomain.com/api/chatbot
PORT=3000
```

**Your current credentials are already in `.env.example` - copy it to `.env` and update if needed.**

### 3. Start the Server

```bash
npm start
```

The server will run on `http://localhost:3000`

### 4. Access the CRM Interface

Open your browser and navigate to:
```
http://localhost:3000/whatsapp.html
```

## 📋 Features

✅ **WhatsApp Cloud API Integration**
- Receive messages via webhook
- Send messages via Cloud API
- Support for text, images, videos, audio, and documents

✅ **Chatbot Integration**
- Automatic replies using Gemini AI
- Configurable chatbot endpoint
- Fallback to Firebase Functions

✅ **CRM Interface**
- Real-time conversation list
- Message history per conversation
- Manual message sending
- Bot ON/OFF toggle per conversation
- WebSocket live updates

✅ **Data Storage**
- SQLite database for conversations
- Message history with timestamps
- Bot status per conversation

## 🔧 Meta Developer Setup

### Webhook Configuration

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Select your WhatsApp Business App
3. Navigate to **WhatsApp > Configuration**
4. Under **Webhook**, click **Edit**
5. Enter your webhook URL:
   ```
   https://your-domain.com/webhook
   ```
   For local testing, use [ngrok](https://ngrok.com/):
   ```bash
   ngrok http 3000
   ```
6. Enter your **Verify Token** (must match `VERIFY_TOKEN` in `.env`)
7. Subscribe to `messages` field

### Get Your Credentials

- **Phone Number ID**: Found in WhatsApp > API Setup
- **Access Token**: Generate in Meta Developer Console
- **Verify Token**: Create your own secure random string

## 📁 Project Structure

```
ChatBot/
├── public/
│   └── whatsapp.html          # CRM frontend interface
├── src/
│   ├── routes/
│   │   └── webhook.js         # Webhook GET/POST handlers
│   └── services/
│       ├── waba.js            # WhatsApp Cloud API service
│       ├── chatbot.js         # Chatbot integration
│       ├── storage.js         # SQLite database
│       └── ws.js              # WebSocket service
├── data/                      # SQLite database (auto-created)
├── server.js                  # Main Express server
├── package.json
├── .env                       # Environment variables
└── SETUP.md                   # Detailed setup guide
```

## 🔌 API Endpoints

### Webhook
- `GET /webhook` - Webhook verification (Meta)
- `POST /webhook` - Receive WhatsApp messages

### REST API
- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/:phoneNumber` - Get messages for a conversation
- `POST /api/send-message` - Send a manual message
- `POST /api/conversations/:phoneNumber/toggle-bot` - Toggle bot status

### Frontend
- `GET /whatsapp.html` - CRM interface

## 🎯 Usage

### Receiving Messages

When a WhatsApp message is sent to your connected number:
1. Meta sends it to your webhook (`POST /webhook`)
2. Message is saved to database
3. If bot is enabled, chatbot generates a reply
4. Reply is sent back via WhatsApp Cloud API
5. Frontend updates in real-time via WebSocket

### Sending Manual Messages

1. Open the CRM interface (`/whatsapp.html`)
2. Select a conversation
3. Type your message
4. Click "Send"
5. Message is sent via WhatsApp Cloud API

### Toggling Bot

1. Select a conversation
2. Toggle the "Bot" switch
3. **Bot ON**: Automatic chatbot replies
4. **Bot OFF**: Only manual human replies

## 🐛 Troubleshooting

### Webhook Not Working
- Ensure webhook URL is publicly accessible (use ngrok for local)
- Verify token must match exactly
- Check server logs for errors

### Messages Not Sending
- Verify access token is valid
- Check phone number format (no +, no spaces)
- Ensure phone number ID is correct

### Database Issues
- Database is auto-created in `data/` directory
- Delete `data/whatsapp_crm.db` to reset

### WebSocket Not Connecting
- Ensure server is running
- Check browser console for errors
- WebSocket runs on same port as HTTP server

## 📚 Documentation

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## 🔒 Security

- Never commit `.env` file (already in `.gitignore`)
- Use HTTPS in production
- Rotate access tokens regularly
- Validate webhook requests (consider adding signature validation)

## 📝 License

ISC

---

**Ready to use!** 🎉 Your WhatsApp CRM is fully functional.
