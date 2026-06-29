export function timestampForFile(date = new Date()) { return date.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19); }
export function daysAgo(days) { return new Date(Date.now() - Number(days) * 86400000).toISOString(); }
