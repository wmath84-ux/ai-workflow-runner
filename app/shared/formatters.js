export function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : 'n/a';
}

export function durationMs(start, end) {
  if (!start || !end) return null;
  return Math.max(0, new Date(end).getTime() - new Date(start).getTime());
}

export function formatDuration(start, end) {
  const ms = durationMs(start, end);
  if (ms == null) return 'n/a';
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

export function truncateText(text = '', length = 160) {
  const value = String(text);
  return value.length > length ? `${value.slice(0, length)}…` : value;
}
