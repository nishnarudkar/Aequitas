import { NextRequest, NextResponse } from 'next/server';
import { buildBM25Index, bm25Query } from '@/lib/bm25';
import { getLLMProvider, generateValidatedJSON } from '@/lib/llm';
import { buildComparePrompt } from '@/lib/prompts/compare';
import { generateNonce, sanitizeUserContent } from '@/lib/security/sanitize';
import { CompareRequestSchema, CompareResponseSchema } from '@/lib/schemas';
import { getBaselineForDocType } from '@/lib/analysis/baseline';
import type { Clause, CompareResponse, DocumentType } from '@/types';

/**
 * POST /api/compare
 *
 * Body: { docA: { title, clauses }, docB: { title, clauses } | null (use fair baseline), context, isBaseline? }
 *
 * Flow:
 *   1. Validate input
 *   2. If isBaseline, synthesise docB clauses from the fair baseline data
 *   3. Align clauses across docs by BM25 similarity (per-clause-type pairing)
 *   4. Prompt LLM with aligned pairs
 *   5. Return comparison table
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = CompareRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request payload.', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { docA, docB: rawDocB, context, isBaseline } = parseResult.data;

    // If isBaseline mode, replace docB with fair-baseline clauses
    const docB = isBaseline
      ? (() => {
          const baseline = getBaselineForDocType(context.persona === 'tenant' ? 'rental' :
            context.persona === 'freelancer' ? 'service-agreement' :
            context.persona === 'employee' ? 'employment' :
            context.persona === 'consumer' ? 'privacy-policy' :
            'loan' as DocumentType);
          const baselineClauses: Clause[] = baseline.fairClauses.map((fc, i) => ({
            id: `baseline-${String(i).padStart(4, '0')}`,
            heading: fc.title,
            text: fc.text,
            startOffset: 0,
            endOffset: fc.text.length,
          }));
          return { title: baseline.title, clauses: baselineClauses };
        })()
      : rawDocB;

    // Sanitize
    const nonce = generateNonce();
    const sanitizedDocAClauses: Clause[] = docA.clauses.map((c) => ({
      ...c,
      text: sanitizeUserContent(c.text, nonce),
    }));
    const sanitizedDocBClauses: Clause[] = docB.clauses.map((c) => ({
      ...c,
      text: sanitizeUserContent(c.text, nonce),
    }));

    // BM25-align: for each clause in docA, find the closest match in docB
    const docBIndex = buildBM25Index(sanitizedDocBClauses);
    const alignedDocAClauses: Clause[] = [];
    const alignedDocBClauses: Clause[] = [];

    for (const clauseA of sanitizedDocAClauses) {
      alignedDocAClauses.push(clauseA);
      const matches = bm25Query(docBIndex, `${clauseA.heading} ${clauseA.text}`, 1);
      alignedDocBClauses.push(
        matches.at(0) ?? {
          id: 'baseline-none',
          heading: clauseA.heading,
          text: 'Not present in this document.',
          startOffset: 0,
          endOffset: 0,
        }
      );
    }

    // Add clauses that are only in docB (present in B, absent in A)
    const aIndex = buildBM25Index(sanitizedDocAClauses);
    for (const clauseB of sanitizedDocBClauses) {
      const matchInA = bm25Query(aIndex, `${clauseB.heading} ${clauseB.text}`, 1);
      if (matchInA.length === 0) {
        alignedDocAClauses.push({
          id: 'a-none',
          heading: clauseB.heading,
          text: 'Not present in this document.',
          startOffset: 0,
          endOffset: 0,
        });
        alignedDocBClauses.push(clauseB);
      }
    }

    // Cap at 12 pairs to keep prompt within token budget
    const pairsToCompare = Math.min(alignedDocAClauses.length, 12);

    const prompt = buildComparePrompt({
      docATitle: docA.title,
      docAClauses: alignedDocAClauses.slice(0, pairsToCompare),
      docBTitle: docB.title,
      docBClauses: alignedDocBClauses.slice(0, pairsToCompare),
      context,
      isBaseline,
      nonce,
    });

    const provider = getLLMProvider();

    const fallback: CompareResponse = {
      items: alignedDocAClauses.slice(0, pairsToCompare).map((cA, i) => ({
        clauseType: 'custom',
        title: cA.heading,
        docAPosition: cA.text.slice(0, 100),
        docBPosition: alignedDocBClauses.at(i)?.text.slice(0, 100) ?? 'Not present.',
        betterForPersona: 'neither',
        why: 'Manual review required.',
        status: cA.id === 'a-none' ? 'docB-only' : alignedDocBClauses.at(i)?.id === 'baseline-none' ? 'docA-only' : 'different',
      })),
      summary: `Comparison of "${docA.title}" vs "${docB.title}" for ${context.persona}.`,
    };

    const result = await generateValidatedJSON(
      provider,
      { prompt, maxTokens: 2500 },
      CompareResponseSchema,
      fallback
    );

    return NextResponse.json(result.data, { status: 200 });
  } catch (error: any) {
    console.error('[/api/compare] error:', error?.message);
    return NextResponse.json(
      { error: 'Failed to run comparison. Please try again.' },
      { status: 500 }
    );
  }
}
