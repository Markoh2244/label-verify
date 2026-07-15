'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * USWDS-style official government website banner.
 * Pattern used across Treasury and other federal properties.
 */
export function UsaBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      className="border-b border-[var(--border)] bg-[var(--base-lightest)] text-[0.81rem] text-[var(--ink)]"
      aria-label="Official website of the United States government"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 py-2">
          <UsaFlag className="h-3 w-4 shrink-0" />
          <p className="m-0 font-normal">
            An official website of the United States government
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1 font-bold text-[var(--primary)] underline-offset-2 hover:underline"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          >
            Here&apos;s how you know
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {expanded && (
          <div className="grid gap-4 border-t border-[var(--border)] py-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <DotGovIcon className="mt-0.5 h-10 w-10 shrink-0" />
              <div>
                <p className="m-0 font-bold">Official websites use .gov</p>
                <p className="mt-1 m-0 text-[var(--base-dark)]">
                  A <strong>.gov</strong> website belongs to an official government organization in
                  the United States.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <HttpsIcon className="mt-0.5 h-10 w-10 shrink-0" />
              <div>
                <p className="m-0 font-bold">Secure .gov websites use HTTPS</p>
                <p className="mt-1 m-0 text-[var(--base-dark)]">
                  A <strong>lock</strong> or <strong>https://</strong> means you&apos;ve safely
                  connected to the .gov website. Share sensitive information only on official,
                  secure websites.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function UsaFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 11" aria-hidden="true">
      <rect width="16" height="11" fill="#B22234" />
      <path
        fill="#fff"
        d="M0 1.4h16M0 3.7h16M0 6h16M0 8.3h16"
        stroke="#fff"
        strokeWidth="1.1"
      />
      <rect width="7" height="6" fill="#3C3B6E" />
    </svg>
  );
}

function DotGovIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 54 54" aria-hidden="true">
      <circle cx="27" cy="27" r="26" fill="#005ea2" />
      <text
        x="27"
        y="32"
        textAnchor="middle"
        fill="#fff"
        fontSize="14"
        fontWeight="700"
        fontFamily="Public Sans, sans-serif"
      >
        .gov
      </text>
    </svg>
  );
}

function HttpsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 54 54" aria-hidden="true">
      <circle cx="27" cy="27" r="26" fill="#005ea2" />
      <rect x="18" y="25" width="18" height="14" rx="2" fill="#fff" />
      <path
        d="M22 25v-4a5 5 0 0 1 10 0v4"
        fill="none"
        stroke="#fff"
        strokeWidth="2.5"
      />
    </svg>
  );
}
