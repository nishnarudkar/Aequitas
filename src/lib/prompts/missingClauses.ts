import { ClauseType, DocumentType, Persona } from '@/types';
import { SYSTEM_PREAMBLE } from './system';

export interface MissingClausesPromptInput {
  detectedTypes: ClauseType[];
  documentType: DocumentType;
  persona: Persona;
  nonce: string;
  documentTextSnippet: string;
}

export function buildMissingClausesPrompt(input: MissingClausesPromptInput): string {
  const { detectedTypes, documentType, persona, nonce, documentTextSnippet } = input;

  return `${SYSTEM_PREAMBLE}

TASK: Perform Pass B Missing Clauses Analysis.
Identify standard protective terms that are MISSING from this ${documentType} contract which would hurt a ${persona}.

DETECTED CLAUSE TYPES PRESENT IN CONTRACT:
${detectedTypes.join(', ') || 'None'}

<document id="${nonce}">
${documentTextSnippet}
</document>

Required Output Schema (JSON Only):
{
  "missingClauses": [
    {
      "type": "ClauseType string",
      "title": "string (name of missing clause)",
      "explanation": "string (why missing this clause exposes ${persona} to risk)",
      "importance": "high" | "medium" | "low",
      "suggestedClause": "string (fair market clause wording to request)"
    }
  ]
}`;
}
