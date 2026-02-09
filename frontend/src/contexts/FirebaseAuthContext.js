// frontend/src/contexts/FirebaseAuthContext.js
// Firebase完全対応のAuthContext
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';

// E2Eモード判定
const IS_E2E = process.env.NEXT_PUBLIC_E2E_AUTH === 'true';

// Firebase依存は通常モードでのみインポート
let registerWithEmail, signInWithEmail, signInWithGoogle, signOutUser, onAuthStateChange, createUserProfile, getUserProfile;
if (!IS_E2E) {
  const firebaseAuth = require('../utils/firebaseAuth');
  registerWithEmail = firebaseAuth.registerWithEmail;
  signInWithEmail = firebaseAuth.signInWithEmail;
  signInWithGoogle = firebaseAuth.signInWithGoogle;
  signOutUser = firebaseAuth.signOutUser;
  onAuthStateChange = firebaseAuth.onAuthStateChange;
  createUserProfile = firebaseAuth.createUserProfile;
  getUserProfile = firebaseAuth.getUserProfile;
}

// E2Eモード用: bcrypt / CryptoJS は遅延ロード
let bcrypt, CryptoJS;
if (IS_E2E) {
  bcrypt = require('bcryptjs');
  CryptoJS = require('crypto-js');
}

const E2E_SECRET = 'energy-calc-secret-key';

const AuthContext = createContext({
  user: null,
  firebaseUser: null,
  setUser: () => {},
  login: async () => false,
  register: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
});

export const FirebaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ── E2Eモード: localStorage ベース認証 ──
  useEffect(() => {
    if (IS_E2E) {
      const initE2EAuth = () => {
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }
        const sessionToken = localStorage.getItem('sessionToken');
        const sessionExpiry = localStorage.getItem('sessionExpiry');

        if (sessionToken && sessionExpiry) {
          const now = new Date().getTime();
          if (now < parseInt(sessionExpiry)) {
            try {
              const decrypted = CryptoJS.AES.decrypt(sessionToken, E2E_SECRET).toString(CryptoJS.enc.Utf8);
              if (decrypted) {
                const userData = JSON.parse(decrypted);
                setUser(userData);
                console.log('[E2E] Session restored:', userData.email);
              } else {
                throw new Error('Invalid session token');
              }
            } catch (err) {
              console.error('[E2E] Invalid session:', err);
              localStorage.removeItem('sessionToken');
              localStorage.removeItem('sessionExpiry');
              setUser(null);
            }
          } else {
            console.log('[E2E] Session expired');
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('sessionExpiry');
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      };
      initE2EAuth();
      return; // E2Eモードではunsubscribe不要
    }

    // ── 通常モード: Firebase onAuthStateChange ──
    const unsubscribe = onAuthStateChange(async (fbUser) => {
      console.log('Auth state changed:', fbUser ? 'User logged in' : 'User logged out');
      if (fbUser) {
        // Firebase認証済みユーザーの場合、Firestoreから詳細情報取得
        try {
          const userProfile = await getUserProfile(fbUser.uid);

          const userData = {
            id: fbUser.uid,
            email: fbUser.email,
            full_name: userProfile?.displayName || fbUser.displayName,
            displayName: userProfile?.displayName || fbUser.displayName,
            photoURL: userProfile?.photoURL || fbUser.photoURL,
            company: userProfile?.company || '',
            authType: userProfile?.authType || 'google',
            isActive: userProfile?.isActive !== false, // デフォルトtrue
            isAdmin: userProfile?.isAdmin || false,
            createdAt: userProfile?.createdAt,
            lastLoginAt: userProfile?.lastLoginAt,
            emailVerified: fbUser.emailVerified
          };

          setUser(userData);
          setFirebaseUser(fbUser);
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Firebase接続エラー時のフォールバック処理
          const fallbackUser = {
            id: fbUser.uid,
            email: fbUser.email,
            full_name: fbUser.displayName,
            displayName: fbUser.displayName,
            authType: 'google',
            isActive: true,
            isAdmin: fbUser.email === 's.sakuramoto@archi-prisma.co.jp' || fbUser.email === 'admin@archi-prisma.co.jp',
            offline: true // オフライン状態を示すフラグ
          };

          setUser(fallbackUser);
          setFirebaseUser(fbUser);

          // バックグラウンドでFirestoreプロフィール作成を試行（エラー無視）
          try {
            await createUserProfile(fbUser);
          } catch (retryError) {
            console.warn('Could not create user profile, continuing in offline mode:', retryError);
          }
        }
      } else {
        // ログアウト状態
        setUser(null);
        setFirebaseUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── ログイン ──
  const login = async (credentials = null) => {
    if (IS_E2E) {
      return e2eLogin(credentials);
    }

    try {
      let fbUser;

      if (credentials?.email && credentials?.password) {
        // メールログイン
        fbUser = await signInWithEmail(credentials.email, credentials.password);
      } else {
        // Googleログイン
        fbUser = await signInWithGoogle();
      }

      console.log('Login successful:', fbUser.email);

      // ログイン後のリダイレクト先を確認
      const redirectUrl = router.query.redirect || '/dashboard';
      router.push(redirectUrl);
      return true;
    } catch (error) {
      console.error('Login failed:', error);

      // Firebase固有のエラーメッセージを日本語化
      let errorMessage = 'ログインに失敗しました。';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'このメールアドレスは登録されていません。';
          break;
        case 'auth/wrong-password':
          errorMessage = 'パスワードが間違っています。';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'メールアドレスまたはパスワードが間違っています。';
          break;
        case 'auth/invalid-email':
          errorMessage = 'メールアドレスの形式が正しくありません。';
          break;
        case 'auth/user-disabled':
          errorMessage = 'このアカウントは無効化されています。';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'ログイン試行回数が多すぎます。しばらく待ってからお試しください。';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Googleログインがキャンセルされました。';
          break;
        default:
          errorMessage = error.message || 'ログインに失敗しました。';
      }

      throw new Error(errorMessage);
    }
  };

  // ── E2Eログイン ──
  const e2eLogin = async (credentials) => {
    if (!credentials?.email || !credentials?.password) {
      throw new Error('メールアドレスとパスワードは必須です。');
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const found = registeredUsers.find(u => u.email === credentials.email);

    if (!found || !(await bcrypt.compare(credentials.password, found.hashedPassword))) {
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }

    const loginUser = {
      id: found.id,
      email: found.email,
      full_name: found.full_name,
      company: found.company,
      is_active: true,
      isActive: true,
      authType: 'email',
      registrationDate: found.registrationDate,
      loginTime: new Date().toISOString(),
    };

    // セッショントークン生成（24時間有効）
    const sessionToken = CryptoJS.AES.encrypt(JSON.stringify(loginUser), E2E_SECRET).toString();
    const sessionExpiry = new Date().getTime() + 24 * 60 * 60 * 1000;

    localStorage.setItem('sessionToken', sessionToken);
    localStorage.setItem('sessionExpiry', sessionExpiry.toString());

    setUser(loginUser);
    console.log('[E2E] User logged in:', loginUser.email);

    const redirectUrl = router.query.redirect || '/dashboard';
    router.push(redirectUrl);
    return true;
  };

  // ── ユーザー登録 ──
  const register = async (userData) => {
    if (IS_E2E) {
      return e2eRegister(userData);
    }

    try {
      const { email, password, full_name, company } = userData;

      if (!email || !password) {
        throw new Error('メールアドレスとパスワードは必須です。');
      }

      if (password.length < 6) {
        throw new Error('パスワードは6文字以上である必要があります。');
      }

      const fbUser = await registerWithEmail(email, password, {
        full_name,
        company
      });

      console.log('Registration successful:', fbUser.email);
      router.push('/login?registered=true');
      return { message: '登録が完了しました' };

    } catch (error) {
      console.error('Registration failed:', error);

      // Firebase固有のエラーメッセージを日本語化
      let errorMessage = '登録に失敗しました。';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'このメールアドレスは既に使用されています。';
          break;
        case 'auth/invalid-email':
          errorMessage = 'メールアドレスの形式が正しくありません。';
          break;
        case 'auth/weak-password':
          errorMessage = 'パスワードが弱すぎます。より強力なパスワードを使用してください。';
          break;
        default:
          errorMessage = error.message || '登録に失敗しました。';
      }

      throw new Error(errorMessage);
    }
  };

  // ── E2E登録 ──
  const e2eRegister = async (userData) => {
    const { email, password, full_name, company } = userData;

    if (!email || !password) {
      throw new Error('メールアドレスとパスワードは必須です。');
    }
    if (password.length < 6) {
      throw new Error('パスワードは6文字以上である必要があります。');
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    if (registeredUsers.find(u => u.email === email)) {
      throw new Error('このメールアドレスは既に登録されています');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now(),
      email,
      hashedPassword,
      full_name: full_name || '',
      company: company || '',
      registrationDate: new Date().toISOString(),
      is_active: true,
    };

    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    console.log('[E2E] User registered:', email);
    router.push('/login?registered=true');
    return { message: '登録が完了しました' };
  };

  // ── ログアウト ──
  const logout = async () => {
    if (IS_E2E) {
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('sessionExpiry');
      setUser(null);
      console.log('[E2E] User logged out');
      router.push('/login');
      return;
    }

    try {
      await signOutUser();
      console.log('Logout successful');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    firebaseUser,
    setUser,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

export default AuthContext;
