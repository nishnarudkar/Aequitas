/**
 * BM25 (Okapi BM25) retrieval — ~80 lines, fully in-process, zero dependencies.
 *
 * Deliberate design choice documented in README:
 *   We use BM25 instead of a vector-embedding service to keep the repo small,
 *   remove network dependencies, and keep per-question latency under 5 ms.
 *   For document sizes ≤ 300k chars (our hard upload cap) BM25 quality is
 *   excellent for clause-retrieval tasks.
 */

import type { Clause } from '@/types';

// ── BM25 Hyper-parameters ────────────────────────────────────────────────────
const K1 = 1.5; // term-frequency saturation
const B = 0.75; // length normalisation factor

// ── Tokenisation ─────────────────────────────────────────────────────────────

/** Very small stop-word list for legal English. */
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'in', 'of', 'to', 'for', 'on', 'is',
  'are', 'be', 'was', 'will', 'shall', 'may', 'with', 'by', 'from',
  'at', 'as', 'this', 'that', 'such', 'any', 'all', 'not', 'no',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

// ── Index ─────────────────────────────────────────────────────────────────────

export interface BM25Index {
  /** Number of documents (clauses) in the index. */
  N: number;
  /** Average document length in tokens. */
  avgDL: number;
  /** Inverted index: term → Map<clauseId, tf> */
  ii: Map<string, Map<string, number>>;
  /** Clause lengths (token count) keyed by clauseId. */
  dl: Map<string, number>;
  /** df (document frequency) per term. */
  df: Map<string, number>;
  /** Original clauses for result retrieval. */
  clauses: Clause[];
}

/**
 * Build a BM25 index from a list of clauses.
 * Build once per document; reuse for all Q&A questions in that session.
 */
export function buildBM25Index(clauses: Clause[]): BM25Index {
  const ii = new Map<string, Map<string, number>>();
  const dl = new Map<string, number>();
  const df = new Map<string, number>();

  for (const clause of clauses) {
    const tokens = tokenize(`${clause.heading} ${clause.text}`);
    dl.set(clause.id, tokens.length);

    const tf = new Map<string, number>();
    for (const token of tokens) {
      tf.set(token, (tf.get(token) ?? 0) + 1);
    }

    for (const [term, freq] of tf) {
      if (!ii.has(term)) ii.set(term, new Map());
      ii.get(term)!.set(clause.id, freq);
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }

  const totalTokens = Array.from(dl.values()).reduce((s, v) => s + v, 0);
  const avgDL = clauses.length > 0 ? totalTokens / clauses.length : 0;

  return { N: clauses.length, avgDL, ii, dl, df, clauses };
}

/**
 * Retrieve top-k clause IDs ranked by BM25 score for a query string.
 * Returns an empty array when the index is empty or the query is empty.
 */
export function bm25Query(
  index: BM25Index,
  query: string,
  topK = 6,
): Clause[] {
  if (index.N === 0 || !query.trim()) return [];

  const queryTokens = tokenize(query);
  const scores = new Map<string, number>();

  for (const term of queryTokens) {
    const postings = index.ii.get(term);
    if (!postings) continue;

    const dfTerm = index.df.get(term) ?? 0;
    // IDF — add-1 smoothing so a term present in all docs still contributes
    const idf = Math.log((index.N - dfTerm + 0.5) / (dfTerm + 0.5) + 1);

    for (const [clauseId, tf] of postings) {
      const docLen = index.dl.get(clauseId) ?? 0;
      const normTF =
        (tf * (K1 + 1)) /
        (tf + K1 * (1 - B + B * (docLen / (index.avgDL || 1))));
      scores.set(clauseId, (scores.get(clauseId) ?? 0) + idf * normTF);
    }
  }

  // Sort by score descending and return the top-k Clause objects
  const ranked = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([id]) => index.clauses.find((c) => c.id === id)!)
    .filter(Boolean);

  return ranked;
}
