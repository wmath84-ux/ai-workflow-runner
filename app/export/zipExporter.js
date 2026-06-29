import { collectRunExportData, renderMarkdown, writeExportFile } from './exportManager.js';
export async function exportRunAsZip(runId) {
  const data = await collectRunExportData(runId);
  const bundle = { note: 'ZIP placeholder bundle. Install archiver in a future command for binary ZIP packaging.', markdown: renderMarkdown(data), data };
  return writeExportFile(data.run, `${data.run.workflowName.replace(/[^a-z0-9-_]+/gi, '-')}-${runId}.zip`, JSON.stringify(bundle, null, 2));
}
