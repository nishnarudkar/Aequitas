import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { LLMProvider, LLMRequestOptions, LLMResponse } from './provider';

export class GeminiProvider implements LLMProvider {
  id: 'gemini' = 'gemini';
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY || '';
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    this.genAI = new GoogleGenerativeAI(key);
    this.modelName = modelName || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  }

  async generateText(options: LLMRequestOptions): Promise<LLMResponse> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction: options.systemPrompt,
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: options.maxTokens,
      },
    });

    const result = await model.generateContent(options.prompt);
    const response = await result.response;
    const rawText = response.text();

    const usageMetadata = response.usageMetadata;
    const tokenUsage = usageMetadata
      ? {
          promptTokens: usageMetadata.promptTokenCount || 0,
          completionTokens: usageMetadata.candidatesTokenCount || 0,
          totalTokens: usageMetadata.totalTokenCount || 0,
        }
      : undefined;

    return {
      rawText,
      tokenUsage,
    };
  }

  async generateJSON<T>(
    options: LLMRequestOptions,
    schema: z.ZodType<T>
  ): Promise<{ data: T; response: LLMResponse }> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction: options.systemPrompt,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: options.temperature ?? 0.1,
        maxOutputTokens: options.maxTokens,
      },
    });

    const result = await model.generateContent(options.prompt);
    const responseText = (await result.response).text();

    // Strip markdown JSON wrappers if present
    const cleanedText = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const json = JSON.parse(cleanedText);
    const data = schema.parse(json);

    const usageMetadata = result.response.usageMetadata;
    const tokenUsage = usageMetadata
      ? {
          promptTokens: usageMetadata.promptTokenCount || 0,
          completionTokens: usageMetadata.candidatesTokenCount || 0,
          totalTokens: usageMetadata.totalTokenCount || 0,
        }
      : undefined;

    return {
      data,
      response: {
        rawText: cleanedText,
        tokenUsage,
      },
    };
  }
}
