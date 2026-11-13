/**
 * js/roulette/ruleta.js
 * Controlador de la «Ruleta de preguntas».
 * El ángulo final se sortea al azar y la categoría sale de dónde se detiene
 * la ruleta. Cada categoría tiene su propia «bolsa» barajada: no se repiten
 * preguntas en una partida mientras queden disponibles en esa categoría.
 */
(function initRuleta() {
  if (!document.getElementById("ruleta-shell")) return;
  const { $, T, pillGroup, showStage, sonar } = RCMini;

  const GIROS_ALUMNO = 10;
  const GIROS = [5, 10, 15];
  const TIEMPOS = [0, 300, 600, 900];
  const SVG_NS = "http://www.w3.org/2000/svg";
  const CATS = RULETA_CATEGORIAS;
  const ANG = 360 / CATS.length;
  const reducido = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let rol = null;
  let config = { giros: GIROS_ALUMNO, tiempoSegundos: 0 };
  let partida = null, reloj = null, rotacion = 0, girando = false;

  const sess = RCGame.session({ name: "ruleta", onDiscard: descartarPartida });
  const els = { wheel: $("rl-wheel"), btn: $("rl-btn-girar"), timer: $("mg-timer"), progreso: $("mg-progreso"), puntaje: $("mg-puntaje"), rol: $("mg-role-badge"), panel: $("mg-teacher-panel"), area: $("mg-playarea"), veil: $("mg-pause-veil"), pregunta: $("rl-pregunta"), estado: $("rl-status"), leyenda: $("rl-legend") };
  const decir = (t) => { els.estado.textContent = t; };

  // ---------- dibujo de la ruleta ----------
  function punto(c, r, ang) { const a = ang * Math.PI / 180; return [c + r * Math.sin(a), c - r * Math.cos(a)]; }
  function nodo(tag, attrs) { const n = document.createElementNS(SVG_NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; }

  function dibujarRuleta() {
    const c = 110, R = 104;
    els.wheel.innerHTML = "";
    CATS.forEach((cat, i) => {
      const a0 = i * ANG, a1 = (i + 1) * ANG, mid = a0 + ANG / 2;
      const [x0, y0] = punto(c, R, a0), [x1, y1] = punto(c, R, a1);
      const g = nodo("g", { class: `rl-slice rl-s${i}`, "data-i": String(i) });
      g.appendChild(nodo("path", { d: `M ${c} ${c} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z` }));
      const izq = mid > 180;
      const t = nodo("text", {
        class: "rl-label", x: String(izq ? c - 34 : c + 34), y: String(c), "text-anchor": izq ? "end" : "start", dy: "0.35em",
        transform: `rotate(${izq ? mid + 90 : mid - 90} ${c} ${c})`
      });
      t.textContent = T("cat." + cat.id + ".s");
      g.appendChild(t);
      els.wheel.appendChild(g);
    });
    els.wheel.appendChild(nodo("circle", { class: "rl-hub", cx: String(c), cy: String(c), r: "20" }));
    els.leyenda.innerHTML = "";
    CATS.forEach((cat, i) => {
      const li = document.createElement("li");
      const dot = document.createElement("span"); dot.className = `rl-dot rl-s${i}`; dot.setAttribute("aria-hidden", "true");
      li.append(dot, document.createTextNode(`${cat.icono} ${T("cat." + cat.id)}`));
      els.leyenda.appendChild(li);
    });
  }

  function renderConfig() {
    pillGroup($("mg-config-cantidad"), GIROS.map((n) => ({ label: T("rul.n", { n }), value: n })), config.giros, (v) => { config.giros = v; });
    pillGroup($("mg-config-tiempo"), TIEMPOS.map((s) => ({ label: s ? T("mg.min", { n: s / 60 }) : T("mg.noLimit"), value: s })), config.tiempoSegundos, (v) => { config.tiempoSegundos = v; });
  }
  function pintarReloj(info) {
    els.timer.textContent = `⏱️ ${RCGame.formatTime(info.shown)}`;
    els.timer.classList.toggle("is-warning", !info.unlimited && info.remaining <= 120 && info.remaining > 30);
    els.timer.classList.toggle("is-critical", !info.unlimited && info.remaining <= 30);
  }
  function pintarStats() {
    els.progreso.textContent = T("rul.progress", { i: Math.min(partida.giros + (partida.enPregunta ? 0 : 1), partida.total), n: partida.total });
    els.puntaje.textContent = T("mg.hits", { n: partida.aciertos });
  }

  // ---------- preguntas sin repetir ----------
  function siguientePregunta(catIdx) {
    const cat = CATS[catIdx];
    let bolsa = partida.bolsas[cat.id];
    if (!bolsa.length) bolsa = partida.bolsas[cat.id] = RCMini.shuffle(cat.preguntas);   // agotadas: se reinicia solo esa categoría
    return bolsa.pop();
  }

  // ---------- giro ----------
  function girar() {
    if (!partida || girando || partida.enPregunta || partida.terminada) return;
    girando = true;
    els.btn.disabled = true;
    els.wheel.querySelectorAll(".rl-slice").forEach((s) => s.classList.remove("is-winner"));
    let objetivo;
    do { objetivo = Math.random() * 360; const m = objetivo % ANG; if (m > 4 && m < ANG - 4) break; } while (true);
    const idx = Math.floor(objetivo / ANG);
    const delta = (((360 - objetivo - (rotacion % 360)) % 360) + 360) % 360;
    rotacion += 360 * (5 + Math.floor(Math.random() * 3)) + delta;
    const dur = reducido() ? 600 : 4200;
    els.wheel.style.transition = `transform ${dur}ms cubic-bezier(0.12, 0.6, 0.1, 1)`;
    els.wheel.style.transform = `rotate(${rotacion}deg)`;
    els.wheel.dataset.rot = String(rotacion);
    decir(T("rul.spinning"));
    sonar("start");
    sess.timeout(() => alDetener(idx), dur + 150);
  }

  function alDetener(idx) {
    girando = false;
    if (!partida) return;
    const cat = CATS[idx];
    els.wheel.querySelector(`.rl-slice[data-i="${idx}"]`).classList.add("is-winner");
    sonar("open");
    decir(T("rul.landed", { c: T("cat." + cat.id) }));
    partida.enPregunta = true;
    partida.giros++;
    pintarStats();
    const q = siguientePregunta(idx);
    const ultima = partida.giros >= partida.total;
    RCMini.renderPregunta(els.pregunta, q, {
      etiqueta: `${cat.icono} ${T("cat." + cat.id)}`,
      textoSiguiente: ultima ? T("mg.seeResults") : T("rul.again"),
      onAnswer: (ok, info) => {
        partida.respondidas++;
        if (ok) partida.aciertos++;
        else partida.errores.push({ texto: RCMini.recortar(q.texto), detalle: T("mg.correctIs", { a: info.correctaTexto }) });
        partida.detalle.push({ pregunta: `[${T("cat." + cat.id)}] ${q.texto}`, elegida: info.elegidaTexto, correcta: info.correctaTexto, ok, explicacion: q.explicacion });
        pintarStats();
      },
      onNext: () => {
        partida.enPregunta = false;
        els.pregunta.innerHTML = "";
        els.pregunta.appendChild(RCMini.el("p", { class: "mg-placeholder", text: T("rul.placeholder2") }));
        if (ultima) { finalizar("completo"); return; }
        els.btn.disabled = false;
        decir(T("rul.pressSpin"));
        pintarStats();
        els.btn.focus();
      }
    });
    els.pregunta.scrollIntoView({ block: "nearest", behavior: "auto" });
  }

  // ---------- flujo ----------
  function iniciarPartida() {
    if (rol === "alumno" && !RCStudent.get()) { rol = null; showStage("role"); return; }
    const total = rol === "maestro" ? config.giros : GIROS_ALUMNO;
    sess.start();
    const bolsas = {};
    CATS.forEach((c) => { bolsas[c.id] = RCMini.shuffle(c.preguntas); });
    partida = { total, giros: 0, aciertos: 0, respondidas: 0, errores: [], detalle: [], bolsas, enPregunta: false, terminada: false };
    girando = false;
    dibujarRuleta();
    els.wheel.style.transition = "none";
    rotacion = 0;
    els.wheel.style.transform = "rotate(0deg)";
    els.wheel.dataset.rot = "0";
    els.btn.disabled = false;
    els.pregunta.innerHTML = "";
    els.pregunta.appendChild(RCMini.el("p", { class: "mg-placeholder", text: T("rul.placeholder1") }));
    decir(T("rul.pressSpin"));
    pintarStats();
    els.rol.textContent = rol === "maestro" ? T("mg.roleTeacher") : T("mg.roleStudent");
    RCMini.setPausa(els.area, els.veil, false);
    sess.listen(els.btn, "click", girar);
    sess.listen($("mg-btn-salir"), "click", () => sess.requestExit());
    RCMini.panelMaestro(els.panel, sess, {
      rol,
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
    const { aciertos, total, respondidas, errores, detalle } = partida;
    sess.end();
    RCSound.stopAll();
    RCSound.play("complete");
    const nota = calcularCalificacion(aciertos, total);
    if (rol === "alumno") RCHistory.record({ tipo: "roulette", nota, correctas: aciertos, incorrectas: respondidas - aciertos, total, tiempoSeg: seg, detalle });
    const v = RCMini.valoracion(nota);
    RCMini.mostrarResultado({
      rol, badge: v.badge, titulo: v.titulo,
      nota: motivo === "tiempo" ? T("rul.noteTime") : motivo === "maestro" ? T("rul.noteTeacher") : T("rul.noteDone"),
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
    reloj = null; partida = null; rol = null; girando = false;
    config = { giros: GIROS_ALUMNO, tiempoSegundos: 0 };
    els.pregunta.innerHTML = ""; els.panel.innerHTML = ""; els.panel.hidden = true; els.veil.hidden = true; els.area.inert = false;
    showStage("role");
  }

  dibujarRuleta();
  RCMini.bindFlow({ getRol: () => rol, setRol: (r) => { rol = r; }, renderConfig, iniciar: iniciarPartida });
})();
