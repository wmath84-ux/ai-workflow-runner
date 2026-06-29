import fs from 'node:fs/promises';
import path from 'node:path';
import { getDatabasePath } from '../shared/paths.js';
import { copyFileSafe, copyDirSafe, projectPath } from '../shared/fileUtils.js';
import { createFullBackup } from './backupManager.js';
import { validateBackupManifest } from './backupValidator.js';
export async function validateBackup(backupPath){return validateBackupManifest(backupPath);}
export async function createPreRestoreBackup(){return createFullBackup({includeOutputs:false,includeExports:false});}
export async function restoreDatabaseOnly(backupPath){const validation=await validateBackup(backupPath); if(!validation.valid) throw new Error(`Invalid backup: ${validation.errors.join(', ')}`); await createPreRestoreBackup(); await copyFileSafe(path.join(backupPath,'database.sqlite'),getDatabasePath()); return {ok:true,mode:'database'};}
export async function restoreWorkflowsOnly(backupPath){await createPreRestoreBackup(); await copyDirSafe(path.join(backupPath,'workflows'),projectPath('workflows')).catch(()=>{}); return {ok:true,mode:'workflows'};}
export async function restorePromptsTemplatesVariables(backupPath){return restoreDatabaseOnly(backupPath);}
export async function restoreFromBackup(backupPath, options={}){if(options.mode==='workflows') return restoreWorkflowsOnly(backupPath); return restoreDatabaseOnly(backupPath);}
