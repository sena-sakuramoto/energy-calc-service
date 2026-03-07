import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FaArrowRight,
  FaCheckCircle,
  FaCreditCard,
  FaLock,
  FaSpinner,
  FaUsers,
} from 'react-icons/fa';

import Layout from '../components/Layout';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { billingAPI } from '../utils/api';

const BILLING_BYPASS =
  process.env.NEXT_PUBLIC_USE_MOCK === 'true' ||
  process.env.NEXT_PUBLIC_E2E_AUTH === 'true' ||
  process.env.NODE_ENV !== 'production';

const PLAN_DEFS = {
  energy_monthly: {
    badge: '月額',
    title: '月額プラン',
    price: '9,800円 / 月',
    subtitle: '月に複数案件を回す事務所向けです。',
    cta: '月額プランを開始',
    points: [
      '公式BEIワークフローとPDF出力',
      '住宅の公式検証とPDF出力',
      '提案前の見直しや提出前チェック',
    ],
  },
  project_pass: {
    badge: '単発',
    title: '30日パス',
    price: '4,980円 / 回',
    subtitle: '1案件単位ではなく、購入日から30日間だけ有料機能を使いたいとき向けです。',
    cta: '30日パスを購入',
    points: [
      '購入日から30日間だけ有料機能を開放',
      '案件数ではなく利用期間で区切るプラン',
      '2回買うと月額とほぼ同水準',
    ],
  },
};

const DEFAULT_PLANS = {
  energy_monthly: { available: false, mode: 'subscription' },
  project_pass: { available: false, mode: 'payment', duration_days: 30 },
};

function formatExpiry(expiresAt) {
  if (!expiresAt) return '';

  try {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(expiresAt));
  } catch {
    return expiresAt;
  }
}

function statusMessage(status) {
  if (!status) return 'ログインすると現在の利用状態を確認できます。';
  if (status.type === 'circle_member') {
    return 'AI建築サークル会員として有料機能を利用できます。';
  }
  if (status.type === 'energy_subscriber') {
    return '月額プランが有効です。';
  }
  if (status.type === 'project_pass') {
    const expiry = formatExpiry(status.expires_at);
    return expiry
      ? `30日パスが有効です。案件数ではなく、期限の ${expiry} まで有料機能を使えます。`
      : '30日パスが有効です。案件数ではなく、購入日から30日間の利用権です。';
  }
  if (status.type === 'development_bypass') {
    return 'この開発環境では課金をバイパスしています。';
  }
  if (status.reason === 'stripe_not_configured') {
    return 'この環境ではStripeがまだ設定されていません。';
  }
  return 'まだ有料利用権は付与されていません。';
}

function billingDocuments(status) {
  const links = [];
  if (status?.receipt_url) {
    links.push({ href: status.receipt_url, label: '領収書を開く' });
  }
  if (status?.invoice_pdf_url) {
    links.push({ href: status.invoice_pdf_url, label: '請求書PDF' });
  }
  if (status?.invoice_hosted_url) {
    links.push({ href: status.invoice_hosted_url, label: '請求内容を見る' });
  }
  return links;
}

export default function PricingPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const confirmedSessionRef = useRef('');

  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(false);
  const [submittingPlan, setSubmittingPlan] = useState('');
  const [confirmingCheckout, setConfirmingCheckout] = useState(false);
  const [error, setError] = useState('');
  const receiptLinks = useMemo(() => billingDocuments(status), [status]);

  const redirectTarget = useMemo(() => {
    const raw = Array.isArray(router.query.redirect)
      ? router.query.redirect[0]
      : router.query.redirect;
    return raw || '/tools/official-bei';
  }, [router.query.redirect]);

  const checkoutSucceeded = router.query.checkout === 'success';
  const checkoutSessionId = useMemo(() => {
    const raw = Array.isArray(router.query.session_id)
      ? router.query.session_id[0]
      : router.query.session_id;
    return raw || '';
  }, [router.query.session_id]);

  useEffect(() => {
    let mounted = true;

    if (BILLING_BYPASS) {
      setStatus({
        active: true,
        type: 'development_bypass',
        checkout_available: false,
        bypass_enabled: true,
        plans: DEFAULT_PLANS,
      });
      return () => {
        mounted = false;
      };
    }

    if (loading) {
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
        const response = await billingAPI.getStatus(user.email);
        if (!mounted) return;
        setStatus(response.data || null);
      } catch {
        if (!mounted) return;
        setError('課金状態の確認に失敗しました。時間をおいて再度お試しください。');
      } finally {
        if (mounted) setChecking(false);
      }
    };

    fetchStatus();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, loading, user?.email]);

  useEffect(() => {
    let mounted = true;

    if (!router.isReady || BILLING_BYPASS || !checkoutSucceeded || !checkoutSessionId) {
      return () => {
        mounted = false;
      };
    }

    if (confirmedSessionRef.current === checkoutSessionId) {
      return () => {
        mounted = false;
      };
    }
    confirmedSessionRef.current = checkoutSessionId;

    const confirmCheckout = async () => {
      setConfirmingCheckout(true);
      setError('');
      try {
        const response = await billingAPI.confirmCheckout({
          session_id: checkoutSessionId,
        });
        if (!mounted) return;
        setStatus((current) => ({ ...(current || {}), ...(response.data || {}) }));
      } catch (err) {
        if (!mounted) return;
        setError(
          err.response?.data?.detail ||
            '決済完了後の有効化に失敗しました。少し置いてから再度お試しください。',
        );
      } finally {
        if (mounted) setConfirmingCheckout(false);
      }
    };

    confirmCheckout();
    return () => {
      mounted = false;
    };
  }, [BILLING_BYPASS, checkoutSessionId, checkoutSucceeded, router.isReady]);

  const handleCheckout = async (planCode) => {
    if (!user?.email) {
      router.push(
        `/login?redirect=${encodeURIComponent(`/pricing?redirect=${redirectTarget}`)}`,
      );
      return;
    }

    setSubmittingPlan(planCode);
    setError('');
    try {
      const origin = window.location.origin;
      const response = await billingAPI.createCheckout({
        email: user.email,
        plan: planCode,
        success_url: `${origin}/pricing?checkout=success&redirect=${encodeURIComponent(
          redirectTarget,
        )}`,
        cancel_url: `${origin}/pricing?redirect=${encodeURIComponent(redirectTarget)}`,
      });
      const checkoutUrl = response.data?.checkout_url;
      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
        return;
      }
      router.push(redirectTarget);
    } catch (err) {
      setError(err.response?.data?.detail || '決済ページの起動に失敗しました。');
    } finally {
      setSubmittingPlan('');
    }
  };

  const plans = status?.plans || DEFAULT_PLANS;

  return (
    <Layout
      title="料金 | 楽々省エネ計算"
      description="公式BEIワークフローと住宅の公式検証に対する料金ページです。月額プランと30日パスを選べます。"
      keywords="省エネ計算 料金, BEI 計算 サブスク, 30日パス"
      url="/pricing"
    >
      <div className="max-w-6xl mx-auto">
        <section className="bg-white border border-warm-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-primary-900 px-8 py-10 text-white">
            <p className="text-primary-300 text-xs font-semibold tracking-widest">料金</p>
            <h1 className="text-4xl font-bold mt-2">公式出力が必要なときだけ課金</h1>
            <p className="text-primary-300 mt-4 max-w-3xl">
              住宅のライブプレビューと料金比較は無料のままです。
              有料にしているのは、公式BEIワークフロー、PDF出力、住宅の公式検証、
              提出前の改善支援だけです。
            </p>
          </div>

          <div className="p-8">
            {checkoutSucceeded && confirmingCheckout && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                購入内容を反映しています。通常は数秒で完了します。
              </div>
            )}

            {checkoutSucceeded && !confirmingCheckout && status?.active && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                購入が反映されました。ツールへ戻って利用を再開できます。
              </div>
            )}

            {error && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                {error}
              </div>
            )}

            <div className="mb-6 grid lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-warm-200 bg-white p-5">
                <p className="text-xs font-semibold tracking-widest text-primary-500">無料</p>
                <h2 className="text-lg font-bold text-primary-900 mt-2">無料で使える範囲</h2>
                <ul className="mt-3 space-y-2 text-sm text-primary-600">
                  <li>住宅のライブ計算プレビュー</li>
                  <li>エネルギー計算と料金比較</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-accent-200 bg-accent-50/50 p-5">
                <p className="text-xs font-semibold tracking-widest text-accent-700">有料</p>
                <h2 className="text-lg font-bold text-primary-900 mt-2">有料でできること</h2>
                <ul className="mt-3 space-y-2 text-sm text-primary-700">
                  <li>公式BEIワークフローとPDF出力</li>
                  <li>住宅の公式検証とPDF出力</li>
                  <li>提出前の改善提案と見直し</li>
                </ul>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
              <div className="space-y-6">
                <div className="grid xl:grid-cols-2 gap-4">
                  {Object.entries(PLAN_DEFS).map(([planCode, plan]) => (
                    <div
                      key={planCode}
                      className={`rounded-2xl border p-6 ${
                        planCode === 'energy_monthly'
                          ? 'border-accent-200 bg-accent-50/40'
                          : 'border-primary-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-accent-600">{plan.badge}</p>
                          <h2 className="text-2xl font-bold text-primary-900 mt-1">
                            {plan.title}
                          </h2>
                          <p className="text-sm text-primary-500 mt-2">{plan.subtitle}</p>
                        </div>
                        <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-900 text-white">
                          <FaCreditCard className="text-2xl" />
                        </div>
                      </div>

                      <div className="mt-4 text-3xl font-bold text-primary-900">
                        {plan.price}
                      </div>

                      {planCode === 'project_pass' && (
                        <p className="mt-3 text-xs text-primary-500">
                          1案件ごとの従量課金ではありません。購入日から30日間は、対象の有料機能を案件数に関係なく利用できます。
                        </p>
                      )}

                      <div className="mt-5 space-y-3">
                        {plan.points.map((point) => (
                          <div key={point} className="flex items-start gap-3">
                            <FaCheckCircle className="text-green-600 mt-1" />
                            <div className="text-sm text-primary-700">{point}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border border-warm-200 rounded-2xl p-6 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-100 text-primary-700 rounded-xl p-3">
                      <FaUsers />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary-900">
                        AI建築サークル会員はそのまま利用可能
                      </h3>
                      <p className="text-sm text-primary-500 mt-2">
                        既存のAI建築サークル会員は有料ワークフロー機能を継続利用できます。
                        今回の料金設定は、非会員向けの単独導線を追加したものです。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-warm-200 rounded-2xl p-6 bg-white">
                <p className="text-sm text-primary-500">利用状況</p>
                {loading || checking ? (
                  <div className="mt-4 flex items-center gap-3 text-primary-500">
                    <FaSpinner className="animate-spin" />
                    <span>確認中...</span>
                  </div>
                ) : isAuthenticated ? (
                  <>
                    <div className="mt-3 text-2xl font-bold text-primary-900">
                      {status?.active ? '利用中' : '未契約'}
                    </div>
                    <p className="text-sm text-primary-500 mt-2">{statusMessage(status)}</p>

                    {status?.type === 'project_pass' && status?.expires_at && (
                      <p className="mt-3 text-xs text-primary-500">
                        期限: {formatExpiry(status.expires_at)}
                      </p>
                    )}

                    <div className="mt-4 rounded-xl border border-warm-200 bg-warm-50 p-4">
                      <p className="text-xs font-semibold text-primary-700">領収書・請求書</p>
                      <p className="mt-2 text-xs text-primary-500">
                        決済完了後、Stripe から領収書メールを自動送信します。見当たらない場合は迷惑メールも確認してください。
                      </p>
                      {receiptLinks.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {receiptLinks.map((link) => (
                            <a
                              key={link.label}
                              href={link.href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center rounded-lg border border-primary-300 bg-white px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-50 transition-colors"
                            >
                              {link.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                      {status?.active ? (
                        <Link
                          href={redirectTarget}
                          className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
                        >
                          ツールへ戻る <FaArrowRight className="text-xs" />
                        </Link>
                      ) : (
                        <>
                          {plans.energy_monthly?.available && (
                            <button
                              type="button"
                              onClick={() => handleCheckout('energy_monthly')}
                              disabled={Boolean(submittingPlan)}
                              className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
                            >
                              {submittingPlan === 'energy_monthly' ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaLock className="text-xs" />
                              )}
                              {PLAN_DEFS.energy_monthly.cta}
                            </button>
                          )}

                          {plans.project_pass?.available && (
                            <button
                              type="button"
                              onClick={() => handleCheckout('project_pass')}
                              disabled={Boolean(submittingPlan)}
                              className="inline-flex items-center justify-center gap-2 border border-primary-300 text-primary-700 hover:bg-warm-50 disabled:opacity-60 font-semibold px-5 py-3 rounded-lg transition-colors"
                            >
                              {submittingPlan === 'project_pass' ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaCreditCard className="text-xs" />
                              )}
                              {PLAN_DEFS.project_pass.cta}
                            </button>
                          )}

                          {!plans.energy_monthly?.available &&
                            !plans.project_pass?.available && (
                              <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 bg-primary-800 hover:bg-primary-900 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
                              >
                                お問い合わせ
                              </Link>
                            )}
                        </>
                      )}

                      <Link
                        href="/campaign"
                        className="inline-flex items-center justify-center gap-2 border border-primary-300 text-primary-700 hover:bg-warm-50 font-semibold px-5 py-3 rounded-lg transition-colors"
                      >
                        導入案内を見る
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-3 text-2xl font-bold text-primary-900">
                      ログインして購入
                    </div>
                    <p className="text-sm text-primary-500 mt-2">
                      先にアカウントを作成してください。購入後は元のツールへ戻れます。
                    </p>
                    <div className="mt-6 flex flex-col gap-3">
                      <Link
                        href={`/register?redirect=${encodeURIComponent(`/pricing?redirect=${redirectTarget}`)}`}
                        className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
                      >
                        新規登録
                      </Link>
                      <Link
                        href={`/login?redirect=${encodeURIComponent(`/pricing?redirect=${redirectTarget}`)}`}
                        className="inline-flex items-center justify-center gap-2 border border-primary-300 text-primary-700 hover:bg-warm-50 font-semibold px-5 py-3 rounded-lg transition-colors"
                      >
                        ログイン
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
