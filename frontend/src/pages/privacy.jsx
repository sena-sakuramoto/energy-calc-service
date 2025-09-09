// frontend/src/pages/privacy.jsx
import Layout from '../components/Layout';

export default function Privacy() {
  return (
    <Layout title="プライバシーポリシー - 楽々省エネ計算">
      <div className="max-w-3xl mx-auto py-10 space-y-8 text-gray-800">
        <h1 className="text-3xl font-bold text-gray-900">プライバシーポリシー</h1>
        <p>Archi-Prisma Design works 株式会社（以下「当社」）は、当社が提供する「楽々省エネ計算」（以下「本サービス」）におけるユーザーの個人情報の取り扱いについて、以下のとおり方針を定め、適切に保護・管理いたします。</p>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold">1. 取得する情報</h2>
          <p>当社は、以下の情報を取得する場合があります。</p>
          <ul className="list-disc list-inside text-gray-700">
            <li>氏名、メールアドレス、会社名、部署名、役職、電話番号 等</li>
            <li>サービス利用履歴、アクセスログ、IPアドレス、ブラウザ情報、Cookie 等</li>
            <li>お問い合わせ内容やアンケート回答 等</li>
          </ul>
        </section>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold">2. 利用目的</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>本サービスの提供、保守、改善、品質向上のため</li>
            <li>お問い合わせへの対応、本人確認、重要なお知らせの通知のため</li>
            <li>不正利用の防止、セキュリティ確保のため</li>
            <li>法令遵守、紛争解決、権利行使・防御のため</li>
          </ul>
        </section>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold">3. Cookie・アクセス解析</h2>
          <p>本サービスでは、利便性向上や利用状況の把握のため Cookie を使用する場合があります。ブラウザ設定により Cookie を無効化できますが、一部機能が利用できない場合があります。</p>
        </section>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold">4. 第三者提供・委託</h2>
          <p>法令に基づく場合を除き、本人の同意なく第三者へ提供しません。業務委託先に取り扱いを委託する場合は、適切な監督を行います。</p>
        </section>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold">5. 安全管理措置</h2>
          <p>当社は、権限管理、アクセス制御、暗号化等の安全管理措置を講じ、個人情報の漏えい・滅失・毀損の防止に努めます。</p>
        </section>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold">6. 開示・訂正・利用停止等の請求</h2>
          <p>本人からの請求に応じ、法令の定めに従い、保有個人データの開示・訂正・利用停止等に対応します。問い合わせ先は下記をご参照ください。</p>
        </section>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold">7. 法令、規範の遵守と見直し</h2>
          <p>当社は、適用される法令・ガイドラインを遵守するとともに、必要に応じて本ポリシーの内容を見直し、継続的な改善を行います。</p>
        </section>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold">8. お問い合わせ窓口</h2>
          <p>本ポリシーに関するお問い合わせは、以下の窓口までお願いいたします。</p>
          <div className="text-gray-700">
            <p>Archi-Prisma Design works 株式会社</p>
            <p>所在地：東京都品川区上大崎2-6-7 SMA白金長者丸301</p>
            <p>メール：<a href="mailto:rse-support@archi-prisma.co.jp" className="text-blue-600">rse-support@archi-prisma.co.jp</a></p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
