/**
 * js/student.js
 * Identificación del alumno (nombre completo + curso opcional).
 *
 *  - Se pide UNA vez, al elegir «Alumno». Al identificarse se crea un PERFIL TEMPORAL en el
 *    servidor (js/profile.js, base de datos SQL) que se recupera desde el mismo navegador,
 *    incluso tras cerrar sesión o el navegador. No hay contraseñas: no es una cuenta privada.
 *  - RCStudent.get() sigue siendo SÍNCRONO (los juegos lo leen sin esperar): usa la copia
 *    mínima del perfil activo (nombre y curso).
 *  - Modo invitado (solo si el servidor no responde, p. ej. al abrir el archivo directamente):
 *    el alumno puede continuar sin guardar progreso; sus datos viven solo en esta pestaña
 *    (sessionStorage) como antes.
 *  - Los datos se escriben siempre con textContent (nunca como HTML).
 *
 * API (window.RCStudent):
 *   get() / set({nombre,curso}) / clear() / onChange(fn)
 *   validar(nombre, curso) → { ok, nombre, curso, error }
 *   requerir({ mount, mostrar, volver, continuar })  pide los datos si faltan
 *   pintarResultado(el, rol)   muestra la tarjeta del alumno en los resultados
 *   pintarNotas()              actualiza los avisos «Sesión de …» (data-student-note)
 */
const RCStudent = (() => {
  const KEY = "rc-student";
  const MIN_NOMBRE = 3;
  const MAX_NOMBRE = 25;
  const MAX_CURSO = 20;
  let memoria = null;
  const oyentes = new Set();
  const T = (k, p) => (window.RCI18n ? window.RCI18n.t(k, p) : k);   // textos en el idioma elegido (js/i18n)

  /** Quita espacios al inicio y al final y junta los espacios repetidos. */
  const limpiar = (s) => String(s == null ? "" : s).replace(/\s+/g, " ").trim();

  /** opts.nombreGuardado = true: el nombre es el que el perfil ya tenía (creado cuando el máximo era 40);
   *  no se rechaza por largo para poder seguir editando solo el curso. Un nombre nuevo siempre cumple el máximo. */
  function validar(nombre, curso, opts) {
    const n = limpiar(nombre);
    const c = limpiar(curso);
    if (!n) return { ok: false, error: T("student.errName"), campo: "nombre" };
    if (n.length < MIN_NOMBRE) return { ok: false, error: T("student.errNameShort", { n: MIN_NOMBRE }), campo: "nombre" };
    if (n.length > MAX_NOMBRE && !(opts && opts.nombreGuardado)) return { ok: false, error: T("student.errNameLong", { n: MAX_NOMBRE }), campo: "nombre" };
    if (c.length > MAX_CURSO) return { ok: false, error: T("student.errCourseLong", { n: MAX_CURSO }), campo: "curso" };
    if (c && !/^\d+-\d+$/.test(c)) return { ok: false, error: T("student.errCourseFormat"), campo: "curso" };
    return { ok: true, nombre: n, curso: c };
  }

  function get() {
    const perfil = window.RCProfile && window.RCProfile.current();
    if (perfil) return { nombre: perfil.nombre, curso: perfil.curso };
    try {
      const raw = window.sessionStorage.getItem(KEY);
      if (raw) {
        const o = JSON.parse(raw);
        const v = validar(o && o.nombre, o && o.curso);   // se revalida lo leído
        if (v.ok) return { nombre: v.nombre, curso: v.curso };
      }
    } catch (_) { /* sin almacenamiento o dato dañado: se usa memoria */ }
    return memoria;
  }

  function set({ nombre, curso }) {
    const v = validar(nombre, curso);
    if (!v.ok) return false;
    memoria = { nombre: v.nombre, curso: v.curso };
    try { window.sessionStorage.setItem(KEY, JSON.stringify(memoria)); } catch (_) { /* queda en memoria */ }
    avisar();
    return true;
  }

  /** Cerrar la sesión del alumno: el perfil NO se elimina (se puede recuperar desde este navegador). */
  function clear() {
    if (window.RCProfile) window.RCProfile.logout();
    memoria = null;
    try { window.sessionStorage.removeItem(KEY); } catch (_) { /* nada */ }
    avisar();
  }

  function avisar() {
    pintarNotas();
    oyentes.forEach((fn) => { try { fn(get()); } catch (_) { /* un oyente roto no afecta a los demás */ } });
  }
  const onChange = (fn) => { oyentes.add(fn); return () => oyentes.delete(fn); };

  /** Texto plano para copiar: «Nombre (Curso 11-2)». */
  function etiqueta(est) {
    return est ? (est.curso ? `${est.nombre} (${T("student.courseInline", { c: est.curso })})` : est.nombre) : "";
  }

  // ------------------------------------------------------------------
  // Formulario de identificación
  // ------------------------------------------------------------------
  function el(tag, attrs = {}, hijos = []) {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else n.setAttribute(k, v);
    });
    hijos.forEach((h) => n.appendChild(typeof h === "string" ? document.createTextNode(h) : h));
    return n;
  }

  /**
   * Contador de caracteres restantes de un campo con maxlength. Devuelve el <span> (aria-hidden: el número suelto
   * no se anuncia en cada tecla; el límite lo aplica maxlength y se valida al enviar). Muestra maxlength − longitud
   * (nunca menos de 0). Al ESCRIBIR recorta cualquier exceso (pegado, autocompletado, IME); al cargar un valor no lo
   * toca, para no alterar en silencio un nombre guardado antes del límite de 25.
   */
  function contador(input) {
    const max = input.maxLength;
    const span = el("span", { class: "student-counter", "aria-hidden": "true" });
    const actualizar = (e) => {
      if (e && e.type === "input" && !e.isComposing && input.value.length > max) input.value = input.value.slice(0, max);
      const quedan = Math.max(0, max - input.value.length);
      span.textContent = String(quedan);
      span.title = T("student.charsLeft", { n: quedan });
      span.classList.toggle("is-low", quedan <= 5);
    };
    input.addEventListener("input", actualizar);
    span.actualizar = actualizar;
    actualizar();
    return span;
  }

  const locale = () => { try { return window.RCI18n.locked() ? "es-CO" : window.RCI18n.byCode(window.RCI18n.get()).locale; } catch (_) { return undefined; } };
  /** Fecha y hora en la zona horaria LOCAL del estudiante (el servidor guarda UTC). */
  function fmtFecha(iso) {
    try { return new Intl.DateTimeFormat(locale(), { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)); } catch (_) { return iso; }
  }
  function textoError(err) {
    if (err && err.offline) return T("student.errOffline");
    switch (err && err.code) {
      case "invalid_name": return T("student.errName");
      case "name_too_short": return T("student.errNameShort", { n: MIN_NOMBRE });
      case "name_too_long": return T("student.errNameLong", { n: MAX_NOMBRE });
      case "invalid_course_format": return T("student.errCourseFormat");
      case "course_too_long": return T("student.errCourseLong", { n: MAX_CURSO });
      case "rate_limited": return T("student.errRate");
      default: return T("student.errServer");
    }
  }

  function montarFormulario(mount, { onSubmit, onBack, volverTexto }) {
    mount.innerHTML = "";
    const cabecera = el("div", { class: "section-head", style: "margin-bottom: var(--space-6);" }, [
      el("span", { class: "eyebrow", text: T("student.mode") }),
      el("h1", { id: "student-title", tabindex: "-1", text: T("student.who") }),
      el("p", { class: "text-muted", text: T("student.intro") })
    ]);

    const inpNombre = el("input", {
      id: "student-nombre", name: "nombre", type: "text", autocomplete: "name", minlength: String(MIN_NOMBRE), maxlength: String(MAX_NOMBRE),
      placeholder: T("student.namePh"), required: "", "aria-required": "true", "aria-describedby": "student-error"
    });
    const inpCurso = el("input", {
      id: "student-curso", name: "curso", type: "text", autocomplete: "off", maxlength: String(MAX_CURSO),
      placeholder: T("student.coursePh"), inputmode: "text", pattern: "[0-9]+-[0-9]+", title: T("student.errCourseFormat")
    });
    const error = el("p", { id: "student-error", class: "student-error", role: "alert", hidden: "" });

    const contNombre = contador(inpNombre);
    const campoNombre = el("div", { class: "student-field" }, [
      el("div", { class: "student-field__head" }, [
        el("label", { for: "student-nombre" }, [T("student.name") + " ", el("span", { class: "student-req", "aria-hidden": "true", text: "*" })]),
        contNombre
      ]),
      inpNombre
    ]);
    const campoCurso = el("div", { class: "student-field" }, [
      el("label", { for: "student-curso" }, [T("student.course") + " ", el("span", { class: "student-opt", text: T("student.courseHint") })]),
      inpCurso
    ]);

    const btnVolver = el("button", { type: "button", class: "btn btn-ghost", "data-sound": "click", text: volverTexto || T("student.changeMode") });
    const btnSeguir = el("button", { type: "submit", class: "btn btn-primary btn-lg", "data-sound": "none", text: T("student.continue") });
    const btnInvitado = el("button", { type: "button", class: "btn btn-secondary", "data-sound": "click", hidden: "", text: T("student.guestBtn") });
    const form = el("form", { class: "config-card student-form", novalidate: "", autocomplete: "on" }, [
      campoNombre, campoCurso, error,
      el("div", { class: "config-launch" }, [btnVolver, btnInvitado, btnSeguir]),
      el("p", { class: "student-privacy text-muted", text: T("student.privacy") })
    ]);

    // Perfil guardado en este navegador (sesión cerrada): se puede continuar con él.
    const rec = window.RCProfile && window.RCProfile.recoverable();
    let tarjeta = null;
    if (rec) {
      const bCont = el("button", { type: "button", class: "btn btn-primary", "data-sound": "none", text: T("student.recoverBtn", { x: rec.nombre }) });
      const errRec = el("p", { class: "student-error", role: "alert", hidden: "" });
      tarjeta = el("div", { class: "config-card student-recover", role: "group", "aria-labelledby": "student-recover-title" }, [
        el("h2", { id: "student-recover-title", class: "student-recover__title", text: T("student.recoverTitle") }),
        el("p", { text: T("student.recoverText", { x: rec.nombre, d: fmtFecha(rec.expiresAt) }) }),
        errRec, bCont,
        el("p", { class: "text-muted student-recover__or", text: T("student.recoverOr") })
      ]);
      bCont.addEventListener("click", async () => {
        bCont.disabled = true; errRec.hidden = true;
        try { await window.RCProfile.resume(); if (window.RCSound) window.RCSound.play("confirm"); onSubmit(get()); }
        catch (err) { bCont.disabled = false; errRec.textContent = err && err.offline ? T("student.errOffline") : T("student.recoverFail"); errRec.hidden = false; if (!(err && err.offline)) setTimeout(() => { if (tarjeta) tarjeta.remove(); }, 2500); }
      });
    }
    mount.append(cabecera);
    if (tarjeta) mount.append(tarjeta);
    mount.append(form);

    const previo = get();
    if (previo) { inpNombre.value = previo.nombre; inpCurso.value = previo.curso; contNombre.actualizar(); }

    function mostrarError(v) {
      error.textContent = v.error;
      error.hidden = false;
      inpNombre.setAttribute("aria-invalid", String(v.campo === "nombre"));
      inpCurso.setAttribute("aria-invalid", String(v.campo === "curso"));
      (v.campo === "curso" ? inpCurso : inpNombre).focus();
      if (window.RCSound) RCSound.play("incorrect");
    }
    // El mensaje desaparece en cuanto la persona vuelve a escribir
    [inpNombre, inpCurso].forEach((i) => i.addEventListener("input", () => {
      error.hidden = true; inpNombre.removeAttribute("aria-invalid"); inpCurso.removeAttribute("aria-invalid");
    }));

    let enviando = false;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (enviando) return;
      const v = validar(inpNombre.value, inpCurso.value);
      if (!v.ok) { mostrarError(v); return; }
      inpNombre.value = v.nombre;                 // se muestra ya limpio
      inpCurso.value = v.curso;
      enviando = true; btnSeguir.disabled = true; btnSeguir.setAttribute("aria-busy", "true"); btnInvitado.hidden = true;
      try {
        await window.RCProfile.create({ nombre: v.nombre, curso: v.curso });   // el servidor crea el perfil y su fecha
        memoria = null; try { window.sessionStorage.removeItem(KEY); } catch (_) { /* nada */ }   // ya no hay modo invitado
        avisar();
        if (window.RCSound) window.RCSound.play("confirm");
        onSubmit(get());
      } catch (err) {
        mostrarError({ error: textoError(err), campo: err && ["course_too_long", "invalid_course_format"].includes(err.code) ? "curso" : "nombre" });
        if (err && err.offline) btnInvitado.hidden = false;
      } finally { enviando = false; btnSeguir.disabled = false; btnSeguir.removeAttribute("aria-busy"); }
    });
    btnInvitado.addEventListener("click", () => {
      const v = validar(inpNombre.value, inpCurso.value);
      if (!v.ok) { mostrarError(v); return; }
      set({ nombre: v.nombre, curso: v.curso });   // solo en esta pestaña, sin guardar progreso
      onSubmit(get());
    });
    btnVolver.addEventListener("click", () => onBack());
    return { enfocar: () => inpNombre.focus({ preventScroll: true }) };
  }

  /**
   * Si el alumno ya se identificó en esta sesión, continúa directamente;
   * si no, muestra la pantalla de identificación y continúa al enviarla.
   * opts = { mount, mostrar(), volver(), continuar() }
   */
  function requerir({ mount, mostrar, volver, continuar, volverTexto }) {
    if (get()) { continuar(); return; }
    const f = montarFormulario(mount, { onSubmit: () => continuar(), onBack: volver, volverTexto });
    mostrar();
    setTimeout(() => f.enfocar(), 30);
  }

  // ------------------------------------------------------------------
  // Resultados y avisos
  // ------------------------------------------------------------------
  /** Tarjeta con el nombre y el curso en la pantalla de resultados (solo rol alumno). */
  function pintarResultado(contenedor, rol) {
    if (!contenedor) return;
    const est = rol === "alumno" ? get() : null;
    contenedor.innerHTML = "";
    contenedor.hidden = !est;
    if (!est) return;
    contenedor.appendChild(el("span", { class: "student-card__icon", "aria-hidden": "true", text: "🎓" }));
    const cuerpo = el("div", { class: "student-card__body" }, [
      el("span", { class: "student-card__label", text: T("student.label") }),
      el("b", { class: "student-card__name", text: est.nombre })
    ]);
    if (est.curso) cuerpo.appendChild(el("span", { class: "student-card__course", text: T("student.courseLine", { c: est.curso }) }));
    contenedor.appendChild(cuerpo);
  }

  /** Aviso en la pantalla de modos: «Sesión de X · Cambiar alumno». */
  function pintarNotas() {
    const est = get();
    document.querySelectorAll("[data-student-note]").forEach((nota) => {
      nota.innerHTML = "";
      nota.hidden = !est;
      if (!est) return;
      nota.appendChild(document.createTextNode(T("student.sessionOf")));
      nota.appendChild(el("b", { text: etiqueta(est) }));
      nota.appendChild(document.createTextNode(" · "));
      nota.appendChild(el("button", { type: "button", class: "student-change", "data-student-change": "", "data-sound": "click", text: T("student.changeStudent") }));
    });
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest && e.target.closest("[data-student-change]")) clear();
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pintarNotas);
  else pintarNotas();

  if (window.RCProfile) window.RCProfile.onChange(() => avisar());   // el perfil venció, se eliminó o se recuperó

  return { get, set, clear, onChange, validar, etiqueta, requerir, montarFormulario, pintarResultado, pintarNotas, limpiar, fmtFecha, textoError, contador, esInvitado: () => !(window.RCProfile && window.RCProfile.active()) && !!get() };
})();

window.RCStudent = RCStudent;
