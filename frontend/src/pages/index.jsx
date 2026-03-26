import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/FirebaseAuthContext';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        window.location.replace('https://rakuraku-energy.archi-prisma.co.jp');
      }
    }
  }, [loading, isAuthenticated, router]);

  return (
    <Layout title="楽々省エネ計算">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-primary-400 text-lg">読み込み中...</div>
      </div>
    </Layout>
  );
}
