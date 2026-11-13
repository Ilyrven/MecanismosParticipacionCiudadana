/**
 * js/components/info-general.js
 * Renderiza los bloques de INFO_GENERAL (data/general/info-general.js)
 * dentro de los contenedores que existan en la página actual.
 * Cada bloque es independiente: si el contenedor no existe, se omite.
 */

function renderInfoGeneral() {
  const INFO = RCContent.general();                       // textos en el idioma elegido
  const Ti = (k, p) => (window.RCI18n ? window.RCI18n.t(k, p) : k);
  const mecT = (id) => { const m = obtenerMecanismoPorId(id); return m ? RCContent.mec(m) : null; };
  // ---- ¿Qué son? + ¿Por qué son importantes? ----
  const queEsEl = document.getElementById("info-que-es");
  if (queEsEl) queEsEl.textContent = INFO.queEs;

  const quickTagsEl = document.getElementById("info-quick-tags");
  if (quickTagsEl) {
    quickTagsEl.innerHTML = "";
    // Cada etiqueta lleva a la sección de la página con la que se relaciona.
    const destinos = ["mecanismos", "derechos", "marco-legal", "casos-practicos"];   // por posición: no depende del idioma
    INFO.importanciaRapida.forEach((item, idx) => {
      const tag = document.createElement("button");
      tag.type = "button";
      tag.className = "quick-tag";
      tag.innerHTML = `<span class="quick-tag__emoji">${item.emoji}</span> ${item.texto}`;
      const destinoId = destinos[idx];
      if (destinoId) {
        tag.addEventListener("click", () => {
          const el = document.getElementById(destinoId);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      quickTagsEl.appendChild(tag);
    });
  }

  // ---- Línea de tiempo del marco legal ----
  const timelineEl = document.getElementById("info-marco-legal");
  if (timelineEl) {
    timelineEl.innerHTML = "";
    INFO.marcoLegal.forEach((hito) => {
      const item = document.createElement("div");
      item.className = "timeline-item reveal";
      item.innerHTML = `
        <span class="timeline-item__year">${hito.anio}</span>
        <span class="timeline-item__dot" aria-hidden="true"></span>
        <div class="timeline-item__body">
          <h3 class="timeline-item__title">${hito.titulo}</h3>
          <p class="timeline-item__text">${hito.texto}</p>
        </div>
      `;
      timelineEl.appendChild(item);
    });
    if (window.RCAnimations) RCAnimations.revealNow(timelineEl.querySelectorAll(".reveal"));
  }

  // ---- Tabla comparativa "¿Para qué sirve cada mecanismo?" ----
  const tablaBody = document.getElementById("info-diferencias-body");
  if (tablaBody) {
    tablaBody.innerHTML = "";
    INFO.diferencias.forEach((fila) => {
      const original = obtenerMecanismoPorId(fila.mecanismo);
      const mecanismo = original && mecT(fila.mecanismo);
      if (!mecanismo) return;
      const tr = document.createElement("tr");
      tr.tabIndex = 0;
      tr.setAttribute("role", "button");
      tr.setAttribute("aria-label", Ti("card.moreOf", { x: mecanismo.nombre }));
      tr.innerHTML = `
        <td>
          <span class="compare-table__mech" style="--mech-color:${mecanismo.color}">
            <svg viewBox="0 0 24 24" fill="none">${svgIcon(mecanismo.icono)}</svg>
            ${mecanismo.nombre}
          </span>
        </td>
        <td>${fila.paraQueSirve}</td>
        <td>${fila.votacion}</td>
      `;
      const abrir = () => RCModal.open(original);
      tr.addEventListener("click", abrir);
      tr.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(); }
      });
      tablaBody.appendChild(tr);
    });
  }

  // ---- Derechos que protegen ----
  const derechosEl = document.getElementById("info-derechos");
  if (derechosEl) {
    derechosEl.innerHTML = "";
    INFO.derechosQueProtegen.forEach((derecho) => {
      const chip = document.createElement("span");
      chip.className = "right-chip";
      chip.textContent = derecho;
      derechosEl.appendChild(chip);
    });
  }

  // ---- ¿Quiénes pueden utilizarlos? ----
  const quienesEl = document.getElementById("info-quienes");
  if (quienesEl) quienesEl.textContent = INFO.quienesPuedenUsarlos;

  // ---- Nota importante (precisión jurídica) ----
  const notaEl = document.getElementById("info-nota-importante");
  if (notaEl) notaEl.textContent = INFO.notaImportante;

  // ---- Casos prácticos: "¿qué mecanismo usarías?" ----
  const casosEl = document.getElementById("info-casos-practicos");
  if (casosEl) {
    casosEl.innerHTML = "";
    INFO.casosPracticos.forEach((caso) => {
      const original = obtenerMecanismoPorId(caso.mecanismo);
      const mecanismo = original && mecT(caso.mecanismo);
      if (!mecanismo) return;
      const item = document.createElement("button");
      item.type = "button";
      item.className = "case-card reveal";
      item.style.setProperty("--mech-color", mecanismo.color);
      item.innerHTML = `
        <p class="case-card__situation">${caso.situacion}</p>
        <span class="case-card__answer">
          <svg viewBox="0 0 24 24" fill="none">${svgIcon(mecanismo.icono)}</svg>
          ${mecanismo.nombre}
        </span>
      `;
      item.addEventListener("click", () => RCModal.open(original));
      casosEl.appendChild(item);
    });
    if (window.RCAnimations) RCAnimations.revealNow(casosEl.querySelectorAll(".reveal"));
  }

  // ---- Errores frecuentes ----
  const erroresEl = document.getElementById("info-errores");
  if (erroresEl) {
    erroresEl.innerHTML = "";
    INFO.erroresFrecuentes.forEach((error) => {
      const li = document.createElement("li");
      li.className = "check-list__item check-list__item--error";
      li.textContent = error;
      erroresEl.appendChild(li);
    });
  }

  // ---- Participación responsable ----
  const responsableEl = document.getElementById("info-responsable");
  if (responsableEl) {
    responsableEl.innerHTML = "";
    INFO.participacionResponsable.forEach((item) => {
      const li = document.createElement("li");
      li.className = "check-list__item check-list__item--ok";
      li.textContent = item;
      responsableEl.appendChild(li);
    });
  }

  // ---- Control social ----
  const controlEl = document.getElementById("info-control-social");
  if (controlEl) {
    controlEl.innerHTML = "";
    INFO.controlSocial.forEach((item) => {
      const card = document.createElement("div");
      card.className = "control-card";
      card.innerHTML = `<h3>${item.titulo}</h3><p>${item.texto}</p>`;
      controlEl.appendChild(card);
    });
  }

  // ---- Glosario (acordeón interactivo: clic para ver la definición) ----
  const glosarioEl = document.getElementById("info-glosario");
  if (glosarioEl) {
    glosarioEl.innerHTML = "";
    INFO.glosario.forEach((entrada) => {
      const details = document.createElement("details");
      details.className = "glossary-item";
      details.innerHTML = `
        <summary>${entrada.termino}</summary>
        <p>${entrada.definicion}</p>
      `;
      glosarioEl.appendChild(details);
    });
  }

  // ---- Datos curiosos ----
  const curiososEl = document.getElementById("info-datos-curiosos");
  if (curiososEl) {
    curiososEl.innerHTML = "";
    INFO.datosCuriosos.forEach((dato) => {
      const card = document.createElement("div");
      card.className = "fact-card reveal";
      card.innerHTML = `<span class="fact-card__mark">💡</span><p>${dato}</p>`;
      curiososEl.appendChild(card);
    });
    if (window.RCAnimations) RCAnimations.revealNow(curiososEl.querySelectorAll(".reveal"));
  }

  // ---- Resumen ----
  const resumenEl = document.getElementById("info-resumen");
  if (resumenEl) resumenEl.textContent = INFO.resumen;
}
