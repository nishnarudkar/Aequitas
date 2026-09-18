import { DocumentType } from '@/types';
import rentalBaseline from '@/data/baselines/rental.json';
import serviceBaseline from '@/data/baselines/service-agreement.json';
import employmentBaseline from '@/data/baselines/employment.json';
import privacyBaseline from '@/data/baselines/privacy-policy.json';
import loanBaseline from '@/data/baselines/loan.json';

export interface FairClause {
  type: string;
  title: string;
  text: string;
  importance: 'high' | 'medium' | 'low';
}

export interface FairBaseline {
  documentType: DocumentType;
  title: string;
  fairClauses: FairClause[];
}

const BASELINES: Record<string, FairBaseline> = {
  rental: rentalBaseline as FairBaseline,
  'service-agreement': serviceBaseline as FairBaseline,
  employment: employmentBaseline as FairBaseline,
  'privacy-policy': privacyBaseline as FairBaseline,
  loan: loanBaseline as FairBaseline,
};

export function getBaselineForDocType(docType: DocumentType): FairBaseline {
  return (
    BASELINES[docType] || {
      documentType: docType,
      title: `Fair Market Baseline — ${docType}`,
      fairClauses: rentalBaseline.fairClauses as FairClause[],
    }
  );
}
