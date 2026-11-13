/**
 * js/modal.js
 * Controla el modal que muestra la información detallada de un mecanismo.
 * El HTML del modal se genera dinámicamente a partir de los datos —
 * nunca se escribe información de mecanismos directamente aquí.
 */

const RCModal = (() => {
  let overlay = null;
  let lastFocused = null;

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "rc-modal-title");
    overlay.innerHTML = `<div class="modal" role="document"></div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", (e) => {
      if (!overlay.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "Tab") {   // el foco no sale del modal (teclado y lectores de pantalla)
        const f = Array.from(overlay.querySelectorAll("button, a[href], [tabindex]:not([tabindex='-1'])")).filter((n) => !n.disabled && n.offsetParent !== null);
        if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && (i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
      }
    });
    return overlay;
  }

  function listItems(items) {
    return items.map((item) => `<li>${item}</li>`).join("");
  }

  const Tm = (k, p) => (window.RCI18n ? window.RCI18n.t(k, p) : k);
  let actual = null;   // mecanismo abierto (original), para repintarlo al cambiar de idioma

  function buildContent(original) {
    const mecanismo = RCContent.mec(original);
    return `
      <header class="modal__header">
        <div class="modal__icon" style="--mech-color:${mecanismo.color}">
          <svg viewBox="0 0 24 24" fill="none">${svgIcon(mecanismo.icono)}</svg>
        </div>
        <div class="modal__title-wrap">
          <span class="modal__tag" style="color:${mecanismo.color}">${Tm("modal.tag")}</span>
          <h2 class="modal__title" id="rc-modal-title">${mecanismo.nombre}</h2>
        </div>
        <button class="modal__close" aria-label="${Tm("common.close")}">
          <svg viewBox="0 0 24 24" fill="none">${svgIcon("close")}</svg>
        </button>
      </header>
      <div class="modal__body" style="--mech-color:${mecanismo.color}">
        <div class="modal__block">
          <h4>${Tm("modal.what")}</h4>
          <p>${mecanismo.queEs}</p>
        </div>
        <div class="modal__block">
          <h4>${Tm("modal.use")}</h4>
          <p>${mecanismo.paraQueSirve}</p>
        </div>
        <div class="modal__block">
          <h4>${Tm("modal.who")}</h4>
          <p>${mecanismo.quienPuedeUsarlo}</p>
        </div>
        <div class="modal__block">
          <h4>${Tm("modal.features")}</h4>
          <ul>${listItems(mecanismo.caracteristicas)}</ul>
        </div>
        <div class="modal__block">
          <h4>${Tm("modal.example")}</h4>
          <p>${mecanismo.ejemplo}</p>
        </div>
        <div class="modal__block">
          <h4>${Tm("modal.history")}</h4>
          <p>${mecanismo.datoHistorico}</p>
        </div>
        <div class="modal__callout">
          <strong>${Tm("modal.const")}</strong> ${mecanismo.constitucion91}
        </div>
        <div class="modal__block">
          <h4>${Tm("modal.facts")}</h4>
          <ul>${listItems(mecanismo.datosImportantes)}</ul>
        </div>
      </div>
      <footer class="modal__footer">
        <button class="btn btn-primary" data-action="practicar" data-mecanismo-id="${mecanismo.id}">
          ${Tm("modal.practice")}
        </button>
        <button class="btn btn-secondary" data-action="cerrar">${Tm("common.close")}</button>
      </footer>
    `;
  }

  function open(mecanismo) {
    ensureOverlay();
    lastFocused = document.activeElement;
    actual = mecanismo;
    if (window.RCProfile) window.RCProfile.visit(mecanismo.id);   // cuenta para el logro «Explorador»
    overlay.querySelector(".modal").innerHTML = buildContent(mecanismo);
    overlay.classList.add("is-open");
    document.body.classList.add("modal-open");
    if (window.RCSound) RCSound.play("open");

    overlay.querySelector(".modal__close").addEventListener("click", close);
    overlay.querySelector('[data-action="cerrar"]').addEventListener("click", close);
    overlay.querySelector('[data-action="practicar"]').addEventListener("click", () => {
      const id = mecanismo.id;
      close();
      // Redirige al quiz filtrado por este mecanismo.
      const base = window.location.pathname.includes("/pages/") ? "" : "pages/";
      window.location.href = `${base}quiz.html?mecanismo=${encodeURIComponent(id)}`;
    });

    const closeBtn = overlay.querySelector(".modal__close");
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    if (!overlay || !overlay.classList.contains("is-open")) return;
    if (window.RCSound) RCSound.play("close");
    overlay.classList.remove("is-open");
    actual = null;
    document.body.classList.remove("modal-open");
    if (lastFocused) lastFocused.focus();
  }

  // Si se cambia de idioma con el modal abierto, se repinta sin perder la posición.
  document.addEventListener("rc:langchange", () => {
    if (!overlay || !overlay.classList.contains("is-open") || !actual) return;
    const m = actual, y = overlay.querySelector(".modal__body") ? overlay.querySelector(".modal__body").scrollTop : 0;
    overlay.classList.remove("is-open"); open(m); overlay.querySelector(".modal__body").scrollTop = y;
  });

  return { open, close };
})();
