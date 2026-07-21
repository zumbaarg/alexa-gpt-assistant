import { z } from 'zod';

/**
 * Boundary contract for process environment variables.
 *
 * Keep this schema at the infrastructure boundary so the rest of the
 * application never depends on `process.env` or stringly-typed values.
 */
export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  OPENAI_API_KEY: z
    .string({ error: 'OPENAI_API_KEY is required.' })
    .trim()
    .min(1, 'OPENAI_API_KEY must not be empty.'),
  OPENAI_MODEL: z.string().trim().min(1).default('gpt-5.5'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
});

export type Environment = z.infer<typeof environmentSchema>;
