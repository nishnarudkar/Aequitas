import { Clause, UserContext } from '@/types';
import { SYSTEM_PREAMBLE } from './system';

export interface ComparePromptInput {
  docATitle: string;
  docAClauses: Clause[];
  docBTitle: string;
  docBClauses: Clause[];
  context: UserContext;
  isBaseline?: boolean;
  nonce: string;
}

export function buildComparePrompt(input: ComparePromptInput): string {
  const { docATitle, docAClauses, docBTitle, docBClauses, context, isBaseline, nonce } = input;

  const docAText = docAClauses
    .map((c) => `[${c.id}] ${c.heading}: ${c.text}`)
    .join('\n\n');

  const docBText = docBClauses
    .map((c) => `[${c.id}] ${c.heading}: ${c.text}`)
    .join('\n\n');

  return `${SYSTEM_PREAMBLE}

TASK: Compare Doc A ("${docATitle}") against Doc B ("${docBTitle}" ${isBaseline ? '- Fair Baseline' : ''}) for a ${context.persona}.

DOCUMENT A:
<document id="${nonce}-A">
${docAText}
</document>

DOCUMENT B:
<document id="${nonce}-B">
${docBText}
</document>

Required Output Schema (JSON Only):
{
  "items": [
    {
      "clauseType": "ClauseType string",
      "title": "string",
      "docAPosition": "string",
      "docBPosition": "string",
      "betterForPersona": "docA" | "docB" | "neither" | "equal",
      "why": "string",
      "status": "docA-only" | "docB-only" | "different" | "similar"
    }
  ],
  "summary": "string"
}`;
}
