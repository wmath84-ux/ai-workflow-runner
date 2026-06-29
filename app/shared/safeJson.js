export function safeJsonParse(value, fallback = null) { try { return typeof value === 'string' ? JSON.parse(value) : (value ?? fallback); } catch { return fallback; } }
export function safeJsonStringify(value, fallback = '{}') { try { return JSON.stringify(value, null, 2); } catch { return fallback; } }
export function parseJsonWithError(value) { try { return { ok: true, value: JSON.parse(value) }; } catch (error) { return { ok: false, error: error.message, value: null }; } }
export function formatJson(value) { return safeJsonStringify(typeof value === 'string' ? safeJsonParse(value, {}) : value, '{}'); }
