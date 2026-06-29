import fs from 'node:fs/promises';
import path from 'node:path';

export function safeName(value) {
  return String(value || 'item').toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
}

export function projectPath(...parts) {
  return path.resolve(process.cwd(), ...parts);
}

export async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
  return dirPath;
}

export function isPathInside(childPath, parentPath) {
  const relative = path.relative(path.resolve(parentPath), path.resolve(childPath));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

export function getAllowedFileRoots() {
  return ['outputs', 'exports', 'workflows', 'browser-profile', 'backups', 'diagnostics', 'logs'].map((folder) => projectPath(folder));
}

export function isAllowedProjectPath(targetPath) {
  return getAllowedFileRoots().some((root) => isPathInside(targetPath, root));
}


export function isPathInsideAllowedFolders(filePath, allowedFolders) {
  return allowedFolders.some((folder) => isPathInside(filePath, folder));
}

export async function copyFileSafe(source, destination) {
  await ensureDir(path.dirname(destination));
  await fs.copyFile(source, destination);
  return destination;
}

export async function copyDirSafe(source, destination, options = {}) {
  await ensureDir(destination);
  const entries = await fs.readdir(source, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);
    if (entry.isDirectory()) await copyDirSafe(sourcePath, destPath, options);
    else await copyFileSafe(sourcePath, destPath);
  }
  return destination;
}

export async function getFolderSize(folderPath) {
  let total = 0;
  const entries = await fs.readdir(folderPath, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const current = path.join(folderPath, entry.name);
    if (entry.isDirectory()) total += await getFolderSize(current);
    else total += (await fs.stat(current).catch(() => ({ size: 0 }))).size;
  }
  return total;
}

export async function safeRemoveFile(filePath) {
  if (!isAllowedProjectPath(filePath)) throw new Error('Refusing to remove a file outside approved app folders.');
  await fs.rm(filePath, { force: true });
  return true;
}

export async function safeRemoveDir(dirPath) {
  if (!isAllowedProjectPath(dirPath)) throw new Error('Refusing to remove a folder outside approved app folders.');
  await fs.rm(dirPath, { recursive: true, force: true });
  return true;
}

export function makeSafeFileName(name) { return safeName(name); }
export function makeTimestampedFolderName(prefix) { return `${safeName(prefix)}-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`; }
