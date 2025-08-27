// frontend/src/contexts/AuthContext.js
// -*- coding: utf-8 -*-
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '../utils/api'; // ← この行を確認・追加！

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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      // GitHub Pages用のモックユーザー設定
      if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
        console.log("GitHub Pages mode: Setting mock user");
        setUser({
          id: 1,
          email: "demo@example.com",
          full_name: "Demo User",
          is_active: true
        });
        setLoading(false);
        return;
      }
      
      // 通常の認証フロー（GitHub Pages以外）
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const response = await authAPI.getCurrentUser();
            setUser(response.data);
          } catch (error) {
            console.error("Failed to fetch current user, token might be invalid.", error);
            localStorage.removeItem('authToken');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    // GitHub Pages用のモックログイン
    if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
      console.log("GitHub Pages mode: Mock login");
      setUser({
        id: 1,
        email: email,
        full_name: "Demo User",
        is_active: true
      });
      router.push('/');
      return true;
    }
    
    // 通常のログイン処理
    try {
      const response = await authAPI.login({ email, password });
      const { access_token } = response.data;
      authAPI.setAuthToken(access_token);

      const userResponse = await authAPI.getCurrentUser();
      setUser(userResponse.data);

      router.push('/');
      return true;
    } catch (error) {
      console.error('Login failed in AuthContext:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      setUser(null);
      if (error.response && error.response.data && error.response.data.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('メールアドレスまたはパスワードが正しくありません。');
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

  const logout = () => {
    if (typeof window !== 'undefined' && !window.location.hostname.includes('github.io')) {
      authAPI.setAuthToken(null); // localStorageのトークンもクリア
    }
    setUser(null);
    router.push('/login');
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