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
  return ['outputs', 'exports', 'workflows', 'browser-profile'].map((folder) => projectPath(folder));
}

export function isAllowedProjectPath(targetPath) {
  return getAllowedFileRoots().some((root) => isPathInside(targetPath, root));
}
