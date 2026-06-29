import { ipcMain, app } from 'electron';

let settings = {
  theme: 'system',
  outputDirectory: 'outputs',
  browserProfileDirectory: 'browser-profile'
};

export function registerSettingsIpc() {
  ipcMain.handle('settings:get-app-info', () => ({
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform
  }));

  ipcMain.handle('settings:get', () => settings);
  ipcMain.handle('settings:save', (_event, nextSettings) => {
    settings = { ...settings, ...nextSettings };
    return settings;
  });
}
