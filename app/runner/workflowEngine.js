import { validateWorkflow } from './workflowValidator.js';
import { buildStepContext, resolveVariables } from './variableResolver.js';
import { runMockStep } from './mockStepRunner.js';
import { withRetry } from './retryManager.js';
import { createCheckpoint, getCheckpoint, updateCheckpoint } from './checkpointManager.js';
import { saveFinalOutput, saveStepResult } from './resultSaver.js';
import { createRun, createRunStep, getRunById, listRunSteps, updateRunStatus, updateRunStep } from '../storage/runs.js';

function now() {
  return new Date().toISOString();
}

function normalizeError(error) {
  return {
    message: error?.message ?? 'Unknown workflow error',
    stack: error?.stack
  };
}

function formatRun({ run, workflowName, completedOutputs, steps, status, finalOutputPath }) {
  return {
    runId: run.id,
    workflowName: workflowName ?? run.workflowName,
    status: status ?? run.status,
    startedAt: run.startedAt,
    finishedAt: run.completedAt,
    completedOutputs,
    finalOutputPath,
    steps
  };
}

export async function runWorkflow(workflow, options = {}) {
  const validation = validateWorkflow(workflow);
  if (!validation.valid) {
    const message = validation.errors.map((error) => `${error.field}: ${error.message}`).join('\n');
    throw new Error(`Workflow validation failed:\n${message}`);
  }

  const run = createRun({ workflowName: workflow.workflowName, input: workflow.inputs, status: 'running' });
  const completedOutputs = {};
  const completedStepIds = [];
  const stepRecords = [];
  let finalOutputPath = null;

  createCheckpoint(run.id, {
    workflowName: workflow.workflowName,
    currentStepIndex: 0,
    completedStepIds,
    completedOutputs
  });

  for (let index = 0; index < workflow.steps.length; index += 1) {
    const step = workflow.steps[index];
    const stepRecord = createRunStep({ runId: run.id, stepKey: step.id, status: 'pending' });
    stepRecords.push(stepRecord);

    try {
      const context = buildStepContext(workflow.inputs, completedOutputs);
      const resolvedPrompt = resolveVariables(step.prompt, context);
      updateRunStep(stepRecord.id, {
        status: 'running',
        input: { step, resolvedPrompt, context },
        startedAt: now()
      });

      const result = await withRetry(
        () => runMockStep({ step, resolvedPrompt, context }),
        options.retry ?? { retries: 1, delayMs: 1000 }
      );

      completedOutputs[step.saveAs] = result.output;
      completedStepIds.push(step.id);
      const files = await saveStepResult({
        workflowName: workflow.workflowName,
        runId: run.id,
        step,
        resolvedPrompt,
        output: result.output,
        raw: result.raw
      });

      const completedStep = updateRunStep(stepRecord.id, {
        status: 'completed',
        input: { step, resolvedPrompt },
        output: { saveAs: step.saveAs, output: result.output, raw: result.raw, files },
        completedAt: now()
      });
      stepRecords[stepRecords.length - 1] = completedStep;

      updateCheckpoint(run.id, {
        workflowName: workflow.workflowName,
        currentStepIndex: index + 1,
        completedStepIds,
        completedOutputs
      });
    } catch (error) {
      const failedStep = updateRunStep(stepRecord.id, {
        status: 'failed',
        error: normalizeError(error),
        completedAt: now()
      });
      stepRecords[stepRecords.length - 1] = failedStep;
      const checkpoint = updateCheckpoint(run.id, {
        workflowName: workflow.workflowName,
        currentStepIndex: index,
        completedStepIds,
        completedOutputs,
        error: normalizeError(error)
      });
      const failedRun = updateRunStatus(run.id, 'failed', { checkpoint });
      return formatRun({ run: failedRun, workflowName: workflow.workflowName, completedOutputs, steps: listRunSteps(run.id), status: 'failed' });
    }
  }

  finalOutputPath = await saveFinalOutput({ workflowName: workflow.workflowName, runId: run.id, completedOutputs });
  const checkpoint = updateCheckpoint(run.id, {
    workflowName: workflow.workflowName,
    currentStepIndex: workflow.steps.length,
    completedStepIds,
    completedOutputs,
    finalOutputPath
  });
  const completedRun = updateRunStatus(run.id, 'completed', { checkpoint });
  return formatRun({ run: completedRun, workflowName: workflow.workflowName, completedOutputs, steps: listRunSteps(run.id), status: 'completed', finalOutputPath });
}

export async function resumeWorkflow(runId, options = {}) {
  const run = getRunById(runId);
  if (!run) {
    throw new Error(`Run ${runId} was not found.`);
  }
  const checkpoint = getCheckpoint(runId);
  return {
    runId,
    workflowName: run.workflowName,
    status: 'paused',
    startedAt: run.startedAt,
    finishedAt: run.completedAt,
    completedOutputs: checkpoint?.completedOutputs ?? {},
    steps: listRunSteps(runId),
    checkpoint,
    message: 'Resume skeleton is available; full resume execution will be implemented in a future command.',
    options
  };
}
