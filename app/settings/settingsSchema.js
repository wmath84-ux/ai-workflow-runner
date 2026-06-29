export const settingsSchema = {
  exportFormats: ['markdown', 'txt', 'json', 'zip'],
  retentionDays: [0, 7, 30, 90, 365],
  backupIntervals: ['daily', 'weekly', 'manual'],
  maxConcurrency: { min: 1, max: 5 }
};
