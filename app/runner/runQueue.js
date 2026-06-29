import { createQueueItem, updateQueueItem, listQueueItems, cancelQueueItem as cancelStoredQueueItem } from '../storage/runs.js';

const queue = [];
let active = false;

export function enqueueRun(runRequest) {
  const item = createQueueItem({ workflowName: runRequest.workflow.workflowName, raw: { workflow: runRequest.workflow } });
  queue.push({ ...item, workflow: runRequest.workflow });
  return item;
}

export function getQueueStatus() {
  return { active, items: listQueueItems() };
}

export function cancelQueuedRun(runId) {
  const index = queue.findIndex((item) => item.id === runId || item.runId === runId);
  if (index >= 0) queue.splice(index, 1);
  return cancelStoredQueueItem(runId);
}

export function clearCompletedQueueItems() {
  return listQueueItems().filter((item) => ['completed', 'failed', 'cancelled'].includes(item.status));
}

export async function processQueue(processor) {
  if (active) return getQueueStatus();
  active = true;
  try {
    while (queue.length) {
      const item = queue.shift();
      updateQueueItem(item.id, { status: 'running', startedAt: new Date().toISOString() });
      try {
        const result = await processor(item.workflow);
        updateQueueItem(item.id, { status: result.status === 'completed' ? 'completed' : result.status, runId: result.runId, finishedAt: new Date().toISOString(), raw: result });
      } catch (error) {
        updateQueueItem(item.id, { status: 'failed', finishedAt: new Date().toISOString(), raw: { message: error.message } });
      }
    }
  } finally { active = false; }
  return getQueueStatus();
}
