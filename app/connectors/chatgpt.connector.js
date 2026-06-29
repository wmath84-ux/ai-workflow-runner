export const chatgptConnector = {
  name: 'chatgpt',
  label: 'ChatGPT',
  startUrl: 'https://chat.openai.com',

  async open(page) {
    await page.goto(this.startUrl, { waitUntil: 'domcontentloaded' });
  },

  async fillPrompt(page, prompt) {
    throw new Error('Prompt filling is not implemented yet. This will be added in Command 4.');
  },

  async send(page) {
    throw new Error('Sending is not implemented yet. This will be added in Command 4.');
  },

  async waitForDone(page) {
    throw new Error('Response waiting is not implemented yet. This will be added in Command 4.');
  },

  async extractAnswer(page) {
    throw new Error('Answer extraction is not implemented yet. This will be added in Command 4.');
  }
};
