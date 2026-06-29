import fs from 'node:fs/promises';
import path from 'node:path';
import { safeJsonParse } from '../shared/safeJson.js';
export async function validateBackupManifest(backupPath){const manifestPath=path.join(backupPath,'backup-manifest.json'); const text=await fs.readFile(manifestPath,'utf8'); const manifest=safeJsonParse(text,null); const errors=[]; if(!manifest?.backupId) errors.push('Backup manifest is missing backupId.'); if(manifest?.appName!=='ai-workflow-runner') errors.push('Backup manifest appName is invalid.'); return {valid:errors.length===0,manifest,errors};}
