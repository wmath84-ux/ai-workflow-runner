import { ipcMain } from 'electron';
import { listResults } from '../storage/results.js';

function success(data) {
  return { ok: true, data };
}

function failure(error) {
  return { ok: false, error: error?.message ?? 'Unknown error' };
}

export function registerResultsIpc() {
  ipcMain.handle('results:list', () => {
    try { return success(listResults()); } catch (error) { return failure(error); }
  });
}
