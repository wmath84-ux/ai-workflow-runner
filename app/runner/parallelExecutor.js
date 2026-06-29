import { buildStepContext, resolveVariables } from './variableResolver.js';
import { saveStepResult, saveGroupMetadata } from './resultSaver.js';
import { runConnectorStep } from '../connectors/connectorRunner.js';
import { createRunStep, updateRunStep } from '../storage/runs.js';

function now() { return new Date().toISOString(); }

async function runChildStep({ step, context, runId, workflow, group, orderIndex, options, onStepUpdate }) {
  const stepRecord = createRunStep({ runId, stepKey: step.id, status: 'queued', parentGroupId: group.id, orderIndex });
  const resolvedPrompt = resolveVariables(step.prompt, context);
  updateRunStep(stepRecord.id, { status: 'running', input: { step, resolvedPrompt, context }, startedAt: now() });
  onStepUpdate?.({ stepId: step.id, status: 'running' });
  const result = await runConnectorStep({ step, resolvedPrompt, context, options });
  if (!result.ok) {
    const status = result.recoverable ? 'paused' : 'failed';
    const error = { message: result.message, errorType: result.errorType, recoverable: Boolean(result.recoverable) };
    updateRunStep(stepRecord.id, { status, input: { step, resolvedPrompt }, error, completedAt: now() });
    onStepUpdate?.({ stepId: step.id, status, error });
    return { status, step, error };
  }
  const files = await saveStepResult({ workflowName: workflow.workflowName, runId, step, resolvedPrompt, output: result.output, raw: result.raw });
  updateRunStep(stepRecord.id, {
    status: 'completed',
    input: { step, resolvedPrompt },
    output: { saveAs: step.saveAs, output: result.output, raw: result.raw, files },
    raw: result.raw,
    warning: result.raw?.warning ? { message: result.raw.warning } : null,
    partial: Boolean(result.raw?.partial),
    completedAt: now()
  });
  onStepUpdate?.({ stepId: step.id, status: 'completed' });
  return { status: 'completed', step, output: result.output, raw: result.raw };
}

export async function runParallelGroup({ group, context, runId, workflow, options = {}, onStepUpdate, onLog }) {
  const startedAt = now();
  const maxConcurrency = Math.max(1, Number(group.maxConcurrency ?? workflow.settings?.maxConcurrency ?? options.maxConcurrency ?? 2));
  const stopOnFailure = group.stopOnFailure ?? workflow.settings?.stopOnParallelStepFailure ?? workflow.settings?.stopOnFailure ?? true;
  const outputs = {};
  const completedStepIds = [];
  const failedSteps = [];
  const warnings = [];
  let pausedStep = null;
  let cursor = 0;

  async function worker(workerIndex) {
    while (cursor < group.steps.length && !pausedStep) {
      const step = group.steps[cursor++];
      onLog?.(`Starting parallel child ${step.id}`);
      const result = await runChildStep({ step, context, runId, workflow, group, orderIndex: cursor - 1, options, onStepUpdate });
      if (result.status === 'completed') {
        outputs[step.saveAs] = result.output;
        completedStepIds.push(step.id);
        if (result.raw?.warning) warnings.push({ stepId: step.id, message: result.raw.warning });
      } else if (result.status === 'paused') {
        pausedStep = { id: step.id, message: result.error.message, errorType: result.error.errorType };
        break;
      } else {
        failedSteps.push({ id: step.id, message: result.error.message });
        if (stopOnFailure) break;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(maxConcurrency, group.steps.length) }, (_, index) => worker(index)));
  let status = 'completed';
  if (pausedStep) status = 'paused';
  else if (failedSteps.length && stopOnFailure) status = 'failed';
  else if (failedSteps.length === group.steps.length) status = 'failed';

  await saveGroupMetadata({ workflowName: workflow.workflowName, runId, group, metadata: { groupId: group.id, label: group.label, status, maxConcurrency, childStepIds: group.steps.map((step) => step.id), completedStepIds, failedStepIds: failedSteps.map((step) => step.id), startedAt, finishedAt: now(), warnings } });
  return { status, outputs, completedStepIds, failedSteps, pausedStep, warnings };
}
