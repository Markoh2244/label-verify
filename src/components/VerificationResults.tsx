'use client';

import { VerificationResult, FieldComparison } from '@/lib/types';
import {
  applyFieldOverride,
  clearFieldOverride,
  determineOverallStatus,
} from '@/lib/comparison';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  FileSearch,
  UserCheck,
  Undo2,
} from 'lucide-react';
import { useState } from 'react';

interface VerificationResultsProps {
  results: VerificationResult[];
  isProcessing: boolean;
  currentIndex?: number;
  totalFiles?: number;
  onResultsChange?: (results: VerificationResult[]) => void;
}

export function VerificationResults({
  results,
  isProcessing,
  currentIndex = 0,
  totalFiles = 0,
  onResultsChange,
}: VerificationResultsProps) {
  if (results.length === 0 && !isProcessing) {
    return null;
  }

  const passCount = results.filter((r) => r.overallStatus === 'pass').length;
  const failCount = results.filter((r) => r.overallStatus === 'fail').length;
  const reviewCount = results.filter((r) => r.overallStatus === 'review').length;
  const overrideCount = results.reduce(
    (sum, r) => sum + r.comparisons.filter((c) => c.matchType === 'overridden').length,
    0
  );
  const avgTime =
    results.length > 0
      ? (results.reduce((sum, r) => sum + r.processingTime, 0) / results.length / 1000).toFixed(1)
      : null;

  const updateResult = (updated: VerificationResult) => {
    if (!onResultsChange) return;
    onResultsChange(results.map((r) => (r.id === updated.id ? updated : r)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--ink)]">Verification Report</h3>
          <p className="mt-1 text-sm text-[var(--base-dark)]">
            Field-by-field comparison — agents can override fields the system got wrong
          </p>
        </div>
        {results.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <SummaryPill icon={CheckCircle2} count={passCount} label="Pass" tone="success" />
            <SummaryPill icon={AlertTriangle} count={reviewCount} label="Review" tone="warning" />
            <SummaryPill icon={XCircle} count={failCount} label="Fail" tone="danger" />
            {overrideCount > 0 && (
              <SummaryPill icon={UserCheck} count={overrideCount} label="Overrides" tone="info" />
            )}
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
          <ResultCard
            key={result.id}
            result={result}
            index={index}
            onUpdate={onResultsChange ? updateResult : undefined}
          />
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
  tone: 'success' | 'warning' | 'danger' | 'info';
}) {
  const styles = {
    success: 'bg-[var(--success-lighter)] text-[var(--success-dark)] border-[var(--success)]',
    warning: 'bg-[var(--warning-lighter)] text-[var(--gold-darker)] border-[var(--warning-dark)]',
    danger: 'bg-[var(--error-lighter)] text-[var(--error-dark)] border-[var(--error)]',
    info: 'bg-[var(--primary-lightest)] text-[var(--primary-dark)] border-[var(--primary)]',
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

function ResultCard({
  result,
  index,
  onUpdate,
}: {
  result: VerificationResult;
  index: number;
  onUpdate?: (result: VerificationResult) => void;
}) {
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
  const overrideCount = result.comparisons.filter((c) => c.matchType === 'overridden').length;

  const patchComparison = (field: string, next: FieldComparison) => {
    if (!onUpdate) return;
    const comparisons = result.comparisons.map((c) => (c.field === field ? next : c));
    onUpdate({
      ...result,
      comparisons,
      overallStatus: determineOverallStatus(comparisons),
    });
  };

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
              {overrideCount > 0 && (
                <span className="badge bg-[var(--primary-lightest)] text-[var(--primary-dark)] border border-[var(--primary)]">
                  {overrideCount} overridden
                </span>
              )}
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
              {result.extractionEngine && (
                <span className="rounded border border-[var(--border)] bg-white px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide text-[var(--base-dark)]">
                  {result.extractionEngine === 'openai' ? 'GPT-4o' : 'Tesseract OCR'}
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
                Unable to process this label. Check that the image is readable and try again.
              </p>
            </div>
          ) : (
            <>
              {onUpdate && (
                <p className="text-sm text-[var(--base-dark)]">
                  If OCR or AI misread a field, use <strong>Accept match</strong> to override with agent judgment.
                  Overall pass/fail updates automatically.
                </p>
              )}

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
                  <table className="w-full min-w-[720px] text-sm">
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
                        {onUpdate && (
                          <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-[var(--base-dark)]">
                            Agent action
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {result.comparisons.map((comparison) => (
                        <ComparisonRow
                          key={comparison.field}
                          comparison={comparison}
                          onOverride={
                            onUpdate
                              ? (reason) =>
                                  patchComparison(
                                    comparison.field,
                                    applyFieldOverride(comparison, reason)
                                  )
                              : undefined
                          }
                          onClearOverride={
                            onUpdate
                              ? () =>
                                  patchComparison(
                                    comparison.field,
                                    clearFieldOverride(comparison)
                                  )
                              : undefined
                          }
                        />
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

function ComparisonRow({
  comparison,
  onOverride,
  onClearOverride,
}: {
  comparison: FieldComparison;
  onOverride?: (reason?: string) => void;
  onClearOverride?: () => void;
}) {
  const [reason, setReason] = useState('');
  const [showReason, setShowReason] = useState(false);

  const matchConfig = {
    exact: {
      icon: CheckCircle2,
      color: 'text-[var(--success-dark)]',
      bg: 'bg-[var(--success-lighter)]',
      label: 'Match',
    },
    fuzzy: {
      icon: AlertTriangle,
      color: 'text-[var(--gold-darker)]',
      bg: 'bg-[var(--warning-lighter)]',
      label: 'Review',
    },
    missing: {
      icon: XCircle,
      color: 'text-[var(--error-dark)]',
      bg: 'bg-[var(--error-lighter)]',
      label: 'Missing',
    },
    mismatch: {
      icon: XCircle,
      color: 'text-[var(--error-dark)]',
      bg: 'bg-[var(--error-lighter)]',
      label: 'Mismatch',
    },
    overridden: {
      icon: UserCheck,
      color: 'text-[var(--primary-dark)]',
      bg: 'bg-[var(--primary-lightest)]',
      label: 'Overridden',
    },
  };

  const config = matchConfig[comparison.matchType];
  const Icon = config.icon;
  const canOverride =
    onOverride &&
    (comparison.matchType === 'mismatch' ||
      comparison.matchType === 'missing' ||
      comparison.matchType === 'fuzzy');

  return (
    <tr className={config.bg}>
      <td className="px-4 py-3 align-top">
        <span className="font-bold text-[var(--ink)]">{comparison.label}</span>
        {comparison.notes && (
          <p className="mt-1 text-xs text-[var(--base-dark)]">{comparison.notes}</p>
        )}
      </td>
      <td className="max-w-[200px] px-4 py-3 align-top text-[var(--base-darker)]">
        {comparison.applicationValue || '—'}
      </td>
      <td className="max-w-[200px] px-4 py-3 align-top text-[var(--base-darker)]">
        {comparison.extractedValue || '—'}
      </td>
      <td className="px-4 py-3 align-top">
        <div className={`flex items-center justify-center gap-1.5 font-medium ${config.color}`}>
          <Icon className="h-4 w-4" />
          <span className="text-xs">{config.label}</span>
        </div>
      </td>
      {(onOverride || onClearOverride) && (
        <td className="px-4 py-3 align-top">
          <div className="flex flex-col items-center gap-2">
            {canOverride && !showReason && (
              <button
                type="button"
                onClick={() => setShowReason(true)}
                className="inline-flex items-center gap-1 border border-[var(--primary)] bg-white px-2 py-1 text-xs font-bold text-[var(--primary)] hover:bg-[var(--primary-lightest)]"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Accept match
              </button>
            )}

            {canOverride && showReason && (
              <div className="w-full min-w-[180px] space-y-2">
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Optional note (e.g. same brand)"
                  className="input-field !py-1.5 !text-xs"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onOverride(reason);
                      setReason('');
                      setShowReason(false);
                    }}
                    className="btn-primary !px-2 !py-1 !text-xs"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReason(false);
                      setReason('');
                    }}
                    className="btn-secondary !px-2 !py-1 !text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {comparison.matchType === 'overridden' && onClearOverride && (
              <button
                type="button"
                onClick={onClearOverride}
                className="inline-flex items-center gap-1 border border-[var(--base-light)] bg-white px-2 py-1 text-xs font-bold text-[var(--base-dark)] hover:bg-[var(--base-lightest)]"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Undo override
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}
