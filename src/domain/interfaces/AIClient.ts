/**
 * Domain boundary for text-generation providers.
 *
 * Implementations must return only the generated text and must not expose
 * provider-specific SDK objects to callers.
 */
export interface AIClient {
  generateText(prompt: string): Promise<string>;
}
