import { extractVariables } from './variableResolver.js';

function addError(errors, field, message) {
  errors.push({ field, message });
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function validateWorkflow(workflow) {
  const errors = [];

  if (!isPlainObject(workflow)) {
    return { valid: false, errors: [{ field: 'workflow', message: 'Workflow must be a JSON object.' }] };
  }

  if (!workflow.workflowName || typeof workflow.workflowName !== 'string') {
    addError(errors, 'workflowName', 'Workflow name is required.');
  }

  if (!isPlainObject(workflow.inputs)) {
    addError(errors, 'inputs', 'Inputs must be an object.');
  }

  if (!Array.isArray(workflow.steps) || workflow.steps.length === 0) {
    addError(errors, 'steps', 'Steps must be a non-empty array.');
  }

  const stepIds = new Set();
  const saveAsKeys = new Set();
  const availableVariables = new Set(Object.keys(isPlainObject(workflow.inputs) ? workflow.inputs : {}));

  if (Array.isArray(workflow.steps)) {
    workflow.steps.forEach((step, index) => {
      const fieldPrefix = `steps[${index}]`;
      if (!isPlainObject(step)) {
        addError(errors, fieldPrefix, 'Step must be an object.');
        return;
      }

      for (const key of ['id', 'tool', 'prompt', 'saveAs']) {
        if (!step[key] || typeof step[key] !== 'string') {
          addError(errors, `${fieldPrefix}.${key}`, `Step ${key} is required.`);
        }
      }

      if (step.id) {
        if (stepIds.has(step.id)) {
          addError(errors, `${fieldPrefix}.id`, `Duplicate step id "${step.id}" is not allowed.`);
        }
        stepIds.add(step.id);
      }

      if (step.saveAs) {
        if (saveAsKeys.has(step.saveAs)) {
          addError(errors, `${fieldPrefix}.saveAs`, `Duplicate saveAs key "${step.saveAs}" is not allowed.`);
        }
      }

      if (step.mode && step.mode !== 'single') {
        addError(errors, `${fieldPrefix}.mode`, 'Only mode "single" is supported. Parallel steps are not supported yet.');
      }

      if (typeof step.prompt === 'string') {
        for (const variable of extractVariables(step.prompt)) {
          if (!availableVariables.has(variable)) {
            addError(errors, `${fieldPrefix}.prompt`, `Variable {{${variable}}} is missing or not available before this step.`);
          }
        }
      }

      if (step.saveAs) {
        saveAsKeys.add(step.saveAs);
        availableVariables.add(step.saveAs);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}
