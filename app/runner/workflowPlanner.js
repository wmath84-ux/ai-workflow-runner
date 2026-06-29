export function getExecutableUnits(workflow) {
  return (workflow.steps ?? []).map((step, index) => {
    if (step.mode === 'parallel') {
      return { type: 'parallel', id: step.id, label: step.label ?? step.id, maxConcurrency: step.maxConcurrency, stopOnFailure: step.stopOnFailure, steps: step.steps ?? [], orderIndex: index, group: step };
    }
    return { type: 'single', id: step.id, step, orderIndex: index };
  });
}

export function createExecutionPlan(workflow) {
  return { workflowName: workflow.workflowName, settings: workflow.settings ?? {}, units: getExecutableUnits(workflow), flattenedSteps: flattenWorkflowSteps(workflow) };
}

export function flattenWorkflowSteps(workflow) {
  const flattened = [];
  for (const [unitIndex, step] of (workflow.steps ?? []).entries()) {
    if (step.mode === 'parallel') {
      flattened.push({ ...step, type: 'group', path: `steps[${unitIndex}]` });
      for (const [childIndex, child] of (step.steps ?? []).entries()) {
        flattened.push({ ...child, parentGroupId: step.id, path: `steps[${unitIndex}].steps[${childIndex}]` });
      }
    } else {
      flattened.push({ ...step, path: `steps[${unitIndex}]` });
    }
  }
  return flattened;
}

export function getStepById(workflow, stepId) {
  return flattenWorkflowSteps(workflow).find((step) => step.id === stepId) ?? null;
}

export function getStepPath(workflow, stepId) {
  return getStepById(workflow, stepId)?.path ?? null;
}
