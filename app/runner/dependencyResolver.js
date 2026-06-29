import { extractVariables } from './variableResolver.js';
import { flattenWorkflowSteps } from './workflowPlanner.js';

export function getStepDependencies(step) {
  return Array.isArray(step.dependsOn) ? step.dependsOn : [];
}

export function canRunStep(step, completedStepIds) {
  return getStepDependencies(step).every((id) => completedStepIds.includes(id));
}

export function findCircularDependencies(steps) {
  const byId = new Map(steps.filter((step) => step.mode !== 'parallel' && step.type !== 'group').map((step) => [step.id, step]));
  const visiting = new Set();
  const visited = new Set();
  const cycles = [];
  function visit(step, path = []) {
    if (visiting.has(step.id)) { cycles.push([...path, step.id]); return; }
    if (visited.has(step.id)) return;
    visiting.add(step.id);
    for (const dep of getStepDependencies(step)) {
      if (byId.has(dep)) visit(byId.get(dep), [...path, step.id]);
    }
    visiting.delete(step.id);
    visited.add(step.id);
  }
  for (const step of byId.values()) visit(step);
  return cycles;
}

export function validateDependencyGraph(workflow) {
  const errors = [];
  const steps = flattenWorkflowSteps(workflow).filter((step) => step.type !== 'group');
  const ids = new Set(steps.map((step) => step.id));
  for (const step of steps) {
    if (step.dependsOn !== undefined && !Array.isArray(step.dependsOn)) errors.push({ field: `${step.path}.dependsOn`, message: 'dependsOn must be an array of step IDs.' });
    for (const dep of getStepDependencies(step)) {
      if (!ids.has(dep)) errors.push({ field: `${step.path}.dependsOn`, message: `Dependency "${dep}" does not exist.` });
      if (dep === step.id) errors.push({ field: `${step.path}.dependsOn`, message: 'A step cannot depend on itself.' });
    }
  }
  for (const cycle of findCircularDependencies(steps)) errors.push({ field: 'steps.dependsOn', message: `Circular dependency detected: ${cycle.join(' -> ')}` });
  return { valid: errors.length === 0, errors };
}

export function getAvailableOutputsBeforeUnit(plan, unitIndex, completedOutputs) {
  return { ...completedOutputs };
}

export function getPromptVariables(step) {
  return extractVariables(step.prompt ?? '');
}
