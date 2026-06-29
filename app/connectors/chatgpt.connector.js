import { clickFirstVisible, firstVisibleLocator, getLastTextFromSelectors, safeTextContent, waitForTextStable } from './selectorUtils.js';
import { manualIntervention } from './connector.interface.js';

const PROMPT_SELECTORS = ['textarea', "[contenteditable='true']", "div[contenteditable='true']", 'form textarea', 'main textarea'];
const SEND_SELECTORS = ["button[data-testid='send-button']", "button[aria-label*='Send']", "button[aria-label*='send']", "form button[type='submit']"];
const STOP_SELECTORS = ["button[data-testid='stop-button']", "button[aria-label*='Stop']", "button[aria-label*='stop']", "[data-testid='stop-button']"];
const ASSISTANT_SELECTORS = ["[data-message-author-role='assistant']", 'article', 'main div.markdown', '.markdown'];
const RESPONSE_SELECTORS = ['article', "main [data-message-author-role='assistant']", "[data-message-author-role='assistant']", 'div.markdown', 'main .markdown'];

function manual(message, extra = {}) {
  return manualIntervention(message, { tool: 'chatgpt', ...extra });
}

async function pageInfo(page) {
  return {
    url: page.url(),
    title: await page.title().catch(() => '')
  };
}

function cleanAnswer(text) {
  return String(text ?? '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^(ChatGPT said:|You said:)\s*/i, '')
    .trim();
}

export const chatgptConnector = {
  name: 'chatgpt',
  label: 'ChatGPT',
  startUrl: 'https://chat.openai.com',
  implemented: true,

  async open(page) {
    await page.goto(this.startUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    return pageInfo(page);
  },

  async isReady(page) {
    const url = page.url().toLowerCase();
    const bodyText = (await page.locator('body').textContent({ timeout: 3000 }).catch(() => '') ?? '').toLowerCase();

    if (!bodyText.trim()) return { ready: false, reason: 'ChatGPT page is empty or still loading.' };
    if (url.includes('auth') || bodyText.includes('log in') || bodyText.includes('sign up')) {
      return { ready: false, reason: 'ChatGPT login is required. Please log in manually in the browser window.' };
    }
    if (bodyText.includes('captcha') || bodyText.includes('verify you are human') || bodyText.includes('cloudflare')) {
      return { ready: false, reason: 'Manual verification is required. Complete it manually in the browser window.' };
    }
    if (bodyText.includes('unsupported browser')) {
      return { ready: false, reason: 'ChatGPT shows an unsupported browser message.' };
    }

    try {
      await firstVisibleLocator(page, PROMPT_SELECTORS, { timeoutMs: 5000 });
      return { ready: true, reason: null };
    } catch {
      return { ready: false, reason: 'Prompt input not found. User may need to log in manually.' };
    }
  },

  async fillPrompt(page, prompt) {
    try {
      this.lastPromptWasSingleLine = !String(prompt).includes('\n');
      const input = await firstVisibleLocator(page, PROMPT_SELECTORS);
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
      return manual(`Could not fill ChatGPT prompt input. ${error.message}`);
    }
  },

  async send(page) {
    try {
      const sendButton = await firstVisibleLocator(page, SEND_SELECTORS, { timeoutMs: 10000 });
      if (await sendButton.isDisabled().catch(() => false)) {
        return manual('ChatGPT send button is disabled. Check the prompt input manually, then retry.');
      }
      await sendButton.click({ timeout: 5000 });
      return { ok: true };
    } catch (error) {
      if (this.lastPromptWasSingleLine) {
        try {
          await page.keyboard.press('Enter');
          return { ok: true, warning: 'Send button not found; used Enter fallback for a single-line prompt.' };
        } catch {
          // Return the original selector error below.
        }
      }
      return manual(`ChatGPT send button was not found. ${error.message}`);
    }
  },

  async waitForDone(page, options = {}) {
    const responseTimeoutMs = options.responseTimeoutMs ?? 180000;
    const stableMs = options.stableMs ?? 2500;
    const pollMs = options.pollMs ?? 750;
    const startedAt = Date.now();
    let latestText = '';

    while (Date.now() - startedAt < responseTimeoutMs) {
      const latest = await getLastTextFromSelectors(page, RESPONSE_SELECTORS);
      if (latest.text) latestText = latest.text;

      const stopVisible = await Promise.all(STOP_SELECTORS.map(async (selector) => {
        const locator = page.locator(selector).last();
        return (await locator.count().catch(() => 0)) > 0 && await locator.isVisible().catch(() => false);
      })).then((values) => values.some(Boolean));

      if (latest.locator && !stopVisible) {
        const stableText = await waitForTextStable(latest.locator, { stableMs, pollMs, timeoutMs: Math.min(15000, responseTimeoutMs) }).catch(() => '');
        if (stableText) return { ok: true, output: stableText };
      }
      await page.waitForTimeout(pollMs);
    }

    if (latestText) {
      return { ok: true, warning: 'Response timed out after partial text was available.', output: latestText };
    }
    return manual('No ChatGPT response appeared before timeout. Check the browser manually, then retry.');
  },

  async extractAnswer(page) {
    const latest = await getLastTextFromSelectors(page, ASSISTANT_SELECTORS, { required: true });
    const output = cleanAnswer(await safeTextContent(latest.locator) || latest.text);
    if (!output) throw new Error('ChatGPT response was empty.');
    return {
      output,
      raw: {
        ...(await pageInfo(page)),
        extractedAt: new Date().toISOString()
      }
    };
  },

  async runPrompt(page, prompt, options = {}) {
    try {
      await this.open(page);
      const ready = await this.isReady(page);
      if (!ready.ready) return manual(`ChatGPT is not ready. ${ready.reason} Please complete the required action manually, then retry this step.`);

      const filled = await this.fillPrompt(page, prompt);
      if (!filled.ok) return filled;
      const sent = await this.send(page);
      if (!sent.ok) return sent;
      const done = await this.waitForDone(page, options);
      if (!done.ok) return done;
      const extracted = await this.extractAnswer(page);
      return {
        ok: true,
        output: extracted.output,
        raw: {
          tool: this.name,
          ...extracted.raw,
          warning: done.warning,
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      return manual(`ChatGPT connector needs manual intervention. ${error.message}`);
    }
  }
};
