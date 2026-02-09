// frontend/src/components/SocialProof.jsx
import { FaQuoteLeft } from 'react-icons/fa';

const stats = [
  { value: '500+', label: '計算実績' },
  { value: '5分', label: '平均計算時間' },
  { value: '100%', label: '法令準拠' },
];

const testimonials = [
  {
    quote: '手計算で3日かかっていた作業が5分で完了。設計検討の回数を増やせるようになった。',
    author: '一級建築士・設計事務所',
  },
  {
    quote: '申請書類の自動生成が素晴らしい。フォーマットの手間が完全になくなった。',
    author: '設備設計者・ゼネコン',
  },
  {
    quote: '地域区分や用途の違いによる比較検討が簡単。最適解を見つけやすい。',
    author: '建築設計者・設計事務所',
  },
];

export default function SocialProof() {
  return (
    <div className="py-20 bg-warm-50">
      <div className="container mx-auto px-4">
        {/* 累計カウンター */}
        <p className="text-center text-primary-500 text-lg mb-12 tracking-wide">
          累計 <span className="text-3xl font-bold text-primary-800">500+</span> 件の省エネ計算をサポート
        </p>

        {/* 実績カード */}
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

        {/* 利用者の声 */}
        <h3 className="text-2xl font-bold text-center text-primary-800 mb-10">
          利用者の声
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-warm-200 p-6 shadow-sm"
            >
              <FaQuoteLeft className="text-accent-200 text-xl mb-4" />
              <p className="text-primary-600 leading-relaxed mb-4 text-sm">
                {item.quote}
              </p>
              <div className="border-t border-warm-200 pt-3">
                <p className="text-xs text-primary-400 font-medium">
                  {item.author}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
