// Validate all runtime configuration before initializing application dependencies.
import "./infrastructure/config/config.js";
import { logger } from "./infrastructure/logger/logger.js";

logger.info(
  '{"message": "Starting application...", "level": "info", "timestamp": "' +
    new Date().toISOString() +
    '"  }',
);
