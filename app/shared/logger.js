export const logger = {
  info: (...args) => console.info('[ai-workflow-runner]', ...args),
  warn: (...args) => console.warn('[ai-workflow-runner]', ...args),
  error: (...args) => console.error('[ai-workflow-runner]', ...args)
};
