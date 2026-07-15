import Link from 'next/link';

interface BrandMarkProps {
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  href?: string;
}

export function BrandMark({
  subtitle,
  size = 'md',
  variant = 'dark',
  href = '/',
}: BrandMarkProps) {
  const sizes = {
    sm: { seal: 'h-8 w-8', title: 'text-sm', agency: 'text-[10px]', sub: 'text-[10px]' },
    md: { seal: 'h-10 w-10', title: 'text-base', agency: 'text-xs', sub: 'text-xs' },
    lg: { seal: 'h-12 w-12', title: 'text-lg', agency: 'text-sm', sub: 'text-sm' },
  };
  const s = sizes[size];
  const titleClass = variant === 'light' ? 'text-white' : 'text-[var(--ink)]';
  const agencyClass = variant === 'light' ? 'text-[var(--gold)]' : 'text-[var(--primary)]';
  const subClass = variant === 'light' ? 'text-white/75' : 'text-[var(--base-dark)]';

  return (
    <Link href={href} className="inline-flex items-center gap-3 group">
      <TreasurySeal className={`${s.seal} shrink-0`} light={variant === 'light'} />
      <div className="min-w-0">
        <p className={`${s.agency} font-bold uppercase tracking-wide ${agencyClass}`}>
          U.S. Department of the Treasury
        </p>
        <p className={`${s.title} font-bold leading-tight ${titleClass}`}>
          TTB Label Verify
        </p>
        {(subtitle ?? true) && (
          <p className={`${s.sub} ${subClass}`}>
            {typeof subtitle === 'string'
              ? subtitle
              : 'Alcohol and Tobacco Tax and Trade Bureau'}
          </p>
        )}
      </div>
    </Link>
  );
}

function TreasurySeal({ className, light }: { className?: string; light?: boolean }) {
  const fill = light ? '#ffbe2e' : '#005ea2';
  const stroke = light ? '#ffffff' : '#162e51';

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="30" fill={fill} stroke={stroke} strokeWidth="2" />
      <circle cx="32" cy="32" r="24" fill="none" stroke={stroke} strokeWidth="1.25" opacity="0.7" />
      <path
        d="M32 14 L36 26 H48 L38 34 L42 46 L32 38 L22 46 L26 34 L16 26 H28 Z"
        fill={stroke}
      />
    </svg>
  );
}
