/**
 * js/i18n/i18n.js
 * Sistema central de idiomas (preferencia permanente, localStorage «rc-lang»).
 *
 *  - Un archivo por idioma en js/i18n/lang/<código>.js que llama a
 *    RCI18n.register("<código>", { "clave.con.puntos": "Texto" }).
 *  - Cada texto tiene UN identificador; el español es la lengua base y
 *    se usa como respaldo si falta una clave en otro idioma.
 *  - En HTML:  data-i18n="clave"   (texto)
 *              data-i18n-attr="aria-label:clave;title:clave2"  (atributos)
 *  - En JS:    RCI18n.t("clave", { n: 3 })   → reemplaza {n}
 *  - Cambiar de idioma NO toca el historial ni la sesión: solo repinta textos
 *    y emite el evento «rc:langchange» para que cada pantalla se repinte.
 *  - EXCEPCIÓN: las páginas de juegos y quiz declaran
 *      <meta name="rc-i18n" content="es-only">
 *    y TODO su texto (preguntas, botones, mensajes) permanece en español.
 *    Solo la barra de navegación (#navbar-root) sigue el idioma elegido.
 *  - Contenido educativo (mecanismos, información general, glosario): diccionarios
 *    en data/i18n/content-<código>.js, registrados con RCI18n.registerContent().
 *    No hay traducción automática en tiempo de ejecución.
 *
 * Para agregar un idioma: crear js/i18n/lang/xx.js, añadirlo a LANGS y a las
 * etiquetas <script> de las páginas.
 */
const RCI18n = (() => {
  const KEY = "rc-lang";
  const BASE = "es";
  /** Nombre en su propio idioma y bandera (SVG: los emoji de banderas no se ven en Windows). */
  const LANGS = [
    { code: "es", name: "Español", region: "Colombia", locale: "es-CO" },
    { code: "en", name: "English", region: "United States", locale: "en-US" },
    { code: "ru", name: "Русский", region: "Россия", locale: "ru-RU" },
    { code: "pt", name: "Português", region: "Brasil", locale: "pt-BR" },
    { code: "fr", name: "Français", region: "France", locale: "fr-FR" }
  ];
  const dict = {};
  const contenido = {};   // contenido educativo traducido: contenido[código] = { mecanismos:{id:{…}}, general:{…} }
  const oyentes = new Set();
  /** Las páginas de juegos y quiz se quedan en español (ver cabecera). */
  const LOCK = !!document.querySelector('meta[name="rc-i18n"][content="es-only"]');
  const enGeneral = (n) => !LOCK || !!(n.closest && n.closest("#navbar-root, [data-i18n-scope=\"general\"]"));
  const leer = () => { try { return localStorage.getItem(KEY); } catch (_) { return null; } };
  // El idioma guardado se conoce desde el principio: el navbar se pinta ya en ese idioma.
  let lang = LANGS.some((l) => l.code === leer()) ? leer() : BASE;

  function register(code, entries) { dict[code] = Object.assign(dict[code] || {}, entries); }
  function registerContent(code, obj) { contenido[code] = Object.assign(contenido[code] || {}, obj); }
  const byCode = (c) => LANGS.find((l) => l.code === c);

  function buscar(l, key, params) {
    let s = (dict[l] && dict[l][key]);
    if (s == null) s = dict[BASE] && dict[BASE][key];
    if (s == null) return key;
    if (params) s = s.replace(/\{(\w+)\}/g, (m, k) => (params[k] != null ? params[k] : m));
    return s;
  }
  /** Texto de la interfaz de la PÁGINA: en juegos y quiz siempre es español. */
  const t = (key, params) => buscar(LOCK ? BASE : lang, key, params);
  /** Texto de la interfaz GENERAL (navegación, avisos globales): sigue el idioma elegido en toda página. */
  const tg = (key, params) => buscar(lang, key, params);
  /** Contenido educativo traducido: pieza("mecanismos", "tutela") → objeto o null (si es español o no hay traducción). */
  function pieza(grupo, id) {
    const l = LOCK ? BASE : lang;
    const c = contenido[l];
    return (c && c[grupo] && (id == null ? c[grupo] : c[grupo][id])) || null;
  }

  function apply(root) {
    const r = root || document;
    const tx = (n, k, p) => (enGeneral(n) ? tg(k, p) : t(k, p));
    r.querySelectorAll("[data-i18n]").forEach((n) => { n.textContent = tx(n, n.getAttribute("data-i18n")); });
    r.querySelectorAll("[data-i18n-html]").forEach((n) => { n.innerHTML = tx(n, n.getAttribute("data-i18n-html")); });   // solo textos del diccionario (con <b>, <br>)
    r.querySelectorAll("[data-i18n-attr]").forEach((n) => {
      n.getAttribute("data-i18n-attr").split(";").forEach((par) => {
        const i = par.indexOf(":");
        if (i > 0) n.setAttribute(par.slice(0, i).trim(), tx(n, par.slice(i + 1).trim()));
      });
    });
    const title = document.querySelector("title[data-i18n]");
    if (title) document.title = t(title.getAttribute("data-i18n"));
    const meta = document.querySelector('meta[name="description"][data-i18n-content]');
    if (meta) meta.setAttribute("content", t(meta.getAttribute("data-i18n-content")));
    const nav = document.getElementById("navbar-root");
    if (nav) nav.setAttribute("lang", lang);
  }

  function set(code) {
    if (!byCode(code)) return false;
    lang = code;
    try { localStorage.setItem(KEY, code); } catch (_) { /* queda solo en esta página */ }
    document.documentElement.setAttribute("lang", LOCK ? BASE : code);
    apply();
    oyentes.forEach((fn) => { try { fn(code); } catch (_) { /* un oyente roto no afecta a los demás */ } });
    document.dispatchEvent(new CustomEvent("rc:langchange", { detail: { lang: code } }));
    return true;
  }

  const onChange = (fn) => { oyentes.add(fn); return () => oyentes.delete(fn); };

  // ---------- banderas (SVG simples y reconocibles) ----------
  const FLAGS = {
    es: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#FCD116"/><rect y="10" width="30" height="5" fill="#003893"/><rect y="15" width="30" height="5" fill="#CE1126"/></svg>',
    en: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/>' +
      [0, 2, 4, 6, 8, 10, 12].map((i) => `<rect y="${(i * 20 / 13).toFixed(2)}" width="30" height="${(20 / 13).toFixed(2)}" fill="#B22234"/>`).join("") +
      '<rect width="13" height="10.77" fill="#3C3B6E"/>' +
      [0, 1, 2, 3].flatMap((r) => [0, 1, 2, 3, 4].map((c) => `<circle cx="${(1.6 + c * 2.5 + (r % 2) * 1.2).toFixed(1)}" cy="${(1.5 + r * 2.4).toFixed(1)}" r="0.55" fill="#fff"/>`)).join("") + "</svg>",
    ru: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><rect y="6.67" width="30" height="6.67" fill="#0039A6"/><rect y="13.33" width="30" height="6.67" fill="#D52B1E"/></svg>',
    pt: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#009C3B"/><path d="M15 2.2 27.2 10 15 17.8 2.8 10Z" fill="#FFDF00"/><circle cx="15" cy="10" r="4.4" fill="#002776"/><path d="M10.7 9.2c3-.9 6.2-.5 8.6 1.3" stroke="#fff" stroke-width=".7" fill="none"/></svg>',
    fr: '<svg viewBox="0 0 30 20"><rect width="10" height="20" fill="#0055A4"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#EF4135"/></svg>'
  };
  function flag(code, cls) {
    const span = document.createElement("span");
    span.className = "flag" + (cls ? " " + cls : "");
    span.setAttribute("role", "img");
    span.setAttribute("aria-label", (byCode(code) || {}).name || code);
    span.innerHTML = FLAGS[code] || "";   // SVG fijo definido arriba (no proviene de datos externos)
    return span;
  }

  function init() {
    document.documentElement.setAttribute("lang", LOCK ? BASE : lang);
    apply();
  }

  return { LANGS, register, registerContent, t, tg, pieza, apply, set, get: () => lang, locked: () => LOCK, onChange, flag, byCode, init };
})();

window.RCI18n = RCI18n;
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => RCI18n.init());
else RCI18n.init();
window.t = (k, p) => RCI18n.t(k, p);
