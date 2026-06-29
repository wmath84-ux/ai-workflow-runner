const DEFAULT_SELECTOR_TIMEOUT_MS = 15000;
const DEFAULT_STABLE_MS = 2500;
const DEFAULT_POLL_MS = 750;

function timeoutMessage(selectors) {
  return `None of these selectors became visible: ${selectors.join(', ')}`;
}

export async function firstVisibleLocator(page, selectors, options = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_SELECTOR_TIMEOUT_MS;
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < timeoutMs) {
    for (const selector of selectors) {
      try {
        const locator = page.locator(selector).last();
        if ((await locator.count()) > 0 && await locator.isVisible().catch(() => false)) {
          return locator;
        }
      } catch (error) {
        lastError = error;
      }
    }
    await page.waitForTimeout(options.pollMs ?? DEFAULT_POLL_MS);
  }

  throw new Error(lastError?.message || timeoutMessage(selectors));
}

export async function clickFirstVisible(page, selectors, options = {}) {
  const locator = await firstVisibleLocator(page, selectors, options);
  await locator.click({ timeout: options.clickTimeoutMs ?? 5000 });
  return locator;
}

export async function fillFirstVisible(page, selectors, value, options = {}) {
  const locator = await firstVisibleLocator(page, selectors, options);
  await locator.click({ timeout: 5000 });
  await locator.fill(value, { timeout: options.fillTimeoutMs ?? 10000 });
  return locator;
}

export async function safeTextContent(locator) {
  try {
    return ((await locator.textContent()) ?? '').trim();
  } catch {
    return '';
  }
}

export async function getLastTextFromSelectors(page, selectors, options = {}) {
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector).last();
      if ((await locator.count()) > 0) {
        const text = await safeTextContent(locator);
        if (text) return { text, locator, selector };
      }
    } catch {
      // Try the next selector.
    }
  }
  if (options.required) throw new Error(timeoutMessage(selectors));
  return { text: '', locator: null, selector: null };
}

export async function waitForTextStable(locator, options = {}) {
  const stableMs = options.stableMs ?? DEFAULT_STABLE_MS;
  const pollMs = options.pollMs ?? DEFAULT_POLL_MS;
  const timeoutMs = options.timeoutMs ?? 180000;
  const startedAt = Date.now();
  let lastText = '';
  let stableSince = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const text = await safeTextContent(locator);
    if (text !== lastText) {
      lastText = text;
      stableSince = Date.now();
    } else if (text && Date.now() - stableSince >= stableMs) {
      return text;
    }
    await locator.page().waitForTimeout(pollMs);
  }

  if (lastText) return lastText;
  throw new Error('Response text did not become stable before timeout.');
}
