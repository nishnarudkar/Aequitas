import {
  ClauseType,
  DocumentType,
  Goal,
  Jurisdiction,
  OutputId,
  Persona,
  StatuteHint,
} from '@/types';

export interface PersonaRule {
  priorityClauseTypes: ClauseType[];
  riskWeights: Record<string, number>;
}

export const PERSONA_RULES: Record<Persona, Record<string, PersonaRule>> = {
  tenant: {
    rental: {
      priorityClauseTypes: [
        'security-deposit',
        'lock-in',
        'notice-period-asymmetry',
        'interest-late-fee',
        'unilateral-amendment',
        'jurisdiction',
        'auto-renewal',
        'governing-law',
      ],
      riskWeights: {
        'security-deposit': 2.0,
        'lock-in': 1.8,
        'notice-period-asymmetry': 1.7,
        'unilateral-amendment': 1.5,
        'interest-late-fee': 1.4,
      },
    },
    default: {
      priorityClauseTypes: [
        'security-deposit',
        'lock-in',
        'notice-period-asymmetry',
        'indemnity',
      ],
      riskWeights: {
        'security-deposit': 1.8,
        'lock-in': 1.6,
        'notice-period-asymmetry': 1.5,
      },
    },
  },
  freelancer: {
    'service-agreement': {
      priorityClauseTypes: [
        'interest-late-fee',
        'termination-convenience',
        'ip-assignment',
        'liability-cap',
        'indemnity',
        'non-solicit',
        'liquidated-damages',
      ],
      riskWeights: {
        'interest-late-fee': 1.9,
        'termination-convenience': 1.8,
        'ip-assignment': 1.8,
        'liability-cap': 1.7,
        'indemnity': 1.6,
      },
    },
    default: {
      priorityClauseTypes: [
        'interest-late-fee',
        'ip-assignment',
        'liability-cap',
        'indemnity',
      ],
      riskWeights: {
        'interest-late-fee': 1.8,
        'ip-assignment': 1.7,
        'liability-cap': 1.6,
      },
    },
  },
  employee: {
    employment: {
      priorityClauseTypes: [
        'notice-period-asymmetry',
        'liquidated-damages',
        'non-compete',
        'non-solicit',
        'ip-assignment',
        'termination-convenience',
        'confidentiality',
      ],
      riskWeights: {
        'notice-period-asymmetry': 1.9,
        'liquidated-damages': 1.9,
        'non-compete': 1.8,
        'ip-assignment': 1.5,
      },
    },
    default: {
      priorityClauseTypes: [
        'notice-period-asymmetry',
        'non-compete',
        'liquidated-damages',
        'ip-assignment',
      ],
      riskWeights: {
        'notice-period-asymmetry': 1.8,
        'non-compete': 1.7,
        'liquidated-damages': 1.7,
      },
    },
  },
  consumer: {
    'privacy-policy': {
      priorityClauseTypes: [
        'unilateral-amendment',
        'auto-renewal',
        'arbitration',
        'jurisdiction',
        'waiver',
      ],
      riskWeights: {
        'unilateral-amendment': 2.0,
        'auto-renewal': 1.8,
        'arbitration': 1.7,
        'waiver': 1.5,
      },
    },
    default: {
      priorityClauseTypes: [
        'unilateral-amendment',
        'auto-renewal',
        'arbitration',
        'waiver',
      ],
      riskWeights: {
        'unilateral-amendment': 1.8,
        'auto-renewal': 1.6,
        'arbitration': 1.5,
      },
    },
  },
  borrower: {
    loan: {
      priorityClauseTypes: [
        'interest-late-fee',
        'liquidated-damages',
        'unilateral-amendment',
        'jurisdiction',
        'waiver',
      ],
      riskWeights: {
        'interest-late-fee': 2.0,
        'liquidated-damages': 1.9,
        'unilateral-amendment': 1.7,
      },
    },
    default: {
      priorityClauseTypes: [
        'interest-late-fee',
        'liquidated-damages',
        'unilateral-amendment',
      ],
      riskWeights: {
        'interest-late-fee': 1.8,
        'liquidated-damages': 1.7,
        'unilateral-amendment': 1.5,
      },
    },
  },
};

export const GOAL_OUTPUT_MAP: Record<
  Goal,
  { outputs: OutputId[]; tone: 'plain' | 'plainest' }
> = {
  understand: {
    outputs: ['summary', 'obligations', 'checklist'],
    tone: 'plainest',
  },
  decide: {
    outputs: ['summary', 'risks', 'gaps', 'checklist'],
    tone: 'plain',
  },
  negotiate: {
    outputs: ['summary', 'risks', 'gaps', 'checklist', 'negotiation'],
    tone: 'plain',
  },
  dispute: {
    outputs: ['summary', 'obligations', 'risks', 'lawyer-brief'],
    tone: 'plain',
  },
  'prepare-for-lawyer': {
    outputs: ['summary', 'risks', 'obligations', 'lawyer-brief'],
    tone: 'plain',
  },
};

export function getStatuteHints(
  jurisdiction: Jurisdiction,
  documentType: DocumentType
): StatuteHint[] {
  const hints: StatuteHint[] = [];
  const disclaimer =
    'This is a pointer for your own reading, not a legal opinion.';

  if (documentType === 'rental') {
    if (jurisdiction === 'MH') {
      hints.push({
        code: 'MH_RENT_CONTROL_1999',
        title: 'Maharashtra Rent Control Act 1999',
        explanation:
          'Governs Leave and Licence agreements, tenant rights, and deposit provisions in Maharashtra.',
        section: 'Section 24',
        disclaimer,
      });
    } else if (jurisdiction === 'DL') {
      hints.push({
        code: 'DL_RENT_CONTROL_1958',
        title: 'Delhi Rent Control Act 1958 & Model Tenancy Act',
        explanation:
          'Applies to tenancies in Delhi; regulates notice periods and eviction grounds.',
        disclaimer,
      });
    } else if (jurisdiction === 'KA') {
      hints.push({
        code: 'KA_RENT_ACT_1999',
        title: 'Karnataka Rent Act 1999',
        explanation:
          'Regulates tenancy agreements, maintenance duties, and deposit refunds in Karnataka.',
        disclaimer,
      });
    }
    hints.push({
      code: 'MODEL_TENANCY_ACT_2021',
      title: 'Model Tenancy Act 2021 (Reference)',
      explanation:
        'Suggests capping residential security deposits at a maximum of 2 months rent.',
      disclaimer,
    });
  }

  if (documentType === 'employment') {
    hints.push({
      code: 'ICA_1872_SEC_27',
      title: 'Indian Contract Act 1872 (§ 27)',
      explanation:
        'Post-employment non-compete clauses restraining lawful trade/profession are generally held void under Indian law.',
      section: 'Section 27',
      disclaimer,
    });
  }

  if (documentType === 'privacy-policy') {
    hints.push({
      code: 'DPDP_ACT_2023',
      title: 'Digital Personal Data Protection (DPDP) Act 2023',
      explanation:
        'Requires clear consent, explicit data processing purposes, and a designated Grievance Officer.',
      disclaimer,
    });
  }

  if (documentType === 'loan') {
    hints.push({
      code: 'RBI_FAIR_PRACTICES_CODE',
      title: 'RBI Master Direction on Fair Practices Code for Lenders',
      explanation:
        'Mandates clear disclosure of Annual Percentage Rate (APR), foreclosure charges, and floating rate terms.',
      disclaimer,
    });
  }

  if (hints.length === 0) {
    hints.push({
      code: 'ICA_1872_GENERAL',
      title: 'Indian Contract Act 1872 (General Contract Principles)',
      explanation:
        'Governs free consent, lawful consideration, and breach of contract principles.',
      disclaimer,
    });
  }

  return hints;
}
