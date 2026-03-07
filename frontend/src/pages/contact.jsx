// frontend/src/pages/contact.jsx
import { useState } from 'react';
import Layout from '../components/Layout';
import { FaEnvelope, FaPhone, FaBuilding, FaQuestionCircle, FaBug, FaLightbulb, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';

import { contactConfig } from '../config/contact';
import { contactAPI } from '../utils/api';

const GAS_ENDPOINT = 'https://script.google.com/a/macros/archi-prisma.co.jp/s/AKfycbzlnLWsQqgN8Vt79i_T4BlWKCxp22ByDprQGtbYMbnL04WOxH64QryZwRmdBQcoo1su/exec';
const ALT_GAS_ENDPOINT = GAS_ENDPOINT.replace(/\/a\/macros\/[\w.-]+/, '/macros');

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
  const [deliveryWarning, setDeliveryWarning] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitViaGasFallback = async () => {
    const label = categoryLabels[formData.category] || formData.category || '';
    const topic = [label, formData.subject].filter(Boolean).join(' - ');
    const bodyParts = [
      formData.company ? `会社名/事務所名: ${formData.company}` : null,
      formData.category ? `種別: ${label}` : null,
      formData.subject ? `件名: ${formData.subject}` : null,
      '',
      formData.message || '',
    ].filter((value) => value !== null);

    const fd = new FormData();
    fd.append('name', formData.name || '');
    fd.append('email', formData.email || '');
    if (topic) fd.append('topic', topic);
    fd.append('message', bodyParts.join('\n'));
    if (formData.company) fd.append('company', formData.company);
    if (formData.category) fd.append('category', formData.category);
    if (formData.subject) fd.append('subject', formData.subject);

    let res = await fetch(ALT_GAS_ENDPOINT, { method: 'POST', body: fd });
    if (!res.ok) {
      res = await fetch(GAS_ENDPOINT, { method: 'POST', body: fd });
    }
    const text = await res.text();
    const json = JSON.parse(text);
    if (!json.ok) {
      throw new Error(json.error || '旧送信経路でも受付できませんでした。');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      const response = await contactAPI.submit({
        ...formData,
        category: formData.category || null,
        company: formData.company || null,
        page_url: typeof window !== 'undefined' ? window.location.href : null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      });

      if (response.data?.notification_sent === false) {
        setDeliveryWarning(
          `受付は完了しましたが、通知送信に問題がありました。${response.data?.support_email || contactConfig.supportEmail} へ直接ご連絡ください。`,
        );
      } else {
        setDeliveryWarning('');
      }

      setSubmitted(true);
      setTimeout(() => {
        setFormData({ name: '', email: '', company: '', category: '', subject: '', message: '' });
        setSubmitted(false);
        setDeliveryWarning('');
      }, 3000);
    } catch (err) {
      try {
        if (err?.response?.status === 404 || !err?.response) {
          await submitViaGasFallback();
          setDeliveryWarning(
            '新しい受付APIがまだ反映中のため、旧送信経路で受け付けました。返信が遅い場合はサポート窓口へ直接ご連絡ください。',
          );
          setSubmitted(true);
          setTimeout(() => {
            setFormData({ name: '', email: '', company: '', category: '', subject: '', message: '' });
            setSubmitted(false);
            setDeliveryWarning('');
          }, 3000);
          return;
        }
      } catch (fallbackError) {
        console.error('Contact fallback error:', fallbackError);
      }

      console.error('Contact submit error:', err);
      setError(
        err.response?.data?.detail ||
          'お問い合わせの送信に失敗しました。しばらく時間をおいてから再度お試しください。',
      );
    } finally {
      setSending(false);
    }
  };

  const categories = [
    { value: 'general', label: '一般的なお問い合わせ', icon: FaQuestionCircle },
    { value: 'bug', label: '不具合・バグ報告', icon: FaBug },
    { value: 'feature', label: '機能追加・改善要望', icon: FaLightbulb },
    { value: 'support', label: 'テクニカルサポート', icon: FaPhone },
    { value: 'business', label: '導入・契約に関するお問い合わせ', icon: FaBuilding }
  ];

  if (submitted) {
    return (
      <Layout title="お問い合わせ - 楽々省エネ計算">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="bg-accent-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <FaCheckCircle className="text-accent-600 text-4xl" />
          </div>
          <h1 className="text-3xl font-bold text-primary-900 mb-4">お問い合わせありがとうございました</h1>
          <p className="text-primary-600 mb-4">
            お問い合わせを受け付けました。内容を確認の上、{contactConfig.responseWindowText}にご連絡いたします。
          </p>
          {deliveryWarning && (
            <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {deliveryWarning}
            </div>
          )}
          <button onClick={() => setSubmitted(false)} className="bg-accent-600 text-white px-6 py-3 rounded-lg hover:bg-accent-700 transition-colors">
            新しいお問い合わせを送信
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="お問い合わせ - 楽々省エネ計算">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-900 mb-4">お問い合わせ・サポート</h1>
          <p className="text-xl text-primary-600 max-w-3xl mx-auto">ご質問・ご要望・不具合報告など、お気軽にお問い合わせください。設計業務でお困りの際は、いつでもサポートいたします。</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* お問い合わせフォーム */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-primary-900 mb-6">お問い合わせフォーム</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 基本情報 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-primary-700 mb-2">お名前 <span className="text-red-500">*</span></label>
                    <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500" placeholder="山田太郎" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-2">メールアドレス <span className="text-red-500">*</span></label>
                    <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleChange} required className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500" placeholder="yamada@example.com" />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-primary-700 mb-2">会社名／事務所名</label>
                  <input type="text" id="company" name="company" value={formData.company || ''} onChange={handleChange} className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500" placeholder="株式会社○○設計事務所" />
                </div>

                {/* お問い合わせカテゴリ */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-3">お問い合わせ種別 <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categories.map((cat) => (
                      <label key={cat.value} className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${formData.category === cat.value ? 'border-accent-500 bg-accent-50' : 'border-primary-200 hover:border-primary-300'}`}>
                        <input type="radio" name="category" value={cat.value} checked={formData.category === cat.value} onChange={handleChange} className="sr-only" />
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg mr-3 ${formData.category === cat.value ? 'bg-accent-100' : 'bg-primary-100'}`}>
                            <cat.icon className={`text-sm ${formData.category === cat.value ? 'text-accent-600' : 'text-primary-600'}`} />
                          </div>
                          <span className="text-sm font-medium text-primary-900">{cat.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-primary-700 mb-2">件名 <span className="text-red-500">*</span></label>
                  <input type="text" id="subject" name="subject" value={formData.subject || ''} onChange={handleChange} required className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500" placeholder="BEI計算結果について" />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-primary-700 mb-2">お問い合わせ内容 <span className="text-red-500">*</span></label>
                  <textarea id="message" name="message" value={formData.message || ''} onChange={handleChange} required rows="6" className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 resize-vertical" placeholder="詳細なご質問・ご要望をお聞かせください"></textarea>
                </div>

                {/* ハニーポット（視覚的に隠す） */}
                <input name="website" autoComplete="off" tabIndex="-1" style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true" />

                <p className="text-xs text-primary-500">
                  送信内容はサーバーに保存され、担当に通知されます。返信先は {contactConfig.supportEmail} です。
                </p>

                <button type="submit" disabled={sending} className={`w-full py-3 px-6 rounded-lg transition-colors font-medium flex items-center justify-center ${sending ? 'bg-primary-400 cursor-not-allowed' : 'bg-accent-600 hover:bg-accent-700 text-white'}`}>
                  <FaPaperPlane className="mr-2" />
                  {sending ? '送信中…' : 'お問い合わせを送信'}
                </button>
              </form>
            </div>
          </div>

          {/* サイドバー情報 */}
          <div className="space-y-6">
            {/* 会社情報 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-primary-900 mb-4">会社情報</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaBuilding className="text-primary-400 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-primary-900">Archi-Prisma Design works 株式会社</p>
                    <p className="text-sm text-primary-600">楽々省エネ計算 開発・運営</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaEnvelope className="text-primary-400 mt-1 mr-3" />
                  <div>
                    <a href={`mailto:${contactConfig.supportEmail}`} className="text-sm text-primary-600 underline">
                      {contactConfig.supportEmail}
                    </a>
                    <p className="text-xs text-primary-500">※ お問い合わせ専用</p>
                  </div>
                </div>
              </div>
            </div>

            {/* サポート時間 */}
            <div className="bg-warm-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-primary-900 mb-4">サポート時間</h3>
              <div className="space-y-2 text-sm text-primary-600">
                <p><strong>平日:</strong> 9:00 - 18:00</p>
                <p><strong>土日祝:</strong> 休業</p>
                <p className="text-xs text-primary-500 mt-3">緊急時・システム障害については24時間対応いたします。</p>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-warm-100 rounded-lg p-6">
              <h3 className="text-lg font-bold text-primary-900 mb-4">よくあるご質問</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-primary-900">計算結果の精度について</p>
                  <p className="text-xs text-primary-600">建築物省エネ法に完全準拠した正確な計算を行っています。</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-900">データの保存期間</p>
                  <p className="text-xs text-primary-600">プロジェクトデータは無期限で安全に保存されます。</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-900">複数端末での利用</p>
                  <p className="text-xs text-primary-600">同一アカウントで複数端末からアクセス可能です。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
