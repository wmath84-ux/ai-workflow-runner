import { getDatabase } from '../storage/db.js';
import { ensureDir, projectPath } from '../shared/fileUtils.js';
import { resetSettings } from '../settings/settingsService.js';
export async function repairStuckRuns(options={}){const status=options.status??'paused'; const changes=getDatabase().prepare("UPDATE runs SET status=?, updated_at=CURRENT_TIMESTAMP WHERE status='running' AND datetime(updated_at) < datetime('now','-2 hours')").run(status).changes; return {repaired:changes};}
export async function repairMissingFolders(){for(const folder of ['outputs','exports','backups','diagnostics','workflows','browser-profile','logs']) await ensureDir(projectPath(folder)); return {ok:true};}
export async function repairBrokenSettings(){return resetSettings();}
export async function repairQueueState(){return {ok:true};}
export async function rebuildResultIndex(){return {ok:true};}
