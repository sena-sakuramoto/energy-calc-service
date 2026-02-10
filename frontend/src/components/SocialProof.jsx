// frontend/src/components/SocialProof.jsx

const stats = [
  { value: '共同開発中', label: '現在ステータス' },
  { value: '公式API', label: 'v380対応' },
  { value: '無料', label: 'デモ利用' },
];

const highlights = [
  {
    title: '公式様式出力に対応',
    body: '国交省API（v380）経由で、公式PDFの生成フローを提供しています。',
  },
  {
    title: '入力負荷の軽減を重視',
    body: '用途・地域・設備入力を段階化し、設計実務で使いやすい導線を継続改善しています。',
  },
  {
    title: '継続的な品質改善',
    body: 'ユーザー報告を優先して、計算結果・表示・PDF出力の整合性を順次改善しています。',
  },
];

export default function SocialProof() {
  return (
    <div className="py-20 bg-warm-50">
      <div className="container mx-auto px-4">
        {/* 開発状況 */}
        <p className="text-center text-primary-500 text-lg mb-12 tracking-wide">
          現在は共同開発企画として、実運用に向けた改善を継続しています
        </p>

        {/* 状況カード */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-20">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-warm-200 p-8 text-center shadow-sm"
            >
              <div className="text-3xl font-bold text-accent-500 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-primary-500 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* 取り組み内容 */}
        <h3 className="text-2xl font-bold text-center text-primary-800 mb-10">
          現在の取り組み
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-xl border border-warm-200 p-6 shadow-sm"
            >
              <h4 className="text-primary-800 font-semibold mb-3">
                {item.title}
              </h4>
              <p className="text-primary-600 leading-relaxed text-sm">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
