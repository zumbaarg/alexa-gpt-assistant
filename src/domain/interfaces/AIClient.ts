/**
 * Domain boundary for text-generation providers.
 *
 * Implementations must return only generated text and must not expose
 * provider-specific SDK objects to callers.
 */
export interface AIClient {
  ask(prompt: string): Promise<string>;
}
