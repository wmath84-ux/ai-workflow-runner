import { ipcMain } from 'electron';
import { listWorkflows } from '../storage/workflows.js';

export function registerWorkflowIpc() {
  ipcMain.handle('workflows:list', () => listWorkflows());
}
