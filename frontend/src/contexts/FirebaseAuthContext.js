// frontend/src/contexts/FirebaseAuthContext.js
// Firebase完全対応のAuthContext
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { 
  registerWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  onAuthStateChange,
  createUserProfile,
  getUserProfile
} from '../utils/firebaseAuth';

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
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Firebase認証済みユーザーの場合、Firestoreから詳細情報取得
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          
          const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            full_name: userProfile?.displayName || firebaseUser.displayName,
            displayName: userProfile?.displayName || firebaseUser.displayName,
            photoURL: userProfile?.photoURL || firebaseUser.photoURL,
            company: userProfile?.company || '',
            authType: userProfile?.authType || 'google',
            isActive: userProfile?.isActive !== false, // デフォルトtrue
            isAdmin: userProfile?.isAdmin || false,
            createdAt: userProfile?.createdAt,
            lastLoginAt: userProfile?.lastLoginAt,
            emailVerified: firebaseUser.emailVerified
          };
          
          setUser(userData);
          setFirebaseUser(firebaseUser);
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Firebase認証はあるが、Firestoreプロフィールがない場合は作成
          await createUserProfile(firebaseUser);
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            full_name: firebaseUser.displayName,
            displayName: firebaseUser.displayName,
            authType: 'google',
            isActive: true,
            isAdmin: firebaseUser.email === 's.sakuramoto@archi-prisma.co.jp' || firebaseUser.email === 'admin@archi-prisma.co.jp'
          });
          setFirebaseUser(firebaseUser);
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

  // メール/Googleログイン
  const login = async (credentials = null) => {
    try {
      let firebaseUser;
      
      if (credentials?.email && credentials?.password) {
        // メールログイン
        firebaseUser = await signInWithEmail(credentials.email, credentials.password);
      } else {
        // Googleログイン
        firebaseUser = await signInWithGoogle();
      }
      
      console.log('Login successful:', firebaseUser.email);
      router.push('/');
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

  // ユーザー登録
  const register = async (userData) => {
    try {
      const { email, password, full_name, company } = userData;
      
      if (!email || !password) {
        throw new Error('メールアドレスとパスワードは必須です。');
      }
      
      if (password.length < 6) {
        throw new Error('パスワードは6文字以上である必要があります。');
      }
      
      const firebaseUser = await registerWithEmail(email, password, {
        full_name,
        company
      });
      
      console.log('Registration successful:', firebaseUser.email);
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

  // ログアウト
  const logout = async () => {
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