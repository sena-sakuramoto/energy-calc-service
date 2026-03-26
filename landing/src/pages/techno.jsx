import { useState } from 'react';
import Layout from '../components/Layout';

const APP_URL = 'https://app.rakuraku-energy.archi-prisma.co.jp';

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
      const res = await fetch(`${APP_URL.replace('app.', 'api.')}/api/v1/onboarding/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'technostructure' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || '登録に失敗しました。');
      setMessage(data.message || '登録を受け付けました。');
      setForm({ company_name: '', email: '', phone: '', partner_code: '' });
    } catch {
      setError('登録に失敗しました。入力内容をご確認ください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title="テクノストラクチャー加盟店向け | 楽々省エネ計算"
      description="テクノストラクチャーの構造計算と楽々省エネ計算の公式BEI計算をワンストップで連携。加盟店は無料導入。"
      path="/techno"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <section className="bg-white border border-amber-200 rounded-2xl p-8 shadow-sm">
          <p className="text-xs tracking-widest text-amber-700 font-semibold">PANASONIC TECHNOSTRUCTURE PARTNER PROGRAM</p>
          <h1 className="text-3xl font-bold text-primary-900 mt-2">テクノストラクチャー加盟店向け 無料オンボーディング</h1>
          <p className="text-primary-600 mt-3 leading-relaxed">
            テクノストラクチャーの構造計算と、楽々省エネ計算の公式BEI計算をワンストップで連携。
            加盟店は初期費用・月額費用なしで導入できます。
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {[
              { label: '連携価値 1', text: '構造 + 省エネ 一括対応' },
              { label: '連携価値 2', text: 'パナソニック製品を優先提案' },
              { label: '連携価値 3', text: '外注費を年間30万円削減' },
            ].map((item) => (
              <div key={item.label} className="bg-warm-50 border border-warm-200 rounded-xl p-4">
                <p className="text-xs text-primary-500">{item.label}</p>
                <p className="font-semibold text-primary-900 mt-1">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-sm text-emerald-800">
              試算: 年間5棟 × 外注費6万円 = <span className="font-bold">30万円/年</span>の削減効果
            </p>
          </div>
        </section>

        <section className="bg-white border border-warm-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-primary-900">加盟店一括登録フォーム</h2>
          <p className="text-sm text-primary-500 mt-1">登録完了後、担当者より導入案内メールを送付します。</p>

          <form onSubmit={submit} className="mt-6 grid gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium text-primary-700">会社名 *</span>
              <input value={form.company_name} onChange={(e) => update('company_name', e.target.value)} required className="border border-warm-300 rounded-lg px-3 py-2" placeholder="株式会社サンプル工務店" />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-primary-700">メールアドレス *</span>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required className="border border-warm-300 rounded-lg px-3 py-2" placeholder="info@example.com" />
            </label>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="text-sm font-medium text-primary-700">電話番号</span>
                <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="border border-warm-300 rounded-lg px-3 py-2" placeholder="03-1234-5678" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-primary-700">加盟店番号</span>
                <input value={form.partner_code} onChange={(e) => update('partner_code', e.target.value)} className="border border-warm-300 rounded-lg px-3 py-2" placeholder="TS-000123" />
              </label>
            </div>

            <button type="submit" disabled={loading} className="mt-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg">
              {loading ? '登録中...' : '無料で登録する'}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">{message}</p>
          )}
          {error && (
            <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
          )}
        </section>
      </div>
    </Layout>
  );
}
