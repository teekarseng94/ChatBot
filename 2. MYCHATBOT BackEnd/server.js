/**
 * Express Server and API Routes
 * Handles HTTP server, Socket.io connections, and REST API endpoints
 */

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { getUserSettings, setUserSettings } = require('./config/settings');
const { saveUserApiKeyToFirestore, getUserApiKeyFromFirestore, firestore } = require('./config/firebase');

const ADMIN_CREDENTIALS = {
    email: 'admin@rdp.com',
    password: '123456',
    userId: 'admin'
};

/**
 * Create and configure Express server
 * @param {SessionManager} sessionManager - WhatsApp session manager instance
 * @returns {Object} - { app, server, io, userSockets }
 */
function createServer(sessionManager) {
    const app = express();
    app.use(express.json());
    app.use(express.static('public'));

    // Root route
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    const server = http.createServer(app);
    const io = new Server(server, {
        cors: { 
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    // Track sockets per user
    const userSockets = new Map();

    // Helper function to emit to user's sockets
    function emitToUser(userId, event, payload) {
        const sockets = userSockets.get(userId);
        if (!sockets) return;
        sockets.forEach((socket) => {
            try {
                socket.emit(event, payload);
            } catch (err) {
                console.error(`[${userId}] ❌ Error emitting ${event}:`, err);
            }
        });
    }

    // Pass emitToUser to sessionManager
    sessionManager.emitToUser = emitToUser;

    // Socket.io connections
    io.on('connection', async (socket) => {
        const userId = socket.handshake.query.userId || socket.id;
        const userEmail = socket.handshake.query.userEmail || null; // Get email from query
        
        if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket);

        console.log(`[Socket] ✅ NEW CONNECTION: User ID: ${userId}, Email: ${userEmail || 'not provided'}, Socket ID: ${socket.id}`);

        // Get or create session
        let session;
        try {
            session = await sessionManager.startSession(userId, userEmail); // Pass email to session
        } catch (err) {
            socket.emit('error', { message: err.message });
            return;
        }

        // Send initial state
        console.log(`[Socket] 📤 Sending initial state to client: status=${session.status}, botEnabled=${session.botEnabled}, qr=${session.qr ? 'present' : 'none'}, history=${session.history.length} messages`);
        socket.emit('connection_status', session.status);
        socket.emit('qr_code', session.qr || '');
        socket.emit('message_log', [...session.history]);
        socket.emit('bot_status', session.botEnabled);

        // Request QR code handler
        socket.on('request_qr', async () => {
            if (session && session.qr) {
                socket.emit('qr_code', session.qr);
                socket.emit('connection_status', session.status);
            }
        });

        // Bot toggle handler
        socket.on('toggle_bot', (enabled) => {
            if (session) {
                session.botEnabled = !!enabled;
                socket.emit('bot_status', session.botEnabled);
            }
        });

        // Cleanup on disconnect
        socket.on('disconnect', () => {
            const set = userSockets.get(userId);
            if (set) {
                set.delete(socket);
                if (set.size === 0) {
                    userSockets.delete(userId);
                }
            }
        });
    });

    // Auth endpoints
    app.post('/api/auth/login', async (req, res) => {
        const { email, password } = req.body || {};
        
        // Check admin credentials first
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            return res.json({
                success: true,
                user: {
                    uid: ADMIN_CREDENTIALS.userId,
                    email: ADMIN_CREDENTIALS.email
                }
            });
        }
        
        // For other users, check if they have an API key in Firestore
        // If admin manually added their API key, allow them to login
        if (email && firestore) {
            try {
                const normalizedEmail = email.toLowerCase().trim();
                const userDoc = await firestore.collection('users').doc(normalizedEmail).get();
                
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    // If user has an API key in Firestore, allow login
                    // (Password is optional for users with API keys since they're manually added by admin)
                    if (userData.geminiApiKey) {
                        // Use email as userId, but make it filesystem-safe
                        // Replace @ with _at_ and keep dots and other safe characters
                        const userId = normalizedEmail.replace(/@/g, '_at_').replace(/[^a-zA-Z0-9._-]/g, '_');
                        return res.json({
                            success: true,
                            user: {
                                uid: userId,
                                email: normalizedEmail
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('[Auth] Error checking Firestore for user:', error.message);
                // Continue to return 401 if Firestore check fails
            }
        }
        
        // No valid credentials found
        res.status(401).json({
            success: false,
            message: 'Invalid email or password. If you have an API key in Firestore, please contact your administrator.'
        });
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
        const { systemInstruction } = req.body || {};
        setUserSettings(userId, {
            systemInstruction: systemInstruction || ''
        });
        res.json({ ok: true });
    });

    // API key endpoints
    // NOTE: This endpoint is disabled - admins must add API keys manually to Firestore
    // Keeping for backward compatibility but UI no longer calls this
    app.post('/api/users/api-key', async (req, res) => {
        return res.status(403).json({
            success: false,
            message: 'API key saving is disabled. Please contact your administrator to add your API key to Firestore manually.'
        });
        let email = req.body.email || req.body.userEmail;
        if (email) {
            email = email.toLowerCase().trim();
        }

        if (!email || !email.includes('@') || !email.includes('.')) {
            return res.status(400).json({
                success: false,
                message: `Invalid email format. Expected format: user@example.com.`
            });
        }

        const { geminiApiKey } = req.body || {};

        if (!firestore) {
            return res.status(500).json({
                success: false,
                message: 'Database not configured. Firestore is not initialized.'
            });
        }

        if (!email || !geminiApiKey) {
            return res.status(400).json({
                success: false,
                message: 'Email and geminiApiKey are required'
            });
        }

        try {
            const success = await saveUserApiKeyToFirestore(email, geminiApiKey);
            if (success) {
                res.json({
                    success: true,
                    message: 'API key saved successfully'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to save API key'
                });
            }
        } catch (error) {
            let errorMessage = error.message || 'Failed to save API key';
            if (error.code === 16 || error.message.includes('UNAUTHENTICATED')) {
                errorMessage = 'Permission denied. Please check Firestore security rules and service account permissions.';
            }
            res.status(500).json({
                success: false,
                message: errorMessage
            });
        }
    });

    // Legacy route for backward compatibility
    app.post('/api/users/:email/api-key', async (req, res) => {
        try {
            const urlPath = req.originalUrl || req.url;
            const emailMatch = urlPath.match(/\/api\/users\/([^/]+)\/api-key/);
            let email = null;
            
            if (emailMatch && emailMatch[1]) {
                try {
                    email = decodeURIComponent(emailMatch[1]);
                } catch (e) {
                    email = emailMatch[1];
                }
            }
            
            email = email || req.body.email || req.body.userEmail;
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required.'
                });
            }
            
            email = email.toLowerCase().trim();
            const { geminiApiKey } = req.body || {};
            
            if (!geminiApiKey) {
                return res.status(400).json({
                    success: false,
                    message: 'geminiApiKey is required in request body'
                });
            }
            
            if (!firestore) {
                return res.status(500).json({
                    success: false,
                    message: 'Database not configured'
                });
            }
            
            const success = await saveUserApiKeyToFirestore(email, geminiApiKey);
            if (success) {
                res.json({ success: true, message: 'API key saved successfully' });
            } else {
                res.status(500).json({ success: false, message: 'Failed to save API key' });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to save API key'
            });
        }
    });

    // Get API key endpoint
    app.get('/api/users/:email/api-key', async (req, res) => {
        let email = req.query.email || req.params.email;
        if (email && email.includes('%')) {
            try {
                email = decodeURIComponent(email);
            } catch (e) {
                // Ignore
            }
        }
        
        if (email) {
            email = email.toLowerCase().trim();
        }

        if (!email || !email.includes('@')) {
            return res.status(400).json({
                success: false,
                message: 'Valid email is required'
            });
        }

        try {
            const apiKey = await getUserApiKeyFromFirestore(email);
            if (apiKey) {
                res.json({
                    success: true,
                    geminiApiKey: apiKey
                });
            } else {
                res.json({
                    success: false,
                    geminiApiKey: null
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve API key'
            });
        }
    });

    // Reset session endpoint
    app.post('/api/reset-session/:userId', async (req, res) => {
        const { userId } = req.params;
        try {
            await sessionManager.deleteSession(userId);
            res.json({ success: true, message: 'Session reset successfully' });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to reset session'
            });
        }
    });

    // Diagnostic endpoint to check API key status
    app.get('/api/diagnostic/:userId', async (req, res) => {
        const { userId } = req.params;
        const { resolveUserEmail, getModelForUser } = require('./ai/geminiService');
        const { getUserApiKeyFromFirestore, firebaseAdmin, firestore } = require('./config/firebase');
        
        try {
            const diagnostics = {
                userId,
                firestoreInitialized: !!firestore,
                firebaseAdminInitialized: !!firebaseAdmin,
                resolvedEmail: null,
                apiKeyExists: false,
                apiKeyLength: 0,
                apiKeyStartsWith: null,
                modelTest: {
                    success: false,
                    error: null,
                    testedModels: []
                }
            };
            
            if (firestore && firebaseAdmin) {
                try {
                    const userEmail = await resolveUserEmail(userId, firebaseAdmin);
                    diagnostics.resolvedEmail = userEmail;
                    
                    const apiKey = await getUserApiKeyFromFirestore(userEmail);
                    diagnostics.apiKeyExists = !!apiKey;
                    diagnostics.apiKeyLength = apiKey ? apiKey.length : 0;
                    diagnostics.apiKeyStartsWith = apiKey ? apiKey.substring(0, 4) : null;
                    
                    // Test the API key with actual model initialization
                    if (apiKey) {
                        try {
                            console.log(`[Diagnostic] Testing API key for ${userEmail}...`);
                            const model = await getModelForUser(userEmail, firebaseAdmin);
                            diagnostics.modelTest.success = true;
                            diagnostics.modelTest.testedModels = ['Model initialized successfully'];
                            
                            // Try a simple test call
                            try {
                                const testResult = await model.generateContent('Say "test"');
                                const testResponse = await testResult.response;
                                const testText = testResponse.text();
                                diagnostics.modelTest.testCallSuccess = true;
                                diagnostics.modelTest.testResponse = testText.substring(0, 50);
                            } catch (testError) {
                                diagnostics.modelTest.testCallSuccess = false;
                                diagnostics.modelTest.testCallError = testError.message;
                            }
                        } catch (modelError) {
                            diagnostics.modelTest.success = false;
                            diagnostics.modelTest.error = modelError.message;
                            diagnostics.modelTest.errorType = modelError.constructor.name;
                        }
                    }
                } catch (err) {
                    diagnostics.error = err.message;
                    diagnostics.errorType = err.constructor.name;
                }
            }
            
            res.json({ success: true, diagnostics });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Diagnostic failed',
                errorType: error.constructor.name
            });
        }
    });

    return { app, server, io, userSockets };
}

module.exports = { createServer, ADMIN_CREDENTIALS };

