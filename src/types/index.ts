import { z } from 'zod';
import {
  PersonaSchema,
  JurisdictionSchema,
  GoalSchema,
  DocumentTypeSchema,
  ClauseTypeSchema,
  AnalyzerIdSchema,
  OutputIdSchema,
  UserContextSchema,
  StatuteHintSchema,
  LegalResourceSchema,
  EscalationDecisionSchema,
  AnalysisPlanSchema,
} from '@/lib/schemas/context';
import {
  ClauseSchema,
  DetectorHitSchema,
  SingleClauseAnalysisSchema,
  BatchedClauseAnalysisSchema,
} from '@/lib/schemas/clause';
import {
  MissingClauseSchema,
  PassBMissingClausesSchema,
  RiskBandSchema,
  ScoredRiskSchema,
  ObligationSchema,
  ActionItemSchema,
  NegotiationAskSchema,
  LawyerBriefSchema,
  SynthesisResultSchema,
  AskRequestSchema,
  AskResponseSchema,
  CompareItemSchema,
  CompareRequestSchema,
  CompareResponseSchema,
  ParseResponseSchema,
  AnalyzeResponseSchema,
} from '@/lib/schemas/analysis';

export type Persona = z.infer<typeof PersonaSchema>;
export type Jurisdiction = z.infer<typeof JurisdictionSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type DocumentType = z.infer<typeof DocumentTypeSchema>;
export type ClauseType = z.infer<typeof ClauseTypeSchema>;
export type AnalyzerId = z.infer<typeof AnalyzerIdSchema>;
export type OutputId = z.infer<typeof OutputIdSchema>;
export type UserContext = z.infer<typeof UserContextSchema>;
export type StatuteHint = z.infer<typeof StatuteHintSchema>;
export type LegalResource = z.infer<typeof LegalResourceSchema>;
export type EscalationDecision = z.infer<typeof EscalationDecisionSchema>;
export type AnalysisPlan = z.infer<typeof AnalysisPlanSchema>;

export type Clause = z.infer<typeof ClauseSchema>;
export type DetectorHit = z.infer<typeof DetectorHitSchema>;
export type SingleClauseAnalysis = z.infer<typeof SingleClauseAnalysisSchema>;
export type BatchedClauseAnalysis = z.infer<typeof BatchedClauseAnalysisSchema>;

export type MissingClause = z.infer<typeof MissingClauseSchema>;
export type PassBMissingClauses = z.infer<typeof PassBMissingClausesSchema>;
export type RiskBand = z.infer<typeof RiskBandSchema>;
export type ScoredRisk = z.infer<typeof ScoredRiskSchema>;
export type Obligation = z.infer<typeof ObligationSchema>;
export type ActionItem = z.infer<typeof ActionItemSchema>;
export type NegotiationAsk = z.infer<typeof NegotiationAskSchema>;
export type LawyerBrief = z.infer<typeof LawyerBriefSchema>;
export type SynthesisResult = z.infer<typeof SynthesisResultSchema>;
export type AskRequest = z.infer<typeof AskRequestSchema>;
export type AskResponse = z.infer<typeof AskResponseSchema>;
export type CompareItem = z.infer<typeof CompareItemSchema>;
export type CompareRequest = z.infer<typeof CompareRequestSchema>;
export type CompareResponse = z.infer<typeof CompareResponseSchema>;
export type ParseResponse = z.infer<typeof ParseResponseSchema>;
export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;
