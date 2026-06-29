import { chatgptConnector } from './chatgpt.connector.js';
import { geminiConnector } from './gemini.connector.js';
import { genericConnector } from './generic.connector.js';

export const connectors = {
  mock: { name: 'mock', label: 'Mock Runner', startUrl: '', implemented: true, requiresManualLogin: false },
  chatgpt: { ...chatgptConnector, requiresManualLogin: true },
  gemini: geminiConnector,
  generic: genericConnector,
  claude: { name: 'claude', label: 'Claude', startUrl: 'https://claude.ai', implemented: false, requiresManualLogin: true },
  perplexity: { name: 'perplexity', label: 'Perplexity', startUrl: 'https://www.perplexity.ai', implemented: false, requiresManualLogin: true }
};

export function getConnector(toolName) {
  const connector = connectors[toolName];
  if (!connector) throw new Error(`Tool "${toolName}" was not found.`);
  return connector;
}

export function listConnectors() {
  return Object.values(connectors).map(({ name, label, startUrl, implemented, requiresManualLogin }) => ({
    name,
    label,
    startUrl,
    implemented: Boolean(implemented),
    requiresManualLogin: Boolean(requiresManualLogin)
  }));
}

export function getConnectorStartUrl(toolName) {
  return getConnector(toolName).startUrl;
}

export function isConnectorImplemented(toolName) {
  return Boolean(getConnector(toolName).implemented);
}

export function getImplementedConnectors() {
  return listConnectors().filter((connector) => connector.implemented);
}
