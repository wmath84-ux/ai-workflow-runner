import fs from 'node:fs/promises';
import path from 'node:path';
import { saveResult } from '../storage/results.js';

function safeName(value) {
  return String(value || 'workflow')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'workflow';
}

function escapeMarkdown(value) {
  return String(value ?? '').replace(/\r\n/g, '\n');
}

export function getRunOutputDirectory(workflowName, runId) {
  return path.join(process.cwd(), 'outputs', safeName(workflowName), runId);
}

export async function saveStepResult({ workflowName, runId, step, resolvedPrompt, output, raw }) {
  const outputDirectory = getRunOutputDirectory(workflowName, runId);
  await fs.mkdir(outputDirectory, { recursive: true });

  const basePath = path.join(outputDirectory, safeName(step.id));
  const createdAt = raw?.createdAt ?? new Date().toISOString();
  const jsonPayload = {
    stepId: step.id,
    tool: step.tool,
    prompt: resolvedPrompt,
    output,
    createdAt,
    raw
  };
  const markdown = `# ${workflowName}\n\n## Run ID\n${runId}\n\n## Step ID\n${step.id}\n\n## Tool\n${step.tool}\n\n## Timestamp\n${createdAt}\n\n## Prompt\n${escapeMarkdown(resolvedPrompt)}\n\n## Output\n${escapeMarkdown(output)}\n`;

  const markdownPath = `${basePath}.md`;
  const jsonPath = `${basePath}.json`;
  await fs.writeFile(markdownPath, markdown, 'utf8');
  await fs.writeFile(jsonPath, JSON.stringify(jsonPayload, null, 2), 'utf8');

  saveResult({
    runId,
    title: `${workflowName} / ${step.id}`,
    status: 'saved',
    data: jsonPayload,
    filePath: markdownPath
  });

  return { markdownPath, jsonPath };
}

export async function saveFinalOutput({ workflowName, runId, completedOutputs }) {
  const outputDirectory = getRunOutputDirectory(workflowName, runId);
  await fs.mkdir(outputDirectory, { recursive: true });
  const finalPath = path.join(outputDirectory, 'final-output.md');
  const sections = Object.entries(completedOutputs).map(([key, value]) => `## ${key}\n${escapeMarkdown(value)}`).join('\n\n');
  await fs.writeFile(finalPath, `# Final Output: ${workflowName}\n\n${sections}\n`, 'utf8');
  saveResult({
    runId,
    title: `${workflowName} final output`,
    status: 'saved',
    data: { workflowName, runId, completedOutputs },
    filePath: finalPath
  });
  return finalPath;
}

export async function saveWorkflowResult(result) {
  return saveFinalOutput(result);
}
