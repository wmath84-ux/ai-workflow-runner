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
  listWorkflows: () => unwrap(ipcRenderer.invoke('workflow:list')),
  getWorkflow: (workflowId) => unwrap(ipcRenderer.invoke('workflow:get', workflowId)),
  listRuns: () => unwrap(ipcRenderer.invoke('runs:list')),
  getRun: (runId) => unwrap(ipcRenderer.invoke('runs:get', runId)),
  listResults: () => unwrap(ipcRenderer.invoke('results:list'))
};

contextBridge.exposeInMainWorld('appAPI', appAPI);
contextBridge.exposeInMainWorld('aiWorkflowRunner', appAPI);
