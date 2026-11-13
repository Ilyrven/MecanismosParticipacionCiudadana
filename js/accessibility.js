/**
 * js/accessibility.js
 * Preferencias de accesibilidad (permanentes, localStorage «rc-a11y»). Se carga en el <head>
 * de cada página para aplicarlas antes de pintar (sin parpadeos).
 *
 *  - size:     small | normal | large | xlarge  → <html data-fs>  (escala todo el texto con rem)
 *  - contrast: true/false                        → <html data-contrast="high"> (funciona con todos los temas)
 *  - motion:   true = reducir animaciones        → <html data-motion="reduce">
 *              Además SIEMPRE se respeta prefers-reduced-motion del sistema operativo.
 *  - El sonido NO se guarda aquí: usa el sistema global RCSound (js/sound.js).
 *
 * API (window.RCA11y): get(), set(parcial), SIZES, systemReducesMotion(), reduceMotion(), onChange(fn)
 */
const RCA11y = (() => {
  const KEY = "rc-a11y";
  const SIZES = ["small", "normal", "large", "xlarge"];
  const DEFAULTS = { size: "normal", contrast: false, motion: false };
  const oyentes = new Set();
  const mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  function leer() {
    try {
      const o = JSON.parse(localStorage.getItem(KEY) || "{}");
      return {
        size: SIZES.includes(o.size) ? o.size : DEFAULTS.size,
        contrast: o.contrast === true,
        motion: o.motion === true
      };
    } catch (_) { return Object.assign({}, DEFAULTS); }
  }
  let actual = leer();
  const systemReducesMotion = () => !!(mq && mq.matches);
  const reduceMotion = () => actual.motion || systemReducesMotion();

  function aplicar() {
    const r = document.documentElement;
    r.setAttribute("data-fs", actual.size);
    if (actual.contrast) r.setAttribute("data-contrast", "high"); else r.removeAttribute("data-contrast");
    if (reduceMotion()) r.setAttribute("data-motion", "reduce"); else r.removeAttribute("data-motion");
  }

  function set(parcial) {
    const n = Object.assign({}, actual, parcial || {});
    if (!SIZES.includes(n.size)) n.size = DEFAULTS.size;
    n.contrast = n.contrast === true; n.motion = n.motion === true;
    actual = n;
    try { localStorage.setItem(KEY, JSON.stringify(actual)); } catch (_) { /* solo vale en esta página */ }
    aplicar();
    oyentes.forEach((fn) => { try { fn(Object.assign({}, actual)); } catch (_) { /* un oyente roto no afecta a los demás */ } });
    document.dispatchEvent(new CustomEvent("rc:a11ychange", { detail: Object.assign({}, actual) }));
  }

  if (mq) (mq.addEventListener ? mq.addEventListener("change", aplicar) : mq.addListener && mq.addListener(aplicar));
  aplicar();

  /** Enlace «Saltar al contenido» para teclado y lectores de pantalla. */
  function saltar() {
    if (document.querySelector(".skip-link")) return;
    const destino = document.querySelector("main") || document.querySelector(".cfg-shell, header, section");
    if (!destino) return;
    if (!destino.id) destino.id = "rc-main";
    destino.setAttribute("tabindex", "-1");
    const a = document.createElement("a");
    a.className = "skip-link";
    a.href = "#" + destino.id;
    a.setAttribute("data-i18n", "a11y.skip");
    a.setAttribute("data-i18n-scope", "general");
    a.textContent = window.RCI18n ? RCI18n.tg("a11y.skip") : "Saltar al contenido";
    a.addEventListener("click", (e) => { e.preventDefault(); destino.focus({ preventScroll: false }); destino.scrollIntoView(); });
    document.body.insertBefore(a, document.body.firstChild);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", saltar); else saltar();

  return { get: () => Object.assign({}, actual), set, SIZES, systemReducesMotion, reduceMotion, onChange: (fn) => { oyentes.add(fn); return () => oyentes.delete(fn); } };
})();
window.RCA11y = RCA11y;
