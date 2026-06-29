import { manualIntervention } from './connector.interface.js';
import { firstVisibleLocator, getLastTextFromSelectors, safeTextContent } from './selectorUtils.js';
import { waitForStableResponse } from './responseWaiter.js';

const INPUT_SELECTORS = ["rich-textarea div[contenteditable='true']", "div[contenteditable='true']", 'textarea', "[role='textbox']", "main [contenteditable='true']"];
const SEND_SELECTORS = ["button[aria-label*='Send']", "button[aria-label*='send']", "button[data-testid*='send']", "button[type='submit']", "button:has(mat-icon)"];
const RESPONSE_SELECTORS = ['message-content', '.model-response-text', '[data-response-index]', 'main .markdown', "main [dir='ltr']"];
const GENERATING_SELECTORS = ["button[aria-label*='Stop']", "button[aria-label*='stop']", "[aria-label*='Stop generating']", '.loading', '.spinner'];

function manual(message, extra = {}) {
  return manualIntervention(message, { tool: 'gemini', ...extra });
}

async function pageInfo(page) {
  return { url: page.url(), title: await page.title().catch(() => '') };
}

function cleanAnswer(text) {
  return String(text ?? '').replace(/\n{4,}/g, '\n\n\n').trim();
}

export const geminiConnector = {
  name: 'gemini',
  label: 'Gemini',
  startUrl: 'https://gemini.google.com',
  implemented: true,
  requiresManualLogin: true,

  async open(page) {
    await page.goto(this.startUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    return pageInfo(page);
  },

  async isReady(page) {
    const url = page.url().toLowerCase();
    const bodyText = (await page.locator('body').textContent({ timeout: 3000 }).catch(() => '') ?? '').toLowerCase();
    if (!bodyText.trim()) return { ready: false, reason: 'Gemini page is empty or still loading.' };
    if (url.includes('accounts.google.com') || bodyText.includes('sign in') || bodyText.includes('choose an account')) {
      return { ready: false, reason: 'Google/Gemini login is required. Please log in manually.' };
    }
    if (bodyText.includes('captcha') || bodyText.includes('verify') || bodyText.includes('unusual traffic')) {
      return { ready: false, reason: 'Manual verification is required. Complete it manually in the browser window.' };
    }
    if (bodyText.includes('unsupported browser')) return { ready: false, reason: 'Gemini shows an unsupported browser message.' };
    try {
      await firstVisibleLocator(page, INPUT_SELECTORS, { timeoutMs: 5000 });
      return { ready: true, reason: null };
    } catch {
      return { ready: false, reason: 'Gemini prompt input not found. Please log in manually.' };
    }
  },

  async fillPrompt(page, prompt) {
    try {
      const input = await firstVisibleLocator(page, INPUT_SELECTORS);
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
      return manual(`Could not fill Gemini prompt input. ${error.message}`);
    }
  },

  async send(page) {
    try {
      const button = await firstVisibleLocator(page, SEND_SELECTORS, { timeoutMs: 10000 });
      if (await button.isDisabled().catch(() => false)) return manual('Gemini send button is disabled. Check the prompt manually, then retry.');
      await button.click({ timeout: 5000 });
      return { ok: true };
    } catch (error) {
      return manual(`Gemini send button was not found. ${error.message}`);
    }
  },

  async waitForDone(page, options = {}) {
    const waited = await waitForStableResponse(page, {
      responseSelectors: RESPONSE_SELECTORS,
      generatingSelectors: GENERATING_SELECTORS,
      timeoutMs: options.timeoutMs ?? options.responseTimeoutMs ?? 180000,
      stableMs: options.stableMs ?? 3000,
      pollMs: options.pollMs ?? 750
    });
    if (!waited.ok) return manual(waited.message, { errorType: waited.errorType });
    return { ok: true, output: waited.text, partial: waited.partial, warning: waited.warning };
  },

  async extractAnswer(page) {
    const latest = await getLastTextFromSelectors(page, RESPONSE_SELECTORS, { required: true });
    const output = cleanAnswer(await safeTextContent(latest.locator) || latest.text);
    if (!output) throw new Error('Gemini response was empty.');
    return { output, raw: { tool: 'gemini', ...(await pageInfo(page)), extractedAt: new Date().toISOString() } };
  },

  async runPrompt(page, prompt, options = {}) {
    try {
      await this.open(page);
      const ready = await this.isReady(page);
      if (!ready.ready) return manual(`Gemini is not ready. ${ready.reason} Please log in manually in the opened browser tab, then retry this step.`);
      const filled = await this.fillPrompt(page, prompt);
      if (!filled.ok) return filled;
      const sent = await this.send(page);
      if (!sent.ok) return sent;
      const done = await this.waitForDone(page, options);
      if (!done.ok) return done;
      const extracted = await this.extractAnswer(page);
      return { ok: true, output: extracted.output, raw: { ...extracted.raw, partial: Boolean(done.partial), warning: done.warning ?? null, createdAt: new Date().toISOString() } };
    } catch (error) {
      return manual(`Gemini connector needs manual intervention. ${error.message}`);
    }
  }
};
