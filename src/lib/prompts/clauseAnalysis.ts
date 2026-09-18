import { Clause, DetectorHit, Persona } from '@/types';
import { SYSTEM_PREAMBLE } from './system';

export interface ClauseAnalysisPromptInput {
  clauses: Clause[];
  detectorHits: DetectorHit[];
  persona: Persona;
  tone: 'plain' | 'plainest';
  nonce: string;
}

export function buildClauseAnalysisPrompt(input: ClauseAnalysisPromptInput): string {
  const { clauses, detectorHits, persona, tone, nonce } = input;

  const clausesFormatted = clauses
    .map((c) => `--- CLAUSE ID: ${c.id} ---\nHeading: ${c.heading}\nText:\n${c.text}`)
    .join('\n\n');

  const hitsFormatted = detectorHits
    .map((h) => `- ${h.clauseType}: ${h.evidence}${h.asymmetry ? ` (Asymmetry: ${h.asymmetry.partyA} vs ${h.asymmetry.partyB})` : ''}`)
    .join('\n');

  return `${SYSTEM_PREAMBLE}

TASK: Perform Pass A Clause-by-Clause analysis for a ${persona} reading the document in ${tone} tone.

DETERMINISTIC DETECTOR HITS FOR THIS BATCH:
${hitsFormatted || 'None'}

<document id="${nonce}">
${clausesFormatted}
</document>

Required Output Schema (JSON Only):
{
  "results": [
    {
      "clauseId": "string (matching clause id)",
      "plainMeaning": "string (<= 2 short sentences at 8th grade reading level)",
      "whoIsObligated": "string (e.g. Licensee / Tenant / Both)",
      "type": "ClauseType string",
      "severity": number (0 to 4),
      "whyItMatters": "string (why this affects the ${persona})",
      "watchFor": "string (potential pitfalls or risks)",
      "suggestedAsk": "string (optional redline ask)",
      "confidence": number (0.0 to 1.0)
    }
  ]
}`;
}
