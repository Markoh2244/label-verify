import Link from 'next/link';

interface BrandMarkProps {
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  href?: string;
}

/**
 * TTB-style agency lockup, matching ttb.gov hierarchy:
 * 1) Alcohol and Tobacco Tax and Trade Bureau (agency)
 * 2) Product / tool name
 * 3) Parent: U.S. Department of the Treasury
 */
export function BrandMark({
  subtitle,
  size = 'md',
  variant = 'dark',
  href = '/',
}: BrandMarkProps) {
  const sizes = {
    sm: {
      seal: 'h-10 w-10',
      agency: 'text-[11px] leading-tight',
      title: 'text-sm',
      parent: 'text-[10px]',
    },
    md: {
      seal: 'h-12 w-12',
      agency: 'text-xs leading-snug sm:text-sm',
      title: 'text-base',
      parent: 'text-[11px]',
    },
    lg: {
      seal: 'h-14 w-14',
      agency: 'text-sm leading-snug sm:text-base',
      title: 'text-lg',
      parent: 'text-xs',
    },
  };
  const s = sizes[size];
  const agencyClass = variant === 'light' ? 'text-white' : 'text-[var(--ink)]';
  const titleClass = variant === 'light' ? 'text-white/90' : 'text-[var(--primary)]';
  const parentClass = variant === 'light' ? 'text-white/70' : 'text-[var(--base-dark)]';

  return (
    <Link href={href} className="inline-flex items-center gap-3 group min-w-0">
      <TtbSeal className={`${s.seal} shrink-0`} light={variant === 'light'} />
      <div className="min-w-0">
        <p className={`${s.agency} font-bold ${agencyClass}`}>
          Alcohol and Tobacco Tax and Trade Bureau
        </p>
        <p className={`${s.title} font-bold leading-tight ${titleClass}`}>
          {typeof subtitle === 'string' ? subtitle : 'Label Verify'}
        </p>
        <p className={`${s.parent} ${parentClass}`}>
          U.S. Department of the Treasury
        </p>
      </div>
    </Link>
  );
}

/** Circular TTB lettermark inspired by bureau identity on ttb.gov */
function TtbSeal({ className, light }: { className?: string; light?: boolean }) {
  const fill = light ? '#ffffff' : '#005ea2';
  const text = light ? '#162e51' : '#ffffff';
  const ring = light ? '#ffffff' : '#1a4480';

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="31" fill={fill} />
      <circle cx="32" cy="32" r="27" fill="none" stroke={ring} strokeWidth="1.5" opacity="0.35" />
      <text
        x="32"
        y="38"
        textAnchor="middle"
        fill={text}
        fontSize="18"
        fontWeight="700"
        fontFamily="Public Sans, Arial, sans-serif"
        letterSpacing="1"
      >
        TTB
      </text>
    </svg>
  );
}
