import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAdminEmail } from '../utils/adminAccess';

const IS_E2E = process.env.NEXT_PUBLIC_E2E_AUTH === 'true';

let registerWithEmail;
let signInWithEmail;
let signInWithGoogle;
let signOutUser;
let onAuthStateChange;
let createUserProfile;
let getUserProfile;

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

let bcrypt;
let CryptoJS;
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
          const now = Date.now();
          if (now < parseInt(sessionExpiry, 10)) {
            try {
              const decrypted = CryptoJS.AES.decrypt(
                sessionToken,
                E2E_SECRET,
              ).toString(CryptoJS.enc.Utf8);

              if (!decrypted) {
                throw new Error('Invalid session token');
              }

              const userData = JSON.parse(decrypted);
              setUser(userData);
              console.log('[E2E] Session restored:', userData.email);
            } catch (error) {
              console.error('[E2E] Invalid session:', error);
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
      return undefined;
    }

    const unsubscribe = onAuthStateChange(async (fbUser) => {
      console.log('Auth state changed:', fbUser ? 'User logged in' : 'User logged out');

      if (fbUser) {
        try {
          const userProfile = await getUserProfile(fbUser.uid);
          if (isAdminEmail(fbUser.email) && !userProfile?.isAdmin) {
            await createUserProfile(fbUser);
          }

          const userData = {
            id: fbUser.uid,
            email: fbUser.email,
            full_name: userProfile?.displayName || fbUser.displayName,
            displayName: userProfile?.displayName || fbUser.displayName,
            photoURL: userProfile?.photoURL || fbUser.photoURL,
            company: userProfile?.company || '',
            authType: userProfile?.authType || 'google',
            isActive: userProfile?.isActive !== false,
            isAdmin: Boolean(userProfile?.isAdmin) || isAdminEmail(fbUser.email),
            createdAt: userProfile?.createdAt,
            lastLoginAt: userProfile?.lastLoginAt,
            emailVerified: fbUser.emailVerified,
          };

          setUser(userData);
          setFirebaseUser(fbUser);
        } catch (error) {
          console.error('Error loading user profile:', error);

          const fallbackUser = {
            id: fbUser.uid,
            email: fbUser.email,
            full_name: fbUser.displayName,
            displayName: fbUser.displayName,
            authType: 'google',
            isActive: true,
            isAdmin: isAdminEmail(fbUser.email),
            offline: true,
          };

          setUser(fallbackUser);
          setFirebaseUser(fbUser);

          try {
            await createUserProfile(fbUser);
          } catch (retryError) {
            console.warn(
              'Could not create user profile, continuing in offline mode:',
              retryError,
            );
          }
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials = null) => {
    if (IS_E2E) {
      return e2eLogin(credentials);
    }

    try {
      let fbUser;

      if (credentials?.email && credentials?.password) {
        fbUser = await signInWithEmail(credentials.email, credentials.password);
      } else {
        fbUser = await signInWithGoogle();
      }

      console.log('Login successful:', fbUser.email);

      const redirectUrl = router.query.redirect || '/dashboard';
      router.push(redirectUrl);
      return true;
    } catch (error) {
      console.error('Login failed:', error);

      let errorMessage = 'ログインに失敗しました。';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'このメールアドレスは登録されていません。';
          break;
        case 'auth/wrong-password':
          errorMessage = 'パスワードが正しくありません。';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'メールアドレスまたはパスワードが正しくありません。';
          break;
        case 'auth/invalid-email':
          errorMessage = 'メールアドレスの形式が正しくありません。';
          break;
        case 'auth/user-disabled':
          errorMessage = 'このアカウントは無効化されています。';
          break;
        case 'auth/too-many-requests':
          errorMessage = '試行回数が多すぎます。しばらく待ってから再度お試しください。';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Googleログインの画面が途中で閉じられました。';
          break;
        default:
          errorMessage = error.message || 'ログインに失敗しました。';
      }

      throw new Error(errorMessage);
    }
  };

  const e2eLogin = async (credentials) => {
    if (!credentials?.email || !credentials?.password) {
      throw new Error('メールアドレスとパスワードを入力してください。');
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const found = registeredUsers.find((entry) => entry.email === credentials.email);

    if (!found || !(await bcrypt.compare(credentials.password, found.hashedPassword))) {
      throw new Error('メールアドレスまたはパスワードが正しくありません。');
    }

    const loginUser = {
      id: found.id,
      email: found.email,
      full_name: found.full_name,
      company: found.company,
      is_active: true,
      isActive: true,
      isAdmin: Boolean(found.isAdmin) || isAdminEmail(found.email),
      authType: 'email',
      registrationDate: found.registrationDate,
      loginTime: new Date().toISOString(),
    };

    const sessionToken = CryptoJS.AES.encrypt(
      JSON.stringify(loginUser),
      E2E_SECRET,
    ).toString();
    const sessionExpiry = Date.now() + 24 * 60 * 60 * 1000;

    localStorage.setItem('sessionToken', sessionToken);
    localStorage.setItem('sessionExpiry', sessionExpiry.toString());

    setUser(loginUser);
    console.log('[E2E] User logged in:', loginUser.email);

    const redirectUrl = router.query.redirect || '/dashboard';
    router.push(redirectUrl);
    return true;
  };

  const register = async (userData) => {
    if (IS_E2E) {
      return e2eRegister(userData);
    }

    try {
      const { email, password, full_name, company } = userData;

      if (!email || !password) {
        throw new Error('メールアドレスとパスワードを入力してください。');
      }

      if (password.length < 6) {
        throw new Error('パスワードは6文字以上で入力してください。');
      }

      const fbUser = await registerWithEmail(email, password, {
        full_name,
        company,
      });

      console.log('Registration successful:', fbUser.email);
      router.push('/login?registered=true');
      return { message: '登録が完了しました。' };
    } catch (error) {
      console.error('Registration failed:', error);

      let errorMessage = '登録に失敗しました。';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'このメールアドレスはすでに使用されています。';
          break;
        case 'auth/invalid-email':
          errorMessage = 'メールアドレスの形式が正しくありません。';
          break;
        case 'auth/weak-password':
          errorMessage = 'パスワードが弱すぎます。より長く安全なものを設定してください。';
          break;
        default:
          errorMessage = error.message || '登録に失敗しました。';
      }

      throw new Error(errorMessage);
    }
  };

  const e2eRegister = async (userData) => {
    const { email, password, full_name, company } = userData;

    if (!email || !password) {
      throw new Error('メールアドレスとパスワードを入力してください。');
    }
    if (password.length < 6) {
      throw new Error('パスワードは6文字以上で入力してください。');
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    if (registeredUsers.find((entry) => entry.email === email)) {
      throw new Error('このメールアドレスはすでに登録されています。');
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
      isAdmin: isAdminEmail(email),
    };

    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    console.log('[E2E] User registered:', email);
    router.push('/login?registered=true');
    return { message: '登録が完了しました。' };
  };

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
