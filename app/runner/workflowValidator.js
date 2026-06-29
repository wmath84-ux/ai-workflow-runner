import { extractVariables } from './variableResolver.js';
import { flattenWorkflowSteps } from './workflowPlanner.js';
import { validateDependencyGraph } from './dependencyResolver.js';
import { SYSTEM_VARIABLE_NAMES, validateInputSchema } from '../shared/validation.js';

const IMPLEMENTED_TOOLS = new Set(['mock', 'chatgpt', 'gemini', 'generic']);
const REGISTERED_UNIMPLEMENTED_TOOLS = new Set(['claude', 'perplexity']);
const GENERIC_SELECTOR_KEYS = new Set(['input', 'send', 'response', 'generating']);
function isPlainObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function add(errors, field, message) { errors.push({ field, message }); }

function validateSingleStep(step, field, errors) {
  for (const key of ['id', 'tool', 'prompt', 'saveAs']) if (!step[key] || typeof step[key] !== 'string') add(errors, `${field}.${key}`, `Step ${key} is required.`);
  if (step.mode !== 'single') add(errors, `${field}.mode`, 'Single steps must use mode "single".');
  if (step.tool && !IMPLEMENTED_TOOLS.has(step.tool)) {
    add(errors, `${field}.tool`, REGISTERED_UNIMPLEMENTED_TOOLS.has(step.tool) ? `Tool "${step.tool}" is registered but not implemented yet. Use "mock", "chatgpt", "gemini", or "generic" for now.` : `Unknown tool "${step.tool}".`);
  }
  if (step.dependsOn !== undefined && !Array.isArray(step.dependsOn)) add(errors, `${field}.dependsOn`, 'dependsOn must be an array of step IDs.');
  if (step.tool === 'generic') {
    if (!step.url || typeof step.url !== 'string') add(errors, `${field}.url`, 'Generic connector steps require a url string.');
    if (step.selectors !== undefined) {
      if (!isPlainObject(step.selectors)) add(errors, `${field}.selectors`, 'Generic selectors must be an object.');
      else for (const [key, value] of Object.entries(step.selectors)) {
        if (!GENERIC_SELECTOR_KEYS.has(key)) add(errors, `${field}.selectors.${key}`, 'Unsupported selector group. Use input, send, response, or generating.');
        else if (!Array.isArray(value) || value.some((selector) => typeof selector !== 'string')) add(errors, `${field}.selectors.${key}`, 'Selector group must be an array of strings.');
      }
    }
  }
}

export function validateWorkflow(workflow) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(workflow)) return { valid: false, errors: [{ field: 'workflow', message: 'Workflow must be a JSON object.' }], warnings };
  if (!workflow.workflowName || typeof workflow.workflowName !== 'string') add(errors, 'workflowName', 'Workflow name is required.');
  if (!isPlainObject(workflow.inputs)) add(errors, 'inputs', 'Inputs must be an object.');
  if (!Array.isArray(workflow.steps) || workflow.steps.length === 0) add(errors, 'steps', 'Steps must be a non-empty array.');
  if (workflow.inputSchema !== undefined) errors.push(...validateInputSchema(workflow.inputSchema));
  for (const inputName of Object.keys(isPlainObject(workflow.inputs) ? workflow.inputs : {})) {
    if (SYSTEM_VARIABLE_NAMES.has(inputName)) add(errors, `inputs.${inputName}`, 'Workflow input conflicts with a reserved system variable.');
  }
  if (workflow.settings?.maxConcurrency !== undefined && (!Number.isFinite(Number(workflow.settings.maxConcurrency)) || Number(workflow.settings.maxConcurrency) <= 0)) add(errors, 'settings.maxConcurrency', 'settings.maxConcurrency must be a positive number.');

  const stepIds = new Set();
  const saveAsKeys = new Set();
  const availableVariables = new Set([...Object.keys(isPlainObject(workflow.inputs) ? workflow.inputs : {}), ...SYSTEM_VARIABLE_NAMES]);

  (workflow.steps ?? []).forEach((unit, unitIndex) => {
    const field = `steps[${unitIndex}]`;
    if (!isPlainObject(unit)) return add(errors, field, 'Step must be an object.');
    if (!unit.id || typeof unit.id !== 'string') add(errors, `${field}.id`, 'Step or group id is required.');
    if (unit.id && stepIds.has(unit.id)) add(errors, `${field}.id`, `Duplicate step/group id "${unit.id}" is not allowed.`);
    if (unit.id) stepIds.add(unit.id);
    if (unit.mode === 'parallel') {
      if (!Array.isArray(unit.steps) || unit.steps.length < 2) add(errors, `${field}.steps`, 'Parallel groups require at least two child steps.');
      if (unit.maxConcurrency !== undefined && (!Number.isFinite(Number(unit.maxConcurrency)) || Number(unit.maxConcurrency) <= 0)) add(errors, `${field}.maxConcurrency`, 'Parallel group maxConcurrency must be positive.');
      const groupStartVariables = new Set(availableVariables);
      (unit.steps ?? []).forEach((child, childIndex) => {
        const childField = `${field}.steps[${childIndex}]`;
        if (child.mode === 'parallel') add(errors, childField, 'Nested parallel groups are not supported yet.');
        validateSingleStep(child, childField, errors);
        if (child.id && stepIds.has(child.id)) add(errors, `${childField}.id`, `Duplicate step id "${child.id}" is not allowed.`);
        if (child.id) stepIds.add(child.id);
        if (child.saveAs && saveAsKeys.has(child.saveAs)) add(errors, `${childField}.saveAs`, `Duplicate saveAs key "${child.saveAs}" is not allowed.`);
        if (child.saveAs && SYSTEM_VARIABLE_NAMES.has(child.saveAs)) add(errors, `${childField}.saveAs`, 'saveAs conflicts with a reserved system variable.');
        if (child.saveAs && Object.prototype.hasOwnProperty.call(workflow.inputs ?? {}, child.saveAs)) add(errors, `${childField}.saveAs`, 'saveAs must not conflict with a workflow input name.');
        for (const variable of extractVariables(child.prompt ?? '')) if (!groupStartVariables.has(variable)) add(errors, `${childField}.prompt`, `Variable {{${variable}}} is not available inside the same parallel group.`);
      });
      for (const child of unit.steps ?? []) if (child.saveAs) { saveAsKeys.add(child.saveAs); availableVariables.add(child.saveAs); }
    } else {
      validateSingleStep(unit, field, errors);
      if (unit.saveAs && saveAsKeys.has(unit.saveAs)) add(errors, `${field}.saveAs`, `Duplicate saveAs key "${unit.saveAs}" is not allowed.`);
      if (unit.saveAs && SYSTEM_VARIABLE_NAMES.has(unit.saveAs)) add(errors, `${field}.saveAs`, 'saveAs conflicts with a reserved system variable.');
      if (unit.saveAs && Object.prototype.hasOwnProperty.call(workflow.inputs ?? {}, unit.saveAs)) add(errors, `${field}.saveAs`, 'saveAs must not conflict with a workflow input name.');
      for (const variable of extractVariables(unit.prompt ?? '')) if (!availableVariables.has(variable)) add(errors, `${field}.prompt`, `Variable {{${variable}}} is missing or not available before this step.`);
      if (unit.saveAs) { saveAsKeys.add(unit.saveAs); availableVariables.add(unit.saveAs); }
    }
  });

  const dependency = validateDependencyGraph(workflow);
  errors.push(...dependency.errors);
  return { valid: errors.length === 0, errors, warnings };
}
