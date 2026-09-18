import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { LLMProvider, LLMRequestOptions, LLMResponse } from './provider';

export class AnthropicProvider implements LLMProvider {
  id: 'anthropic' = 'anthropic';
  private client: Anthropic;
  private modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY || '';
    if (!key) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not configured.');
    }
    this.client = new Anthropic({ apiKey: key });
    this.modelName = modelName || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
  }

  async generateText(options: LLMRequestOptions): Promise<LLMResponse> {
    const res = await this.client.messages.create({
      model: this.modelName,
      max_tokens: options.maxTokens ?? 2000,
      temperature: options.temperature ?? 0.2,
      system: options.systemPrompt,
      messages: [{ role: 'user', content: options.prompt }],
    });

    const rawText = res.content
      .filter((block) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n');

    return {
      rawText,
      tokenUsage: {
        promptTokens: res.usage.input_tokens,
        completionTokens: res.usage.output_tokens,
        totalTokens: res.usage.input_tokens + res.usage.output_tokens,
      },
    };
  }

  async generateJSON<T>(
    options: LLMRequestOptions,
    schema: z.ZodType<T>
  ): Promise<{ data: T; response: LLMResponse }> {
    const jsonPrompt = `${options.prompt}\n\nIMPORTANT: Output strictly valid JSON matching the requested structure. Do not include markdown codeblocks or explanatory text outside the JSON object.`;

    const res = await this.client.messages.create({
      model: this.modelName,
      max_tokens: options.maxTokens ?? 4000,
      temperature: options.temperature ?? 0.1,
      system: options.systemPrompt,
      messages: [{ role: 'user', content: jsonPrompt }],
    });

    const rawText = res.content
      .filter((block) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n')
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const json = JSON.parse(rawText);
    const data = schema.parse(json);

    return {
      data,
      response: {
        rawText,
        tokenUsage: {
          promptTokens: res.usage.input_tokens,
          completionTokens: res.usage.output_tokens,
          totalTokens: res.usage.input_tokens + res.usage.output_tokens,
        },
      },
    };
  }
}
