/**
 * server/src/db.js
 * Apertura de SQLite y esquema. La base de datos solo la toca el servidor:
 * el navegador nunca la ve (no se sirve como archivo estático).
 *
 *   profiles ──< profile_tokens
 *            ──< activity_history
 *            ──< profile_achievements >── achievements
 *            ──< mechanism_visits
 *
 * Todas las tablas hijas usan ON DELETE CASCADE: borrar un perfil elimina
 * en una sola operación todo lo relacionado (sin registros huérfanos).
 * Las fechas se guardan en UTC (ISO 8601 con «Z»), siempre con el reloj del servidor.
 */
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const { ACHIEVEMENTS } = require("./achievements");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS profiles (
  id               TEXT PRIMARY KEY,                       -- UUID v4 interno
  name             TEXT NOT NULL,
  course           TEXT NOT NULL DEFAULT '',
  created_at       TEXT NOT NULL,                          -- UTC, inalterable
  expires_at       TEXT NOT NULL,                          -- created_at + duración
  duration_key     TEXT NOT NULL,                          -- 1h,2h,5h,10h,12h,1d,2d,3d,4d,5d
  duration_seconds INTEGER NOT NULL,
  last_activity_at TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active'))
);
CREATE INDEX IF NOT EXISTS idx_profiles_expires ON profiles(expires_at);

-- La fecha de creación y el identificador no se pueden modificar nunca.
CREATE TRIGGER IF NOT EXISTS trg_profiles_immutable
BEFORE UPDATE OF id, created_at ON profiles
BEGIN
  SELECT RAISE(ABORT, 'profiles.id y profiles.created_at son inalterables');
END;

CREATE TABLE IF NOT EXISTS profile_tokens (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,                         -- HMAC-SHA256 del token; el token en claro no se guarda
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tokens_profile ON profile_tokens(profile_id);

CREATE TABLE IF NOT EXISTS activity_history (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id       TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  op_id            TEXT NOT NULL,                          -- idempotencia: la misma operación no se duplica
  activity_type    TEXT NOT NULL,                          -- quiz, crossword, matching, wordsearch, situations, memory, roulette
  kind             TEXT NOT NULL CHECK (kind IN ('quiz','game')),
  completed_at     TEXT NOT NULL,
  score            REAL,                                   -- 1.0–5.0 o NULL si la actividad no se califica
  correct          INTEGER NOT NULL DEFAULT 0,
  incorrect        INTEGER NOT NULL DEFAULT 0,
  total            INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,                                -- NULL = la actividad no midió el tiempo
  detail_json      TEXT,
  UNIQUE (profile_id, op_id)
);
CREATE INDEX IF NOT EXISTS idx_history_profile ON activity_history(profile_id, completed_at);

CREATE TABLE IF NOT EXISTS achievements (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  key                TEXT NOT NULL UNIQUE,
  name               TEXT NOT NULL,
  description        TEXT NOT NULL,
  icon               TEXT NOT NULL,
  condition_text     TEXT NOT NULL,
  depends_on_history INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS profile_achievements (
  profile_id     TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at    TEXT NOT NULL,
  PRIMARY KEY (profile_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS mechanism_visits (
  profile_id   TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mechanism_id TEXT NOT NULL,
  visited_at   TEXT NOT NULL,
  PRIMARY KEY (profile_id, mechanism_id)
);
`;

function open(dbPath) {
  if (dbPath !== ":memory:") fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.exec(SCHEMA);
  syncAchievements(db);
  return db;
}

/** Mantiene el catálogo de logros de la base de datos igual al definido en el código. */
function syncAchievements(db) {
  const up = db.prepare(`INSERT INTO achievements (key, name, description, icon, condition_text, depends_on_history)
    VALUES (@key, @name, @description, @icon, @condition, @history)
    ON CONFLICT(key) DO UPDATE SET name=excluded.name, description=excluded.description, icon=excluded.icon,
      condition_text=excluded.condition_text, depends_on_history=excluded.depends_on_history`);
  db.transaction(() => ACHIEVEMENTS.forEach((a) => up.run({ key: a.key, name: a.name, description: a.description, icon: a.icon, condition: a.condition, history: a.dependsOnHistory ? 1 : 0 })))();
}

module.exports = { open };
