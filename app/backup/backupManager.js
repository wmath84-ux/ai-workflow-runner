import fs from 'node:fs/promises';
import path from 'node:path';
import { getDatabasePath } from '../shared/paths.js';
import { copyDirSafe, copyFileSafe, ensureDir, getFolderSize, projectPath, safeRemoveDir } from '../shared/fileUtils.js';
import { timestampForFile } from '../shared/dateUtils.js';
import { createBackupManifest } from './backupManifest.js';
import { validateBackupManifest } from './backupValidator.js';
import { getDatabaseStats } from '../storage/maintenance.js';
function backupRoot(){return projectPath('backups');}
async function writeManifest(dir, manifest){await fs.writeFile(path.join(dir,'backup-manifest.json'),JSON.stringify(manifest,null,2),'utf8'); return manifest;}
export async function createDatabaseBackup(options={}){await ensureDir(backupRoot()); const id=`backup_${timestampForFile()}`; const dir=await ensureDir(path.join(backupRoot(),`${id}_database`)); await copyFileSafe(getDatabasePath(),path.join(dir,'database.sqlite')); return writeManifest(dir,createBackupManifest({backupId:id,type:'database',included:{outputs:false,exports:false,browserProfile:false},counts:await getDatabaseStats(),files:['database.sqlite']}));}
export async function createFullBackup(options={}){await ensureDir(backupRoot()); const id=`backup_${timestampForFile()}`; const dir=await ensureDir(path.join(backupRoot(),`${id}_full`)); await copyFileSafe(getDatabasePath(),path.join(dir,'database.sqlite')).catch(()=>{}); for(const folder of ['workflows']) await copyDirSafe(projectPath(folder),path.join(dir,folder)).catch(()=>{}); if(options.includeOutputs) await copyDirSafe(projectPath('outputs'),path.join(dir,'outputs')).catch(()=>{}); if(options.includeExports) await copyDirSafe(projectPath('exports'),path.join(dir,'exports')).catch(()=>{}); if(options.includeBrowserProfile) await copyDirSafe(projectPath('browser-profile'),path.join(dir,'browser-profile')).catch(()=>{}); return writeManifest(dir,createBackupManifest({backupId:id,type:'full',included:{outputs:Boolean(options.includeOutputs),exports:Boolean(options.includeExports),browserProfile:Boolean(options.includeBrowserProfile)},counts:await getDatabaseStats()}));}
export async function listBackups(){await ensureDir(backupRoot()); const entries=await fs.readdir(backupRoot(),{withFileTypes:true}).catch(()=>[]); const backups=[]; for(const entry of entries.filter(e=>e.isDirectory())){const folder=path.join(backupRoot(),entry.name); const info=await getBackupInfo(folder).catch(()=>null); if(info) backups.push(info);} return backups.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));}
export async function getBackupInfo(backupPath){const validation=await validateBackupManifest(backupPath); const size=await getFolderSize(backupPath); return {...validation.manifest,path:backupPath,size,valid:validation.valid,errors:validation.errors};}
export async function deleteBackup(backupPath){await safeRemoveDir(backupPath); return true;}
export async function pruneOldBackups(options={}){const keep=options.keepLastBackups??10; const backups=await listBackups(); const remove=backups.slice(keep); for(const b of remove) await deleteBackup(b.path); return {deleted:remove.length};}
export { validateBackupManifest as getBackupValidatorResult };
