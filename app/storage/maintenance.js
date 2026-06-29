import fs from 'node:fs/promises';
import path from 'node:path';
import { getDatabase } from './db.js';
import { projectPath, getFolderSize } from '../shared/fileUtils.js';
import { clearLogs, deleteOldLogs } from './logs.js';
import { clearCompletedQueueItems as clearMemoryQueue } from '../runner/runQueue.js';
export async function getDatabaseStats(){const db=getDatabase(); const tables=['workflows','runs','run_steps','results','prompt_library','workflow_templates','reusable_variables','logs']; const counts={}; for(const table of tables){try{counts[table]=db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get().count;}catch{counts[table]=0;}} return counts;}
export async function vacuumDatabase(){getDatabase().prepare('VACUUM').run(); return {ok:true};}
export async function checkpointWal(){getDatabase().pragma('wal_checkpoint(TRUNCATE)'); return {ok:true};}
export async function clearOldLogs(days){return deleteOldLogs({days});}
export async function clearCompletedQueueItems(){return clearMemoryQueue();}
export async function listLargeOutputFolders(options={}){const root=projectPath('outputs'); const entries=await fs.readdir(root,{withFileTypes:true}).catch(()=>[]); const folders=[]; for(const entry of entries.filter(e=>e.isDirectory())){const folder=path.join(root,entry.name); folders.push({path:folder,size:await getFolderSize(folder)});} return folders.filter(f=>f.size>=(options.minSize??0)).sort((a,b)=>b.size-a.size);}
