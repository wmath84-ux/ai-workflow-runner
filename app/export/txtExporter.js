import { collectRunExportData, renderMarkdown, writeExportFile } from './exportManager.js';
export async function exportRunAsTxt(runId) { const data = await collectRunExportData(runId); return writeExportFile(data.run, 'run-export.txt', renderMarkdown(data).replace(/[#*_`>-]/g, '')); }
