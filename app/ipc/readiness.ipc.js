import { ipcMain } from 'electron';
import { checkAllConnectorReadiness, checkConnectorReadiness, getConnectorReadinessSummary } from '../readiness/connectorReadiness.js';
import { runWorkflowPreflightChecks } from '../readiness/preflightChecks.js';
function h(fn){return async(_e,...args)=>{try{return {ok:true,data:await fn(...args)};}catch(error){return {ok:false,error:error.message};}}}
export function registerReadinessIpc(){ipcMain.handle('readiness:check-connector',h(checkConnectorReadiness)); ipcMain.handle('readiness:check-all-connectors',h(checkAllConnectorReadiness)); ipcMain.handle('readiness:summary',h(getConnectorReadinessSummary)); ipcMain.handle('preflight:workflow',h(runWorkflowPreflightChecks));}
