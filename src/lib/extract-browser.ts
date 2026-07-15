'use client';

import Tesseract from 'tesseract.js';
import { ExtractedLabelData } from '@/lib/types';
import { parseOcrText } from '@/lib/ocr-parse';

/**
 * Run OCR in the browser. Used on Vercel because serverless functions
 * time out before server-side Tesseract can finish (Hobby limit ~10s).
 */
export async function extractLabelInBrowser(
  source: File | string,
  onProgress?: (status: string, progress: number) => void
): Promise<ExtractedLabelData> {
  const result = await Tesseract.recognize(source, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        onProgress?.(m.status, m.progress);
      }
    },
  });

  const rawText = result.data.text || '';
  const parsed = parseOcrText(rawText);
  const ocrConfidence = (result.data.confidence || 0) / 100;
  parsed.confidence = Number(
    (((parsed.confidence || 0.5) * 0.6 + ocrConfidence * 0.4)).toFixed(2)
  );
  parsed.rawText = rawText.slice(0, 4000);
  return parsed;
}
