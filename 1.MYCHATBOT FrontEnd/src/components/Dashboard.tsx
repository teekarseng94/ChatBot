import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { io, type Socket } from 'socket.io-client';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { firebaseAuth } from '../config/firebase';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url';

const LOCAL_AUTH_KEY = 'local_auth';
const STATUS_COLORS: Record<string, string> = {
  Ready: 'bg-emerald-400',
  Authenticated: 'bg-sky-400',
  Loading: 'bg-yellow-400',
  'Auth Failure': 'bg-red-500',
  Error: 'bg-red-500',
  Connecting: 'bg-yellow-400',
  'Waiting for QR scan': 'bg-yellow-400',
  Reconnecting: 'bg-yellow-400',
  'Logged Out - Need new QR': 'bg-red-500',
  Disconnected: 'bg-red-500',
  'Connection Error': 'bg-red-500',
  Initializing: 'bg-yellow-400',
};

// Configure PDF.js worker for browser usage
if ((pdfjsLib as any).GlobalWorkerOptions) {
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker;
}

function getApiBaseUrl(): string {
  const url = import.meta.env.VITE_API_BASE_URL;
  if (url && typeof url === 'string') return url.replace(/\/$/, '');
  return '';
}

/** Socket.io URL: use env if set; on localhost use backend :3000; else same origin (works with tunnel). */
function getSocketUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string') return envUrl.replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    const h = window.location.hostname;
    if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:3000';
    if (h === 'mychatbot.website' || h === 'www.mychatbot.website') return `https://${h}`;
  }
  return '';
}

interface MessageItem {
  from: string;
  body: string;
  reply: string;
  time: string;
}

type TabId = 'dashboard' | 'settings' | 'integration' | 'login' | 'signup';

const TEMPLATES: { label: string; value: string }[] = [
  {
    label: 'Bakery Support',
    value:
      "You are a bakery's customer support assistant. Greet warmly, answer product/price/order questions concisely, and use friendly emojis.",
  },
  {
    label: 'Real Estate Agent',
    value:
      'You are a real estate agent for residential properties. Provide concise property info, schedule viewings, and ask clarifying questions. Keep tone professional and brief, with occasional friendly emojis.',
  },
  {
    label: 'Tutor',
    value:
      'You are a math tutor for high school students. Explain steps clearly, keep answers short, and offer a quick example if helpful. Use encouraging tone and light emojis.',
  },
  {
    label: 'Restaurant Reservations',
    value:
      'You are a restaurant reservation assistant. Confirm party size, date, time, and special requests. Keep replies concise and polite with friendly emojis.',
  },
];

export const Dashboard: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState('Loading');
  const [qrImage, setQrImage] = useState('');
  const [botEnabled, setBotEnabled] = useState(true);
  const [messageHistory, setMessageHistory] = useState<MessageItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('login');
  const [currentUser, setCurrentUser] = useState<{ uid: string; email: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authType, setAuthType] = useState<'local' | 'firebase' | null>(null);
  const [connectionError, setConnectionError] = useState('');
  const [systemInstruction, setSystemInstruction] = useState(
    'You are a helpful WhatsApp assistant. Keep replies brief and use emojis.'
  );
  const [apiKey, setApiKey] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupStatus, setSignupStatus] = useState('');
  const [outletId, setOutletId] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [integrationApiKey, setIntegrationApiKey] = useState('');
  const [integrationStatus, setIntegrationStatus] = useState('');
  const [showIntegrationApiKey, setShowIntegrationApiKey] = useState(false);
  const [testConnectionLoading, setTestConnectionLoading] = useState(false);
  const [testConnectionMessage, setTestConnectionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const apiBase = getApiBaseUrl();
  const api = (path: string) => `${apiBase}${path.startsWith('/') ? path : `/${path}`}`;

  const ensureSocket = useCallback(
    (uid: string) => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      const socketUrl = getSocketUrl() || window.location.origin;
      const socket = io(socketUrl, {
        query: { userId: uid, userEmail: currentUser?.email || undefined },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });
      socketRef.current = socket;

      socket.on('connection_status', (status: string) => setConnectionStatus(status));
      socket.on('qr_code', (dataUrl: string) => setQrImage(dataUrl || ''));
      socket.on('message_log', (history: MessageItem[]) => setMessageHistory(Array.isArray(history) ? history : []));
      socket.on('bot_status', (enabled: boolean) => setBotEnabled(!!enabled));

      socket.on('connect', () => {
        setConnectionError('');
        setTimeout(() => {
          socket.emit('request_qr');
        }, 500);
      });
      socket.on('disconnect', (reason: string) => {
        setConnectionStatus('Disconnected');
        if (reason === 'io server disconnect') {
          setConnectionError('Server disconnected. Please refresh the page.');
        }
      });
      socket.on('connect_error', (err: Error) => {
        setConnectionStatus('Connection Error');
        setConnectionError(
          `Cannot connect to server: ${err?.message || 'Unknown error'}. Make sure the bot server is running.`
        );
      });
      socket.on('error', (err: unknown) => {
        const msg = err && typeof err === 'object' && 'message' in err ? String((err as Error).message) : JSON.stringify(err);
        setConnectionError(`Socket error: ${msg}`);
      });
    },
    [currentUser?.email]
  );

  const showAuthUI = useCallback((isAuthed: boolean) => {
    setActiveTab(isAuthed ? 'dashboard' : 'login');
  }, []);

  useEffect(() => {
    const localAuthData = localStorage.getItem(LOCAL_AUTH_KEY);
    if (localAuthData) {
      try {
        const auth = JSON.parse(localAuthData);
        if (auth.userId && auth.email) {
          setCurrentUser({ uid: auth.userId, email: auth.email });
          setUserId(auth.userId);
          setAuthType('local');
          showAuthUI(true);
          return;
        }
      } catch (e) {
        console.error('Failed to parse local auth:', e);
      }
    }

    if (!firebaseAuth) return;
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user: User | null) => {
      if (authType === 'local') return;
      setCurrentUser(user ? { uid: user.uid, email: user.email || 'Logged in' } : null);
      setUserId(user?.uid || null);
      setAuthType(user ? 'firebase' : null);
      if (user) {
        showAuthUI(true);
        ensureSocket(user.uid);
      } else {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
        setQrImage('');
        setMessageHistory([]);
        setConnectionStatus('Loading');
        showAuthUI(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId && currentUser) {
      ensureSocket(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetch(api(`/api/settings/${userId}`))
      .then((res) => res.json())
      .then((data) => {
        if (data.systemInstruction) setSystemInstruction(data.systemInstruction);
        if (data.apiKey) setApiKey(data.apiKey);
        if (data.outletId != null) setOutletId(data.outletId);
        if (data.webhookUrl != null) setWebhookUrl(data.webhookUrl);
        if (data.integrationApiKey != null) setIntegrationApiKey(data.integrationApiKey);
      })
      .catch((err) => console.error('Failed to load settings', err));
  }, [userId, apiBase]);

  const loadIntegrationSettings = useCallback(() => {
    const saved = localStorage.getItem('integration_settings');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.outletId != null) setOutletId(data.outletId);
        setWebhookUrl(data.webhookUrl || '');
        setIntegrationApiKey(data.apiKey || '');
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    if (currentUser && userId) loadIntegrationSettings();
  }, [currentUser, userId, loadIntegrationSettings]);

  const extractTextFromFile = useCallback(
    async (file: File): Promise<string> => {
      const name = file.name || '';
      const ext = name.split('.').pop()?.toLowerCase() || '';
      const allowed = ['txt', 'docx', 'pdf'];

      if (!allowed.includes(ext)) {
        setSaveStatus('Unsupported file type. Please upload a .txt, .docx, or .pdf file.');
        setTimeout(() => setSaveStatus(''), 2000);
        return '';
      }

      const readAsArrayBuffer = (f: File) =>
        new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(reader.error || new Error('Failed to read file.'));
          reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) resolve(reader.result);
            else resolve(new TextEncoder().encode(String(reader.result)).buffer);
          };
          reader.readAsArrayBuffer(f);
        });

      const readAsText = (f: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(reader.error || new Error('Failed to read file.'));
          reader.onload = () => {
            if (typeof reader.result === 'string') resolve(reader.result);
            else resolve(new TextDecoder('utf-8').decode(reader.result as ArrayBuffer));
          };
          reader.readAsText(f);
        });

      try {
        if (ext === 'txt') {
          return (await readAsText(file)).trim();
        }

        if (ext === 'docx') {
          const buffer = await readAsArrayBuffer(file);
          const result = await (mammoth as any).extractRawText({ arrayBuffer: buffer });
          return (result?.value || '').trim();
        }

        if (ext === 'pdf') {
          const buffer = await readAsArrayBuffer(file);
          const loadingTask = (pdfjsLib as any).getDocument({ data: buffer });
          const pdf = await loadingTask.promise;

          const pageTexts: string[] = [];
          for (let i = 1; i <= pdf.numPages; i += 1) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = (content.items || [])
              .map((item: any) => ('str' in item ? item.str : ''))
              .join(' ');
            pageTexts.push(strings);
          }
          return pageTexts.join('\n\n').trim();
        }
      } catch (err) {
        console.error('Failed to import file', err);
        setSaveStatus('Could not read file. Make sure it is a valid .txt, .docx, or .pdf document.');
        setTimeout(() => setSaveStatus(''), 3000);
        return '';
      }

      return '';
    },
    []
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginStatus('Logging in...');
    const email = loginEmail.trim();
    const password = loginPassword;

    const isAdminEmail = email === 'admin@rdp.com';

    const doLocalLogin = async (): Promise<boolean> => {
      try {
        const res = await fetch(api('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (data.success) {
          setCurrentUser(data.user);
          setUserId(data.user.uid);
          setAuthType('local');
          localStorage.setItem(
            LOCAL_AUTH_KEY,
            JSON.stringify({ userId: data.user.uid, email: data.user.email })
          );
          showAuthUI(true);
          ensureSocket(data.user.uid);
          setLoginStatus('Logged in!');
          setTimeout(() => setLoginStatus(''), 1200);
          return true;
        }
        setLoginStatus(data.message || 'Invalid credentials');
        return false;
      } catch (_) {
        return false;
      }
    };

    // Admin-only: use backend only
    if (isAdminEmail) {
      await doLocalLogin();
      return;
    }

    // For all other emails: try Firebase Auth first (users in Firebase Authentication)
    if (firebaseAuth) {
      try {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
        setLoginStatus('Logged in!');
        setTimeout(() => setLoginStatus(''), 1200);
        return;
      } catch (err: unknown) {
        const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : '';
        const msg = err && typeof err === 'object' && 'message' in err ? (err as Error).message : 'Login failed';
        if (code === 'auth/unauthorized-domain') {
          setLoginStatus('This domain is not allowed for login. Add this site in Firebase Console → Authentication → Authorized domains.');
          return;
        }
        if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
          setLoginStatus('Invalid email or password. Check your Firebase Authentication account.');
          return;
        }
        setLoginStatus(msg);
        return;
      }
    }

    // Fallback: try backend (e.g. other local accounts)
    const localOk = await doLocalLogin();
    if (!localOk) {
      setLoginStatus('Firebase not configured and backend login failed. Use admin@rdp.com for backend login.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseAuth) {
      setSignupStatus('Firebase not configured');
      return;
    }
    setSignupStatus('Creating account...');
    try {
      await createUserWithEmailAndPassword(firebaseAuth, signupEmail, signupPassword);
      setSignupStatus('Account created!');
      setTimeout(() => setSignupStatus(''), 1200);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? (err as Error).message : 'Signup failed';
      setSignupStatus(msg);
    }
  };

  const handleLogout = async () => {
    if (authType === 'local') {
      localStorage.removeItem(LOCAL_AUTH_KEY);
      setCurrentUser(null);
      setUserId(null);
      setAuthType(null);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setQrImage('');
      setMessageHistory([]);
      setConnectionStatus('Loading');
      showAuthUI(false);
    } else if (firebaseAuth) {
      await signOut(firebaseAuth);
    }
  };

  const handleResetSession = async () => {
    if (!userId) return;
    if (!window.confirm('Are you sure you want to reset your WhatsApp session? You will need to scan the QR code again.'))
      return;
    try {
      const res = await fetch(api(`/api/reset-session/${userId}`), { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setConnectionError('');
        setConnectionStatus('Initializing');
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
        setTimeout(() => userId && ensureSocket(userId), 1000);
      } else {
        setConnectionError(data.message || 'Failed to reset session');
      }
    } catch (err) {
      setConnectionError('Error resetting session: ' + (err instanceof Error ? err.message : ''));
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setSaveStatus('Please login first.');
      return;
    }
    setSaveStatus('Saving...');
    try {
      await fetch(api(`/api/settings/${userId}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: systemInstruction.trim(),
          apiKey: apiKey.trim(),
        }),
      });
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 1500);
    } catch (err) {
      setSaveStatus('Error saving.');
    }
  };

  const saveIntegrationSettings = useCallback(async () => {
    if (!userId) return;
    setIntegrationStatus('Saving...');
    try {
      await fetch(api(`/api/settings/${userId}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: outletId.trim(),
          webhookUrl: webhookUrl.trim(),
          integrationApiKey: integrationApiKey.trim(),
        }),
      });
      localStorage.setItem(
        'integration_settings',
        JSON.stringify({ outletId, webhookUrl, apiKey: integrationApiKey })
      );
      setIntegrationStatus('Saved!');
      setTimeout(() => setIntegrationStatus(''), 1500);
    } catch (_) {
      setIntegrationStatus('Error saving.');
      setTimeout(() => setIntegrationStatus(''), 2000);
    }
  }, [userId, outletId, webhookUrl, integrationApiKey, apiBase]);

  useEffect(() => {
    if (!userId) return;
    const hasAny = outletId.trim() || webhookUrl.trim() || integrationApiKey.trim();
    if (!hasAny) return;
    const t = setTimeout(() => {
      saveIntegrationSettings();
    }, 1500);
    return () => clearTimeout(t);
  }, [userId, outletId, webhookUrl, integrationApiKey, saveIntegrationSettings]);

  const handleIntegrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setIntegrationStatus('Please log in first.');
      return;
    }
    await saveIntegrationSettings();
  };

  const handleTestConnection = async () => {
    const url = webhookUrl.trim();
    if (!url) {
      setTestConnectionMessage({ type: 'error', text: 'Please enter a Webhook URL first.' });
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setTestConnectionMessage({ type: 'error', text: 'Webhook URL must start with http:// or https://' });
      return;
    }
    setTestConnectionMessage(null);
    setTestConnectionLoading(true);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': integrationApiKey.trim(),
          'X-Outlet-Id': outletId.trim(),
        },
        body: JSON.stringify({ action: 'test_connection' }),
      });
      if (res.ok) {
        setTestConnectionMessage({ type: 'success', text: 'Success' });
      } else {
        const body = await res.text();
        const reason = body || res.statusText || `HTTP ${res.status}`;
        setTestConnectionMessage({ type: 'error', text: reason });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      setTestConnectionMessage({ type: 'error', text: msg });
    } finally {
      setTestConnectionLoading(false);
    }
  };

  const statusColor = STATUS_COLORS[connectionStatus] || 'bg-slate-500';
  const tabs: { id: TabId; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'settings', label: 'Settings' },
    { id: 'integration', label: 'Integration' },
    { id: 'login', label: 'Login' },
    { id: 'signup', label: 'Signup' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 md:pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">WhatsApp Assistant</h1>
            <p className="text-slate-400 mt-1">
              Monitor connection, scan QR, tweak AI settings, and watch replies.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">{currentUser.email}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700"
                >
                  Logout
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full shadow-sm ${statusColor}`} />
              <span className="text-sm font-medium text-slate-200">{connectionStatus}</span>
            </div>
          </div>
        </header>

        <nav className="mt-6 flex gap-3 text-sm font-medium flex-wrap">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-full border transition ${
                activeTab === id
                  ? 'bg-slate-800 text-slate-100 border-slate-700'
                  : 'text-slate-300 hover:text-white border-transparent hover:border-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Dashboard tab */}
        {activeTab === 'dashboard' && (
          <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {!currentUser ? (
              <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 shadow-lg flex flex-col items-center justify-center min-h-[360px] text-center">
                <div className="max-w-sm">
                  <div className="h-16 w-16 rounded-full border-2 border-slate-600 grid place-items-center mx-auto mb-4 text-3xl">
                    🔐
                  </div>
                  <h2 className="text-xl font-semibold text-slate-200 mb-2">Please log in</h2>
                  <p className="text-slate-400 text-sm mb-6">
                    Log in or sign up to view the QR code and manage your WhatsApp connection.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="px-5 py-2.5 rounded-xl font-medium bg-orange-500 hover:bg-orange-600 text-white transition"
                    >
                      Log in
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('signup')}
                      className="px-5 py-2.5 rounded-xl font-medium border border-slate-600 hover:border-slate-500 text-slate-200 transition"
                    >
                      Sign up
                    </button>
                  </div>
                </div>
              </section>
            ) : (
              <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">QR Code</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${statusColor}`} />
                      <span className="text-xs text-slate-400">{connectionStatus}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetSession}
                    className="px-3 py-1.5 text-xs rounded-lg border border-red-800 bg-red-900/20 hover:bg-red-900/40 text-red-300 transition"
                  >
                    Reset Session
                  </button>
                </div>
                {connectionError && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-sm">
                    {connectionError}
                  </div>
                )}
                <div className="flex flex-col items-center justify-center h-[360px] rounded-xl border border-dashed border-slate-700 bg-slate-900">
                  {qrImage ? (
                    <img
                      src={qrImage}
                      alt="QR Code"
                      className="h-72 w-72 object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-500">
                      <div className="h-24 w-24 rounded-full border-2 border-slate-700 grid place-items-center mx-auto mb-4">
                        <span className="text-2xl">📱</span>
                      </div>
                      <p className="text-lg font-medium">Waiting for QR code...</p>
                      <p className="text-sm text-slate-500 mt-1">You will see the code here when the bot is ready.</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Last 5 Messages</h2>
                  <span className="text-xs text-slate-400">Handled by Gemini</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !botEnabled;
                    setBotEnabled(next);
                    socketRef.current?.emit('toggle_bot', next);
                  }}
                  className={`px-3 py-2 text-sm rounded-lg border transition ${
                    botEnabled ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : 'bg-red-600 border-red-800'
                  }`}
                >
                  Bot: {botEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {messageHistory.length === 0 ? (
                  <p className="text-slate-500 text-sm">No messages yet.</p>
                ) : (
                  [...messageHistory]
                    .slice(-5)
                    .reverse()
                    .map((item, i) => (
                      <div
                        key={i}
                        className="border border-slate-800 rounded-xl p-3 bg-slate-900"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span>{item.from}</span>
                          <span>{new Date(item.time).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm text-slate-200">
                          <span className="font-semibold text-slate-300">User:</span> {item.body}
                        </p>
                        <p className="text-sm text-emerald-300 mt-1">
                          <span className="font-semibold text-emerald-200">Bot:</span> {item.reply}
                        </p>
                      </div>
                    ))
                )}
              </div>
            </section>
          </section>
        )}

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <section className="mt-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">AI Settings</h2>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <p className="text-sm text-amber-300 font-semibold">Policy tip</p>
                  <p className="text-xs text-slate-300 mt-1">
                    For compliance, give the bot a specific role (e.g., &quot;Bakery customer support&quot;) instead of a generic AI assistant.
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-300 mb-1">Templates (click to auto-fill)</p>
                  <div className="flex flex-wrap gap-2">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => setSystemInstruction(t.value)}
                        className="template-btn px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm hover:bg-slate-700"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">System Instruction</label>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm hover:bg-slate-700 cursor-pointer">
                      Import from file
                      <input
                        type="file"
                        accept=".txt,.docx,.pdf"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const text = await extractTextFromFile(file);
                          if (text) {
                            setSystemInstruction((prev) => `${prev}\n${text}`.trim());
                            setSaveStatus(`Imported "${file.name}"`);
                            setTimeout(() => setSaveStatus(''), 1500);
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <span className="text-xs text-slate-500">Imports text content and appends it to the instruction.</span>
                  </div>
                  <textarea
                    value={systemInstruction}
                    onChange={(e) => setSystemInstruction(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 p-3"
                    rows={4}
                    placeholder="You are a helpful WhatsApp assistant. Keep replies brief and use emojis."
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 p-3"
                    placeholder="Your Google AI Studio API Key"
                  />
                  <p className="text-xs text-slate-500 mt-1">Stored locally on this server (JSON). Per-user settings.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition"
                  >
                    Save Settings
                  </button>
                  <span className="text-sm text-slate-400">{saveStatus}</span>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Integration tab */}
        {activeTab === 'integration' && (
          <section className="mt-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg max-w-2xl">
              <h2 className="text-xl font-semibold mb-4">Integration Settings</h2>
              <form onSubmit={handleIntegrationSubmit} className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <p className="text-sm text-blue-300 font-semibold">ℹ️ CRM integration</p>
                  <p className="text-xs text-slate-300 mt-1">
                    Paste your CRM credentials (e.g. Razak Residence). The bot will send customer messages to your webhook and use the response to answer with booking status, prices, etc.
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Outlet ID</label>
                  <input
                    type="text"
                    value={outletId}
                    onChange={(e) => setOutletId(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 p-3"
                    placeholder="Your CRM outlet ID"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Secret API Key</label>
                  <div className="relative flex items-center">
                    <input
                      type={showIntegrationApiKey ? 'text' : 'password'}
                      value={integrationApiKey}
                      onChange={(e) => setIntegrationApiKey(e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 p-3 pr-11"
                      placeholder="CRM API key (sent as x-api-key header)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowIntegrationApiKey((prev) => !prev)}
                      className="absolute right-2 p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                      title={showIntegrationApiKey ? 'Hide' : 'Show'}
                      aria-label={showIntegrationApiKey ? 'Hide API key' : 'Show API key'}
                    >
                      {showIntegrationApiKey ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Webhook URL</label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 p-3"
                    placeholder="https://your-crm.com/webhook"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testConnectionLoading}
                    className="px-4 py-2 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {testConnectionLoading ? 'Testing...' : 'Test Connection'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition"
                  >
                    Save
                  </button>
                  <span className="text-sm text-slate-400">{integrationStatus}</span>
                </div>
                {testConnectionMessage && (
                  <p
                    className={`text-sm mt-2 ${testConnectionMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}
                    role="status"
                  >
                    {testConnectionMessage.type === 'success' ? '✓ ' : ''}
                    {testConnectionMessage.text}
                  </p>
                )}
              </form>
            </div>
          </section>
        )}

        {/* Login tab */}
        {activeTab === 'login' && (
          <section className="mt-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg max-w-xl">
              <h2 className="text-xl font-semibold mb-4">Login</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 p-3"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 p-3"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition"
                  >
                    Login
                  </button>
                  <span className="text-sm text-slate-400">{loginStatus}</span>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Signup tab */}
        {activeTab === 'signup' && (
          <section className="mt-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg max-w-xl">
              <h2 className="text-xl font-semibold mb-4">Signup</h2>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <p className="text-sm text-amber-300 font-semibold">Compliance tip</p>
                  <p className="text-xs text-slate-300 mt-1">
                    Use a specific role (e.g., &quot;Bakery customer support&quot;) instead of a generic assistant.
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 p-3"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 p-3"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition"
                  >
                    Create Account
                  </button>
                  <span className="text-sm text-slate-400">{signupStatus}</span>
                </div>
              </form>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
