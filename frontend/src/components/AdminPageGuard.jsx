import { useEffect } from 'react';
import { useRouter } from 'next/router';

import Layout from './Layout';
import { useAuth } from '../contexts/FirebaseAuthContext';

export default function AdminPageGuard({
  children,
  title = '管理画面',
}) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const redirect = encodeURIComponent(router.asPath || '/admin');
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <Layout title={title}>
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">管理権限を確認しています</h1>
          <p className="text-slate-600">ログイン状態と権限を読み込んでいます。</p>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout title={title}>
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">ログインが必要です</h1>
          <p className="text-slate-600">ログインページに移動しています。</p>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout title={title}>
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">管理者権限がありません</h1>
          <p className="text-slate-600">
            この画面は管理者アカウントのみ利用できます。
          </p>
        </div>
      </Layout>
    );
  }

  return <Layout title={title}>{children}</Layout>;
}
