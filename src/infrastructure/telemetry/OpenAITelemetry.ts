export const AI_PROVIDER = {
  OPENAI: 'openai',
} as const;

export const OPENAI_OPERATION = {
  RESPONSES_CREATE: 'responses.create',
} as const;

export const OPENAI_TELEMETRY_EVENT = {
  REQUEST_STARTED: 'openai.request.started',
  REQUEST_COMPLETED: 'openai.request.completed',
  REQUEST_FAILED: 'openai.request.failed',
} as const;

export type AIProvider = (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER];
export type OpenAIOperation = (typeof OPENAI_OPERATION)[keyof typeof OPENAI_OPERATION];

/** Provider-reported usage and calculated cost for a completed AI request. */
export interface OpenAIRequestMetrics {
  readonly durationMs: number;
  readonly inputTokens: number | null;
  readonly outputTokens: number | null;
  readonly totalTokens: number | null;
  readonly estimatedCostUsd: number | null;
}

/** Metadata shared by every OpenAI request lifecycle event. */
export interface OpenAIRequestContext {
  readonly requestId: string;
  readonly provider: AIProvider;
  readonly operation: OpenAIOperation;
  readonly model: string;
}

/** Technical metadata for a completed OpenAI Responses API request. */
export interface OpenAITelemetry extends OpenAIRequestContext {
  readonly event: typeof OPENAI_TELEMETRY_EVENT.REQUEST_COMPLETED;
  readonly metrics: OpenAIRequestMetrics;
}

/** Technical metadata emitted when an OpenAI request starts. */
export interface OpenAIRequestStartedTelemetry extends OpenAIRequestContext {
  readonly event: typeof OPENAI_TELEMETRY_EVENT.REQUEST_STARTED;
}

/** Technical metadata emitted when an OpenAI request fails. */
export interface OpenAIRequestFailureTelemetry extends OpenAIRequestContext {
  readonly event: typeof OPENAI_TELEMETRY_EVENT.REQUEST_FAILED;
  readonly metrics: OpenAIRequestMetrics;
  readonly errorType: string;
  readonly errorMessage: string;
}
