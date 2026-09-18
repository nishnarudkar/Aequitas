import { AnalysisPlan, ClauseType, RiskBand, ScoredRisk } from '@/types';

export interface RiskCalculationParams {
  clauseId: string;
  heading: string;
  severity: number; // 0 to 4
  clauseType: ClauseType;
  plan: AnalysisPlan;
  asymmetry?: { partyA: string; partyB: string };
  isMutual?: boolean;
  isTimeBound?: boolean;
  hasDeadline?: boolean;
  customExplanation?: string;
}

export function calculateRiskScore(params: RiskCalculationParams): ScoredRisk {
  const {
    clauseId,
    heading,
    severity,
    clauseType,
    plan,
    asymmetry,
    isMutual = false,
    isTimeBound = false,
    hasDeadline = false,
    customExplanation,
  } = params;

  const contributingFactors: string[] = [];

  // 1. Base Severity Component (severity 0..4 * 10 = 0..40)
  const baseScore = severity * 10;
  contributingFactors.push(`Base severity score: ${baseScore}/40 (Severity rating ${severity}/4).`);

  // 2. Persona Weight Scaling (0.5..2.0)
  const personaWeight = plan.riskWeights[clauseType] ?? 1.0;
  const weightedScore = baseScore * personaWeight;
  contributingFactors.push(
    `Persona risk multiplier (${personaWeight}x for ${plan.documentType}): adjusted base to ${Math.round(weightedScore)}.`
  );

  let rawTotal = weightedScore;

  // 3. Asymmetry Penalty (+15 if one-sided)
  if (asymmetry) {
    rawTotal += 15;
    contributingFactors.push(
      `+15 One-sided obligation penalty: terms explicitly favor ${asymmetry.partyA}.`
    );
  }

  // 4. Deadline Pressure (+10 if time-bound and deadline < 7 days)
  if (isTimeBound && (hasDeadline || (plan.tokenBudget === 4000))) {
    rawTotal += 10;
    contributingFactors.push('+10 Urgent deadline pressure: clause is time-sensitive under short timeline.');
  }

  // 5. Mutuality Credit (-10 if obligations are mutual)
  if (isMutual) {
    rawTotal -= 10;
    contributingFactors.push('-10 Mutual terms credit: obligations apply equally to both parties.');
  }

  // Final Clamped Score (0..100)
  const score = Math.max(0, Math.min(100, Math.round(rawTotal)));

  // Determine Risk Band
  let band: RiskBand = 'standard';
  if (score >= 80) {
    band = 'get-advice';
  } else if (score >= 60) {
    band = 'negotiate';
  } else if (score >= 30) {
    band = 'worth-a-look';
  } else {
    band = 'standard';
  }

  const bandDescriptions: Record<RiskBand, string> = {
    standard: 'Standard contractual term within normal market expectations.',
    'worth-a-look': 'Contains terms worth reviewing carefully before proceeding.',
    negotiate: 'Highly one-sided or restrictive clause; negotiation strongly recommended.',
    'get-advice': 'High-risk clause with severe financial or legal impact; professional legal advice recommended.',
  };

  const explanation =
    customExplanation ||
    `${bandDescriptions[band]} (Risk Score: ${score}/100)`;

  return {
    clauseId,
    heading,
    score,
    severity,
    band,
    explanation,
    contributingFactors,
  };
}
