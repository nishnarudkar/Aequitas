import { z } from 'zod';
import { ClauseTypeSchema, UserContextSchema, AnalysisPlanSchema } from './context';
import { ClauseSchema } from './clause';

export const MissingClauseSchema = z.object({
  type: ClauseTypeSchema,
  title: z.string(),
  explanation: z.string(),
  importance: z.enum(['high', 'medium', 'low']),
  suggestedClause: z.string().optional(),
});

export const PassBMissingClausesSchema = z.object({
  missingClauses: z.array(MissingClauseSchema),
});

export const RiskBandSchema = z.enum([
  'standard',
  'worth-a-look',
  'negotiate',
  'get-advice',
]);

export const ScoredRiskSchema = z.object({
  clauseId: z.string(),
  heading: z.string(),
  score: z.number().min(0).max(100),
  severity: z.number().min(0).max(4),
  band: RiskBandSchema,
  explanation: z.string(),
  contributingFactors: z.array(z.string()),
});

export const ObligationSchema = z.object({
  party: z.enum(['user', 'counterparty', 'both']),
  obligation: z.string(),
  deadlineOrTrigger: z.string().optional(),
  clauseId: z.string().optional(),
});

export const ActionItemSchema = z.object({
  id: z.string(),
  category: z.string(),
  action: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  timeline: z.string().optional(),
});

export const NegotiationAskSchema = z.object({
  id: z.string(),
  targetClauseId: z.string().optional(),
  currentIssue: z.string(),
  proposedWording: z.string(),
  rationale: z.string(),
});

export const LawyerBriefSchema = z.object({
  summary: z.string(),
  keyConcerns: z.array(z.string()),
  questionsForLawyer: z.array(z.string()),
  documentChecklist: z.array(z.string()),
});

export const SynthesisResultSchema = z.object({
  summary: z.string(),
  topRisks: z.array(ScoredRiskSchema),
  obligations: z.array(ObligationSchema),
  checklist: z.array(ActionItemSchema),
  negotiationAsks: z.array(NegotiationAskSchema),
  lawyerBrief: LawyerBriefSchema,
});

export const AskRequestSchema = z.object({
  question: z.string().min(1),
  context: UserContextSchema,
  documentId: z.string().optional(),
  clauses: z.array(ClauseSchema),
});

export const AskResponseSchema = z.object({
  answer: z.string(),
  citations: z.array(z.string()),
  isUnanswered: z.boolean(),
  suggestedLawyerQuestion: z.string().optional(),
});

export const CompareItemSchema = z.object({
  clauseType: ClauseTypeSchema,
  title: z.string(),
  docAPosition: z.string(),
  docBPosition: z.string(),
  betterForPersona: z.enum(['docA', 'docB', 'neither', 'equal']),
  why: z.string(),
  status: z.enum(['docA-only', 'docB-only', 'different', 'similar']),
});

export const CompareRequestSchema = z.object({
  docA: z.object({
    title: z.string(),
    clauses: z.array(ClauseSchema),
  }),
  docB: z.object({
    title: z.string(),
    clauses: z.array(ClauseSchema),
  }),
  context: UserContextSchema,
  isBaseline: z.boolean().optional(),
});

export const CompareResponseSchema = z.object({
  items: z.array(CompareItemSchema),
  summary: z.string(),
});

export const ParseResponseSchema = z.object({
  documentId: z.string(),
  detectedType: z.string(),
  confidence: z.number(),
  pageCount: z.number().optional(),
  wordCount: z.number(),
  clauses: z.array(ClauseSchema),
  isScanned: z.boolean(),
});

export const AnalyzeResponseSchema = z.object({
  plan: AnalysisPlanSchema,
  synthesis: SynthesisResultSchema,
  missingClauses: z.array(MissingClauseSchema),
  clauses: z.array(ClauseSchema),
});
