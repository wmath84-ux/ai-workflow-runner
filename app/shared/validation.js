export const SYSTEM_VARIABLE_NAMES = new Set(['current_date', 'current_time', 'current_datetime', 'workflow_name', 'run_id']);
export const INPUT_FIELD_TYPES = new Set(['text', 'textarea', 'number', 'select', 'checkbox', 'date']);
export function isValidVariableName(name) { return /^[A-Za-z_][A-Za-z0-9_]*$/.test(String(name ?? '')); }
export function validateInputSchema(inputSchema = {}, reservedNames = []) {
  const errors = [];
  const seen = new Set();
  for (const [name, field] of Object.entries(inputSchema ?? {})) {
    if (!isValidVariableName(name)) errors.push({ field: `inputSchema.${name}`, message: 'Input field names may only contain letters, numbers, and underscores and cannot start with a number.' });
    if (seen.has(name)) errors.push({ field: `inputSchema.${name}`, message: 'Duplicate input field name.' });
    if (SYSTEM_VARIABLE_NAMES.has(name) || reservedNames.includes(name)) errors.push({ field: `inputSchema.${name}`, message: 'Input field name conflicts with a reserved or output variable name.' });
    seen.add(name);
    if (!field || typeof field !== 'object' || !INPUT_FIELD_TYPES.has(field.type ?? 'text')) errors.push({ field: `inputSchema.${name}.type`, message: 'Unsupported input field type.' });
    if ((field?.type === 'select') && (!Array.isArray(field.options) || field.options.length === 0)) errors.push({ field: `inputSchema.${name}.options`, message: 'Select fields require options.' });
  }
  return errors;
}
