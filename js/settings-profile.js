/**
 * js/settings-profile.js
 * Secciones de Configuración ligadas al perfil temporal: Cuenta y sesión (con tiempo de
 * conservación), Accesibilidad, Estadísticas personales, Logros y Privacidad / eliminación de datos.
 * Lo carga pages/configuracion.html ANTES de settings.js; settings.js le pasa sus ayudantes
 * (el, icon, T, head, toast, confirmar, sonar, $) y recibe las funciones de dibujo.
 */
window.RCSettingsExt = function (ctx) {
  const { el, icon, T, head, toast, confirmar, sonar, $ } = ctx;
  const fmtFecha = (iso) => RCStudent.fmtFecha(iso);

  // ------------------------------------------------------------------ utilidades
  function fmtRestante(ms) {
    if (ms <= 0) return `0 ${T("time.s")}`;
    let s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600); s -= h * 3600;
    const m = Math.floor(s / 60); s -= m * 60;
    const partes = [];
    if (d) partes.push(`${d} ${T("time.d")}`);
    if (d || h) partes.push(`${h} ${T("time.h")}`);
    partes.push(`${String(m).padStart(2, "0")} ${T("time.m")}`);
    partes.push(`${String(s).padStart(2, "0")} ${T("time.s")}`);
    return partes.join(" ");
  }
  const fmtDuracion = (seg) => {
    if (!seg) return `0 ${T("time.m")}`;
    const h = Math.floor(seg / 3600), m = Math.floor((seg % 3600) / 60), s = seg % 60;
    return h ? `${h} ${T("time.h")} ${m} ${T("time.m")}` : (m ? `${m} ${T("time.m")} ${s} ${T("time.s")}` : `${s} ${T("time.s")}`);
  };
  const fmtNum = (n, d = 1) => { try { return new Intl.NumberFormat(RCI18n.byCode(RCI18n.get()).locale, { minimumFractionDigits: d, maximumFractionDigits: d }).format(n); } catch (_) { return n.toFixed(d); } };

  /** Cuenta atrás en vivo (usa el reloj corregido con el del servidor). */
  function contador(clase) {
    const n = el("span", { class: clase || "", "data-rc-countdown": "" });
    n.textContent = fmtRestante(RCProfile.remainingMs());
    return n;
  }
  setInterval(() => {
    document.querySelectorAll("[data-rc-countdown]").forEach((n) => { n.textContent = fmtRestante(RCProfile.remainingMs()); });
    if (document.querySelector("[data-rc-countdown]") && RCProfile.remainingMs() <= 0) RCProfile.active();   // dispara el aviso de vencimiento
  }, 1000);

  /** Devuelve el resumen del servidor (con copia local mientras no cambie nada). */
  function conSnapshot(panel, pintar) {
    const s = RCProfile.snapshot();
    if (s) { pintar(s); return; }
    panel.appendChild(el("p", { class: "cfg-card text-muted", role: "status", text: T("his.loading") }));
    RCProfile.refresh().then((nuevo) => { if (nuevo && !panel.hidden) pintar(nuevo); }).catch((e) => {
      panel.innerHTML = "";
      panel.appendChild(el("p", { class: "cfg-card student-error", role: "alert", text: e && e.offline ? T("student.errOffline") : T("student.errServer") }));
    });
  }
  const sinPerfil = (panel, icono, tituloKey, textoKey) => {
    panel.appendChild(el("div", { class: "cfg-card cfg-empty" }, [
      el("span", { class: "cfg-empty__icon", "aria-hidden": "true", text: icono }), el("h3", { text: T(tituloKey) }), el("p", { text: T(textoKey) }),
      el("a", { class: "btn btn-primary", href: "#cuenta", text: T("his.goAccount") })
    ]));
  };

  // ------------------------------------------------------------------ 1. CUENTA Y SESIÓN
  let cuentaModo = "vista";   // vista | ident | editar
  const setModo = (m) => { cuentaModo = m; };

  function renderCuenta() {
    const p = $("panel-cuenta");
    p.innerHTML = "";
    p.appendChild(head("cfg.nav.account", "acc.lead"));
    const est = RCStudent.get();
    // Sesión cerrada con un perfil guardado en este navegador: se ofrece continuar con él.
    if (!est && cuentaModo === "vista" && RCProfile.recoverable()) cuentaModo = "ident";

    if (cuentaModo === "ident" || (cuentaModo === "editar" && !est)) {
      const mount = el("div", { class: "cfg-form-ident" });
      p.appendChild(mount);
      cuentaModo = "ident";
      const f = RCStudent.montarFormulario(mount, {
        volverTexto: T("acc.cancelForm"),
        onBack: () => { cuentaModo = "vista"; renderCuenta(); },
        onSubmit: (nuevo) => { cuentaModo = "vista"; ctx.refrescar(); toast(T("acc.switched", { x: nuevo.nombre })); }
      });
      setTimeout(() => f.enfocar(), 30);
      return;
    }
    if (!est) {
      const b = el("button", { type: "button", class: "btn btn-primary btn-lg", text: T("acc.emptyCta") });
      b.addEventListener("click", () => { cuentaModo = "ident"; renderCuenta(); });
      p.appendChild(el("div", { class: "cfg-card cfg-empty" }, [el("span", { class: "cfg-empty__icon", "aria-hidden": "true", text: "🎓" }), el("h3", { text: T("acc.emptyTitle") }), el("p", { text: T("acc.emptyText") }), b]));
      return;
    }

    // --- identificación ---
    const card = el("div", { class: "cfg-card" }, [el("h3", { text: T("acc.infoTitle") })]);
    if (cuentaModo === "editar") card.appendChild(formEditar(est));
    else {
      const bEdit = el("button", { type: "button", class: "btn btn-secondary", text: T("acc.edit") });
      bEdit.addEventListener("click", () => { cuentaModo = "editar"; renderCuenta(); });
      card.appendChild(el("div", { class: "cfg-person" }, [
        el("span", { class: "cfg-avatar", "aria-hidden": "true", text: est.nombre.trim().charAt(0).toUpperCase() }),
        el("div", { class: "cfg-person__body" }, [
          el("div", { class: "cfg-person__name", text: est.nombre }),
          el("div", { class: "cfg-person__meta", text: `${T("acc.course")}: ${est.curso || T("acc.courseNone")}` })
        ]), bEdit
      ]));
    }
    p.appendChild(card);

    // --- perfil temporal + conservación ---
    if (RCProfile.active()) {
      const perfil = el("div", { class: "cfg-card" }, [el("h3", { text: T("acc.profileTitle") })]);
      const slot = el("div", { class: "prof-info" });
      perfil.appendChild(slot);
      p.appendChild(perfil);
      const ret = el("div", { class: "cfg-card" });
      p.appendChild(ret);
      conSnapshot(slot, (s) => {
        slot.innerHTML = "";
        const pr = s.profile;
        const fila = (k, v) => el("div", {}, [el("span", { text: T(k) }), v]);
        slot.appendChild(el("div", { class: "his-meta prof-meta" }, [
          fila("acc.created", document.createTextNode(fmtFecha(pr.createdAt))),
          fila("acc.expires", document.createTextNode(fmtFecha(pr.expiresAt))),
          fila("acc.remaining", contador("prof-countdown")),
          fila("acc.lastActivity", document.createTextNode(fmtFecha(pr.lastActivityAt)))
        ]));
        slot.appendChild(el("p", { class: "text-muted", style: "font-size: var(--fs-sm); margin: var(--space-3) 0 0;", text: T("acc.profileNote") }));
        pintarConservacion(ret, pr);
      });
    } else {
      p.appendChild(el("div", { class: "cfg-note", role: "note" }, [el("span", { "aria-hidden": "true", text: "ℹ️" }), el("div", {}, [el("p", { text: T("acc.guestNote") })])]));
    }

    // --- sesión ---
    const bSwitch = el("button", { type: "button", class: "btn btn-secondary", text: T("acc.switchBtn") });
    bSwitch.addEventListener("click", cambiarSesion);
    const bOut = el("button", { type: "button", class: "btn btn-secondary btn-danger-outline", text: T("acc.logoutBtn") });
    bOut.addEventListener("click", cerrarSesion);
    p.appendChild(el("div", { class: "cfg-actions-grid" }, [
      el("div", { class: "cfg-card" }, [el("h3", { text: T("acc.switchTitle") }), el("p", { text: T("acc.switchText") }), bSwitch]),
      el("div", { class: "cfg-card" }, [el("h3", { text: T("acc.logoutTitle") }), el("p", { text: T("acc.logoutText") }), bOut])
    ]));
  }

  function pintarConservacion(cont, pr) {
    cont.innerHTML = "";
    cont.appendChild(el("h3", { text: T("acc.retentionTitle") }));
    cont.appendChild(el("p", { text: T("acc.retentionText") }));
    const sel = el("select", { class: "cfg-select", id: "cfg-retention" }, RCProfile.DURATIONS.map((k) => { const o = el("option", { value: k, text: T("dur." + k) }); if (k === pr.durationKey) o.selected = true; return o; }));
    cont.appendChild(el("label", { for: "cfg-retention", class: "cfg-select-label" }, [T("acc.retentionLabel"), sel]));
    sel.addEventListener("change", async () => {
      const key = sel.value;
      const horas = { "1h": 1, "2h": 2, "5h": 5, "10h": 10, "12h": 12, "1d": 24, "2d": 48, "3d": 72, "4d": 96, "5d": 120 }[key];
      const nuevaExp = Date.parse(pr.createdAt) + horas * 3600e3;
      if (nuevaExp <= RCProfile.now()) {   // con ese tiempo el perfil ya habría vencido (reloj del servidor)
        const ok = await confirmar({ title: T("acc.retentionExpireTitle"), text: T("acc.retentionExpireText"), confirmText: T("acc.retentionExpireConfirm") });
        if (!ok) { sel.value = pr.durationKey; return; }
      }
      try {
        await RCProfile.setDuration(key);
        sonar("confirm"); toast(T("acc.retentionSaved"));
        renderCuenta();
      } catch (e) {
        if (e && e.status === 410) { toast(T("acc.expiredNow")); cuentaModo = "ident"; ctx.refrescar(); }
        else { sel.value = pr.durationKey; toast(RCStudent.textoError(e)); }
      }
    });
  }

  /** Editar nombre (obligatorio) y curso (opcional). Cambiar el NOMBRE crea un perfil nuevo (con confirmación). */
  function formEditar(est) {
    const iN = el("input", { type: "text", class: "student-input", id: "cfg-edit-name", autocomplete: "off", value: est.nombre, minlength: "3", maxlength: "25" });
    const iC = el("input", { type: "text", class: "student-input", id: "cfg-edit-course", autocomplete: "off", value: est.curso || "", maxlength: "20", pattern: "[0-9]+-[0-9]+", title: T("student.errCourseFormat") });
    const err = el("p", { class: "student-error", role: "alert", hidden: "" });
    const bSave = el("button", { type: "submit", class: "btn btn-primary", text: T("acc.save") });
    const bCancel = el("button", { type: "button", class: "btn btn-ghost", text: T("common.cancel") });
    const form = el("form", { class: "cfg-form", novalidate: "" }, [
      el("label", { class: "student-field", for: "cfg-edit-name" }, [
        el("span", { class: "student-field__head" }, [el("span", { class: "student-label", text: T("acc.name") }), RCStudent.contador(iN)]), iN
      ]),
      el("p", { class: "text-muted", style: "font-size: var(--fs-sm); margin: 0;", text: T("acc.renameHint") }),
      el("label", { class: "student-field", for: "cfg-edit-course" }, [el("span", { class: "student-label", text: `${T("acc.course")} ${T("student.courseHint")}` }), iC]),
      err, el("div", { class: "cfg-actions" }, [bSave, bCancel])
    ]);
    const fallo = (e) => { err.hidden = false; err.textContent = RCStudent.textoError(e); };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = RCStudent.validar(iN.value, iC.value, { nombreGuardado: RCStudent.limpiar(iN.value) === est.nombre });   // un nombre ya guardado (de antes del máximo de 25) no se rechaza si solo cambia el curso
      if (!v.ok) { err.hidden = false; err.textContent = v.error; (v.campo === "curso" ? iC : iN).focus(); return; }
      if (!RCProfile.active()) {   // modo invitado: solo esta pestaña
        RCStudent.set({ nombre: v.nombre, curso: v.curso });
        cuentaModo = "vista"; ctx.refrescar(); toast(T("acc.saved")); return;
      }
      const cambiaNombre = v.nombre !== est.nombre;
      try {
        if (cambiaNombre) {
          const ok = await confirmar({ title: T("acc.renameModalTitle"), text: T("acc.renameModalText"), confirmText: T("acc.renameConfirm") });
          if (!ok) return;                                  // cancelar conserva todo
          await RCProfile.rename(v.nombre);                 // perfil NUEVO: otro UUID, otra fecha, todo reiniciado
          if (v.curso !== (est.curso || "")) await RCProfile.setCourse(v.curso);
          cuentaModo = "vista"; ctx.refrescar(); toast(T("acc.renamed", { x: v.nombre }));
        } else {
          if (v.curso !== (est.curso || "")) await RCProfile.setCourse(v.curso);   // solo el curso: no reinicia nada
          cuentaModo = "vista"; ctx.refrescar(); toast(T("acc.saved"));
        }
      } catch (er) { fallo(er); }
    });
    bCancel.addEventListener("click", () => { cuentaModo = "vista"; renderCuenta(); });
    setTimeout(() => iN.focus(), 30);
    return form;
  }

  async function cambiarSesion() {
    const ok = await confirmar({ title: T("acc.switchModalTitle"), text: T(RCProfile.active() ? "acc.switchModalText" : "acc.switchModalGuest"), confirmText: T("acc.switchConfirm") });
    if (!ok) return;
    RCHistory.clear();
    RCStudent.clear();                     // desactiva la sesión; tema, idioma y accesibilidad no se tocan
    cuentaModo = "ident";
    ctx.refrescar();
  }
  async function cerrarSesion() {
    const ok = await confirmar({ title: T("acc.logoutModalTitle"), text: T(RCProfile.active() ? "acc.logoutModalText" : "acc.logoutModalGuest"), confirmText: T("acc.logoutBtn") });
    if (!ok) return;
    RCHistory.clear();
    RCStudent.clear();
    cuentaModo = "vista";
    ctx.refrescar();
    toast(T("acc.loggedOut"));
  }

  // ------------------------------------------------------------------ 4. ACCESIBILIDAD
  function interruptor(id, titulo, texto, activo, onToggle, extra) {
    const estado = el("span", { class: "switch__state", text: activo ? T("a11y.on") : T("a11y.off") });
    const b = el("button", { type: "button", class: "switch", id, role: "switch", "aria-checked": String(activo), "aria-labelledby": id + "-t", "aria-describedby": id + "-d", "data-sound": "none" }, [el("span", { class: "switch__knob", "aria-hidden": "true" }), estado]);
    b.addEventListener("click", () => { const nuevo = b.getAttribute("aria-checked") !== "true"; onToggle(nuevo); });
    return el("div", { class: "cfg-card a11y-row" }, [
      el("div", { class: "a11y-row__text" }, [el("h3", { id: id + "-t", text: titulo }), el("p", { id: id + "-d", text: texto }), extra || null]), b
    ]);
  }
  function renderAccesibilidad() {
    const p = $("panel-accesibilidad");
    const foco = document.activeElement && document.activeElement.id;
    p.innerHTML = "";
    p.appendChild(head("cfg.nav.a11y", "a11y.lead"));
    const a = RCA11y.get();

    const grupo = el("div", { class: "size-grid", role: "radiogroup", "aria-labelledby": "a11y-size-t" });
    RCA11y.SIZES.forEach((sz) => {
      const sel = a.size === sz;
      const b = el("button", { type: "button", class: "size-opt" + (sel ? " is-selected" : ""), role: "radio", "aria-checked": String(sel), id: "a11y-size-" + sz, "data-sound": "none" }, [
        el("span", { class: "size-opt__aa", "aria-hidden": "true", "data-size": sz, text: "Aa" }), el("span", { text: T("a11y.size." + sz) })
      ]);
      b.addEventListener("click", () => { RCA11y.set({ size: sz }); sonar("confirm"); renderAccesibilidad(); toast(T("a11y.saved")); });
      grupo.appendChild(b);
    });
    p.appendChild(el("div", { class: "cfg-card" }, [
      el("h3", { id: "a11y-size-t", text: T("a11y.sizeTitle") }), el("p", { text: T("a11y.sizeText") }), grupo,
      el("p", { class: "a11y-sample", text: T("a11y.sizeSample") })
    ]));
    p.appendChild(interruptor("a11y-contrast", T("a11y.contrastTitle"), T("a11y.contrastText"), a.contrast, (v) => { RCA11y.set({ contrast: v }); sonar("confirm"); renderAccesibilidad(); toast(T("a11y.saved")); }));
    const sistema = RCA11y.systemReducesMotion();
    p.appendChild(interruptor("a11y-motion", T("a11y.motionTitle"), T("a11y.motionText"), a.motion || sistema, (v) => { if (sistema) return; RCA11y.set({ motion: v }); renderAccesibilidad(); toast(T("a11y.saved")); }, sistema ? el("p", { class: "a11y-sys", text: T("a11y.motionSystem") }) : null));
    p.appendChild(interruptor("a11y-sound", T("a11y.soundTitle"), T("a11y.soundText"), RCSound.isEnabled(), (v) => { RCSound.setEnabled(v); if (v) sonar("confirm"); renderAccesibilidad(); toast(T("a11y.saved")); }));
    p.appendChild(el("div", { class: "cfg-note", role: "note" }, [el("span", { "aria-hidden": "true", text: "⌨️" }), el("div", {}, [el("b", { text: T("a11y.kbTitle") }), el("p", { text: T("a11y.kbText") })])]));
    const ef = foco && $(foco); if (ef) ef.focus();
  }

  // ------------------------------------------------------------------ 5. ESTADÍSTICAS PERSONALES
  const EMOJI = { quiz: "📝", crossword: "🔤", matching: "🔗", wordsearch: "🔍", situations: "🤔", memory: "🃏", roulette: "🎡" };
  function tarjetaStat(valor, etiqueta, cls) {
    return el("div", { class: "stat-card" + (cls ? " " + cls : "") }, [el("b", { text: String(valor) }), el("span", { text: etiqueta })]);
  }
  function renderEstadisticas() {
    const p = $("panel-estadisticas");
    p.innerHTML = "";
    p.appendChild(head("cfg.nav.stats", "stats.lead"));
    if (!RCProfile.active()) { sinPerfil(p, "📊", "stats.emptyTitle", "stats.emptyText"); return; }
    conSnapshot(p, (s) => {
      p.innerHTML = "";
      p.appendChild(head("cfg.nav.stats", "stats.lead"));
      const st = s.stats;
      p.appendChild(el("div", { class: "stat-grid" }, [
        tarjetaStat(st.totalActivities, T("stats.activities")),
        tarjetaStat(st.totalQuizzes, T("stats.quizzes")),
        tarjetaStat(st.totalGames, T("stats.games")),
        tarjetaStat(st.averageScore == null ? "—" : fmtNum(st.averageScore), T("stats.avg")),
        tarjetaStat(st.bestScore == null ? "—" : fmtNum(st.bestScore), T("stats.best")),
        tarjetaStat(st.correctAnswers, T("stats.correct"), "ok"),
        tarjetaStat(st.incorrectAnswers, T("stats.incorrect"), "bad"),
        tarjetaStat(fmtDuracion(st.learningSeconds), T("stats.time"))
      ]));
      // progreso general
      const barra = el("div", { class: "prog", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(st.progress), "aria-label": T("stats.progress") }, [el("span", { style: `width:${st.progress}%` })]);
      p.appendChild(el("div", { class: "cfg-card" }, [
        el("h3", { text: `${T("stats.progress")}: ${st.progress}%` }), barra,
        el("p", { class: "text-muted", style: "margin: var(--space-3) 0 0; font-size: var(--fs-sm);", text: T("stats.progressNote", { a: st.typesCompleted, b: st.typesTotal, c: st.mechanismsVisited, d: st.mechanismsTotal }) })
      ]));
      // por categoría (gráfico de barras sencillo)
      const max = Math.max(1, ...RCHistory.TIPOS.map((t) => st.byCategory[t] || 0));
      const lista = el("ul", { class: "cat-bars" }, RCHistory.TIPOS.map((t) => {
        const n = st.byCategory[t] || 0;
        return el("li", {}, [
          el("span", { class: "cat-bars__name" }, [el("span", { "aria-hidden": "true", text: EMOJI[t] + " " }), T("act." + t)]),
          el("span", { class: "cat-bars__bar", "aria-hidden": "true" }, [el("i", { style: `width:${(n / max) * 100}%` })]),
          el("b", { text: String(n) })
        ]);
      }));
      p.appendChild(el("div", { class: "cfg-card" }, [el("h3", { text: T("stats.byCat") }), st.totalActivities ? lista : el("p", { class: "text-muted", text: T("stats.catEmpty") })]));
      // perfil
      p.appendChild(el("div", { class: "cfg-card" }, [el("div", { class: "his-meta prof-meta" }, [
        el("div", {}, [el("span", { text: T("stats.created") }), document.createTextNode(fmtFecha(s.profile.createdAt))]),
        el("div", {}, [el("span", { text: T("stats.remaining") }), contador("prof-countdown")])
      ])]));
    });
  }

  // ------------------------------------------------------------------ 6. LOGROS
  function renderLogros() {
    const p = $("panel-logros");
    p.innerHTML = "";
    p.appendChild(head("cfg.nav.ach", "ach.lead"));
    if (!RCProfile.active()) { sinPerfil(p, "🏆", "ach.emptyTitle", "ach.emptyText"); return; }
    conSnapshot(p, (s) => {
      p.innerHTML = "";
      p.appendChild(head("cfg.nav.ach", "ach.lead"));
      const total = s.achievements.length, got = s.achievements.filter((a) => a.unlocked).length;
      p.appendChild(el("p", { class: "ach-counter", role: "status", text: T("ach.counter", { a: got, b: total }) }));
      p.appendChild(el("ul", { class: "ach-grid" }, s.achievements.map((a) => {
        const emoji = RCProfile.ACH_ICONS[a.key] || a.icon || "🏆";
        return el("li", { class: "ach-card" + (a.unlocked ? " is-unlocked" : " is-locked") }, [
          el("span", { class: "ach-card__icon", "aria-hidden": "true", text: emoji }),
          el("div", { class: "ach-card__body" }, [
            el("h3", { text: T("ach." + a.key + ".name") }),
            el("p", { text: T("ach." + a.key + ".desc") }),
            el("p", { class: "ach-card__cond" }, [el("span", { text: T("ach.condition") + ": " }), document.createTextNode(T("ach." + a.key + ".cond"))]),
            el("p", { class: "ach-card__state" }, [el("b", { text: a.unlocked ? T("ach.unlockedLbl") : T("ach.locked") }), a.unlocked ? document.createTextNode(" · " + T("ach.unlockedOn", { d: fmtFecha(a.unlockedAt) })) : null])
          ])
        ]);
      })));
    });
  }

  // ------------------------------------------------------------------ 8. PRIVACIDAD Y ELIMINACIÓN DE DATOS
  function renderPrivacidad() {
    const p = $("panel-privacidad");
    p.innerHTML = "";
    p.appendChild(head("cfg.nav.privacy", "priv.lead"));
    for (let i = 1; i <= 6; i++) p.appendChild(el("div", { class: "cfg-card priv-q" }, [el("h3", { text: T("priv.q" + i) }), el("p", { text: T("priv.a" + i) })]));
    p.appendChild(el("div", { class: "cfg-note cfg-note--warn", role: "note" }, [el("span", { "aria-hidden": "true", text: "⚠️" }), el("div", {}, [el("b", { text: T("priv.noticeTitle") }), el("p", { text: T("priv.n1") }), el("p", { text: T("priv.n2") }), el("p", { text: T("priv.n3") })])]));

    const hay = RCProfile.active();
    const bH = el("button", { type: "button", class: "btn btn-secondary btn-danger-outline", text: T("priv.delHistBtn") });
    const bA = el("button", { type: "button", class: "btn btn-secondary btn-danger-outline", text: T("priv.delAllBtn") });
    if (!hay) { bH.disabled = true; bA.disabled = true; }
    bH.addEventListener("click", eliminarHistorial);
    bA.addEventListener("click", eliminarTodo);
    p.appendChild(el("h3", { class: "priv-admin-title", text: T("priv.adminTitle") }));
    p.appendChild(el("div", { class: "cfg-actions-grid" }, [
      el("div", { class: "cfg-card" }, [el("h3", { text: T("priv.delHistTitle") }), el("p", { text: T("priv.delHistText") }), bH]),
      el("div", { class: "cfg-card" }, [el("h3", { text: T("priv.delAllTitle") }), el("p", { text: T("priv.delAllText") }), bA])
    ]));
    if (!hay) p.appendChild(el("p", { class: "text-muted", text: T("priv.needProfile") }));
  }
  async function eliminarHistorial() {
    const ok = await confirmar({ title: T("priv.delHistModalTitle"), text: T("priv.delHistModalText"), confirmText: T("priv.delHistConfirm") });
    if (!ok) return;
    try { await RCProfile.deleteHistory(); ctx.refrescar(); toast(T("priv.delHistDone")); }
    catch (e) { toast(RCStudent.textoError(e)); ctx.refrescar(); }
  }
  async function eliminarTodo() {
    const ok = await confirmar({ title: T("priv.delAllModalTitle"), text: T("priv.delAllModalText"), confirmText: T("priv.delAllConfirm") });
    if (!ok) return;
    try {
      await RCProfile.deleteAll();           // borra todo en el servidor y la referencia local
      RCHistory.clear(); RCStudent.clear();
      cuentaModo = "ident";
      location.hash = "cuenta"; ctx.refrescar();   // vuelve a la pantalla de identificación
      toast(T("priv.delAllDone"));
    } catch (e) { toast(RCStudent.textoError(e)); }
  }

  return { renderCuenta, renderAccesibilidad, renderEstadisticas, renderLogros, renderPrivacidad, setModo, fmtFecha };
};
