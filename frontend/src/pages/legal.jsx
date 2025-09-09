// frontend/src/pages/legal.jsx
import Layout from '../components/Layout';

export default function Legal() {
  return (
    <Layout title="特定商取引法に基づく表記 - 楽々省エネ計算">
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">特定商取引法に基づく表記</h1>

        <div className="space-y-2 text-gray-700">
          <p><strong>販売事業者</strong>: Archi-Prisma Design works 株式会社</p>
          <p><strong>所在地</strong>: （所在地をご指定ください）</p>
          <p><strong>運営責任者</strong>: （氏名をご指定ください）</p>
          <p><strong>連絡先</strong>: <a href="mailto:rse-support@archi-prisma.co.jp" className="text-blue-600">rse-support@archi-prisma.co.jp</a></p>
          <p><strong>販売価格</strong>: 各サービスのご案内ページに記載</p>
          <p><strong>代金の支払時期・方法</strong>: （銀行振込、クレジット等／時期をご指定ください）</p>
          <p><strong>役務の提供時期</strong>: 決済確認後、即時または個別に定める期日</p>
          <p><strong>返品・キャンセル</strong>: 役務の性質上、提供後の返品はできません。個別契約に基づき対応します。</p>
          <p><strong>動作環境</strong>: 最新版の主要ブラウザ（Chrome/Edge/Safari 等）</p>
        </div>
      </div>
    </Layout>
  );
}

