import fs from 'node:fs/promises';
import path from 'node:path';
import { saveResult } from '../storage/results.js';

function safeName(value) {
  return String(value || 'workflow').toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '') || 'workflow';
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

  const createdAt = raw?.createdAt ?? new Date().toISOString();
  const jsonPayload = {
    workflowName,
    runId,
    stepId: step.id,
    tool: step.tool,
    url: raw?.url ?? null,
    title: raw?.title ?? null,
    prompt: resolvedPrompt,
    output,
    partial: Boolean(raw?.partial),
    warning: raw?.warning ?? null,
    createdAt,
    raw
  };

  const markdown = `# Step: ${step.id}\n\n## Workflow\n${workflowName}\n\n## Run ID\n${runId}\n\n## Tool\n${step.tool}\n\n## Source URL\n${raw?.url ?? 'N/A'}\n\n## Prompt\n${escapeMarkdown(resolvedPrompt)}\n\n## Output\n${escapeMarkdown(output)}\n\n## Warning\n${raw?.warning ?? 'None'}\n`;
  const basePath = path.join(outputDirectory, safeName(step.id));
  const markdownPath = `${basePath}.md`;
  const jsonPath = `${basePath}.json`;
  await fs.writeFile(markdownPath, markdown, 'utf8');
  await fs.writeFile(jsonPath, JSON.stringify(jsonPayload, null, 2), 'utf8');

  saveResult({ runId, title: `${workflowName} / ${step.id}`, status: 'saved', data: jsonPayload, filePath: markdownPath });
  return { markdownPath, jsonPath };
}

export async function saveGroupMetadata({ workflowName, runId, group, metadata }) {
  const outputDirectory = path.join(getRunOutputDirectory(workflowName, runId), 'groups');
  await fs.mkdir(outputDirectory, { recursive: true });
  const groupPath = path.join(outputDirectory, `${safeName(group.id)}.json`);
  await fs.writeFile(groupPath, JSON.stringify(metadata, null, 2), 'utf8');
  return groupPath;
}

export async function saveFinalOutput({ workflowName, runId, completedOutputs }) {
  const outputDirectory = getRunOutputDirectory(workflowName, runId);
  await fs.mkdir(outputDirectory, { recursive: true });
  const finalPath = path.join(outputDirectory, 'final-output.md');
  const sections = Object.entries(completedOutputs).map(([key, value]) => `## ${key}\n${escapeMarkdown(value)}`).join('\n\n');
  await fs.writeFile(finalPath, `# Final Output: ${workflowName}\n\n${sections}\n`, 'utf8');
  saveResult({ runId, title: `${workflowName} final output`, status: 'saved', data: { workflowName, runId, completedOutputs }, filePath: finalPath });
  return finalPath;
}

export async function saveWorkflowResult(result) {
  return saveFinalOutput(result);
}
