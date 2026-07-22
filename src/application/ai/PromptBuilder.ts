/**
 * Central prompt-construction boundary for application behavior.
 *
 * It intentionally preserves the existing input until a future story defines
 * an approved change to assistant instructions.
 */
export class PromptBuilder {
  public build(prompt: string): string {
    return prompt;
  }
}
