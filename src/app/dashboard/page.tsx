'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LabelUpload, ApplicationForm, VerificationResults } from '@/components';
import { ApplicationData, VerificationResult, GOVERNMENT_WARNING_TEXT, LABEL_FIELDS } from '@/lib/types';
import { clearDemoSession, getDemoUser, isDemoAuthenticated } from '@/lib/demo-auth';
import { BrandMark } from '@/components/auth/BrandMark';
import {
  AlertCircle,
  ArrowRight,
  RotateCcw,
  LogOut,
  User,
} from 'lucide-react';

const initialApplicationData: ApplicationData = {
  brandName: '',
  classType: '',
  alcoholContent: '',
  netContents: '',
  producerName: '',
  producerAddress: '',
  countryOfOrigin: '',
  governmentWarning: GOVERNMENT_WARNING_TEXT,
};

const REQUIRED_FIELDS: (keyof ApplicationData)[] = [
  'brandName',
  'classType',
  'alcoholContent',
  'netContents',
  'producerName',
  'producerAddress',
  'governmentWarning',
];

function fieldLabel(field: keyof ApplicationData): string {
  return LABEL_FIELDS.find((f) => f.name === field)?.label ?? field;
}

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userName, setUserName] = useState('Agent');
  const [files, setFiles] = useState<File[]>([]);
  const [applicationData, setApplicationData] = useState<ApplicationData>(initialApplicationData);
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isDemoAuthenticated()) {
      router.replace('/');
      return;
    }
    const user = getDemoUser();
    if (user?.name) setUserName(user.name);
    setReady(true);
  }, [router]);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const missingFields = REQUIRED_FIELDS.filter((field) => !applicationData[field]?.trim());
  const isFormComplete = files.length > 0 && missingFields.length === 0;

  const validateForm = (): boolean => {
    if (files.length === 0) {
      setError('Please upload at least one label image.');
      return false;
    }
    if (missingFields.length > 0) {
      setError(`Please complete required field: ${fieldLabel(missingFields[0])}`);
      return false;
    }
    return true;
  };

  const handleVerify = async () => {
    setError(null);
    if (!validateForm()) return;

    setIsProcessing(true);
    setResults([]);
    setCurrentIndex(0);

    const { extractLabelInBrowser } = await import('@/lib/extract-browser');
    const newResults: VerificationResult[] = [];

    for (let i = 0; i < files.length; i++) {
      setCurrentIndex(i);

      try {
        const file = files[i];
        const imageUrl = await fileToBase64(file);

        // OCR in the browser — avoids Vercel serverless 504 timeouts
        const extractedData = await extractLabelInBrowser(file);

        // Only send the image when the server may run OpenAI (large payloads can fail on Vercel)
        const serverVision =
          process.env.NEXT_PUBLIC_VERIFICATION_ENGINE === 'openai' ||
          process.env.NEXT_PUBLIC_VERIFICATION_ENGINE === 'auto';

        const response = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            extractedData,
            imageUrl,
            ...(serverVision ? { image: imageUrl } : {}),
            applicationData,
            fileName: file.name,
            id: crypto.randomUUID(),
          }),
        });

        const responseText = await response.text();
        let payload: VerificationResult & { error?: string };
        try {
          payload = JSON.parse(responseText);
        } catch {
          throw new Error(
            response.status === 504
              ? 'Verification timed out on the server. OCR now runs in your browser—redeploy the latest build and try again.'
              : `Verification failed (${response.status}): ${responseText.slice(0, 160) || 'Unknown error'}`
          );
        }

        if (!response.ok) {
          throw new Error(payload.error || 'Verification failed');
        }

        newResults.push(payload);
        setResults([...newResults]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error verifying label:', err);

        newResults.push({
          id: crypto.randomUUID(),
          fileName: files[i].name,
          imageUrl: '',
          extractedData: {
            brandName: null,
            classType: null,
            alcoholContent: null,
            netContents: null,
            producerName: null,
            producerAddress: null,
            countryOfOrigin: null,
            governmentWarning: null,
          },
          comparisons: [],
          overallStatus: 'fail',
          processingTime: 0,
          timestamp: new Date(),
        });
        setResults([...newResults]);
        setError(message);
      }
    }

    setIsProcessing(false);
  };

  const handleReset = () => {
    setFiles([]);
    setResults([]);
    setError(null);
    setApplicationData(initialApplicationData);
  };

  const handleSignOut = () => {
    clearDemoSession();
    router.push('/');
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 rounded-full border-[3px] border-slate-200 border-t-[var(--primary)] spinner" />
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <div className="site-header__bar" />
      <header className="site-header sticky top-0 z-20">
        <div className="mx-auto flex min-h-[4.75rem] max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <BrandMark
            href="/dashboard"
            subtitle="Label Verify · Agent workspace"
            size="md"
            variant="dark"
          />

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 border border-[var(--border)] bg-[var(--base-lightest)] px-3 py-2 sm:flex">
              <User className="h-4 w-4 text-[var(--primary)]" />
              <span className="text-sm font-medium text-[var(--ink)]">{userName}</span>
            </div>

            {(results.length > 0 || files.length > 0) && (
              <button type="button" onClick={handleReset} className="btn-secondary !py-2 !px-3 !text-sm">
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">New verification</span>
              </button>
            )}

            <button type="button" onClick={handleSignOut} className="btn-primary !py-2 !px-3 !text-sm">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 border-b border-[var(--border)] pb-6">
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--primary)]">
            Certificate of Label Approval (COLA) review
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--ink)] sm:text-3xl">
            Verify label against application
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--base-dark)]">
            Upload label artwork and enter COLA application fields to receive an instant comparison
            report—helping TTB agents clear routine matching work faster.
          </p>
        </section>

        {error && (
          <div role="alert" className="usa-alert usa-alert--error mb-6">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--error-dark)]" />
            <div>
              <p className="font-bold text-[var(--ink)]">{error}</p>
              <p className="mt-1 text-sm text-[var(--base-dark)]">Correct the issue above and try again.</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <section className="card">
            <div className="card-header flex items-center gap-3">
              <span className="step-number">1</span>
              <div>
                <h2 className="font-bold text-[var(--ink)]">Upload label artwork</h2>
                <p className="text-sm text-[var(--base-dark)]">Front, back, or composite label images</p>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <LabelUpload files={files} onFilesChange={setFiles} disabled={isProcessing} />
              <p className="mt-4 text-sm text-[var(--base-dark)]">
                Sample labels: download from{' '}
                <a href="/samples/old-tom-distillery.svg" className="font-bold text-[var(--primary)] underline" download>
                  Old Tom (pass)
                </a>
                ,{' '}
                <a href="/samples/old-tom-wrong-abv.svg" className="font-bold text-[var(--primary)] underline" download>
                  wrong ABV
                </a>
                ,{' '}
                <a href="/samples/old-tom-bad-warning.svg" className="font-bold text-[var(--primary)] underline" download>
                  bad warning
                </a>
                ,{' '}
                <a href="/samples/stones-throw-rye.svg" className="font-bold text-[var(--primary)] underline" download>
                  Stone&apos;s Throw
                </a>
                ,{' '}
                <a href="/samples/valley-vineyards-cabernet.svg" className="font-bold text-[var(--primary)] underline" download>
                  wine
                </a>
                ,{' '}
                <a href="/samples/harbor-hop-ipa.svg" className="font-bold text-[var(--primary)] underline" download>
                  beer
                </a>
                ,{' '}
                <a href="/samples/north-star-gin.svg" className="font-bold text-[var(--primary)] underline" download>
                  gin
                </a>
                , or{' '}
                <a href="/samples/casa-del-sol-missing-warning.svg" className="font-bold text-[var(--primary)] underline" download>
                  missing warning
                </a>
                . See{' '}
                <a href="/samples/README.md" className="font-bold text-[var(--primary)] underline" target="_blank" rel="noreferrer">
                  samples/README.md
                </a>{' '}
                for application field values.
              </p>
            </div>
          </section>

          <section className="card">
            <div className="card-header flex items-center gap-3">
              <span className="step-number">2</span>
              <div>
                <h2 className="font-bold text-[var(--ink)]">Enter application data</h2>
                <p className="text-sm text-[var(--base-dark)]">Values from the submitted COLA form</p>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <ApplicationForm
                data={applicationData}
                onChange={setApplicationData}
                disabled={isProcessing}
              />
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleVerify}
            disabled={isProcessing || !isFormComplete}
            className="btn-primary min-w-[240px]"
          >
            {isProcessing ? (
              <>
                <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white spinner" />
                Verifying…
              </>
            ) : (
              <>
                Run verification
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
          {!isFormComplete && !isProcessing && (
            <p className="text-sm text-[var(--base-dark)]">
              {files.length === 0
                ? 'Upload at least one label to continue'
                : `Complete ${missingFields.length} required field${missingFields.length !== 1 ? 's' : ''} to continue`}
            </p>
          )}
        </div>

        {(results.length > 0 || isProcessing) && (
          <section className="card mt-8">
            <div className="card-header flex items-center gap-3">
              <span className="step-number">3</span>
              <div>
                <h2 className="font-bold text-[var(--ink)]">Review results</h2>
                <p className="text-sm text-[var(--base-dark)]">Pass, review, or fail determination per label</p>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <VerificationResults
                results={results}
                isProcessing={isProcessing}
                currentIndex={currentIndex}
                totalFiles={files.length}
                onResultsChange={setResults}
              />
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer mt-auto">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="font-bold">Alcohol and Tobacco Tax and Trade Bureau</p>
            <p className="mt-1 text-sm text-white/75">U.S. Department of the Treasury</p>
            <p className="mt-3 text-sm text-white/65">
              Label Verify · Demonstration prototype · Not connected to COLA
            </p>
          </div>
          <p className="text-xs text-white/55 max-w-xs sm:text-right">
            This is not an official TTB.gov website. For information about label approvals, visit{' '}
            <a href="https://www.ttb.gov/" target="_blank" rel="noreferrer">
              ttb.gov
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
