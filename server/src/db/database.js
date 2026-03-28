import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db;

export function getDb() {
  if (!db) {
    db = new Database(config.dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    db.exec(schema);
  }
  return db;
}

export function saveSearch({ origin, destination, arrivalDatetime, bestOption, bestDurationMin, bestCostEur }) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO searches (origin, destination, arrival_datetime, best_option, best_duration_min, best_cost_eur)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(origin, destination, arrivalDatetime, bestOption, bestDurationMin, bestCostEur);
  return result.lastInsertRowid;
}

export function saveSearchResults(searchId, results) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO search_results (search_id, transport_type, provider, departure_time, arrival_time, duration_min, cost_eur, details, score, rank)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run(
        searchId,
        item.transportType,
        item.provider || null,
        item.departureTime || null,
        item.arrivalTime || null,
        item.durationMin || null,
        item.costEur || null,
        item.details ? JSON.stringify(item.details) : null,
        item.score || null,
        item.rank || null
      );
    }
  });
  insertMany(results);
}

export function getSearchHistory(limit = 50) {
  const db = getDb();
  return db.prepare('SELECT * FROM searches ORDER BY created_at DESC LIMIT ?').all(limit);
}

export function getSearchById(id) {
  const db = getDb();
  const search = db.prepare('SELECT * FROM searches WHERE id = ?').get(id);
  if (!search) return null;
  const results = db.prepare('SELECT * FROM search_results WHERE search_id = ? ORDER BY rank ASC').all(id);
  return { ...search, results: results.map(r => ({ ...r, details: r.details ? JSON.parse(r.details) : null })) };
}

export function deleteSearch(id) {
  const db = getDb();
  db.prepare('DELETE FROM searches WHERE id = ?').run(id);
}
