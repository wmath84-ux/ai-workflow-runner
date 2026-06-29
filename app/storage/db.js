import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import { getDatabasePath } from '../shared/paths.js';
import { logger } from '../shared/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let database;

export function initializeDatabase() {
  if (database) return database;

  const dbPath = getDatabasePath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  database = new Database(dbPath);
  database.pragma('journal_mode = WAL');

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  database.exec(schema);
  migrateDatabase(database);
  logger.info(`SQLite database initialized at ${dbPath}`);
  return database;
}

export function getDatabase() {
  return database ?? initializeDatabase();
}


function migrateDatabase(db) {
  const runColumns = db.prepare("PRAGMA table_info(runs)").all().map((column) => column.name);
  if (!runColumns.includes('workflow_name')) {
    db.prepare("ALTER TABLE runs ADD COLUMN workflow_name TEXT NOT NULL DEFAULT 'Untitled Workflow'").run();
  }
  const stepColumns = db.prepare("PRAGMA table_info(run_steps)").all().map((column) => column.name);
  const addColumn = (name, sql) => { if (!stepColumns.includes(name)) db.prepare(sql).run(); };
  addColumn('parent_group_id', "ALTER TABLE run_steps ADD COLUMN parent_group_id TEXT");
  addColumn('order_index', "ALTER TABLE run_steps ADD COLUMN order_index INTEGER");
  addColumn('raw_json', "ALTER TABLE run_steps ADD COLUMN raw_json TEXT");
  addColumn('warning_json', "ALTER TABLE run_steps ADD COLUMN warning_json TEXT");
  addColumn('partial', "ALTER TABLE run_steps ADD COLUMN partial INTEGER DEFAULT 0");
}
