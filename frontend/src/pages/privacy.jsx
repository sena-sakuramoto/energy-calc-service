// frontend/src/pages/privacy.jsx
import Layout from '../components/Layout';

export default function Privacy() {
  return (
    <Layout title="プライバシーポリシー - 楽々省エネ計算">
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">プライバシーポリシー</h1>
        <p className="text-gray-700">本ポリシーは、楽々省エネ計算（以下「本サービス」）における個人情報の取り扱い方針を定めるものです。</p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">1. 取得する情報</h2>
          <p className="text-gray-700">お問い合わせフォームやアカウント作成時に、氏名、メールアドレス、会社名等を取得する場合があります。</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">2. 利用目的</h2>
          <p className="text-gray-700">本サービスの提供・改善、サポート対応、法令遵守の目的で利用します。</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">3. 第三者提供</h2>
          <p className="text-gray-700">法令に基づく場合を除き、本人の同意なく第三者に提供しません。</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">4. 安全管理</h2>
          <p className="text-gray-700">適切な安全管理措置を講じ、個人情報の漏えい・滅失・毀損の防止に努めます。</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">5. お問い合わせ</h2>
          <p className="text-gray-700">本ポリシーに関するお問い合わせは、<a href="mailto:rse-support@archi-prisma.co.jp" className="text-blue-600">rse-support@archi-prisma.co.jp</a> までご連絡ください。</p>
        </section>
      </div>
    </Layout>
  );
}

