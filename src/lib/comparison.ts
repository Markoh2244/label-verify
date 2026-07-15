import { ApplicationData, ExtractedLabelData, FieldComparison, GOVERNMENT_WARNING_TEXT } from './types';

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeAlcoholContent(text: string): string {
  const normalized = text.toLowerCase().replace(/\s+/g, '');
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? match[1] : normalized;
}

function normalizeNetContents(text: string): string {
  const normalized = text.toLowerCase().replace(/\s+/g, '');
  const mlMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(ml|milliliter)/i);
  const lMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(l|liter)/i);
  const ozMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(fl\.?\s*oz|oz)/i);
  
  if (mlMatch) return `${mlMatch[1]}ml`;
  if (lMatch) return `${parseFloat(lMatch[1]) * 1000}ml`;
  if (ozMatch) return `${ozMatch[1]}oz`;
  return normalized;
}

function checkGovernmentWarning(extracted: string | null): { match: boolean; notes?: string } {
  if (!extracted) {
    return { match: false, notes: 'Government warning not found on label' };
  }

  const normalizedExtracted = extracted.replace(/\s+/g, ' ').trim();
  const normalizedRequired = GOVERNMENT_WARNING_TEXT.replace(/\s+/g, ' ').trim();

  if (normalizedExtracted === normalizedRequired) {
    return { match: true };
  }

  if (!extracted.includes('GOVERNMENT WARNING:')) {
    return { match: false, notes: '"GOVERNMENT WARNING:" must be in all caps' };
  }

  const extractedLower = normalizedExtracted.toLowerCase();
  const requiredLower = normalizedRequired.toLowerCase();
  
  if (extractedLower === requiredLower) {
    return { match: false, notes: 'Warning text present but formatting incorrect (check capitalization)' };
  }

  if (extractedLower.includes('surgeon general') && extractedLower.includes('pregnancy')) {
    return { match: false, notes: 'Warning statement present but wording differs from required text' };
  }

  return { match: false, notes: 'Government warning text does not match required format' };
}

function fuzzyMatch(str1: string, str2: string): boolean {
  const n1 = normalizeText(str1);
  const n2 = normalizeText(str2);
  
  if (n1 === n2) return true;
  
  const s1 = n1.replace(/[^a-z0-9]/g, '');
  const s2 = n2.replace(/[^a-z0-9]/g, '');
  
  return s1 === s2;
}

export function compareFields(
  application: ApplicationData,
  extracted: ExtractedLabelData
): FieldComparison[] {
  const comparisons: FieldComparison[] = [];

  comparisons.push(createComparison(
    'brandName',
    'Brand Name',
    application.brandName,
    extracted.brandName,
    false
  ));

  comparisons.push(createComparison(
    'classType',
    'Class/Type',
    application.classType,
    extracted.classType,
    false
  ));

  const alcoholComparison = createAlcoholComparison(
    application.alcoholContent,
    extracted.alcoholContent
  );
  comparisons.push(alcoholComparison);

  const netContentsComparison = createNetContentsComparison(
    application.netContents,
    extracted.netContents
  );
  comparisons.push(netContentsComparison);

  comparisons.push(createComparison(
    'producerName',
    'Producer/Bottler Name',
    application.producerName,
    extracted.producerName,
    false
  ));

  comparisons.push(createComparison(
    'producerAddress',
    'Producer/Bottler Address',
    application.producerAddress,
    extracted.producerAddress,
    false
  ));

  if (application.countryOfOrigin) {
    comparisons.push(createComparison(
      'countryOfOrigin',
      'Country of Origin',
      application.countryOfOrigin,
      extracted.countryOfOrigin,
      false
    ));
  }

  const warningCheck = checkGovernmentWarning(extracted.governmentWarning);
  comparisons.push({
    field: 'governmentWarning',
    label: 'Government Warning',
    applicationValue: 'Required standard text',
    extractedValue: extracted.governmentWarning,
    match: warningCheck.match,
    matchType: warningCheck.match ? 'exact' : (extracted.governmentWarning ? 'mismatch' : 'missing'),
    notes: warningCheck.notes,
  });

  return comparisons;
}

function createComparison(
  field: string,
  label: string,
  applicationValue: string,
  extractedValue: string | null,
  exactMatch: boolean
): FieldComparison {
  if (!extractedValue) {
    return {
      field,
      label,
      applicationValue,
      extractedValue: null,
      match: false,
      matchType: 'missing',
      notes: `${label} not found on label`,
    };
  }

  const normalizedApp = normalizeText(applicationValue);
  const normalizedExt = normalizeText(extractedValue);

  if (normalizedApp === normalizedExt) {
    return {
      field,
      label,
      applicationValue,
      extractedValue,
      match: true,
      matchType: 'exact',
    };
  }

  if (!exactMatch && fuzzyMatch(applicationValue, extractedValue)) {
    return {
      field,
      label,
      applicationValue,
      extractedValue,
      match: true,
      matchType: 'fuzzy',
      notes: 'Minor formatting differences (e.g., capitalization)',
    };
  }

  return {
    field,
    label,
    applicationValue,
    extractedValue,
    match: false,
    matchType: 'mismatch',
  };
}

function createAlcoholComparison(
  applicationValue: string,
  extractedValue: string | null
): FieldComparison {
  if (!extractedValue) {
    return {
      field: 'alcoholContent',
      label: 'Alcohol Content',
      applicationValue,
      extractedValue: null,
      match: false,
      matchType: 'missing',
      notes: 'Alcohol content not found on label',
    };
  }

  const normalizedApp = normalizeAlcoholContent(applicationValue);
  const normalizedExt = normalizeAlcoholContent(extractedValue);

  if (normalizedApp === normalizedExt) {
    return {
      field: 'alcoholContent',
      label: 'Alcohol Content',
      applicationValue,
      extractedValue,
      match: true,
      matchType: 'exact',
    };
  }

  return {
    field: 'alcoholContent',
    label: 'Alcohol Content',
    applicationValue,
    extractedValue,
    match: false,
    matchType: 'mismatch',
    notes: `Application: ${normalizedApp}%, Label: ${normalizedExt}%`,
  };
}

function createNetContentsComparison(
  applicationValue: string,
  extractedValue: string | null
): FieldComparison {
  if (!extractedValue) {
    return {
      field: 'netContents',
      label: 'Net Contents',
      applicationValue,
      extractedValue: null,
      match: false,
      matchType: 'missing',
      notes: 'Net contents not found on label',
    };
  }

  const normalizedApp = normalizeNetContents(applicationValue);
  const normalizedExt = normalizeNetContents(extractedValue);

  if (normalizedApp === normalizedExt) {
    return {
      field: 'netContents',
      label: 'Net Contents',
      applicationValue,
      extractedValue,
      match: true,
      matchType: 'exact',
    };
  }

  return {
    field: 'netContents',
    label: 'Net Contents',
    applicationValue,
    extractedValue,
    match: false,
    matchType: 'mismatch',
  };
}

export function determineOverallStatus(comparisons: FieldComparison[]): 'pass' | 'fail' | 'review' {
  const hasMissing = comparisons.some(c => c.matchType === 'missing');
  const hasMismatch = comparisons.some(c => c.matchType === 'mismatch');
  const hasFuzzy = comparisons.some(c => c.matchType === 'fuzzy');

  if (hasMismatch || hasMissing) return 'fail';
  if (hasFuzzy) return 'review';
  return 'pass';
}
