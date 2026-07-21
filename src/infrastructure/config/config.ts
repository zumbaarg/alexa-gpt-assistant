import { config as loadEnvironment } from 'dotenv';

import { environmentSchema, type Environment } from './schema.js';

/** Loads, validates, and maps environment variables into application config. */
function createConfig(environment: NodeJS.ProcessEnv): Readonly<Environment> {
  const result = environmentSchema.safeParse(environment);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || 'environment'}: ${issue.message}`)
      .join('\n');

    throw new Error(`Invalid application configuration:\n${details}`);
  }

  return Object.freeze(result.data);
}

// Load dotenv before validation. Existing process environment values take precedence.
loadEnvironment();

/**
 * The sole configuration dependency for the application.
 * It is parsed once at startup and frozen to prevent runtime mutation.
 */
export const config = createConfig(process.env);

export type AppConfig = typeof config;
