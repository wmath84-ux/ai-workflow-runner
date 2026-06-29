import { extractVariables } from '../runner/variableResolver.js';
export function detectPromptVariables(promptText = '') { return extractVariables(promptText); }
export function normalizePromptInput(prompt = {}) { return { ...prompt, tags: Array.isArray(prompt.tags) ? prompt.tags : String(prompt.tags ?? '').split(',').map((tag) => tag.trim()).filter(Boolean), variables: detectPromptVariables(prompt.promptText ?? prompt.prompt_text ?? '') }; }
