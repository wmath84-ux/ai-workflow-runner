function persist(level, args) {
  const [message, raw] = args;
  import('../storage/logs.js')
    .then(({ createLog }) => createLog({ level, scope: 'app', message: typeof message === 'string' ? message : JSON.stringify(message), raw: raw ?? null }))
    .catch(() => {});
}

export const logger = {
  debug: (...args) => { console.debug('[ai-workflow-runner]', ...args); persist('debug', args); },
  info: (...args) => { console.info('[ai-workflow-runner]', ...args); persist('info', args); },
  warn: (...args) => { console.warn('[ai-workflow-runner]', ...args); persist('warn', args); },
  error: (...args) => { console.error('[ai-workflow-runner]', ...args); persist('error', args); }
};
