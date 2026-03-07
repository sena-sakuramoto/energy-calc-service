const stats = [
  { value: '公式出力対応', label: '現在の提供範囲' },
  { value: 'PDF出力', label: '主要機能' },
  { value: '無料あり', label: '試しやすさ' },
];

const highlights = [
  {
    title: '提出前提のワークフロー',
    body:
      '軽い試算ではなく、提出や説明に回しやすい導線に寄せています。',
  },
  {
    title: '無料と有料の切り分け',
    body:
      '住宅プレビューや料金比較は無料のまま残し、公式出力だけを有料にしています。',
  },
  {
    title: '実務で迷いにくい形',
    body:
      '入力不足に戻りやすく、決済後も元の作業に戻れる構成を意識しています。',
  },
];

export default function SocialProof() {
  return (
    <div className="py-20 bg-warm-50">
      <div className="container mx-auto px-4">
        <p className="text-center text-primary-500 text-lg mb-12 tracking-wide">
          実務で使いやすい導線に絞って、継続的に改善しています
        </p>

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

        <h3 className="text-2xl font-bold text-center text-primary-800 mb-10">
          今の提供方針
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-xl border border-warm-200 p-6 shadow-sm"
            >
              <h4 className="text-primary-800 font-semibold mb-3">{item.title}</h4>
              <p className="text-primary-600 leading-relaxed text-sm">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
