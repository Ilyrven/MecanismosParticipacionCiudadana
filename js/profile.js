/**
 * js/profile.js — Perfil temporal del estudiante (cliente del backend SQL).
 *
 *  - NO hay contraseñas ni correo. Al crear el perfil el servidor entrega un token aleatorio;
 *    aquí solo se guarda en localStorage («rc-profile») y viaja en la cabecera Authorization.
 *    Nunca va en la URL ni se muestra. Sin huellas digitales del dispositivo.
 *  - Cerrar sesión solo desactiva la sesión («active»=false): la referencia local queda para poder
 *    recuperar el perfil desde ESTE navegador. En otro navegador/dispositivo es un perfil nuevo.
 *  - Las fechas las pone el servidor (UTC). Aquí solo se muestran en la zona horaria local y se
 *    corrige el reloj del dispositivo con la diferencia respecto al servidor (offset).
 *  - Los datos (historial, estadísticas, logros) viven en SQL; el navegador guarda solo la referencia
 *    y una copia mínima (nombre, curso, fechas) para poder leer la identidad de forma síncrona.
 *
 * API (window.RCProfile): active(), current(), recoverable(), create(), resume(), logout(), refresh(),
 *   setCourse(), setDuration(), rename(), deleteHistory(), deleteAll(), recordActivity(), visit(),
 *   activities(), snapshot(), remainingMs(), onChange(fn), DURATIONS, ACH_ICONS
 */
const RCProfile = (() => {
  const KEY = "rc-profile";
  const DURATIONS = ["1h", "2h", "5h", "10h", "12h", "1d", "2d", "3d", "4d", "5d"];
  const DEFAULT_DURATION = "5d";
  const ACH_ICONS = { first_step: "👣", explorer: "🧭", good_start: "📝", consistency: "🔁", dedication: "🏅", knowledge: "🎓", researcher: "🔎", participation: "🗳️", curious: "🎯", high_grade: "⭐", study_time: "⏱️" };
  const oyentes = new Set();
  let ref = leer();             // { token, nombre, curso, createdAt, expiresAt, durationKey, offset, active }
  let snap = null;              // última respuesta completa del servidor { profile, stats, achievements }
  const tg = (k, p) => (window.RCI18n ? window.RCI18n.tg(k, p) : k);

  function leer() {
    try {
      const o = JSON.parse(localStorage.getItem(KEY) || "null");
      if (o && typeof o.token === "string" && /^[\w-]{43}$/.test(o.token) && typeof o.nombre === "string") return o;
    } catch (_) { /* dato dañado: se ignora */ }
    return null;
  }
  function guardar() {
    try { if (ref) localStorage.setItem(KEY, JSON.stringify(ref)); else localStorage.removeItem(KEY); } catch (_) { /* queda en memoria */ }
  }
  function avisar(motivo) {
    oyentes.forEach((fn) => { try { fn(current(), motivo); } catch (_) { /* un oyente roto no afecta a los demás */ } });
    document.dispatchEvent(new CustomEvent("rc:profilechange", { detail: { motivo: motivo || "change" } }));
  }

  // ------------------------------------------------------------------ red
  async function req(method, path, body, token) {
    const headers = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const t = token === undefined ? (ref && ref.token) : token;
    if (t) headers.Authorization = "Bearer " + t;
    let res;
    try {
      res = await fetch((window.RC_API_BASE || "") + "/api" + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), credentials: "omit", cache: "no-store" });
    } catch (_) { const e = new Error("offline"); e.offline = true; throw e; }
    let data = {};
    try { data = await res.json(); } catch (_) { /* respuesta sin cuerpo */ }
    // Una respuesta que no es de la API (404/HTML del hosting estático, página de error de un proxy…)
    // significa que no hay backend disponible: se trata como «sin conexión» para ofrecer el modo invitado.
    const esApi = (res.headers.get("content-type") || "").indexOf("json") !== -1 && data && (res.ok || typeof data.error === "string");
    if (!esApi) { const e = new Error("offline"); e.offline = true; throw e; }
    if (!res.ok) { const e = new Error(data.error || "error"); e.status = res.status; e.code = data.error || "server_error"; throw e; }
    return data;
  }

  const offsetDe = (p) => Date.parse(p.serverNow) - Date.now();
  function aplicarPerfil(p, token, active) {
    ref = { token: token || ref.token, nombre: p.name, curso: p.course, createdAt: p.createdAt, expiresAt: p.expiresAt, durationKey: p.durationKey, offset: offsetDe(p), active: active == null ? (ref ? ref.active : true) : active };
    guardar();
  }
  function aplicarSnap(s) { snap = s; aplicarPerfil(s.profile); }
  function olvidar(motivo) { ref = null; snap = null; guardar(); avisar(motivo); }

  /** Si el servidor dice que el perfil ya no existe o venció, se borra la referencia local. */
  function manejarError(e) {
    if (e && (e.status === 401 || e.status === 410)) {
      const vencido = e.code === "expired" || e.status === 410;
      olvidar(vencido ? "expired" : "invalid");
      if (vencido) avisoGlobal(tg("profile.expiredToast"));
    }
    throw e;
  }
  const llamar = (m, p, b) => req(m, p, b).catch(manejarError);

  // ------------------------------------------------------------------ estado
  /** Hora actual corregida con la diferencia respecto al servidor. */
  const now = () => Date.now() + (ref && ref.offset ? ref.offset : 0);
  const remainingMs = () => (ref ? Date.parse(ref.expiresAt) - (Date.now() + (ref.offset || 0)) : 0);
  function vencidoLocal() { if (ref && remainingMs() <= 0) { olvidar("expired"); avisoGlobal(tg("profile.expiredToast")); return true; } return false; }

  const active = () => !!(ref && ref.active && !vencidoLocal());
  const current = () => (active() ? { nombre: ref.nombre, curso: ref.curso || "", createdAt: ref.createdAt, expiresAt: ref.expiresAt, durationKey: ref.durationKey } : null);
  /** Perfil guardado en este navegador con la sesión cerrada (se puede recuperar). */
  const recoverable = () => (ref && !ref.active && !vencidoLocal() ? { nombre: ref.nombre, curso: ref.curso || "", expiresAt: ref.expiresAt } : null);
  const snapshot = () => snap;

  // ------------------------------------------------------------------ operaciones
  async function create({ nombre, curso }) {
    const d = await req("POST", "/profiles", { name: nombre, course: curso || "", durationKey: DEFAULT_DURATION }, null);
    ref = null; snap = null;
    aplicarPerfil(d.profile, d.token, true);
    avisar("created");
    return current();
  }
  /** Reactiva el perfil guardado en este navegador (tras cerrar sesión). */
  async function resume() {
    if (!ref) throw new Error("none");
    const s = await llamar("GET", "/profile");
    ref.active = true; aplicarSnap(s); ref.active = true; guardar();
    avisar("resumed");
    return current();
  }
  function logout() {
    if (!ref) return;
    ref.active = false; snap = null; guardar();   // la referencia se conserva para poder volver
    avisar("logout");
  }
  async function refresh() {
    if (!ref) return null;
    const s = await llamar("GET", "/profile");
    aplicarSnap(s); avisar("refreshed");
    return s;
  }
  async function setCourse(curso) { const s = await llamar("PATCH", "/profile", { course: curso || "" }); aplicarSnap(s); avisar("course"); return s; }
  async function setDuration(key) {
    const s = await llamar("PATCH", "/profile", { durationKey: key });
    aplicarSnap(s); avisar("duration"); return s;
  }
  async function rename(nombre) {
    const d = await llamar("POST", "/profile/rename", { name: nombre });
    snap = null; aplicarPerfil(d.profile, d.token, true);
    avisar("renamed");
    return current();
  }
  async function deleteHistory() { const s = await llamar("DELETE", "/profile/history"); aplicarSnap(s); avisar("history"); return s; }
  async function deleteAll() { await llamar("DELETE", "/profile"); olvidar("deleted"); }
  async function activities() { return (await llamar("GET", "/activities")).items; }

  const nuevoId = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 12));

  /** Registra una actividad terminada. Mismo opId en cada reintento: el servidor no la duplica. */
  function recordActivity(r) {
    if (!active()) return false;
    const body = Object.assign({}, r, { opId: nuevoId() });
    const enviar = (n) => req("POST", "/activities", body).then((d) => {
      if (d.newAchievements && d.newAchievements.length) notificarLogros(d.newAchievements);
      snap = null; avisar("activity");
    }).catch((e) => {
      if (e.offline && n < 3) { setTimeout(() => enviar(n + 1), 2000 * (n + 1)); return; }
      if (e.status === 401 || e.status === 410) { try { manejarError(e); } catch (_) { /* ya avisado */ } return; }
      avisoGlobal(tg("profile.saveFailed"));
    });
    enviar(0);
    return true;
  }
  /** El estudiante abrió un mecanismo (para el logro «Explorador»). Solo con perfil activo. */
  function visit(mechanismId) {
    if (!active()) return;
    req("POST", "/visits", { mechanismId }).then((d) => { if (d.newAchievements && d.newAchievements.length) notificarLogros(d.newAchievements); snap = null; })
      .catch((e) => { if (e.status === 401 || e.status === 410) { try { manejarError(e); } catch (_) { /* ya avisado */ } } });
  }

  // ------------------------------------------------------------------ avisos discretos
  function zonaAvisos() {
    let z = document.getElementById("rc-toasts");
    if (!z) {
      z = document.createElement("div");
      z.id = "rc-toasts"; z.className = "rc-toasts"; z.setAttribute("role", "status"); z.setAttribute("aria-live", "polite"); z.setAttribute("data-i18n-scope", "general");
      document.body.appendChild(z);
    }
    return z;
  }
  function avisoGlobal(texto, icono) {
    if (!document.body) return;
    const n = document.createElement("div");
    n.className = "rc-toast";
    if (icono) { const i = document.createElement("span"); i.className = "rc-toast__icon"; i.setAttribute("aria-hidden", "true"); i.textContent = icono; n.appendChild(i); }
    const s = document.createElement("span"); s.textContent = texto; n.appendChild(s);
    zonaAvisos().appendChild(n);
    setTimeout(() => { n.classList.add("is-out"); setTimeout(() => n.remove(), 400); }, 5200);
  }
  function notificarLogros(keys) {
    // En juegos y quiz el aviso sale en español (igual que el resto de la página); en las demás, en el idioma elegido.
    const T = (k, p) => (window.RCI18n ? window.RCI18n.t(k, p) : k);
    keys.forEach((k, i) => setTimeout(() => {
      avisoGlobal(T("ach.unlocked", { x: T("ach." + k + ".name") }), ACH_ICONS[k] || "🏆");
      if (window.RCSound) { try { RCSound.play("complete"); } catch (_) { /* sin audio */ } }
    }, i * 900));
  }

  // ------------------------------------------------------------------ arranque
  function init() {
    if (ref && ref.active) {
      // Valida en segundo plano: si venció o se borró en el servidor, se limpia la referencia.
      refresh().catch(() => { /* sin conexión: se sigue con la copia local hasta poder validar */ });
    }
    setInterval(vencidoLocal, 15000);
    window.addEventListener("storage", (e) => { if (e.key === KEY) { ref = leer(); snap = null; avisar("storage"); } });   // otra pestaña del mismo navegador
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();

  return { DURATIONS, DEFAULT_DURATION, ACH_ICONS, active, current, recoverable, snapshot, create, resume, logout, refresh, setCourse, setDuration, rename, deleteHistory, deleteAll, activities, recordActivity, visit, remainingMs, now, aviso: avisoGlobal, onChange: (fn) => { oyentes.add(fn); return () => oyentes.delete(fn); } };
})();
window.RCProfile = RCProfile;
