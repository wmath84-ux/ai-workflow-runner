import path from 'node:path';
import { app } from 'electron';

export function getUserDataPath() {
  return app.getPath('userData');
}

export function getDatabasePath() {
  return path.join(getUserDataPath(), 'ai-workflow-runner.sqlite3');
}

export const projectPaths = {
  workflows: 'workflows',
  outputs: 'outputs',
  browserProfile: 'browser-profile'
};
