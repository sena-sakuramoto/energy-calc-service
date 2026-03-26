import Link from 'next/link';
import {
  FaBuilding,
  FaChartLine,
  FaCheckCircle,
  FaHeart,
  FaLightbulb,
  FaShieldAlt,
} from 'react-icons/fa';

import Layout from '../components/Layout';

const principles = [
  {
    icon: FaLightbulb,
    title: '雑に使っても前へ進める',
    body: '操作のたびに不安にならず、入力不足があっても戻って埋め直せる体験を優先しています。',
  },
  {
    icon: FaShieldAlt,
    title: '公式出力に価値を寄せる',
    body: '無料の試算と、有料の公式ワークフローを分けて、料金の納得感を作る方針です。',
  },
  {
    icon: FaHeart,
    title: '設計実務の速度を落とさない',
    body: '制度理解のためのツールではなく、案件を前へ進めるための実務ツールとして磨いています。',
  },
];

const capabilities = [
  '公式BEIワークフロー',
  '住宅省エネのライブ確認',
  '住宅の公式検証とPDF出力',
  'エネルギー計算と料金比較',
  '提出前の見直し',
  '案件単位の運用',
];

export default function About() {
  return (
    <Layout
      title="このサービスについて | 楽々省エネ計算"
      description="楽々省エネ計算の考え方と提供方針をまとめたページです。"
      keywords="省エネ計算, about, 公式BEI"
      path="/about"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-primary-900">
            設計実務を前に進めるための
            <br />
            省エネ計算ツール
          </h1>
          <p className="text-xl text-primary-600 max-w-3xl mx-auto leading-relaxed">
            楽々省エネ計算は、公式BEIや住宅省エネの実務を、
            社内で回しやすい形へ寄せるためのサービスです。
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-warm-100 p-3 rounded-full mr-4">
              <FaBuilding className="text-accent-500 text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary-900">
                Archi-Prisma Design works 株式会社
              </h2>
              <p className="text-primary-600">
                建築設計とデジタル支援の両方からプロダクトを整えています。
              </p>
            </div>
          </div>
          <p className="text-primary-600 leading-relaxed">
            制度対応そのものを目的化するのではなく、案件を止めないための運用設計として、
            入力、確認、出力の流れを作っています。
          </p>
        </div>

        <div className="bg-warm-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-6 text-center">
            つくるときに大事にしていること
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {principles.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center">
                  <div className="bg-accent-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Icon className="text-accent-500 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-primary-600 text-sm">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-6">現在できること</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center">
                <FaChartLine className="mr-2 text-accent-400" />
                主な機能
              </h3>
              <ul className="space-y-2 text-sm text-primary-600">
                {capabilities.map((item) => (
                  <li key={item} className="flex items-center">
                    <div className="w-2 h-2 bg-accent-400 rounded-full mr-3"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center">
                <FaCheckCircle className="mr-2 text-accent-400" />
                今の料金方針
              </h3>
              <p className="text-primary-600 text-sm leading-relaxed">
                住宅プレビューや料金比較は無料のまま維持し、公式出力と提出前支援だけを
                月額または1案件パスで提供しています。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-primary-800 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">詳しく見たい方へ</h2>
          <p className="mb-6">
            料金と導入フローを確認したうえで、必要なところだけ導入できます。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 inline-block"
            >
              料金を見る
            </Link>
            <Link
              href="/campaign"
              className="border border-white hover:bg-white hover:text-primary-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 inline-block"
            >
              導入案内を見る
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
