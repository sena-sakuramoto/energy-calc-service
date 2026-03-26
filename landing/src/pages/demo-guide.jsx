import Layout from '../components/Layout';
import Link from 'next/link';
import { FaPlay, FaCalculator, FaChartBar, FaDownload, FaClock, FaLightbulb } from 'react-icons/fa';

const APP_URL = 'https://app.rakuraku-energy.archi-prisma.co.jp';

export default function DemoGuide() {
  return (
    <Layout title="体験ガイド - 楽々省エネ計算" path="/demo-guide">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-900 mb-4">
            <FaPlay className="inline mr-3 text-accent-500" />
            5分で体験！省エネ計算
          </h1>
          <p className="text-xl text-primary-600">
            簡単30秒でアカウント作成後、本格的なBEI計算をご体験ください
          </p>
        </div>

        <div className="text-center mb-12">
          <a
            href={`${APP_URL}/register`}
            className="inline-block bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-8 rounded-lg shadow-xl transition-all duration-300 text-lg mr-4"
          >
            無料アカウント作成
          </a>
          <Link
            href="/about"
            className="inline-block bg-warm-100 hover:bg-warm-200 text-primary-800 font-medium py-4 px-6 rounded-lg transition-colors"
          >
            詳しく知る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-6 text-center">体験の流れ（約5分）</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: '建物情報入力', desc: '用途・延床面積・地域など基本情報を選択', time: '約2分' },
              { step: '2', title: '仕様選択', desc: '断熱・窓・設備仕様をプルダウンから選択', time: '約2分' },
              { step: '3', title: '自動計算', desc: 'システムが複雑なBEI計算を瞬時に実行', time: '約10秒', icon: FaCalculator },
              { step: '4', title: '結果確認', desc: 'グラフィカルな結果とPDF出力', time: '約1分', icon: FaChartBar },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="bg-accent-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  {item.icon ? <item.icon className="text-accent-500 text-xl" /> : <span className="text-2xl font-bold text-accent-500">{item.step}</span>}
                </div>
                <h3 className="font-semibold text-primary-900 mb-2">{item.title}</h3>
                <p className="text-sm text-primary-600">{item.desc}</p>
                <div className="text-xs text-primary-500 mt-2 flex items-center justify-center">
                  <FaClock className="mr-1" />
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-warm-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-6 text-center">体験できる全機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: FaCalculator, title: 'BEI計算', items: ['建築物省エネ法準拠', '地域区分別基準対応', '外皮性能・エネルギー計算', '適合/不適合判定'] },
              { icon: FaChartBar, title: '詳細分析', items: ['用途別エネルギー内訳', 'グラフィカル表示', '設計値vs基準値比較', '省エネ率算出'] },
              { icon: FaDownload, title: 'レポート出力', items: ['PDF詳細レポート', 'Excel計算書', '申請書類対応', '図表・グラフ付き'] },
            ].map((section) => (
              <div key={section.title} className="bg-white p-6 rounded-lg shadow-sm">
                <section.icon className="text-3xl text-accent-500 mb-4" />
                <h3 className="text-lg font-semibold text-primary-900 mb-2">{section.title}</h3>
                <ul className="text-sm text-primary-600 space-y-1">
                  {section.items.map((item) => <li key={item}>・ {item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-6">体験版について</h2>
          <div className="space-y-6">
            {[
              { q: '登録は必要ですか？', a: 'はい、簡単30秒でアカウント作成が必要です。GoogleアカウントまたはメールアドレスでOK。' },
              { q: '計算結果は保存されますか？', a: 'ブラウザ内に一時保存されます。ダウンロードしてご保存ください。' },
              { q: '計算精度は本格版と同じですか？', a: 'はい、建築物省エネ法に完全準拠した正確な計算を行います。' },
              { q: '商用利用はできますか？', a: '体験版の結果は参考用です。商用利用にはアカウント登録をお願いします。' },
            ].map((item) => (
              <div key={item.q}>
                <h3 className="text-lg font-semibold text-primary-900 mb-2 flex items-center">
                  <FaLightbulb className="mr-2 text-accent-400" />
                  {item.q}
                </h3>
                <p className="text-primary-600 pl-6">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary-800 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">今すぐ体験してみましょう！</h2>
          <p className="mb-6">
            5分で本格的な省エネ計算を体験できます。<br />
            設計業務の効率化を実感してください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`${APP_URL}/register`}
              className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 inline-block"
            >
              無料アカウント作成
            </a>
            <a
              href={`${APP_URL}/login`}
              className="border-2 border-white text-white hover:bg-white hover:text-primary-800 font-bold py-3 px-6 rounded-lg transition-all duration-300 inline-block"
            >
              ログインして開始
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
