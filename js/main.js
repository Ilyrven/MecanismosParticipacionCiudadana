/**
 * js/main.js
 * Punto de entrada general. Detecta qué elementos existen en la página
 * actual e inicializa el componente correspondiente. No contiene lógica
 * de negocio: solo conecta datos + componentes ya definidos.
 * Al cambiar de idioma (evento rc:langchange) todo se vuelve a dibujar con los textos nuevos.
 */

(function initInfoGeneral() {
  if (typeof renderInfoGeneral !== "function") return;
  renderInfoGeneral();
  document.addEventListener("rc:langchange", renderInfoGeneral);
})();

(function initHomePreview() {
  const grid = document.getElementById("mechanisms-preview");
  if (!grid) return;
  const pintar = () => renderTarjetasMecanismos("#mechanisms-preview", MECANISMOS);
  pintar();
  document.addEventListener("rc:langchange", pintar);
})();

(function initAprenderPage() {
  const grid = document.getElementById("mechanisms-grid");
  const filterBar = document.getElementById("filter-bar");
  if (!grid) return;
  let filtroActual = "todos";

  function renderConFiltro(filtro) {
    filtroActual = filtro;
    const lista = filtro === "todos" ? MECANISMOS : MECANISMOS.filter((m) => m.id === filtro);
    renderTarjetasMecanismos("#mechanisms-grid", lista);
  }

  function pintarFiltros() {
    if (!filterBar) return;
    filterBar.innerHTML = "";
    const opciones = [{ id: "todos", nombre: window.RCI18n.t("learn.all") }, ...MECANISMOS.map((m) => ({ id: m.id, nombre: RCContent.mec(m).nombre }))];
    opciones.forEach((op) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "filter-chip" + (op.id === filtroActual ? " is-active" : "");
      chip.setAttribute("aria-pressed", String(op.id === filtroActual));
      chip.textContent = op.nombre;
      chip.addEventListener("click", () => {
        filterBar.querySelectorAll(".filter-chip").forEach((c) => { c.classList.remove("is-active"); c.setAttribute("aria-pressed", "false"); });
        chip.classList.add("is-active");
        chip.setAttribute("aria-pressed", "true");
        renderConFiltro(op.id);
      });
      filterBar.appendChild(chip);
    });
  }

  pintarFiltros();
  renderConFiltro("todos");
  document.addEventListener("rc:langchange", () => { pintarFiltros(); renderConFiltro(filtroActual); });

  // Si se llega desde un enlace con ?mecanismo=id, abre directamente el modal.
  const params = new URLSearchParams(window.location.search);
  const directo = params.get("mecanismo");
  if (directo) {
    const mecanismo = obtenerMecanismoPorId(directo);
    if (mecanismo) RCModal.open(mecanismo);
  }
})();
