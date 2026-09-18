import { z } from 'zod';

export const PersonaSchema = z.enum([
  'tenant',
  'freelancer',
  'employee',
  'consumer',
  'borrower',
]);

export const JurisdictionSchema = z.enum([
  'MH',
  'DL',
  'KA',
  'TG',
  'WB',
  'OTHER',
]);

export const GoalSchema = z.enum([
  'understand',
  'decide',
  'negotiate',
  'dispute',
  'prepare-for-lawyer',
]);

export const DocumentTypeSchema = z.enum([
  'rental',
  'service-agreement',
  'employment',
  'privacy-policy',
  'loan',
  'other',
]);

export const ClauseTypeSchema = z.enum([
  'auto-renewal',
  'unilateral-amendment',
  'lock-in',
  'liquidated-damages',
  'indemnity',
  'liability-cap',
  'jurisdiction',
  'arbitration',
  'non-compete',
  'non-solicit',
  'ip-assignment',
  'confidentiality',
  'termination-convenience',
  'notice-period-asymmetry',
  'interest-late-fee',
  'security-deposit',
  'force-majeure',
  'waiver',
  'entire-agreement',
  'governing-law',
  'boilerplate',
  'custom',
]);

export const AnalyzerIdSchema = z.enum([
  'detectors',
  'clause-pass',
  'gaps-pass',
  'synthesis-pass',
]);

export const OutputIdSchema = z.enum([
  'summary',
  'obligations',
  'risks',
  'gaps',
  'checklist',
  'negotiation',
  'lawyer-brief',
]);

export const UserContextSchema = z.object({
  persona: PersonaSchema,
  jurisdiction: JurisdictionSchema,
  goal: GoalSchema,
  deadline: z.string().optional(),
  language: z.enum(['en', 'hi', 'mr']),
  readingLevel: z.enum(['simple', 'standard']),
  counterpartySigned: z.boolean().optional(),
  amountAtStake: z.number().nonnegative().optional(),
});

export const StatuteHintSchema = z.object({
  code: z.string(),
  title: z.string(),
  explanation: z.string(),
  section: z.string().optional(),
  disclaimer: z.string(),
});

export const LegalResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  contact: z.string(),
  url: z.string(),
  scope: z.string(),
});

export const EscalationDecisionSchema = z.object({
  triggered: z.boolean(),
  level: z.enum(['none', 'warning', 'critical']),
  triggers: z.array(z.string()),
  resources: z.array(LegalResourceSchema),
  rationale: z.string(),
});

export const AnalysisPlanSchema = z.object({
  documentType: DocumentTypeSchema,
  analyzers: z.array(AnalyzerIdSchema),
  priorityClauseTypes: z.array(ClauseTypeSchema),
  riskWeights: z.record(ClauseTypeSchema, z.number()),
  outputs: z.array(OutputIdSchema),
  tone: z.enum(['plain', 'plainest']),
  statuteHints: z.array(StatuteHintSchema),
  escalation: EscalationDecisionSchema,
  tokenBudget: z.number().positive(),
  rationale: z.array(z.string()),
});
