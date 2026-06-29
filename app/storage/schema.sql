CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  definition_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  workflow_id TEXT,
  workflow_name TEXT NOT NULL DEFAULT 'Untitled Workflow',
  status TEXT NOT NULL DEFAULT 'pending',
  input_json TEXT DEFAULT '{}',
  checkpoint_json TEXT DEFAULT '{}',
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);

CREATE TABLE IF NOT EXISTS run_steps (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  step_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  input_json TEXT DEFAULT '{}',
  output_json TEXT DEFAULT '{}',
  error_json TEXT DEFAULT '{}',
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (run_id) REFERENCES runs(id)
);

CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  run_id TEXT,
  workflow_id TEXT,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'saved',
  result_json TEXT NOT NULL,
  file_path TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (run_id) REFERENCES runs(id),
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS checkpoints (
  run_id TEXT PRIMARY KEY,
  checkpoint_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (run_id) REFERENCES runs(id)
);
