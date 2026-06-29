export const defaultSettings = {
  app: { theme: 'system', startPage: 'home', compactMode: false, showAdvancedOptions: false, onboardingCompleted: false, onboardingCompletedAt: null, keyboardShortcutsEnabled: true, commandPaletteEnabled: true, showSetupChecklistOnHome: true },
  browser: { profilePath: '', defaultTool: 'chatgpt', autoLaunchBrowser: false, rememberOpenTabs: true, warnBeforeClearingProfile: true },
  workflow: { defaultMaxConcurrency: 2, stopParallelGroupOnFailure: true, allowConcurrentRuns: false, queueEnabled: true, defaultRunMode: 'queue', autoSaveWorkflowBeforeRun: true },
  outputs: { outputFolder: '', exportsFolder: '', defaultExportFormat: 'markdown', saveStepMarkdown: true, saveStepJson: true, saveFinalOutput: true },
  logs: { level: 'info', retentionDays: 30, saveToDatabase: true, saveBrowserLogs: true, saveConnectorLogs: true },
  backups: { backupFolder: '', autoBackupEnabled: false, autoBackupInterval: 'daily', keepLastBackups: 10, includeOutputs: true, includeExports: false, includeBrowserProfile: false },
  safety: { requireConfirmBeforeDelete: true, requireConfirmBeforeRestore: true, requireConfirmBeforeProfileClear: true, blockUnsafeFileOpen: true }
};
