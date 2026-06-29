import { getLastTextFromSelectors, isAnySelectorVisible } from './selectorUtils.js';

const DEFAULTS = {
  responseSelectors: [],
  generatingSelectors: [],
  timeoutMs: 180000,
  stableMs: 3000,
  pollMs: 750,
  minTextLength: 1
};

export async function getLatestResponseText(page, selectors, options = {}) {
  return getLastTextFromSelectors(page, selectors, { minTextLength: options.minTextLength ?? 1 });
}

export async function waitUntilSelectorsGone(page, selectors, options = {}) {
  const timeoutMs = options.timeoutMs ?? 180000;
  const pollMs = options.pollMs ?? 750;
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (!await isAnySelectorVisible(page, selectors)) return { ok: true };
    await page.waitForTimeout(pollMs);
  }
  return { ok: false, timedOut: true };
}

export async function waitForStableResponse(page, options = {}) {
  const config = { ...DEFAULTS, ...options };
  const startedAt = Date.now();
  let latestText = '';
  let lastText = '';
  let stableSince = Date.now();

  while (Date.now() - startedAt < config.timeoutMs) {
    const latest = await getLatestResponseText(page, config.responseSelectors, config);
    const text = latest.text || '';
    const generating = await isAnySelectorVisible(page, config.generatingSelectors);

    if (text) latestText = text;
    if (text !== lastText) {
      lastText = text;
      stableSince = Date.now();
    }

    if (!generating && text.length >= config.minTextLength && Date.now() - stableSince >= config.stableMs) {
      return { ok: true, text, partial: false, timedOut: false, stableAt: new Date().toISOString() };
    }
    await page.waitForTimeout(config.pollMs);
  }

  if (latestText) {
    return {
      ok: true,
      text: latestText,
      partial: true,
      timedOut: true,
      warning: 'Response timed out, but partial text was captured.',
      stableAt: null
    };
  }

  return {
    ok: false,
    recoverable: true,
    errorType: 'response_not_detected',
    message: 'No response text was detected. Please check the browser manually.'
  };
}

export async function waitForResponseAfterSend(page, options = {}) {
  return waitForStableResponse(page, options);
}
