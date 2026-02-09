// frontend/src/pages/legal.jsx
import Layout from '../components/Layout';

export default function Legal() {
  return (
    <Layout title="特定商取引法に基づく表記 - 楽々省エネ計算">
      <div className="max-w-3xl mx-auto py-10 space-y-8 text-primary-800">
        <h1 className="text-3xl font-bold text-primary-900">特定商取引法に基づく表記</h1>

        <section className="space-y-1">
          <p><strong>販売事業者</strong>：Archi-Prisma Design works 株式会社</p>
          <p><strong>運営責任者</strong>：櫻本</p>
          <p><strong>所在地</strong>：東京都品川区上大崎2-6-7 SMA白金長者丸301</p>
          <p><strong>連絡先</strong>：<a href="mailto:rse-support@archi-prisma.co.jp" className="text-accent-600">rse-support@archi-prisma.co.jp</a></p>
        </section>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold">販売価格</h2>
          <p>各サービスのご案内ページに税込価格を表示します。キャンペーン等で価格が変動する場合は、その旨を明記します。</p>
        </section>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold">商品代金以外の必要料金</h2>
          <p>銀行振込手数料、通信費等はお客様負担となります。必要に応じて個別にご案内します。</p>
        </section>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold">お支払い方法・時期</h2>
          <p>お支払い方法は別途ご案内（銀行振込、クレジットカード等）に従います。支払時期は契約または各サービスの定めによります。</p>
        </section>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold">役務の提供時期</h2>
          <p>決済確認後、即時または個別に定める期日に提供を開始します。提供開始日はサービス特性により異なります。</p>
        </section>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold">返品・キャンセル</h2>
          <p>役務の性質上、提供開始後のキャンセル・返金は原則としてお受けできません。個別契約に定めがある場合はそれに従います。</p>
        </section>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold">動作環境</h2>
          <p>最新版の主要ブラウザ（Chrome/Edge/Safari 等）を推奨します。企業ネットワーク等の制限で一部機能が利用できない場合があります。</p>
        </section>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold">表現および商品に関する注意書き</h2>
          <p>本サイトに示された表現や再現性には個人差があり、必ずしも効果・成果を保証するものではありません。</p>
        </section>

        <section className="space-y-1">
          <h2 className="text-xl font-semibold">電話番号の表記</h2>
          <p>電話番号はご請求いただいた場合、遅滞なく開示いたします。お問い合わせはメールにてお願いいたします。</p>
        </section>
      </div>
    </Layout>
  );
}
