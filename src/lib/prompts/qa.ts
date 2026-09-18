import { Clause, UserContext } from '@/types';
import { SYSTEM_PREAMBLE } from './system';

export interface QAPromptInput {
  question: string;
  context: UserContext;
  retrievedClauses: Clause[];
  nonce: string;
}

export function buildQAPrompt(input: QAPromptInput): string {
  const { question, context, retrievedClauses, nonce } = input;

  const clausesFormatted = retrievedClauses
    .map((c) => `--- CLAUSE ID: ${c.id} ---\nHeading: ${c.heading}\nText:\n${c.text}`)
    .join('\n\n');

  return `${SYSTEM_PREAMBLE}

TASK: Answer the user question using ONLY the provided retrieved clauses.

USER QUESTION: "${question}"
USER PERSONA: ${context.persona}

RETRIEVED CLAUSES:
<document id="${nonce}">
${clausesFormatted || 'No relevant clauses found in text.'}
</document>

IMPORTANT MANDATORY CITATION RULE:
Every statement in your answer MUST cite its supporting clause using exact bracket tags like [c-0001].
If the question CANNOT be answered using the provided clauses, set isUnanswered to true, state clearly: "This document doesn't address that.", and provide a suggested question for their lawyer.

Required Output Schema (JSON Only):
{
  "answer": "string",
  "citations": ["string (e.g. c-0001)"],
  "isUnanswered": boolean,
  "suggestedLawyerQuestion": "string (optional)"
}`;
}
