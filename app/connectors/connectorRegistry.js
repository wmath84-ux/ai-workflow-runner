import { chatgptConnector } from './chatgpt.connector.js';

export const connectors = {
  mock: { name: 'mock', label: 'Mock Runner', startUrl: '', implemented: true },
  chatgpt: chatgptConnector,
  gemini: { name: 'gemini', label: 'Gemini', startUrl: 'https://gemini.google.com', implemented: false },
  claude: { name: 'claude', label: 'Claude', startUrl: 'https://claude.ai', implemented: false },
  perplexity: { name: 'perplexity', label: 'Perplexity', startUrl: 'https://www.perplexity.ai', implemented: false },
  generic: { name: 'generic', label: 'Generic Website', startUrl: 'https://www.google.com', implemented: false }
};

export function getConnector(toolName) {
  const connector = connectors[toolName];
  if (!connector) throw new Error(`Tool "${toolName}" was not found.`);
  return connector;
}

export function listConnectors() {
  return Object.values(connectors).map(({ name, label, startUrl, implemented }) => ({ name, label, startUrl, implemented: Boolean(implemented) }));
}

export function getConnectorStartUrl(toolName) {
  return getConnector(toolName).startUrl;
}

export function isConnectorImplemented(toolName) {
  return Boolean(getConnector(toolName).implemented);
}
