/**
 * server/src/profiles.js — Perfiles temporales (sin contraseñas).
 *
 * El navegador guarda un token aleatorio; aquí solo se conserva su HMAC.
 * Reglas clave:
 *   - Las fechas salen SIEMPRE del reloj del servidor (parámetro `now`, ms UTC).
 *   - expires_at = created_at + duración. Nunca se reinicia por usar la página.
 *   - Un perfil vencido se borra por completo (transacción + ON DELETE CASCADE).
 */
const crypto = require("crypto");
const { DURATIONS, DEFAULT_DURATION, LIMITS } = require("./config");
const { evaluateAchievements } = require("./stats");
const { ALL_TYPES, MECHANISMS } = require("./achievements");

const iso = (ms) => new Date(ms).toISOString();
class ApiError extends Error { constructor(status, code) { super(code); this.status = status; this.code = code; } }

function makeCrypto(pepper) {
  return {
    newToken: () => crypto.randomBytes(32).toString("base64url"),
    hash: (token) => crypto.createHmac("sha256", pepper).update(String(token)).digest("hex")
  };
}

const clean = (s) => String(s == null ? "" : s).replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
function validateIdentity(name, course) {
  const n = clean(name);
  if (typeof name !== "string" || !n) throw new ApiError(400, "invalid_name");
  if (n.length < LIMITS.NAME_MIN) throw new ApiError(400, "name_too_short");
  if (n.length > LIMITS.NAME_MAX) throw new ApiError(400, "name_too_long");
  return { name: n, course: validateCourse(course) };
}
/** Solo el curso. Se usa al cambiar el curso de un perfil existente: su nombre ya guardado no se vuelve a validar
 *  (los perfiles creados cuando el máximo era 40 caracteres siguen siendo válidos y editables). */
function validateCourse(course) {
  const c = clean(course);
  if (course != null && typeof course !== "string") throw new ApiError(400, "invalid_course");
  if (c.length > LIMITS.COURSE_MAX) throw new ApiError(400, "course_too_long");
  if (c && !/^\d+-\d+$/.test(c)) throw new ApiError(400, "invalid_course_format");
  return c;
}
function validateDuration(key) {
  if (typeof key !== "string" || !Object.prototype.hasOwnProperty.call(DURATIONS, key)) throw new ApiError(400, "invalid_duration");
  return key;
}

function publicProfile(p, now) {
  return {
    name: p.name, course: p.course, createdAt: p.created_at, expiresAt: p.expires_at,
    durationKey: p.duration_key, lastActivityAt: p.last_activity_at, status: p.status, serverNow: iso(now)
  };
}

function createService(db, { pepper, clock = Date.now }) {
  const C = makeCrypto(pepper);

  const insertProfile = (name, course, durationKey, now) => {
    const id = crypto.randomUUID();
    const secs = DURATIONS[durationKey];
    db.prepare(`INSERT INTO profiles (id, name, course, created_at, expires_at, duration_key, duration_seconds, last_activity_at, status)
      VALUES (?,?,?,?,?,?,?,?, 'active')`).run(id, name, course, iso(now), iso(now + secs * 1000), durationKey, secs, iso(now));
    const token = C.newToken();
    db.prepare("INSERT INTO profile_tokens (profile_id, token_hash, created_at) VALUES (?,?,?)").run(id, C.hash(token), iso(now));
    return { id, token };
  };
  const getById = (id) => db.prepare("SELECT * FROM profiles WHERE id = ?").get(id);

  /** Borra TODO lo del perfil. Las tablas hijas caen por ON DELETE CASCADE. */
  const deleteProfile = db.transaction((id) => db.prepare("DELETE FROM profiles WHERE id = ?").run(id).changes);

  /** Limpieza global: perfiles vencidos + restos huérfanos (por si alguna base se creó sin claves foráneas). */
  const purgeExpired = db.transaction((now = clock()) => {
    const n = db.prepare("DELETE FROM profiles WHERE expires_at <= ?").run(iso(now)).changes;
    ["profile_tokens", "activity_history", "profile_achievements", "mechanism_visits"].forEach((t) =>
      db.prepare(`DELETE FROM ${t} WHERE profile_id NOT IN (SELECT id FROM profiles)`).run());
    return n;
  });

  function create({ name, course, durationKey }) {
    const idt = validateIdentity(name, course);
    const key = validateDuration(durationKey == null ? DEFAULT_DURATION : durationKey);
    const now = clock();
    const r = db.transaction(() => insertProfile(idt.name, idt.course, key, now))();
    return { token: r.token, profile: publicProfile(getById(r.id), now) };
  }

  /** Valida el token y devuelve el perfil vigente (o lanza 401). Revisa el vencimiento ANTES de entregar nada. */
  function authenticate(token) {
    if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) throw new ApiError(401, "unauthorized");
    const now = clock();
    const row = db.prepare(`SELECT p.* FROM profile_tokens t JOIN profiles p ON p.id = t.profile_id WHERE t.token_hash = ?`).get(C.hash(token));
    if (!row) throw new ApiError(401, "unauthorized");
    if (Date.parse(row.expires_at) <= now) { deleteProfile(row.id); throw new ApiError(401, "expired"); }
    if (now - Date.parse(row.last_activity_at) > 30000) {
      db.prepare("UPDATE profiles SET last_activity_at = ? WHERE id = ?").run(iso(now), row.id);
      row.last_activity_at = iso(now);
    }
    return { profile: row, now };
  }

  function update(profile, { course, durationKey }) {
    const now = clock();
    if (course !== undefined) {
      const c = validateCourse(course);
      db.prepare("UPDATE profiles SET course = ? WHERE id = ?").run(c, profile.id);
    }
    if (durationKey !== undefined) {
      const key = validateDuration(durationKey);
      const secs = DURATIONS[key];
      const exp = Date.parse(profile.created_at) + secs * 1000;     // siempre desde la fecha ORIGINAL de creación
      if (exp <= now) { deleteProfile(profile.id); return { expired: true }; }
      db.prepare("UPDATE profiles SET duration_key = ?, duration_seconds = ?, expires_at = ? WHERE id = ?").run(key, secs, iso(exp), profile.id);
    }
    return { profile: publicProfile(getById(profile.id), now) };
  }

  /** Cambiar el nombre = perfil NUEVO (otro UUID, otra fecha, contador reiniciado) y se borra el anterior. */
  function rename(profile, name) {
    const idt = validateIdentity(name, profile.course);
    const now = clock();
    const r = db.transaction(() => {
      const nuevo = insertProfile(idt.name, profile.course, profile.duration_key, now);
      deleteProfile(profile.id);
      return nuevo;
    })();
    return { token: r.token, profile: publicProfile(getById(r.id), now) };
  }

  const clip = (s) => String(s == null ? "" : s).slice(0, LIMITS.TEXT_MAX);
  const int = (n, max = 1e6) => Math.max(0, Math.min(max, Math.round(Number(n) || 0)));

  function recordActivity(profile, body) {
    const b = body || {};
    if (typeof b.opId !== "string" || !/^[\w-]{8,64}$/.test(b.opId)) throw new ApiError(400, "invalid_activity");
    if (!ALL_TYPES.includes(b.tipo)) throw new ApiError(400, "invalid_activity");
    const kind = b.tipo === "quiz" ? "quiz" : "game";
    const score = b.nota == null ? null : Math.max(1, Math.min(5, Math.round(Number(b.nota) * 10) / 10));
    if (score !== null && !Number.isFinite(score)) throw new ApiError(400, "invalid_activity");
    const correct = int(b.correctas), incorrect = int(b.incorrectas), total = int(b.total);
    const m = b.memoria && typeof b.memoria === "object" ? b.memoria : null;
    // Una actividad abandonada o sin ningún avance no cuenta como completada.
    const avance = m ? int(m.parejas) : correct + incorrect;
    if (avance <= 0) return { recorded: false, reason: "no_progress", newAchievements: [] };
    const secs = b.tiempoSeg == null ? null : int(b.tiempoSeg, 86400);
    const detalle = Array.isArray(b.detalle) ? b.detalle.slice(0, LIMITS.DETAIL_ITEMS).map((d) => ({
      pregunta: clip(d && d.pregunta), elegida: d && d.elegida != null ? clip(d.elegida) : null, correcta: clip(d && d.correcta),
      ok: d && d.ok === true ? true : d && d.ok === false ? false : null, explicacion: clip(d && d.explicacion)
    })) : [];
    const memoria = m ? { parejas: int(m.parejas), total: int(m.total), intentos: int(m.intentos), conceptos: (Array.isArray(m.conceptos) ? m.conceptos : []).slice(0, 20).map((c) => ({ concepto: clip(c && c.concepto), definicion: clip(c && c.definicion), encontrada: !!(c && c.encontrada) })) } : null;
    const now = clock();
    return db.transaction(() => {
      const r = db.prepare(`INSERT OR IGNORE INTO activity_history (profile_id, op_id, activity_type, kind, completed_at, score, correct, incorrect, total, duration_seconds, detail_json)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(profile.id, b.opId, b.tipo, kind, iso(now), score, correct, incorrect, total, secs, JSON.stringify({ detalle, memoria }));
      if (!r.changes) return { recorded: false, reason: "duplicate", newAchievements: [] };
      return { recorded: true, newAchievements: evaluateAchievements(db, profile.id, iso(now)) };
    })();
  }

  function listActivities(profile, limit = 150) {
    return db.prepare("SELECT * FROM activity_history WHERE profile_id = ? ORDER BY completed_at DESC, id DESC LIMIT ?").all(profile.id, Math.min(300, limit)).map((r) => {
      let d = {}; try { d = JSON.parse(r.detail_json || "{}"); } catch (_) { /* detalle dañado: se ignora */ }
      const o = { id: String(r.id), tipo: r.activity_type, fecha: r.completed_at, nota: r.score, correctas: r.correct, incorrectas: r.incorrect, total: r.total, tiempoSeg: r.duration_seconds, detalle: d.detalle || [] };
      if (d.memoria) o.memoria = d.memoria;
      return o;
    });
  }

  function recordVisit(profile, id) {
    if (!MECHANISMS.includes(id)) throw new ApiError(400, "invalid_mechanism");
    const now = clock();
    return db.transaction(() => {
      db.prepare("INSERT OR IGNORE INTO mechanism_visits (profile_id, mechanism_id, visited_at) VALUES (?,?,?)").run(profile.id, id, iso(now));
      return { newAchievements: evaluateAchievements(db, profile.id, iso(now)) };
    })();
  }

  /** Borra solo el historial. Se retiran los logros que dependían de él; el de «Explorador» (visitas) se conserva. */
  function deleteHistory(profile) {
    db.transaction(() => {
      db.prepare("DELETE FROM activity_history WHERE profile_id = ?").run(profile.id);
      db.prepare(`DELETE FROM profile_achievements WHERE profile_id = ? AND achievement_id IN (SELECT id FROM achievements WHERE depends_on_history = 1)`).run(profile.id);
    })();
  }

  return { create, authenticate, update, rename, deleteProfile, purgeExpired, recordActivity, listActivities, recordVisit, deleteHistory, publicProfile, ApiError, clock };
}

module.exports = { createService, ApiError };
