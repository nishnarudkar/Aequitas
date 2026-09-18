import { NextRequest, NextResponse } from 'next/server';
import { buildBM25Index, bm25Query } from '@/lib/bm25';
import { getLLMProvider, generateValidatedJSON } from '@/lib/llm';
import { buildQAPrompt } from '@/lib/prompts/qa';
import { generateNonce, sanitizeUserContent } from '@/lib/security/sanitize';
import { AskRequestSchema, AskResponseSchema } from '@/lib/schemas';
import type { AskResponse } from '@/types';

/**
 * POST /api/ask
 *
 * Body: { question: string, context: UserContext, clauses: Clause[] }
 *
 * Flow:
 *   1. Validate + sanitize input
 *   2. Build BM25 index from clauses (or use pre-built if provided)
 *   3. Retrieve top 6 clauses relevant to the question
 *   4. Prompt LLM with ONLY those clauses (never the full document)
 *   5. Validate every citation ID in the response against the actual clause map
 *   6. Strip any hallucinated IDs
 *   7. Return AskResponse
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = AskRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request payload.', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { question, context, clauses } = parseResult.data;

    // Safety: refuse abuse/misuse questions (intent check)
    const abusePhrases = [
      'draft a backdated',
      'forge',
      'fake notice',
      'fabricate',
      'make it look like',
      'help me cheat',
      'deceive',
    ];
    const qLower = question.toLowerCase();
    if (abusePhrases.some((p) => qLower.includes(p))) {
      return NextResponse.json(
        {
          answer:
            'I cannot help draft documents intended to deceive or mislead. Please consult a legal professional for legitimate drafting needs.',
          citations: [],
          isUnanswered: true,
        } satisfies AskResponse,
        { status: 200 }
      );
    }

    // 1. Nonce + sanitize
    const nonce = generateNonce();
    const sanitizedQuestion = sanitizeUserContent(question, nonce);

    // 2. Build BM25 index from provided clauses
    const index = buildBM25Index(clauses);

    // 3. Retrieve top 6 most-relevant clauses
    const retrievedClauses = bm25Query(index, sanitizedQuestion, 6);

    // Build a set of valid clause IDs for citation validation
    const validClauseIds = new Set(clauses.map((c) => c.id));

    // 4. Build Q&A prompt — only retrieved clauses, never full document
    const prompt = buildQAPrompt({
      question: sanitizedQuestion,
      context,
      retrievedClauses,
      nonce,
    });

    const provider = getLLMProvider();

    // Fallback for when retrieval finds nothing useful
    const fallback: AskResponse =
      retrievedClauses.length === 0
        ? {
            answer:
              "This document doesn't appear to address that question. The relevant topic may not be covered in this contract.",
            citations: [],
            isUnanswered: true,
            suggestedLawyerQuestion: `Ask your lawyer: "${question}"`,
          }
        : {
            answer: `Based on the retrieved clauses, here is what the document says about "${question}".`,
            citations: retrievedClauses.slice(0, 2).map((c) => c.id),
            isUnanswered: false,
          };

    // 5. Generate validated JSON from LLM
    const result = await generateValidatedJSON(
      provider,
      { prompt, maxTokens: 800 },
      AskResponseSchema,
      fallback
    );

    // 6. Strip hallucinated citation IDs (server-side defence)
    const sanitizedResponse: AskResponse = {
      ...result.data,
      citations: result.data.citations.filter((id) => validClauseIds.has(id)),
    };

    return NextResponse.json(sanitizedResponse, { status: 200 });
  } catch (error: any) {
    console.error('[/api/ask] error:', error?.message);
    return NextResponse.json(
      { error: 'Failed to answer question. Please try again.' },
      { status: 500 }
    );
  }
}
