CREATE TABLE IF NOT EXISTS searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  arrival_datetime TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  best_option TEXT,
  best_duration_min INTEGER,
  best_cost_eur REAL
);

CREATE TABLE IF NOT EXISTS search_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  search_id INTEGER REFERENCES searches(id) ON DELETE CASCADE,
  transport_type TEXT NOT NULL,
  provider TEXT,
  departure_time TEXT,
  arrival_time TEXT,
  duration_min INTEGER,
  cost_eur REAL,
  details TEXT,
  score REAL,
  rank INTEGER
);
