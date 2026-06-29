export const connectors = {
  chatgpt: { name: 'chatgpt', label: 'ChatGPT', startUrl: 'https://chat.openai.com' },
  gemini: { name: 'gemini', label: 'Gemini', startUrl: 'https://gemini.google.com' },
  claude: { name: 'claude', label: 'Claude', startUrl: 'https://claude.ai' },
  perplexity: { name: 'perplexity', label: 'Perplexity', startUrl: 'https://www.perplexity.ai' },
  generic: { name: 'generic', label: 'Generic Website', startUrl: 'https://www.google.com' }
};

export function getConnector(toolName) {
  const connector = connectors[toolName];
  if (!connector) throw new Error(`Tool "${toolName}" was not found.`);
  return connector;
}

export function listConnectors() {
  return Object.values(connectors);
}

export function getConnectorStartUrl(toolName) {
  return getConnector(toolName).startUrl;
}
