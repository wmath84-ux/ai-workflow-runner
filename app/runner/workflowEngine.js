import { validateWorkflow } from './workflowValidator.js';
import { buildStepContext, resolveVariables } from './variableResolver.js';
import { getCheckpoint, updateCheckpoint, createCheckpoint } from './checkpointManager.js';
import { saveFinalOutput, saveStepResult } from './resultSaver.js';
import { runConnectorStep } from '../connectors/connectorRunner.js';
import { createExecutionPlan } from './workflowPlanner.js';
import { runParallelGroup } from './parallelExecutor.js';
import { createRun, createRunGroup, createRunStep, getRunById, listRunGroups, listRunSteps, updateRunGroup, updateRunStatus, updateRunStep } from '../storage/runs.js';

function now() { return new Date().toISOString(); }
function errorDetails(result) { return { message: result.message, errorType: result.errorType, recoverable: Boolean(result.recoverable) }; }

function formatRun({ run, workflowName, completedOutputs, status, finalOutputPath, pauseInfo = {} }) {
  return { runId: run.id, workflowName: workflowName ?? run.workflowName, status: status ?? run.status, startedAt: run.startedAt, finishedAt: run.completedAt, completedOutputs, finalOutputPath, steps: listRunSteps(run.id), groups: listRunGroups(run.id), ...pauseInfo };
}

async function runSingleStep({ step, workflow, run, unitIndex, completedOutputs, completedStepIds, options, parentGroupId = null, orderIndex = null }) {
  const context = buildStepContext(workflow.inputs, completedOutputs);
  const resolvedPrompt = resolveVariables(step.prompt, context);
  const stepRecord = createRunStep({ runId: run.id, stepKey: step.id, status: 'queued', parentGroupId, orderIndex });
  updateRunStep(stepRecord.id, { status: 'running', input: { step, resolvedPrompt, context }, startedAt: now() });
  const result = await runConnectorStep({ step, resolvedPrompt, context, options });
  if (!result.ok) {
    const details = errorDetails(result);
    updateRunStep(stepRecord.id, { status: result.recoverable ? 'paused' : 'failed', input: { step, resolvedPrompt }, error: details, completedAt: now() });
    return { ok: false, recoverable: result.recoverable, details, stepId: step.id };
  }
  completedOutputs[step.saveAs] = result.output;
  completedStepIds.push(step.id);
  const files = await saveStepResult({ workflowName: workflow.workflowName, runId: run.id, step, resolvedPrompt, output: result.output, raw: result.raw });
  updateRunStep(stepRecord.id, { status: 'completed', input: { step, resolvedPrompt }, output: { saveAs: step.saveAs, output: result.output, raw: result.raw, files }, raw: result.raw, warning: result.raw?.warning ? { message: result.raw.warning } : null, partial: Boolean(result.raw?.partial), completedAt: now() });
  return { ok: true };
}

async function executePlanFrom({ workflow, run, startUnitIndex = 0, completedOutputs = {}, completedStepIds = [], failedStepIds = [], groupState = {}, options = {} }) {
  const plan = createExecutionPlan(workflow);
  for (let unitIndex = startUnitIndex; unitIndex < plan.units.length; unitIndex += 1) {
    const unit = plan.units[unitIndex];
    if (unit.type === 'single') {
      const single = await runSingleStep({ step: unit.step, workflow, run, unitIndex, completedOutputs, completedStepIds, options, orderIndex: unitIndex });
      if (!single.ok) {
        const checkpoint = updateCheckpoint(run.id, { workflow, workflowName: workflow.workflowName, currentUnitIndex: unitIndex, currentGroupId: null, pausedStepId: single.recoverable ? single.stepId : null, completedStepIds, failedStepIds, completedOutputs, groupState, error: single.details });
        const status = single.recoverable ? 'paused' : 'failed';
        const updated = updateRunStatus(run.id, status, { checkpoint });
        return formatRun({ run: updated, workflowName: workflow.workflowName, completedOutputs, status, pauseInfo: { reason: single.details.errorType, message: single.details.message, pausedStepId: single.stepId } });
      }
      updateCheckpoint(run.id, { workflow, workflowName: workflow.workflowName, currentUnitIndex: unitIndex + 1, currentGroupId: null, pausedStepId: null, completedStepIds, failedStepIds, completedOutputs, groupState });
    } else {
      const groupRecord = createRunGroup({ runId: run.id, groupId: unit.id, label: unit.label, status: 'running', raw: { maxConcurrency: unit.maxConcurrency } });
      const context = buildStepContext(workflow.inputs, completedOutputs);
      const runnableGroup = { ...unit, steps: unit.steps.filter((step) => !completedStepIds.includes(step.id)) };
      const result = await runParallelGroup({ group: runnableGroup, context, runId: run.id, workflow, options });
      Object.assign(completedOutputs, result.outputs);
      completedStepIds.push(...result.completedStepIds.filter((id) => !completedStepIds.includes(id)));
      failedStepIds.push(...result.failedSteps.map((step) => step.id).filter((id) => !failedStepIds.includes(id)));
      groupState[unit.id] = { status: result.status, completedStepIds: result.completedStepIds, failedStepIds: result.failedSteps.map((step) => step.id), pendingStepIds: unit.steps.map((step) => step.id).filter((id) => !result.completedStepIds.includes(id)) };
      updateRunGroup(groupRecord.id, { status: result.status, finishedAt: now(), raw: groupState[unit.id] });
      if (result.status === 'paused' || result.status === 'failed') {
        const checkpoint = updateCheckpoint(run.id, { workflow, workflowName: workflow.workflowName, currentUnitIndex: unitIndex, currentGroupId: unit.id, pausedStepId: result.pausedStep?.id ?? null, completedStepIds, failedStepIds, completedOutputs, groupState, error: result.pausedStep ?? result.failedSteps[0] });
        const status = result.status;
        const updated = updateRunStatus(run.id, status, { checkpoint });
        return formatRun({ run: updated, workflowName: workflow.workflowName, completedOutputs, status, pauseInfo: { reason: result.pausedStep ? 'manual_intervention_required' : 'parallel_group_failed', message: result.pausedStep?.message ?? result.failedSteps[0]?.message, pausedStepId: result.pausedStep?.id, currentGroupId: unit.id } });
      }
      updateCheckpoint(run.id, { workflow, workflowName: workflow.workflowName, currentUnitIndex: unitIndex + 1, currentGroupId: null, pausedStepId: null, completedStepIds, failedStepIds, completedOutputs, groupState });
    }
  }
  const finalOutputPath = await saveFinalOutput({ workflowName: workflow.workflowName, runId: run.id, completedOutputs });
  const checkpoint = updateCheckpoint(run.id, { workflow, workflowName: workflow.workflowName, currentUnitIndex: plan.units.length, currentGroupId: null, pausedStepId: null, completedStepIds, failedStepIds, completedOutputs, groupState, finalOutputPath });
  const completed = updateRunStatus(run.id, 'completed', { checkpoint });
  return formatRun({ run: completed, workflowName: workflow.workflowName, completedOutputs, status: 'completed', finalOutputPath });
}

export async function runWorkflow(workflow, options = {}) {
  const validation = validateWorkflow(workflow);
  if (!validation.valid) throw new Error(`Workflow validation failed:\n${validation.errors.map((e) => `${e.field}: ${e.message}`).join('\n')}`);
  const run = createRun({ workflowName: workflow.workflowName, input: { workflowInputs: workflow.inputs, workflow }, status: 'running' });
  createCheckpoint(run.id, { workflow, workflowName: workflow.workflowName, currentUnitIndex: 0, currentGroupId: null, pausedStepId: null, completedStepIds: [], failedStepIds: [], completedOutputs: {}, groupState: {} });
  return executePlanFrom({ workflow, run, options });
}

export async function retryPausedStep(runId, options = {}) { return resumeWorkflow(runId, options); }

export async function resumeWorkflow(runId, options = {}) {
  const run = getRunById(runId);
  if (!run) throw new Error(`Run ${runId} was not found.`);
  const checkpoint = getCheckpoint(runId);
  if (!checkpoint?.workflow) throw new Error(`No resumable checkpoint found for run ${runId}.`);
  updateRunStatus(runId, 'running');
  return executePlanFrom({ workflow: checkpoint.workflow, run: getRunById(runId), startUnitIndex: checkpoint.currentUnitIndex ?? 0, completedOutputs: { ...(checkpoint.completedOutputs ?? {}) }, completedStepIds: [...(checkpoint.completedStepIds ?? [])], failedStepIds: [...(checkpoint.failedStepIds ?? [])], groupState: { ...(checkpoint.groupState ?? {}) }, options });
}

export async function getRunState(runId) {
  const run = getRunById(runId);
  if (!run) return null;
  return { ...run, steps: listRunSteps(runId), groups: listRunGroups(runId), checkpoint: getCheckpoint(runId) };
}
