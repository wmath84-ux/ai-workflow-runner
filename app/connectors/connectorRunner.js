import { runMockStep } from '../runner/mockStepRunner.js';
import { openToolTab, openUrlTab } from '../browser/tabManager.js';
import { getConnector, isConnectorImplemented } from './connectorRegistry.js';

function failure(message, extra = {}) {
  return { ok: false, recoverable: false, errorType: 'connector_error', message, ...extra };
}

function normalizeSuccess(result, step) {
  return {
    ok: true,
    output: result.output,
    raw: {
      ...result.raw,
      tool: step.tool,
      stepId: step.id,
      partial: Boolean(result.raw?.partial),
      warning: result.raw?.warning ?? null,
      createdAt: result.raw?.createdAt ?? new Date().toISOString()
    }
  };
}

export async function runConnectorStep({ step, resolvedPrompt, context, options = {} }) {
  if (step.tool === 'mock') {
    const result = await runMockStep({ step, resolvedPrompt, context });
    return { ok: true, output: result.output, raw: { ...result.raw, partial: false, warning: null } };
  }

  let connector;
  try {
    connector = getConnector(step.tool);
  } catch (error) {
    return failure(error.message, { errorType: 'unknown_tool' });
  }

  if (!isConnectorImplemented(step.tool)) {
    return failure(`Tool "${step.tool}" is registered but not implemented yet.`, { errorType: 'connector_not_implemented' });
  }

  try {
    let tab;
    if (step.tool === 'generic') {
      if (!step.url) return failure('Generic connector requires step.url.', { recoverable: true, errorType: 'manual_intervention_required' });
      tab = await openUrlTab(step.url, { reuse: true, includePage: true });
    } else {
      tab = await openToolTab(step.tool, { reuse: true, includePage: true });
    }

    if (!tab.page) {
      return failure(`${connector.label} tab failed to open. Open it manually, then retry.`, { recoverable: true, errorType: 'manual_intervention_required' });
    }

    const result = await connector.runPrompt(tab.page, resolvedPrompt, { ...(options[step.tool] ?? {}), step });
    if (!result.ok) return result;
    return normalizeSuccess(result, step);
  } catch (error) {
    return failure(`${connector.label} connector failed. ${error.message}`, { recoverable: true, errorType: 'manual_intervention_required' });
  }
}
