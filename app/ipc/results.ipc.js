import { ipcMain } from 'electron';
import { listResults } from '../storage/results.js';

export function registerResultsIpc() {
  ipcMain.handle('results:list', () => listResults());
}
