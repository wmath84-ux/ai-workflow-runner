import { getDatabase } from '../storage/db.js';
import { migrationRegistry } from './migrationRegistry.js';

export function createTableIfMissing(db, sql) {
  db.prepare(sql).run();
}

export function addColumnIfMissing(db, table, column, sql) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((columnInfo) => columnInfo.name);
  if (!columns.includes(column)) db.prepare(sql).run();
}

export function indexIfMissing(db, name, sql) {
  const row = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name=?").get(name);
  if (!row) db.prepare(sql).run();
}

export async function hasMigrationApplied(id) {
  return Boolean(getDatabase().prepare("SELECT id FROM migrations WHERE id=? AND status='applied'").get(id));
}

export async function markMigrationApplied(id, name = id, checksum = null) {
  getDatabase()
    .prepare(
      "INSERT INTO migrations (id,name,checksum,status,error) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,error=NULL,applied_at=CURRENT_TIMESTAMP"
    )
    .run(id, name, checksum, 'applied', null);
}

export async function runMigrations() {
  const db = getDatabase();
  db.prepare(
    'CREATE TABLE IF NOT EXISTS migrations (id TEXT PRIMARY KEY,name TEXT NOT NULL,applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,checksum TEXT,status TEXT NOT NULL,error TEXT)'
  ).run();

  const results = [];
  for (const migration of migrationRegistry) {
    if (await hasMigrationApplied(migration.id)) {
      results.push({ ...migration, status: 'already_applied' });
      continue;
    }

    try {
      await migration.up(db);
      await markMigrationApplied(migration.id, migration.name);
      results.push({ ...migration, status: 'applied' });
    } catch (error) {
      db.prepare(
        'INSERT INTO migrations (id,name,status,error) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,error=excluded.error'
      ).run(migration.id, migration.name, 'failed', error.message);
      results.push({ ...migration, status: 'failed', error: error.message });
    }
  }
  return results;
}

export async function getMigrationStatus() {
  const applied = getDatabase().prepare('SELECT * FROM migrations ORDER BY applied_at DESC').all();
  return { registry: migrationRegistry, applied };
}
