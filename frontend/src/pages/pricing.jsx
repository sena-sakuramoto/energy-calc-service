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
import { billingAPI, projectsAPI } from '../utils/api';

const BILLING_BYPASS =
  process.env.NEXT_PUBLIC_USE_MOCK === 'true' ||
  process.env.NEXT_PUBLIC_E2E_AUTH === 'true' ||
  process.env.NODE_ENV !== 'production';

const PLAN_DEFS = {
  energy_monthly: {
    badge: '月額',
    title: '月額プラン',
    price: '9,800円 / 月',
    subtitle: '月に複数案件を回す事務所向けです。すべての案件で使えます。',
    cta: '月額プランを開始',
    points: [
      '公式BEIワークフローとPDF出力',
      '住宅の公式検証とPDF出力',
      '提案前の見直しや提出前チェック',
    ],
  },
  project_pass: {
    badge: '単発',
    title: '1案件パス',
    price: '4,980円 / 回',
    subtitle: '1つのプロジェクトだけ、購入日から30日間有料機能を使いたいとき向けです。',
    cta: '1案件パスを購入',
    points: [
      '選んだ1プロジェクトだけ30日間アンロック',
      '自動更新なし。単発案件が終わればそのまま終了',
      '2案件以上なら月額プランの方が割安',
    ],
  },
};

const DEFAULT_PLANS = {
  energy_monthly: { available: false, mode: 'subscription' },
  project_pass: { available: false, mode: 'payment', duration_days: 30, requires_project: true },
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
  if (status.type === 'admin_access') {
    return '管理者アカウントとして有料機能を利用できます。';
  }
  if (status.type === 'circle_member') {
    return 'AI建築サークル会員として有料機能を利用できます。';
  }
  if (status.type === 'energy_subscriber') {
    return '月額プランが有効です。';
  }
  if (status.type === 'project_pass') {
    const expiry = formatExpiry(status.expires_at);
    const projectLabel = status.project_name ? `「${status.project_name}」` : '選択中の案件';
    return expiry
      ? `${projectLabel} に対する1案件パスが有効です。期限の ${expiry} まで使えます。`
      : `${projectLabel} に対する1案件パスが有効です。購入日から30日間の利用権です。`;
  }
  if (status.type === 'project_pass_legacy') {
    return '旧30日パスが有効です。現在の有効期限までは従来どおり利用できます。';
  }
  if (status.type === 'development_bypass') {
    return 'この開発環境では課金をバイパスしています。';
  }
  if (status.reason === 'project_selection_required') {
    return '1案件パスを使うには、対象プロジェクトを選んでからツールへ戻ってください。';
  }
  if (status.reason === 'project_pass_other_project') {
    return status.bound_project_name
      ? `1案件パスは別案件「${status.bound_project_name}」に紐づいています。対象案件を選び直してください。`
      : '1案件パスは別案件に紐づいています。対象案件を選び直してください。';
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

function appendQueryParam(path, key, value) {
  if (!value) return path;
  try {
    const url = new URL(path, 'https://rakuraku-energy.archi-prisma.co.jp');
    if (!url.searchParams.has(key)) {
      url.searchParams.set(key, String(value));
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return path;
  }
}

function readProjectId(value) {
  if (!value) return '';
  try {
    const url = new URL(value, 'https://rakuraku-energy.archi-prisma.co.jp');
    return url.searchParams.get('project_id') || '';
  } catch {
    return '';
  }
}

export default function PricingPage() {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  const confirmedSessionRef = useRef('');

  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(false);
  const [submittingPlan, setSubmittingPlan] = useState('');
  const [confirmingCheckout, setConfirmingCheckout] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState('');
  const receiptLinks = useMemo(() => billingDocuments(status), [status]);

  const redirectTarget = useMemo(() => {
    const raw = Array.isArray(router.query.redirect)
      ? router.query.redirect[0]
      : router.query.redirect;
    return raw || '/tools/official-bei';
  }, [router.query.redirect]);

  const queryProjectId = useMemo(() => {
    const raw = Array.isArray(router.query.project_id)
      ? router.query.project_id[0]
      : router.query.project_id;
    return raw || readProjectId(redirectTarget) || '';
  }, [redirectTarget, router.query.project_id]);

  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => {
    if (queryProjectId) {
      setSelectedProjectId(String(queryProjectId));
    }
  }, [queryProjectId]);

  const effectiveProjectId = selectedProjectId || queryProjectId || '';
  const resolvedRedirectTarget = useMemo(
    () => (effectiveProjectId ? appendQueryParam(redirectTarget, 'project_id', effectiveProjectId) : redirectTarget),
    [effectiveProjectId, redirectTarget],
  );
  const pricingReturnPath = useMemo(() => {
    const params = new URLSearchParams({ redirect: redirectTarget });
    if (effectiveProjectId) {
      params.set('project_id', effectiveProjectId);
    }
    return `/pricing?${params.toString()}`;
  }, [effectiveProjectId, redirectTarget]);

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

    if (isAuthenticated && isAdmin) {
      setChecking(false);
      setStatus({
        active: true,
        type: 'admin_access',
        checkout_available: false,
        bypass_enabled: false,
        plans: DEFAULT_PLANS,
      });
      return () => {
        mounted = false;
      };
    }

    if (!isAuthenticated || !user?.email) {
      setChecking(false);
      setStatus(null);
      setProjects([]);
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
        setError('課金状態の確認に失敗しました。時間をおいて再度お試しください。');
      } finally {
        if (mounted) setChecking(false);
      }
    };

    fetchStatus();
    return () => {
      mounted = false;
    };
  }, [effectiveProjectId, isAdmin, isAuthenticated, loading, user?.email]);

  useEffect(() => {
    let mounted = true;

    if (!router.isReady || BILLING_BYPASS || loading || !isAuthenticated) {
      return () => {
        mounted = false;
      };
    }

    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await projectsAPI.getAll();
        if (!mounted) return;
        const items = (response.data || []).map((project) => ({
          id: String(project.id),
          name: project.projectInfo?.name || project.name || `案件 ${project.id}`,
        }));
        setProjects(items);
        if (!selectedProjectId && queryProjectId) {
          setSelectedProjectId(String(queryProjectId));
        }
      } catch {
        if (!mounted) return;
        setProjects([]);
      } finally {
        if (mounted) setLoadingProjects(false);
      }
    };

    fetchProjects();
    return () => {
      mounted = false;
    };
  }, [BILLING_BYPASS, isAuthenticated, loading, queryProjectId, router.isReady]);

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
      router.push(`/login?redirect=${encodeURIComponent(pricingReturnPath)}`);
      return;
    }

    if (planCode === 'project_pass' && !effectiveProjectId) {
      setError('1案件パスは対象プロジェクトを選んでから購入してください。');
      return;
    }

    setSubmittingPlan(planCode);
    setError('');
    try {
      const origin = window.location.origin;
      const successParams = new URLSearchParams({
        checkout: 'success',
        redirect: resolvedRedirectTarget,
      });
      if (effectiveProjectId) {
        successParams.set('project_id', effectiveProjectId);
      }

      const cancelParams = new URLSearchParams({ redirect: resolvedRedirectTarget });
      if (effectiveProjectId) {
        cancelParams.set('project_id', effectiveProjectId);
      }

      const response = await billingAPI.createCheckout({
        email: user.email,
        plan: planCode,
        project_id: planCode === 'project_pass' ? Number(effectiveProjectId) : null,
        success_url: `${origin}/pricing?${successParams.toString()}`,
        cancel_url: `${origin}/pricing?${cancelParams.toString()}`,
      });
      const checkoutUrl = response.data?.checkout_url;
      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
        return;
      }
      router.push(resolvedRedirectTarget);
    } catch (err) {
      setError(err.response?.data?.detail || '決済ページの起動に失敗しました。');
    } finally {
      setSubmittingPlan('');
    }
  };

  const handleOpenPortal = async () => {
    if (!user?.email) {
      router.push(`/login?redirect=${encodeURIComponent(pricingReturnPath)}`);
      return;
    }

    setOpeningPortal(true);
    setError('');
    try {
      const origin = window.location.origin;
      const response = await billingAPI.openPortal({
        email: user.email,
        return_url: `${origin}/pricing?redirect=${encodeURIComponent(resolvedRedirectTarget)}`,
      });
      const portalUrl = response.data?.portal_url;
      if (portalUrl) {
        window.location.assign(portalUrl);
        return;
      }
      setError('請求・契約管理ページを開けませんでした。');
    } catch (err) {
      setError(err.response?.data?.detail || '請求・契約管理ページの起動に失敗しました。');
    } finally {
      setOpeningPortal(false);
    }
  };

  const plans = status?.plans || DEFAULT_PLANS;
  const hasProjectPasses = Boolean(status?.project_passes?.length);
  const canManageBilling = Boolean(
    status?.customer_portal_available &&
      user?.email &&
      ['energy_subscriber', 'circle_member'].includes(status?.type),
  );
  const currentProjectName =
    projects.find((project) => project.id === String(effectiveProjectId))?.name ||
    status?.project_name ||
    '';
  const statusHeading = status?.active ? '利用中' : hasProjectPasses ? '案件パス保有中' : '未契約';

  return (
    <Layout
      title="料金 | 楽々省エネ計算"
      description="公式BEIワークフローと住宅の公式検証に対する料金ページです。月額プランと1案件パスを選べます。"
      keywords="省エネ計算 料金, BEI 計算 サブスク, 1案件パス"
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
                        <div className="mt-4 space-y-3">
                          <p className="text-xs text-primary-500">
                            このプランは 1プロジェクト専用です。購入後 30日間は、選んだ案件だけ公式出力と住宅公式検証を使えます。
                          </p>
                          <label className="block">
                            <span className="text-xs font-semibold text-primary-700">対象プロジェクト</span>
                            {isAuthenticated ? (
                              loadingProjects ? (
                                <div className="mt-2 rounded-lg border border-warm-200 bg-warm-50 px-3 py-3 text-sm text-primary-500">
                                  プロジェクト一覧を読み込み中です...
                                </div>
                              ) : projects.length > 0 ? (
                                <select
                                  value={selectedProjectId}
                                  onChange={(event) => setSelectedProjectId(event.target.value)}
                                  className="mt-2 w-full rounded-lg border border-primary-300 bg-white px-3 py-3 text-sm text-primary-800 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-200"
                                >
                                  <option value="">対象プロジェクトを選択</option>
                                  {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                      {project.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div className="mt-2 rounded-lg border border-warm-200 bg-warm-50 px-3 py-3 text-sm text-primary-600">
                                  先にプロジェクトを作成してください。案件パスは作成済みプロジェクトに紐づけます。
                                </div>
                              )
                            ) : (
                              <div className="mt-2 rounded-lg border border-warm-200 bg-warm-50 px-3 py-3 text-sm text-primary-500">
                                ログインすると対象プロジェクトを選べます。
                              </div>
                            )}
                          </label>
                        </div>
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
                      {statusHeading}
                    </div>
                    <p className="text-sm text-primary-500 mt-2">{statusMessage(status)}</p>

                    {status?.type === 'project_pass' && (
                      <div className="mt-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-xs text-primary-700">
                        <div>対象案件: {status.project_name || currentProjectName || `案件 ${status.project_id}`}</div>
                        {status?.expires_at && <div className="mt-1">期限: {formatExpiry(status.expires_at)}</div>}
                      </div>
                    )}

                    {status?.type === 'project_pass_legacy' && status?.expires_at && (
                      <p className="mt-3 text-xs text-primary-500">
                        期限: {formatExpiry(status.expires_at)}
                      </p>
                    )}

                    {!status?.active && hasProjectPasses && (
                      <div className="mt-4 rounded-xl border border-warm-200 bg-warm-50 p-4">
                        <p className="text-xs font-semibold text-primary-700">保有中の案件パス</p>
                        <div className="mt-3 space-y-2">
                          {status.project_passes.map((projectPass) => {
                            const isSelected = String(projectPass.project_id) === String(effectiveProjectId);
                            return (
                              <button
                                key={projectPass.project_pass_id || `${projectPass.project_id}-${projectPass.expires_at}`}
                                type="button"
                                onClick={() => setSelectedProjectId(String(projectPass.project_id))}
                                className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
                                  isSelected
                                    ? 'border-accent-300 bg-accent-50'
                                    : 'border-warm-200 bg-white hover:border-primary-300'
                                }`}
                              >
                                <div className="text-sm font-semibold text-primary-800">
                                  {projectPass.project_name || `案件 ${projectPass.project_id}`}
                                </div>
                                <div className="mt-1 text-xs text-primary-500">
                                  期限: {formatExpiry(projectPass.expires_at)}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 rounded-xl border border-warm-200 bg-warm-50 p-4">
                      <p className="text-xs font-semibold text-primary-700">領収書・請求書</p>
                      <p className="mt-2 text-xs text-primary-500">
                        決済完了後、Stripe から領収書メールを自動送信します。見当たらない場合は迷惑メールも確認してください。
                      </p>
                      {canManageBilling && (
                        <div className="mt-3 rounded-lg border border-primary-200 bg-white px-3 py-3 text-xs text-primary-700">
                          月額プランのカード変更、請求確認、停止手続きは「請求・契約管理」から行えます。
                        </div>
                      )}
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
                        <>
                          <Link
                            href={resolvedRedirectTarget}
                            className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
                          >
                            ツールへ戻る <FaArrowRight className="text-xs" />
                          </Link>
                          {canManageBilling && (
                            <button
                              type="button"
                              onClick={handleOpenPortal}
                              disabled={openingPortal}
                              className="inline-flex items-center justify-center gap-2 border border-primary-300 text-primary-700 hover:bg-warm-50 disabled:opacity-60 font-semibold px-5 py-3 rounded-lg transition-colors"
                            >
                              {openingPortal ? <FaSpinner className="animate-spin" /> : <FaCreditCard className="text-xs" />}
                              請求・契約管理
                            </button>
                          )}
                        </>
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
                              disabled={Boolean(submittingPlan) || (isAuthenticated && !effectiveProjectId)}
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

                          {isAuthenticated && !effectiveProjectId && plans.project_pass?.available && (
                            <p className="text-xs text-primary-500">
                              1案件パスを買う前に、左側で対象プロジェクトを選んでください。
                            </p>
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
                        href={`/register?redirect=${encodeURIComponent(pricingReturnPath)}`}
                        className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
                      >
                        新規登録
                      </Link>
                      <Link
                        href={`/login?redirect=${encodeURIComponent(pricingReturnPath)}`}
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
