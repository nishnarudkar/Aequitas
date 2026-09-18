import { z } from 'zod';
import { LLMProvider, LLMRequestOptions, LLMResponse } from './provider';

export class MockProvider implements LLMProvider {
  id: 'mock' = 'mock';

  async generateText(options: LLMRequestOptions): Promise<LLMResponse> {
    const promptLower = options.prompt.toLowerCase();

    let rawText = 'Mock response: This document is a standard contract.';
    if (promptLower.includes('question') || promptLower.includes('ask')) {
      rawText =
        'Based on the document text, the security deposit of INR 50,000 must be paid upon signing [c-0001]. The deposit will be returned within 7 working days after vacating [c-0001].';
    }

    return {
      rawText,
      tokenUsage: {
        promptTokens: 120,
        completionTokens: 45,
        totalTokens: 165,
      },
    };
  }

  async generateJSON<T>(
    options: LLMRequestOptions,
    schema: z.ZodType<T>
  ): Promise<{ data: T; response: LLMResponse }> {
    const promptLower = (options.prompt + ' ' + (options.systemPrompt || '')).toLowerCase();

    let mockObject: any;

    if (promptLower.includes('ask') || promptLower.includes('question')) {
      mockObject = {
        answer:
          'According to Section 1, the security deposit is INR 50,000 payable upon execution [c-0001].',
        citations: ['c-0001'],
        isUnanswered: false,
        suggestedLawyerQuestion:
          'Is the deposit refund timeframe legally enforceable in Maharashtra?',
      };
    } else if (promptLower.includes('compare')) {
      mockObject = {
        items: [
          {
            clauseType: 'security-deposit',
            title: 'Security Deposit Refund',
            docAPosition: 'Deposit returned at landlord discretion with no deadline.',
            docBPosition: 'Deposit returned within 7 days of vacating in full.',
            betterForPersona: 'docB',
            why: 'Doc B guarantees a firm 7-day refund timeline.',
            status: 'different',
          },
          {
            clauseType: 'termination-convenience',
            title: 'Notice Period',
            docAPosition: '15 days notice by tenant, 90 days by landlord.',
            docBPosition: '30 days mutual notice period.',
            betterForPersona: 'docB',
            why: 'Doc B offers equal mutual notice periods.',
            status: 'different',
          },
        ],
        summary:
          'Doc B is significantly more favorable for tenants due to guaranteed deposit return deadlines and balanced notice terms.',
      };
    } else if (promptLower.includes('missing') || promptLower.includes('pass b')) {
      mockObject = {
        missingClauses: [
          {
            type: 'security-deposit',
            title: 'Deposit Refund Timeline',
            explanation:
              'The contract does not specify a maximum timeframe for returning the security deposit after vacating.',
            importance: 'high',
            suggestedClause:
              'The Licensor shall return the security deposit within 14 days of the Licensee vacating the premises.',
          },
        ],
      };
    } else if (promptLower.includes('clause') || promptLower.includes('pass a')) {
      mockObject = {
        results: [
          {
            clauseId: 'c-0001',
            plainMeaning:
              'You must pay a deposit of INR 50,000 before moving into the premises.',
            whoIsObligated: 'Licensee (Tenant)',
            type: 'security-deposit',
            severity: 2,
            whyItMatters:
              'Deposit refund terms protect your funds upon lease termination.',
            watchFor: 'Discretionary deductions for painting or repairs.',
            suggestedAsk:
              'Request explicit 14-day refund timeline with documented inspection.',
            confidence: 0.95,
          },
        ],
      };
    } else {
      // Default Pass C / Synthesis
      mockObject = {
        summary:
          'This Leave & Licence agreement outlines an 11-month lease term with a security deposit of INR 50,000 and a 3-month lock-in period.',
        topRisks: [
          {
            clauseId: 'c-0001',
            heading: '1. Security Deposit',
            score: 75,
            severity: 3,
            band: 'negotiate',
            explanation:
              'Deposit refund is subject to licensor discretion without a fixed timeline.',
            contributingFactors: [
              'Base severity 3/4',
              'High persona weight (2.0x) for tenant',
              'One-sided deduction clause',
            ],
          },
        ],
        obligations: [
          {
            party: 'user',
            obligation: 'Pay monthly rent on or before the 5th of every month.',
            deadlineOrTrigger: 'Monthly by 5th',
            clauseId: 'c-0002',
          },
        ],
        checklist: [
          {
            id: 'chk-1',
            category: 'Pre-signing',
            action: 'Obtain written proof of property ownership from Licensor.',
            priority: 'high',
            timeline: 'Before signing',
          },
        ],
        negotiationAsks: [
          {
            id: 'neg-1',
            targetClauseId: 'c-0001',
            currentIssue: 'Deposit refund timeline is unstated.',
            proposedWording:
              'The Licensor shall refund the deposit within 14 days of vacating.',
            rationale: 'Protects tenant from indefinite deposit retention.',
          },
        ],
        lawyerBrief: {
          summary: 'Residential tenancy contract review for tenant in Mumbai.',
          keyConcerns: ['Discretionary deposit refund clause without deadline.'],
          questionsForLawyer: [
            'Is the deposit deduction clause standard under Maharashtra Rent Control Act?',
          ],
          documentChecklist: ['Ownership proof', 'Electricity bill copy'],
        },
      };
    }

    const parsedData = schema.parse(mockObject);
    const rawText = JSON.stringify(parsedData, null, 2);

    return {
      data: parsedData,
      response: {
        rawText,
        tokenUsage: {
          promptTokens: 250,
          completionTokens: 300,
          totalTokens: 550,
        },
      },
    };
  }
}
