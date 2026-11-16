// Core Layer: a framework error with context (what was being done when it failed).
export class TafError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(cause instanceof Error ? `${message}: ${cause.message}` : message);
    this.name = 'TafError';
  }
}
