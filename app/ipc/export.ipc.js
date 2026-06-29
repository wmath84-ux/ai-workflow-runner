import { ipcMain } from 'electron';
import { exportRunAsMarkdown } from '../export/markdownExporter.js';
import { exportRunAsTxt } from '../export/txtExporter.js';
import { exportRunAsJson } from '../export/jsonExporter.js';
import { exportRunAsZip } from '../export/zipExporter.js';

function handler(fn) { return async (_event, runId) => { try { const filePath = await fn(runId); return { ok: true, filePath, message: 'Export created successfully.' }; } catch (error) { return { ok: false, message: `Export failed: ${error.message}` }; } }; }
export function registerExportIpc() {
  ipcMain.handle('export:run-markdown', handler(exportRunAsMarkdown));
  ipcMain.handle('export:run-txt', handler(exportRunAsTxt));
  ipcMain.handle('export:run-json', handler(exportRunAsJson));
  ipcMain.handle('export:run-zip', handler(exportRunAsZip));
}
