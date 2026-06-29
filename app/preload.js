import { contextBridge, ipcRenderer } from 'electron';

const unwrap = async (promise) => {
  const response = await promise;
  if (response && typeof response === 'object' && 'ok' in response) {
    if (!response.ok) throw new Error(response.error);
    return response.data;
  }
  return response;
};

const appAPI = {
  getAppInfo: () => ipcRenderer.invoke('settings:get-app-info'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  validateWorkflow: (workflow) => unwrap(ipcRenderer.invoke('workflow:validate', workflow)),
  runWorkflow: (workflow) => unwrap(ipcRenderer.invoke('workflow:run', workflow)),
  retryPausedStep: (runId) => unwrap(ipcRenderer.invoke('workflow:retry-paused-step', runId)),
  resumeWorkflow: (runId) => unwrap(ipcRenderer.invoke('workflow:resume', runId)),
  getRunState: (runId) => unwrap(ipcRenderer.invoke('workflow:get-run-state', runId)),
  enqueueWorkflowRun: (workflow) => unwrap(ipcRenderer.invoke('workflow:enqueue-run', workflow)),
  getRunQueueStatus: () => unwrap(ipcRenderer.invoke('workflow:queue-status')),
  cancelQueuedRun: (runId) => unwrap(ipcRenderer.invoke('workflow:cancel-queued-run', runId)),
  clearCompletedQueueItems: () => unwrap(ipcRenderer.invoke('workflow:clear-completed-queue-items')),
  listWorkflows: () => unwrap(ipcRenderer.invoke('workflow:list')),
  getWorkflow: (workflowId) => unwrap(ipcRenderer.invoke('workflow:get', workflowId)),
  importWorkflow: (workflow) => unwrap(ipcRenderer.invoke('workflow:import', workflow)),
  duplicateWorkflow: (workflowId) => unwrap(ipcRenderer.invoke('workflow:duplicate', workflowId)),
  deleteWorkflow: (workflowId) => unwrap(ipcRenderer.invoke('workflow:delete', workflowId)),
  listRuns: () => unwrap(ipcRenderer.invoke('runs:list')),
  getRun: (runId) => unwrap(ipcRenderer.invoke('runs:get', runId)),
  listResults: () => unwrap(ipcRenderer.invoke('results:list')),
  launchBrowser: () => unwrap(ipcRenderer.invoke('browser:launch')),
  closeBrowser: () => unwrap(ipcRenderer.invoke('browser:close')),
  getBrowserStatus: () => unwrap(ipcRenderer.invoke('browser:status')),
  openUrl: (url) => unwrap(ipcRenderer.invoke('browser:open-url', url)),
  openTool: (toolName) => unwrap(ipcRenderer.invoke('browser:open-tool', toolName)),
  listBrowserTabs: () => unwrap(ipcRenderer.invoke('browser:list-tabs')),
  closeBrowserTab: (urlPart) => unwrap(ipcRenderer.invoke('browser:close-tab', urlPart)),
  bringBrowserTabToFront: (urlPart) => unwrap(ipcRenderer.invoke('browser:bring-tab-front', urlPart)),
  getBrowserProfileInfo: () => unwrap(ipcRenderer.invoke('browser:profile-info')),
  clearBrowserProfile: () => unwrap(ipcRenderer.invoke('browser:clear-profile')),
  listConnectors: () => unwrap(ipcRenderer.invoke('connectors:list')),
  exportRunAsMarkdown: (runId) => ipcRenderer.invoke('export:run-markdown', runId),
  exportRunAsTxt: (runId) => ipcRenderer.invoke('export:run-txt', runId),
  exportRunAsJson: (runId) => ipcRenderer.invoke('export:run-json', runId),
  exportRunAsZip: (runId) => ipcRenderer.invoke('export:run-zip', runId),
  openPath: (filePath) => ipcRenderer.invoke('files:open-path', filePath),
  openFolder: (folderPath) => ipcRenderer.invoke('files:open-folder', folderPath),
  showInFolder: (filePath) => ipcRenderer.invoke('files:show-in-folder', filePath),
  getProjectPath: (folderName) => ipcRenderer.invoke('files:project-path', folderName),
  listLogs: (filters) => unwrap(ipcRenderer.invoke('logs:list', filters)),
  clearLogs: () => unwrap(ipcRenderer.invoke('logs:clear'))
};

contextBridge.exposeInMainWorld('appAPI', appAPI);
contextBridge.exposeInMainWorld('aiWorkflowRunner', appAPI);
