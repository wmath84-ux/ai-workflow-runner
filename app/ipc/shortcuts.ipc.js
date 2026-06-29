import { ipcMain } from 'electron';
import { listShortcuts } from '../shortcuts/shortcutRegistry.js';
import { getShortcutSettings, updateShortcutSettings } from '../shortcuts/shortcutManager.js';
function h(fn){return async(_event,...args)=>{try{return {ok:true,data:await fn(...args)};}catch(error){return {ok:false,error:error.message};}}}
export function registerShortcutsIpc(){ipcMain.handle('shortcuts:list',h(() => listShortcuts())); ipcMain.handle('shortcuts:get-settings',h(getShortcutSettings)); ipcMain.handle('shortcuts:update-settings',h(updateShortcutSettings));}
