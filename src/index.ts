import type { AIClient } from "./domain/interfaces/AIClient.js";
import { OpenAIClient } from "./infrastructure/ai/index.js";
import { logger } from "./infrastructure/logger/index.js";

const aiClient: AIClient = new OpenAIClient();

try {
  logger.info("Starting application...");

  const response = await aiClient.ask("Tell me a joke about programming.");

  logger.info({ response }, "OpenAI responded successfully");
} catch (error) {
  logger.fatal({ err: error }, "Application failed to start");
  process.exit(1);
}
