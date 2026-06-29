import { ipcMain } from 'electron';
import { exportDiagnostics } from '../backup/diagnosticsExporter.js';
import { checkDataIntegrity } from '../health/dataIntegrityChecker.js';
import { repairBrokenSettings, repairMissingFolders, repairQueueState, repairStuckRuns } from '../health/repairManager.js';
import { getLastHealthCheck, runDeepHealthCheck, runQuickHealthCheck } from '../health/healthCheckManager.js';
import { checkpointWal, clearOldLogs, getDatabaseStats, vacuumDatabase } from '../storage/maintenance.js';
function h(fn){return async(_e,...args)=>{try{return {ok:true,data:await fn(...args)};}catch(error){return {ok:false,error:error.message};}}}
async function repair(options={}){if(options.type==='settings') return repairBrokenSettings(); if(options.type==='queue') return repairQueueState(); if(options.type==='folders') return repairMissingFolders(); return repairStuckRuns(options);}
export function registerHealthIpc(){ipcMain.handle('health:quick-check',h(runQuickHealthCheck)); ipcMain.handle('health:deep-check',h(runDeepHealthCheck)); ipcMain.handle('health:integrity-check',h(checkDataIntegrity)); ipcMain.handle('health:repair',h(repair)); ipcMain.handle('health:last-check',h(getLastHealthCheck)); ipcMain.handle('diagnostics:export',h(exportDiagnostics)); ipcMain.handle('maintenance:db-stats',h(getDatabaseStats)); ipcMain.handle('maintenance:vacuum',h(vacuumDatabase)); ipcMain.handle('maintenance:checkpoint-wal',h(checkpointWal)); ipcMain.handle('maintenance:clear-old-logs',h(clearOldLogs));}
