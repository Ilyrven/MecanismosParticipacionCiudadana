/**
 * server/src/config.js
 * Configuración del backend. Todo se puede cambiar con variables de entorno.
 */
const path = require("path");

const num = (v, d) => (Number.isFinite(Number(v)) && v !== undefined && v !== "" ? Number(v) : d);

/** Duraciones de conservación permitidas (clave → segundos). NO agregar otras. */
const DURATIONS = Object.freeze({
  "1h": 1 * 3600,
  "2h": 2 * 3600,
  "5h": 5 * 3600,
  "10h": 10 * 3600,
  "12h": 12 * 3600,
  "1d": 1 * 86400,
  "2d": 2 * 86400,
  "3d": 3 * 86400,
  "4d": 4 * 86400,
  "5d": 5 * 86400
});
const DEFAULT_DURATION = "5d";

const ROOT = path.resolve(__dirname, "..", "..");

module.exports = {
  ROOT,
  DURATIONS,
  DEFAULT_DURATION,
  PORT: num(process.env.PORT, 3000),
  HOST: process.env.HOST || "0.0.0.0",
  DB_PATH: process.env.DB_PATH || path.join(ROOT, "server", "storage", "profiles.sqlite"),
  /** Cada cuánto se buscan perfiles vencidos aunque nadie use la página (ms). */
  CLEANUP_INTERVAL_MS: num(process.env.CLEANUP_INTERVAL_MS, 60 * 1000),
  /** Producción: HTTPS obligatorio (directo con TLS_KEY/TLS_CERT o detrás de un proxy con TRUST_PROXY=1). */
  FORCE_HTTPS: process.env.FORCE_HTTPS === "1" || (process.env.NODE_ENV === "production" && process.env.FORCE_HTTPS !== "0"),
  TLS_KEY: process.env.TLS_KEY || "",
  TLS_CERT: process.env.TLS_CERT || "",
  TRUST_PROXY: process.env.TRUST_PROXY || "",
  /** Orígenes (separados por coma) autorizados a llamar a la API desde otro dominio. Vacío = solo el mismo origen. */
  CORS_ORIGIN: (process.env.CORS_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean),
  /** Secreto para proteger los tokens guardados (HMAC). Si falta, se genera y se guarda junto a la base de datos. */
  TOKEN_PEPPER: process.env.TOKEN_PEPPER || "",
  LIMITS: {
    NAME_MIN: 3,
    NAME_MAX: 25,
    COURSE_MAX: 20,
    DETAIL_ITEMS: 60,
    TEXT_MAX: 700,
    BODY_BYTES: "256kb",
    API_PER_MINUTE: num(process.env.RATE_API, 600),
    CREATE_PER_10MIN: num(process.env.RATE_CREATE, 120)
  }
};
