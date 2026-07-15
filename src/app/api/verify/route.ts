import { NextRequest, NextResponse } from 'next/server';
import { ApplicationData, VerificationResult } from '@/lib/types';
import { compareFields, determineOverallStatus } from '@/lib/comparison';
import { extractLabelData } from '@/lib/extract';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { image, applicationData, fileName, id } = body as {
      image: string;
      applicationData: ApplicationData;
      fileName: string;
      id: string;
    };

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (!applicationData) {
      return NextResponse.json({ error: 'No application data provided' }, { status: 400 });
    }

    const { data: extractedData, engine } = await extractLabelData(image);
    const comparisons = compareFields(applicationData, extractedData);
    const overallStatus = determineOverallStatus(comparisons);
    const processingTime = Date.now() - startTime;

    const result: VerificationResult = {
      id: id || crypto.randomUUID(),
      fileName,
      imageUrl: image,
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
