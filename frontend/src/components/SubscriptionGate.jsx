import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaArrowRight, FaCheckCircle, FaLock, FaSpinner } from 'react-icons/fa';

import { useAuth } from '../contexts/FirebaseAuthContext';
import { billingAPI } from '../utils/api';

const BILLING_BYPASS =
  process.env.NEXT_PUBLIC_USE_MOCK === 'true' ||
  process.env.NEXT_PUBLIC_E2E_AUTH === 'true' ||
  process.env.NODE_ENV !== 'production';

export default function SubscriptionGate({
  children,
  toolName = 'this tool',
  redirectPath,
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(!BILLING_BYPASS);
  const [error, setError] = useState('');

  const currentPath = redirectPath || router.asPath || '/';

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

  if (BILLING_BYPASS) {
    return children;
  }

  if (loading || checking) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-warm-200 rounded-2xl shadow-sm p-8 text-center">
        <FaSpinner className="mx-auto text-2xl text-accent-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-primary-800">Checking paid access</h2>
        <p className="text-primary-500 mt-2">We are verifying billing status before opening {toolName}.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(currentPath);
    return (
      <div className="max-w-3xl mx-auto bg-white border border-warm-200 rounded-2xl shadow-sm p-8 text-center">
        <FaLock className="mx-auto text-3xl text-primary-400 mb-4" />
        <h2 className="text-2xl font-bold text-primary-800">Log in to continue</h2>
        <p className="text-primary-500 mt-2">
          {toolName} requires an account before a paid plan can be used.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/login?redirect=${redirect}`}
            className="bg-primary-800 hover:bg-primary-900 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Log in
          </Link>
          <Link
            href={`/register?redirect=${redirect}`}
            className="border border-primary-300 text-primary-700 hover:bg-warm-50 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Create account
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
        <p className="text-primary-300 text-xs font-semibold tracking-widest">PAID ACCESS REQUIRED</p>
        <h2 className="text-2xl font-bold mt-2">{toolName} is available on a paid plan</h2>
        <p className="text-primary-300 mt-2">
          Choose either the monthly subscription or the one-off 30-day pass.
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
                <div className="font-semibold text-primary-800">Official BEI workflow and PDF export</div>
                <div className="text-sm text-primary-500">Generate submission-ready output through the official workflow path.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaCheckCircle className="text-green-600 mt-1" />
              <div>
                <div className="font-semibold text-primary-800">Residential official verification and PDF export</div>
                <div className="text-sm text-primary-500">Compare UA and eta values and produce a verification artifact.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaCheckCircle className="text-green-600 mt-1" />
              <div>
                <div className="font-semibold text-primary-800">Proposal-ready improvement support</div>
                <div className="text-sm text-primary-500">Keep the paid value focused on real submission work, not generic calculators.</div>
              </div>
            </div>
          </div>

          <div className="bg-warm-50 border border-warm-200 rounded-xl p-6">
            <div className="text-sm text-primary-500">Current status</div>
            <div className="text-lg font-bold text-primary-800 mt-1">
              {status?.reason === 'stripe_not_configured' ? 'Stripe not configured' : 'No paid access'}
            </div>
            <p className="text-sm text-primary-500 mt-2">
              {status?.reason === 'stripe_not_configured'
                ? 'Stripe is not configured in this environment yet.'
                : 'Open the pricing page, choose a monthly plan or 30-day pass, and then return here.'}
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <Link
                href={`/pricing?redirect=${encodeURIComponent(currentPath)}`}
                className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
              >
                Open pricing <FaArrowRight className="text-xs" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border border-primary-300 text-primary-700 hover:bg-warm-50 font-semibold px-5 py-3 rounded-lg transition-colors"
              >
                Contact sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
