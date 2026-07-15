import { ExtractedLabelData } from '@/lib/types';
import { extractWithTesseract } from '@/lib/extract-tesseract';
import { extractWithOpenAI } from '@/lib/extract-openai';

export type ExtractionEngine = 'tesseract' | 'openai';

export interface ExtractionResult {
  data: ExtractedLabelData;
  engine: ExtractionEngine;
}

/**
 * Default: Tesseract.js (free, no API key).
 *
 * Optional OpenAI path when OPENAI_API_KEY is set:
 * - VERIFICATION_ENGINE=tesseract (default) — always OCR
 * - VERIFICATION_ENGINE=openai — force GPT-4o
 * - VERIFICATION_ENGINE=auto — OCR first; if confidence is low, fall back to OpenAI
 */
export async function extractLabelData(imageBase64: string): Promise<ExtractionResult> {
  const mode = (process.env.VERIFICATION_ENGINE || 'tesseract').toLowerCase();
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

  if (mode === 'openai') {
    if (!hasOpenAI) {
      throw new Error(
        'VERIFICATION_ENGINE=openai requires OPENAI_API_KEY. Use tesseract (default) instead.'
      );
    }
    const data = await extractWithOpenAI(imageBase64);
    return { data, engine: 'openai' };
  }

  // Default and auto: run Tesseract first
  const ocrData = await extractWithTesseract(imageBase64);
  const confidence = ocrData.confidence ?? 0;
  const missingCore =
    !ocrData.brandName && !ocrData.alcoholContent && !ocrData.governmentWarning;

  if (
    mode === 'auto' &&
    hasOpenAI &&
    (confidence < 0.55 || missingCore)
  ) {
    try {
      const data = await extractWithOpenAI(imageBase64);
      return { data, engine: 'openai' };
    } catch (error) {
      console.warn('OpenAI fallback failed, returning OCR result:', error);
    }
  }

  return { data: ocrData, engine: 'tesseract' };
}
