export function createInitialRunState(workflow, runId) {
  return { runId, workflowName: workflow.workflowName, status: 'pending', steps: {}, groups: {}, outputs: {}, logs: [] };
}
export function markStepStatus(state, stepId, status, data = {}) { state.steps[stepId] = { ...(state.steps[stepId] ?? {}), status, ...data }; return state; }
export function markGroupStatus(state, groupId, status, data = {}) { state.groups[groupId] = { ...(state.groups[groupId] ?? {}), status, ...data }; return state; }
export function addStepOutput(state, saveAs, output, data = {}) { state.outputs[saveAs] = { output, ...data }; return state; }
export function addLog(state, message, level = 'info') { state.logs.push({ message, level, createdAt: new Date().toISOString() }); return state; }
export function getSerializableRunState(state) { return JSON.parse(JSON.stringify(state)); }
