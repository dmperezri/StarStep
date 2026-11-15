"use strict";
/*
 * StarStep · Acto I · Exploración lunar (capturas 04 y 05).
 *
 * Se conecta con juego/luna.js (rover, cámara y escenario):
 *   - Oxígeno: 135 s efectivos (parámetro del minijuego, no un dato histórico). Se pausa con
 *     tarjetas, visor 3D, pausa o pestaña oculta. Tanques de recarga de +30 s. Si se agota,
 *     el rover vuelve al último punto seguro; lo registrado se conserva.
 *   - Caja de muestras (5): contingencia (primero), basalto 10057, regolito 10084, núcleo y
 *     el experimento SWC (no es una roca). Más la placa y la bandera.
 *   - Cada hallazgo: acercarse (StarFlow lo localiza) → E/ACCIÓN abre la tarjeta → INSPECCIONAR
 *     → GUARDAR → StarFlow inspecciona y registra. Nunca se registra sin la tarjeta.
 * El rover es una herramienta de simulación: Apollo 11 no tuvo vehículo (el LRV llegó con Apollo 15).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.StarMoonCore = api;
})(typeof window !== "undefined" ? window : null, function () {
  const WORLD_WIDTH = 3200;
  const O2_MAX = 135, O2_REFILL = 30, O2_WARN = 30;
  const RANGE = 70;
  const EAGLE_X = 420;
  const SOURCE_NSSDCA = "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C";
  const SOURCE_LSC = "https://curator.jsc.nasa.gov/lunar/lsc/";
  // x: posición en el mundo. kind: sample | experiment | memorial | tank | checkpoint.
  const POIS = Object.freeze([
    { id: "eagle", x: EAGLE_X, kind: "eagle" },
    { id: "cont", x: 640, kind: "sample", first: true },
    { id: "plaque", x: 820, kind: "memorial" },
    { id: "swc", x: 1060, kind: "experiment" },
    { id: "basalt10057", x: 1500, kind: "sample" },
    { id: "tank1", x: 1760, kind: "tank" },
    { id: "safe2", x: 2100, kind: "checkpoint" },
    { id: "regolith10084", x: 2260, kind: "sample" },
    { id: "core", x: 2650, kind: "sample" },
    { id: "tank2", x: 2900, kind: "tank" }
  ]);
  const BOX = Object.freeze(["cont", "basalt10057", "regolith10084", "core", "swc"]);
  const CARDS = Object.freeze({
    cont: {
      kind: { es: "MUESTRA GEOLÓGICA · LA PRIMERA", en: "GEOLOGICAL SAMPLE · THE FIRST ONE" },
      title: { es: "Muestra de contingencia", en: "Contingency sample" },
      observed: { es: "Minutos después de bajar, Armstrong guardó suelo y fragmentos de roca con un muestreador de mango largo.", en: "Minutes after stepping down, Armstrong bagged soil and rock fragments with a long-handled sampler." },
      interpreted: { es: "Si la misión tenía que terminar de golpe, al menos un pedazo de la Luna viajaría a la Tierra.", en: "If the mission had to end suddenly, at least a piece of the Moon would travel to Earth." },
      narrative: { es: "«Primero, asegurar un pedazo de la Luna.»", en: "“First, secure a piece of the Moon.”" },
      data: { es: "Apollo 11 · 20 de julio de 1969 · primera muestra tomada por personas en otro mundo.", en: "Apollo 11 · July 20, 1969 · the first sample collected by people on another world." },
      source: "NASA NSSDCA · Apollo 11 (1969-059C)", sourceUrl: SOURCE_NSSDCA
    },
    basalt10057: {
      kind: { es: "MUESTRA GEOLÓGICA · ROCA", en: "GEOLOGICAL SAMPLE · ROCK" },
      title: { es: "Roca · basalto 10057", en: "Rock · basalt 10057" },
      observed: { es: "Roca oscura de 919 g llena de agujeritos: las vesículas.", en: "A dark 919 g rock full of tiny holes: vesicles." },
      interpreted: { es: "Las vesículas son burbujas de gas atrapadas en lava que se enfrió: es basalto de unos 3.600 millones de años.", en: "The vesicles are gas bubbles trapped in cooling lava: it is basalt about 3.6 billion years old." },
      narrative: { es: "«La Luna recuerda el fuego.»", en: "“The Moon remembers the fire.”" },
      data: { es: "Basalto de mar rico en titanio, del Mar de la Tranquilidad.", en: "Titanium-rich mare basalt from the Sea of Tranquility." },
      source: "NASA · Lunar Sample Compendium", sourceUrl: SOURCE_LSC
    },
    regolith10084: {
      kind: { es: "MUESTRA GEOLÓGICA · SUELO", en: "GEOLOGICAL SAMPLE · SOIL" },
      title: { es: "Regolito lunar 10084", en: "Lunar regolith 10084" },
      observed: { es: "Polvo gris muy fino con granitos de roca y trocitos de vidrio brillante.", en: "Very fine gray dust with rock grains and shiny bits of glass." },
      interpreted: { es: "El regolito se forma por millones de años de impactos de micrometeoritos que muelen la roca; el vidrio se funde en esos impactos.", en: "Regolith forms over millions of years of micrometeorite impacts grinding the rock; the glass melts in those impacts." },
      narrative: { es: "«Cada grano guarda un golpe del espacio.»", en: "“Every grain keeps a blow from space.”" },
      data: { es: "Parte de la muestra de suelo a granel de Apollo 11.", en: "Part of Apollo 11's bulk soil sample." },
      source: "NASA · Lunar Sample Compendium", sourceUrl: SOURCE_LSC
    },
    core: {
      kind: { es: "MUESTRA GEOLÓGICA · NÚCLEO", en: "GEOLOGICAL SAMPLE · CORE" },
      title: { es: "Tubo de núcleo", en: "Core tube" },
      observed: { es: "Un tubo hueco clavado en el suelo con un martillo; al sacarlo, la tierra queda adentro.", en: "A hollow tube hammered into the ground; when pulled out, the soil stays inside." },
      interpreted: { es: "Conserva las capas del suelo en su orden, como una regla para leer su historia.", en: "It keeps the soil layers in order, like a ruler to read their history." },
      narrative: { es: "«Una columna de tiempo lunar.»", en: "“A column of lunar time.”" },
      data: { es: "Apollo 11 trajo 2 tubos de núcleo.", en: "Apollo 11 brought back 2 core tubes." },
      source: "NASA NSSDCA · Apollo 11 (1969-059C)", sourceUrl: SOURCE_NSSDCA
    },
    swc: {
      kind: { es: "EXPERIMENTO · NO ES UNA ROCA", en: "EXPERIMENT · NOT A ROCK" },
      title: { es: "Experimento de viento solar (SWC)", en: "Solar Wind Composition (SWC)" },
      observed: { es: "Una lámina de aluminio en un mástil, expuesta al Sol durante 77 minutos.", en: "An aluminum foil sheet on a pole, exposed to the Sun for 77 minutes." },
      interpreted: { es: "Atrapó partículas del viento solar, como helio y neón, para estudiar de qué está hecho el Sol.", en: "It trapped solar wind particles, such as helium and neon, to study what the Sun is made of." },
      narrative: { es: "«Una bandera para atrapar al Sol.»", en: "“A flag to catch the Sun.”" },
      data: { es: "Experimento suizo (Universidad de Berna). La lámina volvió a la Tierra para analizarla.", en: "Swiss experiment (University of Bern). The foil returned to Earth for analysis." },
      source: "NASA NSSDCA · Apollo 11 (1969-059C)", sourceUrl: SOURCE_NSSDCA
    },
    plaque: {
      kind: { es: "PATRIMONIO · MEMORIA", en: "HERITAGE · MEMORY" },
      title: { es: "Placa y bandera", en: "Plaque and flag" },
      observed: { es: "Una placa en una pata de Eagle y la bandera clavada cerca del módulo.", en: "A plaque on one of Eagle's legs and the flag planted near the module." },
      interpreted: { es: "La placa dice que vinieron «en paz, por toda la humanidad». Quedó en la etapa de descenso, que sigue en la Luna.", en: "The plaque says they came “in peace for all mankind”. It stayed on the descent stage, still on the Moon." },
      narrative: { es: "«Vinimos en paz.»", en: "“We came in peace.”" },
      data: { es: "Firmada por los tres astronautas y el presidente de EE. UU.", en: "Signed by the three astronauts and the U.S. president." },
      source: "NASA NSSDCA · Apollo 11 (1969-059C)", sourceUrl: SOURCE_NSSDCA
    }
  });
  // Oxígeno: solo baja cuando la exploración está activa.
  function stepOxygen(o2, dt, active) { return active ? Math.max(0, o2 - dt) : o2; }
  function refill(o2) { return Math.min(O2_MAX, o2 + O2_REFILL); }
  function near(roverCenter, poi) { return Math.abs(roverCenter - poi.x) <= RANGE; }
  // Las demás muestras se habilitan después de la de contingencia.
  function locked(id, registered) { return BOX.includes(id) && id !== "cont" && !registered.has("cont"); }
  function lastSafe(x) { const safes = POIS.filter(p => p.kind === "checkpoint" || p.kind === "eagle"); return safes.filter(p => p.x <= x).reduce((a, p) => (p.x > a ? p.x : a), EAGLE_X); }
  function formatO2(s) { const v = Math.ceil(s); return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`; }
  return Object.freeze({ WORLD_WIDTH, O2_MAX, O2_REFILL, O2_WARN, RANGE, EAGLE_X, POIS, BOX, CARDS, stepOxygen, refill, near, locked, lastSafe, formatO2 });
});

/* ── Navegador ───────────────────────────────────────────────── */
(function () {
  if (typeof window === "undefined" || typeof document === "undefined" || !window.StarMoonCore) return;
  const Core = window.StarMoonCore;
  const T = {
    es: { o2: "O₂", box: "Caja", left: "◀", right: "▶", action: "ACCIÓN", pause: "PAUSA", resume: "SEGUIR", save: "Guardar en la caja", saveMemorial: "Guardar en la bitácora",
      near: "Detecto {name}. Presioná E o ACCIÓN.", firstCont: "Primero la muestra de contingencia: está junto a Eagle.", tank: "Tanque de oxígeno: +30 s.", tankUsed: "Tanque vacío.",
      safe: "Punto seguro guardado.", empty: "¡Sin oxígeno! Volvemos al último punto seguro. Lo registrado se conserva.", warn: "Oxígeno bajo: buscá un tanque o un punto seguro.",
      sim: "El rover es una herramienta de simulación del juego: Apollo 11 no usó vehículo (el primero llegó con Apollo 15). Los tiempos de oxígeno son del minijuego.",
      intro: "LITO: Explorá con ◀ ▶ (A/D). Recogé las 5 piezas de la caja y revisá Eagle y la placa.", allDone: "LITO: ¡Exploración completa! Ahora toca instalar los instrumentos.", locked: "Esto se habilita más adelante en la misión." },
    en: { o2: "O₂", box: "Box", left: "◀", right: "▶", action: "ACTION", pause: "PAUSE", resume: "RESUME", save: "Save to the box", saveMemorial: "Save to logbook",
      near: "I detect {name}. Press E or ACTION.", firstCont: "Contingency sample first: it is next to Eagle.", tank: "Oxygen tank: +30 s.", tankUsed: "Empty tank.",
      safe: "Safe point saved.", empty: "Out of oxygen! Back to the last safe point. What you registered is kept.", warn: "Low oxygen: find a tank or a safe point.",
      sim: "The rover is a game simulation tool: Apollo 11 used no vehicle (the first came with Apollo 15). Oxygen times are minigame values.",
      intro: "LITO: Explore with ◀ ▶ (A/D). Collect the 5 box items and check Eagle and the plaque.", allDone: "LITO: Exploration complete! Next, install the instruments.", locked: "This unlocks later in the mission." }
  };
  const lang = () => (window.StarI18n?.lang === "en" ? "en" : "es");
  const t = (k, v) => { let s = T[lang()][k] ?? k; for (const [a, b] of Object.entries(v || {})) s = s.replace("{" + a + "}", b); return s; };
  const pick = v => (v && typeof v === "object" ? (v[lang()] ?? v.es) : v);
  const flow = () => window.StarFlow;
  const state = { o2: Core.O2_MAX, paused: false, safeX: Core.EAGLE_X, usedTanks: new Set(), input: { left: false, right: false, action: false }, prevAction: false, msg: null, msgUntil: 0, warned: false, lastNear: null };

  const registered = () => new Set(Core.BOX.concat(["plaque", "eagle"]).filter(id => flow()?.getArtifact?.(id)?.state === "registered"));
  const boxCount = () => Core.BOX.filter(id => flow()?.getArtifact?.(id)?.state === "registered").length;
  const overlayOpen = () => !!(window.StarScienceCard?.isOpen
    || (document.getElementById("visorModal") && !document.getElementById("visorModal").hidden)
    || document.getElementById("fallbackViewer")
    || [...(document.querySelectorAll?.(".mg") || [])].some(n => !n.hidden));
  const paused = () => state.paused || overlayOpen() || document.hidden === true;

  function name(id) { return pick(Core.CARDS[id]?.title) || id; }
  function say(text, ms = 3500) { state.msg = text; state.msgUntil = (performance?.now?.() || Date.now()) + ms; const m = document.getElementById("mensaje"); if (m) { delete m.dataset.i18n; m.textContent = text; } }

  // Tarjeta de un hallazgo: inspeccionar y confirmar registran en StarFlow.
  function openCard(id) {
    const F = flow(); if (!F) return;
    const card = Core.CARDS[id];
    if (F.getArtifact(id)?.state === "registered") { window.StarScienceCard?.open({ ...card, finished: true, preInspected: true, confirm: t("save"), icon: c => drawIcon(c, id) }); return; }
    const located = F.locateArtifact(id, { mechanic: id === "plaque" ? "rover_proximity_scan" : "sample_collect" });
    if (!located.ok) { say(located.code === "STAGE_LOCKED" ? t("locked") : located.code); return; }
    const begin = F.beginInspection(id, { context: "mission", viewer: "fallback" });
    if (!begin.ok) { say(begin.code); return; }
    window.StarScienceCard?.open({
      ...card, icon: c => drawIcon(c, id), confirm: id === "plaque" ? t("saveMemorial") : t("save"),
      onConfirm: () => {
        const comps = F.getArtifact(id)?.required || ["sample"];
        let last = null;
        for (const comp of comps) last = F.inspectComponent(id, comp, { context: "mission", viewer: "fallback" });
        const ok = F.getArtifact(id)?.state === "registered";
        renderHud();
        if (ok && Core.BOX.every(x => F.getArtifact(x)?.state === "registered") && F.getArtifact("plaque")?.state === "registered" && F.getArtifact("eagle")?.state === "registered") say(t("allDone"), 6000);
        return ok ? { ok: true } : { ok: false, message: last?.code || "" };
      }
    });
  }

  function update(dt, rover) {
    const center = rover.x + rover.width / 2;
    const active = !paused();
    if (active) {
      state.o2 = Core.stepOxygen(state.o2, dt, true);
      if (state.o2 <= Core.O2_WARN && !state.warned) { state.warned = true; say(t("warn")); window.StarSound?.effect?.("button"); }
      if (state.o2 <= 0) {
        rover.x = state.safeX - rover.width / 2; state.o2 = Core.O2_MAX; state.warned = false;
        say(t("empty"), 5000); window.StarSound?.effect?.("button");
      }
    }
    // Puntos seguros y tanques por contacto.
    for (const p of Core.POIS) {
      if (!Core.near(center, p)) continue;
      if ((p.kind === "checkpoint" || p.kind === "eagle") && state.safeX !== p.x && p.x > state.safeX - 1) { state.safeX = p.x; if (p.kind === "checkpoint") say(t("safe")); }
      if (p.kind === "tank" && !state.usedTanks.has(p.id)) { state.usedTanks.add(p.id); state.o2 = Core.refill(state.o2); state.warned = state.o2 <= Core.O2_WARN; say(t("tank")); window.StarSound?.effect?.("success"); }
    }
    // Interacción (E o ACCIÓN) con muestras, SWC y placa. Eagle la maneja luna.js.
    const near = Core.POIS.find(p => ["sample", "experiment", "memorial"].includes(p.kind) && Core.near(center, p));
    const action = !!state.input.action;
    if (near && near.id !== state.lastNear) {
      state.lastNear = near.id;
      const reg = registered();
      if (!reg.has(near.id)) {
        if (Core.locked(near.id, reg)) say(t("firstCont"));
        else { flow()?.locateArtifact?.(near.id, { mechanic: near.id === "plaque" ? "rover_proximity_scan" : "sample_collect" }); say(t("near", { name: name(near.id) })); }
      }
    } else if (!near) state.lastNear = null;
    if (active && near && action && !state.prevAction) {
      if (Core.locked(near.id, registered())) say(t("firstCont"));
      else openCard(near.id);
    }
    state.prevAction = action;
    renderHud();
  }

  // ── Dibujo en el mundo (dentro de la cámara de luna.js) ──
  function px(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
  function drawIcon(c, id) {
    px(c, 0, 0, 48, 48, "#262C66");
    if (id === "swc") { px(c, 22, 6, 3, 36, "#C3C7D6"); px(c, 8, 8, 32, 18, "#FFF8E7"); px(c, 8, 8, 32, 2, "#868CA4"); return; }
    if (id === "plaque") { px(c, 20, 8, 3, 34, "#C3C7D6"); px(c, 23, 8, 16, 10, "#FFF8E7"); px(c, 23, 8, 7, 5, "#4F86D9"); px(c, 6, 26, 12, 10, "#FFE066"); return; }
    if (id === "core") { px(c, 20, 4, 8, 38, "#868CA4"); px(c, 22, 6, 4, 34, "#575C74"); px(c, 18, 2, 12, 4, "#FFE066"); return; }
    const col = id === "regolith10084" ? "#868CA4" : id === "cont" ? "#C3C7D6" : "#575C74";
    px(c, 10, 18, 28, 20, col); px(c, 14, 14, 20, 4, col); px(c, 16, 22, 3, 3, "#3E4256"); px(c, 26, 28, 3, 3, "#3E4256"); px(c, 30, 20, 2, 2, "#3E4256");
  }
  function drawWorld(ctx, groundY) {
    const reg = registered();
    for (const p of Core.POIS) {
      const x = p.x, y = groundY;
      if (p.kind === "tank") { if (!state.usedTanks.has(p.id)) { px(ctx, x - 6, y - 22, 12, 22, "#8FF0D8"); px(ctx, x - 4, y - 26, 8, 4, "#FFF8E7"); } continue; }
      if (p.kind === "checkpoint") { px(ctx, x - 2, y - 40, 4, 40, "#C3C7D6"); px(ctx, x + 2, y - 40, 14, 8, state.safeX >= x ? "#8FF0D8" : "#868CA4"); continue; }
      if (p.kind === "eagle") continue;
      const done = reg.has(p.id), lock = Core.locked(p.id, reg);
      if (p.kind === "memorial") { px(ctx, x - 1, y - 54, 3, 54, "#C3C7D6"); px(ctx, x + 2, y - 54, 26, 16, "#FFF8E7"); px(ctx, x + 2, y - 54, 11, 9, "#4F86D9"); for (let i = 0; i < 3; i++) px(ctx, x + 13, y - 52 + i * 5, 15, 2, "#D9593A"); }
      else if (p.kind === "experiment") { px(ctx, x - 1, y - 50, 3, 50, "#C3C7D6"); px(ctx, x + 2, y - 50, 22, 30, "#FFF8E7"); }
      else { px(ctx, x - 9, y - 12, 18, 12, p.id === "regolith10084" ? "#868CA4" : "#575C74"); px(ctx, x - 6, y - 16, 12, 4, "#575C74"); }
      // Marcador: amarillo pendiente, menta registrado, gris bloqueado.
      px(ctx, x - 4, y - 74, 8, 8, done ? "#8FF0D8" : lock ? "#868CA4" : "#FFE066");
    }
  }

  // ── HUD (DOM) y controles táctiles ──
  let hud = null;
  function buildHud() {
    const canvas = document.getElementById("gameCanvas"); if (!canvas || hud) return;
    const box = document.createElement("div"); box.className = "moon-hud"; box.id = "moonHud";
    const o2 = document.createElement("div"); o2.className = "moon-o2"; o2.setAttribute("role", "status");
    const o2label = document.createElement("span"); const meter = document.createElement("div"); meter.className = "mg-meter"; const bar = document.createElement("i"); meter.append(bar); const o2val = document.createElement("span");
    o2.append(o2label, meter, o2val);
    const count = document.createElement("span"); count.className = "moon-o2";
    const mk = (cls, key) => { const b = document.createElement("button"); b.type = "button"; b.className = "mg-btn " + cls; b.dataset.key = key; return b; };
    const left = mk("", "left"), right = mk("", "right"), action = mk("primary", "action"), pause = mk("", "pause");
    for (const b of [left, right, action]) {
      const on = e => { e.preventDefault?.(); state.input[b.dataset.key] = true; };
      const off = () => { state.input[b.dataset.key] = false; };
      b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointerleave", off); b.addEventListener("pointercancel", off);
    }
    pause.addEventListener("click", () => { state.paused = !state.paused; renderHud(); });
    box.append(o2, count, left, right, action, pause);
    const note = document.createElement("p"); note.className = "moon-sim-note";
    canvas.insertAdjacentElement?.("afterend", box); box.insertAdjacentElement?.("afterend", note);
    hud = { box, o2, o2label, bar, o2val, count, left, right, action, pause, note };
    renderHud();
  }
  function renderHud() {
    if (!hud) return;
    hud.o2label.textContent = t("o2"); hud.o2val.textContent = Core.formatO2(state.o2);
    hud.bar.style && (hud.bar.style.width = `${Math.round(state.o2 / Core.O2_MAX * 100)}%`);
    hud.o2.className = "moon-o2" + (state.o2 <= 10 ? " crit" : state.o2 <= Core.O2_WARN ? " warn" : "");
    hud.count.textContent = `${t("box")} ${boxCount()}/${Core.BOX.length}`;
    hud.left.textContent = t("left"); hud.right.textContent = t("right"); hud.action.textContent = t("action");
    hud.pause.textContent = state.paused ? t("resume") : t("pause"); hud.pause.setAttribute("aria-pressed", String(state.paused));
    hud.note.textContent = t("sim");
  }
  window.addEventListener?.("keydown", e => { if (e.code === "KeyE") state.input.action = true; if (e.code === "KeyP") { state.paused = !state.paused; renderHud(); } });
  window.addEventListener?.("keyup", e => { if (e.code === "KeyE") state.input.action = false; });
  document.addEventListener("starstep:language", renderHud);
  // El mensaje inicial va después de que main.js aplique las traducciones de la página.
  const start = () => { buildHud(); setTimeout(() => say(t("intro"), 8000), 0); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  window.StarMoonMission = Object.freeze({
    update, drawWorld, openCard, paused,
    keys(base) { return { ...base, ArrowLeft: base.ArrowLeft || state.input.left, ArrowRight: base.ArrowRight || state.input.right, KeyE: base.KeyE || state.input.action }; },
    get state() { return { o2: state.o2, safeX: state.safeX, paused: paused(), box: boxCount(), usedTanks: [...state.usedTanks] }; }
  });
})();
