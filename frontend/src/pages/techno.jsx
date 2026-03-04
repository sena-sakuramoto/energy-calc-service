import { useState } from 'react';

import apiClient from '../utils/api';

export default function TechnoLandingPage() {
  const [form, setForm] = useState({
    company_name: '',
    email: '',
    phone: '',
    partner_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await apiClient.post('/onboarding/register', {
        ...form,
        source: 'technostructure',
      });
      setMessage(res.data?.message || '登録を受け付けました。');
      setForm({ company_name: '', email: '', phone: '', partner_code: '' });
    } catch {
      setError('登録に失敗しました。入力内容をご確認ください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <section className="bg-white border border-amber-200 rounded-2xl p-8 shadow-sm">
          <p className="text-xs tracking-widest text-amber-700 font-semibold">PANASONIC TECHNOSTRUCTURE PARTNER PROGRAM</p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">テクノストラクチャー加盟店向け 無料オンボーディング</h1>
          <p className="text-slate-600 mt-3 leading-relaxed">
            テクノストラクチャーの構造計算と、楽々省エネ計算の公式BEI計算をワンストップで連携。
            加盟店は初期費用・月額費用なしで導入できます。
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500">連携価値 1</p>
              <p className="font-semibold text-slate-900 mt-1">構造 + 省エネ 一括対応</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500">連携価値 2</p>
              <p className="font-semibold text-slate-900 mt-1">パナソニック製品を優先提案</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500">連携価値 3</p>
              <p className="font-semibold text-slate-900 mt-1">外注費を年間30万円削減</p>
            </div>
          </div>

          <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-sm text-emerald-800">
              試算: 年間5棟 × 外注費6万円 = <span className="font-bold">30万円/年</span>の削減効果
            </p>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">加盟店一括登録フォーム</h2>
          <p className="text-sm text-slate-500 mt-1">登録完了後、担当者より導入案内メールを送付します。</p>

          <form onSubmit={submit} className="mt-6 grid gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium text-slate-700">会社名 *</span>
              <input
                value={form.company_name}
                onChange={(e) => update('company_name', e.target.value)}
                required
                className="border border-slate-300 rounded-lg px-3 py-2"
                placeholder="株式会社サンプル工務店"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-slate-700">メールアドレス *</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                required
                className="border border-slate-300 rounded-lg px-3 py-2"
                placeholder="info@example.com"
              />
            </label>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="text-sm font-medium text-slate-700">電話番号</span>
                <input
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="03-1234-5678"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-slate-700">加盟店番号</span>
                <input
                  value={form.partner_code}
                  onChange={(e) => update('partner_code', e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="TS-000123"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg"
            >
              {loading ? '登録中...' : '無料で登録する'}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              {message}
            </p>
          )}
          {error && (
            <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
