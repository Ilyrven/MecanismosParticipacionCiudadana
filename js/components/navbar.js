/**
 * js/components/navbar.js
 * Componente reutilizable de navegación. Se inyecta en cualquier
 * página que tenga un contenedor <div id="navbar-root" data-base="..."></div>
 * data-base indica la ruta relativa hacia la raíz del proyecto
 * ("" en index.html, "../" en páginas dentro de /pages).
 */

function renderNavbar() {
  const root = document.getElementById("navbar-root");
  if (!root) return;

  const t = (k) => (window.RCI18n ? window.RCI18n.tg(k) : k);   // la barra siempre sigue el idioma elegido (también en juegos y quiz)
  const base = root.dataset.base || "";
  const page = window.location.pathname.split("/").pop() || "index.html";

  root.innerHTML = `
    <nav class="navbar" aria-label="${t("nav.aria")}" data-i18n-attr="aria-label:nav.aria">
      <div class="navbar__inner">
        <a class="navbar__brand" href="${base}index.html">
          <img
            class="navbar__logo"
            src="${base}assets/logo/logo-colegio.png"
            alt="${t("brand.logoAlt")}" data-i18n-attr="alt:brand.logoAlt"
            onerror="this.replaceWith(Object.assign(document.createElement('div'), {className:'navbar__logo-placeholder', textContent:'JAA'}))"
          />
          <span class="navbar__school">
            José Antonio Aguilera
            <small data-i18n="brand.sub">${t("brand.sub")}</small>
          </span>
        </a>

        <button class="navbar__burger" aria-label="${t("nav.menu")}" data-i18n-attr="aria-label:nav.menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>

        <ul class="navbar__links">
          <li><a class="navbar__link" data-page="index.html" href="${base}index.html" data-i18n="nav.home">${t("nav.home")}</a></li>
          <li><a class="navbar__link" data-page="aprender.html" href="${base}pages/aprender.html" data-i18n="nav.learn">${t("nav.learn")}</a></li>
          <li><a class="navbar__link" data-page="quiz.html" href="${base}pages/quiz.html" data-i18n="nav.quiz">${t("nav.quiz")}</a></li>
          <li><a class="navbar__link" data-page="juegos.html|crucigrama.html|relacionar.html|sopa.html|situaciones.html|memoria.html|ruleta.html" href="${base}pages/juegos.html" data-i18n="nav.games">${t("nav.games")}</a></li>
        </ul>

        <div class="navbar__actions">
          <a class="settings-toggle" href="${base}pages/configuracion.html" data-page="configuracion.html" aria-label="${t("nav.settings")}" title="${t("nav.settings")}" data-i18n-attr="aria-label:nav.settings;title:nav.settings">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${svgIcon("settings")}</svg>
          </a>
          <button class="sound-toggle" type="button" aria-pressed="true" aria-label="${t("sound.onAria")}" title="${t("sound.on")}">
            <svg class="icon-sound-on" viewBox="0 0 24 24" fill="none" aria-hidden="true">${svgIcon("volume-on")}</svg>
            <svg class="icon-sound-off" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="display:none">${svgIcon("volume-x")}</svg>
          </button>
          <button class="theme-toggle" aria-label="${t("nav.themeToggle")}" data-i18n-attr="aria-label:nav.themeToggle" aria-pressed="false">
            <svg class="icon-moon" viewBox="0 0 24 24" fill="none">${svgIcon("moon")}</svg>
            <svg class="icon-sun" viewBox="0 0 24 24" fill="none">${svgIcon("sun")}</svg>
          </button>
        </div>
      </div>
    </nav>
  `;
}

renderNavbar();
