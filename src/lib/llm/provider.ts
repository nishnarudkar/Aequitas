import { z } from 'zod';

export interface LLMRequestOptions {
  systemPrompt?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LLMResponse {
  rawText: string;
  tokenUsage?: TokenUsage;
}

export interface LLMProvider {
  id: 'gemini' | 'anthropic' | 'mock';
  generateText(options: LLMRequestOptions): Promise<LLMResponse>;
  generateJSON<T>(
    options: LLMRequestOptions,
    schema: z.ZodType<T>
  ): Promise<{ data: T; response: LLMResponse }>;
}
