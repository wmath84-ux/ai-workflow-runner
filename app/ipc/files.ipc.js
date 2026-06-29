import { ipcMain, shell } from 'electron';
import path from 'node:path';
import { isAllowedProjectPath, projectPath } from '../shared/fileUtils.js';
function safe(targetPath) { const resolved = path.resolve(targetPath); if (!isAllowedProjectPath(resolved)) throw new Error('Path is outside approved project folders.'); return resolved; }
function ok(message) { return { ok: true, message }; }
function fail(error) { return { ok: false, message: error.message }; }
export function registerFilesIpc() {
  ipcMain.handle('files:open-path', async (_event, filePath) => { try { return ok(await shell.openPath(safe(filePath))); } catch (error) { return fail(error); } });
  ipcMain.handle('files:open-folder', async (_event, folderPath) => { try { return ok(await shell.openPath(safe(folderPath))); } catch (error) { return fail(error); } });
  ipcMain.handle('files:show-in-folder', (_event, filePath) => { try { shell.showItemInFolder(safe(filePath)); return ok('Shown in folder.'); } catch (error) { return fail(error); } });
  ipcMain.handle('files:project-path', (_event, folder) => ({ ok: true, path: projectPath(folder) }));
}
