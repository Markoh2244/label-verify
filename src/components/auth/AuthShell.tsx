import { BrandMark } from './BrandMark';
import { ShieldCheck, Lock, FileCheck } from 'lucide-react';

interface AuthShellProps {
  children: React.ReactNode;
  step?: 1 | 2;
}

export function AuthShell({ children, step }: AuthShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--base-lightest)]">
      <div className="site-header__bar" />
      <div className="flex flex-1">
        <aside className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between bg-[var(--primary-darker)] text-white p-10 xl:p-14">
          <BrandMark subtitle="Label Verify · Secure Agent Portal" size="lg" variant="light" />

          <div className="space-y-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[var(--primary-light)]">
                Label Compliance
              </p>
              <h1 className="mt-3 text-3xl xl:text-4xl font-bold leading-tight">
                Faster COLA label review, fewer manual checks
              </h1>
              <p className="mt-4 text-base leading-relaxed text-white/85 max-w-md">
                Built for Alcohol and Tobacco Tax and Trade Bureau (TTB) agents verifying that label
                artwork matches Certificate of Label Approval (COLA) application data.
              </p>
            </div>

            <ul className="space-y-4">
              <AuthFeature icon={ShieldCheck} text="Prototype aligned with federal web design standards" />
              <AuthFeature icon={FileCheck} text="Field-by-field comparison with clear pass / fail results" />
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
              Demonstration only · Not an official TTB.gov system · Not connected to COLA
            </p>
          </div>
        </aside>

        <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8 bg-white">
          <div className="mb-8 lg:hidden">
            <BrandMark subtitle="Label Verify" />
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
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary-light)]" strokeWidth={1.75} />
      {text}
    </li>
  );
}

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-2.5 w-2.5 rounded-sm ${active ? 'bg-[var(--primary-light)]' : 'bg-white/30'}`}
      />
      <span className={`text-xs font-bold ${active ? 'text-white' : 'text-white/50'}`}>
        {label}
      </span>
    </div>
  );
}
