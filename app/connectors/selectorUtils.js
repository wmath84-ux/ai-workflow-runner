const DEFAULT_SELECTOR_TIMEOUT_MS = 15000;
const DEFAULT_POLL_MS = 750;

function asSelectorArray(selectors) {
  return Array.isArray(selectors) ? selectors.filter(Boolean) : [selectors].filter(Boolean);
}

function timeoutMessage(selectors) {
  return `None of these selectors became visible: ${asSelectorArray(selectors).join(', ')}`;
}

export function normalizeWhitespace(text = '') {
  return String(text)
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

export async function getVisibleLocators(page, selectors, options = {}) {
  const locators = [];
  for (const selector of asSelectorArray(selectors)) {
    try {
      const matches = page.locator(selector);
      const count = await matches.count().catch(() => 0);
      for (let index = 0; index < count; index += 1) {
        const locator = matches.nth(index);
        if (await locator.isVisible({ timeout: options.visibleTimeoutMs ?? 250 }).catch(() => false)) {
          locators.push({ selector, locator });
        }
      }
    } catch {
      // Ignore this selector and continue with the next one.
    }
  }
  return locators;
}

export async function isAnySelectorVisible(page, selectors, options = {}) {
  return (await getVisibleLocators(page, selectors, options)).length > 0;
}

export async function firstVisibleLocator(page, selectors, options = {}) {
  const selectorList = asSelectorArray(selectors);
  const timeoutMs = options.timeoutMs ?? DEFAULT_SELECTOR_TIMEOUT_MS;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const visible = await getVisibleLocators(page, selectorList, options);
    if (visible.length > 0) return visible.at(-1).locator;
    await page.waitForTimeout(options.pollMs ?? DEFAULT_POLL_MS);
  }
  throw new Error(timeoutMessage(selectorList));
}

export async function safeClick(locator, options = {}) {
  await locator.click({ timeout: options.timeoutMs ?? 5000 });
  return true;
}

export async function safeFill(locator, value, options = {}) {
  await locator.click({ timeout: options.clickTimeoutMs ?? 5000 });
  await locator.fill(value, { timeout: options.timeoutMs ?? 10000 });
  return true;
}

export async function clickFirstVisible(page, selectors, options = {}) {
  const locator = await firstVisibleLocator(page, selectors, options);
  await safeClick(locator, options);
  return locator;
}

export async function fillFirstVisible(page, selectors, value, options = {}) {
  const locator = await firstVisibleLocator(page, selectors, options);
  await safeFill(locator, value, options);
  return locator;
}

export async function safeTextContent(locator) {
  try {
    return normalizeWhitespace((await locator.textContent()) ?? '');
  } catch {
    return '';
  }
}

export async function getLastTextFromSelectors(page, selectors, options = {}) {
  for (const selector of asSelectorArray(selectors)) {
    try {
      const locator = page.locator(selector).last();
      if ((await locator.count()) > 0) {
        const text = await safeTextContent(locator);
        if (text.length >= (options.minTextLength ?? 1)) return { text, locator, selector };
      }
    } catch {
      // Try the next selector.
    }
  }
  if (options.required) throw new Error(timeoutMessage(selectors));
  return { text: '', locator: null, selector: null };
}

export async function waitForTextStable(locator, options = {}) {
  const stableMs = options.stableMs ?? 3000;
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
