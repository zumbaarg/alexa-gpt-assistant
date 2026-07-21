import type { AIClient } from './domain/interfaces/AIClient.js';
import { OpenAIClient } from './infrastructure/ai/index.js';
import { logger } from './infrastructure/logger/index.js';

const aiClient: AIClient = new OpenAIClient();

try {
  logger.info({ event: 'application.started' }, 'Starting application');

  const response = await aiClient.ask("Tell me a joke about programming.");

  logger.info({ event: 'application.response.generated', response }, 'OpenAI responded successfully');
  logger.info({ event: 'application.ready' }, 'Application ready');
} catch (error: unknown) {
  logger.fatal({ err: error }, 'Application failed to start');
  process.exit(1);
}
