import { ipcMain } from 'electron';
import { exportWorkflowJsonOnly, exportWorkflowPackage } from '../package/workflowPackageExporter.js';
import { importWorkflowPackage, validateWorkflowPackage } from '../package/workflowPackageImporter.js';
function h(fn){return async(_e,...args)=>{try{return {ok:true,data:await fn(...args)};}catch(error){return {ok:false,error:error.message};}}}
export function registerPackageIpc(){ipcMain.handle('package:export-workflow',h(exportWorkflowPackage)); ipcMain.handle('package:export-workflow-json',h(exportWorkflowJsonOnly)); ipcMain.handle('package:validate-import',h(validateWorkflowPackage)); ipcMain.handle('package:import-workflow',h(importWorkflowPackage));}
