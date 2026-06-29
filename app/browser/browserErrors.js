export function normalizeBrowserError(error) {
  const message = error?.message ?? String(error ?? 'Unknown browser error');
  const lower = message.toLowerCase();

  if (lower.includes('cannot find package') || lower.includes('playwright')) {
    return 'Playwright is not installed or could not be loaded. Run npm install and, if needed, npx playwright install chromium.';
  }
  if (lower.includes('executable') || lower.includes('browser') && lower.includes('install')) {
    return 'Chromium is missing. Run npx playwright install chromium, then try launching again.';
  }
  if (lower.includes('permission') || lower.includes('eacces') || lower.includes('writable')) {
    return 'Profile path is not writable. Choose a writable browser profile folder.';
  }
  if (lower.includes('closed')) {
    return 'Browser is already closed.';
  }
  if (lower.includes('launch')) {
    return `Browser failed to launch: ${message}`;
  }

  return message || 'Unknown browser error.';
}
