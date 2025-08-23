// frontend/src/pages/register.jsx
// -*- coding: utf-8 -*-
import React, { useState } from 'react';
// import { useRouter } from 'next/router'; // AuthContextでリダイレクトする場合、ここでrouterは不要かも
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
// import Layout from '../components/Layout'; // _app.jsxでLayoutが適用されていれば不要

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth(); // AuthContextからregister関数を取得

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 8) { // 簡単なパスワード長のバリデーション
      setError('パスワードは8文字以上で入力してください。');
      setLoading(false);
      return;
    }

    const userDataToSubmit = {
      email: email,
      password: password,
      full_name: fullName || null, // fullNameが空の場合はnullを送信
    };

    console.log("Submitting from register.jsx with data:", JSON.stringify(userDataToSubmit));

    try {
      await register(userDataToSubmit); // AuthContextのregister関数に整形したデータを渡す
      // 登録成功時のリダイレクトはAuthContext内のregister関数で行う想定
      // 例: router.push('/login?registered=true');
    } catch (err) {
      // AuthContextからスローされたエラーメッセージ、またはAxiosのエラーをセット
      let errorMessage = '登録中に予期せぬエラーが発生しました。';
      if (err.response && err.response.data && err.response.data.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map(d => `${(d.loc && d.loc.length > 1 ? d.loc[1] : 'Error')}: ${d.msg}`).join('\n');
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Registration page caught error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">新規アカウント登録</h1>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">登録エラー</p>
          {/* 改行を含むエラーメッセージを表示できるようにする */}
          {error.split('\n').map((line, i) => <span key={i} className="block">{line}</span>)}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="fullName">
            氏名 <span className="text-xs text-gray-500">(任意)</span>
          </label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            id="fullName"
            type="text"
            placeholder="例: 山田 太郎"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            id="email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
            パスワード <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(8文字以上)</span>
          </label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="flex items-center justify-between mb-4">
          <button
            className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? '登録処理中...' : '登録する'}
          </button>
        </div>
        <div className="text-center">
          <Link href="/login" className="font-medium text-sm text-blue-500 hover:text-blue-700">
              既にアカウントをお持ちですか？ ログイン
          </Link>
        </div>
      </form>
    </div>
  );
}