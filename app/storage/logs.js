import crypto from 'node:crypto';
import { getDatabase } from './db.js';

function parseJson(value, fallback) { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function mapLog(row) {
  if (!row) return null;
  return { id: row.id, runId: row.run_id, stepId: row.step_id, level: row.level, scope: row.scope, message: row.message, raw: parseJson(row.raw_json, null), createdAt: row.created_at };
}

export function createLog({ runId = null, stepId = null, level = 'info', scope = 'app', message, raw = null }) {
  const id = `log_${crypto.randomUUID()}`;
  getDatabase().prepare(`INSERT INTO logs (id, run_id, step_id, level, scope, message, raw_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, runId, stepId, level, scope, message, JSON.stringify(raw), new Date().toISOString());
  return mapLog(getDatabase().prepare('SELECT * FROM logs WHERE id = ?').get(id));
}

export function listLogs(filters = {}) {
  let sql = 'SELECT * FROM logs WHERE 1=1';
  const params = [];
  if (filters.runId) { sql += ' AND run_id = ?'; params.push(filters.runId); }
  if (filters.level && filters.level !== 'all') { sql += ' AND level = ?'; params.push(filters.level); }
  if (filters.scope) { sql += ' AND scope = ?'; params.push(filters.scope); }
  if (filters.search) { sql += ' AND message LIKE ?'; params.push(`%${filters.search}%`); }
  sql += ' ORDER BY created_at DESC LIMIT ?'; params.push(filters.limit ?? 500);
  return getDatabase().prepare(sql).all(...params).map(mapLog);
}

export function deleteOldLogs({ days }) {
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  return getDatabase().prepare('DELETE FROM logs WHERE created_at < ?').run(cutoff).changes;
}

export function clearLogs() {
  return getDatabase().prepare('DELETE FROM logs').run().changes;
}
