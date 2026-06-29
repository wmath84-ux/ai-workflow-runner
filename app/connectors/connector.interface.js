/**
 * Standard connector contract for browser-backed tools.
 * Implementations must never automate login or bypass manual verification.
 * Recoverable failures should return manual_intervention_required objects.
 */
export const connectorInterface = {
  name: '',
  label: '',
  startUrl: '',

  async open(page) {},
  async isReady(page) {},
  async fillPrompt(page, prompt) {},
  async send(page) {},
  async waitForDone(page, options) {},
  async extractAnswer(page) {},
  async runPrompt(page, prompt, options) {}
};

export function manualIntervention(message, extra = {}) {
  return {
    ok: false,
    errorType: 'manual_intervention_required',
    message,
    recoverable: true,
    ...extra
  };
}
