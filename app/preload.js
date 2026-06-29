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
  listConnectors: () => unwrap(ipcRenderer.invoke('connectors:list'))
};

contextBridge.exposeInMainWorld('appAPI', appAPI);
contextBridge.exposeInMainWorld('aiWorkflowRunner', appAPI);
