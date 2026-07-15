import OpenAI from 'openai';
import { ExtractedLabelData } from '@/lib/types';

const EXTRACTION_PROMPT = `You are an expert at reading alcohol beverage labels. Analyze this label image and extract the following information.

Extract these fields (return null if not found):
1. brandName - The brand name of the product
2. classType - The class/type designation (e.g., "Kentucky Straight Bourbon Whiskey", "Cabernet Sauvignon", "India Pale Ale")
3. alcoholContent - The alcohol content (e.g., "45% Alc./Vol.", "12.5% ABV")
4. netContents - The net contents (e.g., "750 mL", "12 fl oz")
5. producerName - Name of the producer, bottler, or importer
6. producerAddress - Address of the producer, bottler, or importer
7. countryOfOrigin - Country of origin (if stated)
8. governmentWarning - The complete government health warning statement (extract the EXACT text, including "GOVERNMENT WARNING:" prefix)

Important notes:
- For the government warning, extract the COMPLETE text exactly as written, preserving capitalization
- If text is partially visible or unclear, indicate this with [unclear] or [partial]
- Be thorough - check all visible areas of the label including back labels, neck labels, etc.

Respond in this exact JSON format:
{
  "brandName": "...",
  "classType": "...",
  "alcoholContent": "...",
  "netContents": "...",
  "producerName": "...",
  "producerAddress": "...",
  "countryOfOrigin": "...",
  "governmentWarning": "...",
  "confidence": 0.95
}`;

export async function extractWithOpenAI(imageBase64: string): Promise<ExtractedLabelData> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const openai = new OpenAI({ apiKey });
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: EXTRACTION_PROMPT },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64.startsWith('data:')
                ? imageBase64
                : `data:image/jpeg;base64,${imageBase64}`,
              detail: 'high',
            },
          },
        ],
      },
    ],
    max_tokens: 1500,
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse JSON from OpenAI response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    brandName: parsed.brandName || null,
    classType: parsed.classType || null,
    alcoholContent: parsed.alcoholContent || null,
    netContents: parsed.netContents || null,
    producerName: parsed.producerName || null,
    producerAddress: parsed.producerAddress || null,
    countryOfOrigin: parsed.countryOfOrigin || null,
    governmentWarning: parsed.governmentWarning || null,
    confidence: parsed.confidence,
  };
}
