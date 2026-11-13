/**
 * server/src/stats.js — Estadísticas personales y evaluación de logros.
 * Todo se calcula con SQL a partir de los registros del perfil (UUID); nada se inventa.
 */
const { ACHIEVEMENTS, ALL_TYPES, MECHANISMS } = require("./achievements");

function baseStats(db, id) {
  const r = db.prepare(`SELECT COUNT(*) total,
      SUM(kind='quiz') quizzes, SUM(kind='game') games,
      AVG(score) avg, MAX(score) best,
      MAX(CASE WHEN kind='quiz' THEN score END) bestQuiz,
      COALESCE(SUM(correct),0) correct, COALESCE(SUM(incorrect),0) incorrect,
      COALESCE(SUM(duration_seconds),0) time
    FROM activity_history WHERE profile_id = ?`).get(id);
  const byType = {};
  db.prepare("SELECT activity_type t, COUNT(*) n FROM activity_history WHERE profile_id = ? GROUP BY activity_type").all(id).forEach((x) => { byType[x.t] = x.n; });
  const visited = db.prepare("SELECT COUNT(*) n FROM mechanism_visits WHERE profile_id = ?").get(id).n;
  return {
    total: r.total || 0, quizzes: r.quizzes || 0, games: r.games || 0,
    avgScore: r.avg == null ? null : Math.round(r.avg * 100) / 100, bestScore: r.best, bestQuizScore: r.bestQuiz,
    correct: r.correct, incorrect: r.incorrect, timeSeconds: r.time,
    byCategory: byType, types: new Set(Object.keys(byType)), visited
  };
}

function personalStats(db, profile, nowMs) {
  const s = baseStats(db, profile.id);
  const done = ALL_TYPES.filter((t) => s.types.has(t)).length;
  const progress = Math.round(((done + Math.min(s.visited, MECHANISMS.length)) / (ALL_TYPES.length + MECHANISMS.length)) * 100);
  return {
    totalActivities: s.total, totalQuizzes: s.quizzes, totalGames: s.games,
    averageScore: s.avgScore, bestScore: s.bestScore,
    correctAnswers: s.correct, incorrectAnswers: s.incorrect, learningSeconds: s.timeSeconds,
    byCategory: s.byCategory, typesCompleted: done, typesTotal: ALL_TYPES.length,
    mechanismsVisited: s.visited, mechanismsTotal: MECHANISMS.length, progress,
    createdAt: profile.created_at, expiresAt: profile.expires_at,
    remainingSeconds: Math.max(0, Math.floor((Date.parse(profile.expires_at) - nowMs) / 1000))
  };
}

/** Desbloquea los logros cuya condición ya se cumple. Devuelve las claves recién obtenidas. */
function evaluateAchievements(db, profileId, nowIso) {
  const s = baseStats(db, profileId);
  const have = new Set(db.prepare("SELECT a.key FROM profile_achievements pa JOIN achievements a ON a.id = pa.achievement_id WHERE pa.profile_id = ?").all(profileId).map((x) => x.key));
  const ins = db.prepare("INSERT OR IGNORE INTO profile_achievements (profile_id, achievement_id, unlocked_at) SELECT ?, id, ? FROM achievements WHERE key = ?");
  const nuevos = [];
  ACHIEVEMENTS.forEach((a) => {
    if (have.has(a.key) || !a.check(s)) return;
    if (ins.run(profileId, nowIso, a.key).changes) nuevos.push(a.key);
  });
  return nuevos;
}

function listAchievements(db, profileId) {
  return db.prepare(`SELECT a.key, a.name, a.description, a.icon, a.condition_text AS condition, pa.unlocked_at AS unlockedAt
    FROM achievements a LEFT JOIN profile_achievements pa ON pa.achievement_id = a.id AND pa.profile_id = ?
    ORDER BY a.id`).all(profileId).map((x) => ({ ...x, unlocked: !!x.unlockedAt }));
}

module.exports = { personalStats, evaluateAchievements, listAchievements, baseStats };
