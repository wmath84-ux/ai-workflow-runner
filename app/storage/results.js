import crypto from 'node:crypto';
import { getDatabase } from './db.js';

export function saveResult(result) {
  const id = result.id ?? crypto.randomUUID();
  getDatabase().prepare(`INSERT INTO results (id, run_id, workflow_id, title, status, result_json, file_path) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(id, result.runId ?? null, result.workflowId ?? null, result.title ?? 'Untitled Result', result.status ?? 'saved', JSON.stringify(result.data ?? {}), result.filePath ?? null);
  return getResultById(id);
}

export function listResults() {
  return getDatabase().prepare('SELECT id, run_id, workflow_id, title, status, file_path, created_at, updated_at FROM results ORDER BY created_at DESC').all();
}

export function getResultById(id) {
  const row = getDatabase().prepare('SELECT * FROM results WHERE id = ?').get(id);
  return row ? { ...row, data: JSON.parse(row.result_json) } : null;
}

export function getResultsByRunId(runId) {
  return getDatabase().prepare('SELECT * FROM results WHERE run_id = ? ORDER BY created_at ASC').all(runId)
    .map((row) => ({ ...row, data: JSON.parse(row.result_json) }));
}

export function getFinalOutputByRunId(runId) {
  return getResultsByRunId(runId).find((result) => result.title?.includes('final output')) ?? null;
}

export function getStepOutputByRunIdAndStepId(runId, stepId) {
  return getResultsByRunId(runId).find((result) => result.data?.stepId === stepId) ?? null;
}
