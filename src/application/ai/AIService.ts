import type { AIClient } from '../../domain/interfaces/AIClient.js';
import { PromptBuilder } from './PromptBuilder.js';

/** Application entry point for generating assistant responses. */
export class AIService {
  public constructor(
    private readonly aiClient: AIClient,
    private readonly promptBuilder: PromptBuilder = new PromptBuilder(),
  ) {}

  public generateResponse(prompt: string): Promise<string> {
    const preparedPrompt = this.promptBuilder.build(prompt);

    return this.aiClient.ask(preparedPrompt);
  }
}
