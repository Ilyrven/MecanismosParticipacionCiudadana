/**
 * js/config.js — Dirección del backend (API).
 *
 *  - Local (`npm start`, http://localhost:3000): "" = el mismo servidor que entrega la página.
 *    Se detecta solo (localhost, 127.x o archivo local): no hay que tocar nada.
 *  - Producción con el frontend en Netlify y el backend en otro servicio Node.js:
 *    escribe aquí la URL pública del backend, con HTTPS y sin «/» final, p. ej.
 *    "https://api.midominio.edu.co", y autoriza el origen de Netlify en el backend
 *    con la variable CORS_ORIGIN (p. ej. "https://mi-sitio.netlify.app").
 *  - También se puede definir window.RC_API_BASE ANTES de cargar este archivo (tiene prioridad).
 *
 * Si la dirección queda vacía en producción, las páginas siguen funcionando, pero no se
 * podrán crear perfiles (el alumno puede elegir «Continuar sin guardar»).
 */
(function () {
  var PRODUCCION = "";   // ← URL pública del backend (futuro despliegue)
  var h = location.hostname;
  var local = location.protocol === "file:" || h === "localhost" || h === "[::1]" || /^127\./.test(h);
  var base = window.RC_API_BASE || (local ? "" : PRODUCCION);
  window.RC_API_BASE = String(base).replace(/\/+$/, "");
})();
