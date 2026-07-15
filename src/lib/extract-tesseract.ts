import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import { ExtractedLabelData } from '@/lib/types';
import { parseOcrText } from '@/lib/ocr-parse';

function dataUrlToBuffer(imageBase64: string): { buffer: Buffer; mime: string } {
  const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { buffer: Buffer.from(match[2], 'base64'), mime: match[1] };
  }
  return { buffer: Buffer.from(imageBase64, 'base64'), mime: 'image/png' };
}

/**
 * Rasterize / normalize image for OCR.
 * SVGs and photos are converted to high-contrast PNG.
 */
async function prepareImageForOcr(imageBase64: string): Promise<Buffer> {
  const { buffer, mime } = dataUrlToBuffer(imageBase64);

  try {
    let pipeline = sharp(buffer, { density: 300 });

    if (mime.includes('svg')) {
      pipeline = sharp(buffer, { density: 300 });
    }

    return await pipeline
      .rotate() // honor EXIF orientation
      .resize({ width: 1600, height: 2000, fit: 'inside', withoutEnlargement: false })
      .grayscale()
      .normalize()
      .sharpen()
      .png()
      .toBuffer();
  } catch (error) {
    console.warn('Sharp preprocessing failed, using original buffer:', error);
    return buffer;
  }
}

export async function extractWithTesseract(imageBase64: string): Promise<ExtractedLabelData> {
  const prepared = await prepareImageForOcr(imageBase64);

  const result = await Tesseract.recognize(prepared, 'eng', {
    logger: () => {
      /* quiet in production */
    },
  });

  const rawText = result.data.text || '';
  const parsed = parseOcrText(rawText);

  // Blend parser confidence with Tesseract mean confidence (0–100)
  const ocrConfidence = (result.data.confidence || 0) / 100;
  parsed.confidence = Number(
    (((parsed.confidence || 0.5) * 0.6 + ocrConfidence * 0.4)).toFixed(2)
  );
  parsed.rawText = rawText.slice(0, 4000);

  return parsed;
}
