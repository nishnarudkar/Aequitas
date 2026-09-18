import { EscalationDecision, LegalResource, UserContext } from '@/types';
import resourcesData from '@/data/resources.json';

const legalResources: LegalResource[] = resourcesData as LegalResource[];

interface EscalationTriggerDef {
  id: string;
  category: string;
  regex: RegExp;
  isSelfHarm?: boolean;
}

const TRIGGER_DEFINITIONS: EscalationTriggerDef[] = [
  {
    id: 'self-harm',
    category: 'Crisis & Personal Safety',
    regex: /\b(end(ing)? my life|kill(ing)? myself|suicide|hurt(ing)? myself|want to die|don't want to live|harm(ing)? myself)\b/i,
    isSelfHarm: true,
  },
  {
    id: 'posh',
    category: 'Workplace Sexual Harassment',
    regex: /\b(posh act|internal committee|sexual harassment|unwanted touch|workplace harassment|posh complaint)\b/i,
  },
  {
    id: 'criminal',
    category: 'Criminal Proceedings',
    regex: /\b(police arrest|first information report|\bFIR\b|police custody|bail application|criminal charges|arrest warrant)\b/i,
  },
  {
    id: 'court',
    category: 'Court Summons & Hearing',
    regex: /\b(court summons|hearing date|summons issued|court order|restraining order|interim injunction)\b/i,
  },
  {
    id: 'eviction',
    category: 'Imminent Eviction',
    regex: /\b(forced eviction|lock out|lock changed|changing locks|threatened eviction|illegal eviction|thrown out of house)\b/i,
  },
  {
    id: 'harassment',
    category: 'Domestic Abuse & Violence',
    regex: /\b(domestic violence|physical assault|physical abuse|threat to safety|beating|physical threat)\b/i,
  },
  {
    id: 'custody',
    category: 'Child Custody & Welfare',
    regex: /\b(child custody|taking child away|custody dispute|child welfare officer|custody battle)\b/i,
  },
  {
    id: 'immigration',
    category: 'Deportation & Immigration',
    regex: /\b(deportation notice|deportation order|visa cancellation|passport seizure)\b/i,
  },
  {
    id: 'insolvency',
    category: 'Insolvency & Debt Harassment',
    regex: /\b(bankruptcy notice|\bNCLT\b|insolvency notice|recovery agent harassment|recovery thugs)\b/i,
  },
  {
    id: 'limitation',
    category: 'Statutory Deadline Expiry',
    regex: /\b(limitation period expiring|last day to file appeal|statutory deadline today|limitation bar)\b/i,
  },
];

export function evaluateEscalation(
  text: string,
  context?: Partial<UserContext>
): EscalationDecision {
  const matchedTriggers: string[] = [];
  let isSelfHarmTriggered = false;

  for (const def of TRIGGER_DEFINITIONS) {
    if (def.regex.test(text)) {
      matchedTriggers.push(def.category);
      if (def.isSelfHarm) {
        isSelfHarmTriggered = true;
      }
    }
  }

  // Also check context goal for dispute
  if (context?.goal === 'dispute' && matchedTriggers.length === 0) {
    // Note dispute context without emergency trigger
  }

  if (isSelfHarmTriggered) {
    const crisisResources = legalResources.filter(
      (r) => r.id === 'tele-manas' || r.id === 'nalsa'
    );

    return {
      triggered: true,
      level: 'critical',
      triggers: matchedTriggers,
      resources: crisisResources,
      rationale:
        'Self-harm or severe personal danger signal detected. Legal analysis stopped to provide immediate crisis support.',
    };
  }

  if (matchedTriggers.length > 0) {
    // Select relevant resources based on jurisdiction / triggers
    const jurisdiction = context?.jurisdiction || 'OTHER';
    const relevantResources = legalResources.filter((r) => {
      if (r.id === 'nalsa' || r.id === 'tele-law') return true;
      if (matchedTriggers.includes('Workplace Sexual Harassment') && r.id === 'posh-ic') return true;
      if (matchedTriggers.includes('Imminent Eviction') && jurisdiction !== 'OTHER' && r.scope.toLowerCase().includes(jurisdiction.toLowerCase())) return true;
      return false;
    });

    return {
      triggered: true,
      level: 'warning',
      triggers: matchedTriggers,
      resources: relevantResources.length > 0 ? relevantResources : legalResources.slice(0, 3),
      rationale: `Emergency trigger(s) detected: ${matchedTriggers.join(', ')}. Analysis is constrained to factual pointers and legal aid resources are surfaced.`,
    };
  }

  return {
    triggered: false,
    level: 'none',
    triggers: [],
    resources: [],
    rationale: 'No emergency triggers detected.',
  };
}
