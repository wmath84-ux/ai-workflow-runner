import { manualIntervention } from './connector.interface.js';
import { firstVisibleLocator, getLastTextFromSelectors, safeTextContent } from './selectorUtils.js';
import { waitForStableResponse } from './responseWaiter.js';

const DEFAULT_SELECTORS = {
  input: ['textarea', "[contenteditable='true']", "[role='textbox']"],
  send: ["button[type='submit']", "button[aria-label*='Send']", "button[aria-label*='send']"],
  response: ['article', '.response', '.markdown', 'main'],
  generating: ['.loading', '.spinner', "[aria-busy='true']"]
};

function manual(message, extra = {}) {
  return manualIntervention(message, { tool: 'generic', ...extra });
}

function selectorsFor(step = {}) {
  return { ...DEFAULT_SELECTORS, ...(step.selectors ?? {}) };
}

async function pageInfo(page) {
  return { url: page.url(), title: await page.title().catch(() => '') };
}

export const genericConnector = {
  name: 'generic',
  label: 'Generic Website',
  startUrl: 'https://www.google.com',
  implemented: true,
  requiresManualLogin: false,

  async open(page, step = {}) {
    if (!step.url) throw new Error('Generic connector requires step.url.');
    await page.goto(step.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    return pageInfo(page);
  },

  async isReady(page, step = {}) {
    const selectors = selectorsFor(step);
    try {
      await firstVisibleLocator(page, selectors.input, { timeoutMs: 5000 });
      return { ready: true, reason: null };
    } catch {
      return { ready: false, reason: 'Generic input selector was not found. Check step.selectors.input or complete manual setup.' };
    }
  },

  async fillPrompt(page, prompt, step = {}) {
    const selectors = selectorsFor(step);
    try {
      const input = await firstVisibleLocator(page, selectors.input);
      await input.click({ timeout: 5000 });
      try {
        await input.fill('', { timeout: 5000 });
        await input.fill(prompt, { timeout: 15000 });
      } catch {
        await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.insertText(prompt);
      }
      return { ok: true };
    } catch (error) {
      return manual(`Generic connector could not fill the prompt. ${error.message}`);
    }
  },

  async send(page, step = {}) {
    const selectors = selectorsFor(step);
    try {
      const button = await firstVisibleLocator(page, selectors.send, { timeoutMs: 10000 });
      if (await button.isDisabled().catch(() => false)) return manual('Generic send button is disabled.');
      await button.click({ timeout: 5000 });
      return { ok: true };
    } catch (error) {
      return manual(`Generic send selector was not found. ${error.message}`);
    }
  },

  async waitForDone(page, step = {}, options = {}) {
    const selectors = selectorsFor(step);
    const waited = await waitForStableResponse(page, {
      responseSelectors: selectors.response,
      generatingSelectors: selectors.generating,
      timeoutMs: options.timeoutMs ?? options.responseTimeoutMs ?? 180000,
      stableMs: options.stableMs ?? 3000,
      pollMs: options.pollMs ?? 750
    });
    if (!waited.ok) return manual(waited.message, { errorType: waited.errorType });
    return { ok: true, output: waited.text, partial: waited.partial, warning: waited.warning };
  },

  async extractAnswer(page, step = {}) {
    const selectors = selectorsFor(step);
    const latest = await getLastTextFromSelectors(page, selectors.response, { required: true });
    const output = await safeTextContent(latest.locator) || latest.text;
    if (!output) throw new Error('Generic response was empty.');
    return { output, raw: { tool: 'generic', ...(await pageInfo(page)), extractedAt: new Date().toISOString() } };
  },

  async runPrompt(page, prompt, options = {}) {
    const step = options.step ?? {};
    try {
      await this.open(page, step);
      const ready = await this.isReady(page, step);
      if (!ready.ready) return manual(`Generic connector is not ready. ${ready.reason}`);
      const filled = await this.fillPrompt(page, prompt, step);
      if (!filled.ok) return filled;
      const sent = await this.send(page, step);
      if (!sent.ok) return sent;
      const done = await this.waitForDone(page, step, options);
      if (!done.ok) return done;
      const extracted = await this.extractAnswer(page, step);
      return { ok: true, output: extracted.output, raw: { ...extracted.raw, partial: Boolean(done.partial), warning: done.warning ?? null, createdAt: new Date().toISOString() } };
    } catch (error) {
      return manual(`Generic connector needs manual intervention. ${error.message}`);
    }
  }
};
