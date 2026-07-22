import OpenAI from 'openai';
import { randomUUID } from 'node:crypto';

import type { AIClient } from '../../domain/interfaces/AIClient.js';
import { config } from '../config/config.js';
import { logger } from '../logger/index.js';
import {
  AI_PROVIDER,
  CostCalculator,
  OPENAI_OPERATION,
  OPENAI_TELEMETRY_EVENT,
  type OpenAIRequestFailureTelemetry,
  type OpenAIRequestContext,
  type OpenAIRequestMetrics,
  type OpenAIRequestStartedTelemetry,
  type OpenAITelemetry,
} from '../telemetry/index.js';
import { OpenAIError } from './errors/OpenAIError.js';

interface OpenAIUsage {
  readonly input_tokens: number;
  readonly output_tokens: number;
  readonly total_tokens: number;
}

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

function durationInMilliseconds(startTime: bigint): number {
  const elapsedNanoseconds = process.hrtime.bigint() - startTime;
  const elapsedMilliseconds = Number(elapsedNanoseconds) / 1_000_000;

  return Math.round(elapsedMilliseconds * 10) / 10;
}

/** OpenAI-backed implementation of the domain's text-generation boundary. */
export class OpenAIClient implements AIClient {
  private readonly client: OpenAI;

  public constructor(private readonly costCalculator: CostCalculator = new CostCalculator()) {
    this.client = new OpenAI({ apiKey: config.OPENAI_API_KEY });
  }

  public async ask(preparedInput: string): Promise<string> {
    const input = preparedInput.trim();

    if (input.length === 0) {
      throw new OpenAIError('The AI prompt must not be empty.');
    }

    const requestId = randomUUID();
    const startedAt = process.hrtime.bigint();

    logger.info(this.createRequestStartedTelemetry(requestId), 'Starting OpenAI Responses API request');

    try {
      const response = await this.client.responses.create({
        model: config.OPENAI_MODEL,
        input,
      });
      const output = response.output_text.trim();

      if (output.length === 0) {
        throw new OpenAIError('OpenAI returned an empty text response.');
      }

      const telemetry = this.createTelemetry(requestId, response.usage, startedAt);

      logger.info(telemetry, 'OpenAI Responses API request completed');

      return output;
    } catch (error: unknown) {
      const openAIError = translateOpenAIError(error);

      logger.error(
        this.createFailureTelemetry(requestId, startedAt, openAIError),
        'OpenAI Responses API request failed',
      );

      throw openAIError;
    }
  }

  private createTelemetry(
    requestId: string,
    usage: OpenAIUsage | undefined,
    startedAt: bigint,
  ): OpenAITelemetry {
    return {
      event: OPENAI_TELEMETRY_EVENT.REQUEST_COMPLETED,
      ...this.createRequestContext(requestId),
      metrics: this.createMetrics(usage, startedAt),
    };
  }

  private createRequestStartedTelemetry(requestId: string): OpenAIRequestStartedTelemetry {
    return {
      event: OPENAI_TELEMETRY_EVENT.REQUEST_STARTED,
      ...this.createRequestContext(requestId),
    };
  }

  private createFailureTelemetry(
    requestId: string,
    startedAt: bigint,
    error: OpenAIError,
  ): OpenAIRequestFailureTelemetry {
    return {
      event: OPENAI_TELEMETRY_EVENT.REQUEST_FAILED,
      ...this.createRequestContext(requestId),
      metrics: this.createMetrics(undefined, startedAt),
      errorType: error.name,
      errorMessage: error.message,
    };
  }

  private createRequestContext(requestId: string): OpenAIRequestContext {
    return {
      requestId,
      provider: AI_PROVIDER.OPENAI,
      operation: OPENAI_OPERATION.RESPONSES_CREATE,
      model: config.OPENAI_MODEL,
    };
  }

  private createMetrics(
    usage: OpenAIUsage | undefined,
    startedAt: bigint,
  ): OpenAIRequestMetrics {
    if (usage === undefined) {
      return {
        durationMs: durationInMilliseconds(startedAt),
        inputTokens: null,
        outputTokens: null,
        totalTokens: null,
        estimatedCostUsd: null,
      };
    }

    return {
      durationMs: durationInMilliseconds(startedAt),
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
      totalTokens: usage.total_tokens,
      estimatedCostUsd: this.costCalculator.estimateCost(
        config.OPENAI_MODEL,
        usage.input_tokens,
        usage.output_tokens,
      ),
    };
  }
}
