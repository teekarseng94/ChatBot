import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDzi4JLSQ5i5JPhYkPZSABd5W3cZJgDfJ0',
  authDomain: 'chatbot20-21e3a.firebaseapp.com',
  projectId: 'chatbot20-21e3a',
  storageBucket: 'chatbot20-21e3a.firebasestorage.app',
  messagingSenderId: '1098593506772',
  appId: '1:1098593506772:web:61e0c8c685934122027241',
  measurementId: 'G-NM4EQL5YZT',
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (e) {
  console.warn('Firebase init failed:', e);
}

export { app, auth as firebaseAuth };
