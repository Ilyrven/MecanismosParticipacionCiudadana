/**
 * server/src/app.js — API REST + archivos estáticos del frontend.
 * Solo se publican las carpetas del sitio (index.html, pages, css, js, data, assets):
 * ni server/ ni la base de datos son accesibles desde el navegador.
 */
const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const cfg = require("./config");
const { open } = require("./db");
const { createService, ApiError } = require("./profiles");
const { personalStats, listAchievements } = require("./stats");

function loadPepper(dbPath) {
  if (cfg.TOKEN_PEPPER) return cfg.TOKEN_PEPPER;
  if (dbPath === ":memory:") return crypto.randomBytes(32).toString("hex");
  const f = path.join(path.dirname(dbPath), ".pepper");
  try { return fs.readFileSync(f, "utf8").trim(); } catch (_) { /* primera ejecución */ }
  const p = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(f, p, { mode: 0o600 });
  return p;
}

/** Límite simple por IP en memoria (ventana fija). */
function rateLimit(max, windowMs) {
  const hits = new Map();
  setInterval(() => { const n = Date.now(); hits.forEach((v, k) => { if (v.reset <= n) hits.delete(k); }); }, windowMs).unref();
  return (req, res, next) => {
    const n = Date.now(); const k = req.ip;
    let h = hits.get(k);
    if (!h || h.reset <= n) { h = { count: 0, reset: n + windowMs }; hits.set(k, h); }
    if (++h.count > max) { res.set("Retry-After", String(Math.ceil((h.reset - n) / 1000))); return res.status(429).json({ error: "rate_limited" }); }
    next();
  };
}

function createApp({ dbPath = cfg.DB_PATH, clock = Date.now } = {}) {
  const db = open(dbPath);
  const svc = createService(db, { pepper: loadPepper(dbPath), clock });
  const app = express();
  app.disable("x-powered-by");
  if (cfg.TRUST_PROXY) app.set("trust proxy", /^\d+$/.test(cfg.TRUST_PROXY) ? Number(cfg.TRUST_PROXY) : cfg.TRUST_PROXY);

  app.use((req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Referrer-Policy": "no-referrer",
      // Las páginas solo pueden hablar con su propio servidor.
      "Content-Security-Policy": "connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'"
    });
    if (cfg.FORCE_HTTPS) {
      if (!req.secure) return res.redirect(308, "https://" + req.headers.host + req.originalUrl);
      res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  });

  // ---------- API ----------
  const api = express.Router();
  api.use((req, res, next) => {
    const o = req.headers.origin;
    if (o && cfg.CORS_ORIGIN.includes(o)) {
      res.set({ "Access-Control-Allow-Origin": o, "Vary": "Origin", "Access-Control-Allow-Headers": "Authorization, Content-Type", "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS" });
      if (req.method === "OPTIONS") return res.sendStatus(204);
    }
    res.set("Cache-Control", "no-store");
    next();
  });
  api.use(rateLimit(cfg.LIMITS.API_PER_MINUTE, 60 * 1000));
  api.use(express.json({ limit: cfg.LIMITS.BODY_BYTES, strict: true }));

  const wrap = (fn) => (req, res, next) => { try { fn(req, res); } catch (e) { next(e); } };
  const auth = (req, res, next) => {
    try {
      const m = /^Bearer (\S+)$/.exec(req.headers.authorization || "");
      const a = svc.authenticate(m && m[1]);
      req.profile = a.profile; req.now = a.now; next();
    } catch (e) { next(e); }
  };
  const snapshot = (p, now) => ({ profile: svc.publicProfile(p, now), stats: personalStats(db, p, now), achievements: listAchievements(db, p.id) });

  api.get("/health", (req, res) => res.json({ ok: true }));
  api.post("/profiles", rateLimit(cfg.LIMITS.CREATE_PER_10MIN, 10 * 60 * 1000), wrap((req, res) => res.status(201).json(svc.create(req.body || {}))));
  api.get("/profile", auth, wrap((req, res) => res.json(snapshot(req.profile, req.now))));
  api.patch("/profile", auth, wrap((req, res) => {
    const b = req.body || {};
    const r = svc.update(req.profile, { course: b.course, durationKey: b.durationKey });
    if (r.expired) return res.status(410).json({ error: "expired" });
    const p = svc.authenticate(req.headers.authorization.slice(7)).profile;
    res.json(snapshot(p, svc.clock()));
  }));
  api.post("/profile/rename", auth, wrap((req, res) => res.json(svc.rename(req.profile, (req.body || {}).name))));
  api.delete("/profile", auth, wrap((req, res) => { svc.deleteProfile(req.profile.id); res.json({ deleted: true }); }));
  api.delete("/profile/history", auth, wrap((req, res) => { svc.deleteHistory(req.profile); res.json(snapshot(req.profile, svc.clock())); }));
  api.get("/activities", auth, wrap((req, res) => res.json({ items: svc.listActivities(req.profile) })));
  api.post("/activities", auth, wrap((req, res) => res.status(201).json(svc.recordActivity(req.profile, req.body))));
  api.post("/visits", auth, wrap((req, res) => res.json(svc.recordVisit(req.profile, (req.body || {}).mechanismId))));
  api.use((req, res) => res.status(404).json({ error: "not_found" }));
  api.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    if (err instanceof ApiError) return res.status(err.status).json({ error: err.code });
    if (err && err.type === "entity.too.large") return res.status(413).json({ error: "too_large" });
    if (err && err.type === "entity.parse.failed") return res.status(400).json({ error: "bad_json" });
    console.error("[api]", err && err.message);
    res.status(500).json({ error: "server_error" });
  });
  app.use("/api", api);

  // ---------- Frontend estático (solo carpetas públicas) ----------
  const opts = { dotfiles: "ignore", index: false };
  ["pages", "css", "js", "data", "assets"].forEach((d) => app.use("/" + d, express.static(path.join(cfg.ROOT, d), opts)));
  app.get(["/", "/index.html"], (req, res) => res.sendFile(path.join(cfg.ROOT, "index.html")));
  app.use((req, res) => res.status(404).type("text").send("No encontrado"));

  return { app, db, svc };
}

module.exports = { createApp };
