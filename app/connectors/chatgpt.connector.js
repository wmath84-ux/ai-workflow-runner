export const chatgptConnector = {
  name: 'chatgpt',
  startUrl: '',
  async open(page) {
    // TODO: Open chatgpt in a Playwright page without login or bypass automation.
  },
  async fillPrompt(page, prompt) {
    // TODO: Fill prompt once safe selectors are defined.
  },
  async send(page) {
    // TODO: Send the prompt once connector behavior is implemented.
  },
  async waitForDone(page) {
    // TODO: Wait for completion using connector-specific signals.
  },
  async extractAnswer(page) {
    // TODO: Extract answer text when connector implementation is added.
    return '';
  }
};
