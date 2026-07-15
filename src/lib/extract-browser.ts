'use client';

import Tesseract from 'tesseract.js';
import { ExtractedLabelData } from '@/lib/types';
import { parseOcrText } from '@/lib/ocr-parse';

async function imageSourceToPngDataUrl(source: File | string): Promise<string> {
  const objectUrl = source instanceof File ? URL.createObjectURL(source) : null;
  const src = objectUrl ?? (typeof source === 'string' ? source : '');

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image decode failed'));
      img.src = src;
    });

    const maxWidth = 1800;
    const scale = image.naturalWidth > maxWidth ? maxWidth / image.naturalWidth : 1;
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context unavailable');
    }

    // White background improves OCR reliability for transparent SVG/PNG labels.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL('image/png');
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Run OCR in the browser. Used on Vercel because serverless functions
 * time out before server-side Tesseract can finish (Hobby limit ~10s).
 */
export async function extractLabelInBrowser(
  source: File | string,
  onProgress?: (status: string, progress: number) => void
): Promise<ExtractedLabelData> {
  let ocrSource: File | string = source;
  try {
    // Tesseract browser build can fail on raw SVGs; normalize everything to PNG.
    ocrSource = await imageSourceToPngDataUrl(source);
  } catch {
    // Fall back to original source if conversion fails.
    ocrSource = source;
  }

  const result = await Tesseract.recognize(ocrSource, 'eng', {
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
