import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CalculatorLayout from '../../components/CalculatorLayout';

export default function LegacyBEIRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/tools/official-bei');
  }, [router]);

  return (
    <CalculatorLayout
      title="公式BEI計算へ移動中"
      subtitle="旧BEI計算ページは廃止され、公式BEI計算に統合されました。"
    >
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center border border-warm-200">
        <h1 className="text-2xl font-bold text-primary-900 mb-3">公式BEI計算へ移動しています</h1>
        <p className="text-primary-600 mb-6">
          簡易BEI試算は終了し、公式BEI計算（様式A〜I入力）へ一本化しました。
        </p>
        <Link
          href="/tools/official-bei"
          className="inline-flex items-center justify-center bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          公式BEI計算を開く
        </Link>
      </div>
    </CalculatorLayout>
  );
}
