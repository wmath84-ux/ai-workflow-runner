import crypto from 'node:crypto';
import { getDatabase } from './db.js';

function parseJson(value, fallback) {
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function mapRun(row) {
  if (!row) return null;
  return {
    id: row.id,
    workflowId: row.workflow_id,
    workflowName: row.workflow_name,
    status: row.status,
    input: parseJson(row.input_json, {}),
    checkpoint: parseJson(row.checkpoint_json, {}),
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapStep(row) {
  if (!row) return null;
  return {
    id: row.id,
    runId: row.run_id,
    stepKey: row.step_key,
    status: row.status,
    input: parseJson(row.input_json, {}),
    output: parseJson(row.output_json, {}),
    error: parseJson(row.error_json, null),
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function createRun({ workflowId = null, workflowName, input = {}, status = 'pending' }) {
  const id = `run_${crypto.randomUUID()}`;
  const startedAt = new Date().toISOString();
  getDatabase().prepare(`INSERT INTO runs (id, workflow_id, workflow_name, status, input_json, checkpoint_json, started_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(id, workflowId, workflowName, status, JSON.stringify(input), '{}', startedAt);
  return getRunById(id);
}

export function updateRunStatus(runId, status, updates = {}) {
  const completedAt = ['completed', 'failed', 'paused'].includes(status) ? (updates.completedAt ?? new Date().toISOString()) : updates.completedAt ?? null;
  getDatabase().prepare(`UPDATE runs SET status = ?, completed_at = COALESCE(?, completed_at), checkpoint_json = COALESCE(?, checkpoint_json), updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(status, completedAt, updates.checkpoint ? JSON.stringify(updates.checkpoint) : null, runId);
  return getRunById(runId);
}

export function getRunById(runId) {
  return mapRun(getDatabase().prepare('SELECT * FROM runs WHERE id = ?').get(runId));
}

export function listRuns() {
  return getDatabase().prepare('SELECT * FROM runs ORDER BY created_at DESC').all().map(mapRun);
}

export function createRunStep({ runId, stepKey, status = 'pending', input = {}, output = {}, error = null }) {
  const id = `step_${crypto.randomUUID()}`;
  getDatabase().prepare(`INSERT INTO run_steps (id, run_id, step_key, status, input_json, output_json, error_json) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(id, runId, stepKey, status, JSON.stringify(input), JSON.stringify(output), JSON.stringify(error));
  return mapStep(getDatabase().prepare('SELECT * FROM run_steps WHERE id = ?').get(id));
}

export function updateRunStep(stepId, updates = {}) {
  const current = mapStep(getDatabase().prepare('SELECT * FROM run_steps WHERE id = ?').get(stepId));
  if (!current) return null;
  const startedAt = updates.startedAt === undefined ? current.startedAt : updates.startedAt;
  const completedAt = updates.completedAt === undefined ? current.completedAt : updates.completedAt;
  getDatabase().prepare(`UPDATE run_steps SET status = ?, input_json = ?, output_json = ?, error_json = ?, started_at = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(updates.status ?? current.status, JSON.stringify(updates.input ?? current.input), JSON.stringify(updates.output ?? current.output), JSON.stringify(updates.error ?? current.error), startedAt, completedAt, stepId);
  return mapStep(getDatabase().prepare('SELECT * FROM run_steps WHERE id = ?').get(stepId));
}

export function listRunSteps(runId) {
  return getDatabase().prepare('SELECT * FROM run_steps WHERE run_id = ? ORDER BY created_at ASC').all(runId).map(mapStep);
}

export function saveCheckpoint(runId, checkpoint) {
  const payload = JSON.stringify({ ...checkpoint, runId, updatedAt: new Date().toISOString() });
  getDatabase().prepare(`INSERT INTO checkpoints (run_id, checkpoint_json) VALUES (?, ?) ON CONFLICT(run_id) DO UPDATE SET checkpoint_json = excluded.checkpoint_json, updated_at = CURRENT_TIMESTAMP`)
    .run(runId, payload);
  getDatabase().prepare('UPDATE runs SET checkpoint_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(payload, runId);
  return getCheckpoint(runId);
}

export function getCheckpoint(runId) {
  const row = getDatabase().prepare('SELECT checkpoint_json FROM checkpoints WHERE run_id = ?').get(runId);
  return row ? parseJson(row.checkpoint_json, null) : null;
}

export function deleteCheckpoint(runId) {
  return getDatabase().prepare('DELETE FROM checkpoints WHERE run_id = ?').run(runId).changes > 0;
}
