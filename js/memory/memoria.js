/**
 * js/memory/memoria.js
 * Controlador de «Memoria de conceptos».
 * Este juego NO tiene calificación numérica: su objetivo es aprender. Al
 * final muestra estadísticas de aprendizaje (parejas, intentos, tiempo) y el
 * repaso de los conceptos con sus definiciones. En el historial queda como
 * actividad completada, con esas estadísticas y sin nota.
 */
(function initMemoria() {
  if (!document.getElementById("memoria-shell")) return;
  const { $, T, el, pillGroup, showStage, sonar } = RCMini;

  const PAREJAS_ALUMNO = 6;
  const PAREJAS = [6, 8, 10];
  const TIEMPOS = [0, 300, 600, 900];
  const OCULTAR_MS = 1100;

  let rol = null;
  let config = { parejas: PAREJAS_ALUMNO, tiempoSegundos: 0 };
  let partida = null, reloj = null, ultimoConjunto = "";

  const sess = RCGame.session({ name: "memoria", onDiscard: descartarPartida });
  const els = { board: $("mem-board"), timer: $("mg-timer"), progreso: $("mg-progreso"), intentos: $("mg-intentos"), rol: $("mg-role-badge"), panel: $("mg-teacher-panel"), area: $("mg-playarea"), veil: $("mg-pause-veil"), estado: $("mem-status") };
  const decir = (t) => { els.estado.textContent = t; };

  function renderConfig() {
    pillGroup($("mg-config-cantidad"), PAREJAS.map((n) => ({ label: T("mem.n", { n }), value: n })), config.parejas, (v) => { config.parejas = v; });
    pillGroup($("mg-config-tiempo"), TIEMPOS.map((s) => ({ label: s ? T("mg.min", { n: s / 60 }) : T("mg.noLimit"), value: s })), config.tiempoSegundos, (v) => { config.tiempoSegundos = v; });
  }

  function pintarReloj(info) {
    els.timer.textContent = `⏱️ ${RCGame.formatTime(info.shown)}`;
    els.timer.classList.toggle("is-warning", !info.unlimited && info.remaining <= 120 && info.remaining > 30);
    els.timer.classList.toggle("is-critical", !info.unlimited && info.remaining <= 30);
  }
  function pintarStats() {
    els.progreso.textContent = T("mem.pairs", { f: partida.encontradas, n: partida.total });
    els.intentos.textContent = T("mem.attempts", { n: partida.intentos });
  }

  /** Elige un conjunto distinto del anterior (si el banco lo permite). */
  function elegirParejas(n) {
    let pares;
    for (let i = 0; i < 8; i++) {
      pares = RCMini.sample(MEMORIA_PARES, n);
      const firma = pares.map((p) => p.id).sort().join("|");
      if (firma !== ultimoConjunto || n >= MEMORIA_PARES.length) { ultimoConjunto = firma; break; }
    }
    return pares;
  }

  function etiquetaCarta(c, arriba) {
    if (!arriba) return T("mem.cardDown", { n: c.n });
    return c.tipo === "concepto" ? T("mem.concept", { x: c.texto }) : T("mem.definition", { x: c.texto });
  }

  function construirTablero(cartas) {
    els.board.innerHTML = "";
    cartas.forEach((c) => {
      const back = el("span", { class: "mem-face mem-face--back", "aria-hidden": "true", text: "?" });
      const front = el("span", { class: "mem-face mem-face--front", text: c.texto });
      const btn = el("button", {
        type: "button", class: `mem-card mem-card--${c.tipo === "concepto" ? "concept" : "def"}`,
        "data-i": String(c.n - 1), "data-sound": "none", "aria-label": etiquetaCarta(c, false)
      }, [el("span", { class: "mem-card__inner" }, [back, front])]);
      c.el = btn;
      els.board.appendChild(btn);
    });
  }

  function voltear(c, arriba) {
    c.arriba = arriba;
    c.el.classList.toggle("is-up", arriba);
    c.el.setAttribute("aria-label", etiquetaCarta(c, arriba));
  }

  function alPulsar(e) {
    const btn = e.target.closest(".mem-card");
    if (!btn || !partida || partida.terminada) return;
    const c = partida.cartas[Number(btn.dataset.i)];
    if (partida.bloqueo || c.arriba || c.hecha) return;
    voltear(c, true);
    sonar("pick");
    if (!partida.primera) { partida.primera = c; decir(T("mem.hintSecond")); return; }
    const a = partida.primera, b = c;
    partida.primera = null;
    partida.intentos++;
    if (a.key === b.key) {
      a.hecha = b.hecha = true;
      a.el.classList.add("is-matched"); b.el.classList.add("is-matched");
      partida.encontradas++;
      partida.halladas.add(a.key);
      sonar("match");
      decir(T("mem.hintMatch", { x: a.tipo === "concepto" ? a.texto : b.texto }));
      pintarStats();
      if (partida.encontradas === partida.total) sess.timeout(() => finalizar("completo"), 450);
    } else {
      partida.bloqueo = true;
      sonar("unmatch");
      a.el.classList.add("is-wrong"); b.el.classList.add("is-wrong");
      decir(T("mem.hintMiss"));
      pintarStats();
      sess.timeout(() => {
        a.el.classList.remove("is-wrong"); b.el.classList.remove("is-wrong");
        voltear(a, false); voltear(b, false);
        partida.bloqueo = false;
      }, OCULTAR_MS);
    }
  }

  function iniciarPartida() {
    if (rol === "alumno" && !RCStudent.get()) { rol = null; showStage("role"); return; }
    const n = Math.min(rol === "maestro" ? config.parejas : PAREJAS_ALUMNO, MEMORIA_PARES.length);
    sess.start();
    const pares = elegirParejas(n);
    const cartas = RCMini.shuffle(pares.flatMap((p) => [
      { key: p.id, tipo: "concepto", texto: p.concepto },
      { key: p.id, tipo: "definicion", texto: p.definicion }
    ])).map((c, i) => ({ ...c, n: i + 1, arriba: false, hecha: false }));
    partida = { total: n, pares, cartas, primera: null, bloqueo: false, intentos: 0, encontradas: 0, halladas: new Set(), terminada: false };
    construirTablero(cartas);
    pintarStats();
    decir(T("mem.hintStart"));
    els.rol.textContent = rol === "maestro" ? T("mg.roleTeacher") : T("mg.roleStudent");
    RCMini.setPausa(els.area, els.veil, false);
    sess.listen(els.board, "click", alPulsar);
    sess.listen($("mg-btn-salir"), "click", () => sess.requestExit());
    RCMini.panelMaestro(els.panel, sess, {
      rol, finishKey: "mg.finishEnd",
      onPausa: (p) => { if (p) reloj.pause(); else reloj.resume(); RCMini.setPausa(els.area, els.veil, p); },
      onTerminar: () => finalizar("maestro")
    });
    reloj = RCGame.clock({ session: sess, limitSeconds: rol === "maestro" ? config.tiempoSegundos : 0, onTick: pintarReloj, onEnd: () => finalizar("tiempo") });
    reloj.start();
    showStage("game");
  }

  function finalizar(motivo) {
    if (!partida || partida.terminada) return;
    partida.terminada = true;
    if (reloj) reloj.stop();
    const seg = reloj ? reloj.info().elapsed : 0;
    const { total, encontradas, intentos, pares, halladas } = partida;
    sess.end();
    RCSound.stopAll();
    RCSound.play("complete");

    // Sin calificación: solo estadísticas de aprendizaje.
    if (rol === "alumno") {
      RCHistory.record({
        tipo: "memory", nota: null, correctas: 0, incorrectas: 0, total, tiempoSeg: seg,
        memoria: { parejas: encontradas, total, intentos, conceptos: pares.map((p) => ({ concepto: p.concepto, definicion: p.definicion, encontrada: halladas.has(p.id) })) }
      });
    }
    const completo = motivo === "completo";
    RCMini.mostrarResultado({
      rol, badge: completo ? "🧠" : "📚",
      titulo: completo ? T("mem.resDone") : T("mem.resEnded"),
      nota: completo ? T("mem.resDoneSub") : `${motivo === "tiempo" ? T("mem.noteTime") : T("mem.noteTeacher")} ${T("mem.resSub", { f: encontradas, n: total })}`,
      progreso: Math.round((encontradas / total) * 100),
      stats: [
        { valor: `${encontradas}`, etiqueta: T("mem.statPairs") },
        { valor: `${total}`, etiqueta: T("mem.statTotal") },
        { valor: `${intentos}`, etiqueta: T("mem.statAttempts") },
        { valor: RCGame.formatTime(seg), etiqueta: T("mem.statTime") }
      ],
      repaso: { titulo: T("mem.learned"), items: pares.map((p) => ({ texto: p.concepto, detalle: halladas.has(p.id) ? p.definicion : `${p.definicion} (${T("mem.notFound")})`, ok: halladas.has(p.id) })) }
    });
  }

  function descartarPartida() {
    if (reloj) reloj.stop();
    reloj = null; partida = null; rol = null;
    config = { parejas: PAREJAS_ALUMNO, tiempoSegundos: 0 };
    els.board.innerHTML = ""; els.panel.innerHTML = ""; els.panel.hidden = true; els.veil.hidden = true; els.area.inert = false;
    showStage("role");
  }

  RCMini.bindFlow({ getRol: () => rol, setRol: (r) => { rol = r; }, renderConfig, iniciar: iniciarPartida });
})();
