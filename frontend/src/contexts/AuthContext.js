// frontend/src/contexts/AuthContext.js
// -*- coding: utf-8 -*-
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { auth, googleProvider } from '../utils/firebase';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { authAPI } from '../utils/api';
import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';

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
      if (typeof window !== 'undefined') {
        const sessionToken = localStorage.getItem('sessionToken');
        const sessionExpiry = localStorage.getItem('sessionExpiry');
        
        if (sessionToken && sessionExpiry) {
          const now = new Date().getTime();
          if (now < parseInt(sessionExpiry)) {
            try {
              // セッショントークンを検証
              const decryptedUser = CryptoJS.AES.decrypt(sessionToken, 'energy-calc-secret-key').toString(CryptoJS.enc.Utf8);
              if (decryptedUser) {
                const userData = JSON.parse(decryptedUser);
                setUser(userData);
                console.log("Valid session restored:", userData.email);
              } else {
                throw new Error('Invalid session token');
              }
            } catch (error) {
              console.error("Invalid session:", error);
              localStorage.removeItem('sessionToken');
              localStorage.removeItem('sessionExpiry');
              setUser(null);
            }
          } else {
            console.log("Session expired");
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('sessionExpiry');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  const login = async (credentials = null) => {
    if (typeof window !== 'undefined') {
      // メール認証の場合
      if (credentials?.email && credentials?.password) {
        try {
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const user = registeredUsers.find(u => u.email === credentials.email);
          
          if (user && await bcrypt.compare(credentials.password, user.hashedPassword)) {
            const loginUser = {
              id: user.id,
              email: user.email,
              full_name: user.full_name,
              company: user.company,
              is_active: true,
              authType: 'email',
              registrationDate: user.registrationDate,
              loginTime: new Date().toISOString()
            };
            
            // セッショントークン生成（24時間有効）
            const sessionToken = CryptoJS.AES.encrypt(JSON.stringify(loginUser), 'energy-calc-secret-key').toString();
            const sessionExpiry = new Date().getTime() + (24 * 60 * 60 * 1000); // 24時間
            
            localStorage.setItem('sessionToken', sessionToken);
            localStorage.setItem('sessionExpiry', sessionExpiry.toString());
            localStorage.removeItem('currentUser'); // 古い認証方式を削除
            
            setUser(loginUser);
            console.log("User logged in securely:", loginUser.email);
            router.push('/');
            return true;
          } else {
            throw new Error('メールアドレスまたはパスワードが正しくありません');
          }
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      }
      
      // Firebase Google認証（Googleログインの場合）
      if (!credentials?.email) {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const firebaseUser = result.user;
          
          const loginUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            full_name: firebaseUser.displayName,
            image: firebaseUser.photoURL,
            is_active: true,
            authType: 'google',
            loginTime: new Date().toISOString()
          };
          
          // セッショントークン生成
          const sessionToken = CryptoJS.AES.encrypt(JSON.stringify(loginUser), 'energy-calc-secret-key').toString();
          const sessionExpiry = new Date().getTime() + (24 * 60 * 60 * 1000);
          
          localStorage.setItem('sessionToken', sessionToken);
          localStorage.setItem('sessionExpiry', sessionExpiry.toString());
          localStorage.removeItem('currentUser');
          
          setUser(loginUser);
          console.log("User logged in with Google:", loginUser.email);
          router.push('/');
          return true;
        } catch (error) {
          console.error('Firebase Google login failed:', error);
          throw new Error('Googleログインに失敗しました');
        }
      }
    }
    
    throw new Error('ログイン情報が正しくありません');
  };

  const register = async (userData) => {
    console.log("Registering new user:", userData.email);
    
    try {
      if (typeof window !== 'undefined') {
        // 入力検証
        if (!userData.email || !userData.password) {
          throw new Error('メールアドレスとパスワードは必須です');
        }
        
        if (userData.password.length < 8) {
          throw new Error('パスワードは8文字以上である必要があります');
        }
        
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // 重複チェック
        const existingUser = registeredUsers.find(u => u.email === userData.email);
        if (existingUser) {
          throw new Error('このメールアドレスは既に登録されています');
        }
        
        // パスワードハッシュ化
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        
        // 新しいユーザーを作成（パスワードは保存しない）
        const newUser = {
          id: Date.now(),
          email: userData.email,
          hashedPassword: hashedPassword, // ハッシュ化されたパスワード
          full_name: userData.full_name || userData.firstName + ' ' + userData.lastName,
          company: userData.company || '',
          registrationDate: new Date().toISOString(),
          is_active: true,
          lastLogin: null
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
      // Firebase認証からもログアウト
      if (user?.authType === 'google') {
        try {
          await firebaseSignOut(auth);
        } catch (error) {
          console.error('Firebase logout failed:', error);
        }
      }
      
      // すべての認証情報をクリア
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('sessionExpiry');
      localStorage.removeItem('currentUser'); // 旧方式も削除
      setUser(null);
      console.log("User logged out securely");
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