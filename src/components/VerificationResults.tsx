'use client';

import { VerificationResult, FieldComparison } from '@/lib/types';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  FileSearch,
} from 'lucide-react';
import { useState } from 'react';

interface VerificationResultsProps {
  results: VerificationResult[];
  isProcessing: boolean;
  currentIndex?: number;
  totalFiles?: number;
}

export function VerificationResults({
  results,
  isProcessing,
  currentIndex = 0,
  totalFiles = 0,
}: VerificationResultsProps) {
  if (results.length === 0 && !isProcessing) {
    return null;
  }

  const passCount = results.filter((r) => r.overallStatus === 'pass').length;
  const failCount = results.filter((r) => r.overallStatus === 'fail').length;
  const reviewCount = results.filter((r) => r.overallStatus === 'review').length;
  const avgTime =
    results.length > 0
      ? (results.reduce((sum, r) => sum + r.processingTime, 0) / results.length / 1000).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--ink)]">Verification Report</h3>
          <p className="mt-1 text-sm text-[var(--base-dark)]">
            Field-by-field comparison of application data against extracted label text
          </p>
        </div>
        {results.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <SummaryPill icon={CheckCircle2} count={passCount} label="Pass" tone="success" />
            <SummaryPill icon={AlertTriangle} count={reviewCount} label="Review" tone="warning" />
            <SummaryPill icon={XCircle} count={failCount} label="Fail" tone="danger" />
          </div>
        )}
      </div>

      {results.length > 0 && avgTime && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Labels processed" value={String(results.length)} />
          <StatCard label="Passed" value={String(passCount)} accent="success" />
          <StatCard label="Needs review" value={String(reviewCount)} accent="warning" />
          <StatCard label="Avg. processing" value={`${avgTime}s`} />
        </div>
      )}

      {isProcessing && <ProcessingIndicator current={currentIndex + 1} total={totalFiles} />}

      <div className="space-y-3">
        {results.map((result, index) => (
          <ResultCard key={result.id} result={result} index={index} />
        ))}
      </div>
    </div>
  );
}

function SummaryPill({
  icon: Icon,
  count,
  label,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  label: string;
  tone: 'success' | 'warning' | 'danger';
}) {
  const styles = {
    success: 'bg-[var(--success-lighter)] text-[var(--success-dark)] border-[var(--success)]',
    warning: 'bg-[var(--warning-lighter)] text-[var(--gold-darker)] border-[var(--warning-dark)]',
    danger: 'bg-[var(--error-lighter)] text-[var(--error-dark)] border-[var(--error)]',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded border px-3 py-1 text-sm font-bold ${styles[tone]}`}>
      <Icon className="h-3.5 w-3.5" />
      {count} {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'success' | 'warning';
}) {
  const valueColor =
    accent === 'success'
      ? 'text-[var(--success-dark)]'
      : accent === 'warning'
        ? 'text-[var(--gold-darker)]'
        : 'text-[var(--ink)]';

  return (
    <div className="border border-[var(--border)] bg-[var(--base-lightest)] px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--base-dark)]">{label}</p>
      <p className={`mt-1 text-xl font-bold tabular-nums ${valueColor}`}>{value}</p>
    </div>
  );
}

function ProcessingIndicator({ current, total }: { current: number; total: number }) {
  const progress = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div className="usa-alert usa-alert--info">
      <div className="mt-0.5 h-8 w-8 shrink-0 rounded-full border-[3px] border-[var(--primary-light)] border-t-[var(--primary)] spinner" />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-[var(--ink)]">
          Analyzing label {current} of {total}
        </p>
        <p className="mt-1 text-sm text-[var(--base-dark)]">
          Extracting text and comparing against application fields…
        </p>
        <div className="mt-4 h-2 overflow-hidden bg-[var(--primary-lightest)]">
          <div
            className="h-full bg-[var(--primary)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--base)]">Target: under 5 seconds per label</p>
      </div>
    </div>
  );
}

function ResultCard({ result, index }: { result: VerificationResult; index: number }) {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const [showImage, setShowImage] = useState(false);

  const statusConfig = {
    pass: {
      icon: CheckCircle2,
      container: 'border-[var(--success)] bg-[var(--success-lighter)]',
      iconColor: 'text-[var(--success-dark)]',
      badge: 'badge-pass',
      label: 'Pass',
    },
    fail: {
      icon: XCircle,
      container: 'border-[var(--error)] bg-[var(--error-lighter)]',
      iconColor: 'text-[var(--error-dark)]',
      badge: 'badge-fail',
      label: 'Fail',
    },
    review: {
      icon: AlertTriangle,
      container: 'border-[var(--warning-dark)] bg-[var(--warning-lighter)]',
      iconColor: 'text-[var(--gold-darker)]',
      badge: 'badge-review',
      label: 'Review',
    },
  };

  const config = statusConfig[result.overallStatus];
  const StatusIcon = config.icon;
  const matchCount = result.comparisons.filter((c) => c.match).length;
  const totalFields = result.comparisons.length;
  const hasError = result.comparisons.length === 0;

  return (
    <article className={`overflow-hidden border-2 ${config.container}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/50"
      >
        <div className="flex min-w-0 items-center gap-4">
          <StatusIcon className={`h-7 w-7 shrink-0 ${config.iconColor}`} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-bold text-[var(--ink)]">{result.fileName}</span>
              <span className={`badge ${config.badge}`}>{config.label}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--base-dark)]">
              {hasError ? (
                <span className="text-[var(--error-dark)]">Verification could not be completed</span>
              ) : (
                <span>
                  {matchCount} of {totalFields} fields match
                </span>
              )}
              {result.processingTime > 0 && (
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Clock className="h-3.5 w-3.5" />
                  {(result.processingTime / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-[var(--base)]" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-[var(--base)]" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-4 border-t border-[var(--border)] bg-white px-5 py-4">
          {hasError ? (
            <div className="usa-alert usa-alert--error text-sm">
              <FileSearch className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Unable to process this label. Check that your API key is configured and the image is readable.
              </p>
            </div>
          ) : (
            <>
              {result.imageUrl && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowImage(!showImage)}
                    className="btn-secondary !py-2 !px-3 !text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    {showImage ? 'Hide' : 'View'} label image
                  </button>
                  {showImage && (
                    <div className="mt-3 border border-[var(--border)] bg-white p-4">
                      <img
                        src={result.imageUrl}
                        alt={result.fileName}
                        className="mx-auto max-h-96 max-w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="overflow-hidden border border-[var(--border)] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--base-lightest)]">
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--base-dark)]">
                          Field
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--base-dark)]">
                          Application
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--base-dark)]">
                          Label
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-[var(--base-dark)]">
                          Result
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {result.comparisons.map((comparison) => (
                        <ComparisonRow key={comparison.field} comparison={comparison} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
}

function ComparisonRow({ comparison }: { comparison: FieldComparison }) {
  const matchConfig = {
    exact: { icon: CheckCircle2, color: 'text-[var(--success-dark)]', bg: 'bg-[var(--success-lighter)]', label: 'Match' },
    fuzzy: { icon: AlertTriangle, color: 'text-[var(--gold-darker)]', bg: 'bg-[var(--warning-lighter)]', label: 'Review' },
    missing: { icon: XCircle, color: 'text-[var(--error-dark)]', bg: 'bg-[var(--error-lighter)]', label: 'Missing' },
    mismatch: { icon: XCircle, color: 'text-[var(--error-dark)]', bg: 'bg-[var(--error-lighter)]', label: 'Mismatch' },
  };

  const config = matchConfig[comparison.matchType];
  const Icon = config.icon;

  return (
    <tr className={config.bg}>
      <td className="px-4 py-3 align-top">
        <span className="font-bold text-[var(--ink)]">{comparison.label}</span>
        {comparison.notes && <p className="mt-1 text-xs text-[var(--base-dark)]">{comparison.notes}</p>}
      </td>
      <td className="max-w-[200px] px-4 py-3 align-top text-[var(--base-darker)]">{comparison.applicationValue || '—'}</td>
      <td className="max-w-[200px] px-4 py-3 align-top text-[var(--base-darker)]">{comparison.extractedValue || '—'}</td>
      <td className="px-4 py-3 align-top">
        <div className={`flex items-center justify-center gap-1.5 font-medium ${config.color}`}>
          <Icon className="h-4 w-4" />
          <span className="text-xs">{config.label}</span>
        </div>
      </td>
    </tr>
  );
}
