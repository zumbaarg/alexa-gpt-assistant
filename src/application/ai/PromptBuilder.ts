import { AssistantInstructions } from './AssistantInstructions.js';

/**
 * Central prompt-construction boundary for application behavior.
 *
 * It intentionally preserves the existing input until a future story defines
 * an approved change to assistant instructions.
 */
export class PromptBuilder {
  public constructor(
    private readonly assistantInstructions: AssistantInstructions = new AssistantInstructions(),
  ) {}

  public build(prompt: string): string {
    const instructions = this.assistantInstructions.getInstructions();

    if (instructions.length > 0) {
      return `${instructions}\n\n${prompt}`;
    }

    return prompt;
  }
}
