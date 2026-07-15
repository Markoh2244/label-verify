'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { OtpInput } from '@/components/auth/OtpInput';
import { DEFAULT_DEMO_USER, isDemoAuthenticated, setDemoSession } from '@/lib/demo-auth';
import { ArrowRight, Info, Smartphone } from 'lucide-react';

export default function Verify2FAPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('agent@ttb.gov');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isDemoAuthenticated()) {
      router.replace('/dashboard');
      return;
    }
    const pending = sessionStorage.getItem('ttb-demo-pending-email');
    if (!pending) {
      router.replace('/');
      return;
    }
    setEmail(pending);
  }, [router]);

  const completeSignIn = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setDemoSession({
        ...DEFAULT_DEMO_USER,
        email: email || DEFAULT_DEMO_USER.email,
      });
      sessionStorage.removeItem('ttb-demo-pending-email');
      router.push('/dashboard');
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeSignIn();
  };

  return (
    <AuthShell step={2}>
      <div className="card overflow-hidden">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[var(--primary-lightest)] text-[var(--primary)]">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--ink)]">Two-factor authentication</h2>
              <p className="mt-0.5 text-sm text-[var(--base-dark)]">Verify your identity to continue</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <p className="text-sm text-[var(--base-dark)]">
            Enter the 6-digit code from your authenticator app for{' '}
            <span className="font-bold text-[var(--ink)]">{email}</span>
          </p>

          <div className="usa-alert usa-alert--info">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--info-dark)]" />
            <p className="text-sm leading-relaxed text-[var(--ink)]">
              <strong>Demo mode:</strong> Any code works, or skip verification entirely using the
              button below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <OtpInput value={code} onChange={setCode} disabled={isVerifying} />

            <button type="submit" disabled={isVerifying} className="btn-primary w-full">
              {isVerifying ? (
                <>
                  <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white spinner" />
                  Verifying…
                </>
              ) : (
                <>
                  Verify and sign in
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={completeSignIn}
            disabled={isVerifying}
            className="btn-secondary w-full justify-center py-3"
          >
            Skip verification (demo)
          </button>

          <p className="text-center text-sm text-[var(--base-dark)]">
            <Link href="/" className="font-bold text-[var(--primary)] underline">
              ← Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
