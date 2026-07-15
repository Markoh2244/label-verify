import { NextRequest, NextResponse } from 'next/server';
import {
  ApplicationData,
  ExtractedLabelData,
  VerificationResult,
} from '@/lib/types';
import { compareFields, determineOverallStatus } from '@/lib/comparison';
import { parseOcrText } from '@/lib/ocr-parse';
import { extractWithOpenAI } from '@/lib/extract-openai';

export const runtime = 'nodejs';
/** Hobby plan caps lower; keep for Pro. Client OCR is the default path. */
export const maxDuration = 60;

type VerifyBody = {
  image?: string;
  imageUrl?: string;
  extractedData?: ExtractedLabelData;
  rawText?: string;
  applicationData: ApplicationData;
  fileName: string;
  id?: string;
};

async function resolveExtractedData(body: VerifyBody): Promise<{
  data: ExtractedLabelData;
  engine: 'tesseract' | 'openai';
}> {
  const mode = (process.env.VERIFICATION_ENGINE || 'tesseract').toLowerCase();
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const image = body.image;

  if (mode === 'openai') {
    if (!hasOpenAI) {
      throw new Error(
        'VERIFICATION_ENGINE=openai requires OPENAI_API_KEY on the server.'
      );
    }
    if (!image) {
      throw new Error('OpenAI extraction requires an image payload.');
    }
    const data = await extractWithOpenAI(image);
    return { data, engine: 'openai' };
  }

  // Prefer client-provided OCR (avoids Vercel 504 from server-side Tesseract)
  let data: ExtractedLabelData | null = null;
  if (body.extractedData) {
    data = body.extractedData;
  } else if (body.rawText) {
    data = parseOcrText(body.rawText);
  }

  if (
    mode === 'auto' &&
    hasOpenAI &&
    image &&
    (!data ||
      (data.confidence ?? 0) < 0.55 ||
      (!data.brandName && !data.alcoholContent && !data.governmentWarning))
  ) {
    try {
      const openaiData = await extractWithOpenAI(image);
      return { data: openaiData, engine: 'openai' };
    } catch (error) {
      console.warn('OpenAI fallback failed:', error);
      if (data) return { data, engine: 'tesseract' };
      throw error;
    }
  }

  if (data) {
    return { data, engine: 'tesseract' };
  }

  // Last resort: server OpenAI if key exists (never run Tesseract on Vercel — timeouts)
  if (hasOpenAI && image) {
    const openaiData = await extractWithOpenAI(image);
    return { data: openaiData, engine: 'openai' };
  }

  throw new Error(
    'No extracted label data received. On Vercel, OCR runs in the browser—please retry. For GPT-4o, set OPENAI_API_KEY.'
  );
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = (await request.json()) as VerifyBody;
    const { applicationData, fileName, id, image, imageUrl } = body;

    if (!applicationData) {
      return NextResponse.json({ error: 'No application data provided' }, { status: 400 });
    }

    if (!fileName) {
      return NextResponse.json({ error: 'No file name provided' }, { status: 400 });
    }

    const { data: extractedData, engine } = await resolveExtractedData(body);
    const comparisons = compareFields(applicationData, extractedData);
    const overallStatus = determineOverallStatus(comparisons);
    const processingTime = Date.now() - startTime;

    const result: VerificationResult = {
      id: id || crypto.randomUUID(),
      fileName,
      imageUrl: imageUrl || image || '',
      extractedData,
      comparisons,
      overallStatus,
      processingTime,
      timestamp: new Date(),
      extractionEngine: engine,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Verification failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
