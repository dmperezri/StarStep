/* StarStep: interfaz independiente de WebGL/CDN. El motor lunar se comunica por eventos. */
const $ = id => document.getElementById(id);
let modal, activeId, engine, ticket = 0, previousFocus, background = [], modulePromise;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
function build() {
  modal = document.createElement('section');
  modal.className = 'visor-modal'; modal.hidden = true;
  modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'visorTitle');
  modal.innerHTML = `<div class="visor-panel"><header class="visor-head"><strong id="visorTitle">Visor holográfico</strong><button id="visorClose" type="button" class="pixel-button small">Cerrar</button></header><div class="visor-body"><div id="visorViewport" class="visor-canvas"><p id="visorFallback" role="status">Preparando el visor…</p><div id="visorPins" class="visor-pins"></div></div><aside class="visor-side"><p>Arrastrá para girar · rueda o pellizco para acercar. También podés usar los botones de las piezas.</p><div class="visor-tools"><button id="visorAuto" type="button" class="pixel-button small" aria-pressed="false">Rotar</button><button id="visorReset" type="button" class="pixel-button small">Reiniciar vista</button><button id="visorDust" type="button" class="pixel-button small" hidden>Limpiar polvo</button></div><p id="visorModelStatus" role="status"></p><div id="visorParts" class="visor-tools" aria-label="Piezas del artefacto"></div><div class="evidence observed"><b>Lo que se vio</b><p id="evidenceObserved">Seleccioná una pieza.</p></div><div class="evidence interpreted"><b>Lo que interpretan</b><p id="evidenceInterpreted">Seleccioná una pieza.</p></div><div class="evidence narrative"><b>Nuestra historia</b><p id="evidenceStory">LITO te acompañará.</p></div><a id="visorSource" target="_blank" rel="noopener noreferrer">Fuente NASA</a><p id="visorStatus" aria-live="polite"></p><small>Representación educativa estilizada. La limpieza del polvo es una simulación visual.</small></aside></div></div>`;
  document.body.append(modal);
  $('visorClose').onclick = close;
  $('visorAuto').onclick = () => {
    if (!engine) return;
    const on = engine.toggleAuto(); $('visorAuto').setAttribute('aria-pressed', String(on));
  };
  $('visorReset').onclick = () => { engine?.reset(); $('visorAuto').setAttribute('aria-pressed', 'false'); };
  $('visorDust').onclick = () => {
    if (!engine) return;
    const dusty = engine.toggleDust();
    $('visorDust').textContent = dusty ? 'Limpiar polvo' : 'Simular polvo';
    $('visorStatus').textContent = dusty ? 'Polvo simulado sobre los paneles.' : 'Paneles limpios en esta simulación. Opportunity no tuvo un mecanismo de limpieza.';
  };
  modal.onclick = e => { if (e.target === modal) close(); };
  modal.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Tab') {
      const nodes = [...modal.querySelectorAll('button:not(:disabled),a[href]')].filter(n => n.getClientRects().length);
      const first = nodes[0], last = nodes.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  });
}
const parts = {
  eagle: ['Etapa de descenso', 'Patas y platos', 'Escalera'],
  easep: ['Instrumentos', 'Alimentación', 'Sensores'],
  alsep: ['Estación científica', 'Sensores', 'Núcleo de 3 m'],
  reflector: ['Prismas', 'Soporte'],
  opportunity: ['Pancam', 'Paneles solares', 'Ruedas'],
  blueberries: ['Hematita']
};
function evidence(label) {
  const item = window.StarProgress?.catalog[activeId]; if (!item) return;
  $('evidenceObserved').textContent = item.observed;
  $('evidenceInterpreted').textContent = item.interpreted;
  $('evidenceStory').textContent = `${label}: ${item.narrative}`;
  try {
    const added = window.StarProgress.unlock(activeId);
    $('visorStatus').textContent = added ? '★ Descubrimiento guardado en la bitácora.' :
      window.StarProgress.list().some(x => x.id === activeId) ? 'Esta pieza ya está en tu colección.' : 'No se pudo guardar en este navegador.';
  } catch { $('visorStatus').textContent = 'Podés explorar la ficha; el almacenamiento no está disponible.'; }
  window.StarSound?.effect('scan');
}
async function open(id) {
  if (!window.StarProgress?.catalog[id] || !parts[id]) return;
  if (!modal) build();
  const token = ++ticket;
  if (modal.hidden) {
    previousFocus = document.activeElement;
    // Libera teclas retenidas antes de aislar el diálogo del rover.
    window.dispatchEvent(new Event('blur'));
    background = [...document.body.children].filter(n => n !== modal && n.tagName !== 'SCRIPT').map(n => [n, n.inert]);
    background.forEach(([n]) => { n.inert = true; });
  }
  engine?.dispose(); engine = null; activeId = id; modal.hidden = false;
  const item = window.StarProgress.catalog[id];
  $('visorTitle').textContent = item.name; $('visorSource').href = item.source;
  $('visorFallback').hidden = false; $('visorFallback').textContent = 'Preparando el visor 3D… Las fichas ya están disponibles.';
  $('visorPins').replaceChildren(); $('visorParts').replaceChildren();
  $('visorStatus').textContent = ''; $('visorModelStatus').textContent = '';
  ['evidenceObserved', 'evidenceInterpreted', 'evidenceStory'].forEach(key => $(key).textContent = 'Seleccioná una pieza.');
  $('visorDust').hidden = id !== 'opportunity'; $('visorDust').textContent = 'Limpiar polvo';
  $('visorAuto').setAttribute('aria-pressed', 'false');
  ['visorAuto','visorReset','visorDust'].forEach(key => $(key).disabled = true);
  parts[id].forEach((label, index) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pixel-button small'; b.textContent = label;
    b.onclick = () => { engine?.focus(index); evidence(label); }; $('visorParts').append(b);
  });
  $('visorClose').focus();
  // Un rechazo del CDN no impide abrir, cerrar ni leer/guardar fichas.
  let timer;
  try {
    modulePromise ||= import('./visor-renderer.js').catch(error => { modulePromise = null; throw error; });
    const { createViewer } = await Promise.race([modulePromise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), 12000); })]);
    if (ticket !== token || modal.hidden) return;
    engine = createViewer($('visorViewport'), $('visorPins'), id, parts[id], index => evidence(parts[id][index]), message => {
      if (ticket === token) $('visorModelStatus').textContent = message;
    }, reduced);
    $('visorFallback').hidden = true;
    ['visorAuto','visorReset','visorDust'].forEach(key => $(key).disabled = false);
  } catch {
    if (ticket === token && !modal.hidden) $('visorFallback').textContent = 'El 3D no está disponible (WebGL o conexión). Explorá las piezas con los botones y guardá sus fichas.';
  } finally { clearTimeout(timer); }
}
function close() {
  if (!modal || modal.hidden) return;
  ++ticket; engine?.dispose(); engine = null; modal.hidden = true;
  background.forEach(([n, value]) => n.inert = value); background = [];
  window.StarSound?.stopVoice(); if (previousFocus?.isConnected) previousFocus.focus();
}
// Captura únicamente teclas del juego mientras el diálogo está abierto.
for (const kind of ['keydown','keyup']) window.addEventListener(kind, e => {
  if (modal && !modal.hidden && ['KeyA','KeyD','KeyE','ArrowLeft','ArrowRight'].includes(e.code)) e.stopImmediatePropagation();
}, true);
window.StarVisor = { open, close };
document.addEventListener('starstep:inspect', e => open(e.detail?.id));
window.addEventListener('pagehide', close);
