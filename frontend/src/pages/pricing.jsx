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
    badge: 'STANDARD',
    title: 'Monthly Plan',
    price: 'JPY 9,800 / month',
    subtitle: 'Best for firms running multiple projects every month.',
    cta: 'Start monthly plan',
    points: [
      'Official BEI workflow and PDF output',
      'Residential official verification and PDF export',
      'Ongoing proposal support and pre-submission checks',
    ],
  },
  project_pass: {
    badge: 'ONE-OFF',
    title: '30-Day Pass',
    price: 'JPY 4,980 / pass',
    subtitle: 'Best for one-off jobs that need a short paid window.',
    cta: 'Buy 30-day pass',
    points: [
      'Unlock paid tools for 30 days',
      'Designed for single-project official output work',
      'Two passes cost about the same as the monthly plan',
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
  if (!status) return 'Log in to check your billing status.';
  if (status.type === 'circle_member') return 'This account has paid access through AI circle membership.';
  if (status.type === 'energy_subscriber') return 'The monthly subscription is active.';
  if (status.type === 'project_pass') {
    const expiry = formatExpiry(status.expires_at);
    return expiry ? `The 30-day pass is active until ${expiry}.` : 'The 30-day pass is active.';
  }
  if (status.type === 'development_bypass') return 'Billing is bypassed in the current development environment.';
  if (status.reason === 'stripe_not_configured') return 'Stripe is not configured in this environment.';
  return 'This account does not have paid access yet.';
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

  const redirectTarget = useMemo(() => {
    const raw = Array.isArray(router.query.redirect) ? router.query.redirect[0] : router.query.redirect;
    return raw || '/tools/official-bei';
  }, [router.query.redirect]);

  const checkoutSucceeded = router.query.checkout === 'success';
  const checkoutSessionId = useMemo(() => {
    const raw = Array.isArray(router.query.session_id) ? router.query.session_id[0] : router.query.session_id;
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
        setError('Failed to check billing status. Please retry.');
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
        const response = await billingAPI.confirmCheckout({ session_id: checkoutSessionId });
        if (!mounted) return;
        setStatus((current) => ({ ...(current || {}), ...(response.data || {}) }));
      } catch (err) {
        if (!mounted) return;
        setError(err.response?.data?.detail || 'Failed to activate the completed checkout session.');
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
      router.push(`/login?redirect=${encodeURIComponent(`/pricing?redirect=${redirectTarget}`)}`);
      return;
    }

    setSubmittingPlan(planCode);
    setError('');
    try {
      const origin = window.location.origin;
      const response = await billingAPI.createCheckout({
        email: user.email,
        plan: planCode,
        success_url: `${origin}/pricing?checkout=success&redirect=${encodeURIComponent(redirectTarget)}`,
        cancel_url: `${origin}/pricing?redirect=${encodeURIComponent(redirectTarget)}`,
      });
      const checkoutUrl = response.data?.checkout_url;
      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
        return;
      }
      router.push(redirectTarget);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start checkout.');
    } finally {
      setSubmittingPlan('');
    }
  };

  const plans = status?.plans || DEFAULT_PLANS;

  return (
    <Layout
      title="Pricing | Energy Calc"
      description="Pricing for official BEI workflow and residential official verification. Choose between a monthly plan and a one-off 30-day pass."
      keywords="energy calc pricing, Stripe subscription, project pass"
      url="/pricing"
    >
      <div className="max-w-6xl mx-auto">
        <section className="bg-white border border-warm-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-primary-900 px-8 py-10 text-white">
            <p className="text-primary-300 text-xs font-semibold tracking-widest">PRICING</p>
            <h1 className="text-4xl font-bold mt-2">Charge only for official workflow output</h1>
            <p className="text-primary-300 mt-4 max-w-3xl">
              Quick preview, residential live preview, and utility calculators remain free.
              Paid access is limited to official calculations, PDF export, residential verification,
              and submission-ready improvement support.
            </p>
          </div>

          <div className="p-8">
            {checkoutSucceeded && confirmingCheckout && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                Finalizing your purchase. This usually takes a few seconds.
              </div>
            )}

            {checkoutSucceeded && !confirmingCheckout && status?.active && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                Your purchase is active. You can return to the tool now.
              </div>
            )}

            {error && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                {error}
              </div>
            )}

            <div className="mb-6 grid lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-warm-200 bg-white p-5">
                <p className="text-xs font-semibold tracking-widest text-primary-500">FREE</p>
                <h2 className="text-lg font-bold text-primary-900 mt-2">Try before you pay</h2>
                <ul className="mt-3 space-y-2 text-sm text-primary-600">
                  <li>Quick BEI preview</li>
                  <li>Residential live calculation preview</li>
                  <li>Energy and tariff calculators</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-accent-200 bg-accent-50/50 p-5">
                <p className="text-xs font-semibold tracking-widest text-accent-700">PAID</p>
                <h2 className="text-lg font-bold text-primary-900 mt-2">Pay for official output</h2>
                <ul className="mt-3 space-y-2 text-sm text-primary-700">
                  <li>Official BEI workflow and PDF export</li>
                  <li>Residential official verification and PDF export</li>
                  <li>Proposal-ready recommendations and support</li>
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
                          <h2 className="text-2xl font-bold text-primary-900 mt-1">{plan.title}</h2>
                          <p className="text-sm text-primary-500 mt-2">{plan.subtitle}</p>
                        </div>
                        <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-900 text-white">
                          <FaCreditCard className="text-2xl" />
                        </div>
                      </div>

                      <div className="mt-4 text-3xl font-bold text-primary-900">{plan.price}</div>

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
                      <h3 className="text-lg font-bold text-primary-900">AI circle members stay included</h3>
                      <p className="text-sm text-primary-500 mt-2">
                        Existing AI circle members keep access to paid workflow features.
                        This pricing work adds a standalone revenue path for non-members.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-warm-200 rounded-2xl p-6 bg-white">
                <p className="text-sm text-primary-500">Billing status</p>
                {loading || checking ? (
                  <div className="mt-4 flex items-center gap-3 text-primary-500">
                    <FaSpinner className="animate-spin" />
                    <span>Checking...</span>
                  </div>
                ) : isAuthenticated ? (
                  <>
                    <div className="mt-3 text-2xl font-bold text-primary-900">
                      {status?.active ? 'Active' : 'Not active'}
                    </div>
                    <p className="text-sm text-primary-500 mt-2">{statusMessage(status)}</p>

                    {status?.type === 'project_pass' && status?.expires_at && (
                      <p className="mt-3 text-xs text-primary-500">
                        Expiry: {formatExpiry(status.expires_at)}
                      </p>
                    )}

                    <div className="mt-6 flex flex-col gap-3">
                      {status?.active ? (
                        <Link
                          href={redirectTarget}
                          className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
                        >
                          Open tool <FaArrowRight className="text-xs" />
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

                          {!plans.energy_monthly?.available && !plans.project_pass?.available && (
                            <Link
                              href="/contact"
                              className="inline-flex items-center justify-center gap-2 bg-primary-800 hover:bg-primary-900 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
                            >
                              Contact sales
                            </Link>
                          )}
                        </>
                      )}

                      <Link
                        href="/campaign"
                        className="inline-flex items-center justify-center gap-2 border border-primary-300 text-primary-700 hover:bg-warm-50 font-semibold px-5 py-3 rounded-lg transition-colors"
                      >
                        View campaign
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-3 text-2xl font-bold text-primary-900">Log in to purchase</div>
                    <p className="text-sm text-primary-500 mt-2">
                      Create an account first. After checkout you will be sent back to the tool.
                    </p>
                    <div className="mt-6 flex flex-col gap-3">
                      <Link
                        href={`/register?redirect=${encodeURIComponent(`/pricing?redirect=${redirectTarget}`)}`}
                        className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
                      >
                        Create account
                      </Link>
                      <Link
                        href={`/login?redirect=${encodeURIComponent(`/pricing?redirect=${redirectTarget}`)}`}
                        className="inline-flex items-center justify-center gap-2 border border-primary-300 text-primary-700 hover:bg-warm-50 font-semibold px-5 py-3 rounded-lg transition-colors"
                      >
                        Log in
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
