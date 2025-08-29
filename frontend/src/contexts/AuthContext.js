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
      // GitHub Pages用のモックユーザー設定（一時的にローカルでも有効）
      if (typeof window !== 'undefined' && (window.location.hostname.includes('github.io') || window.location.hostname === 'localhost')) {
        console.log("GitHub Pages mode: Setting mock user");
        setUser({
          id: 1,
          email: "demo@example.com",
          full_name: "Demo User",
          is_active: true
        });
        return;
      }
      
      // Google OAuth認証済みの場合
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.name,
          image: session.user.image,
          is_active: true
        });
      } else {
        setUser(null);
      }
    };
    
    if (status !== 'loading') {
      initializeAuth();
    }
  }, [session, status]);

  const login = async () => {
    // GitHub Pages用のモックログイン（一時的にローカルでも有効）
    if (typeof window !== 'undefined' && (window.location.hostname.includes('github.io') || window.location.hostname === 'localhost')) {
      console.log("GitHub Pages mode: Mock login");
      setUser({
        id: 1,
        email: "demo@example.com",
        full_name: "Demo User",
        is_active: true
      });
      router.push('/');
      return true;
    }
    
    // Google OAuth認証
    try {
      const result = await signIn('google', { 
        redirect: false,  // リダイレクトを無効にして手動制御
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
  };

  const register = async (userData) => {
    console.log("Registering with data in AuthContext:", JSON.stringify(userData)); // AuthContextでのデータ確認
    try {
      const response = await authAPI.register(userData); // authAPI を使用
      router.push('/login?registered=true');
      return response.data;
    } catch (error) {
      console.error('Register failed in AuthContext:', error); // ここでエラーがキャッチされる
      if (error.response && error.response.data && error.response.data.detail) {
        if (Array.isArray(error.response.data.detail)) {
          const errorMessages = error.response.data.detail.map(d => `${(d.loc && d.loc.length > 1 ? d.loc[1] : 'Error')}: ${d.msg}`).join('\n');
          throw new Error(`${errorMessages}`);
        } else {
          throw new Error(`${error.response.data.detail}`);
        }
      }
      throw new Error('アカウントの登録に失敗しました。入力内容を確認してください。');
    }
  };

  const logout = async () => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
      setUser(null);
      router.push('/login');
      return;
    }
    
    // Google OAuth ログアウト
    try {
      await signOut({ callbackUrl: '/login' });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
      router.push('/login');
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