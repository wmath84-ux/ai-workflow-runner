import { runMockStep } from '../runner/mockStepRunner.js';
import { getBrowserContext } from '../browser/browserManager.js';
import { openToolTab } from '../browser/tabManager.js';
import { getConnector, isConnectorImplemented } from './connectorRegistry.js';

function failure(message, extra = {}) {
  return { ok: false, recoverable: false, errorType: 'connector_error', message, ...extra };
}

export async function runConnectorStep({ step, resolvedPrompt, context, options = {} }) {
  if (step.tool === 'mock') {
    const result = await runMockStep({ step, resolvedPrompt, context });
    return { ok: true, output: result.output, raw: result.raw };
  }

  let connector;
  try {
    connector = getConnector(step.tool);
  } catch (error) {
    return failure(error.message, { errorType: 'unknown_tool' });
  }

  if (!isConnectorImplemented(step.tool)) {
    return failure(`Tool "${step.tool}" is registered but not implemented yet. Use "mock" or "chatgpt" for now.`, { errorType: 'connector_not_implemented' });
  }

  if (step.tool !== 'chatgpt') {
    return failure(`Tool "${step.tool}" is not available for real browser execution yet.`, { errorType: 'connector_not_implemented' });
  }

  try {
    await openToolTab('chatgpt');
    const contextBrowser = getBrowserContext();
    if (!contextBrowser) {
      return failure('Browser is not running. Launch the browser and retry.', { recoverable: true, errorType: 'manual_intervention_required' });
    }
    const host = new URL(connector.startUrl).hostname;
    const page = contextBrowser.pages().find((candidate) => candidate.url().includes(host)) ?? contextBrowser.pages().at(-1);
    if (!page) {
      return failure('ChatGPT tab failed to open. Open ChatGPT manually, then retry.', { recoverable: true, errorType: 'manual_intervention_required' });
    }

    const result = await connector.runPrompt(page, resolvedPrompt, options.chatgpt ?? {});
    if (!result.ok) return result;
    return {
      ok: true,
      output: result.output,
      raw: {
        ...result.raw,
        tool: 'chatgpt',
        stepId: step.id,
        createdAt: result.raw?.createdAt ?? new Date().toISOString()
      }
    };
  } catch (error) {
    return failure(`ChatGPT connector failed. ${error.message}`, { recoverable: true, errorType: 'manual_intervention_required' });
  }
}
