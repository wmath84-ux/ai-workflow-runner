import { collectRunExportData, writeExportFile } from './exportManager.js';
export async function exportRunAsJson(runId) { const data = await collectRunExportData(runId); return writeExportFile(data.run, 'run-export.json', JSON.stringify(data, null, 2)); }
