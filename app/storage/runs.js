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
    updatedAt: row.updated_at,
    parentGroupId: row.parent_group_id,
    orderIndex: row.order_index,
    raw: parseJson(row.raw_json, null),
    warning: parseJson(row.warning_json, null),
    partial: Boolean(row.partial)
  };
}

function mapGroup(row) {
  if (!row) return null;
  return { id: row.id, runId: row.run_id, groupId: row.group_id, label: row.label, status: row.status, startedAt: row.started_at, finishedAt: row.finished_at, raw: parseJson(row.raw_json, {}), createdAt: row.created_at, updatedAt: row.updated_at };
}

function mapQueue(row) {
  if (!row) return null;
  return { id: row.id, runId: row.run_id, workflowName: row.workflow_name, status: row.status, requestedAt: row.requested_at, startedAt: row.started_at, finishedAt: row.finished_at, raw: parseJson(row.raw_json, {}) };
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

export function createRunStep({ runId, stepKey, status = 'pending', input = {}, output = {}, error = null, parentGroupId = null, orderIndex = null }) {
  const id = `step_${crypto.randomUUID()}`;
  getDatabase().prepare(`INSERT INTO run_steps (id, run_id, step_key, status, input_json, output_json, error_json, parent_group_id, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, runId, stepKey, status, JSON.stringify(input), JSON.stringify(output), JSON.stringify(error), parentGroupId, orderIndex);
  return mapStep(getDatabase().prepare('SELECT * FROM run_steps WHERE id = ?').get(id));
}

export function updateRunStep(stepId, updates = {}) {
  const current = mapStep(getDatabase().prepare('SELECT * FROM run_steps WHERE id = ?').get(stepId));
  if (!current) return null;
  const startedAt = updates.startedAt === undefined ? current.startedAt : updates.startedAt;
  const completedAt = updates.completedAt === undefined ? current.completedAt : updates.completedAt;
  getDatabase().prepare(`UPDATE run_steps SET status = ?, input_json = ?, output_json = ?, error_json = ?, started_at = ?, completed_at = ?, raw_json = ?, warning_json = ?, partial = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(updates.status ?? current.status, JSON.stringify(updates.input ?? current.input), JSON.stringify(updates.output ?? current.output), JSON.stringify(updates.error ?? current.error), startedAt, completedAt, JSON.stringify(updates.raw ?? current.raw), JSON.stringify(updates.warning ?? current.warning), updates.partial === undefined ? (current.partial ? 1 : 0) : (updates.partial ? 1 : 0), stepId);
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


export function createRunGroup({ runId, groupId, label = '', status = 'pending', raw = {} }) {
  const id = `group_${crypto.randomUUID()}`;
  getDatabase().prepare(`INSERT INTO run_groups (id, run_id, group_id, label, status, raw_json) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(id, runId, groupId, label, status, JSON.stringify(raw));
  return mapGroup(getDatabase().prepare('SELECT * FROM run_groups WHERE id = ?').get(id));
}

export function updateRunGroup(id, updates = {}) {
  const current = mapGroup(getDatabase().prepare('SELECT * FROM run_groups WHERE id = ?').get(id));
  if (!current) return null;
  getDatabase().prepare(`UPDATE run_groups SET status = ?, started_at = COALESCE(?, started_at), finished_at = COALESCE(?, finished_at), raw_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(updates.status ?? current.status, updates.startedAt ?? null, updates.finishedAt ?? null, JSON.stringify(updates.raw ?? current.raw), id);
  return mapGroup(getDatabase().prepare('SELECT * FROM run_groups WHERE id = ?').get(id));
}

export function listRunGroups(runId) {
  return getDatabase().prepare('SELECT * FROM run_groups WHERE run_id = ? ORDER BY created_at ASC').all(runId).map(mapGroup);
}

export function createQueueItem({ runId = null, workflowName, status = 'queued', raw = {} }) {
  const id = `queue_${crypto.randomUUID()}`;
  getDatabase().prepare(`INSERT INTO run_queue (id, run_id, workflow_name, status, raw_json) VALUES (?, ?, ?, ?, ?)`)
    .run(id, runId, workflowName, status, JSON.stringify(raw));
  return getQueueItem(id);
}

export function updateQueueItem(id, updates = {}) {
  const current = getQueueItem(id);
  if (!current) return null;
  getDatabase().prepare(`UPDATE run_queue SET run_id = COALESCE(?, run_id), status = ?, started_at = COALESCE(?, started_at), finished_at = COALESCE(?, finished_at), raw_json = ? WHERE id = ?`)
    .run(updates.runId ?? null, updates.status ?? current.status, updates.startedAt ?? null, updates.finishedAt ?? null, JSON.stringify(updates.raw ?? current.raw), id);
  return getQueueItem(id);
}

export function listQueueItems() {
  return getDatabase().prepare('SELECT * FROM run_queue ORDER BY requested_at DESC').all().map(mapQueue);
}

export function getQueueItem(id) {
  return mapQueue(getDatabase().prepare('SELECT * FROM run_queue WHERE id = ?').get(id));
}

export function cancelQueueItem(id) {
  return updateQueueItem(id, { status: 'cancelled', finishedAt: new Date().toISOString() });
}
