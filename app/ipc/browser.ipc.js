import { ipcMain } from 'electron';
import { launchBrowser, closeBrowser, getBrowserStatus, openUrl, isBrowserRunning } from '../browser/browserManager.js';
import { clearProfile, getProfileInfo, resolveProfilePath } from '../browser/profileManager.js';
import { bringTabToFrontByUrlPart, closeTabByUrlPart, listOpenTabs, openToolTab } from '../browser/tabManager.js';
import { listConnectors } from '../connectors/connectorRegistry.js';
import { getCurrentSettings } from './settings.ipc.js';

function success(data) { return { ok: true, data }; }
function failure(error) { return { ok: false, error: error?.message ?? String(error ?? 'Unknown browser error') }; }
function browserError(status) {
  return status?.lastError?.message ?? status?.lastError?.error ?? status?.lastError ?? `Browser is ${status?.status ?? 'not running'}`;
}
async function getConfiguredProfilePath() {
  const settings = await getCurrentSettings();
  return resolveProfilePath(settings.browser?.profilePath ?? settings.browserProfileDirectory ?? '');
}
async function launchOrThrow() {
  const status = await launchBrowser({ profilePath: await getConfiguredProfilePath() });
  if (!status?.running) throw new Error(browserError(status));
  return status;
}

export function registerBrowserIpc() {
  ipcMain.handle('browser:launch', async () => {
    try { return success(await launchOrThrow()); } catch (error) { return failure(error); }
  });
  ipcMain.handle('browser:close', async () => {
    try { return success(await closeBrowser()); } catch (error) { return failure(error); }
  });
  ipcMain.handle('browser:status', async () => {
    try { return success(await getBrowserStatus()); } catch (error) { return failure(error); }
  });
  ipcMain.handle('browser:open-url', async (_event, url) => {
    try { return success(await openUrl(url, { profilePath: await getConfiguredProfilePath() })); } catch (error) { return failure(error); }
  });
  ipcMain.handle('browser:open-tool', async (_event, toolName) => {
    try {
      await launchOrThrow();
      return success(await openToolTab(toolName));
    } catch (error) { return failure(error); }
  });
  ipcMain.handle('browser:list-tabs', async () => {
    try { return success(await listOpenTabs()); } catch (error) { return failure(error); }
  });
  ipcMain.handle('browser:close-tab', async (_event, urlPart) => {
    try { return success(await closeTabByUrlPart(urlPart)); } catch (error) { return failure(error); }
  });
  ipcMain.handle('browser:bring-tab-front', async (_event, urlPart) => {
    try { return success(await bringTabToFrontByUrlPart(urlPart)); } catch (error) { return failure(error); }
  });
  ipcMain.handle('browser:profile-info', async () => {
    try { return success(await getProfileInfo(await getConfiguredProfilePath())); } catch (error) { return failure(error); }
  });
  ipcMain.handle('browser:clear-profile', async () => {
    try {
      if (isBrowserRunning()) throw new Error('Close the browser before clearing the profile.');
      return success(await clearProfile(await getConfiguredProfilePath()));
    } catch (error) { return failure(error); }
  });
  ipcMain.handle('connectors:list', () => {
    try { return success(listConnectors()); } catch (error) { return failure(error); }
  });
}
