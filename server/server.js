/**
 * server/server.js — Arranque. `npm start` (http://localhost:3000).
 * Producción: ver README (HTTPS obligatorio, TLS_KEY/TLS_CERT o proxy con TRUST_PROXY=1).
 */
const fs = require("fs");
const http = require("http");
const https = require("https");
const cfg = require("./src/config");
const { createApp } = require("./src/app");

const { app, db, svc } = createApp();

// Limpieza al iniciar y después cada minuto, aunque nadie esté usando la página.
const limpiar = () => { try { const n = svc.purgeExpired(); if (n) console.log(`[limpieza] ${n} perfil(es) vencido(s) eliminado(s) con todos sus datos`); } catch (e) { console.error("[limpieza]", e.message); } };
limpiar();
const timer = setInterval(limpiar, cfg.CLEANUP_INTERVAL_MS);
timer.unref();

let server;
if (cfg.TLS_KEY && cfg.TLS_CERT) {
  server = https.createServer({ key: fs.readFileSync(cfg.TLS_KEY), cert: fs.readFileSync(cfg.TLS_CERT) }, app);
} else {
  if (cfg.FORCE_HTTPS && !cfg.TRUST_PROXY) console.warn("[aviso] FORCE_HTTPS activo sin TLS_KEY/TLS_CERT ni TRUST_PROXY: las peticiones http serán redirigidas a https.");
  server = http.createServer(app);
}
server.listen(cfg.PORT, cfg.HOST, () => console.log(`Servidor en ${cfg.TLS_KEY ? "https" : "http"}://localhost:${cfg.PORT}`));

const cerrar = () => { clearInterval(timer); server.close(() => { db.close(); process.exit(0); }); };
process.on("SIGINT", cerrar); process.on("SIGTERM", cerrar);
