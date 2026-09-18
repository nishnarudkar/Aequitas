import { z } from 'zod';
import { ClauseTypeSchema } from './context';

export const ClauseSchema = z.object({
  id: z.string(),
  heading: z.string(),
  text: z.string(),
  startOffset: z.number().nonnegative(),
  endOffset: z.number().nonnegative(),
  pageHint: z.number().positive().optional(),
});

export const DetectorHitSchema = z.object({
  clauseType: ClauseTypeSchema,
  matched: z.boolean(),
  evidence: z.string(),
  asymmetry: z
    .object({
      partyA: z.string(),
      partyB: z.string(),
    })
    .optional(),
});

export const SingleClauseAnalysisSchema = z.object({
  clauseId: z.string(),
  plainMeaning: z.string(),
  whoIsObligated: z.string(),
  type: ClauseTypeSchema,
  severity: z.number().min(0).max(4),
  whyItMatters: z.string(),
  watchFor: z.string(),
  suggestedAsk: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

export const BatchedClauseAnalysisSchema = z.object({
  results: z.array(SingleClauseAnalysisSchema),
});
