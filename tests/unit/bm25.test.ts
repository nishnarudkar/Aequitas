import { describe, it, expect } from 'vitest';
import { buildBM25Index, bm25Query } from '@/lib/bm25';
import type { Clause } from '@/types';

// ── Fixture corpus ────────────────────────────────────────────────────────────

function makeClause(id: string, heading: string, text: string): Clause {
  return { id, heading, text, startOffset: 0, endOffset: text.length };
}

const CORPUS: Clause[] = [
  makeClause(
    'c-0001',
    'Security Deposit',
    'The Licensee shall pay a security deposit of INR 50,000 upon execution of this agreement. The deposit shall be refunded within 7 days of vacating the premises after deduction of damages.'
  ),
  makeClause(
    'c-0002',
    'Monthly Rent',
    'The monthly rent is INR 25,000 payable on or before the 5th day of each calendar month. Late payment attracts a penalty of 2% per month on the outstanding amount.'
  ),
  makeClause(
    'c-0003',
    'Lock-in Period',
    'The Licensee agrees to a lock-in period of 3 months. Early termination within this lock-in period shall forfeit the security deposit in full.'
  ),
  makeClause(
    'c-0004',
    'Notice Period',
    'Either party may terminate this agreement by giving 30 days prior written notice. The Licensor may terminate immediately on breach of payment obligations.'
  ),
  makeClause(
    'c-0005',
    'Maintenance Charges',
    'The Licensee shall bear all electricity, water, and society maintenance charges monthly. The Licensor is responsible for structural repairs only.'
  ),
  makeClause(
    'c-0006',
    'Entry and Inspection',
    'The Licensor reserves the right to enter the premises after giving 24 hours written notice. This right may be exercised during reasonable hours only.'
  ),
  makeClause(
    'c-0007',
    'Subletting',
    'The Licensee shall not sublet, transfer, or otherwise assign this agreement without prior written consent of the Licensor.'
  ),
  makeClause(
    'c-0008',
    'Pets Policy',
    'Pets are not permitted on the premises without written approval. Unapproved pets will be grounds for immediate termination of the agreement.'
  ),
];

// ── Test: empty index / empty query ──────────────────────────────────────────

describe('BM25 edge cases', () => {
  it('returns empty array for empty clause list', () => {
    const idx = buildBM25Index([]);
    expect(bm25Query(idx, 'deposit')).toEqual([]);
  });

  it('returns empty array for empty query string', () => {
    const idx = buildBM25Index(CORPUS);
    expect(bm25Query(idx, '')).toEqual([]);
  });

  it('returns empty array for whitespace-only query', () => {
    const idx = buildBM25Index(CORPUS);
    expect(bm25Query(idx, '   ')).toEqual([]);
  });
});

// ── Test: ranking sanity ─────────────────────────────────────────────────────

describe('BM25 ranking', () => {
  const idx = buildBM25Index(CORPUS);

  it('ranks "deposit refund" — c-0001 must be #1', () => {
    const results = bm25Query(idx, 'deposit refund', 6);
    expect(results.at(0)?.id).toBe('c-0001');
  });

  it('ranks "monthly rent payment penalty" — c-0002 must be #1', () => {
    const results = bm25Query(idx, 'monthly rent payment penalty', 6);
    expect(results.at(0)?.id).toBe('c-0002');
  });

  it('ranks "lock-in early termination" — c-0003 must appear in top 2', () => {
    const results = bm25Query(idx, 'lock in early termination forfeit', 6);
    const topIds = results.slice(0, 2).map((c) => c.id);
    expect(topIds).toContain('c-0003');
  });

  it('ranks "notice period termination" — c-0004 must appear in top 2', () => {
    const results = bm25Query(idx, 'notice period terminate written', 6);
    const topIds = results.slice(0, 2).map((c) => c.id);
    expect(topIds).toContain('c-0004');
  });

  it('ranks "sublet assign transfer" — c-0007 must be #1', () => {
    const results = bm25Query(idx, 'sublet assign transfer', 6);
    expect(results.at(0)?.id).toBe('c-0007');
  });

  it('ranks "pets animal permission" — c-0008 must be #1', () => {
    const results = bm25Query(idx, 'pets animal permission approved', 6);
    expect(results.at(0)?.id).toBe('c-0008');
  });

  it('returns at most topK results', () => {
    const results = bm25Query(idx, 'clause agreement payment', 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('returns full clause objects with heading and text', () => {
    const results = bm25Query(idx, 'deposit', 1);
    const first = results.at(0);
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('heading');
    expect(first).toHaveProperty('text');
  });

  it('query matching all clauses returns up to topK results', () => {
    // "agreement" appears in every fixture — should still return at most 6
    const results = bm25Query(idx, 'agreement', 6);
    expect(results.length).toBeLessThanOrEqual(6);
    expect(results.length).toBeGreaterThan(0);
  });

  it('identical IDF: returns results without duplicates', () => {
    const results = bm25Query(idx, 'premises', 6);
    const ids = results.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });
});

// ── Test: index metadata ──────────────────────────────────────────────────────

describe('BM25 index structure', () => {
  it('stores N equal to number of clauses', () => {
    const idx = buildBM25Index(CORPUS);
    expect(idx.N).toBe(CORPUS.length);
  });

  it('computes avgDL > 0 for non-empty corpus', () => {
    const idx = buildBM25Index(CORPUS);
    expect(idx.avgDL).toBeGreaterThan(0);
  });

  it('stores clauses reference unchanged', () => {
    const idx = buildBM25Index(CORPUS);
    expect(idx.clauses).toHaveLength(CORPUS.length);
    expect(idx.clauses.at(0)?.id).toBe(CORPUS.at(0)?.id);
  });
});
