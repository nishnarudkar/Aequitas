import { describe, it, expect } from 'vitest';
import { createAnalysisPlan } from '../../src/lib/context/router';
import { DocumentType, Goal, Jurisdiction, Persona, UserContext } from '../../src/types';

describe('Context Engine Table-Driven Unit Tests', () => {
  const personas: Persona[] = ['tenant', 'freelancer', 'employee', 'consumer', 'borrower'];
  const jurisdictions: Jurisdiction[] = ['MH', 'DL', 'KA', 'TG', 'WB', 'OTHER'];
  const goals: Goal[] = ['understand', 'decide', 'negotiate', 'dispute', 'prepare-for-lawyer'];

  // Table-driven test suite spanning >= 25 context combinations
  const testCases: Array<{
    name: string;
    context: UserContext;
    detectedType?: DocumentType;
    docText?: string;
    expectedDocType: DocumentType;
    expectedTone: 'plain' | 'plainest';
    mustIncludeOutput: string;
    mustNotIncludeOutput?: string;
    mustContainPriorityClause?: string;
  }> = [];

  // Generate 25 distinct combinations systematically
  let caseCount = 1;
  for (const persona of personas) {
    for (const goal of goals) {
      if (caseCount > 25) break;

      const jurisdiction = jurisdictions[(caseCount - 1) % jurisdictions.length]!;
      const expectedDocTypeMap: Record<Persona, DocumentType> = {
        tenant: 'rental',
        freelancer: 'service-agreement',
        employee: 'employment',
        consumer: 'privacy-policy',
        borrower: 'loan',
      };

      const expectedDocType = expectedDocTypeMap[persona];
      const expectedTone = goal === 'understand' ? 'plainest' : 'plain';

      testCases.push({
        name: `Case ${caseCount}: ${persona} | ${jurisdiction} | ${goal}`,
        context: {
          persona,
          jurisdiction,
          goal,
          language: 'en',
          readingLevel: 'standard',
        },
        expectedDocType,
        expectedTone,
        mustIncludeOutput: goal === 'negotiate' ? 'negotiation' : goal === 'understand' ? 'obligations' : 'summary',
      });

      caseCount++;
    }
  }

  testCases.forEach(({ name, context, expectedDocType, expectedTone, mustIncludeOutput }) => {
    it(name, () => {
      const plan = createAnalysisPlan(context);
      expect(plan.documentType).toBe(expectedDocType);
      expect(plan.tone).toBe(expectedTone);
      expect(plan.outputs).toContain(mustIncludeOutput);
      expect(plan.statuteHints.length).toBeGreaterThan(0);
      expect(plan.statuteHints[0]?.disclaimer).toContain('pointer for your own reading');
    });
  });

  describe('Specific Logic Branch Tests', () => {
    it('applies deadline pressure logic for urgent deadline (< 3 days)', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const plan = createAnalysisPlan({
        persona: 'tenant',
        jurisdiction: 'MH',
        goal: 'negotiate',
        deadline: futureDate.toISOString(),
        language: 'en',
        readingLevel: 'simple',
      });

      expect(plan.tokenBudget).toBe(4000);
      expect(plan.rationale.some((r) => r.includes('Urgent deadline'))).toBe(true);
    });

    it('applies deadline pressure logic for upcoming deadline (< 7 days)', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const plan = createAnalysisPlan({
        persona: 'freelancer',
        jurisdiction: 'DL',
        goal: 'decide',
        deadline: futureDate.toISOString(),
        language: 'en',
        readingLevel: 'standard',
      });

      expect(plan.rationale.some((r) => r.includes('Upcoming deadline'))).toBe(true);
      expect(plan.riskWeights['termination-convenience']).toBeGreaterThan(1.8);
    });

    it('suppresses negotiation outputs when counterpartySigned is true', () => {
      const plan = createAnalysisPlan({
        persona: 'tenant',
        jurisdiction: 'MH',
        goal: 'negotiate',
        counterpartySigned: true,
        language: 'en',
        readingLevel: 'simple',
      });

      expect(plan.outputs).not.toContain('negotiation');
      expect(plan.rationale.some((r) => r.includes('already signed'))).toBe(true);
    });

    it('includes Maharashtra Rent Control Act hint for tenant in MH', () => {
      const plan = createAnalysisPlan({
        persona: 'tenant',
        jurisdiction: 'MH',
        goal: 'understand',
        language: 'en',
        readingLevel: 'simple',
      });

      const mhHint = plan.statuteHints.find((h) => h.code === 'MH_RENT_CONTROL_1999');
      expect(mhHint).toBeDefined();
      expect(mhHint?.title).toContain('Maharashtra Rent Control Act');
    });

    it('includes DPDP Act hint for consumer reading privacy policy', () => {
      const plan = createAnalysisPlan({
        persona: 'consumer',
        jurisdiction: 'OTHER',
        goal: 'decide',
        language: 'en',
        readingLevel: 'standard',
      });

      const dpdpHint = plan.statuteHints.find((h) => h.code === 'DPDP_ACT_2023');
      expect(dpdpHint).toBeDefined();
    });

    it('includes Indian Contract Act Section 27 hint for employee', () => {
      const plan = createAnalysisPlan({
        persona: 'employee',
        jurisdiction: 'KA',
        goal: 'negotiate',
        language: 'en',
        readingLevel: 'standard',
      });

      const icaHint = plan.statuteHints.find((h) => h.code === 'ICA_1872_SEC_27');
      expect(icaHint).toBeDefined();
      expect(icaHint?.title).toContain('Indian Contract Act');
    });
  });
});
