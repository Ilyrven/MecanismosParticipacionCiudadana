const test = require("node:test");
const assert = require("node:assert");
const { createApp } = require("../src/app");

let now = Date.parse("2026-11-11T08:30:00.000Z");
const clock = () => now;
const { app, db, svc } = createApp({ dbPath: ":memory:", clock });
let base, srv;
test.before(() => new Promise((r) => { srv = app.listen(0, "127.0.0.1", () => { base = `http://127.0.0.1:${srv.address().port}`; r(); }); }));
test.after(() => { srv.close(); db.close(); });

const call = async (method, url, body, token) => {
  const res = await fetch(base + url, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};
const count = (t) => db.prepare(`SELECT COUNT(*) n FROM ${t}`).get().n;
let op = 0;
const act = (token, o) => call("POST", "/api/activities", { opId: "op-test-" + (++op), tipo: "quiz", nota: 4, correctas: 4, incorrectas: 1, total: 5, tiempoSeg: 60, ...o }, token);

test("crea perfil con reloj del servidor y vence a los 5 días por defecto", async () => {
  const r = await call("POST", "/api/profiles", { name: "  Ana   María  ", course: "11-2", createdAt: "1999-01-01T00:00:00Z" });
  assert.strictEqual(r.status, 201);
  assert.strictEqual(r.body.profile.name, "Ana María");
  assert.strictEqual(r.body.profile.createdAt, "2026-11-11T08:30:00.000Z");
  assert.strictEqual(r.body.profile.expiresAt, "2026-11-16T08:30:00.000Z");
  assert.ok(!("id" in r.body.profile));
  assert.match(r.body.token, /^[\w-]{43}$/);
  const row = db.prepare("SELECT token_hash FROM profile_tokens").get();
  assert.notStrictEqual(row.token_hash, r.body.token);   // solo se guarda el hash
  await call("DELETE", "/api/profile", null, r.body.token);
});

test("valida entradas y duraciones (solo las 10 permitidas)", async () => {
  assert.strictEqual((await call("POST", "/api/profiles", { name: "" })).body.error, "invalid_name");
  assert.strictEqual((await call("POST", "/api/profiles", { name: "Al" })).body.error, "name_too_short");
  assert.strictEqual((await call("POST", "/api/profiles", { name: "x".repeat(41) })).body.error, "name_too_long");
  assert.strictEqual((await call("POST", "/api/profiles", { name: "x".repeat(26) })).body.error, "name_too_long");   // máximo: 25
  assert.strictEqual((await call("POST", "/api/profiles", { name: "x".repeat(25) })).status, 201);
  assert.strictEqual((await call("POST", "/api/profiles", { name: "Ana", course: "c".repeat(21) })).body.error, "course_too_long");
  assert.strictEqual((await call("POST", "/api/profiles", { name: "Ana", course: "Error" })).body.error, "invalid_course_format");
  assert.strictEqual((await call("POST", "/api/profiles", { name: "Ana", course: "11" })).body.error, "invalid_course_format");
  assert.strictEqual((await call("POST", "/api/profiles", { name: "Ana", course: "11-" })).body.error, "invalid_course_format");
  assert.strictEqual((await call("POST", "/api/profiles", { name: "Ana", course: "12-8" })).status, 201);
  assert.strictEqual((await call("POST", "/api/profiles", { name: "Ana", durationKey: "6d" })).body.error, "invalid_duration");
  assert.strictEqual((await call("POST", "/api/profiles", { name: "'; DROP TABLE profiles;--" })).status, 201);
  assert.ok(count("profiles") >= 1);
});

test("un perfil creado con el máximo anterior (hasta 40) sigue pudiendo cambiar curso y duración", async () => {
  const c = await call("POST", "/api/profiles", { name: "Legado", course: "9-1" });
  const t = c.body.token;
  db.prepare("UPDATE profiles SET name = ? WHERE name = 'Legado'").run("L".repeat(40));   // como se guardó antes del límite de 25
  const r = await call("PATCH", "/api/profile", { course: "10-2" }, t);
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.body.profile.course, "10-2");
  assert.strictEqual(r.body.profile.name, "L".repeat(40));
  assert.strictEqual((await call("PATCH", "/api/profile", { durationKey: "2d" }, t)).status, 200);
  assert.strictEqual((await call("POST", "/api/profile/rename", { name: "x".repeat(26) }, t)).body.error, "name_too_long");
  assert.strictEqual((await call("DELETE", "/api/profile", null, t)).status, 200);
});

test("sin token válido no hay acceso", async () => {
  assert.strictEqual((await call("GET", "/api/profile")).status, 401);
  assert.strictEqual((await call("GET", "/api/profile", null, "a".repeat(43))).status, 401);
});

test("duración: expira = creación + duración, siempre desde la fecha original", async () => {
  const c = await call("POST", "/api/profiles", { name: "Luis", durationKey: "2d" });
  const t = c.body.token;
  assert.strictEqual(c.body.profile.expiresAt, "2026-11-13T08:30:00.000Z");
  now += 3600e3;                                   // pasa 1 h, entra a la página
  const g = await call("GET", "/api/profile", null, t);
  assert.strictEqual(g.body.profile.expiresAt, "2026-11-13T08:30:00.000Z");   // no se reinicia
  assert.strictEqual(g.body.profile.createdAt, "2026-11-11T08:30:00.000Z");
  const p = await call("PATCH", "/api/profile", { durationKey: "1d" }, t);
  assert.strictEqual(p.body.profile.expiresAt, "2026-11-12T08:30:00.000Z");
  const c2 = await call("PATCH", "/api/profile", { course: "10-1" }, t);
  assert.strictEqual(c2.body.profile.course, "10-1");
  assert.strictEqual(c2.body.profile.expiresAt, "2026-11-12T08:30:00.000Z");
  now += 2 * 3600e3;                               // 3 h desde la creación
  const x = await call("PATCH", "/api/profile", { durationKey: "1h" }, t);   // ya transcurrió → vencido y borrado
  assert.strictEqual(x.status, 410);
  assert.strictEqual((await call("GET", "/api/profile", null, t)).status, 401);
});

test("la fecha de creación es inalterable (trigger)", async () => {
  const c = await call("POST", "/api/profiles", { name: "Inalterable" });
  assert.throws(() => db.prepare("UPDATE profiles SET created_at = '2000-01-01T00:00:00.000Z'").run(), /inalterables/);
  await call("DELETE", "/api/profile", null, c.body.token);
});

test("actividades: idempotentes, sin avance no cuentan, y logros", async () => {
  const c = await call("POST", "/api/profiles", { name: "Marta" });
  const t = c.body.token;
  const a = await call("POST", "/api/activities", { opId: "same-op-1", tipo: "quiz", nota: 5, correctas: 5, incorrectas: 0, total: 5, tiempoSeg: null }, t);
  assert.deepStrictEqual(a.body.newAchievements.sort(), ["first_step", "good_start", "knowledge", "high_grade", "curious"].filter((k) => k !== "curious").sort());
  const dup = await call("POST", "/api/activities", { opId: "same-op-1", tipo: "quiz", nota: 5, correctas: 5, incorrectas: 0, total: 5 }, t);
  assert.strictEqual(dup.body.recorded, false); assert.strictEqual(dup.body.reason, "duplicate");
  const empty = await act(t, { correctas: 0, incorrectas: 0 });
  assert.strictEqual(empty.body.reason, "no_progress");
  assert.strictEqual((await call("POST", "/api/activities", { opId: "bad-op-xx1", tipo: "hack" }, t)).status, 400);
  const s = await call("GET", "/api/profile", null, t);
  assert.strictEqual(s.body.stats.totalActivities, 1);
  assert.strictEqual(s.body.stats.bestScore, 5);
  assert.strictEqual(s.body.stats.correctAnswers, 5);
  await call("DELETE", "/api/profile", null, t);
});

test("explorador, juegos, participación y política al borrar el historial", async () => {
  const c = await call("POST", "/api/profiles", { name: "Eva" });
  const t = c.body.token;
  const mech = ["tutela", "derecho-peticion", "referendo", "plebiscito", "consulta-popular", "cabildo-abierto", "iniciativa-popular", "revocatoria-mandato"];
  let last; for (const m of mech) last = await call("POST", "/api/visits", { mechanismId: m }, t);
  assert.deepStrictEqual(last.body.newAchievements, ["explorer"]);
  assert.strictEqual((await call("POST", "/api/visits", { mechanismId: "otro" }, t)).status, 400);
  for (const tipo of ["quiz", "crossword", "matching", "wordsearch", "situations", "memory", "roulette"]) {
    const body = tipo === "memory" ? { tipo, nota: null, correctas: 0, incorrectas: 0, total: 6, memoria: { parejas: 6, total: 6, intentos: 9, conceptos: [] } } : { tipo, nota: tipo === "crossword" ? null : 3 };
    last = await act(t, body);
  }
  const g = (await call("GET", "/api/profile", null, t)).body;
  const keys = g.achievements.filter((a) => a.unlocked).map((a) => a.key);
  for (const k of ["researcher", "participation", "consistency", "explorer"]) assert.ok(keys.includes(k), k);
  assert.strictEqual(g.stats.progress, 100);
  const h = await call("DELETE", "/api/profile/history", null, t);
  assert.strictEqual(h.body.stats.totalActivities, 0);
  const keys2 = h.body.achievements.filter((a) => a.unlocked).map((a) => a.key);
  assert.deepStrictEqual(keys2, ["explorer"]);
  assert.strictEqual(h.body.profile.name, "Eva");
});

test("cambiar el nombre crea un perfil nuevo y borra el anterior con todo lo asociado", async () => {
  const c = await call("POST", "/api/profiles", { name: "Pedro", course: "9-1" });
  const t = c.body.token;
  await act(t, {});
  now += 60e3;
  const r = await call("POST", "/api/profile/rename", { name: "Pedro Pérez" }, t);
  assert.strictEqual(r.body.profile.name, "Pedro Pérez");
  assert.strictEqual(r.body.profile.course, "9-1");
  assert.strictEqual(r.body.profile.createdAt, new Date(now).toISOString());
  assert.strictEqual((await call("GET", "/api/profile", null, t)).status, 401);   // token anterior ya no sirve
  const g = await call("GET", "/api/profile", null, r.body.token);
  assert.strictEqual(g.body.stats.totalActivities, 0);
  assert.strictEqual(g.body.achievements.filter((a) => a.unlocked).length, 0);
});

test("limpieza automática elimina perfiles vencidos y todo lo relacionado, sin huérfanos", async () => {
  const c = await call("POST", "/api/profiles", { name: "Temporal", durationKey: "1h" });
  await act(c.body.token, {});
  await call("POST", "/api/visits", { mechanismId: "tutela" }, c.body.token);
  const antes = count("profiles");
  now += 3600e3 + 1;
  assert.ok(svc.purgeExpired() >= 1);
  assert.ok(count("profiles") < antes);
  for (const t of ["profile_tokens", "activity_history", "profile_achievements", "mechanism_visits"])
    assert.strictEqual(db.prepare(`SELECT COUNT(*) n FROM ${t} WHERE profile_id NOT IN (SELECT id FROM profiles)`).get().n, 0, t);
  assert.strictEqual((await call("GET", "/api/profile", null, c.body.token)).status, 401);
});

test("eliminar todo borra perfil, tokens, historial y logros", async () => {
  const c = await call("POST", "/api/profiles", { name: "Borrar" });
  await act(c.body.token, {});
  assert.strictEqual((await call("DELETE", "/api/profile", null, c.body.token)).body.deleted, true);
  assert.strictEqual((await call("GET", "/api/profile", null, c.body.token)).status, 401);
});

test("no sirve la base de datos ni el código del servidor", async () => {
  for (const u of ["/server/server.js", "/server/storage/profiles.sqlite", "/package.json", "/.gitignore", "/pages/../server/server.js"]) {
    const r = await fetch(base + u); assert.strictEqual(r.status, 404, u);
  }
  assert.strictEqual((await fetch(base + "/")).status, 200);
  assert.strictEqual((await fetch(base + "/js/student.js")).status, 200);
});
