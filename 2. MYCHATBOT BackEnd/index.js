try { require('dotenv').config(); } catch (_) { /* dotenv optional */ }
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Firebase Admin SDK (optional - only when credentials are present)
let firebaseAdmin = null;
let firestore = null;
try {
    firebaseAdmin = require('firebase-admin');
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    const hasCreds = fs.existsSync(serviceAccountPath) || process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (hasCreds && !firebaseAdmin.apps.length) {
        if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = require(serviceAccountPath);
            firebaseAdmin.initializeApp({
                credential: firebaseAdmin.credential.cert(serviceAccount),
                projectId: 'chatbot20-21e3a'
            });
            console.log('✅ Firebase Admin initialized with service account key');
        } else {
            firebaseAdmin.initializeApp({
                credential: firebaseAdmin.credential.applicationDefault(),
                projectId: 'chatbot20-21e3a'
            });
            console.log('✅ Firebase Admin initialized with Application Default Credentials');
        }
        firestore = firebaseAdmin.firestore();
        console.log('✅ Firestore ready for message logging');
    } else if (!hasCreds) {
        console.log('ℹ️ Firestore disabled: no serviceAccountKey.json or GOOGLE_APPLICATION_CREDENTIALS (message logging to Firestore skipped)');
    }
} catch (err) {
    console.log('⚠️ Firebase Admin not installed or init failed. Message logging to Firestore disabled.');
    console.log('   Error:', err.message);
}

// ============================================
// 1. CONFIGURATION
// ============================================
const DEFAULT_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBhZZVKb4f0lV2FJdIaZoMy3KjueNLzLeM';
const PORT = process.env.PORT || 3000;
const SETTINGS_FILE = path.join(__dirname, 'settings.json');
const SESSIONS_DIR = path.join(__dirname, 'sessions');
const DEFAULT_SYSTEM_PROMPT = 'You are a helpful WhatsApp assistant. Keep replies brief and use emojis.';

// Ensure sessions directory exists
if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// Logger for Baileys
const logger = pino({ level: 'silent' }); // Set to 'info' or 'debug' for more logs

// Global message store for getMessage (Baileys #1767 – reduces "Waiting for this message")
const messageStore = {};
const MAX_MESSAGE_STORE = 1000;

/**
 * Store key for getMessage: WhatsApp may request by id only or by (remoteJid, id). Use composite so either lookup works.
 * @param {{ remoteJid?: string, id?: string }} key
 * @returns {string|null}
 */
function getMessageStoreKey(key) {
    if (!key || !key.id) return null;
    if (key.remoteJid) return `${key.remoteJid}::${key.id}`;
    return key.id;
}

/**
 * Store a message proto for getMessage. Call with key so lookup by id or composite (remoteJid::id) finds it.
 * @param {{ remoteJid?: string, id?: string }} key
 * @param {object} messageProto - proto.IMessage (the .message part only, not full WAMessage)
 */
function setMessageInStore(key, messageProto) {
    if (!key || !key.id || !messageProto) return;
    const composite = getMessageStoreKey(key);
    if (composite) messageStore[composite] = messageProto;
    if (key.id && key.id !== composite) messageStore[key.id] = messageProto;
}

/**
 * Get message proto from store. getMessage must return only proto.IMessage (not full WAMessage).
 * @param {{ remoteJid?: string, id?: string }} key
 * @returns {object|undefined}
 */
function getMessageFromStore(key) {
    if (!key || !key.id) return undefined;
    const composite = getMessageStoreKey(key);
    return messageStore[composite] || messageStore[key.id] || undefined;
}

/**
 * Build a valid proto.IMessage for plain text (used when sent.message is missing so getMessage can still serve it).
 * @param {string} text
 * @returns {{ conversation?: string, extendedTextMessage?: { text: string } }}
 */
function textMessageProto(text) {
    const t = String(text || '');
    return t.length > 256 ? { extendedTextMessage: { text: t } } : { conversation: t };
}

/**
 * Keeps the message store under MAX_MESSAGE_STORE entries to avoid unbounded memory use.
 */
function trimMessageStore() {
    const keys = Object.keys(messageStore);
    if (keys.length > MAX_MESSAGE_STORE) {
        for (let i = 0; i < keys.length - MAX_MESSAGE_STORE; i++) {
            delete messageStore[keys[i]];
        }
    }
}

// ============================================
// 1b. CRM INTEGRATION
// ============================================
/**
 * Sends a POST request to the CRM webhook with X-API-Key and body { outlet_id, customer_message }.
 * @param {string} webhookUrl - CRM webhook URL
 * @param {string} apiKey - API key for X-API-Key header
 * @param {string} outletId - Outlet ID for the request body
 * @param {string} customerMessage - Customer message text
 * @returns {Promise<object|string|null>} - Parsed JSON response, or null on error
 */
async function fetchCrmData(webhookUrl, apiKey, outletId, customerMessage) {
    if (!webhookUrl || !String(outletId).trim()) return null;
    const url = String(webhookUrl).trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) return null;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey ? String(apiKey).trim() : '',
                'X-Outlet-Id': String(outletId).trim()
            },
            body: JSON.stringify({
                outlet_id: String(outletId).trim(),
                customer_message: String(customerMessage || '').trim()
            })
        });
        if (!res.ok) {
            console.error(`[CRM] Webhook returned ${res.status}: ${res.statusText}`);
            return null;
        }
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch (_) {
            return text || null;
        }
    } catch (err) {
        console.error('[CRM] fetchCrmData error:', err.message);
        return null;
    }
}

// ============================================
// 2. SESSION MANAGER (Event-based Baileys management)
// ============================================
class SessionManager extends EventEmitter {
    constructor() {
        super();
        this.sessions = new Map(); // userId -> Session
        this.maxSessions = 100; // Maximum simultaneous sessions
    }

    /**
     * Start a new Baileys session for a user
     * @param {string} userId - Unique user identifier
     * @returns {Promise<Session>} - The session object
     */
    async startSession(userId) {
        // Check if session already exists
        if (this.sessions.has(userId)) {
            console.log(`[SessionManager] Session already exists for user: ${userId}`);
            return this.sessions.get(userId);
        }

        // Check max sessions limit
        if (this.sessions.size >= this.maxSessions) {
            throw new Error(`Maximum session limit (${this.maxSessions}) reached. Please wait for a slot to free up.`);
        }

        // Create new session
        console.log(`[SessionManager] Starting new session for user: ${userId}`);
        const session = await this.createSession(userId);
        this.sessions.set(userId, session);
        return session;
    }

    /**
     * Get an active session for a user
     * @param {string} userId - Unique user identifier
     * @returns {Session|null} - The session object or null if not found
     */
    getSession(userId) {
        return this.sessions.get(userId) || null;
    }

    /**
     * Delete a session (logout and remove session files)
     * @param {string} userId - Unique user identifier
     * @returns {Promise<void>}
     */
    async deleteSession(userId) {
        const session = this.sessions.get(userId);
        if (!session) {
            console.log(`[SessionManager] No session found for user: ${userId}`);
            return;
        }

        try {
            // End Baileys socket connection
            if (session.sock) {
                await session.sock.end(undefined);
                console.log(`[SessionManager] Socket closed for user: ${userId}`);
            }

            // Remove session from map
            this.sessions.delete(userId);

            // Delete session directory and all files
            const sessionDir = path.join(SESSIONS_DIR, userId);
            if (fs.existsSync(sessionDir)) {
                fs.rmSync(sessionDir, { recursive: true, force: true });
                console.log(`[SessionManager] Deleted session directory for user: ${userId}`);
            }

            // Emit session deleted event
            this.emit('session_deleted', { userId });

            console.log(`[SessionManager] ✅ Session deleted for user: ${userId}`);
        } catch (err) {
            console.error(`[SessionManager] ❌ Error deleting session for ${userId}:`, err);
            throw err;
        }
    }

    /**
     * Create a new Baileys session for a user
     * @param {string} userId - Unique user identifier
     * @returns {Promise<Session>} - The session object
     */
    async createSession(userId) {
        // Use './sessions/' + userId as specified
        const sessionDir = path.join('./sessions', userId);
        
        // Create isolated session directory for this user
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }

        // Load authentication state using useMultiFileAuthState
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        // Check if credentials exist (if they do, we won't get QR code)
        const credsFile = path.join(sessionDir, 'creds.json');
        const hasCredentials = fs.existsSync(credsFile) && state.creds && Object.keys(state.creds).length > 0;
        console.log(`[${userId}] 📁 Session directory: ${sessionDir}`);
        console.log(`[${userId}] 🔑 Has existing credentials: ${hasCredentials}`);
        if (hasCredentials) {
            console.log(`[${userId}] ℹ️ Will try to connect with existing credentials. QR will only appear if connection fails.`);
        } else {
            console.log(`[${userId}] ℹ️ No credentials found. QR code should appear shortly.`);
        }

        // Fetch latest Baileys version
        const { version } = await fetchLatestBaileysVersion();
        console.log(`[${userId}] Using Baileys version: ${version.join('.')}`);

        const session = {
            userId,
            sock: null,
            saveCreds,
            sessionDir,
            status: 'Initializing',
            qr: '',
            qrGeneratedAt: null,
            history: [],
            botEnabled: true,
            createdAt: new Date(),
            lastActivity: new Date(),
            reconnectAttempts: 0
        };

        const baileysLogger = pino({ level: 'silent' });

        // Create Baileys socket – options tuned to reduce "Waiting for this message" (encryption sync, Baileys #1767)
        const sock = makeWASocket({
            version,
            logger: baileysLogger,
            printQRInTerminal: false,
            // Keep QR visible & valid for longer
            qrTimeout: 60000, // 60s
            // Give WhatsApp more time to establish the Web session (helps over tunnels / slow networks)
            connectTimeoutMs: 60000,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, baileysLogger)
            },
            // Stable browser identity for this bot
            browser: ['MyChatBot', 'Chrome', '1.0.0'],
            linkPreviewImageThumbnailWidth: 192,
            shouldSyncHistoryMessage: () => false,
            syncFullHistory: false,
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            getMessage: async (key) => {
                const proto = getMessageFromStore(key);
                return proto !== undefined ? proto : undefined;
            }
        });

        session.sock = sock;
        console.log(`[${userId}] Baileys socket created, waiting for connection updates...`);

        // Setup event handlers
        this.setupSessionEvents(session);

        return session;
    }

    /**
     * Setup event handlers for a Baileys session
     * @param {Session} session - The session object
     */
    setupSessionEvents(session) {
        const { userId, sock, saveCreds } = session;

        // Credential saving: inside session initialization so keys are never lost.
        // Every time session keys change, persist immediately to disk (useMultiFileAuthState).
        sock.ev.on('creds.update', async () => {
            try {
                await saveCreds();
                console.log(`[${userId}] Creds updated and saved to disk`);
            } catch (err) {
                console.error(`[${userId}] Failed to save creds:`, err.message);
            }
        });

        // Handle connection updates (wrapped so no unhandled rejection can crash the server)
        sock.ev.on('connection.update', async (update) => {
            try {
                const { connection, lastDisconnect, qr, isNewLogin } = update;

                // Log connection updates for debugging
                console.log(`[${userId}] 🔄 Connection update:`, {
                    connection,
                    hasQR: !!qr,
                    qrLength: qr ? qr.length : 0,
                    hasLastDisconnect: !!lastDisconnect,
                    isNewLogin: isNewLogin
                });

                // Handle QR code
                if (qr) {
                    try {
                        const now = Date.now();
                    // If we've already generated a QR recently, don't thrash it.
                        if (session.qrGeneratedAt && now - session.qrGeneratedAt.getTime() < 10000) {
                            console.log(`[${userId}] Skipping QR refresh (last QR generated ${now - session.qrGeneratedAt.getTime()}ms ago)`);
                            return;
                        }

                        console.log(`[${userId}] Generating QR code DataURL...`);
                        const dataUrl = await qrcode.toDataURL(qr, {
                            errorCorrectionLevel: 'H',
                            type: 'image/png',
                            quality: 1.0,
                            margin: 2,
                            width: 512,
                            color: { dark: '#000000', light: '#FFFFFF' }
                        });
                        session.qr = dataUrl;
                        session.status = 'Waiting for QR scan';
                        session.qrGeneratedAt = new Date();
                        console.log(`\n[${userId}] QR Code generated at ${new Date().toISOString()}`);
                        qrcodeTerminal.generate(qr, { small: true });
                        this.emit('qr', { userId, qr: dataUrl, rawQR: qr });
                        this.emitToUser(userId, 'qr_code', dataUrl);
                        this.emitToUser(userId, 'connection_status', 'Waiting for QR scan');
                        console.log(`[${userId}] ✅ QR code DataURL generated (${dataUrl.length} bytes) and emitted`);
                    } catch (err) {
                        console.error(`[${userId}] ❌ Error generating QR:`, err);
                        this.emitToUser(userId, 'connection_status', 'Error generating QR');
                    }
                }

            // Handle connection state
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const errMsg = lastDisconnect?.error?.message || '';
                const is401OrLoggedOut = statusCode === DisconnectReason.loggedOut ||
                    statusCode === 401 ||
                    /401|Unauthorized|Logged Out/i.test(String(errMsg));
                const shouldReconnect = !is401OrLoggedOut;

                if (shouldReconnect) {
                    session.status = 'Reconnecting';
                    session.reconnectAttempts++;
                    console.log(
                        `[${userId}] Connection closed, attempting reconnect (attempt ${session.reconnectAttempts}) after backoff...`
                    );
                    this.emitToUser(userId, 'connection_status', 'Reconnecting');

                    // Reconnect after a small backoff so QR doesn't thrash (5–10 seconds)
                    const delayMs = Math.min(10000, 5000 + session.reconnectAttempts * 1000);
                    setTimeout(async () => {
                        if (this.sessions.has(userId)) {
                            try {
                                await this.reconnectSession(userId);
                            } catch (err) {
                                console.error(`[${userId}] Reconnect error:`, err);
                            }
                        }
                    }, delayMs);
                } else {
                    // 401 Unauthorized or Logged Out: delete session folder so a fresh QR can be generated immediately
                    session.status = 'Logged Out';
                    console.log(`[${userId}] 401 Unauthorized or Logged Out – deleting session folder for fresh QR`);
                    this.emitToUser(userId, 'connection_status', 'Logged Out - Need new QR');

                    (async () => {
                        try {
                            await this.deleteSession(userId);
                            const newSession = await this.startSession(userId);
                            if (newSession) {
                                console.log(`[${userId}] Fresh session created, new QR will be emitted when ready`);
                            }
                        } catch (err) {
                            console.error(`[${userId}] Error during cleanup and restart:`, err);
                            this.emitToUser(userId, 'connection_status', 'Error – try Reset Session');
                        }
                    })();
                }
            } else if (connection === 'open') {
                session.status = 'Ready';
                session.qr = '';
                session.lastActivity = new Date();
                session.reconnectAttempts = 0;
                console.log(`[${userId}] WhatsApp connected and ready!`);
                this.emitToUser(userId, 'connection_status', 'Ready');
                this.emitToUser(userId, 'qr_code', '');

                // Test Gemini API connection
                (async () => {
                    try {
                        const model = this.getModelForUser(userId);
                        const testResult = await model.generateContent('Say "API connected" if you can read this.');
                        const testResponse = await testResult.response;
                        const testText = testResponse.text();
                        console.log(`[${userId}] ✅ Gemini API test successful: ${testText}`);
                    } catch (testError) {
                        console.error(`[${userId}] ❌ Gemini API test failed:`, testError.message);
                    }
                })();
            } else if (connection === 'connecting') {
                session.status = 'Connecting';
                console.log(`[${userId}] Connecting...`);
                this.emitToUser(userId, 'connection_status', 'Connecting');
            } else if (connection === undefined && !qr) {
                // Initial state - no connection info yet
                console.log(`[${userId}] Initial connection state, waiting for QR or connection...`);
                
                // If we have credentials but no connection info after a delay, check if we need QR
                setTimeout(() => {
                    if (session.status === 'Initializing' && !session.qr) {
                        console.log(`[${userId}] ⚠️ No connection update received after delay. Checking if credentials are valid...`);
                        // If credentials exist but connection isn't established, they might be invalid
                        const credsFile = path.join(session.sessionDir, 'creds.json');
                        if (fs.existsSync(credsFile)) {
                            console.log(`[${userId}] 💡 Credentials exist but connection not established. May need to reset session.`);
                            this.emitToUser(userId, 'connection_status', 'Connection timeout - try resetting session');
                        }
                    }
                }, 10000); // Wait 10 seconds for connection update
            }
            } catch (connErr) {
                console.error(`[${userId}] connection.update error (server will keep running):`, connErr?.message || connErr);
                if (connErr?.stack) console.error(connErr.stack);
            }
        });

        // Handle messages – only process when socket is fully Ready to avoid hanging
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            try {
                if (type !== 'notify') return;

                // Baileys #1767: save every incoming message to store first so getMessage can return it (proto.IMessage only)
                try {
                    for (const m of messages) {
                        if (m.key && m.key.id && m.message) {
                            setMessageInStore(m.key, m.message);
                        }
                    }
                    trimMessageStore();
                } catch (storeErr) {
                    console.error(`[${userId}] Failed to save message to store:`, storeErr?.message || storeErr);
                    // Continue so the bot can still attempt to reply via Gemini
                }

                session.lastActivity = new Date();

                if (session.status !== 'Ready') {
                    console.log(`[${userId}] 📩 Message(s) received but socket not Ready (status: ${session.status}) – skipping to prevent hang`);
                    return;
                }

                for (const msg of messages) {

                    // Skip if bot is disabled
                    if (!session.botEnabled) {
                        continue;
                    }

                    // Get message info
                    const message = msg.message;
                    if (!message) continue;

                    const key = msg.key;
                    const isFromMe = key.fromMe;
                    const remoteJid = key.remoteJid;
                    
                    // Skip status updates
                    if (remoteJid === 'status@broadcast') {
                        console.log(`[${userId}] Ignoring status update from status@broadcast`);
                        continue;
                    }

                    // Only process private messages (not groups)
                    if (remoteJid?.endsWith('@g.us')) {
                        continue; // Skip group messages
                    }

                    // Skip messages from self
                    if (isFromMe) {
                        continue;
                    }

                    // Get message text
                    const messageText = message?.conversation || message?.extendedTextMessage?.text || '';
                    console.log(`[${userId}] 📩 Message received from ${remoteJid}: "${(messageText || '').toString().substring(0, 80)}${(messageText && messageText.length > 80) ? '...' : ''}"`);
                    if (!messageText || messageText.trim().length === 0) {
                        continue;
                    }

                    console.log(`[${userId}] Processing message from ${remoteJid}: ${messageText.substring(0, 50)}...`);

                    // Log message to Firebase Firestore
                    if (firestore) {
                        try {
                            await firestore.collection('whatsapp_messages').add({
                                userId: userId,
                                sender: remoteJid,
                                message: messageText,
                                timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
                                sessionId: session.userId,
                                messageId: key.id,
                                isFromMe: isFromMe
                            });
                            console.log(`[${userId}] ✅ Message logged to Firestore from ${remoteJid}`);
                        } catch (firebaseError) {
                            console.error(`[${userId}] ❌ Error logging to Firestore:`, firebaseError.message);
                        }
                    }

                    try {
                        // Key stabilization delay: allow background encryption handshake to complete (Business accounts)
                        await new Promise(r => setTimeout(r, 2500));

                        const settings = getUserSettings(userId);
                        const integration = await getIntegrationSettings(userId);
                        const webhookUrl = integration.webhookUrl || settings.webhookUrl;
                        const integrationApiKey = integration.integrationApiKey || settings.integrationApiKey;
                        const outletId = integration.outletId || settings.outletId;

                        let promptForGemini = messageText;
                        let extraSystemInstruction = '';
                        if (webhookUrl && outletId) {
                            const crmData = await fetchCrmData(
                                webhookUrl,
                                integrationApiKey,
                                outletId,
                                messageText
                            );

                            console.log('[CRM Data Received]:', crmData);

                            if (crmData == null) {
                                const failMsg =
                                    'I am having trouble reaching the booking system (ZenFlow) right now, so I cannot safely check real-time availability. Please try again in a few minutes or contact the staff directly.';
                                await new Promise(r => setTimeout(r, 300));
                                const sent = await sock.sendMessage(remoteJid, { text: failMsg });
                                if (sent && sent.key) {
                                    const proto = sent.message || textMessageProto(failMsg);
                                    setMessageInStore(sent.key, proto);
                                    trimMessageStore();
                                }
                                console.log(`[${userId}] Sent booking-system error message (webhook failed).`);
                                continue;
                            }

                            const crmContext = typeof crmData === 'object'
                                ? JSON.stringify(crmData)
                                : String(crmData);

                            extraSystemInstruction =
                                'You are an assistant for ZenFlow. You have real-time access to Appointment, Menu, and Member data via an API.\n' +
                                'You MUST treat the CRM JSON data as the source of truth for availability, services, and membership.\n' +
                                'If the CRM data shows a therapist is busy during the requested time, you MUST tell the user they are unavailable and instead suggest an available therapist such as Ahti or Nanar, based on the data.\n' +
                                'Never invent availability or services that are not present or allowed by the CRM data.';

                            const finalPrompt = 'REAL-TIME DATA FROM ZENFLOW: ' + crmContext + '\n\nUSER MESSAGE: ' + messageText;
                            promptForGemini = finalPrompt;
                        }

                        const model = this.getModelForUser(userId, extraSystemInstruction || undefined);
                        const result = await model.generateContent(promptForGemini);
                        const response = await result.response;
                        const text = response.text();

                        // Cipher delay: allow pre-keys to be exchanged before sending (reduces "Waiting for this message")
                        await new Promise(r => setTimeout(r, 1000));

                        // Send reply using Baileys; store proto immediately so getMessage can serve it (fixes "Waiting for this message")
                        const sent = await sock.sendMessage(remoteJid, { text: text });
                        if (sent && sent.key) {
                            const proto = sent.message || textMessageProto(text);
                            setMessageInStore(sent.key, proto);
                            trimMessageStore();
                        }

                        // Log AI reply to Firebase Firestore
                        if (firestore) {
                            try {
                                await firestore.collection('whatsapp_messages').add({
                                    userId: userId,
                                    sender: remoteJid,
                                    message: messageText,
                                    reply: text,
                                    timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
                                    sessionId: session.userId,
                                    messageId: key.id,
                                    isFromMe: false,
                                    isReply: true
                                });
                                console.log(`[${userId}] ✅ AI reply logged to Firestore`);
                            } catch (firebaseError) {
                                console.error(`[${userId}] ❌ Error logging reply to Firestore:`, firebaseError.message);
                            }
                        }

                        // Add to history (keep last 5)
                        session.history.push({
                            from: remoteJid,
                            body: messageText,
                            reply: text,
                            time: new Date().toISOString()
                        });
                        if (session.history.length > 5) {
                            session.history.shift();
                        }

                        // Emit updated history
                        this.emitToUser(userId, 'message_log', [...session.history]);
                        
                        console.log(`[${userId}] ✅ Reply sent successfully`);
                    } catch (apiError) {
                        const errMsg = apiError?.message || String(apiError);
                        const errCode = apiError?.code || apiError?.status || '';
                        const isKeyError = /API_KEY|api key|invalid key|expired|renew|quota|429|403/i.test(errMsg) || /API_KEY|QUOTA/i.test(String(errCode));
                        console.error(`[${userId}] Gemini API error:`, errMsg);
                        if (errCode) console.error(`[${userId}] Error code:`, errCode);
                        if (isKeyError) console.error(`[${userId}] → Renew key: see RENEW_GEMINI_KEY.md or aistudio.google.com/apikey`);
                        const userMessage = isKeyError
                            ? 'Gemini API key is invalid or expired. Please renew the key at aistudio.google.com/apikey and set GEMINI_API_KEY in backend .env (see RENEW_GEMINI_KEY.md).'
                            : 'Sorry, I encountered an error processing your message. Please try again.';
                        try {
                            await new Promise(r => setTimeout(r, 300));
                            const sentErr = await sock.sendMessage(remoteJid, { text: userMessage });
                            if (sentErr && sentErr.key) {
                                const proto = sentErr.message || textMessageProto(userMessage);
                                setMessageInStore(sentErr.key, proto);
                                trimMessageStore();
                            }
                        } catch (sendError) {
                            console.error(`[${userId}] Error sending error message:`, sendError);
                        }
                    }
                }
            } catch (error) {
                console.error(`[${userId}] Error handling message:`, error);
            }
        });
    }

    /**
     * Reconnect a session
     * @param {string} userId - User identifier
     */
    async reconnectSession(userId) {
        const session = this.sessions.get(userId);
        if (!session) return;

        try {
            // End old socket connection
            if (session.sock) {
                try {
                    await session.sock.end(undefined);
                } catch (err) {
                    // Ignore errors when ending socket
                }
            }
            
            // Remove old session from map
            this.sessions.delete(userId);
            
            // Wait a moment before creating new session
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Create new session (will generate QR if no valid credentials)
            const newSession = await this.createSession(userId);
            this.sessions.set(userId, newSession);
            console.log(`[${userId}] Reconnected successfully`);
        } catch (err) {
            console.error(`[${userId}] Error reconnecting:`, err);
            throw err;
        }
    }

    /**
     * Get Gemini model for a user (with their custom settings)
     * @param {string} userId - User identifier
     * @param {string} [extraSystemInstruction] - Optional text to prepend to the system instruction
     * @returns {GenerativeModel} - Gemini model instance
     */
    getModelForUser(userId, extraSystemInstruction) {
        const settings = getUserSettings(userId);
        const apiKey = (settings.apiKey && settings.apiKey.trim()) || process.env.GEMINI_API_KEY || DEFAULT_API_KEY;
        const baseInstruction = settings.systemInstruction || DEFAULT_SYSTEM_PROMPT;
        const systemInstruction = extraSystemInstruction
            ? `${extraSystemInstruction}\n\n${baseInstruction}`
            : baseInstruction;
        if (!apiKey || !apiKey.trim()) {
            throw new Error('No Gemini API key set. Add GEMINI_API_KEY in .env or set API key in Dashboard Settings.');
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        // gemini-2.0-flash is deprecated; default gemini-2.5-flash (paid). If 404, set GEMINI_MODEL=gemini-1.5-flash in .env
        const modelId = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        return genAI.getGenerativeModel({
            model: modelId,
            systemInstruction
        });
    }

    /**
     * Emit event to all sockets for a specific user
     * @param {string} userId - User identifier
     * @param {string} event - Event name
     * @param {any} payload - Event payload
     */
    emitToUser(userId, event, payload) {
        const sockets = userSockets.get(userId);
        if (!sockets) {
            console.log(`[${userId}] ⚠️ No sockets found for user when emitting ${event}`);
            return;
        }
        console.log(`[${userId}] 📤 Emitting ${event} to ${sockets.size} socket(s)`);
        sockets.forEach((socket) => {
            try {
                socket.emit(event, payload);
            } catch (err) {
                console.error(`[${userId}] ❌ Error emitting ${event}:`, err);
            }
        });
    }

    /**
     * Get statistics about active sessions
     * @returns {Object} - Statistics object
     */
    getStats() {
        return {
            totalSessions: this.sessions.size,
            maxSessions: this.maxSessions,
            sessions: Array.from(this.sessions.keys())
        };
    }

    /**
     * Recover all existing sessions from /sessions folder (reboot-friendly)
     * Scans the sessions directory and re-initializes all sessions that have credentials
     * @returns {Promise<Array<string>>} - Array of userIds that were recovered
     */
    async recoverSessions() {
        console.log('\n🔄 Starting session recovery...');
        const recoveredSessions = [];

        try {
            // Check if sessions directory exists
            if (!fs.existsSync(SESSIONS_DIR)) {
                console.log('📁 Sessions directory does not exist, skipping recovery.');
                return recoveredSessions;
            }

            // Read all directories in sessions folder
            const entries = fs.readdirSync(SESSIONS_DIR, { withFileTypes: true });
            const sessionDirs = entries
                .filter(entry => entry.isDirectory())
                .map(entry => entry.name);

            console.log(`📁 Found ${sessionDirs.length} session directory(ies) to check`);

            // Try to recover each session
            for (const userId of sessionDirs) {
                try {
                    const sessionDir = path.join(SESSIONS_DIR, userId);
                    const credsFile = path.join(sessionDir, 'creds.json');

                    // Check if credentials file exists (indicates logged-in session)
                    if (fs.existsSync(credsFile)) {
                        try {
                            const credsContent = fs.readFileSync(credsFile, 'utf-8');
                            const creds = JSON.parse(credsContent);

                            // Check if credentials are valid (not empty)
                            if (creds && Object.keys(creds).length > 0) {
                                console.log(`\n[${userId}] 🔄 Recovering session...`);
                                
                                // Start session (will use existing credentials)
                                const session = await this.startSession(userId);
                                
                                if (session) {
                                    recoveredSessions.push(userId);
                                    console.log(`[${userId}] ✅ Session recovered successfully`);
                                } else {
                                    console.log(`[${userId}] ⚠️ Failed to recover session`);
                                }
                            } else {
                                console.log(`[${userId}] ⚠️ Credentials file is empty, skipping`);
                            }
                        } catch (parseError) {
                            console.error(`[${userId}] ❌ Error reading credentials:`, parseError.message);
                        }
                    } else {
                        console.log(`[${userId}] ⚠️ No credentials file found, skipping (not logged in)`);
                    }
                } catch (error) {
                    console.error(`[${userId}] ❌ Error recovering session:`, error.message);
                }
            }

            console.log(`\n✅ Session recovery complete: ${recoveredSessions.length}/${sessionDirs.length} sessions recovered`);
            return recoveredSessions;
        } catch (error) {
            console.error('❌ Error during session recovery:', error);
            return recoveredSessions;
        }
    }
}

// ============================================
// 3. SETTINGS MANAGEMENT (JSON-based)
// ============================================
const readSettings = () => {
    try {
        if (!fs.existsSync(SETTINGS_FILE)) return {};
        return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    } catch (err) {
        console.error('Failed to read settings:', err);
        return {};
    }
};

const writeSettings = (data) => {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        console.error('Failed to write settings:', err);
    }
};

const getUserSettings = (userId) => {
    const data = readSettings();
    return data[userId] || {};
};

/**
 * Get integration settings (webhookUrl, integrationApiKey, outlet_id) from Firestore users/{userId}.
 * Falls back to getUserSettings (settings.json) for any missing fields.
 * @param {string} userId - User identifier (document ID in users collection)
 * @returns {Promise<{ webhookUrl?: string, integrationApiKey?: string, outletId?: string }>}
 */
async function getIntegrationSettings(userId) {
    const fromFile = getUserSettings(userId);
    if (!firestore) {
        return {
            webhookUrl: fromFile.webhookUrl || '',
            integrationApiKey: fromFile.integrationApiKey || '',
            outletId: fromFile.outletId || fromFile.outlet_id || ''
        };
    }
    try {
        const doc = await firestore.collection('users').doc(userId).get();
        const data = doc.exists ? doc.data() : {};
        return {
            webhookUrl: (data.webhookUrl ?? data.webhook_url ?? fromFile.webhookUrl) || '',
            integrationApiKey: (data.integrationApiKey ?? data.integration_api_key ?? data.apiKey ?? fromFile.integrationApiKey) || '',
            outletId: (data.outlet_id ?? data.outletId ?? fromFile.outletId ?? fromFile.outlet_id) || ''
        };
    } catch (err) {
        console.error(`[${userId}] getIntegrationSettings Firestore error:`, err.message);
        return {
            webhookUrl: fromFile.webhookUrl || '',
            integrationApiKey: fromFile.integrationApiKey || '',
            outletId: fromFile.outletId || fromFile.outlet_id || ''
        };
    }
}

const setUserSettings = (userId, settings) => {
    const data = readSettings();
    data[userId] = settings;
    writeSettings(data);
};

// ============================================
// 4. SERVER SETUP
// ============================================
const app = express();
app.use(cors({
    origin: [
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'https://mychatbot.website',
        'https://www.mychatbot.website',
        'https://chatbot20-21e3a.web.app',
        'https://chatbot20-21e3a.firebaseapp.com'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

const frontendIndexPath = path.join(__dirname, 'public', 'index.html');

// Root and SPA fallback: serve frontend (React) index.html when it exists
function serveFrontendIndex(req, res) {
    if (fs.existsSync(frontendIndexPath)) {
        res.sendFile(frontendIndexPath);
    } else {
        res.status(503).type('text/plain').send(
            'Frontend not deployed. From project root run: npm run copy-frontend (or build 1.MYCHATBOT FrontEnd and copy its dist/ into 2. MYCHATBOT BackEnd/public/).'
        );
    }
}

app.get('/', serveFrontendIndex);

const server = http.createServer(app);

// Prevent connection/socket errors from crashing the process (e.g. client disconnect, tunnel "context canceled")
server.on('error', (err) => {
    console.error('[SERVER] HTTP server error (server will keep running):', err?.message || err);
});
server.on('clientError', (err, socket) => {
    if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins (including Cloudflare tunnel)
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling'] // Support both transports
});

// Track sockets per user
const userSockets = new Map(); // userId -> Set<socket>

// Initialize Session Manager
const sessionManager = new SessionManager();

// ============================================
// 5. SOCKET.IO CONNECTIONS
// ============================================
io.on('connection', async (socket) => {
    const userId = socket.handshake.query.userId || socket.id;
    const clientIP = socket.handshake.address || socket.request.headers['x-forwarded-for'] || 'unknown';
    const userAgent = socket.handshake.headers['user-agent'] || 'unknown';
    
    // Track socket for this user
    if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket);

    // Enhanced logging for PM2
    console.log(`[Socket] ✅ NEW CONNECTION:`);
    console.log(`  └─ User ID: ${userId}`);
    console.log(`  └─ Socket ID: ${socket.id}`);
    console.log(`  └─ IP: ${clientIP}`);
    console.log(`  └─ User Agent: ${userAgent.substring(0, 50)}...`);
    console.log(`  └─ Total sockets for this user: ${userSockets.get(userId).size}`);
    console.log(`  └─ Total active users: ${userSockets.size}`);

    // Get or create session
    let session;
    try {
        session = await sessionManager.startSession(userId);
    } catch (err) {
        socket.emit('error', { message: err.message });
        console.error(`[Socket] Error starting session for ${userId}:`, err.message);
        return;
    }

    // Send initial state
    console.log(`[Socket] 📤 Sending initial state to ${userId}:`, {
        status: session.status,
        hasQR: !!session.qr,
        qrLength: session.qr ? session.qr.length : 0
    });
    socket.emit('connection_status', session.status);
    socket.emit('qr_code', session.qr || '');
    socket.emit('message_log', [...session.history]);
    socket.emit('bot_status', session.botEnabled);
    
    // If no QR and status is Initializing, check again after delays
    if (!session.qr && session.status === 'Initializing') {
        console.log(`[Socket] ⏳ No QR yet for ${userId}, will check again in 2 seconds...`);
        
        // Check after 2 seconds
        setTimeout(() => {
            if (session.qr) {
                console.log(`[Socket] ✅ QR now available, sending to ${userId}`);
                socket.emit('qr_code', session.qr);
                socket.emit('connection_status', session.status);
            } else {
                console.log(`[Socket] ⏳ Still no QR after 2s, will check again in 5 seconds...`);
            }
        }, 2000);
        
        // Check again after 7 seconds total
        setTimeout(() => {
            if (session.qr) {
                console.log(`[Socket] ✅ QR now available, sending to ${userId}`);
                socket.emit('qr_code', session.qr);
                socket.emit('connection_status', session.status);
            } else {
                const credsFile = path.join(session.sessionDir, 'creds.json');
                const hasCredentials = fs.existsSync(credsFile);
                if (hasCredentials) {
                    console.log(`[Socket] ⚠️ Still no QR after 7s. Session has credentials - connection may be in progress or credentials may be invalid.`);
                    console.log(`[Socket] 💡 If connection doesn't establish, try "Reset Session" to force new QR.`);
                    socket.emit('connection_status', 'Connecting with existing credentials...');
                } else {
                    console.log(`[Socket] ⚠️ Still no QR after 7s for ${userId} - connection.update may not have fired yet.`);
                    socket.emit('connection_status', 'Waiting for QR code...');
                }
            }
        }, 7000);
    }

    // Request QR code handler
    socket.on('request_qr', async () => {
        console.log(`[Socket] 🔄 QR code requested by ${userId}`);
        if (session) {
            // Send current QR if available
            if (session.qr) {
                console.log(`[Socket] ✅ Sending existing QR code to ${userId}`);
                socket.emit('qr_code', session.qr);
                socket.emit('connection_status', session.status);
            } else {
                // Check if session has credentials - if so, connection might be in progress
                const credsFile = path.join(session.sessionDir, 'creds.json');
                const hasCredentials = fs.existsSync(credsFile);
                
                if (hasCredentials) {
                    console.log(`[Socket] ⚠️ Session has credentials but no QR. Status: ${session.status}`);
                    console.log(`[Socket] 💡 If connection fails, QR will appear. Otherwise, try "Reset Session" to force new QR.`);
                    socket.emit('connection_status', session.status || 'Checking connection...');
                } else {
                    // No credentials - QR should appear soon
                    console.log(`[Socket] ⚠️ No QR available yet for ${userId}, waiting for connection.update event...`);
                    console.log(`[Socket] 💡 QR should appear within 10-15 seconds. If not, try clicking "Reset Session" button`);
                    socket.emit('connection_status', 'Waiting for QR code...');
                }
            }
        }
    });

    // Bot toggle handler
    socket.on('toggle_bot', (enabled) => {
        if (session) {
            session.botEnabled = !!enabled;
            socket.emit('bot_status', session.botEnabled);
            console.log(`[${userId}] Bot ${enabled ? 'enabled' : 'disabled'}`);
        }
    });

    // Cleanup on disconnect
    socket.on('disconnect', (reason) => {
        const set = userSockets.get(userId);
        if (set) {
            set.delete(socket);
            console.log(`[Socket] ❌ DISCONNECT:`);
            console.log(`  └─ User ID: ${userId}`);
            console.log(`  └─ Socket ID: ${socket.id}`);
            console.log(`  └─ Reason: ${reason}`);
            console.log(`  └─ Remaining sockets for user: ${set.size}`);
            
            if (set.size === 0) {
                userSockets.delete(userId);
                console.log(`  └─ All sockets disconnected for user: ${userId}`);
                console.log(`  └─ Total active users: ${userSockets.size}`);
                // Note: We keep the client active even if all sockets disconnect
                // This allows reconnection without re-scanning QR
            }
        }
    });
});

// ============================================
// 6. REST API ENDPOINTS
// ============================================
// Local authentication (hardcoded admin)
const ADMIN_CREDENTIALS = {
    email: 'admin@rdp.com',
    password: '123456',
    userId: 'admin' // Consistent userId for admin user
};

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        res.json({
            success: true,
            user: {
                uid: ADMIN_CREDENTIALS.userId,
                email: ADMIN_CREDENTIALS.email
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true });
});

// Settings endpoints
app.get('/api/settings/:userId', (req, res) => {
    const { userId } = req.params;
    res.json(getUserSettings(userId));
});

app.post('/api/settings/:userId', (req, res) => {
    const { userId } = req.params;
    const body = req.body || {};
    const current = getUserSettings(userId);
    const allowed = ['apiKey', 'systemInstruction', 'outletId', 'webhookUrl', 'integrationApiKey'];
    const next = { ...current };
    for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
            next[key] = body[key] != null ? String(body[key]).trim() : '';
        }
    }
    setUserSettings(userId, next);
    res.json({ ok: true });
});

// Session stats endpoint
app.get('/api/stats', (req, res) => {
    res.json(sessionManager.getStats());
});

// Test endpoint to verify server is reachable
app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'Server is reachable' 
    });
});

// Reset session endpoint - forces logout and new QR
app.post('/api/reset-session/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        await sessionManager.deleteSession(userId);
        res.json({ success: true, message: 'Session reset. New QR will be generated on next connection.' });
    } catch (err) {
        console.error(`[API] Error resetting session:`, err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// SPA fallback: serve frontend index.html for non-API GET routes (e.g. /login) so React Router works
// Express 5 no longer accepts app.get('*', ...); use a regex catch-all instead
app.get(/(.*)/, (req, res) => {
    serveFrontendIndex(req, res);
});

// ============================================
// 7. ERROR HANDLING
// ============================================
// Handle unhandled promise rejections (keep server running; avoid crash when e.g. WhatsApp Business connects)
process.on('unhandledRejection', (reason, promise) => {
    console.error('[SERVER] Unhandled Rejection – server will keep running');
    console.error('  reason:', reason);
    if (reason && typeof reason === 'object' && reason.stack) console.error(reason.stack);
});

// Handle uncaught exceptions (log and keep process alive so tunnel/origin stays up)
process.on('uncaughtException', (error) => {
    console.error('[SERVER] Uncaught Exception – server will keep running');
    console.error('  message:', error?.message || error);
    if (error?.stack) console.error(error.stack);
});

// ============================================
// 8. START SERVER & RECOVER SESSIONS
// ============================================
server.listen(PORT, async () => {
    console.log(`\n🚀 WhatsApp Bot Server running on port ${PORT}`);
    console.log(`📊 Session Manager initialized (Max sessions: ${sessionManager.maxSessions})`);
    console.log(`📁 Sessions directory: ${SESSIONS_DIR}`);
    console.log(`🌐 Web UI: http://localhost:${PORT}\n`);

    // Recover all existing sessions (reboot-friendly)
    // This allows PM2 to keep sessions running after PC restart
    try {
        const recovered = await sessionManager.recoverSessions();
        if (recovered.length > 0) {
            console.log(`\n✅ ${recovered.length} session(s) automatically recovered and ready!`);
            console.log(`   Sessions: ${recovered.join(', ')}\n`);
        } else {
            console.log(`\nℹ️ No sessions to recover (all users need to scan QR code)\n`);
        }
    } catch (recoveryError) {
        console.error('❌ Error during session recovery:', recoveryError);
        console.log('   Server will continue, but sessions need to be reconnected manually\n');
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    for (const [userId] of sessionManager.sessions) {
        await sessionManager.deleteSession(userId);
    }
    process.exit(0);
});
