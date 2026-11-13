/**
 * js/situations/situaciones.js
 * Controlador de «¿Qué harías en esta situación?».
 * Flujo: introducción → modo → [identificación | configuración] → juego → resultados.
 * Al terminar, el alumno identificado deja la actividad en su historial (js/history.js).
 */
(function initSituaciones() {
  if (!document.getElementById("situaciones-shell")) return;
  const { $, T, pillGroup, showStage } = RCMini;

  const CANTIDAD_ALUMNO = 10;
  const CANTIDADES = [5, 10, 15];
  const TIEMPOS = [0, 300, 600, 900];

  let rol = null;
  let config = { cantidad: CANTIDAD_ALUMNO, tiempoSegundos: 0 };
  let partida = null, reloj = null;

  const sess = RCGame.session({ name: "situaciones", onDiscard: descartarPartida });
  const els = { timer: $("mg-timer"), progreso: $("mg-progreso"), puntaje: $("mg-puntaje"), rol: $("mg-role-badge"), panel: $("mg-teacher-panel"), area: $("mg-playarea"), veil: $("mg-pause-veil"), pregunta: $("sit-pregunta") };

  function renderConfig() {
    pillGroup($("mg-config-cantidad"), CANTIDADES.map((n) => ({ label: T("sit.n", { n }), value: n })), config.cantidad, (v) => { config.cantidad = v; });
    pillGroup($("mg-config-tiempo"), TIEMPOS.map((s) => ({ label: s ? T("mg.min", { n: s / 60 }) : T("mg.noLimit"), value: s })), config.tiempoSegundos, (v) => { config.tiempoSegundos = v; });
  }

  function pintarReloj(info) {
    els.timer.textContent = `⏱️ ${RCGame.formatTime(info.shown)}`;
    els.timer.classList.toggle("is-warning", !info.unlimited && info.remaining <= 120 && info.remaining > 30);
    els.timer.classList.toggle("is-critical", !info.unlimited && info.remaining <= 30);
  }
  function pintarStats() {
    els.progreso.textContent = T("sit.progress", { i: Math.min(partida.indice + 1, partida.total), n: partida.total });
    els.puntaje.textContent = T("mg.hits", { n: partida.aciertos });
  }

  function mostrarSituacion() {
    pintarStats();
    const q = partida.preguntas[partida.indice];
    const ultima = partida.indice === partida.total - 1;
    RCMini.renderPregunta(els.pregunta, q, {
      etiqueta: T("sit.tag", { i: partida.indice + 1, n: partida.total }),
      textoSiguiente: ultima ? T("mg.seeResults") : T("sit.next"),
      onAnswer: (ok, info) => {
        partida.respondidas++;
        if (ok) partida.aciertos++;
        else partida.errores.push({ texto: RCMini.recortar(q.situacion), detalle: T("mg.correctIs", { a: info.correctaTexto }) });
        partida.detalle.push({ pregunta: `${q.situacion} ${q.pregunta}`, elegida: info.elegidaTexto, correcta: info.correctaTexto, ok, explicacion: q.explicacion });
        pintarStats();
      },
      onNext: () => {
        if (partida.indice >= partida.total - 1) { finalizar("completo"); return; }
        partida.indice++;
        mostrarSituacion();
        window.scrollTo(0, 0);
      }
    });
  }

  function iniciarPartida() {
    if (rol === "alumno" && !RCStudent.get()) { rol = null; showStage("role"); return; }
    const total = Math.min(rol === "maestro" ? config.cantidad : CANTIDAD_ALUMNO, SITUACIONES.length);
    sess.start();
    partida = { total, preguntas: RCMini.sample(SITUACIONES, total), indice: 0, aciertos: 0, respondidas: 0, errores: [], detalle: [], terminada: false };
    els.rol.textContent = rol === "maestro" ? T("mg.roleTeacher") : T("mg.roleStudent");
    RCMini.setPausa(els.area, els.veil, false);
    sess.listen($("mg-btn-salir"), "click", () => sess.requestExit());
    RCMini.panelMaestro(els.panel, sess, {
      rol,
      onPausa: (p) => { if (p) reloj.pause(); else reloj.resume(); RCMini.setPausa(els.area, els.veil, p); },
      onTerminar: () => finalizar("maestro")
    });
    reloj = RCGame.clock({ session: sess, limitSeconds: rol === "maestro" ? config.tiempoSegundos : 0, onTick: pintarReloj, onEnd: () => finalizar("tiempo") });
    mostrarSituacion();
    reloj.start();
    showStage("game");
  }

  function finalizar(motivo) {
    if (!partida || partida.terminada) return;
    partida.terminada = true;
    if (reloj) reloj.stop();
    const seg = reloj ? reloj.info().elapsed : 0;
    const { aciertos, total, respondidas, errores, detalle } = partida;
    sess.end();
    RCSound.stopAll();
    RCSound.play("complete");
    const nota = calcularCalificacion(aciertos, total);
    if (rol === "alumno") RCHistory.record({ tipo: "situations", nota, correctas: aciertos, incorrectas: respondidas - aciertos, total, tiempoSeg: seg, detalle });
    const v = RCMini.valoracion(nota);
    RCMini.mostrarResultado({
      rol, badge: v.badge, titulo: v.titulo,
      nota: motivo === "tiempo" ? T("sit.noteTime") : motivo === "maestro" ? T("sit.noteTeacher") : T("sit.noteDone"),
      stats: [
        { valor: nota.toFixed(1), etiqueta: T("mg.grade") },
        { valor: `${aciertos} / ${total}`, etiqueta: T("mg.hitsLabel") },
        { valor: `${respondidas} / ${total}`, etiqueta: T("mg.answered") },
        { valor: RCGame.formatTime(seg), etiqueta: T("mg.timeLabel") }
      ],
      repaso: { titulo: T("mg.review"), items: errores }
    });
  }

  function descartarPartida() {
    if (reloj) reloj.stop();
    reloj = null; partida = null; rol = null;
    config = { cantidad: CANTIDAD_ALUMNO, tiempoSegundos: 0 };
    els.pregunta.innerHTML = ""; els.panel.innerHTML = ""; els.panel.hidden = true; els.veil.hidden = true; els.area.inert = false;
    showStage("role");
  }

  RCMini.bindFlow({ getRol: () => rol, setRol: (r) => { rol = r; }, renderConfig, iniciar: iniciarPartida });
})();
