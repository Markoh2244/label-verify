import { BrandMark } from './BrandMark';
import { UsaBanner } from '@/components/UsaBanner';
import { ShieldCheck, Lock, FileCheck } from 'lucide-react';

interface AuthShellProps {
  children: React.ReactNode;
  step?: 1 | 2;
}

export function AuthShell({ children, step }: AuthShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--base-lightest)]">
      <UsaBanner />
      <div className="flex flex-1">
        <aside className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between bg-[var(--primary-darker)] text-white p-10 xl:p-14 border-r-[0.5rem] border-[var(--gold)]">
          <BrandMark subtitle="Secure Agent Portal" size="lg" variant="light" />

          <div className="space-y-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[var(--gold)]">
                TTB Compliance Division
              </p>
              <h1 className="mt-3 text-3xl xl:text-4xl font-bold leading-tight">
                Faster label review, fewer manual checks
              </h1>
              <p className="mt-4 text-base leading-relaxed text-white/85 max-w-md">
                AI-assisted verification helps agents match label artwork to COLA application data in
                seconds—not minutes.
              </p>
            </div>

            <ul className="space-y-4">
              <AuthFeature icon={ShieldCheck} text="Aligned with Treasury security practices (prototype)" />
              <AuthFeature icon={FileCheck} text="Field-by-field comparison with audit trail" />
              <AuthFeature icon={Lock} text="Multi-factor authentication for agent access" />
            </ul>
          </div>

          <div className="space-y-4">
            {step && (
              <div className="flex gap-2">
                <StepDot active={step >= 1} label="Sign in" />
                <div className="flex-1 h-px self-center bg-white/20" />
                <StepDot active={step >= 2} label="Verify identity" />
              </div>
            )}
            <p className="text-xs text-white/55">
              Demonstration environment for the Alcohol and Tobacco Tax and Trade Bureau (TTB).
              No real credentials are required.
            </p>
          </div>
        </aside>

        <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8">
          <div className="mb-8 lg:hidden">
            <BrandMark />
          </div>
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}

function AuthFeature({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  text: string;
}) {
  return (
    <li className="flex items-start gap-3 text-sm text-white/90">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold)]" strokeWidth={1.75} />
      {text}
    </li>
  );
}

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2.5 w-2.5 rounded-sm ${active ? 'bg-[var(--gold)]' : 'bg-white/30'}`} />
      <span className={`text-xs font-bold ${active ? 'text-white' : 'text-white/50'}`}>
        {label}
      </span>
    </div>
  );
}
