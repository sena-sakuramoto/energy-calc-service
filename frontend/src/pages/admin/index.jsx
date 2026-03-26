import Link from 'next/link';
import { FaChartBar, FaHandshake, FaUsers } from 'react-icons/fa';

import AdminPageGuard from '../../components/AdminPageGuard';

const ADMIN_LINKS = [
  {
    href: '/admin/partners',
    title: 'パートナー管理',
    description: '紹介案件の状況確認とステータス更新を行います。',
    icon: FaHandshake,
  },
  {
    href: '/admin/manufacturer-dashboard',
    title: 'メーカー分析',
    description: 'メーカー別の選定数と紹介動向を確認します。',
    icon: FaChartBar,
  },
  {
    href: '/admin/firebase-users',
    title: 'ユーザー管理',
    description: 'Firebase / Firestore の利用者一覧を確認します。',
    icon: FaUsers,
  },
];

export default function AdminHomePage() {
  return (
    <AdminPageGuard title="管理画面">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="bg-white rounded-2xl border border-warm-200 p-6">
          <h1 className="text-3xl font-bold text-primary-800">管理画面</h1>
          <p className="text-primary-500 mt-2">
            管理者向けの運用画面です。必要な管理機能へここから移動できます。
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          {ADMIN_LINKS.map(({ href, title, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="bg-white border border-warm-200 rounded-2xl p-5 hover:border-accent-400 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-accent-50 text-accent-600 flex items-center justify-center">
                  <Icon />
                </div>
                <h2 className="text-lg font-semibold text-primary-800">{title}</h2>
              </div>
              <p className="text-sm text-primary-500">{description}</p>
            </Link>
          ))}
        </section>
      </div>
    </AdminPageGuard>
  );
}
