const VARIABLE_PATTERN = /{{\s*([^{}]+?)\s*}}/g;

export function extractVariables(text = '') {
  const variables = new Set();
  for (const match of String(text).matchAll(VARIABLE_PATTERN)) {
    const name = match[1].trim();
    if (name) variables.add(name);
  }
  return [...variables];
}

<<<<<<< HEAD
export function buildSystemVariables({ workflowName = '', runId = '' } = {}) {
  const now = new Date();
  return {
    current_date: now.toISOString().slice(0, 10),
    current_time: now.toISOString().slice(11, 19),
    current_datetime: now.toISOString(),
    workflow_name: workflowName,
    run_id: runId
  };
}

export function buildStepContext(workflowInputs = {}, completedOutputs = {}, extraVariables = {}) {
  return {
    ...(extraVariables.system ?? {}),
    ...(extraVariables.global ?? {}),
    ...(extraVariables.template ?? {}),
    ...(extraVariables.workflow ?? {}),
=======
export function buildStepContext(workflowInputs = {}, completedOutputs = {}) {
  return {
>>>>>>> origin/main
    ...(workflowInputs ?? {}),
    ...(completedOutputs ?? {})
  };
}

<<<<<<< HEAD
export function detectUnresolvedVariables(text = '', context = {}) {
  return extractVariables(text).filter((name) => !Object.prototype.hasOwnProperty.call(context, name));
}

=======
>>>>>>> origin/main
export function resolveVariables(text = '', context = {}) {
  return String(text).replace(VARIABLE_PATTERN, (fullMatch, rawName) => {
    const name = rawName.trim();
    if (!Object.prototype.hasOwnProperty.call(context, name)) {
      throw new Error(`Variable ${fullMatch} is missing from the current workflow context.`);
    }
    const value = context[name];
    return value == null ? '' : String(value);
  });
}
<<<<<<< HEAD

export function previewVariableResolution(text = '', context = {}) {
  const missing = detectUnresolvedVariables(text, context);
  let resolved = String(text);
  try { resolved = resolveVariables(text, context); }
  catch { resolved = String(text).replace(VARIABLE_PATTERN, (match, raw) => Object.prototype.hasOwnProperty.call(context, raw.trim()) ? String(context[raw.trim()] ?? '') : match); }
  return { original: String(text), resolved, missing, variables: extractVariables(text), available: Object.keys(context) };
}
=======
>>>>>>> origin/main
