import { ExtractedLabelData, GOVERNMENT_WARNING_TEXT } from '@/lib/types';

const CLASS_TYPE_PATTERNS: RegExp[] = [
  /kentucky\s+straight\s+bourbon\s+whiskey/i,
  /straight\s+rye\s+whiskey/i,
  /bourbon\s+whiskey/i,
  /london\s+dry\s+gin/i,
  /india\s+pale\s+ale/i,
  /cabernet\s+sauvignon/i,
  /tequila\s+blanco/i,
  /single\s+malt\s+scotch/i,
  /vodka/i,
  /gin/i,
  /whiskey|whisky/i,
  /wine/i,
  /ale|lager|stout|porter|ipa\b/i,
  /tequila|mezcal/i,
  /rum|brandy|cognac/i,
];

/**
 * Parse OCR plain text into structured alcohol label fields using heuristics.
 */
export function parseOcrText(rawText: string): ExtractedLabelData {
  const text = rawText.replace(/\r/g, '\n');
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const alcoholContent = extractAlcoholContent(text);
  const netContents = extractNetContents(text);
  const governmentWarning = extractGovernmentWarning(text);
  const countryOfOrigin = extractCountry(text);
  const { producerName, producerAddress } = extractProducer(lines);
  const classType = extractClassType(text, lines);
  const brandName = extractBrandName(lines, {
    classType,
    alcoholContent,
    netContents,
    producerName,
  });

  const foundCount = [
    brandName,
    classType,
    alcoholContent,
    netContents,
    producerName,
    governmentWarning,
  ].filter(Boolean).length;

  return {
    brandName,
    classType,
    alcoholContent,
    netContents,
    producerName,
    producerAddress,
    countryOfOrigin,
    governmentWarning,
    rawText: text.slice(0, 4000),
    confidence: Math.min(0.95, 0.35 + foundCount * 0.1),
  };
}

function extractAlcoholContent(text: string): string | null {
  const patterns = [
    /(\d+(?:\.\d+)?)\s*%\s*(?:Alc\.?\s*\/?\s*Vol\.?|ABV|alcohol(?:\s+by\s+volume)?)/i,
    /(?:Alc\.?\s*\/?\s*Vol\.?|ABV)[:\s]*(\d+(?:\.\d+)?)\s*%/i,
    /(\d+(?:\.\d+)?)\s*%\s*(?:\([^)]*Proof[^)]*\))?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const pct = match[1];
      const proof = text.match(/\((\d+)\s*Proof\)/i);
      if (proof) return `${pct}% Alc./Vol. (${proof[1]} Proof)`;
      if (/alc|abv/i.test(match[0])) return match[0].replace(/\s+/g, ' ').trim();
      return `${pct}% Alc./Vol.`;
    }
  }
  return null;
}

function extractNetContents(text: string): string | null {
  const match = text.match(
    /(\d+(?:\.\d+)?)\s*(mL|ml|milliliters?|L|liter|litre|fl\.?\s*oz\.?|oz)\b/i
  );
  if (!match) return null;
  const amount = match[1];
  const unit = match[2].toLowerCase();
  if (unit.startsWith('ml') || unit.startsWith('mill')) return `${amount} mL`;
  if (unit === 'l' || unit.startsWith('liter') || unit.startsWith('litre')) return `${amount} L`;
  return `${amount} fl oz`;
}

function extractGovernmentWarning(text: string): string | null {
  const normalized = text.replace(/\s+/g, ' ').trim();

  // Prefer exact standard string if OCR captured enough of it
  const standardNorm = GOVERNMENT_WARNING_TEXT.replace(/\s+/g, ' ').trim();
  if (normalized.toUpperCase().includes('GOVERNMENT WARNING')) {
    const idx = normalized.toUpperCase().indexOf('GOVERNMENT WARNING');
    let extracted = normalized.slice(idx);
    // Trim trailing noise after the warning
    const endMarkers = [/health problems\./i, /health problems/i];
    for (const marker of endMarkers) {
      const m = extracted.match(marker);
      if (m && m.index !== undefined) {
        extracted = extracted.slice(0, m.index + m[0].length);
        break;
      }
    }
    extracted = extracted.replace(/\s+/g, ' ').trim();

    // If OCR mangled wording but caps are correct, still return captured text
    if (/GOVERNMENT WARNING:/i.test(extracted)) {
      // Preserve exact casing of the GOVERNMENT WARNING: prefix when present in all caps
      if (extracted.startsWith('GOVERNMENT WARNING:')) {
        return extracted;
      }
      // Title-case / wrong formatting — return as-is so comparison catches it
      return extracted;
    }
  }

  // Title case variant (Jenny's reject case)
  const titleCase = normalized.match(
    /Government Warning:[\s\S]{20,400?}(?:health problems\.?)/i
  );
  if (titleCase) {
    return titleCase[0].replace(/\s+/g, ' ').trim();
  }

  // Fuzzy: if most of the required warning content is present, reconstruct expected text
  // only when "GOVERNMENT WARNING:" all-caps header is present (for OCR recovery)
  if (
    normalized.includes('GOVERNMENT WARNING:') &&
    /surgeon general/i.test(normalized) &&
    /pregnancy/i.test(normalized) &&
    /health problems/i.test(normalized)
  ) {
    // Return standard text only if header is exact all-caps — comparison still validates
    const headerOk = normalized.includes('GOVERNMENT WARNING:');
    if (headerOk && normalized.toLowerCase().includes(standardNorm.toLowerCase().slice(20, 80))) {
      return standardNorm;
    }
  }

  return null;
}

function extractCountry(text: string): string | null {
  const patterns = [
    /product\s+of\s+([A-Za-z][A-Za-z\s.]+)/i,
    /hecho\s+en\s+([A-Za-z]+)/i,
    /country\s+of\s+origin[:\s]+([A-Za-z][A-Za-z\s.]+)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let country = match[1].trim().replace(/\.$/, '');
      if (/^méxico|^mexico/i.test(country) || /hecho en méxico/i.test(text)) return 'Mexico';
      if (/^usa$|^u\.s\.a|^united states/i.test(country)) return 'USA';
      return country.split(/[.\n]/)[0].trim();
    }
  }
  if (/\bUSA\b|United States/i.test(text)) return 'USA';
  if (/Mexico|México/i.test(text)) return 'Mexico';
  return null;
}

function extractProducer(lines: string[]): {
  producerName: string | null;
  producerAddress: string | null;
} {
  const cue = /^(distilled|produced|brewed|bottled|imported)\s+(and\s+)?(bottled\s+)?by\b/i;
  for (let i = 0; i < lines.length; i++) {
    if (cue.test(lines[i]) || /^(distilled and bottled by|produced and bottled by|brewed and bottled by|imported by)\b/i.test(lines[i])) {
      const name = lines[i + 1] || null;
      const address = lines[i + 2] || null;
      return {
        producerName: name && !/%|warning|mL|fl oz/i.test(name) ? name : null,
        producerAddress: address && !/%|warning/i.test(address) ? address : null,
      };
    }
    // Same line: "Bottled by Foo Co."
    const inline = lines[i].match(
      /(?:distilled|produced|brewed|bottled|imported)(?:\s+and\s+bottled)?\s+by\s+(.+)/i
    );
    if (inline) {
      return {
        producerName: inline[1].trim(),
        producerAddress: lines[i + 1] || null,
      };
    }
  }
  return { producerName: null, producerAddress: null };
}

function extractClassType(text: string, lines: string[]): string | null {
  for (const pattern of CLASS_TYPE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      // Prefer the full line containing the match for nicer casing
      const line = lines.find((l) => pattern.test(l));
      return line || match[0];
    }
  }
  return null;
}

function extractBrandName(
  lines: string[],
  skip: {
    classType: string | null;
    alcoholContent: string | null;
    netContents: string | null;
    producerName: string | null;
  }
): string | null {
  const skipRe =
    /est\.|since|batch|craft|imported|estate|warning|surgeon|alc|proof|vol|product of|bottled|produced|brewed|distilled|ml\b|fl\.?\s*oz|%|co\.|llc|inc\.|street|avenue|kentucky|oregon|california|washington|illinois|florida|mexico|usa/i;

  const candidates = lines.filter((line) => {
    if (line.length < 3 || line.length > 48) return false;
    if (skipRe.test(line)) return false;
    if (skip.classType && line === skip.classType) return false;
    if (skip.producerName && line === skip.producerName) return false;
    if (/\d/.test(line) && /%|ml|oz|proof/i.test(line)) return false;
    return true;
  });

  // Prefer early, shorter shouty brand lines
  const top = candidates.slice(0, 8);
  if (top.length === 0) return null;

  // Merge consecutive ALL CAPS / Title brand words near top (e.g. OLD TOM + DISTILLERY)
  const first = top[0];
  const second = top[1];
  if (
    second &&
    first.length <= 24 &&
    second.length <= 24 &&
    !/whiskey|wine|ale|gin|tequila/i.test(second)
  ) {
    const combined = `${first} ${second}`;
    if (combined.length <= 40) return combined;
  }

  return first;
}
