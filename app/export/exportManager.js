import fs from 'node:fs/promises';
import path from 'node:path';
import { getRunWithSteps } from '../storage/runs.js';
import { getResultsByRunId } from '../storage/results.js';
import { ensureDir, projectPath, safeName } from '../shared/fileUtils.js';

export async function collectRunExportData(runId) {
  const run = getRunWithSteps(runId);
  if (!run) throw new Error(`Run ${runId} was not found.`);
  const results = getResultsByRunId(runId);
  return { run, results };
}

export async function getExportDir(run) {
  return ensureDir(projectPath('exports', safeName(run.workflowName), run.id));
}

export function renderMarkdown({ run, results }) {
  const steps = run.steps.map((step, index) => {
    const data = results.find((result) => result.data?.stepId === step.stepKey)?.data ?? step.output;
    return `### Step ${index + 1}: ${step.stepKey}\nTool: ${data?.tool ?? data?.raw?.tool ?? 'unknown'}\nStatus: ${step.status}\n\nPrompt:\n${data?.prompt ?? step.input?.resolvedPrompt ?? ''}\n\nOutput:\n${data?.output ?? step.output?.output ?? ''}`;
  }).join('\n\n');
  const final = results.find((result) => result.title?.includes('final output'))?.data?.completedOutputs;
  return `# Workflow Run Export\n\n## Workflow\n${run.workflowName}\n\n## Run Summary\n- Run ID: ${run.id}\n- Status: ${run.status}\n- Started: ${run.startedAt}\n- Finished: ${run.completedAt ?? 'n/a'}\n\n## Inputs\n\`\`\`json\n${JSON.stringify(run.input, null, 2)}\n\`\`\`\n\n## Steps\n\n${steps}\n\n## Final Output\n\n${final ? JSON.stringify(final, null, 2) : 'Final output is not available.'}\n`;
}

export async function writeExportFile(run, fileName, content) {
  const dir = await getExportDir(run);
  const filePath = path.join(dir, fileName);
  await fs.writeFile(filePath, content, 'utf8');
  return filePath;
}
