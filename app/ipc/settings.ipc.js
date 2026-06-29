import { ipcMain, app } from 'electron';
import { getDefaultProfilePath } from '../browser/profileManager.js';

let settings = {
  theme: 'system',
  outputDirectory: 'outputs',
  browserProfileDirectory: '',
  defaultWaitTimeout: 30000,
  retryCount: 1
};

export function getCurrentSettings() {
  return {
    ...settings,
    resolvedBrowserProfileDirectory: settings.browserProfileDirectory || getDefaultProfilePath()
  };
}

export function registerSettingsIpc() {
  ipcMain.handle('settings:get-app-info', () => ({
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform
  }));

  ipcMain.handle('settings:get', () => getCurrentSettings());
  ipcMain.handle('settings:save', (_event, nextSettings) => {
    settings = { ...settings, ...nextSettings };
    return getCurrentSettings();
  });
}
