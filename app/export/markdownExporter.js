import { collectRunExportData, renderMarkdown, writeExportFile } from './exportManager.js';
export async function exportRunAsMarkdown(runId) { const data = await collectRunExportData(runId); return writeExportFile(data.run, 'run-export.md', renderMarkdown(data)); }
