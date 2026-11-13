// Pruebas de Configuración: secciones, temas, idiomas, cuenta/sesión e historial.
const { launch, BASE, ok, newPage, sleep, alumno, results } = require('./common');
const noErr = (p) => p.__errors.filter((e) => !/ERR_NAME_NOT_RESOLVED/.test(e));
const THEMES = ['light', 'dark', 'violet', 'blue', 'green', 'graphite', 'beige'];

async function jugarSituaciones(p) {
  await p.goto(BASE + 'pages/situaciones.html'); await sleep(150);
  await p.click('#mg-btn-comenzar'); await alumno(p);
  for (let i = 0; i < 10; i++) { await p.click('.mg-options .option-item'); await p.click('.mg-q__actions .btn'); await sleep(30); }
  await sleep(100);
}
async function jugarMemoria(p) {
  await p.goto(BASE + 'pages/memoria.html'); await sleep(150);
  await p.click('#mg-btn-comenzar'); await alumno(p);
  const info = await p.evaluate(() => [...document.querySelectorAll('.mem-card')].map((e, i) => { const t = e.querySelector('.mem-face--front').textContent; return { i, id: MEMORIA_PARES.find((x) => x.concepto === t || x.definicion === t).id }; }));
  const g = {}; info.forEach((x) => (g[x.id] = g[x.id] || []).push(x.i));
  await p.evaluate((i, j) => { const c = document.querySelectorAll('.mem-card'); c[i].click(); c[j].click(); }, info[0].i, info.find((x) => x.id !== info[0].id).i);
  await sleep(1300);
  for (const id of Object.keys(g)) { await p.evaluate((i, j) => { const c = document.querySelectorAll('.mem-card'); c[i].click(); c[j].click(); }, g[id][0], g[id][1]); await sleep(40); }
  await sleep(800);
}
async function jugarRuleta(p) {
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p.goto(BASE + 'pages/ruleta.html'); await sleep(150);
  await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await p.click('#mg-btn-comenzar'); await alumno(p);
  for (let i = 0; i < 10; i++) {
    await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await sleep(40);
    await p.click('#rl-btn-girar'); await p.waitForSelector('.mg-q', { timeout: 8000 });
    await p.click('.mg-options .option-item'); await sleep(30); await p.click('.mg-q__actions .btn'); await sleep(50);
  }
  await sleep(100);
}
const hist = (p) => p.evaluate(() => JSON.parse(sessionStorage.getItem('rc-history') || '{"items":[]}').items);

(async () => {
  const b = await launch();
  try {
    let p = await newPage(b);
    p.on('dialog', (d) => d.accept());   // aviso de «salir de la partida» al abandonar un juego en curso
    // ---- 1 y 2: botón y secciones ----
    await p.goto(BASE + 'pages/juegos.html'); await sleep(200);
    ok('engranaje visible en la navegación', await p.$eval('.settings-toggle', (e) => e.offsetWidth > 0 && /configuracion\.html$/.test(e.href)));
    await p.click('.settings-toggle'); await sleep(250);
    ok('el engranaje abre la página de configuración', /configuracion\.html/.test(p.url()));
    for (const s of ['cuenta', 'apariencia', 'idioma', 'historial', 'acerca']) {
      await p.click(`#tab-${s}`); await sleep(120);
      const vis = await p.evaluate((id) => [...document.querySelectorAll('.cfg-panel')].filter((x) => !x.hidden).map((x) => x.id), s);
      ok(`sección «${s}» se muestra sola`, vis.length === 1 && vis[0] === 'panel-' + s && p.url().endsWith('#' + s), vis.join());
    }
    ok('cinco secciones con icono, título y descripción', await p.evaluate(() => [...document.querySelectorAll('.cfg-tab')].every((t) => t.querySelector('svg') && t.querySelector('.cfg-tab__title').textContent && t.querySelector('.cfg-tab__desc').textContent)) && (await p.$$('.cfg-tab')).length === 5);

    // ---- cuenta sin alumno ----
    await p.goto(BASE + 'pages/configuracion.html#cuenta'); await sleep(200);
    ok('cuenta sin alumno: invita a identificarse', !!(await p.$('#panel-cuenta .cfg-empty')));
    await p.goto(BASE + 'pages/configuracion.html#historial'); await sleep(150);
    ok('historial sin alumno: aviso de exclusividad', !!(await p.$('#panel-historial .cfg-empty')));

    // ---- datos de prueba: tres actividades ----
    await jugarSituaciones(p);
    ok('situaciones: queda 1 registro con nota', (await hist(p)).length === 1 && (await hist(p))[0].nota != null);
    await jugarMemoria(p);
    const h2 = await hist(p);
    const mem = h2.find((x) => x.tipo === 'memory');
    ok('memoria: registro sin calificación y con estadísticas', mem && mem.nota === null && mem.memoria.parejas === 6 && mem.memoria.total === 6 && mem.memoria.intentos >= 7 && mem.memoria.conceptos.length === 6);
    ok('memoria: la pantalla de resultados no muestra calificación ni nota', await p.evaluate(() => { const t = document.querySelector('[data-stage="result"]').innerText; return !/Calificación|\/ 5|5\.0/.test(t) && document.querySelectorAll('#mg-result-stats .result-stat').length === 4 && !!document.querySelector('#mg-review li'); }));
    ok('memoria: muestra parejas, total, intentos, tiempo y conceptos con definiciones', await p.evaluate(() => { const l = [...document.querySelectorAll('#mg-result-stats span')].map((e) => e.textContent); return l.length === 4 && document.querySelectorAll('#mg-review li').length === 6 && /—/.test(document.querySelector('#mg-review li').textContent); }));
    ok('memoria: el código ya no usa calcularCalificacion', await p.evaluate(async () => !/calcularCalificacion/.test(await (await fetch('../js/memory/memoria.js')).text())));
    await jugarRuleta(p);
    const h3 = await hist(p);
    ok('ruleta: registro con nota, correctas e incorrectas', h3.length === 3 && h3[2].tipo === 'roulette' && h3[2].nota >= 1 && h3[2].correctas + h3[2].incorrectas === 10 && h3[2].detalle.length === 10);
    ok('ruleta/situaciones: detalle con pregunta, respuesta, correcta y explicación', h3.filter((x) => x.detalle.length).every((x) => x.detalle.every((d) => d.pregunta && d.correcta && d.explicacion && d.elegida !== undefined)));
    ok('ruleta/situaciones: siguen mostrando nota 1.0-5.0 en resultados', await p.evaluate(() => /^[1-5]\.\d$/.test(document.querySelector('#mg-result-stats .result-stat b').textContent)));

    // ---- historial en la interfaz ----
    await p.goto(BASE + 'pages/configuracion.html#historial'); await sleep(250);
    const res = await p.evaluate(() => ({ items: document.querySelectorAll('.his-item').length, stats: [...document.querySelectorAll('.his-stat b')].map((e) => e.textContent), filters: document.querySelectorAll('.cfg-select').length }));
    ok('historial: 3 tarjetas, resumen y 3 filtros', res.items === 3 && res.filters === 3 && res.stats.length === 4, JSON.stringify(res));
    const sumEsperado = h3.reduce((a, i) => a + i.correctas, 0);
    ok('historial: totales calculados solo con lo registrado', Number(res.stats[2]) === sumEsperado && Number(res.stats[3]) === h3.reduce((a, i) => a + i.incorrectas, 0) && Number(res.stats[1]) === 2);
    await p.click('.his-item__head'); await sleep(120);
    ok('historial: se expande y muestra preguntas, respuesta correcta y explicación', await p.evaluate(() => !!document.querySelector('.his-item.is-open .his-q') && /Explicación/.test(document.querySelector('.his-item.is-open').innerText)));
    await p.select('#his-f-type', 'memory'); await sleep(100);
    ok('historial: filtro por tipo', (await p.$$('.his-item')).length === 1);
    await p.select('#his-f-type', 'all'); await p.select('#his-f-res', 'none'); await sleep(100);
    ok('historial: filtro «sin calificación» deja solo la memoria', (await p.$$('.his-item')).length === 1 && await p.$eval('.his-item', (e) => /Memoria|Concept/i.test(e.innerText)));
    await p.select('#his-f-res', 'any'); await p.select('#his-f-date', 'today'); await sleep(100);
    ok('historial: filtro por fecha (hoy)', (await p.$$('.his-item')).length === 3);
    await p.reload(); await sleep(250);
    ok('historial: sobrevive a recargar la pestaña', (await p.$$('.his-item')).length === 3);
    await p.goto(BASE + 'pages/juegos.html'); await sleep(100); await p.goto(BASE + 'pages/configuracion.html#historial'); await sleep(200);
    ok('historial: sobrevive a navegar entre páginas', (await p.$$('.his-item')).length === 3);

    // ---- cuenta: editar ----
    await p.click('#tab-cuenta'); await sleep(150);
    ok('cuenta: muestra nombre y curso', await p.$eval('#panel-cuenta', (e) => /Ana María Pérez/.test(e.innerText) && /11-2/.test(e.innerText)));
    await p.click('.cfg-person .btn'); await sleep(100);
    await p.$eval('#cfg-edit-name', (e) => (e.value = '')); await p.click('.cfg-form button[type="submit"]'); await sleep(80);
    ok('cuenta: el nombre sigue siendo obligatorio', await p.$eval('.cfg-form .student-error', (e) => !e.hidden && e.textContent.length > 5));
    await p.type('#cfg-edit-name', 'Luis Gómez'); await p.$eval('#cfg-edit-course', (e) => (e.value = '')); await p.click('.cfg-form button[type="submit"]'); await sleep(120);
    ok('cuenta: nombre modificado y curso opcional vacío', await p.evaluate(() => { const s = JSON.parse(sessionStorage.getItem('rc-student')); return s.nombre === 'Luis Gómez' && !s.curso; }));
    ok('cuenta: los registros del historial conservan al mismo estudiante con el nombre corregido', (await hist(p)).every((x) => x.estudiante.nombre === 'Luis Gómez'));

    // ---- temas ----
    await p.click('#tab-apariencia'); await sleep(150);
    ok('apariencia: 7 tarjetas con miniatura, colores, descripción y estado', await p.evaluate(() => [...document.querySelectorAll('.theme-card')].length === 7 && [...document.querySelectorAll('.theme-card')].every((c) => c.querySelector('.theme-mini') && c.querySelectorAll('.theme-swatches span').length === 5 && c.querySelector('.theme-card__desc').textContent.length > 5 && c.querySelector('.theme-card__name').textContent)));
    const bgs = new Set();
    for (const id of ['dark', 'violet', 'blue', 'green', 'graphite', 'light', 'beige']) {
      await p.click(`.theme-card[data-theme-id="${id}"] .theme-card__btns .btn:last-child`); await sleep(80);
      const st = await p.evaluate(() => ({ t: document.documentElement.dataset.theme, tone: document.documentElement.dataset.tone, bg: getComputedStyle(document.body).backgroundColor, ls: localStorage.getItem('rc-theme'), sel: document.querySelector('.theme-card.is-selected').dataset.themeId }));
      bgs.add(st.bg);
      ok(`tema ${id}: se aplica al instante y queda seleccionado`, st.t === id && st.ls === id && st.sel === id, JSON.stringify(st));
    }
    ok('los siete temas tienen fondos distintos', bgs.size === 7);
    // vista previa
    await p.click('.theme-card[data-theme-id="violet"] .theme-card__btns .btn:first-child'); await sleep(100);
    ok('vista previa: cambia la página sin guardar', await p.evaluate(() => document.documentElement.dataset.theme === 'violet' && localStorage.getItem('rc-theme') === 'beige' && !document.getElementById('cfg-preview-bar').hidden));
    await p.click('#cfg-preview-bar .btn-ghost'); await sleep(80);
    ok('vista previa: cancelar restaura el tema guardado', await p.evaluate(() => document.documentElement.dataset.theme === 'beige' && document.getElementById('cfg-preview-bar').hidden));
    await p.click('.theme-card[data-theme-id="blue"] .theme-card__btns .btn:first-child'); await sleep(60); await p.click('#cfg-preview-bar .btn-primary'); await sleep(80);
    ok('vista previa: aplicar guarda el tema', await p.evaluate(() => localStorage.getItem('rc-theme') === 'blue'));
    // todas las páginas y juegos con el tema oscuro nuevo
    for (const u of ['index.html', 'pages/quiz.html', 'pages/sopa.html', 'pages/memoria.html', 'pages/ruleta.html', 'pages/situaciones.html', 'pages/configuracion.html']) {
      await p.goto(BASE + u); await sleep(120);
      ok(`tema persistente en ${u}`, await p.evaluate(() => document.documentElement.dataset.theme === 'blue' && document.documentElement.dataset.tone === 'dark'));
    }
    // botón rápido
    await p.goto(BASE + 'pages/configuracion.html#apariencia'); await sleep(150);
    await p.click('.theme-toggle'); await sleep(60);
    const t1 = await p.evaluate(() => document.documentElement.dataset.theme);
    await p.click('.theme-toggle'); await sleep(60);
    const t2 = await p.evaluate(() => document.documentElement.dataset.theme);
    ok('botón rápido claro/oscuro se conserva (alterna tonos y recuerda el último tema)', t1 === 'beige' && t2 === 'blue', t1 + ' ' + t2);

    // ---- idiomas ----
    await p.click('#tab-idioma'); await sleep(150);
    ok('idioma: 5 tarjetas con bandera (SVG) y nombre en su idioma', await p.evaluate(() => { const n = [...document.querySelectorAll('.lang-card')].map((c) => c.querySelector('.lang-card__name').textContent + (c.querySelector('.flag svg') ? '+f' : '')); return n.join('|') === 'Español+f|English+f|Русский+f|Português+f|Français+f'; }));
    const esperado = { en: ['Games', 'Question Wheel'], ru: ['Игры', 'Колесо вопросов'], pt: ['Jogos', 'Roleta de perguntas'], fr: ['Jeux', 'Roue des questions'], es: ['Juegos', 'Ruleta de preguntas'] };
    for (const code of ['en', 'ru', 'pt', 'fr', 'es']) {
      await p.click(`.lang-card[data-lang="${code}"]`); await sleep(150);
      const r = await p.evaluate(() => ({ lang: document.documentElement.lang, ls: localStorage.getItem('rc-lang'), nav: [...document.querySelectorAll('.navbar__link')].map((a) => a.textContent.trim()), sel: document.querySelector('.lang-card[aria-checked="true"]').dataset.lang, hist: JSON.parse(sessionStorage.getItem('rc-history')).items.length }));
      ok(`idioma ${code}: menús, html lang y persistencia; el historial no se borra`, r.lang === code && r.ls === code && r.nav.includes(esperado[code][0]) && r.sel === code && r.hist === 3, JSON.stringify(r));
      await p.goto(BASE + 'pages/ruleta.html'); await sleep(150);
      const rt = await p.evaluate(() => ({ h1: document.querySelector('h1').textContent, legend: [...document.querySelectorAll('#rl-legend li')].length, spin: document.getElementById('rl-btn-girar').textContent, orphan: [...document.querySelectorAll('[data-i18n]')].filter((e) => e.textContent === e.getAttribute('data-i18n')).length, notice: !!document.getElementById('i18n-partial-notice') }));
      ok(`idioma ${code}: página de ruleta traducida (sin claves sueltas)`, rt.h1 === esperado[code][1] && rt.legend === 6 && rt.orphan === 0 && rt.notice === (code !== 'es'), JSON.stringify(rt));
      await p.goto(BASE + 'pages/configuracion.html#idioma'); await sleep(150);
    }
    // ruso: cirílico y fuente
    await p.click('.lang-card[data-lang="ru"]'); await sleep(120);
    ok('ruso: texto cirílico en la interfaz y fuente con soporte', await p.evaluate(() => /[А-Яа-я]/.test(document.querySelector('h1').textContent) && /Manrope|Segoe|Arial/.test(getComputedStyle(document.documentElement).getPropertyValue('--font-display'))));
    // juego en otro idioma: controles traducidos
    await p.goto(BASE + 'pages/situaciones.html'); await sleep(150);
    await p.click('#mg-btn-comenzar'); await p.click('.role-card[data-role="alumno"]'); await sleep(100);
    ok('ruso: tarjetas de modo traducidas', await p.$eval('.role-card__title', (e) => /ученик/.test(e.textContent)));
    await p.goto(BASE + 'pages/configuracion.html#idioma'); await p.click('.lang-card[data-lang="es"]'); await sleep(100);

    // ---- cambiar sesión: cancelar y aceptar ----
    await p.click('#tab-cuenta'); await sleep(120);
    await p.click('.cfg-actions-grid .cfg-card:first-child .btn'); await sleep(100);
    ok('cambiar de sesión: pide confirmación y explica que borra el historial', await p.evaluate(() => /historial/.test(document.querySelector('.modal--confirm').innerText)));
    await p.click('.modal--confirm .btn-primary'); await sleep(100);
    ok('cambiar de sesión: cancelar conserva alumno e historial', await p.evaluate(() => !!sessionStorage.getItem('rc-student') && JSON.parse(sessionStorage.getItem('rc-history')).items.length === 3) && !(await p.$('.modal--confirm')));
    await p.click('.cfg-actions-grid .cfg-card:first-child .btn'); await sleep(100);
    await p.click('.modal--confirm .btn-danger-outline'); await sleep(150);
    ok('cambiar de sesión: aceptar elimina historial y datos y pide nombre y curso', await p.evaluate(() => sessionStorage.getItem('rc-history') === null && sessionStorage.getItem('rc-student') === null) && !!(await p.$('#student-nombre')));
    await p.type('#student-nombre', 'Marta Ruiz'); await p.type('#student-curso', '10-1'); await p.click('.student-form button[type="submit"]'); await sleep(150);
    ok('cambiar de sesión: sesión limpia con los nuevos datos', await p.evaluate(() => JSON.parse(sessionStorage.getItem('rc-student')).nombre === 'Marta Ruiz' && !sessionStorage.getItem('rc-history')) && /Marta Ruiz/.test(await p.$eval('#panel-cuenta', (e) => e.innerText)));
    ok('tema e idioma sobreviven al cambio de sesión', await p.evaluate(() => localStorage.getItem('rc-theme') === 'blue' && localStorage.getItem('rc-lang') === 'es'));

    // ---- cerrar sesión ----
    await jugarSituaciones(p);   // vuelve a registrar con Marta
    await p.goto(BASE + 'pages/configuracion.html#cuenta'); await sleep(200);
    await p.click('.cfg-actions-grid .cfg-card:last-child .btn'); await sleep(100);
    ok('cerrar sesión: modal con el aviso exacto', await p.evaluate(() => { const t = document.querySelector('.modal--confirm').innerText; return /¿Estás seguro de que deseas cerrar tu sesión\?/.test(t) && /historial de actividades, calificaciones y respuestas/.test(t) && /no se puede deshacer/.test(t); }));
    await p.keyboard.press('Escape'); await sleep(80);
    ok('cerrar sesión: cancelar (Esc) conserva los datos', await p.evaluate(() => !!sessionStorage.getItem('rc-student') && !!sessionStorage.getItem('rc-history')));
    await p.click('.cfg-actions-grid .cfg-card:last-child .btn'); await sleep(100);
    await p.click('.modal--confirm .btn-danger-outline'); await sleep(150);
    ok('cerrar sesión: elimina datos temporales y vuelve al estado inicial', await p.evaluate(() => !sessionStorage.getItem('rc-student') && !sessionStorage.getItem('rc-history')) && !!(await p.$('#panel-cuenta .cfg-empty')));
    ok('cerrar sesión: tema e idioma se conservan', await p.evaluate(() => localStorage.getItem('rc-theme') === 'blue'));

    // formulario de identificación en ruso (estado vacío → Identificarme)
    await p.click('#tab-idioma'); await p.click('.lang-card[data-lang="ru"]'); await sleep(100);
    await p.click('#tab-cuenta'); await sleep(100); await p.click('#panel-cuenta .cfg-empty .btn'); await sleep(150);
    ok('ruso: formulario de identificación traducido (Cuenta y sesión)', await p.$eval('#student-title', (e) => /Кто/.test(e.textContent)) && await p.$eval('#panel-cuenta', (e) => /Отмена/.test(e.innerText)));
    await p.click('#tab-idioma'); await p.click('.lang-card[data-lang="es"]'); await sleep(100);

    // ---- Acerca ----
    await p.click('#tab-acerca'); await sleep(150);
    const ab = await p.evaluate(() => ({ gh: document.querySelector('[data-link="github"]').href, ghTarget: document.querySelector('[data-link="github"]').target, user: document.querySelector('.abo-user code').textContent, author: document.querySelector('.abo-author__name').textContent, discordLinks: document.querySelectorAll('[data-link="discord"] a').length, txt: document.querySelector('#panel-acerca').innerText }));
    ok('acerca: autor Ilyrven, repositorio correcto, Discord solo con usuario', ab.author === 'Ilyrven' && ab.gh === 'https://github.com/CuteMoons/Mecanismos-de-Participaci-n-Ciudadana' && ab.ghTarget === '_blank' && ab.user === 'ilyrven' && ab.discordLinks === 0 && /Consulta el código fuente/.test(ab.txt) && /Contacto del autor/.test(ab.txt), JSON.stringify(ab));
    await p.evaluate(() => { navigator.clipboard.writeText = (t) => { window.__copiado = t; return Promise.resolve(); }; });
    await p.click('#abo-copy'); await sleep(100);
    ok('acerca: copia el usuario al portapapeles', await p.evaluate(() => window.__copiado === 'ilyrven'));
    ok('configuración sin errores de JavaScript', noErr(p).length === 0, noErr(p).join(' | '));
    await p.close();

    // ---- tamaños de pantalla ----
    for (const [w, h] of [[375, 740], [768, 1024], [1440, 900]]) {
      const q = await newPage(b, { width: w, height: h, mobile: w < 800 });
      let bad = [];
      for (const s of ['cuenta', 'apariencia', 'idioma', 'historial', 'acerca']) {
        await q.goto(BASE + 'pages/configuracion.html#' + s); await sleep(150);
        if (!(await q.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))) bad.push(s);
      }
      ok(`${w}px: ninguna sección desborda horizontalmente`, bad.length === 0, bad.join());
      await q.close();
    }
  } finally { await b.close(); }
  const f = results().filter((r) => !r.cond).length;
  console.log(f ? `\n${f} FALLOS` : '\nTODO OK (' + results().length + ' comprobaciones)');
  process.exit(f ? 1 : 0);
})();
