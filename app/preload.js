import { contextBridge, ipcRenderer } from 'electron';

const api = {
  getAppInfo: () => ipcRenderer.invoke('settings:get-app-info'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  listWorkflows: () => ipcRenderer.invoke('workflows:list'),
  listResults: () => ipcRenderer.invoke('results:list')
};

contextBridge.exposeInMainWorld('aiWorkflowRunner', api);
