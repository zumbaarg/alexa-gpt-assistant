import OpenAI from 'openai';

import { config } from '../config/config.js';
import type { AIClient } from '../../domain/interfaces/AIClient.js';
import { AIClientError } from '../../shared/errors/AIClientError.js';
import { systemPrompt } from './prompts/systemPrompt.js';

/** OpenAI-backed implementation of the domain's text-generation boundary. */
export class OpenAIClient implements AIClient {
  private readonly client: OpenAI;

  public constructor() {
    this.client = new OpenAI({ apiKey: config.OPENAI_API_KEY });
  }

  public async generateText(prompt: string): Promise<string> {
    const input = prompt.trim();

    if (input.length === 0) {
      throw new AIClientError('The AI prompt must not be empty.');
    }

    try {
      const response = await this.client.responses.create({
        model: config.OPENAI_MODEL,
        instructions: systemPrompt,
        input,
      });
      const output = response.output_text.trim();

      if (output.length === 0) {
        throw new AIClientError('The AI provider returned an empty text response.');
      }

      return output;
    } catch (error: unknown) {
      if (error instanceof AIClientError) {
        throw error;
      }

      throw new AIClientError('Unable to generate an AI response.', { cause: error });
    }
  }
}
