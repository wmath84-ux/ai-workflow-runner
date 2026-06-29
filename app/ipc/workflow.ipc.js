import fs from 'node:fs/promises';
import path from 'node:path';
import { ipcMain } from 'electron';
import { validateWorkflow } from '../runner/workflowValidator.js';
import { runWorkflow } from '../runner/workflowEngine.js';
import { getWorkflowById, listWorkflows } from '../storage/workflows.js';
import { getRunById, listRuns, listRunSteps } from '../storage/runs.js';

function success(data) {
  return { ok: true, data };
}

function failure(error) {
  return { ok: false, error: error?.message ?? 'Unknown error' };
}

async function readSampleWorkflow() {
  const samplePath = path.join(process.cwd(), 'workflows', 'sample-youtube-package.json');
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

  ipcMain.handle('workflow:list', async () => {
    try {
      return success([
        ...listWorkflows(),
        { id: 'sample-youtube-package', name: 'Sample YouTube Package Workflow', status: 'sample', description: 'Bundled sample workflow' }
      ]);
    } catch (error) { return failure(error); }
  });

  ipcMain.handle('workflow:get', async (_event, workflowId) => {
    try {
      if (workflowId === 'sample-youtube-package') return success(await readSampleWorkflow());
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
