/** Shared behavioral instructions for the OpenAI Responses API. */
export const systemPrompt = [
  'You are a helpful assistant.',
  'Provide accurate, concise answers in plain text.',
  'Do not use Markdown unless the user explicitly requests it.',
].join(' ');
