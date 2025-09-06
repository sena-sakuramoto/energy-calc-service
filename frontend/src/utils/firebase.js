// frontend/src/utils/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase設定（GitHub Secretsの環境変数から取得）
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Firebase初期化
let app, auth, db, googleProvider;

try {
  // 環境変数チェック
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('Firebase configuration is incomplete. Some features may not work.');
  }
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
  // フォールバック処理
  auth = null;
  db = null;
  googleProvider = null;
}

export { auth, db, googleProvider };

// プロバイダー設定（googleProviderが初期化されている場合のみ）
if (googleProvider) {
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
}