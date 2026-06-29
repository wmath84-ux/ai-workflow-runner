import { deleteCheckpoint, getCheckpoint as readCheckpoint, saveCheckpoint } from '../storage/runs.js';

export function createCheckpoint(runId, data) {
  return saveCheckpoint(runId, {
    ...data,
    runId,
    updatedAt: new Date().toISOString()
  });
}

export function getCheckpoint(runId) {
  return readCheckpoint(runId);
}

export function updateCheckpoint(runId, data) {
  const current = getCheckpoint(runId) ?? { runId };
  return saveCheckpoint(runId, {
    ...current,
    ...data,
    runId,
    updatedAt: new Date().toISOString()
  });
}

export function clearCheckpoint(runId) {
  return deleteCheckpoint(runId);
}
