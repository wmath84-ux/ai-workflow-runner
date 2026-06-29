import fs from 'node:fs/promises';
import path from 'node:path';
import { ensureDir, projectPath } from '../shared/fileUtils.js';
import { timestampForFile } from '../shared/dateUtils.js';
import { runHealthChecks } from '../health/healthCheckManager.js';
import { listLogs } from '../storage/logs.js';
import { getDatabaseStats } from '../storage/maintenance.js';
export async function exportDiagnostics(options={}){const dir=await ensureDir(projectPath('diagnostics')); const filePath=path.join(dir,`diagnostics-${timestampForFile()}.zip`); const payload={createdAt:new Date().toISOString(),health:await runHealthChecks({deep:true}),databaseStats:await getDatabaseStats(),logs:listLogs({limit:options.logLimit??500}).map(l=>({...l,raw:l.raw?'[masked]':null})),options:{includeOutputSummaries:Boolean(options.includeOutputSummaries),includeFullOutputs:Boolean(options.includeFullOutputs)}}; await fs.writeFile(filePath,JSON.stringify(payload,null,2),'utf8'); return filePath;}
