const VARIABLE_PATTERN = /{{\s*([^{}]+?)\s*}}/g;

export function extractVariables(text = '') {
  const variables = new Set();
  for (const match of String(text).matchAll(VARIABLE_PATTERN)) {
    const name = match[1].trim();
    if (name) variables.add(name);
  }
  return [...variables];
}

export function buildStepContext(workflowInputs = {}, completedOutputs = {}) {
  return {
    ...(workflowInputs ?? {}),
    ...(completedOutputs ?? {})
  };
}

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
