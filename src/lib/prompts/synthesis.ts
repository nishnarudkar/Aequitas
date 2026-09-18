import { AnalysisPlan, SingleClauseAnalysis, UserContext } from '@/types';
import { SYSTEM_PREAMBLE } from './system';

export interface SynthesisPromptInput {
  context: UserContext;
  plan: AnalysisPlan;
  clauseAnalyses: SingleClauseAnalysis[];
  nonce: string;
  documentSummarySnippet: string;
}

export function buildSynthesisPrompt(input: SynthesisPromptInput): string {
  const { context, plan, clauseAnalyses, nonce, documentSummarySnippet } = input;

  const clauseSummaries = clauseAnalyses
    .map((c) => `- Clause ${c.clauseId} (${c.type}): Severity ${c.severity}/4. Meaning: ${c.plainMeaning}`)
    .join('\n');

  return `${SYSTEM_PREAMBLE}

TASK: Perform Pass C Synthesis. Create a comprehensive, persona-tuned synthesis output for a ${context.persona} in ${context.jurisdiction} with goal '${context.goal}'.

ANALYSIS PLAN RATIONALE:
${plan.rationale.join('\n')}

ANALYZED CLAUSES SUMMARY:
${clauseSummaries}

<document id="${nonce}">
${documentSummarySnippet}
</document>

Required Output Schema (JSON Only):
{
  "summary": "string (plain language summary of agreement at 8th grade reading level)",
  "topRisks": [
    {
      "clauseId": "string",
      "heading": "string",
      "score": number (0..100),
      "severity": number (0..4),
      "band": "standard" | "worth-a-look" | "negotiate" | "get-advice",
      "explanation": "string",
      "contributingFactors": ["string"]
    }
  ],
  "obligations": [
    {
      "party": "user" | "counterparty" | "both",
      "obligation": "string",
      "deadlineOrTrigger": "string (optional)",
      "clauseId": "string (optional)"
    }
  ],
  "checklist": [
    {
      "id": "string",
      "category": "string",
      "action": "string",
      "priority": "high" | "medium" | "low",
      "timeline": "string (optional)"
    }
  ],
  "negotiationAsks": [
    {
      "id": "string",
      "targetClauseId": "string (optional)",
      "currentIssue": "string",
      "proposedWording": "string",
      "rationale": "string"
    }
  ],
  "lawyerBrief": {
    "summary": "string",
    "keyConcerns": ["string"],
    "questionsForLawyer": ["string"],
    "documentChecklist": ["string"]
  }
}`;
}
