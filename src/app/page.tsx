'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/AuthShell';
import { isDemoAuthenticated } from '@/lib/demo-auth';
import { ArrowRight, Info } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isDemoAuthenticated()) {
      router.replace('/dashboard');
    }
  }, [router]);

  const proceed = () => {
    sessionStorage.setItem('ttb-demo-pending-email', email || 'agent@ttb.gov');
    router.push('/verify');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    proceed();
  };

  return (
    <AuthShell step={1}>
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="text-xl font-bold text-[var(--ink)]">Agent sign in</h2>
          <p className="mt-1 text-sm text-[var(--base-dark)]">
            Sign in to the Alcohol and Tobacco Tax and Trade Bureau label verification workspace
          </p>
        </div>

        <div className="space-y-6 p-6">
          <div className="usa-alert usa-alert--info">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--info-dark)]" />
            <p className="text-sm leading-relaxed text-[var(--ink)]">
              <strong>Demo mode:</strong> No real credentials are required. Leave fields blank or
              enter any values, then continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-bold text-[var(--ink)]">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@ttb.gov"
                className="input-field"
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-bold text-[var(--ink)]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Sign in
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-[var(--base)]">or</span>
            </div>
          </div>

          <button type="button" onClick={proceed} className="btn-secondary w-full justify-center py-3">
            Continue without credentials
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
