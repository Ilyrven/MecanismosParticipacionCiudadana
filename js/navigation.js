/**
 * js/navigation.js
 * Resalta el enlace activo del navbar y controla el menú hamburguesa.
 */

const RCNavigation = (() => {
  function markActiveLink() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".navbar__link, .settings-toggle").forEach((link) => {
      const target = link.getAttribute("data-page") || "";
      const paginas = target.split("|");
      const act = paginas.includes(path);
      link.classList.toggle("is-active", act);
      if (act) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
    });
  }

  function initBurger() {
    const burger = document.querySelector(".navbar__burger");
    const links = document.querySelector(".navbar__links");
    if (!burger || !links) return;

    burger.addEventListener("click", () => {
      const isOpen = links.classList.toggle("is-open");
      burger.classList.toggle("is-open", isOpen);
      burger.setAttribute("aria-expanded", String(isOpen));
    });

    links.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        links.classList.remove("is-open");
        burger.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  function init() {
    markActiveLink();
    initBurger();
  }

  return { init };
})();

RCNavigation.init();
