import Layout from '../components/Layout';

const APP_URL = 'https://app.rakuraku-energy.archi-prisma.co.jp';

export default function ResidentialPage() {
  return (
    <Layout
      title="楽々省エネ計算 | 住宅外皮計算"
      description="住宅のUA値・ηAC値をリアルタイムで算定し、求積表PDFと計算書PDFを出力します。"
      keywords="住宅,UA値,ηAC,外皮計算,省エネ"
      path="/residential"
    >
      <div className="max-w-4xl mx-auto pt-24 pb-12 px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-900 mb-4">住宅外皮計算</h1>
          <p className="text-lg text-primary-600">
            UA値・ηAC値のリアルタイム算定、求積表PDF・計算書PDFの出力に対応。
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 mb-8">
          <p className="font-semibold">対応範囲</p>
          <p className="mt-1">
            戸建住宅（木造在来・2×4・鉄骨造・RC造）の外皮性能計算（UA値・ηAC値）に対応。
            共同住宅は今後対応予定。
          </p>
        </div>

        <div className="bg-white rounded-xl border border-warm-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-6">主な機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'UA値・ηAC値のリアルタイム計算', desc: '入力と同時に結果が更新されます' },
              { title: '求積表PDFの自動生成', desc: '面積計算結果をPDFで出力' },
              { title: '計算書PDFの出力', desc: '省エネ基準への適合確認用' },
              { title: '地域区分別の基準値対応', desc: '全8地域区分に対応' },
            ].map((item) => (
              <div key={item.title} className="border border-warm-200 rounded-lg p-4">
                <h3 className="font-semibold text-primary-900 mb-1">{item.title}</h3>
                <p className="text-sm text-primary-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <a
            href={`${APP_URL}/residential`}
            className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-lg shadow-lg transition-all duration-300 text-lg"
          >
            住宅外皮計算を使う
          </a>
          <p className="text-sm text-primary-500 mt-4">
            アプリにログインして、住宅外皮計算を開始できます。
          </p>
        </div>
      </div>
    </Layout>
  );
}
