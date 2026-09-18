import { NextRequest, NextResponse } from 'next/server';
import { createAnalysisPlan } from '@/lib/context/router';
import { detectClauseTypes } from '@/lib/analysis/detectors';
import { calculateRiskScore } from '@/lib/analysis/risk';
import { getBaselineForDocType } from '@/lib/analysis/baseline';
import { getLLMProvider, generateValidatedJSON } from '@/lib/llm';
import {
  buildClauseAnalysisPrompt,
  buildMissingClausesPrompt,
  buildSynthesisPrompt,
} from '@/lib/prompts';
import { generateNonce, sanitizeUserContent } from '@/lib/security/sanitize';
import {
  BatchedClauseAnalysisSchema,
  PassBMissingClausesSchema,
  SynthesisResultSchema,
  UserContextSchema,
} from '@/lib/schemas';
import {
  AnalyzeResponse,
  Clause,
  DocumentType,
  MissingClause,
  SingleClauseAnalysis,
  SynthesisResult,
} from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, clauses, context: rawContext, documentType: overrideDocType } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing required string field "text".' },
        { status: 400 }
      );
    }

    const contextResult = UserContextSchema.safeParse(rawContext);
    if (!contextResult.success) {
      return NextResponse.json(
        { error: 'Invalid UserContext payload.', details: contextResult.error.format() },
        { status: 400 }
      );
    }
    const context = contextResult.data;

    const nonce = generateNonce();
    const sanitizedText = sanitizeUserContent(text, nonce);
    const inputClauses: Clause[] = clauses || [];

    // 1. Create Deterministic Analysis Plan
    const plan = createAnalysisPlan(context, overrideDocType as DocumentType, sanitizedText);

    // 2. Run Deterministic Detectors
    const detectorHits = detectClauseTypes(sanitizedText);

    // 3. Initialize LLM Provider
    const provider = getLLMProvider();

    // 4. Pass A: Clause Analysis (Batched ~6 per call)
    const singleAnalyses: SingleClauseAnalysis[] = [];
    const batchSize = 6;

    for (let i = 0; i < inputClauses.length; i += batchSize) {
      const batchClauses = inputClauses.slice(i, i + batchSize);
      const prompt = buildClauseAnalysisPrompt({
        clauses: batchClauses,
        detectorHits,
        persona: context.persona,
        tone: plan.tone,
        nonce,
      });

      const fallbackBatch: { results: SingleClauseAnalysis[] } = {
        results: batchClauses.map((c) => ({
          clauseId: c.id,
          plainMeaning: `${c.heading}: ${c.text.slice(0, 100)}...`,
          whoIsObligated: 'Obligated Party',
          type: 'custom',
          severity: 1,
          whyItMatters: 'Requires careful reading.',
          watchFor: 'Standard terms.',
          confidence: 0.8,
        })),
      };

      const res = await generateValidatedJSON(
        provider,
        { prompt, maxTokens: 2000 },
        BatchedClauseAnalysisSchema,
        fallbackBatch
      );

      singleAnalyses.push(...res.data.results);
    }

    // Map single analyses back to map for quick lookup
    const analysisMap = new Map<string, SingleClauseAnalysis>();
    singleAnalyses.forEach((sa) => analysisMap.set(sa.clauseId, sa));

    // 5. Pass B: Missing Clauses Pass
    const detectedTypes = Array.from(new Set(detectorHits.map((h) => h.clauseType)));
    const snippet = sanitizedText.slice(0, 3000);
    const missingPrompt = buildMissingClausesPrompt({
      detectedTypes,
      documentType: plan.documentType,
      persona: context.persona,
      nonce,
      documentTextSnippet: snippet,
    });

    const baseline = getBaselineForDocType(plan.documentType);
    const fallbackMissing: { missingClauses: MissingClause[] } = {
      missingClauses: baseline.fairClauses
        .filter((fc) => !detectedTypes.includes(fc.type as any))
        .map((fc) => ({
          type: fc.type as any,
          title: fc.title,
          explanation: `Contract lacks standard ${fc.title} provisions.`,
          importance: fc.importance,
          suggestedClause: fc.text,
        })),
    };

    const missingRes = await generateValidatedJSON(
      provider,
      { prompt: missingPrompt, maxTokens: 1500 },
      PassBMissingClausesSchema,
      fallbackMissing
    );

    // 6. Calculate Explainable Risk Scores for Top Risks
    const scoredRisks = inputClauses.map((c) => {
      const sa = analysisMap.get(c.id);
      const hit = detectorHits.find((h) => h.evidence.includes(c.heading) || c.text.includes(h.evidence));
      const severity = sa ? sa.severity : 1;
      const clauseType = sa ? sa.type : (hit ? hit.clauseType : 'custom');

      return calculateRiskScore({
        clauseId: c.id,
        heading: c.heading,
        severity,
        clauseType,
        plan,
        asymmetry: hit?.asymmetry,
        isMutual: !hit?.asymmetry,
        isTimeBound: Boolean(context.deadline),
        hasDeadline: Boolean(context.deadline),
      });
    });

    const topRisks = scoredRisks.sort((a, b) => b.score - a.score).slice(0, 5);

    // 7. Pass C: Synthesis Pass
    const synthesisPrompt = buildSynthesisPrompt({
      context,
      plan,
      clauseAnalyses: singleAnalyses,
      nonce,
      documentSummarySnippet: snippet,
    });

    const fallbackSynthesis: SynthesisResult = {
      summary: `Analysis of ${plan.documentType} contract for ${context.persona} in ${context.jurisdiction}.`,
      topRisks,
      obligations: inputClauses.slice(0, 3).map((c) => ({
        party: 'user',
        obligation: `Comply with terms in ${c.heading}`,
        clauseId: c.id,
      })),
      checklist: [
        {
          id: 'chk-1',
          category: 'Review',
          action: 'Verify all financial obligations and notice deadlines.',
          priority: 'high',
        },
      ],
      negotiationAsks: topRisks
        .filter((r) => r.score >= 60)
        .map((r, idx) => ({
          id: `neg-${idx + 1}`,
          targetClauseId: r.clauseId,
          currentIssue: `High risk score (${r.score}/100) on ${r.heading}`,
          proposedWording: `Request mutual terms for ${r.heading}`,
          rationale: r.explanation,
        })),
      lawyerBrief: {
        summary: `Document brief for ${context.persona} reviewing ${plan.documentType}.`,
        keyConcerns: topRisks.map((r) => `${r.heading}: ${r.explanation}`),
        questionsForLawyer: [
          `Are the clauses in ${topRisks[0]?.heading || 'this contract'} standard under local law?`,
        ],
        documentChecklist: ['Signed copy of agreement', 'Identity proof'],
      },
    };

    const synthRes = await generateValidatedJSON(
      provider,
      { prompt: synthesisPrompt, maxTokens: 3500 },
      SynthesisResultSchema,
      fallbackSynthesis
    );

    const responsePayload: AnalyzeResponse = {
      plan,
      synthesis: synthRes.data,
      missingClauses: missingRes.data.missingClauses,
      clauses: inputClauses,
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error: any) {
    console.error('Analyze API route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to complete analysis.' },
      { status: 500 }
    );
  }
}
