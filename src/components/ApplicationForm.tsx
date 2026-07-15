'use client';

import { ApplicationData, GOVERNMENT_WARNING_TEXT } from '@/lib/types';
import { AlertCircle, ClipboardList } from 'lucide-react';

interface ApplicationFormProps {
  data: ApplicationData;
  onChange: (data: ApplicationData) => void;
  disabled?: boolean;
}

export function ApplicationForm({ data, onChange, disabled }: ApplicationFormProps) {
  const updateField = (field: keyof ApplicationData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const fillSampleData = () => {
    onChange({
      brandName: 'OLD TOM DISTILLERY',
      classType: 'Kentucky Straight Bourbon Whiskey',
      alcoholContent: '45% Alc./Vol. (90 Proof)',
      netContents: '750 mL',
      producerName: 'Old Tom Distillery Co.',
      producerAddress: 'Louisville, Kentucky 40202',
      countryOfOrigin: 'USA',
      governmentWarning: GOVERNMENT_WARNING_TEXT,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <ClipboardList className="h-4 w-4 text-slate-400" />
          Enter values exactly as submitted on the COLA application
        </div>
        <button
          type="button"
          onClick={fillSampleData}
          disabled={disabled}
          className="btn-secondary !py-2 !px-3 !text-sm disabled:opacity-50"
        >
          Load sample application
        </button>
      </div>

      <fieldset disabled={disabled} className="space-y-6 disabled:opacity-60">
        <FormSection title="Product Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Brand Name"
              value={data.brandName}
              onChange={(v) => updateField('brandName', v)}
              placeholder="OLD TOM DISTILLERY"
              required
            />
            <FormField
              label="Class / Type"
              value={data.classType}
              onChange={(v) => updateField('classType', v)}
              placeholder="Kentucky Straight Bourbon Whiskey"
              required
            />
            <FormField
              label="Alcohol Content"
              value={data.alcoholContent}
              onChange={(v) => updateField('alcoholContent', v)}
              placeholder="45% Alc./Vol. (90 Proof)"
              required
            />
            <FormField
              label="Net Contents"
              value={data.netContents}
              onChange={(v) => updateField('netContents', v)}
              placeholder="750 mL"
              required
            />
          </div>
        </FormSection>

        <FormSection title="Producer Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Producer / Bottler Name"
              value={data.producerName}
              onChange={(v) => updateField('producerName', v)}
              placeholder="Old Tom Distillery Co."
              required
            />
            <FormField
              label="Producer / Bottler Address"
              value={data.producerAddress}
              onChange={(v) => updateField('producerAddress', v)}
              placeholder="Louisville, Kentucky 40202"
              required
            />
            <FormField
              label="Country of Origin"
              value={data.countryOfOrigin}
              onChange={(v) => updateField('countryOfOrigin', v)}
              placeholder="USA (required for imports)"
              hint="Optional for domestic products"
            />
          </div>
        </FormSection>

        <FormSection title="Mandatory Warning Statement">
          <div className="usa-alert usa-alert--warning">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold-darker)]" />
            <p className="text-sm leading-relaxed text-[var(--ink)]">
              The label must display the exact TTB warning text. &quot;GOVERNMENT WARNING:&quot; must appear in all
              capitals. Minor formatting differences elsewhere are flagged for agent review.
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              Government Warning
              <span className="text-red-500">*</span>
              <span className="badge badge-review normal-case tracking-normal">Exact match</span>
            </label>
            <textarea
              value={data.governmentWarning}
              onChange={(e) => updateField('governmentWarning', e.target.value)}
              rows={5}
              className="input-field resize-none font-mono text-xs leading-relaxed"
            />
            <button
              type="button"
              onClick={() => updateField('governmentWarning', GOVERNMENT_WARNING_TEXT)}
              className="text-xs font-medium text-blue-700 hover:text-blue-800"
            >
              Reset to standard TTB warning text
            </button>
          </div>
        </FormSection>
      </fieldset>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h4>
      {children}
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field"
      />
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
