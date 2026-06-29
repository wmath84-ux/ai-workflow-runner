import crypto from 'node:crypto';
import { getDatabase } from './db.js';

export function createWorkflow(workflow) {
  const db = getDatabase();
  const id = workflow.id ?? crypto.randomUUID();
  const definition = workflow.definition ?? workflow;
  db.prepare(`INSERT INTO workflows (id, name, description, status, definition_json) VALUES (?, ?, ?, ?, ?)`)
    .run(id, workflow.name, workflow.description ?? '', workflow.status ?? 'draft', JSON.stringify(definition));
  return getWorkflowById(id);
}

export function listWorkflows() {
  const db = getDatabase();
  return db.prepare('SELECT id, name, description, status, created_at, updated_at FROM workflows ORDER BY updated_at DESC').all();
}

export function getWorkflowById(id) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM workflows WHERE id = ?').get(id);
  return row ? { ...row, definition: JSON.parse(row.definition_json) } : null;
}

export function updateWorkflow(id, updates) {
  const current = getWorkflowById(id);
  if (!current) return null;
  const next = { ...current.definition, ...(updates.definition ?? {}) };
  getDatabase().prepare(`UPDATE workflows SET name = ?, description = ?, status = ?, definition_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(updates.name ?? current.name, updates.description ?? current.description, updates.status ?? current.status, JSON.stringify(next), id);
  return getWorkflowById(id);
}

export function deleteWorkflow(id) {
  return getDatabase().prepare('DELETE FROM workflows WHERE id = ?').run(id).changes > 0;
}

export function importWorkflowFromJson(workflow) { return createWorkflow({ name: workflow.workflowName ?? workflow.name, description: workflow.description ?? '', status: 'ready', definition: workflow }); }
export function saveWorkflowJson(workflow) { return importWorkflowFromJson(workflow); }
export function duplicateWorkflow(workflowId) {
  const workflow = getWorkflowById(workflowId);
  if (!workflow) return null;
  return createWorkflow({ name: `${workflow.name} Copy`, description: workflow.description, status: 'draft', definition: workflow.definition });
}
export function searchWorkflows(filters = {}) {
  let workflows = listWorkflows();
  if (filters.search) workflows = workflows.filter((workflow) => `${workflow.name} ${workflow.description}`.toLowerCase().includes(filters.search.toLowerCase()));
  return workflows;
}
