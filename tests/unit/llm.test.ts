import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  MockProvider,
  getLLMProvider,
  generateValidatedJSON,
  LLMProvider,
  LLMRequestOptions,
  LLMResponse,
} from '../../src/lib/llm';

describe('LLM Provider & Validation Repair Unit Tests', () => {
  it('MockProvider returns deterministic Q&A responses', async () => {
    const provider = new MockProvider();
    const res = await provider.generateText({
      prompt: 'Ask question: what is the security deposit?',
    });

    expect(res.rawText).toContain('security deposit');
    expect(res.tokenUsage).toBeDefined();
    expect(res.tokenUsage?.totalTokens).toBeGreaterThan(0);
  });

  it('MockProvider returns valid JSON matching Pass A schema', async () => {
    const provider = new MockProvider();
    const testSchema = z.object({
      results: z.array(
        z.object({
          clauseId: z.string(),
          plainMeaning: z.string(),
          whoIsObligated: z.string(),
          severity: z.number(),
        })
      ),
    });

    const res = await provider.generateJSON(
      { prompt: 'Pass A clause analysis' },
      testSchema
    );

    expect(res.data.results.length).toBeGreaterThan(0);
    expect(res.data.results[0]?.clauseId).toBe('c-0001');
  });

  it('getLLMProvider defaults to MockProvider when no API keys are present', () => {
    const provider = getLLMProvider('gemini'); // no GEMINI_API_KEY set
    expect(provider.id).toBe('mock');
  });

  it('generateValidatedJSON handles successful validation on first attempt', async () => {
    const provider = new MockProvider();
    const schema = z.object({
      summary: z.string(),
    });

    const result = await generateValidatedJSON(
      provider,
      { prompt: 'synthesis pass' },
      schema
    );

    expect(result.data.summary).toBeDefined();
    expect(result.repaired).toBe(false);
  });

  it('generateValidatedJSON performs validation repair retry on first failure', async () => {
    let callCount = 0;
    const faultyProvider: LLMProvider = {
      id: 'mock',
      async generateText() {
        return { rawText: '' };
      },
      async generateJSON<T>(
        _options: LLMRequestOptions,
        schema: z.ZodType<T>
      ): Promise<{ data: T; response: LLMResponse }> {
        callCount++;
        if (callCount === 1) {
          // First attempt throws validation error
          throw new z.ZodError([
            {
              code: 'invalid_type',
              expected: 'string',
              received: 'undefined',
              path: ['summary'],
              message: 'Required',
            },
          ]);
        }
        // Second attempt (repair retry) succeeds
        const data = schema.parse({ summary: 'Repaired summary' });
        return {
          data,
          response: { rawText: JSON.stringify(data) },
        };
      },
    };

    const schema = z.object({ summary: z.string() });
    const result = await generateValidatedJSON(
      faultyProvider,
      { prompt: 'Test synthesis' },
      schema
    );

    expect(callCount).toBe(2); // Retried once
    expect(result.repaired).toBe(true);
    expect(result.data.summary).toBe('Repaired summary');
  });
});
