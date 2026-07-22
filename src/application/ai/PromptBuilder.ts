const ASSISTANT_INSTRUCTIONS = [
  'You are a helpful assistant.',
  'Provide accurate, concise answers in plain text.',
  'Do not use Markdown unless the user explicitly requests it.',
].join(' ');

/** Prepares application-owned instructions and user input for the AI boundary. */
export class PromptBuilder {
  public build(prompt: string): string {
    const userPrompt = prompt.trim();

    if (userPrompt.length === 0) {
      return userPrompt;
    }

    return `${ASSISTANT_INSTRUCTIONS}\n\n${userPrompt}`;
  }
}
