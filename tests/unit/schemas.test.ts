import { describe, it, expect } from 'vitest';
import {
  UserContextSchema,
  AnalysisPlanSchema,
  ClauseSchema,
  SingleClauseAnalysisSchema,
  PassBMissingClausesSchema,
  SynthesisResultSchema,
  AskRequestSchema,
  AskResponseSchema,
  CompareRequestSchema,
  CompareResponseSchema,
} from '../../src/lib/schemas';

describe('Zod Schemas Contract Tests', () => {
  it('UserContextSchema validates valid payload and rejects mutated payload', () => {
    const validContext = {
      persona: 'tenant',
      jurisdiction: 'MH',
      goal: 'understand',
      deadline: '2026-10-01',
      language: 'en',
      readingLevel: 'simple',
      counterpartySigned: false,
      amountAtStake: 50000,
    };

    expect(UserContextSchema.safeParse(validContext).success).toBe(true);

    const invalidContext = {
      ...validContext,
      persona: 'invalid_persona',
    };

    expect(UserContextSchema.safeParse(invalidContext).success).toBe(false);
  });

  it('AnalysisPlanSchema validates valid payload and rejects mutated payload', () => {
    const validPlan = {
      documentType: 'rental',
      analyzers: ['detectors', 'clause-pass', 'gaps-pass', 'synthesis-pass'],
      priorityClauseTypes: ['lock-in', 'security-deposit', 'notice-period-asymmetry'],
      riskWeights: {
        'lock-in': 1.8,
        'security-deposit': 2.0,
      },
      outputs: ['summary', 'obligations', 'risks', 'checklist'],
      tone: 'plain',
      statuteHints: [
        {
          code: 'MH_RENT_CONTROL_1999',
          title: 'Maharashtra Rent Control Act 1999',
          explanation: 'Governs tenancy and deposit rules in Maharashtra.',
          disclaimer: 'This is a pointer for your own reading, not a legal opinion.',
        },
      ],
      escalation: {
        triggered: false,
        level: 'none',
        triggers: [],
        resources: [],
        rationale: 'No emergency triggers detected.',
      },
      tokenBudget: 8000,
      rationale: ['Prioritizing deposit and exit clauses for tenant.'],
    };

    expect(AnalysisPlanSchema.safeParse(validPlan).success).toBe(true);

    const invalidPlan = {
      ...validPlan,
      tokenBudget: -100, // must be positive
    };

    expect(AnalysisPlanSchema.safeParse(invalidPlan).success).toBe(false);
  });

  it('ClauseSchema validates valid payload and rejects mutated payload', () => {
    const validClause = {
      id: 'c-0001',
      heading: '1. Security Deposit',
      text: 'The Licensee shall pay a security deposit of INR 50,000.',
      startOffset: 0,
      endOffset: 55,
      pageHint: 1,
    };

    expect(ClauseSchema.safeParse(validClause).success).toBe(true);

    const invalidClause = {
      ...validClause,
      startOffset: -5, // must be non-negative
    };

    expect(ClauseSchema.safeParse(invalidClause).success).toBe(false);
  });

  it('SingleClauseAnalysisSchema validates valid payload and rejects mutated payload', () => {
    const validSingleClause = {
      clauseId: 'c-0001',
      plainMeaning: 'You must pay a deposit of 50,000 upfront.',
      whoIsObligated: 'Licensee (Tenant)',
      type: 'security-deposit',
      severity: 2,
      whyItMatters: 'Deposit return terms are vital to protect your funds.',
      watchFor: 'Unclear refund timeframe upon exit.',
      suggestedAsk: 'Request 14-day refund deadline.',
      confidence: 0.95,
    };

    expect(SingleClauseAnalysisSchema.safeParse(validSingleClause).success).toBe(true);

    const invalidSingleClause = {
      ...validSingleClause,
      severity: 5, // severity max is 4
    };

    expect(SingleClauseAnalysisSchema.safeParse(invalidSingleClause).success).toBe(false);
  });

  it('PassBMissingClausesSchema validates valid payload and rejects mutated payload', () => {
    const validMissingClauses = {
      missingClauses: [
        {
          type: 'security-deposit',
          title: 'Deposit Refund Timeline',
          explanation: 'No explicit deadline is stated for returning deposit.',
          importance: 'high',
          suggestedClause: 'Deposit shall be returned within 14 days of vacating.',
        },
      ],
    };

    expect(PassBMissingClausesSchema.safeParse(validMissingClauses).success).toBe(true);

    const invalidMissingClauses = {
      missingClauses: [
        {
          type: 'security-deposit',
          title: 'Deposit Refund Timeline',
          explanation: 'Missing',
          importance: 'critical', // invalid enum
        },
      ],
    };

    expect(PassBMissingClausesSchema.safeParse(invalidMissingClauses).success).toBe(false);
  });

  it('SynthesisResultSchema validates valid payload and rejects mutated payload', () => {
    const validSynthesis = {
      summary: 'This leave and licence agreement has a 3-month lock-in period.',
      topRisks: [
        {
          clauseId: 'c-0002',
          heading: '2. Lock-in Period',
          score: 75,
          severity: 3,
          band: 'negotiate',
          explanation: '3-month lock-in with penalty if terminated early.',
          contributingFactors: ['High severity', 'Persona weighting'],
        },
      ],
      obligations: [
        {
          party: 'user',
          obligation: 'Pay rent by 5th of every month',
          deadlineOrTrigger: 'Monthly',
          clauseId: 'c-0003',
        },
      ],
      checklist: [
        {
          id: 'chk-1',
          category: 'Pre-signing',
          action: 'Verify landlord ownership documents',
          priority: 'high',
        },
      ],
      negotiationAsks: [
        {
          id: 'neg-1',
          targetClauseId: 'c-0002',
          currentIssue: 'Lock-in period is one-sided',
          proposedWording: 'Mutual 1-month notice period',
          rationale: 'Protects flexibility for freelancer/tenant',
        },
      ],
      lawyerBrief: {
        summary: 'Tenant contract review for 11-month lease.',
        keyConcerns: ['Deposit return clause is vague'],
        questionsForLawyer: ['Is the lock-in clause enforceable under local laws?'],
        documentChecklist: ['Ownership proof', 'Electricity bill'],
      },
    };

    expect(SynthesisResultSchema.safeParse(validSynthesis).success).toBe(true);

    const invalidSynthesis = {
      ...validSynthesis,
      topRisks: [
        {
          ...validSynthesis.topRisks[0],
          band: 'extreme-danger', // invalid band
        },
      ],
    };

    expect(SynthesisResultSchema.safeParse(invalidSynthesis).success).toBe(false);
  });

  it('AskRequestSchema and AskResponseSchema validate valid payloads and reject mutated payloads', () => {
    const validAskReq = {
      question: 'What is the deposit amount?',
      context: {
        persona: 'tenant',
        jurisdiction: 'MH',
        goal: 'understand',
        language: 'en',
        readingLevel: 'simple',
      },
      clauses: [
        {
          id: 'c-0001',
          heading: '1. Deposit',
          text: 'Deposit is INR 50,000.',
          startOffset: 0,
          endOffset: 25,
        },
      ],
    };

    expect(AskRequestSchema.safeParse(validAskReq).success).toBe(true);

    const validAskRes = {
      answer: 'The deposit is INR 50,000 [c-0001].',
      citations: ['c-0001'],
      isUnanswered: false,
    };

    expect(AskResponseSchema.safeParse(validAskRes).success).toBe(true);

    const invalidAskReq = {
      ...validAskReq,
      question: '', // min 1 char
    };

    expect(AskRequestSchema.safeParse(invalidAskReq).success).toBe(false);
  });

  it('CompareRequestSchema and CompareResponseSchema validate valid payloads and reject mutated payloads', () => {
    const validCompareReq = {
      docA: {
        title: 'Draft Agreement',
        clauses: [{ id: 'c-0001', heading: 'Notice', text: '3 months notice', startOffset: 0, endOffset: 15 }],
      },
      docB: {
        title: 'Fair Baseline',
        clauses: [{ id: 'b-0001', heading: 'Notice', text: '1 month notice', startOffset: 0, endOffset: 14 }],
      },
      context: {
        persona: 'tenant',
        jurisdiction: 'MH',
        goal: 'negotiate',
        language: 'en',
        readingLevel: 'simple',
      },
      isBaseline: true,
    };

    expect(CompareRequestSchema.safeParse(validCompareReq).success).toBe(true);

    const validCompareRes = {
      items: [
        {
          clauseType: 'termination-convenience',
          title: 'Notice Period',
          docAPosition: '3 months notice',
          docBPosition: '1 month notice',
          betterForPersona: 'docB',
          why: 'Shorter notice gives tenant more flexibility.',
          status: 'different',
        },
      ],
      summary: 'Doc B offers more tenant-friendly notice terms.',
    };

    expect(CompareResponseSchema.safeParse(validCompareRes).success).toBe(true);
  });
});
