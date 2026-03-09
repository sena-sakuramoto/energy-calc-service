import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FaArrowRight,
  FaCheckCircle,
  FaLock,
  FaSpinner,
} from 'react-icons/fa';

import { useAuth } from '../contexts/FirebaseAuthContext';
import { billingAPI } from '../utils/api';

const BILLING_BYPASS =
  process.env.NEXT_PUBLIC_USE_MOCK === 'true' ||
  process.env.NEXT_PUBLIC_E2E_AUTH === 'true' ||
  process.env.NODE_ENV !== 'production';

function readProjectId(path) {
  if (!path) return '';
  try {
    const url = new URL(path, 'https://rakuraku-energy.archi-prisma.co.jp');
    return url.searchParams.get('project_id') || '';
  } catch {
    return '';
  }
}

export default function SubscriptionGate({
  children,
  toolName = 'このツール',
  redirectPath,
  projectId,
}) {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(!BILLING_BYPASS);
  const [error, setError] = useState('');

  const currentPath = redirectPath || router.asPath || '/';
  const effectiveProjectId = projectId || readProjectId(currentPath);

  useEffect(() => {
    let mounted = true;

    if (BILLING_BYPASS) {
      setChecking(false);
      setStatus({ active: true, type: 'development_bypass' });
      return () => {
        mounted = false;
      };
    }

    if (loading) {
      return () => {
        mounted = false;
      };
    }

    if (isAuthenticated && isAdmin) {
      setChecking(false);
      setStatus({ active: true, type: 'admin_access' });
      return () => {
        mounted = false;
      };
    }

    if (!isAuthenticated || !user?.email) {
      setChecking(false);
      setStatus(null);
      return () => {
        mounted = false;
      };
    }

    const fetchStatus = async () => {
      setChecking(true);
      setError('');
      try {
        const response = await billingAPI.getStatus(user.email, effectiveProjectId || null);
        if (!mounted) return;
        setStatus(response.data || null);
      } catch {
        if (!mounted) return;
        setError('課金状態の確認に失敗しました。少し置いてから再度お試しください。');
      } finally {
        if (mounted) setChecking(false);
      }
    };

    fetchStatus();
    return () => {
      mounted = false;
    };
  }, [effectiveProjectId, isAdmin, isAuthenticated, loading, user?.email]);

  if (BILLING_BYPASS) {
    return children;
  }

  if (!loading && isAuthenticated && isAdmin) {
    return children;
  }

  if (loading || checking) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-warm-200 rounded-2xl shadow-sm p-8 text-center">
        <FaSpinner className="mx-auto text-2xl text-accent-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-primary-800">利用権限を確認しています</h2>
        <p className="text-primary-500 mt-2">
          {toolName}を開く前に、課金状態を確認しています。
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(currentPath);
    return (
      <div className="max-w-3xl mx-auto bg-white border border-warm-200 rounded-2xl shadow-sm p-8 text-center">
        <FaLock className="mx-auto text-3xl text-primary-400 mb-4" />
        <h2 className="text-2xl font-bold text-primary-800">ログインして続ける</h2>
        <p className="text-primary-500 mt-2">
          {toolName}の有料機能を使うには、先にアカウント登録が必要です。
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/login?redirect=${redirect}`}
            className="bg-primary-800 hover:bg-primary-900 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            ログイン
          </Link>
          <Link
            href={`/register?redirect=${redirect}`}
            className="border border-primary-300 text-primary-700 hover:bg-warm-50 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            新規登録
          </Link>
        </div>
      </div>
    );
  }

  if (status?.active) {
    return children;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white border border-warm-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-primary-900 px-8 py-6 text-white">
        <p className="text-primary-300 text-xs font-semibold tracking-widest">有料</p>
        <h2 className="text-2xl font-bold mt-2">
          {toolName}の公式出力は有料プランで利用できます
        </h2>
        <p className="text-primary-300 mt-2">
          月額プランなら全案件で使えます。1案件パスは、選んだ1プロジェクトだけ30日間使えます。
        </p>
        <p className="text-primary-300 mt-2 text-sm">
          領収書は決済後に自動送信されます。1案件パスを使う場合は、対象プロジェクトを選んだ状態でこの画面を開いてください。
        </p>
      </div>

      <div className="p-8">
        {error && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <FaCheckCircle className="text-green-600 mt-1" />
              <div>
                <div className="font-semibold text-primary-800">
                  公式BEIワークフローとPDF出力
                </div>
                <div className="text-sm text-primary-500">
                  提出を前提にした公式ルートの計算と、帳票出力に対応します。
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaCheckCircle className="text-green-600 mt-1" />
              <div>
                <div className="font-semibold text-primary-800">
                  住宅の公式検証とPDF出力
                </div>
                <div className="text-sm text-primary-500">
                  UA値やηAC値の確認と、説明しやすい形での出力に対応します。
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaCheckCircle className="text-green-600 mt-1" />
              <div>
                <div className="font-semibold text-primary-800">
                  提案前の改善支援
                </div>
                <div className="text-sm text-primary-500">
                  汎用計算ではなく、提出前後の実務に価値を寄せています。
                </div>
              </div>
            </div>
          </div>

          <div className="bg-warm-50 border border-warm-200 rounded-xl p-6">
            <div className="text-sm text-primary-500">現在の状態</div>
            <div className="text-lg font-bold text-primary-800 mt-1">
              {status?.reason === 'stripe_not_configured'
                ? 'Stripe未設定'
                : status?.reason === 'project_selection_required'
                  ? '案件が未選択です'
                  : status?.reason === 'project_pass_other_project'
                    ? '別案件に紐づいたパスです'
                    : '有料利用権がありません'}
            </div>
            <p className="text-sm text-primary-500 mt-2">
              {status?.reason === 'stripe_not_configured'
                ? 'この環境ではまだStripe設定が完了していません。'
                : status?.reason === 'project_selection_required'
                  ? '1案件パスを使うには対象プロジェクトが必要です。料金ページまたはプロジェクト一覧から案件を選んでください。'
                  : status?.reason === 'project_pass_other_project'
                    ? `保有中の1案件パスは「${status?.bound_project_name || '別案件'}」に紐づいています。対象案件を選び直してください。`
                    : '料金ページで月額プランまたは1案件パスを選択してから、この画面へ戻ってください。'}
            </p>

            {!effectiveProjectId && (
              <div className="mt-4 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-xs text-primary-700">
                この画面は案件未選択です。1案件パスで使う場合は、プロジェクト詳細から開くか、料金ページで対象案件を選んでください。
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3">
              <Link
                href={`/pricing?redirect=${encodeURIComponent(currentPath)}`}
                className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
              >
                料金を見る <FaArrowRight className="text-xs" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border border-primary-300 text-primary-700 hover:bg-warm-50 font-semibold px-5 py-3 rounded-lg transition-colors"
              >
                お問い合わせ
              </Link>
              {!effectiveProjectId && (
                <Link
                  href="/projects"
                  className="inline-flex items-center justify-center gap-2 border border-primary-300 text-primary-700 hover:bg-warm-50 font-semibold px-5 py-3 rounded-lg transition-colors"
                >
                  プロジェクト一覧へ
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
