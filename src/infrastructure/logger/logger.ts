import pino, { type LoggerOptions } from 'pino';

import { config } from '../config/config.js';

function createLoggerOptions(): LoggerOptions {
  return {
    level: config.LOG_LEVEL,
    base: {
      environment: config.NODE_ENV,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };
}

function createTransport() {
  if (config.NODE_ENV !== 'development') {
    return undefined;
  }

  return pino.transport({
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      singleLine: true,
    },
  });
}

/**
 * Application-wide logging adapter.
 *
 * Development logs are human-readable; all other environments emit structured
 * JSON suitable for log aggregation and querying.
 */
export const logger = pino(createLoggerOptions(), createTransport());
