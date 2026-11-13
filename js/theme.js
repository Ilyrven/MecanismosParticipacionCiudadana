/**
 * js/theme.js
 * Temas de la plataforma (7) y su persistencia en localStorage (preferencia
 * permanente). Mantiene el botón rápido claro/oscuro de la barra de navegación.
 *
 *  - data-theme = id del tema (light, dark, violet, blue, green, graphite, beige)
 *    → define las variables de color en css/variables.css.
 *  - data-tone  = "light" | "dark" → ajustes finos por tono (themes.css, navbar.css…).
 *  - El tema NO se borra al cambiar de alumno ni al cerrar sesión.
 *
 * API (window.RCTheme): THEMES, get(), apply(id), preview(id), cancelPreview(),
 *   isPreviewing(), toggle(), init()
 */
const RCTheme = (() => {
  const STORAGE_KEY = "rc-theme";
  const LAST_LIGHT = "rc-theme-last-light";
  const LAST_DARK = "rc-theme-last-dark";

  /** Los nombres y descripciones visibles viven en i18n (theme.<id>.name / .desc). */
  const THEMES = [
    { id: "light", tone: "light" },
    { id: "dark", tone: "dark" },
    { id: "violet", tone: "dark" },
    { id: "blue", tone: "dark" },
    { id: "green", tone: "light" },
    { id: "graphite", tone: "dark" },
    { id: "beige", tone: "light" }
  ];
  const byId = (id) => THEMES.find((t) => t.id === id);
  let previewing = false;
  let committed = "light";

  const read = (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, v); } catch (_) { /* sin almacenamiento: solo esta página */ } };

  function getPreferred() {
    const saved = read(STORAGE_KEY);
    if (byId(saved)) return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function paint(id) {
    const t = byId(id) || byId("light");
    const root = document.documentElement;
    root.setAttribute("data-theme", t.id);
    root.setAttribute("data-tone", t.tone);
    document.querySelectorAll(".theme-toggle").forEach((btn) => btn.setAttribute("aria-pressed", String(t.tone === "dark")));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", getComputedStyle(root).getPropertyValue("--bg").trim() || "#ffffff");
    return t;
  }

  function apply(id) {
    const t = paint(id);
    previewing = false;
    committed = t.id;
    write(STORAGE_KEY, t.id);
    write(t.tone === "dark" ? LAST_DARK : LAST_LIGHT, t.id);
    document.dispatchEvent(new CustomEvent("rc:themechange", { detail: { id: t.id, tone: t.tone, preview: false } }));
  }

  /** Vista previa: se ve en toda la página pero no se guarda. */
  function preview(id) {
    const t = paint(id);
    previewing = t.id !== committed;
    document.dispatchEvent(new CustomEvent("rc:themechange", { detail: { id: t.id, tone: t.tone, preview: previewing } }));
  }
  function cancelPreview() {
    paint(committed);
    previewing = false;
    document.dispatchEvent(new CustomEvent("rc:themechange", { detail: { id: committed, tone: byId(committed).tone, preview: false } }));
  }

  /** Botón rápido: alterna entre el tono claro y el oscuro recordando el último tema de cada tono. */
  function toggle() {
    const cur = byId(committed) || byId("light");
    const next = cur.tone === "dark" ? (byId(read(LAST_LIGHT)) ? read(LAST_LIGHT) : "light") : (byId(read(LAST_DARK)) ? read(LAST_DARK) : "dark");
    apply(next);
  }

  function init() {
    committed = getPreferred();
    paint(committed);
    document.querySelectorAll(".theme-toggle").forEach((btn) => btn.addEventListener("click", toggle));
  }

  return { THEMES, get: () => committed, apply, preview, cancelPreview, isPreviewing: () => previewing, toggle, init };
})();

window.RCTheme = RCTheme;
RCTheme.init();
