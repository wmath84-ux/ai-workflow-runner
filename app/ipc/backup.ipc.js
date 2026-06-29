import { ipcMain } from 'electron';
import { createDatabaseBackup, createFullBackup, deleteBackup, getBackupInfo, listBackups } from '../backup/backupManager.js';
import { restoreFromBackup, validateBackup } from '../backup/restoreManager.js';
function h(fn){return async(_e,...args)=>{try{return {ok:true,data:await fn(...args)};}catch(error){return {ok:false,error:error.message};}}}
export function registerBackupIpc(){ipcMain.handle('backup:create-database',h(createDatabaseBackup)); ipcMain.handle('backup:create-full',h(createFullBackup)); ipcMain.handle('backup:list',h(listBackups)); ipcMain.handle('backup:info',h(getBackupInfo)); ipcMain.handle('backup:delete',h(deleteBackup)); ipcMain.handle('backup:validate',h(validateBackup)); ipcMain.handle('backup:restore',h(restoreFromBackup));}
