import { z } from 'zod';
import { AnthropicProvider } from './anthropic';
import { GeminiProvider } from './gemini';
import { MockProvider } from './mock';
import { LLMProvider, LLMRequestOptions, LLMResponse } from './provider';

export * from './provider';
export * from './mock';
export * from './gemini';
export * from './anthropic';

export function getLLMProvider(overrideProvider?: string): LLMProvider {
  const providerType = (
    overrideProvider ||
    process.env.LLM_PROVIDER ||
    'mock'
  ).toLowerCase();

  if (providerType === 'gemini') {
    const key = process.env.GEMINI_API_KEY;
    if (key && key.trim().length > 0) {
      return new GeminiProvider(key);
    }
  }

  if (providerType === 'anthropic') {
    const key = process.env.ANTHROPIC_API_KEY;
    if (key && key.trim().length > 0) {
      return new AnthropicProvider(key);
    }
  }

  // Fallback to MockProvider (Zero API key demo mode)
  return new MockProvider();
}

export async function generateValidatedJSON<T>(
  provider: LLMProvider,
  options: LLMRequestOptions,
  schema: z.ZodType<T>,
  fallbackData?: T
): Promise<{ data: T; response: LLMResponse; repaired: boolean }> {
  try {
    // Attempt 1: Standard model generation
    const res = await provider.generateJSON(options, schema);
    return { data: res.data, response: res.response, repaired: false };
  } catch (error: any) {
    // Section 7.3 validation repair retry
    const validationErrorMsg =
      error instanceof z.ZodError
        ? error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')
        : error?.message || 'Invalid JSON format';

    const repairPrompt = `${options.prompt}\n\nATTENTION: Your previous JSON output failed validation with the following error:\n[${validationErrorMsg}]\n\nPlease correct the output and return strictly valid JSON matching the exact schema requirements.`;

    try {
      // Attempt 2: One repair retry with validation error feedback appended
      const repairOptions: LLMRequestOptions = {
        ...options,
        prompt: repairPrompt,
      };
      const res = await provider.generateJSON(repairOptions, schema);
      return { data: res.data, response: res.response, repaired: true };
    } catch (secondError: any) {
      // Graceful degradation fallback if repair fails
      if (fallbackData !== undefined) {
        return {
          data: fallbackData,
          response: {
            rawText: JSON.stringify(fallbackData),
            tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          },
          repaired: false,
        };
      }
      throw secondError;
    }
  }
}
