import { validateWorkflow } from './workflowValidator.js';
import { buildStepContext, resolveVariables } from './variableResolver.js';
import { getCheckpoint, updateCheckpoint, createCheckpoint } from './checkpointManager.js';
import { saveFinalOutput, saveStepResult } from './resultSaver.js';
import { runConnectorStep } from '../connectors/connectorRunner.js';
import { createRun, createRunStep, getRunById, listRunSteps, updateRunStatus, updateRunStep } from '../storage/runs.js';

function now() {
  return new Date().toISOString();
}

function normalizeError(error) {
  return {
    message: error?.message ?? error?.message ?? 'Unknown workflow error',
    errorType: error?.errorType,
    recoverable: Boolean(error?.recoverable),
    stack: error?.stack
  };
}

function formatRun({ run, workflowName, completedOutputs, status, finalOutputPath, pauseInfo = {} }) {
  return {
    runId: run.id,
    workflowName: workflowName ?? run.workflowName,
    status: status ?? run.status,
    startedAt: run.startedAt,
    finishedAt: run.completedAt,
    completedOutputs,
    finalOutputPath,
    steps: listRunSteps(run.id),
    ...pauseInfo
  };
}

async function executeWorkflowFrom({ workflow, run, startIndex = 0, completedOutputs = {}, completedStepIds = [], options = {} }) {
  let finalOutputPath = null;

  for (let index = startIndex; index < workflow.steps.length; index += 1) {
    const step = workflow.steps[index];
    const stepRecord = createRunStep({ runId: run.id, stepKey: step.id, status: 'pending' });

    try {
      const context = buildStepContext(workflow.inputs, completedOutputs);
      const resolvedPrompt = resolveVariables(step.prompt, context);
      updateRunStep(stepRecord.id, {
        status: 'running',
        input: { step, resolvedPrompt, context },
        startedAt: now()
      });

      const result = await runConnectorStep({ step, resolvedPrompt, context, options });
      if (!result.ok) {
        const errorDetails = {
          message: result.message,
          errorType: result.errorType,
          recoverable: Boolean(result.recoverable)
        };
        updateRunStep(stepRecord.id, {
          status: result.recoverable ? 'paused' : 'failed',
          input: { step, resolvedPrompt },
          error: errorDetails,
          completedAt: now()
        });
        const checkpoint = updateCheckpoint(run.id, {
          workflow,
          workflowName: workflow.workflowName,
          currentStepIndex: index,
          pausedStepId: result.recoverable ? step.id : null,
          completedStepIds,
          completedOutputs,
          error: errorDetails
        });
        const nextStatus = result.recoverable ? 'paused' : 'failed';
        const updatedRun = updateRunStatus(run.id, nextStatus, { checkpoint });
        return formatRun({
          run: updatedRun,
          workflowName: workflow.workflowName,
          completedOutputs,
          status: nextStatus,
          pauseInfo: result.recoverable ? {
            reason: result.errorType,
            message: result.message,
            pausedStepId: step.id
          } : { message: result.message }
        });
      }

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

      updateRunStep(stepRecord.id, {
        status: 'completed',
        input: { step, resolvedPrompt },
        output: { saveAs: step.saveAs, output: result.output, raw: result.raw, files },
        completedAt: now()
      });

      updateCheckpoint(run.id, {
        workflow,
        workflowName: workflow.workflowName,
        currentStepIndex: index + 1,
        pausedStepId: null,
        completedStepIds,
        completedOutputs
      });
    } catch (error) {
      const normalized = normalizeError(error);
      updateRunStep(stepRecord.id, {
        status: 'failed',
        error: normalized,
        completedAt: now()
      });
      const checkpoint = updateCheckpoint(run.id, {
        workflow,
        workflowName: workflow.workflowName,
        currentStepIndex: index,
        completedStepIds,
        completedOutputs,
        error: normalized
      });
      const failedRun = updateRunStatus(run.id, 'failed', { checkpoint });
      return formatRun({ run: failedRun, workflowName: workflow.workflowName, completedOutputs, status: 'failed', pauseInfo: { message: normalized.message } });
    }
  }

  finalOutputPath = await saveFinalOutput({ workflowName: workflow.workflowName, runId: run.id, completedOutputs });
  const checkpoint = updateCheckpoint(run.id, {
    workflow,
    workflowName: workflow.workflowName,
    currentStepIndex: workflow.steps.length,
    pausedStepId: null,
    completedStepIds,
    completedOutputs,
    finalOutputPath
  });
  const completedRun = updateRunStatus(run.id, 'completed', { checkpoint });
  return formatRun({ run: completedRun, workflowName: workflow.workflowName, completedOutputs, status: 'completed', finalOutputPath });
}

export async function runWorkflow(workflow, options = {}) {
  const validation = validateWorkflow(workflow);
  if (!validation.valid) {
    const message = validation.errors.map((error) => `${error.field}: ${error.message}`).join('\n');
    throw new Error(`Workflow validation failed:\n${message}`);
  }

  const run = createRun({ workflowName: workflow.workflowName, input: { workflowInputs: workflow.inputs, workflow }, status: 'running' });
  createCheckpoint(run.id, {
    workflow,
    workflowName: workflow.workflowName,
    currentStepIndex: 0,
    pausedStepId: null,
    completedStepIds: [],
    completedOutputs: {}
  });

  return executeWorkflowFrom({ workflow, run, options });
}

export async function retryPausedStep(runId, options = {}) {
  const run = getRunById(runId);
  if (!run) throw new Error(`Run ${runId} was not found.`);
  const checkpoint = getCheckpoint(runId);
  if (!checkpoint) throw new Error(`No checkpoint found for run ${runId}.`);
  if (!checkpoint.pausedStepId && run.status !== 'paused') throw new Error(`Run ${runId} is not paused.`);
  if (!checkpoint.workflow) throw new Error('Paused workflow definition was not found in checkpoint.');

  updateRunStatus(runId, 'running');
  return executeWorkflowFrom({
    workflow: checkpoint.workflow,
    run: getRunById(runId),
    startIndex: checkpoint.currentStepIndex ?? 0,
    completedOutputs: { ...(checkpoint.completedOutputs ?? {}) },
    completedStepIds: [...(checkpoint.completedStepIds ?? [])],
    options
  });
}

export async function resumeWorkflow(runId, options = {}) {
  const run = getRunById(runId);
  if (!run) throw new Error(`Run ${runId} was not found.`);
  const checkpoint = getCheckpoint(runId);
  return {
    runId,
    workflowName: run.workflowName,
    status: run.status,
    startedAt: run.startedAt,
    finishedAt: run.completedAt,
    completedOutputs: checkpoint?.completedOutputs ?? {},
    steps: listRunSteps(runId),
    checkpoint,
    message: checkpoint?.pausedStepId ? 'Run is paused. Complete manual action, then retry the paused step.' : 'No paused step is currently available.',
    options
  };
}
