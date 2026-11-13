/**
 * js/settings.js
 * Página de configuración (pages/configuracion.html). Solo orquesta la interfaz:
 * NO crea sistemas paralelos, usa los que ya existen:
 *   - RCStudent / RCProfile (perfil temporal, SQL en el servidor) → «Cuenta y sesión»
 *   - RCTheme    (tema, localStorage)                       → «Apariencia»
 *   - RCI18n     (idioma, localStorage)                     → «Idioma y región»
 *   - RCA11y / RCSound (accesibilidad, localStorage)        → «Accesibilidad»
 *   - RCProfile.snapshot (estadísticas y logros del servidor) → «Estadísticas» y «Logros»
 *   - RCHistory  (historial del perfil)                     → «Mi historial»
 *   - Privacidad, eliminar historial y eliminar toda la información → «Privacidad y datos»
 * Las secciones ligadas al perfil están en js/settings-profile.js.
 * Preferencias permanentes (tema, idioma, accesibilidad) y datos del perfil están separados.
 */
(function initSettings() {
  const root = document.querySelector(".cfg-shell");
  if (!root) return;

  const $ = (id) => document.getElementById(id);
  const T = (k, p) => RCI18n.t(k, p);
  const GITHUB_URL = "https://github.com/CuteMoons/Mecanismos-de-Participaci-n-Ciudadana";
  const DISCORD_USER = "ilyrven";
  const SECCIONES = [
    { id: "cuenta", icon: "user", key: "account", render: () => EXT.renderCuenta() },
    { id: "apariencia", icon: "palette", key: "appearance", render: renderApariencia },
    { id: "idioma", icon: "globe", key: "language", render: renderIdioma },
    { id: "accesibilidad", icon: "eye", key: "a11y", render: () => EXT.renderAccesibilidad() },
    { id: "estadisticas", icon: "chart", key: "stats", render: () => EXT.renderEstadisticas() },
    { id: "logros", icon: "trophy", key: "ach", render: () => EXT.renderLogros() },
    { id: "historial", icon: "clock", key: "history", render: renderHistorial },
    { id: "privacidad", icon: "lock", key: "privacy", render: () => EXT.renderPrivacidad() },
    { id: "acerca", icon: "info", key: "about", render: renderAcerca }
  ];

  function el(tag, attrs = {}, hijos = []) {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else n.setAttribute(k, v);
    });
    hijos.forEach((h) => { if (h) n.appendChild(typeof h === "string" ? document.createTextNode(h) : h); });
    return n;
  }
  /** Iconos propios del proyecto (js/components/icons.js, SVG constantes). */
  function icon(name, cls) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("aria-hidden", "true");
    if (cls) s.setAttribute("class", cls);
    s.setAttribute("fill", "none");
    s.setAttribute("stroke", "currentColor");
    s.innerHTML = svgIcon(name);
    return s;
  }
  const sonar = (n) => { if (window.RCSound) window.RCSound.play(n); };
  const head = (key, leadKey) => el("div", { class: "cfg-panel__head" }, [el("h2", { text: T(key) }), leadKey ? el("p", { text: T(leadKey) }) : null]);

  let toastTimer = null;
  function toast(msg) {
    const t = $("cfg-toast");
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-visible"), 2600);
  }

  // ------------------------------------------------------------------
  // Modal de confirmación (mismas clases que el modal de salida de los juegos)
  // ------------------------------------------------------------------
  function confirmar({ title, text, confirmText }) {
    return new Promise((resolve) => {
      const previo = document.activeElement;
      const ov = el("div", { class: "modal-overlay is-open", role: "alertdialog", "aria-modal": "true", "aria-labelledby": "cfg-modal-title", "aria-describedby": "cfg-modal-text" });
      const bCancel = el("button", { type: "button", class: "btn btn-primary", "data-sound": "none", text: T("common.cancel") });
      const bOk = el("button", { type: "button", class: "btn btn-secondary btn-danger-outline", "data-sound": "none", text: confirmText });
      ov.appendChild(el("div", { class: "modal modal--confirm", role: "document" }, [
        el("div", { class: "modal-confirm__body" }, [el("h2", { class: "modal-confirm__title", id: "cfg-modal-title", text: title }), el("p", { id: "cfg-modal-text", text: text })]),
        el("div", { class: "modal-confirm__actions" }, [bCancel, bOk])
      ]));
      document.body.appendChild(ov);
      document.body.classList.add("modal-open");
      sonar("open");
      const cerrar = (val) => {
        document.removeEventListener("keydown", onKey, true);
        ov.remove();
        document.body.classList.remove("modal-open");
        if (previo && previo.focus) previo.focus();
        resolve(val);
      };
      function onKey(e) {
        if (e.key === "Escape") { e.preventDefault(); cerrar(false); }
        else if (e.key === "Tab") {   // el foco no sale del modal
          const f = [bCancel, bOk], i = f.indexOf(document.activeElement);
          e.preventDefault();
          f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
        }
      }
      document.addEventListener("keydown", onKey, true);
      bCancel.addEventListener("click", () => cerrar(false));
      bOk.addEventListener("click", () => cerrar(true));
      ov.addEventListener("click", (e) => { if (e.target === ov) cerrar(false); });
      bCancel.focus();
    });
  }

  // Secciones ligadas al perfil (js/settings-profile.js)
  const EXT = window.RCSettingsExt({ el, icon, T, head, toast, confirmar, sonar, $, refrescar: () => mostrar(actual) });

  // ------------------------------------------------------------------
  // 2. APARIENCIA
  // ------------------------------------------------------------------
  function miniatura(id) {
    return el("div", { class: "theme-mini", "data-theme": id, "aria-hidden": "true" }, [
      el("div", { class: "tm-bar" }, [el("i"), el("i"), el("i"), el("b")]),
      el("div", { class: "tm-body" }, [
        el("div", { class: "tm-card" }, [el("span", { class: "tm-title", text: "Aa" }), el("span", { class: "tm-line" }), el("span", { class: "tm-line s" })]),
        el("div", { class: "tm-card" }, [el("span", { class: "tm-line" }), el("div", { class: "tm-chips" }, [el("i"), el("i"), el("i")]), el("span", { class: "tm-btn" })])
      ])
    ]);
  }
  function renderApariencia() {
    const p = $("panel-apariencia");
    p.innerHTML = "";
    p.appendChild(head("cfg.nav.appearance", "app.lead"));
    const grid = el("div", { class: "theme-grid", role: "list", "aria-label": T("app.themes") });
    RCTheme.THEMES.forEach((th) => {
      const sel = RCTheme.get() === th.id;
      const name = T(`theme.${th.id}.name`);
      const bPrev = el("button", { type: "button", class: "btn btn-ghost", "data-sound": "none", text: T("app.preview") });
      const bUse = el("button", { type: "button", class: "btn " + (sel ? "btn-secondary" : "btn-primary"), "aria-pressed": String(sel), text: sel ? T("app.selected") : T("app.apply") });
      if (sel) bUse.disabled = true;
      bPrev.addEventListener("click", () => iniciarVistaPrevia(th.id));
      bUse.addEventListener("click", () => { RCTheme.apply(th.id); sonar("confirm"); toast(T("app.applied", { name })); });
      const check = el("span", { class: "theme-card__check", "aria-hidden": "true" }); check.appendChild(icon("check"));
      const sw = el("div", { class: "theme-swatches", "data-theme": th.id, "aria-hidden": "true" }, ["--bg", "--surface", "--color-primary", "--color-secondary", "--color-accent"].map((v) => { const s = el("span"); s.style.background = `var(${v})`; return s; }));
      grid.appendChild(el("article", { class: "theme-card" + (sel ? " is-selected" : ""), role: "listitem", "data-theme-id": th.id }, [
        check, miniatura(th.id),
        el("div", { class: "theme-card__top" }, [el("h3", { class: "theme-card__name", text: name }), el("span", { class: "theme-card__tone", text: th.tone === "dark" ? T("app.toneDark") : T("app.toneLight") })]),
        el("p", { class: "theme-card__desc", text: T(`theme.${th.id}.desc`) }), sw,
        el("div", { class: "theme-card__btns" }, [bPrev, bUse])
      ]));
    });
    p.appendChild(grid);
    p.appendChild(el("p", { class: "text-muted", style: "margin-top: var(--space-4); font-size: var(--fs-sm);", text: T("app.quick") }));
  }

  function iniciarVistaPrevia(id) {
    RCTheme.preview(id);
    const bar = $("cfg-preview-bar");
    bar.innerHTML = "";
    const bOk = el("button", { type: "button", class: "btn btn-primary", text: T("app.previewApply") });
    const bNo = el("button", { type: "button", class: "btn btn-ghost", text: T("app.previewCancel") });
    bOk.addEventListener("click", () => { RCTheme.apply(id); bar.hidden = true; toast(T("app.applied", { name: T(`theme.${id}.name`) })); });
    bNo.addEventListener("click", () => { RCTheme.cancelPreview(); bar.hidden = true; });
    bar.append(el("span", { text: T("app.previewBar", { name: T(`theme.${id}.name`) }) }), bOk, bNo);
    bar.hidden = false;
  }

  // ------------------------------------------------------------------
  // 3. IDIOMA Y REGIÓN
  // ------------------------------------------------------------------
  function renderIdioma() {
    const p = $("panel-idioma");
    p.innerHTML = "";
    p.appendChild(head("cfg.nav.language", "lang.lead"));
    const grid = el("div", { class: "lang-grid", role: "radiogroup", "aria-label": T("lang.list") });
    RCI18n.LANGS.forEach((l) => {
      const sel = RCI18n.get() === l.code;
      const state = el("span", { class: "lang-card__state", "aria-hidden": "true" }); state.appendChild(icon("check"));
      const b = el("button", { type: "button", class: "lang-card", role: "radio", "aria-checked": String(sel), lang: l.code, "data-lang": l.code, "data-sound": "none" }, [
        RCI18n.flag(l.code),
        el("span", {}, [el("span", { class: "lang-card__name", text: l.name }), el("span", { class: "lang-card__region", text: l.region })]),
        state
      ]);
      b.addEventListener("click", () => {
        if (RCI18n.get() === l.code) return;
        RCI18n.set(l.code);    // repinta textos; no toca ni el historial ni la sesión
        sonar("confirm");
        toast(T("lang.changed"));
      });
      grid.appendChild(b);
    });
    p.appendChild(grid);
    // Aviso permanente: qué se traduce y por qué los juegos y quiz siguen en español.
    p.appendChild(el("div", { class: "cfg-note lang-note", role: "note" }, [
      el("span", { "aria-hidden": "true", text: "ℹ️" }),
      el("div", {}, [el("h3", { text: T("lang.noteTitle") }), el("p", { text: T("lang.noteP1") }), el("p", { text: T("lang.noteP2") }), el("p", { text: T("lang.noteP3") }), el("p", { class: "lang-note__key", text: T("lang.noteP4") })])
    ]));
  }

  // ------------------------------------------------------------------
  // 4. MI HISTORIAL
  // ------------------------------------------------------------------
  const EMOJI = { quiz: "📝", crossword: "🔤", matching: "🔗", wordsearch: "🔍", situations: "🤔", memory: "🃏", roulette: "🎡" };
  const filtros = { tipo: "all", fecha: "any", resultado: "any" };
  const abiertos = new Set();

  const fmtTiempo = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const fmtNota = (n) => n.toFixed(1);
  function fmtFecha(iso) {
    try { return new Intl.DateTimeFormat(RCI18n.byCode(RCI18n.get()).locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)); }
    catch (_) { return iso; }
  }
  function pasaFiltros(it) {
    if (filtros.tipo !== "all" && it.tipo !== filtros.tipo) return false;
    const ahora = Date.now(), t = new Date(it.fecha).getTime();
    if (filtros.fecha === "today" && new Date(it.fecha).toDateString() !== new Date().toDateString()) return false;
    if (filtros.fecha === "7" && ahora - t > 7 * 86400000) return false;
    if (filtros.resultado === "pass" && !(it.nota != null && it.nota >= 3)) return false;
    if (filtros.resultado === "low" && !(it.nota != null && it.nota < 3)) return false;
    if (filtros.resultado === "none" && it.nota != null) return false;
    return true;
  }
  function select(id, labelKey, opciones, valor, onChange) {
    const s = el("select", { class: "cfg-select", id }, opciones.map(([v, k]) => { const o = el("option", { value: v, text: k }); if (v === valor) o.selected = true; return o; }));
    s.addEventListener("change", () => onChange(s.value));
    return el("label", { for: id }, [T(labelKey), s]);
  }
  function statBox(valor, etiqueta, cls, sub) {
    return el("div", { class: "his-stat" + (cls ? " " + cls : "") }, [el("b", { text: String(valor) }), el("span", { text: etiqueta }), sub ? el("small", { text: sub }) : null]);
  }

  function detalleActividad(it) {
    const body = el("div", { class: "his-item__body" });
    // Los registros del perfil (servidor) no incluyen «estudiante»: pertenecen al perfil activo.
    const est = it.estudiante || RCStudent.get() || { nombre: "", curso: "" };
    body.appendChild(el("div", { class: "his-meta" }, [
      el("div", {}, [el("span", { text: T("his.student") }), document.createTextNode(est.nombre)]),
      el("div", {}, [el("span", { text: T("his.course") }), document.createTextNode(est.curso || T("acc.courseNone"))]),
      el("div", {}, [el("span", { text: T("his.when") }), document.createTextNode(fmtFecha(it.fecha))])
    ]));
    if (it.memoria) {
      body.appendChild(el("div", { class: "his-meta" }, [
        el("div", {}, [el("span", { text: T("his.pairs") }), document.createTextNode(T("his.of", { a: it.memoria.parejas, b: it.memoria.total }))]),
        el("div", {}, [el("span", { text: T("his.attempts") }), document.createTextNode(String(it.memoria.intentos))]),
        el("div", {}, [el("span", { text: T("his.time") }), document.createTextNode(fmtTiempo(it.tiempoSeg || 0))])
      ]));
      body.appendChild(el("h4", { class: "his-body-title", text: T("his.learned") }));
      body.appendChild(el("ul", { class: "his-concepts" }, it.memoria.conceptos.map((c) => el("li", c.encontrada ? {} : { class: "pending" }, [el("b", { text: c.concepto }), ` — ${c.definicion}`]))));
    }
    if (it.detalle && it.detalle.length) {
      body.appendChild(el("h4", { class: "his-body-title", text: T("his.questions") }));
      body.appendChild(el("div", { class: "his-qs" }, it.detalle.map((d, i) => {
        const q = el("div", { class: "his-q " + (d.ok === true ? "ok" : d.ok === false ? "bad" : "") });
        q.appendChild(el("p", { class: "his-q__t", text: `${i + 1}. ${d.pregunta}` }));
        q.appendChild(el("p", {}, [el("span", { class: "lbl", text: `${T("his.yourAnswer")}: ` }), document.createTextNode(d.elegida == null ? T("his.unanswered") : d.elegida), document.createTextNode(d.ok === true ? `  ✓ ${T("his.ok")}` : d.ok === false ? `  ✗ ${T("his.fail")}` : "")]));
        if (d.ok !== true && d.correcta) q.appendChild(el("p", {}, [el("span", { class: "lbl", text: `${T("his.correctAnswer")}: ` }), document.createTextNode(d.correcta)]));
        if (d.explicacion) q.appendChild(el("p", { class: "exp" }, [el("span", { class: "lbl", text: `${T("his.explanation")}: ` }), document.createTextNode(d.explicacion)]));
        return q;
      })));
    } else if (!it.memoria) {
      body.appendChild(el("p", { class: "his-nodetail", text: T("his.noDetail") }));
    }
    return body;
  }

  function tarjetaActividad(it) {
    const abierto = abiertos.has(it.id);
    const chev = icon("chevron", "his-item__chev");
    const gradeEl = it.nota == null
      ? el("span", { class: "his-grade", text: T("his.noGrade") })
      : el("span", { class: "his-grade " + (it.nota >= 3 ? "pass" : "low"), text: `${T("his.grade")}: ${fmtNota(it.nota)}` });
    const figs = [];
    if (it.memoria) {
      figs.push(el("span", { class: "his-fig" }, [el("b", { text: `${it.memoria.parejas}/${it.memoria.total}` }), el("span", { text: T("his.pairs") })]));
      figs.push(el("span", { class: "his-fig" }, [el("b", { text: String(it.memoria.intentos) }), el("span", { text: T("his.attempts") })]));
    } else {
      figs.push(el("span", { class: "his-fig ok" }, [el("b", { text: String(it.correctas) }), el("span", { text: T("his.correct") })]));
      figs.push(el("span", { class: "his-fig bad" }, [el("b", { text: String(it.incorrectas) }), el("span", { text: T("his.incorrect") })]));
    }
    if (it.tiempoSeg != null) figs.push(el("span", { class: "his-fig" }, [el("b", { text: fmtTiempo(it.tiempoSeg) }), el("span", { text: T("his.time") })]));
    const btn = el("button", { type: "button", class: "his-item__head", "aria-expanded": String(abierto), "aria-label": `${T("act." + it.tipo)} — ${abierto ? T("his.hide") : T("his.show")}` }, [
      el("span", { class: "his-item__icon", "aria-hidden": "true", text: EMOJI[it.tipo] || "🎯" }),
      el("span", { class: "his-item__main" }, [el("span", { class: "his-item__name", text: T("act." + it.tipo) }), el("span", { class: "his-item__date", text: fmtFecha(it.fecha) })]),
      el("span", { class: "his-item__figs" }, figs), gradeEl, chev
    ]);
    const item = el("article", { class: "his-item" + (abierto ? " is-open" : "") }, [btn]);
    if (abierto) {
      try { item.appendChild(detalleActividad(it)); }
      catch (_) { item.appendChild(el("div", { class: "his-item__body" }, [el("p", { class: "his-nodetail", text: T("his.noDetail") })])); }
    }
    btn.addEventListener("click", () => { if (abiertos.has(it.id)) abiertos.delete(it.id); else abiertos.add(it.id); renderHistorial(); });
    return item;
  }

  let histSeq = 0;
  async function renderHistorial() {
    const p = $("panel-historial");
    const antes = document.activeElement && document.activeElement.id;
    const seq = ++histSeq;
    p.innerHTML = "";
    p.appendChild(head("cfg.nav.history", "his.lead"));
    const est = RCStudent.get();
    if (!est) {
      const b = el("a", { class: "btn btn-primary", href: "#cuenta", text: T("his.goAccount") });
      p.appendChild(el("div", { class: "cfg-card cfg-empty" }, [el("span", { class: "cfg-empty__icon", "aria-hidden": "true", text: "🕑" }), el("h3", { text: T("his.noStudentTitle") }), el("p", { text: T("his.noStudentText") }), b]));
      return;
    }
    let todos;
    try { p.appendChild(el("p", { class: "cfg-card text-muted", id: "his-loading", role: "status", text: T("his.loading") })); todos = (await RCHistory.listAsync()).slice(); }
    catch (e) { if (seq === histSeq) { p.innerHTML = ""; p.appendChild(el("p", { class: "cfg-card student-error", role: "alert", text: RCStudent.textoError(e) })); } return; }
    if (seq !== histSeq) return;   // llegó una respuesta más reciente
    const cargando = $("his-loading"); if (cargando) cargando.remove();
    if (RCProfile.active()) todos.sort((x, y) => (x.fecha < y.fecha ? 1 : -1)); else todos.reverse();   // la más reciente primero
    if (!todos.length) {
      p.appendChild(el("div", { class: "cfg-card cfg-empty" }, [el("span", { class: "cfg-empty__icon", "aria-hidden": "true", text: "📭" }), el("h3", { text: T("his.noneTitle") }), el("p", { text: T("his.noneText") }), el("a", { class: "btn btn-primary", href: "juegos.html", text: T("his.goGames") })]));
      return;
    }
    const sm = RCHistory.summary(todos);
    p.appendChild(el("div", { class: "his-summary" }, [
      statBox(sm.actividades, T("his.sumActivities")),
      statBox(sm.conNota, T("his.sumGrades"), "", sm.promedio == null ? T("his.sumNoGrades") : T("his.sumAvg", { x: fmtNota(sm.promedio) })),
      statBox(sm.correctas, T("his.sumCorrect"), "ok"),
      statBox(sm.incorrectas, T("his.sumIncorrect"), "bad")
    ]));
    const tiposPresentes = RCHistory.TIPOS.filter((t) => todos.some((i) => i.tipo === t));
    // Si la categoría activa ya no existe (p. ej. tras eliminar el historial), «Todas» vuelve a ser la activa.
    if (filtros.tipo !== "all" && !tiposPresentes.includes(filtros.tipo)) filtros.tipo = "all";
    abiertos.forEach((id) => { if (!todos.some((i) => i.id === id)) abiertos.delete(id); });   // solo estado de pantalla
    p.appendChild(el("div", { class: "his-filters", role: "group", "aria-label": T("his.filters") }, [
      select("his-f-type", "his.fType", [["all", T("his.fAll")]].concat(tiposPresentes.map((t) => [t, T("act." + t)])), filtros.tipo, (v) => { filtros.tipo = v; renderHistorial(); }),
      select("his-f-date", "his.fDate", [["any", T("his.fAnyDate")], ["today", T("his.fToday")], ["7", T("his.f7")]], filtros.fecha, (v) => { filtros.fecha = v; renderHistorial(); }),
      select("his-f-res", "his.fResult", [["any", T("his.fAnyResult")], ["pass", T("his.fPass")], ["low", T("his.fLow")], ["none", T("his.fNoGrade")]], filtros.resultado, (v) => { filtros.resultado = v; renderHistorial(); })
    ]));
    const vis = todos.filter(pasaFiltros);
    if (!vis.length) p.appendChild(el("p", { class: "cfg-card text-muted", text: T("his.noMatch") }));
    else p.appendChild(el("div", { class: "his-list" }, vis.map(tarjetaActividad)));
    const ef = antes && $(antes); if (ef && ef.tagName === "SELECT") ef.focus();
  }

  // ------------------------------------------------------------------
  // 5. ACERCA DEL PROYECTO
  // ------------------------------------------------------------------
  function renderAcerca() {
    const p = $("panel-acerca");
    p.innerHTML = "";
    p.appendChild(head("cfg.nav.about"));
    const logo = el("div", { class: "abo-hero__logo" });
    const img = el("img", { src: "../assets/logo/logo-colegio.png", alt: "" });
    img.addEventListener("error", () => { img.remove(); logo.appendChild(el("span", { "aria-hidden": "true", text: "MPC" })); });
    logo.appendChild(img);
    p.appendChild(el("div", { class: "abo-hero" }, [logo, el("div", {}, [el("h3", { text: T("abo.name") }), el("p", { text: T("abo.tagline") })])]));

    p.appendChild(el("div", { class: "cfg-card" }, [el("h3", { text: T("abo.aboutTitle") }), el("p", { class: "abo-text", text: T("abo.aboutText") })]));
    p.appendChild(el("div", { class: "cfg-card" }, [el("h3", { text: T("abo.authorTitle") }), el("div", { class: "abo-author" }, [
      el("img", { class: "abo-author__photo", src: "../assets/images/author-ilyrven.jpg", alt: T("abo.authorAlt"), width: "88", height: "88", loading: "lazy", decoding: "async" }),
      el("div", {}, [el("span", { class: "abo-author__name", text: "Ilyrven" }), el("span", { class: "abo-author__role", text: T("abo.authorRole") })])
    ])]));

    // GitHub
    const ghLogo = el("span", { class: "abo-link__logo gh", "aria-hidden": "true" }); ghLogo.appendChild(icon("github"));
    const gh = el("a", { class: "abo-link", href: GITHUB_URL, target: "_blank", rel: "noopener noreferrer", "data-link": "github" }, [
      el("div", { class: "abo-link__top" }, [ghLogo, el("span", { class: "abo-link__name", text: T("abo.ghName") })]),
      el("p", { text: T("abo.ghDesc") }),
      el("span", { class: "abo-link__cta", text: `${T("abo.ghCta")} →` })
    ]);
    // Discord: solo el usuario (sin enlace de invitación ni de perfil inventados)
    const dcLogo = el("span", { class: "abo-link__logo dc", "aria-hidden": "true" }); dcLogo.appendChild(icon("discord"));
    const bCopy = el("button", { type: "button", class: "btn btn-secondary abo-copy", id: "abo-copy" }, [icon("copy"), el("span", { text: T("abo.dcCopy") })]);
    bCopy.addEventListener("click", () => copiarUsuario(bCopy));
    const dc = el("div", { class: "abo-link", "data-link": "discord" }, [
      el("div", { class: "abo-link__top" }, [dcLogo, el("span", { class: "abo-link__name", text: T("abo.dcName") })]),
      el("div", { class: "abo-user" }, [el("small", { text: `${T("abo.dcUser")}:` }), el("code", { text: DISCORD_USER })]),
      el("p", { text: T("abo.dcDesc") }), bCopy
    ]);
    p.appendChild(el("div", { class: "abo-links" }, [gh, dc]));
  }

  async function copiarUsuario(btn) {
    let ok = false;
    try { await navigator.clipboard.writeText(DISCORD_USER); ok = true; }
    catch (_) {
      try {   // respaldo para navegadores sin API de portapapeles (p. ej. file://)
        const ta = el("textarea", { "aria-hidden": "true", style: "position:fixed;opacity:0;" }); ta.value = DISCORD_USER;
        document.body.appendChild(ta); ta.select(); ok = document.execCommand("copy"); ta.remove();
      } catch (__) { ok = false; }
    }
    toast(ok ? T("abo.dcCopied") : T("abo.dcFail"));
    if (ok) sonar("confirm");
  }

  // ------------------------------------------------------------------
  // Navegación entre secciones (#cuenta, #apariencia, #idioma, #historial, #acerca)
  // ------------------------------------------------------------------
  function renderNav(actual) {
    const nav = $("cfg-nav");
    nav.innerHTML = "";
    SECCIONES.forEach((s) => {
      const ic = el("span", { class: "cfg-tab__icon" }); ic.appendChild(icon(s.icon));
      const b = el("button", { type: "button", class: "cfg-tab", id: "tab-" + s.id, role: "tab", "aria-selected": String(s.id === actual), "aria-controls": "panel-" + s.id, "data-section": s.id, "data-sound": "none" }, [
        ic, el("span", { class: "cfg-tab__text" }, [el("span", { class: "cfg-tab__title", text: T(`cfg.nav.${s.key}`) }), el("span", { class: "cfg-tab__desc", text: T(`cfg.nav.${s.key}.d`) })])
      ]);
      b.addEventListener("click", () => { if (location.hash !== "#" + s.id) location.hash = s.id; else mostrar(s.id); });
      nav.appendChild(b);
    });
    nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", T("cfg.sections"));
  }
  let actual = "cuenta";
  function mostrar(id) {
    if (!SECCIONES.some((s) => s.id === id)) id = "cuenta";
    actual = id;
    renderNav(id);
    SECCIONES.forEach((s) => {
      const panel = $("panel-" + s.id);
      panel.hidden = s.id !== id;
      panel.setAttribute("role", "tabpanel");
    });
    SECCIONES.find((s) => s.id === id).render();
    if (id !== "apariencia" && RCTheme.isPreviewing()) { RCTheme.cancelPreview(); $("cfg-preview-bar").hidden = true; }
  }
  const desdeHash = () => (location.hash || "#cuenta").slice(1);   // #cuenta, #apariencia, #idioma, #accesibilidad, #estadisticas, #logros, #historial, #privacidad, #acerca
  window.addEventListener("hashchange", () => mostrar(desdeHash()));

  // Al cambiar el tema (también con el botón rápido de la barra) se actualiza la tarjeta seleccionada.
  document.addEventListener("rc:themechange", (e) => { if (!e.detail.preview && actual === "apariencia") renderApariencia(); });

  // Cambiar de idioma repinta toda la página sin perder la sección ni el estado.
  RCI18n.onChange(() => {
    $("cfg-header-icon").innerHTML = svgIcon("settings");
    document.title = T("cfg.title");
    RCI18n.apply();
    mostrar(actual);
  });

  // El perfil cambió (venció, se eliminó, se recuperó…): se repinta la sección abierta.
  RCProfile.onChange((_e, motivo) => { if (motivo !== "refreshed" && motivo !== "activity") mostrar(actual); });
  document.addEventListener("rc:a11ychange", () => { /* las tarjetas de accesibilidad se repintan solas al cambiar */ });

  $("cfg-header-icon").setAttribute("fill", "none");
  $("cfg-header-icon").setAttribute("stroke", "currentColor");
  $("cfg-header-icon").innerHTML = svgIcon("settings");
  mostrar(desdeHash());
})();
