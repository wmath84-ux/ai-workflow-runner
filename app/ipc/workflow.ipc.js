import fs from 'node:fs/promises';
import path from 'node:path';
import { ipcMain } from 'electron';
import { validateWorkflow } from '../runner/workflowValidator.js';
import { getRunState, resumeWorkflow, retryPausedStep, runWorkflow } from '../runner/workflowEngine.js';
import { cancelQueuedRun, clearCompletedQueueItems, enqueueRun, getQueueStatus, processQueue } from '../runner/runQueue.js';
import { deleteWorkflow, duplicateWorkflow, getWorkflowById, importWorkflowFromJson, listWorkflows } from '../storage/workflows.js';
import { getRunById, listRuns, listRunSteps } from '../storage/runs.js';

function success(data) {
  return { ok: true, data };
}

function failure(error) {
  return { ok: false, error: error?.message ?? 'Unknown error' };
}

async function readWorkflowFile(fileName) {
  const samplePath = path.join(process.cwd(), 'workflows', fileName);
  const content = await fs.readFile(samplePath, 'utf8');
  return JSON.parse(content);
}

export function registerWorkflowIpc() {
  ipcMain.handle('workflow:validate', (_event, workflow) => {
    try { return success(validateWorkflow(workflow)); } catch (error) { return failure(error); }
  });

  ipcMain.handle('workflow:run', async (_event, workflow) => {
    try { return success(await runWorkflow(workflow)); } catch (error) { return failure(error); }
  });

  ipcMain.handle('workflow:retry-paused-step', async (_event, runId) => {
    try { return success(await retryPausedStep(runId)); } catch (error) { return failure(error); }
  });

  ipcMain.handle('workflow:resume', async (_event, runId) => {
    try { return success(await resumeWorkflow(runId)); } catch (error) { return failure(error); }
  });

  ipcMain.handle('workflow:get-run-state', async (_event, runId) => {
    try { return success(await getRunState(runId)); } catch (error) { return failure(error); }
  });

  ipcMain.handle('workflow:enqueue-run', async (_event, workflow) => {
    try {
      const item = enqueueRun({ workflow });
      processQueue(runWorkflow);
      return success(item);
    } catch (error) { return failure(error); }
  });

  ipcMain.handle('workflow:queue-status', () => {
    try { return success(getQueueStatus()); } catch (error) { return failure(error); }
  });

  ipcMain.handle('workflow:cancel-queued-run', (_event, runId) => {
    try { return success(cancelQueuedRun(runId)); } catch (error) { return failure(error); }
  });

  ipcMain.handle('workflow:clear-completed-queue-items', () => {
    try { return success(clearCompletedQueueItems()); } catch (error) { return failure(error); }
  });

  ipcMain.handle('workflow:list', async () => {
    try {
      return success([
        ...listWorkflows(),
        { id: 'sample-youtube-package', name: 'Sample YouTube Package Workflow', status: 'sample', description: 'Bundled mock sample workflow' },
        { id: 'sample-chatgpt-basic', name: 'ChatGPT Basic Test', status: 'sample', description: 'Bundled ChatGPT browser connector sample' },
        { id: 'sample-gemini-basic', name: 'Gemini Basic Test', status: 'sample', description: 'Bundled Gemini browser connector sample' },
        { id: 'sample-mixed-chatgpt-gemini', name: 'Mixed ChatGPT Gemini Test', status: 'sample', description: 'Bundled mixed ChatGPT and Gemini sample' },
        { id: 'sample-generic-basic', name: 'Generic Connector Basic Test', status: 'sample', description: 'Bundled generic connector sample' },
        { id: 'sample-parallel-assets', name: 'Parallel Assets Mock Test', status: 'sample', description: 'Bundled mock parallel sample' },
        { id: 'sample-mixed-parallel-chatgpt-gemini', name: 'Mixed Parallel ChatGPT Gemini', status: 'sample', description: 'Bundled browser parallel sample' },
        { id: 'sample-dependency-workflow', name: 'Dependency Workflow Mock Test', status: 'sample', description: 'Bundled dependency sample' }
      ]);
    } catch (error) { return failure(error); }
  });



  ipcMain.handle('workflow:import', (_event, workflow) => {
    try { return success(importWorkflowFromJson(workflow)); } catch (error) { return failure(error); }
  });

  ipcMain.handle('workflow:duplicate', (_event, workflowId) => {
    try { return success(duplicateWorkflow(workflowId)); } catch (error) { return failure(error); }
  });

  ipcMain.handle('workflow:delete', (_event, workflowId) => {
    try { return success(deleteWorkflow(workflowId)); } catch (error) { return failure(error); }
  });

  ipcMain.handle('workflow:get', async (_event, workflowId) => {
    try {
      if (workflowId === 'sample-youtube-package') return success(await readWorkflowFile('sample-youtube-package.json'));
      if (workflowId === 'sample-chatgpt-basic') return success(await readWorkflowFile('sample-chatgpt-basic.json'));
      if (workflowId === 'sample-gemini-basic') return success(await readWorkflowFile('sample-gemini-basic.json'));
      if (workflowId === 'sample-mixed-chatgpt-gemini') return success(await readWorkflowFile('sample-mixed-chatgpt-gemini.json'));
      if (workflowId === 'sample-generic-basic') return success(await readWorkflowFile('sample-generic-basic.json'));
      if (workflowId === 'sample-parallel-assets') return success(await readWorkflowFile('sample-parallel-assets.json'));
      if (workflowId === 'sample-mixed-parallel-chatgpt-gemini') return success(await readWorkflowFile('sample-mixed-parallel-chatgpt-gemini.json'));
      if (workflowId === 'sample-dependency-workflow') return success(await readWorkflowFile('sample-dependency-workflow.json'));
      return success(getWorkflowById(workflowId));
    } catch (error) { return failure(error); }
  });

  ipcMain.handle('workflows:list', () => listWorkflows());

  ipcMain.handle('runs:list', () => {
    try { return success(listRuns()); } catch (error) { return failure(error); }
  });

  ipcMain.handle('runs:get', (_event, runId) => {
    try {
      const run = getRunById(runId);
      return success(run ? { ...run, steps: listRunSteps(runId) } : null);
    } catch (error) { return failure(error); }
  });
}
