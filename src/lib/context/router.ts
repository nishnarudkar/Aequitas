import {
  AnalysisPlan,
  AnalyzerId,
  ClauseType,
  DocumentType,
  UserContext,
} from '@/types';
import { evaluateEscalation } from './escalation';
import { GOAL_OUTPUT_MAP, getStatuteHints, PERSONA_RULES } from './rules';

export function createAnalysisPlan(
  context: UserContext,
  detectedDocType?: DocumentType,
  documentText: string = ''
): AnalysisPlan {
  // 1. Determine Document Type
  const defaultDoctypeMap: Record<string, DocumentType> = {
    tenant: 'rental',
    freelancer: 'service-agreement',
    employee: 'employment',
    consumer: 'privacy-policy',
    borrower: 'loan',
  };

  const documentType: DocumentType =
    detectedDocType || defaultDoctypeMap[context.persona] || 'other';

  // 2. Escalation Triage Check
  const escalation = evaluateEscalation(documentText, context);

  // 3. Retrieve Persona & Doctype Rules
  const personaDict = PERSONA_RULES[context.persona];
  const rule =
    personaDict[documentType] ||
    personaDict['default'] || {
      priorityClauseTypes: [
        'security-deposit',
        'notice-period-asymmetry',
        'indemnity',
      ] as ClauseType[],
      riskWeights: {
        'security-deposit': 1.5,
        'notice-period-asymmetry': 1.5,
      },
    };

  const priorityClauseTypes = [...rule.priorityClauseTypes];
  const riskWeights: Record<ClauseType, number> = { ...(rule.riskWeights as Record<ClauseType, number>) };

  // 4. Derive Outputs and Tone from Goal
  const goalConfig = GOAL_OUTPUT_MAP[context.goal] || GOAL_OUTPUT_MAP['understand'];
  let outputs = [...goalConfig.outputs];
  const tone = goalConfig.tone;

  const rationale: string[] = [
    `Configured analysis for ${context.persona} reviewing ${documentType} document in ${context.jurisdiction} jurisdiction.`,
    `Primary objective '${context.goal}' selected tone '${tone}'.`,
  ];

  // 5. Already Signed Adjustments
  if (context.counterpartySigned) {
    outputs = outputs.filter((o) => o !== 'negotiation');
    rationale.push(
      'Contract already signed: focusing on binding obligations, exit options, and cure terms instead of active negotiation.'
    );
  }

  // 6. Deadline Evaluation
  let tokenBudget = 8000;
  if (context.deadline) {
    const deadlineDate = new Date(context.deadline);
    const currentDate = new Date();
    const diffTime = deadlineDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (!isNaN(diffDays)) {
      if (diffDays <= 3) {
        tokenBudget = 4000;
        rationale.push(
          `Urgent deadline (${diffDays} days remaining): running prioritized fast-track review.`
        );
      } else if (diffDays <= 7) {
        rationale.push(
          `Upcoming deadline (${diffDays} days remaining): elevating priority for time-sensitive notice and exit clauses.`
        );
        // Elevate time-sensitive risk weights
        ['notice-period-asymmetry', 'lock-in', 'termination-convenience'].forEach(
          (ct) => {
            const key = ct as ClauseType;
            riskWeights[key] = (riskWeights[key] || 1.0) + 0.3;
          }
        );
      }
    }
  }

  // 7. Emergency Escalation Adjustments
  if (escalation.triggered) {
    if (!outputs.includes('lawyer-brief')) {
      outputs.push('lawyer-brief');
    }
    rationale.push(
      `Escalation trigger detected (${escalation.level} level): adding mandatory lawyer brief and legal aid pointers.`
    );
  }

  // 8. Statute Hints
  const statuteHints = getStatuteHints(context.jurisdiction, documentType);

  const analyzers: AnalyzerId[] = [
    'detectors',
    'clause-pass',
    'gaps-pass',
    'synthesis-pass',
  ];

  return {
    documentType,
    analyzers,
    priorityClauseTypes,
    riskWeights,
    outputs,
    tone,
    statuteHints,
    escalation,
    tokenBudget,
    rationale,
  };
}
