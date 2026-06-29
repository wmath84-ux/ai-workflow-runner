export class AppError extends Error { constructor(message, code = 'app_error', details = {}) { super(message); this.name = 'AppError'; this.code = code; this.details = details; } }
export function normalizeError(error) { return { message: error?.message ?? 'Unknown error', code: error?.code ?? 'unknown_error', details: error?.details ?? null }; }
