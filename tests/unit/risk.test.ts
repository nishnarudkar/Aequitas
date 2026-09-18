import { describe, it, expect } from 'vitest';
import { calculateRiskScore } from '../../src/lib/analysis/risk';
import { createAnalysisPlan } from '../../src/lib/context/router';

describe('Deterministic Risk Scoring Model Unit Tests', () => {
  const plan = createAnalysisPlan({
    persona: 'tenant',
    jurisdiction: 'MH',
    goal: 'negotiate',
    language: 'en',
    readingLevel: 'standard',
  });

  it('demonstrates monotonicity: higher severity rating produces a higher risk score', () => {
    const lowRisk = calculateRiskScore({
      clauseId: 'c-0001',
      heading: 'Notice',
      severity: 1,
      clauseType: 'termination-convenience',
      plan,
    });

    const highRisk = calculateRiskScore({
      clauseId: 'c-0002',
      heading: 'Deposit',
      severity: 4,
      clauseType: 'security-deposit',
      plan,
    });

    expect(highRisk.score).toBeGreaterThan(lowRisk.score);
  });

  it('applies persona risk weight multipliers correctly', () => {
    const weightedRisk = calculateRiskScore({
      clauseId: 'c-0001',
      heading: 'Deposit',
      severity: 3,
      clauseType: 'security-deposit', // weight 2.0 for tenant
      plan,
    });

    expect(weightedRisk.score).toBeGreaterThanOrEqual(60);
    expect(weightedRisk.contributingFactors.some((f) => f.includes('Persona risk multiplier'))).toBe(true);
  });

  it('adds +15 asymmetry penalty when clause is one-sided', () => {
    const symmetrical = calculateRiskScore({
      clauseId: 'c-0001',
      heading: 'Indemnity',
      severity: 2,
      clauseType: 'indemnity',
      plan,
    });

    const asymmetrical = calculateRiskScore({
      clauseId: 'c-0002',
      heading: 'Indemnity',
      severity: 2,
      clauseType: 'indemnity',
      plan,
      asymmetry: { partyA: 'Licensor', partyB: 'Licensee' },
    });

    expect(asymmetrical.score).toBe(symmetrical.score + 15);
    expect(asymmetrical.contributingFactors.some((f) => f.includes('+15 One-sided'))).toBe(true);
  });

  it('deducts -10 mutuality credit when clause obligations apply equally to both parties', () => {
    const normal = calculateRiskScore({
      clauseId: 'c-0001',
      heading: 'Termination',
      severity: 2,
      clauseType: 'termination-convenience',
      plan,
      isMutual: false,
    });

    const mutual = calculateRiskScore({
      clauseId: 'c-0002',
      heading: 'Termination',
      severity: 2,
      clauseType: 'termination-convenience',
      plan,
      isMutual: true,
    });

    expect(mutual.score).toBe(normal.score - 10);
    expect(mutual.contributingFactors.some((f) => f.includes('-10 Mutual terms credit'))).toBe(true);
  });

  it('correctly categorizes scores into risk bands', () => {
    const standard = calculateRiskScore({
      clauseId: 'c-0001',
      heading: 'Headings',
      severity: 1,
      clauseType: 'governing-law',
      plan,
    });
    expect(standard.band).toBe('standard');

    const getAdvice = calculateRiskScore({
      clauseId: 'c-0004',
      heading: 'Deposit Forfeiture',
      severity: 4,
      clauseType: 'security-deposit',
      plan,
      asymmetry: { partyA: 'Licensor', partyB: 'Licensee' },
      isTimeBound: true,
      hasDeadline: true,
    });
    expect(getAdvice.band).toBe('get-advice');
    expect(getAdvice.score).toBeGreaterThanOrEqual(80);
  });
});
