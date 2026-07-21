import OpenAI from 'openai';

import type { AIClient } from '../../domain/interfaces/AIClient.js';
import { config } from '../config/config.js';
import { logger } from '../logger/index.js';
import { OpenAIError } from './errors/OpenAIError.js';

function translateOpenAIError(error: unknown): OpenAIError {
  if (error instanceof OpenAIError) {
    return error;
  }

  if (error instanceof OpenAI.APIError && typeof error.status === 'number') {
    return new OpenAIError('OpenAI request failed.', {
      cause: error,
      statusCode: error.status,
    });
  }

  return new OpenAIError('OpenAI request failed.', { cause: error });
}

/** OpenAI-backed implementation of the domain's text-generation boundary. */
export class OpenAIClient implements AIClient {
  private readonly client: OpenAI;

  public constructor() {
    this.client = new OpenAI({ apiKey: config.OPENAI_API_KEY });
  }

  public async ask(prompt: string): Promise<string> {
    const input = prompt.trim();

    if (input.length === 0) {
      throw new OpenAIError('The AI prompt must not be empty.');
    }

    logger.info(
      {
        event: 'openai.request.started',
        model: config.OPENAI_MODEL,
        promptLength: input.length,
      },
      'Starting OpenAI Responses API request',
    );

    try {
      const response = await this.client.responses.create({
        model: config.OPENAI_MODEL,
        input,
      });
      const output = response.output_text.trim();

      if (output.length === 0) {
        throw new OpenAIError('OpenAI returned an empty text response.');
      }

      logger.info(
        {
          event: 'openai.request.succeeded',
          model: config.OPENAI_MODEL,
          responseLength: output.length,
        },
        'OpenAI Responses API request completed',
      );

      return output;
    } catch (error: unknown) {
      const openAIError = translateOpenAIError(error);

      logger.error(
        {
          err: openAIError,
          event: 'openai.request.failed',
          statusCode: openAIError.statusCode,
        },
        'OpenAI Responses API request failed',
      );

      throw openAIError;
    }
  }
}
