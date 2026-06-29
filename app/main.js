import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeDatabase } from './storage/db.js';
import { registerWorkflowIpc } from './ipc/workflow.ipc.js';
import { registerSettingsIpc } from './ipc/settings.ipc.js';
import { registerResultsIpc } from './ipc/results.ipc.js';
import { registerBrowserIpc } from './ipc/browser.ipc.js';
import { registerExportIpc } from './ipc/export.ipc.js';
import { registerLogsIpc } from './ipc/logs.ipc.js';
import { registerFilesIpc } from './ipc/files.ipc.js';
import { registerPromptsIpc } from './ipc/prompts.ipc.js';
import { registerTemplatesIpc } from './ipc/templates.ipc.js';
import { registerVariablesIpc } from './ipc/variables.ipc.js';
import { registerBackupIpc } from './ipc/backup.ipc.js';
import { registerPackageIpc } from './ipc/package.ipc.js';
import { registerHealthIpc } from './ipc/health.ipc.js';
import { runMigrations } from './migrations/migrationManager.js';
import { runQuickHealthCheck } from './health/healthCheckManager.js';
import { ensureDir, projectPath } from './shared/fileUtils.js';
import { registerReadinessIpc } from './ipc/readiness.ipc.js';
import { registerOnboardingIpc } from './ipc/onboarding.ipc.js';
import { registerShortcutsIpc } from './ipc/shortcuts.ipc.js';
import { registerAppIpc } from './ipc/app.ipc.js';
import { seedDefaultPromptsIfEmpty } from './storage/prompts.js';
import { seedDefaultTemplatesIfEmpty } from './storage/templates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDevelopment = Boolean(process.env.VITE_DEV_SERVER_URL);

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 620,
    title: 'AI Workflow Runner',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (isDevelopment) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  return mainWindow;
}

app.whenReady().then(async () => {
  for (const folder of ['outputs', 'exports', 'backups', 'diagnostics', 'workflows', 'browser-profile', 'logs']) await ensureDir(projectPath(folder));
  initializeDatabase();
  await runMigrations();
  seedDefaultPromptsIfEmpty();
  seedDefaultTemplatesIfEmpty();
  await runQuickHealthCheck();
  registerWorkflowIpc();
  registerSettingsIpc();
  registerResultsIpc();
  registerBrowserIpc();
  registerExportIpc();
  registerLogsIpc();
  registerFilesIpc();
  registerPromptsIpc();
  registerTemplatesIpc();
  registerVariablesIpc();
  registerBackupIpc();
  registerPackageIpc();
  registerHealthIpc();
  registerReadinessIpc();
  registerOnboardingIpc();
  registerShortcutsIpc();
  registerAppIpc();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
