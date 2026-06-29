import { ipcMain } from 'electron';
import { clearLogs, listLogs } from '../storage/logs.js';
export function registerLogsIpc() {
  ipcMain.handle('logs:list', (_event, filters) => ({ ok: true, data: listLogs(filters ?? {}) }));
  ipcMain.handle('logs:clear', () => ({ ok: true, data: clearLogs() }));
}
