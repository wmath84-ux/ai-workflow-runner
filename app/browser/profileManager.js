import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

export function getDefaultProfilePath() {
  return path.resolve(process.cwd(), 'browser-profile');
}

export function resolveProfilePath(customPath) {
  if (!customPath || !String(customPath).trim()) return getDefaultProfilePath();
  return path.resolve(String(customPath).trim());
}

export function ensureProfileDir(profilePath = getDefaultProfilePath()) {
  fs.mkdirSync(profilePath, { recursive: true });
  fs.accessSync(profilePath, fs.constants.R_OK | fs.constants.W_OK);
  return profilePath;
}

async function getDirectorySize(directoryPath) {
  let total = 0;
  try {
    const entries = await fsp.readdir(directoryPath, { withFileTypes: true });
    for (const entry of entries) {
      const childPath = path.join(directoryPath, entry.name);
      if (entry.isDirectory()) total += await getDirectorySize(childPath);
      else if (entry.isFile()) total += (await fsp.stat(childPath)).size;
    }
  } catch {
    return total;
  }
  return total;
}

export async function clearProfile(profilePath = getDefaultProfilePath()) {
  const resolvedPath = resolveProfilePath(profilePath);
  await fsp.rm(resolvedPath, { recursive: true, force: true });
  await fsp.mkdir(resolvedPath, { recursive: true });
  return getProfileInfo(resolvedPath);
}

export async function getProfileInfo(profilePath = getDefaultProfilePath()) {
  const resolvedPath = resolveProfilePath(profilePath);
  try {
    const stats = await fsp.stat(resolvedPath);
    return {
      path: resolvedPath,
      exists: true,
      sizeBytes: stats.isDirectory() ? await getDirectorySize(resolvedPath) : stats.size,
      createdAt: stats.birthtime.toISOString(),
      modifiedAt: stats.mtime.toISOString()
    };
  } catch {
    return { path: resolvedPath, exists: false, sizeBytes: 0, createdAt: null, modifiedAt: null };
  }
}
