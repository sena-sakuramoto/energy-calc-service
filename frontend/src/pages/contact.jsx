// frontend/src/pages/contact.jsx
import { useState } from 'react';
import Layout from '../components/Layout';
import { FaEnvelope, FaPhone, FaBuilding, FaQuestionCircle, FaBug, FaLightbulb, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';

// Google Apps Script endpoint (use /macros/s/.../exec URL if possible)
const GAS_ENDPOINT = 'https://script.google.com/a/macros/archi-prisma.co.jp/s/AKfycbzlnLWsQqgN8Vt79i_T4BlWKCxp22ByDprQGtbYMbnL04WOxH64QryZwRmdBQcoo1su/exec';

const categoryLabels = {
  general: '一般的なお問い合わせ',
  bug: '不具合・バグ報告',
  feature: '機能追加・改善要望',
  support: 'テクニカルサポート',
  business: '導入・契約に関するお問い合わせ'
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    category: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');

    // Build payload once (used for normal fetch and no-cors fallback)
    const label = categoryLabels[formData.category] || formData.category || '';
    const topic = [label, formData.subject].filter(Boolean).join(' - ');
    const bodyParts = [
      formData.company ? `会社名/事務所名: ${formData.company}` : null,
      formData.category ? `種別: ${label}` : null,
      formData.subject ? `件名: ${formData.subject}` : null,
      '',
      formData.message || ''
    ].filter((v) => v !== null);

    const fd = new FormData();
    fd.append('name', formData.name || '');
    fd.append('email', formData.email || '');
    if (topic) fd.append('topic', topic);
    fd.append('message', bodyParts.join('\n'));

    try {
      // Normal fetch: if CORS is properly open, this succeeds and we can read JSON
      const res = await fetch(GAS_ENDPOINT, { method: 'POST', body: fd });
      const text = await res.text();
      const json = JSON.parse(text);
      if (!json.ok) throw new Error(json.error || '送信に失敗しました');

      setSubmitted(true);
      setTimeout(() => {
        setFormData({ name: '', email: '', company: '', category: '', subject: '', message: '' });
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      // CORS などで応答を読めない場合は no-cors でフォールバック送信
      try {
        await fetch(GAS_ENDPOINT, { method: 'POST', body: fd, mode: 'no-cors' });
        setSubmitted(true);
        setTimeout(() => {
          setFormData({ name: '', email: '', company: '', category: '', subject: '', message: '' });
          setSubmitted(false);
        }, 3000);
      } catch (err2) {
        console.error('Contact submit error:', err, err2);
        setError('メール送信に失敗しました。しばらく時間をおいてから再度お試しください。');
      }
    } finally {
      setSending(false);
    }
  };

  const categories = [
    { value: 'general', label: '一般的なお問い合わせ', icon: FaQuestionCircle, color: 'blue' },
    { value: 'bug', label: '不具合・バグ報告', icon: FaBug, color: 'red' },
    { value: 'feature', label: '機能追加・改善要望', icon: FaLightbulb, color: 'yellow' },
    { value: 'support', label: 'テクニカルサポート', icon: FaPhone, color: 'green' },
    { value: 'business', label: '導入・契約に関するお問い合わせ', icon: FaBuilding, color: 'purple' }
  ];

  if (submitted) {
    return (
      <Layout title="お問い合わせ - 楽々エネ計算">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="bg-green-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <FaCheckCircle className="text-green-600 text-4xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">お問い合わせありがとうございました</h1>
          <p className="text-gray-600 mb-8">お問い合わせを受け付けました。内容を確認の上、2営業日以内にご連絡いたします。</p>
          <button onClick={() => setSubmitted(false)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            新しいお問い合わせを送信
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="お問い合わせ - 楽々エネ計算">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">お問い合わせ・サポート</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">ご質問・ご要望・不具合報告など、お気軽にお問い合わせください。設計業務でお困りの際は、いつでもサポートいたします。</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* お問い合わせフォーム */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">お問い合わせフォーム</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 基本情報 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">お名前 <span className="text-red-500">*</span></label>
                    <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="山田太郎" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">メールアドレス <span className="text-red-500">*</span></label>
                    <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="yamada@example.com" />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">会社名／事務所名</label>
                  <input type="text" id="company" name="company" value={formData.company || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="株式会社○○設計事務所" />
                </div>

                {/* お問い合わせカテゴリ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">お問い合わせ種別 <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categories.map((cat) => (
                      <label key={cat.value} className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${formData.category === cat.value ? `border-${cat.color}-500 bg-${cat.color}-50` : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="category" value={cat.value} checked={formData.category === cat.value} onChange={handleChange} className="sr-only" />
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg mr-3 ${cat.color === 'blue' ? 'bg-blue-100' : cat.color === 'red' ? 'bg-red-100' : cat.color === 'yellow' ? 'bg-yellow-100' : cat.color === 'green' ? 'bg-green-100' : 'bg-purple-100'}`}>
                            <cat.icon className={`text-sm ${cat.color === 'blue' ? 'text-blue-600' : cat.color === 'red' ? 'text-red-600' : cat.color === 'yellow' ? 'text-yellow-600' : cat.color === 'green' ? 'text-green-600' : 'text-purple-600'}`} />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{cat.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">件名 <span className="text-red-500">*</span></label>
                  <input type="text" id="subject" name="subject" value={formData.subject || ''} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="BEI計算結果について" />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">お問い合わせ内容 <span className="text-red-500">*</span></label>
                  <textarea id="message" name="message" value={formData.message || ''} onChange={handleChange} required rows="6" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical" placeholder="詳細なご質問・ご要望をお聞かせください"></textarea>
                </div>

                {/* ハニーポット（視覚的に隠す） */}
                <input name="website" autoComplete="off" tabIndex="-1" style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true" />

                <button type="submit" disabled={sending} className={`w-full py-3 px-6 rounded-lg transition-colors font-medium flex items-center justify-center ${sending ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                  <FaPaperPlane className={`mr-2 ${sending ? 'animate-spin' : ''}`} />
                  {sending ? '送信中…' : 'お問い合わせを送信'}
                </button>
              </form>
            </div>
          </div>

          {/* サイドバー情報 */}
          <div className="space-y-6">
            {/* 会社情報 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">会社情報</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaBuilding className="text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Archi-Prisma Design works 株式会社</p>
                    <p className="text-sm text-gray-600">楽々エネ計算 開発・運営</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaEnvelope className="text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">rse-support@archi-prisma.co.jp</p>
                    <p className="text-xs text-gray-500">※ お問い合わせ専用</p>
                  </div>
                </div>
              </div>
            </div>

            {/* サポート時間 */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">サポート時間</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>平日:</strong> 9:00 - 18:00</p>
                <p><strong>土日祝:</strong> 休業</p>
                <p className="text-xs text-gray-500 mt-3">緊急時・システム障害については24時間対応いたします。</p>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">よくあるご質問</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">計算結果の精度について</p>
                  <p className="text-xs text-gray-600">建築物省エネ法に完全準拠した正確な計算を行っています。</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">データの保存期間</p>
                  <p className="text-xs text-gray-600">プロジェクトデータは無期限で安全に保存されます。</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">複数端末での利用</p>
                  <p className="text-xs text-gray-600">同一アカウントで複数端末からアクセス可能です。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

