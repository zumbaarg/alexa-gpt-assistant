interface OpenAIErrorOptions extends ErrorOptions {
  statusCode?: number;
}

/** A provider-independent error raised by the OpenAI infrastructure adapter. */
export class OpenAIError extends Error {
  public readonly statusCode?: number;

  public constructor(message: string, options: OpenAIErrorOptions = {}) {
    super(message, options);
    this.name = 'OpenAIError';

    if (options.statusCode !== undefined) {
      this.statusCode = options.statusCode;
    }
  }
}
