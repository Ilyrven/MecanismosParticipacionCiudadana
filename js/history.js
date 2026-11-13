/**
 * js/history.js
 * Historial de actividades del alumno identificado.
 *
 *  - Con perfil temporal (lo normal): el registro se envía al servidor (SQL) mediante
 *    RCProfile.recordActivity() y se consulta con listAsync(). Solo se envían actividades
 *    TERMINADAS; el servidor evita duplicados y descarta las que no tuvieron ningún avance.
 *  - Modo invitado (servidor no disponible): se guarda en sessionStorage como antes
 *    (lo que sigue de este comentario describe ese modo).
 *
 *  - Se guarda en sessionStorage («rc-history»), igual que la identificación
 *    del alumno (js/student.js): solo vive en esta pestaña, no se envía a
 *    ningún sitio y sobrevive a navegar entre páginas y a recargar.
 *  - Solo registra actividades de un alumno identificado (el modo maestro no
 *    deja historial). No se inventa ningún dato: cada registro contiene
 *    únicamente lo que la actividad midió de verdad.
 *  - Se elimina al cerrar sesión o cambiar de alumno (RCStudent.clear()).
 *  - Cambiar el tema o el idioma NO lo toca (esas son preferencias permanentes).
 *
 * Registro: { id, tipo, fecha (ISO), estudiante:{nombre,curso}, nota|null,
 *   correctas, incorrectas, total, tiempoSeg, detalle:[{pregunta, elegida,
 *   correcta, ok, explicacion}], memoria?:{parejas,total,intentos,conceptos[]} }
 *
 * API (window.RCHistory): record(r) · list() · clear() · summary(lista) · TIPOS
 */
const RCHistory = (() => {
  const KEY = "rc-history";
  const MAX_REGISTROS = 150;
  const MAX_TEXTO = 700;
  /** Tipos válidos y la clave de i18n de su nombre (act.<tipo>). */
  const TIPOS = ["quiz", "crossword", "matching", "wordsearch", "situations", "memory", "roulette"];
  let respaldo = [];   // si el navegador no permite sessionStorage

  const txt = (s) => String(s == null ? "" : s).slice(0, MAX_TEXTO);
  const num = (n, d = 0) => (Number.isFinite(Number(n)) ? Number(n) : d);

  function leer() {
    try {
      const raw = window.sessionStorage.getItem(KEY);
      if (raw) { const o = JSON.parse(raw); if (o && Array.isArray(o.items)) return o.items; }
    } catch (_) { /* sin almacenamiento o dato dañado */ }
    return respaldo;
  }
  function guardar(items) {
    respaldo = items;
    try { window.sessionStorage.setItem(KEY, JSON.stringify({ v: 1, items })); } catch (_) { /* queda en memoria */ }
  }

  function normalizar(r, est) {
    if (!TIPOS.includes(r.tipo)) return null;
    const nota = r.nota == null ? null : Math.max(1, Math.min(5, num(r.nota, 1)));
    const reg = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      tipo: r.tipo,
      fecha: new Date().toISOString(),
      estudiante: { nombre: est.nombre, curso: est.curso || "" },
      nota,
      correctas: Math.max(0, num(r.correctas)),
      incorrectas: Math.max(0, num(r.incorrectas)),
      total: Math.max(0, num(r.total)),
      tiempoSeg: r.tiempoSeg == null ? null : Math.max(0, Math.round(num(r.tiempoSeg))),   // null = la actividad no midió el tiempo
      detalle: Array.isArray(r.detalle) ? r.detalle.slice(0, 60).map((d) => ({
        pregunta: txt(d.pregunta), elegida: d.elegida == null ? null : txt(d.elegida), correcta: txt(d.correcta),
        ok: d.ok === true ? true : (d.ok === false ? false : null), explicacion: txt(d.explicacion)
      })) : []
    };
    if (r.memoria) {
      reg.memoria = {
        parejas: Math.max(0, num(r.memoria.parejas)), total: Math.max(0, num(r.memoria.total)), intentos: Math.max(0, num(r.memoria.intentos)),
        conceptos: Array.isArray(r.memoria.conceptos) ? r.memoria.conceptos.slice(0, 20).map((c) => ({ concepto: txt(c.concepto), definicion: txt(c.definicion), encontrada: !!c.encontrada })) : []
      };
    }
    return reg;
  }

  /** Guarda una actividad terminada. Devuelve true si se registró (hay alumno identificado). */
  function record(r) {
    if (window.RCProfile && window.RCProfile.active()) {
      if (!TIPOS.includes(r.tipo)) return false;
      const num2 = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0);
      return window.RCProfile.recordActivity({
        tipo: r.tipo, nota: r.nota == null ? null : num2(r.nota), correctas: num2(r.correctas), incorrectas: num2(r.incorrectas), total: num2(r.total),
        tiempoSeg: r.tiempoSeg == null ? null : num2(r.tiempoSeg), detalle: r.detalle, memoria: r.memoria
      });
    }
    const est = window.RCStudent && window.RCStudent.get();
    if (!est) return false;
    const reg = normalizar(r, est);
    if (!reg) return false;
    const items = leer().concat(reg).slice(-MAX_REGISTROS);
    guardar(items);
    return true;
  }
  const list = () => leer().slice();
  /** Historial del perfil (servidor) o, en modo invitado, el de esta pestaña. */
  async function listAsync() {
    if (window.RCProfile && window.RCProfile.active()) return window.RCProfile.activities();
    return list();
  }
  function clear() { respaldo = []; try { window.sessionStorage.removeItem(KEY); } catch (_) { /* nada */ } }

  /** Si el alumno corrige su nombre o curso, los registros siguen siendo suyos. */
  function actualizarEstudiante(est) {
    const items = leer();
    if (!items.length) return;
    guardar(items.map((it) => Object.assign({}, it, { estudiante: { nombre: est.nombre, curso: est.curso || "" } })));
  }

  /** Resumen calculado solo con lo registrado. */
  function summary(items) {
    const conNota = items.filter((i) => i.nota != null);
    const suma = conNota.reduce((a, i) => a + i.nota, 0);
    return {
      actividades: items.length,
      conNota: conNota.length,
      promedio: conNota.length ? suma / conNota.length : null,
      correctas: items.reduce((a, i) => a + i.correctas, 0),
      incorrectas: items.reduce((a, i) => a + i.incorrectas, 0)
    };
  }

  // Cambiar de alumno / cerrar sesión (RCStudent.clear) elimina el historial.
  if (window.RCStudent) window.RCStudent.onChange((est) => { if (!est) clear(); else actualizarEstudiante(est); });

  return { record, list, listAsync, clear, summary, TIPOS };
})();

window.RCHistory = RCHistory;
