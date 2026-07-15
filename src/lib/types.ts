export interface LabelField {
  name: string;
  label: string;
  required: boolean;
  exactMatch?: boolean;
  description?: string;
}

export interface ApplicationData {
  brandName: string;
  classType: string;
  alcoholContent: string;
  netContents: string;
  producerName: string;
  producerAddress: string;
  countryOfOrigin: string;
  governmentWarning: string;
}

export interface ExtractedLabelData {
  brandName: string | null;
  classType: string | null;
  alcoholContent: string | null;
  netContents: string | null;
  producerName: string | null;
  producerAddress: string | null;
  countryOfOrigin: string | null;
  governmentWarning: string | null;
  rawText?: string;
  confidence?: number;
}

export interface FieldComparison {
  field: string;
  label: string;
  applicationValue: string;
  extractedValue: string | null;
  match: boolean;
  matchType: 'exact' | 'fuzzy' | 'missing' | 'mismatch';
  notes?: string;
}

export interface VerificationResult {
  id: string;
  fileName: string;
  imageUrl: string;
  extractedData: ExtractedLabelData;
  comparisons: FieldComparison[];
  overallStatus: 'pass' | 'fail' | 'review';
  processingTime: number;
  timestamp: Date;
}

export interface BatchVerificationState {
  files: File[];
  results: VerificationResult[];
  isProcessing: boolean;
  currentIndex: number;
}

export const GOVERNMENT_WARNING_TEXT = `GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.`;

export const LABEL_FIELDS: LabelField[] = [
  { name: 'brandName', label: 'Brand Name', required: true, description: 'The brand name of the product' },
  { name: 'classType', label: 'Class/Type', required: true, description: 'e.g., Kentucky Straight Bourbon Whiskey' },
  { name: 'alcoholContent', label: 'Alcohol Content', required: true, description: 'e.g., 45% Alc./Vol. (90 Proof)' },
  { name: 'netContents', label: 'Net Contents', required: true, description: 'e.g., 750 mL' },
  { name: 'producerName', label: 'Producer/Bottler Name', required: true },
  { name: 'producerAddress', label: 'Producer/Bottler Address', required: true },
  { name: 'countryOfOrigin', label: 'Country of Origin', required: false, description: 'Required for imports' },
  { name: 'governmentWarning', label: 'Government Warning', required: true, exactMatch: true, description: 'Must match exactly with proper formatting' },
];
