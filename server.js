require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const webhookRoutes = require('./src/routes/webhook');
const { initializeWebSocket } = require('./src/services/ws');
const { initializeStorage } = require('./src/services/storage');

const app = express();
const server = http.createServer(app);

// Initialize WebSocket
initializeWebSocket(server);

// Initialize storage
initializeStorage();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Webhook routes
app.use('/webhook', webhookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API route for manual message sending
app.post('/api/send-message', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }

    const wabaService = require('./src/services/waba');
    const result = await wabaService.sendMessage(phoneNumber, message);
    
    // Save to storage
    const storageService = require('./src/services/storage');
    await storageService.addMessage(phoneNumber, message, 'outgoing', 'manual');
    
    // Broadcast update
    const wsService = require('./src/services/ws');
    wsService.broadcastMessage({
      type: 'new_message',
      phoneNumber,
      message,
      direction: 'outgoing',
      source: 'manual',
      timestamp: new Date().toISOString()
    });
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// API route to get conversations
app.get('/api/conversations', async (req, res) => {
  try {
    const storageService = require('./src/services/storage');
    const conversations = await storageService.getAllConversations();
    res.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: error.message });
  }
});

// API route to get messages for a conversation
app.get('/api/conversations/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const storageService = require('./src/services/storage');
    const messages = await storageService.getMessages(phoneNumber);
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// API route to toggle bot status
app.post('/api/conversations/:phoneNumber/toggle-bot', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const { enabled } = req.body;
    const storageService = require('./src/services/storage');
    await storageService.setBotStatus(phoneNumber, enabled);
    
    // Broadcast update
    const wsService = require('./src/services/ws');
    wsService.broadcastMessage({
      type: 'bot_status_changed',
      phoneNumber,
      botEnabled: enabled
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error toggling bot:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 WhatsApp CRM Server running on port ${PORT}`);
  console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`💬 CRM Interface: http://localhost:${PORT}/whatsapp.html`);
});


