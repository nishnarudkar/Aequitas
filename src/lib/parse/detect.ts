import { DocumentType } from '@/types';

export interface DetectionResult {
  documentType: DocumentType;
  confidence: number; // 0 to 1
  scores: Record<DocumentType, number>;
}

const KEYWORD_DICTIONARY: Record<Exclude<DocumentType, 'other'>, string[]> = {
  rental: [
    'leave and licence',
    'leave & licence',
    'licensor',
    'licensee',
    'rent agreement',
    'security deposit',
    'demised premises',
    'monthly rent',
    'society noc',
    'lock-in period',
    'possession of premises',
    'licensed premises',
    'tenancy agreement',
  ],
  'service-agreement': [
    'scope of work',
    'deliverables',
    'statement of work',
    'master service agreement',
    'independent contractor',
    'service provider',
    'invoice',
    'milestone payments',
    'service fees',
    'sow',
  ],
  employment: [
    'offer letter',
    'employment agreement',
    'ctc',
    'probation',
    'notice period',
    'employee',
    'employer',
    'annual remuneration',
    'variable pay',
    'garden leave',
    'training bond',
  ],
  'privacy-policy': [
    'privacy policy',
    'data controller',
    'we collect',
    'cookies',
    'personal data',
    'third party sharing',
    'grievance officer',
    'terms and conditions',
    'terms of use',
    'data retention',
  ],
  loan: [
    'sanction letter',
    'loan agreement',
    'emi',
    'interest rate per annum',
    'foreclosure charge',
    'borrower',
    'lender',
    'disbursement',
    'floating rate',
    'principal amount',
    'guarantor',
  ],
};

export function detectDocumentType(text: string): DetectionResult {
  const lowerText = text.toLowerCase();
  const scores: Record<DocumentType, number> = {
    rental: 0,
    'service-agreement': 0,
    employment: 0,
    'privacy-policy': 0,
    loan: 0,
    other: 0,
  };

  let maxScore = 0;
  let detectedType: DocumentType = 'other';

  for (const [docType, keywords] of Object.entries(KEYWORD_DICTIONARY)) {
    const key = docType as Exclude<DocumentType, 'other'>;
    let typeMatches = 0;

    for (const kw of keywords) {
      if (lowerText.includes(kw)) {
        typeMatches += 1;
      }
    }

    // Normalize score based on number of keywords
    const score = typeMatches / keywords.length;
    scores[key] = score;

    if (score > maxScore) {
      maxScore = score;
      detectedType = key;
    }
  }

  // Calculate confidence score (normalized 0 to 1)
  const confidence = Math.min(1, Math.round(maxScore * 2.5 * 100) / 100);

  // If highest confidence is below threshold (0.6), return 'other'
  if (confidence < 0.6) {
    return {
      documentType: 'other',
      confidence,
      scores,
    };
  }

  return {
    documentType: detectedType,
    confidence,
    scores,
  };
}
