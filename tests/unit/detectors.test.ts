import { describe, it, expect } from 'vitest';
import { detectClauseTypes } from '../../src/lib/analysis/detectors';

describe('Deterministic Clause Detectors Unit Tests', () => {
  it('detects auto-renewal clause', () => {
    const text = 'This agreement shall automatically renew for successive terms of one year.';
    const hits = detectClauseTypes(text);

    expect(hits.some((h) => h.clauseType === 'auto-renewal')).toBe(true);
  });

  it('detects unilateral amendment clause', () => {
    const text = 'The company reserves the right to modify these terms at its sole discretion without prior notice.';
    const hits = detectClauseTypes(text);

    expect(hits.some((h) => h.clauseType === 'unilateral-amendment')).toBe(true);
  });

  it('detects lock-in period clause', () => {
    const text = 'There shall be a mandatory lock-in period of 6 months during which neither party may terminate.';
    const hits = detectClauseTypes(text);

    expect(hits.some((h) => h.clauseType === 'lock-in')).toBe(true);
  });

  it('detects liquidated damages / penalty clause', () => {
    const text = 'In case of early breach, employee shall pay liquidated damages of INR 2,00,000 as a training bond.';
    const hits = detectClauseTypes(text);

    expect(hits.some((h) => h.clauseType === 'liquidated-damages')).toBe(true);
  });

  it('detects indemnity and structural asymmetry', () => {
    const text = 'Licensee shall indemnify and hold harmless the Licensor against all third-party claims.';
    const hits = detectClauseTypes(text);
    const indHit = hits.find((h) => h.clauseType === 'indemnity');

    expect(indHit).toBeDefined();
    expect(indHit?.asymmetry).toBeDefined();
    expect(indHit?.asymmetry?.partyA).toContain('Counterparty');
  });

  it('detects limitation of liability cap', () => {
    const text = 'The maximum aggregate liability under this agreement shall not exceed the total fees paid.';
    const hits = detectClauseTypes(text);

    expect(hits.some((h) => h.clauseType === 'liability-cap')).toBe(true);
  });

  it('detects exclusive jurisdiction clause', () => {
    const text = 'Disputes shall be subject to the exclusive jurisdiction of the courts at Mumbai.';
    const hits = detectClauseTypes(text);

    expect(hits.some((h) => h.clauseType === 'jurisdiction')).toBe(true);
  });

  it('detects arbitration clause', () => {
    const text = 'Any dispute shall be referred to arbitration before a sole arbitrator in Bengaluru.';
    const hits = detectClauseTypes(text);

    expect(hits.some((h) => h.clauseType === 'arbitration')).toBe(true);
  });

  it('detects non-compete clause', () => {
    const text = 'The employee shall not engage in any competing business for 12 months post termination.';
    const hits = detectClauseTypes(text);

    expect(hits.some((h) => h.clauseType === 'non-compete')).toBe(true);
  });

  it('detects non-solicit clause', () => {
    const text = 'Contractor shall not solicit any employee or customer of the Client.';
    const hits = detectClauseTypes(text);

    expect(hits.some((h) => h.clauseType === 'non-solicit')).toBe(true);
  });

  it('detects IP assignment clause and creation timing asymmetry', () => {
    const text = 'The contractor agrees to assign all intellectual property upon creation as work made for hire.';
    const hits = detectClauseTypes(text);
    const ipHit = hits.find((h) => h.clauseType === 'ip-assignment');

    expect(ipHit).toBeDefined();
    expect(ipHit?.asymmetry).toBeDefined();
  });

  it('detects confidentiality clause', () => {
    const text = 'Both parties shall maintain strict confidentiality of all proprietary information.';
    const hits = detectClauseTypes(text);

    expect(hits.some((h) => h.clauseType === 'confidentiality')).toBe(true);
  });

  it('detects termination for convenience', () => {
    const text = 'Either party may terminate this agreement without cause by giving 30 days notice.';
    const hits = detectClauseTypes(text);

    expect(hits.some((h) => h.clauseType === 'termination-convenience')).toBe(true);
  });

  it('detects interest and late fees', () => {
    const text = 'Late payment shall accrue penal interest at 2% per month on overdue invoices.';
    const hits = detectClauseTypes(text);

    expect(hits.some((h) => h.clauseType === 'interest-late-fee')).toBe(true);
  });

  it('detects security deposit terms', () => {
    const text = 'The security deposit shall be refunded at the sole discretion of the licensor.';
    const hits = detectClauseTypes(text);

    expect(hits.some((h) => h.clauseType === 'security-deposit')).toBe(true);
  });

  it('detects force majeure clause', () => {
    const text = 'Neither party shall be liable for delay due to an act of God or force majeure event.';
    const hits = detectClauseTypes(text);

    expect(hits.some((h) => h.clauseType === 'force-majeure')).toBe(true);
  });

  it('detects waiver clause', () => {
    const text = 'Failure by either party to enforce any right shall not constitute a waiver of rights.';
    const hits = detectClauseTypes(text);

    expect(hits.some((h) => h.clauseType === 'waiver')).toBe(true);
  });

  it('detects entire agreement clause', () => {
    const text = 'This document constitutes the entire agreement and supersedes all prior oral representations.';
    const hits = detectClauseTypes(text);

    expect(hits.some((h) => h.clauseType === 'entire-agreement')).toBe(true);
  });

  it('detects governing law clause', () => {
    const text = 'This agreement shall be governed by and construed in accordance with the laws of India.';
    const hits = detectClauseTypes(text);

    expect(hits.some((h) => h.clauseType === 'governing-law')).toBe(true);
  });
});
