// frontend/src/contexts/AuthContext.js
// -*- coding: utf-8 -*-
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import { authAPI } from '../utils/api';

const AuthContext = createContext({
  user: null,
  setUser: () => {},
  login: async () => false,
  register: async () => {},
  logout: () => {},
  isAuthenticated: false,
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      // 静的サイト用のLocalStorage認証チェック
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            console.log("Restored user from localStorage:", userData.email);
            return;
          } catch (error) {
            console.error("Failed to parse stored user data:", error);
            localStorage.removeItem('currentUser');
          }
        }
      }
      
      // Google OAuth認証済みの場合（開発環境のみ）
      if (session?.user && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        setUser({
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.name,
          image: session.user.image,
          is_active: true,
          authType: 'google'
        });
      } else {
        setUser(null);
      }
    };
    
    if (status !== 'loading') {
      initializeAuth();
    }
  }, [session, status]);

  const login = async (credentials = null) => {
    // 静的サイト用の実際のログインシステム
    if (typeof window !== 'undefined') {
      // メール認証の場合
      if (credentials?.email && credentials?.password) {
        // LocalStorageから登録済みユーザーを取得
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const user = registeredUsers.find(u => u.email === credentials.email);
        
        if (user && user.password === credentials.password) {
          const loginUser = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            company: user.company,
            is_active: true,
            authType: 'email',
            registrationDate: user.registrationDate
          };
          
          setUser(loginUser);
          localStorage.setItem('currentUser', JSON.stringify(loginUser));
          console.log("User logged in:", loginUser.email);
          router.push('/');
          return true;
        } else {
          throw new Error('メールアドレスまたはパスワードが正しくありません');
        }
      }
    }
    
    // 開発環境でのみGoogle OAuth認証を有効化
    if (!credentials?.email && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      try {
        const result = await signIn('google', { 
          redirect: false,
        });
        
        if (result?.ok) {
          router.push('/');
          return true;
        } else {
          throw new Error('認証に失敗しました');
        }
      } catch (error) {
        console.error('Google OAuth login failed:', error);
        throw new Error('Googleログインに失敗しました。');
      }
    }
    
    throw new Error('ログイン情報が正しくありません');
  };

  const register = async (userData) => {
    console.log("Registering new user:", userData.email);
    
    try {
      if (typeof window !== 'undefined') {
        // 既存ユーザーリストを取得
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // 重複チェック
        const existingUser = registeredUsers.find(u => u.email === userData.email);
        if (existingUser) {
          throw new Error('このメールアドレスは既に登録されています');
        }
        
        // 新しいユーザーを作成
        const newUser = {
          id: Date.now(), // 簡易的なID生成
          email: userData.email,
          password: userData.password,
          full_name: userData.full_name || userData.firstName + ' ' + userData.lastName,
          company: userData.company || '',
          registrationDate: new Date().toISOString(),
          is_active: true
        };
        
        // ユーザーリストに追加
        registeredUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        console.log("User registered successfully:", newUser.email);
        router.push('/login?registered=true');
        return { message: '登録が完了しました' };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (typeof window !== 'undefined') {
      // 現在のユーザー情報をクリア
      localStorage.removeItem('currentUser');
      setUser(null);
      console.log("User logged out");
      router.push('/login');
      return;
    }
    
    // 開発環境でのGoogle OAuth ログアウト
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      try {
        await signOut({ callbackUrl: '/login' });
        setUser(null);
      } catch (error) {
        console.error('Logout failed:', error);
        setUser(null);
        router.push('/login');
      }
    }
  };

  const value = {
    user,
    setUser,
    login,
    register,
    logout,
    isAuthenticated: !!user,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;