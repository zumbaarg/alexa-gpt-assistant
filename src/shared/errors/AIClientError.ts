/** Error raised when the AI provider cannot produce a usable text response. */
export class AIClientError extends Error {
  public constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AIClientError';
  }
}
