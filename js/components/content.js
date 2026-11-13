/**
 * js/components/content.js
 * Contenido educativo en el idioma elegido (mecanismos, información general, glosario).
 *
 * Los datos originales (data/mecanismos/*.js, data/general/info-general.js) están en español.
 * Las traducciones viven en diccionarios estáticos data/i18n/content-<código>.js, registrados con
 * RCI18n.registerContent(). Aquí solo se SUPERPONE la traducción sobre el original: lo que falte
 * en un idioma se ve en español (nunca hay traducción automática en tiempo de ejecución).
 *   - Los objetos se mezclan por clave; las listas se mezclan POR POSICIÓN.
 *   - Juegos y quiz (meta rc-i18n = es-only) siempre reciben el original en español.
 */
const RCContent = (() => {
  function mezclar(base, trad) {
    if (trad == null) return base;
    if (Array.isArray(base)) {
      if (!Array.isArray(trad)) return base;
      return base.map((b, i) => (i < trad.length ? mezclar(b, trad[i]) : b));
    }
    if (base && typeof base === "object") {
      const o = Object.assign({}, base);
      Object.keys(trad || {}).forEach((k) => { if (k in base) o[k] = mezclar(base[k], trad[k]); });
      return o;
    }
    return typeof trad === typeof base ? trad : base;
  }
  /** Un mecanismo con sus textos traducidos (conserva id, icono y color). */
  const mec = (m) => (window.RCI18n ? mezclar(m, window.RCI18n.pieza("mecanismos", m.id)) : m);
  /** INFO_GENERAL traducido. */
  const general = () => (window.RCI18n && typeof INFO_GENERAL !== "undefined" ? mezclar(INFO_GENERAL, window.RCI18n.pieza("general")) : INFO_GENERAL);
  return { mec, general, mezclar };
})();
window.RCContent = RCContent;
