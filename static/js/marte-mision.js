"use strict";
/*
 * StarStep · Acto II · Misión en Marte (capturas 08, 09 y 11). Se apoya en el escenario,
 * la guía y el viaje de feature/integracion-visual (marte.js, viaje-marte.js) sin rehacerlos.
 *   mars_transition: tras la cinemática del viaje, nota de conexión narrativa (Apollo 11 y
 *                    Opportunity son misiones distintas) → mars_transition.seen.
 *   mars_landing:    aterrizaje jugable: paracaídas, retrocohetes y bolsas en su ventana →
 *                    rebotes → «hoyo en uno» en el cráter Eagle → mars_landing.touchdown.
 *   Ruta:            el rover avanza con batería (se gasta al moverse, se recarga detenido) hasta
 *                    las estaciones: plataforma (lander), cráter Eagle (hematita), Homestake
 *                    (yeso), Esperance (arcillas), habitabilidad y Perseverance Valley (tormenta).
 *   mars_storm:      tormenta de 2018: con τ en aumento, administrar la energía para enviar la
 *                    última imagen. Se puede perder. Opportunity no se recuperó: la misión
 *                    terminó oficialmente en febrero de 2019.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.StarMarsCore = api;
})(typeof window !== "undefined" ? window : null, function () {
  // Aterrizaje: altura (km) cae cada paso; cada acción tiene una ventana correcta.
  const LANDING = Object.freeze([
    { id: "chute", from: 11, to: 7 }, { id: "rockets", from: 0.35, to: 0.1 }, { id: "bags", from: 0.1, to: 0.01 }
  ]);
  function landingAction(alt, phase) { const w = LANDING[phase]; if (!w) return "done"; return alt <= w.from && alt >= w.to ? "ok" : alt > w.from ? "early" : "late"; }
  // Ruta: posiciones (0–1000) y la etapa de StarFlow que habilita cada estación.
  const STATIONS = Object.freeze([
    { id: "lander", x: 120, stage: "mars_exploration" }, { id: "eagle_crater", x: 300, stage: "mars_hematite" },
    { id: "homestake", x: 560, stage: "mars_gypsum" }, { id: "esperance", x: 760, stage: "mars_clay" },
    { id: "habitability", x: 800, stage: "mars_habitability" }, { id: "perseverance", x: 940, stage: "mars_storm" }
  ]);
  const ENERGY = Object.freeze({ max: 100, perMove: 2, recharge: 6 });
  function drive(s, dir) { if (s.energy < ENERGY.perMove) return { ...s, blocked: true }; return { ...s, x: Math.max(0, Math.min(1000, s.x + dir * 20)), energy: s.energy - ENERGY.perMove, blocked: false }; }
  function rest(s) { return { ...s, energy: Math.min(ENERGY.max, s.energy + ENERGY.recharge), blocked: false }; }
  // Tormenta: cada sol, τ sube y la energía solar baja. Decisiones con consecuencias.
  // Parámetros del minijuego inspirados en la tormenta real (τ llegó a 10,8); no son datos de ingeniería.
  const STORM = Object.freeze({ sols: 6, taus: [1.0, 2.1, 4.7, 7.3, 9.5, 10.8], battery: 60, critical: 10, coldTau: 4.7, coldPenalty: 15, photoTau: 9 });
  const ACTIONS = Object.freeze({ science: 18, heaters: 10, minimal: 4, photo: 12, transmit: 14 });
  function solar(tau) { return Math.round(30 * Math.exp(-tau / 2.5)); }
  // Un sol: la batería recibe la energía solar y paga las acciones elegidas. Sin calefactores
  // cuando el polvo enfría (τ ≥ 4,7) el frío cuesta batería. La «última imagen» solo vale con
  // la tormenta en su peor momento (τ ≥ 9) y hay que transmitirla.
  function stormSol(s, actions) {
    const tau = STORM.taus[s.sol] ?? STORM.taus[STORM.taus.length - 1];
    const cold = tau >= STORM.coldTau && !actions.includes("heaters");
    const cost = actions.reduce((sum, a) => sum + (ACTIONS[a] || 0), 0) + (cold ? STORM.coldPenalty : 0);
    const battery = Math.max(0, Math.min(100, s.battery + solar(tau) - cost));
    const photoNow = actions.includes("photo") && tau >= STORM.photoTau;
    const photo = s.photo || photoNow;
    const sent = s.sent || (photo && actions.includes("transmit") && (s.photo || photoNow));
    const n = { sol: s.sol + 1, battery, tau, photo, sent, cold, earlyPhoto: actions.includes("photo") && tau < STORM.photoTau };
    n.result = sent ? "sent" : battery <= STORM.critical ? "lost" : n.sol >= STORM.sols ? "lost" : null;
    return n;
  }
  return Object.freeze({ LANDING, landingAction, STATIONS, ENERGY, drive, rest, STORM, ACTIONS, solar, stormSol });
});

/* ── Navegador ───────────────────────────────────────────────── */
(function () {
  if (typeof window === "undefined" || typeof document === "undefined" || !window.StarMarsCore) return;
  const Core = window.StarMarsCore;
  const T = {
    es: { close: "CERRAR ✕", next: "CONTINUAR ›", retry: "REINTENTAR",
      transTitle: "Una conexión entre dos historias", transText: "Este viaje une dos misiones reales y distintas: Apollo 11 llegó a la Luna en 1969 con tres astronautas; Opportunity, un rover robótico, llegó a Marte en 2004. Apollo 11 nunca viajó a Marte: el juego conecta sus historias.",
      landTitle: "Aterrizaje de Opportunity", landText: "Enero de 2004. Opportunity entra a la atmósfera de Marte dentro de su escudo. Pulsá cada acción en su momento: 1) PARACAÍDAS entre 11 y 7 km, 2) RETROCOHETES cerca del suelo, 3) SOLTAR BOLSAS justo antes de tocar.",
      start: "COMENZAR DESCENSO", chute: "PARACAÍDAS", rockets: "RETROCOHETES", bags: "SOLTAR BOLSAS", alt: "Altura: {a} km", early: "¡Muy pronto!", late: "¡Muy tarde!",
      bounce: "¡Rebote! ¡Otro rebote! Las bolsas de aire rodaron por la llanura…", landed: "¡Hoyo en uno! Opportunity terminó dentro de un cráter pequeño: el cráter Eagle, cuyo nombre recuerda al módulo de Apollo 11.",
      routeBtn: "RUTA DE OPPORTUNITY", routeTitle: "Ruta de Opportunity", routeText: "Mové el rover (◀ ▶). Moverse gasta batería; detenido, los paneles la recargan. Al llegar a una estación, pulsá INVESTIGAR.",
      energy: "Batería: {e}%", charge: "CARGAR ☀", investigate: "INVESTIGAR", noEnergy: "Sin batería: esperá a que los paneles carguen.", locked: "Esta estación se habilita más adelante.", done: "Estación completada.",
      st_lander: "Plataforma de aterrizaje · 2004", st_eagle_crater: "Cráter Eagle · hematita · 2004", st_homestake: "Homestake · yeso · 2011", st_esperance: "Esperance · arcillas · 2013", st_habitability: "¿Hubo vida en Marte?", st_perseverance: "Perseverance Valley · tormenta · 2018",
      landerKind: "PATRIMONIO · MARTE", landerTitle: "Plataforma de aterrizaje de Opportunity", landerObs: "La plataforma con restos de las bolsas de aire quedó dentro del cráter Eagle.", landerInt: "Protegió al rover en la llegada y después le abrió el camino para bajar y explorar.", landerNarr: "«Un hoyo en uno en Marte.»",
      stormTitle: "Tormenta de polvo de 2018", stormText: "Junio de 2018. Una tormenta global oscurece el cielo (opacidad τ). Los paneles casi no cargan. Elegí hasta 2 acciones por sol. Racioná la batería: con τ ≥ 4,7 el frío exige CALEFACTORES. La última imagen tiene que mostrar la tormenta en su peor momento (τ ≥ 9) y transmitirse antes de que la batería llegue al mínimo.",
      sol: "Sol {n}/{t} · τ {tau} · Solar +{s}", battery: "Batería: {b}%", science: "CIENCIA (−18)", heaters: "CALEFACTORES (−10)", minimal: "MODO MÍNIMO (−4)", photo: "TOMAR FOTO (−12)", transmit: "TRANSMITIR (−14)", endSol: "TERMINAR SOL",
      lost: "La batería se agotó antes de enviar la imagen. Administrá mejor la energía y reintentá.", sent: "La última imagen llegó a la Tierra: un cielo casi negro con el Sol como un punto tenue (τ 10,8). Después, Opportunity se quedó en silencio y no volvió a despertar. La misión terminó en febrero de 2019, tras más de 14 años y 45 km recorridos.",
      pick: "Elegí hasta 2 acciones.", cold: "Sin calefactores, el frío gastó batería.", early: "La foto todavía no muestra lo peor de la tormenta (τ < 9)." },
    en: { close: "CLOSE ✕", next: "CONTINUE ›", retry: "RETRY",
      transTitle: "A link between two stories", transText: "This trip joins two real, different missions: Apollo 11 reached the Moon in 1969 with three astronauts; Opportunity, a robotic rover, reached Mars in 2004. Apollo 11 never traveled to Mars: the game connects their stories.",
      landTitle: "Opportunity's landing", landText: "January 2004. Opportunity enters Mars's atmosphere inside its heat shield. Press each action at the right time: 1) PARACHUTE between 11 and 7 km, 2) ROCKETS near the ground, 3) RELEASE AIRBAGS right before touching.",
      start: "BEGIN DESCENT", chute: "PARACHUTE", rockets: "ROCKETS", bags: "RELEASE AIRBAGS", alt: "Altitude: {a} km", early: "Too early!", late: "Too late!",
      bounce: "Bounce! Another bounce! The airbags rolled across the plain…", landed: "Hole in one! Opportunity ended up inside a small crater: Eagle Crater, whose name recalls Apollo 11's module.",
      routeBtn: "OPPORTUNITY'S ROUTE", routeTitle: "Opportunity's route", routeText: "Move the rover (◀ ▶). Moving uses battery; when stopped, the panels recharge it. At a station, press INVESTIGATE.",
      energy: "Battery: {e}%", charge: "CHARGE ☀", investigate: "INVESTIGATE", noEnergy: "No battery: wait for the panels to charge.", locked: "This station unlocks later.", done: "Station complete.",
      st_lander: "Landing platform · 2004", st_eagle_crater: "Eagle Crater · hematite · 2004", st_homestake: "Homestake · gypsum · 2011", st_esperance: "Esperance · clays · 2013", st_habitability: "Was there life on Mars?", st_perseverance: "Perseverance Valley · storm · 2018",
      landerKind: "HERITAGE · MARS", landerTitle: "Opportunity's landing platform", landerObs: "The platform with the airbag remains stayed inside Eagle Crater.", landerInt: "It protected the rover on arrival and then opened the way for it to roll off and explore.", landerNarr: "“A hole in one on Mars.”",
      stormTitle: "The 2018 dust storm", stormText: "June 2018. A global storm darkens the sky (opacity τ). The panels barely charge. Choose up to 2 actions per sol. Ration the battery: with τ ≥ 4.7 the cold requires HEATERS. The last image must show the storm at its worst (τ ≥ 9) and be transmitted before the battery hits the minimum.",
      sol: "Sol {n}/{t} · τ {tau} · Solar +{s}", battery: "Battery: {b}%", science: "SCIENCE (−18)", heaters: "HEATERS (−10)", minimal: "MINIMAL MODE (−4)", photo: "TAKE PHOTO (−12)", transmit: "TRANSMIT (−14)", endSol: "END SOL",
      lost: "The battery ran out before sending the image. Manage energy better and retry.", sent: "The last image reached Earth: an almost black sky with the Sun as a faint dot (τ 10.8). Then Opportunity went silent and never woke up. The mission ended in February 2019, after more than 14 years and 45 km driven.",
      pick: "Choose up to 2 actions.", cold: "Without heaters, the cold drained battery.", early: "The photo does not yet show the worst of the storm (τ < 9)." }
  };
  const lang = () => (window.StarI18n?.lang === "en" ? "en" : "es");
  const t = (k, v) => { let s = T[lang()][k] ?? k; for (const [a, b] of Object.entries(v || {})) s = s.replace("{" + a + "}", b); return s; };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const F = () => window.StarFlow;
  const stage = () => F()?.getCurrentStage?.();
  function shell(title, text) {
    const root = el("section", "mg"); root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true");
    const panel = el("div", "mg-panel"); const close = el("button", "mg-btn", t("close")); close.type = "button";
    panel.append(close, el("h2", "mg-title", title), el("p", "mg-text", text)); root.append(panel); document.body.append(root);
    const hide = () => { root.hidden = true; refresh(); };
    close.addEventListener("click", hide); root.addEventListener("keydown", e => { if (e.key === "Escape") hide(); });
    return { root, panel, hide };
  }

  // ── Transición narrativa ──
  function openTransition() {
    if (stage() !== "mars_transition") return false;
    const ui = shell(t("transTitle"), t("transText"));
    const go = el("button", "mg-btn primary", t("next")); go.type = "button"; const row = el("div", "mg-actions"); row.append(go); ui.panel.append(row);
    go.addEventListener("click", () => { F().recordObjective("mars_transition.seen", { source: "transition_sequence" }); ui.hide(); if (stage() === "mars_landing") openLanding(); });
    return ui;
  }

  // ── Aterrizaje ──
  let landing = null;
  function openLanding() {
    if (stage() !== "mars_landing") return false;
    const ui = shell(t("landTitle"), t("landText"));
    const canvas = el("canvas", "mg-canvas"); canvas.width = 480; canvas.height = 220;
    const hud = el("div", "mg-hud"); const altEl = el("span"); hud.append(altEl);
    const pad = el("div", "mg-pad"); const feedback = el("p", "mg-feedback"); feedback.setAttribute("aria-live", "polite");
    const go = el("button", "mg-btn primary", t("start")); go.type = "button";
    const acts = Core.LANDING.map((w, i) => { const b = el("button", "mg-btn", t(w.id)); b.type = "button"; b.dataset.action = w.id; b.disabled = true; b.addEventListener("click", () => act(i)); pad.append(b); return b; });
    const row = el("div", "mg-actions"); row.append(go);
    ui.panel.append(canvas, hud, pad, feedback, row);
    let alt = 125, phase = 0, running = false, done = false;
    function draw() {
      const c = canvas.getContext?.("2d"); if (!c) return;
      const sky = ["#4a293b", "#78363b", "#b4513e", "#e79a69"]; sky.forEach((col, i) => { c.fillStyle = col; c.fillRect(0, i * 45, 480, 45); });
      c.fillStyle = "#A63A26"; c.fillRect(0, 180, 480, 40); c.fillStyle = "#7A2818"; c.fillRect(300, 186, 60, 10);
      const y = Math.max(10, 180 - Math.min(170, alt * 1.4));
      c.fillStyle = phase >= 1 ? "#FFF8E7" : "#FFC93C"; if (phase >= 1) c.fillRect(226, y - 30, 28, 10);
      c.fillStyle = phase >= 3 ? "#F7B08E" : "#868CA4"; c.fillRect(232, y - 10, 16, 14);
    }
    function render() { altEl.textContent = t("alt", { a: alt.toFixed(alt < 1 ? 2 : 0) }); acts.forEach((b, i) => { b.disabled = !running || i !== phase; }); draw(); }
    function tick(dt) {
      if (!running || done) return;
      const rate = phase === 0 ? 14 : phase === 1 ? 2.2 : 0.18;
      alt = Math.max(0, alt - rate * dt);
      const w = Core.LANDING[phase];
      if (w && alt < w.to) { fail(t("late")); return; }
      render();
    }
    function fail(msg) { running = false; feedback.textContent = msg + " " + t("retry"); go.textContent = t("retry"); go.disabled = false; render(); }
    function act(i) {
      if (!running || i !== phase) return;
      const r = Core.landingAction(alt, phase);
      if (r !== "ok") { fail(r === "early" ? t("early") : t("late")); return; }
      phase++; window.StarSound?.effect?.("button");
      if (phase === Core.LANDING.length) {
        running = false; done = true; feedback.textContent = t("bounce") + " " + t("landed");
        F().recordObjective("mars_landing.touchdown", { source: "mars_landing_sequence" });
        go.textContent = t("next"); go.disabled = false; window.StarSound?.effect?.("success");
      }
      render();
    }
    let raf = 0, last = 0;
    const loop = now => { if (!running) return; const dt = last ? Math.min(0.1, (now - last) / 1000) : 0; last = now; tick(dt); raf = requestAnimationFrame(loop); };
    go.addEventListener("click", () => {
      if (done) { ui.hide(); openRoute(); return; }
      alt = 125; phase = 0; running = true; done = false; feedback.textContent = ""; go.disabled = true; last = 0; render();
      if (typeof requestAnimationFrame === "function") raf = requestAnimationFrame(loop);
    });
    landing = { tick, act, get state() { return { alt, phase, running, done }; }, start: () => go.click(), ui };
    render(); return landing;
  }

  // ── Ruta de Opportunity ──
  let route = null;
  const stationDone = id => {
    const f = F(); if (!f) return false;
    return { lander: f.getArtifact("lander")?.state === "registered", eagle_crater: f.getArtifact("blueberries")?.state === "registered",
      homestake: f.getArtifact("gypsum")?.state === "registered", esperance: f.getArtifact("clay")?.state === "registered",
      habitability: f.isStageCompleted("mars_habitability"), perseverance: f.isStageCompleted("mars_storm") }[id];
  };
  function openRoute() {
    const ui = shell(t("routeTitle"), t("routeText"));
    const canvas = el("canvas", "mg-canvas"); canvas.width = 500; canvas.height = 160;
    const hud = el("div", "mg-hud"); const en = el("span"); const where = el("span"); hud.append(en, where);
    const pad = el("div", "mg-pad"); const feedback = el("p", "mg-feedback"); feedback.setAttribute("aria-live", "polite");
    const mk = (label, fn, cls = "") => { const b = el("button", "mg-btn " + cls, label); b.type = "button"; b.addEventListener("click", fn); pad.append(b); return b; };
    let s = { x: route?.state?.x ?? 0, energy: route?.state?.energy ?? Core.ENERGY.max };
    mk("◀", () => move(-1)); mk("▶", () => move(1)); const charge = mk(t("charge"), () => { s = Core.rest(s); render(); }); const inv = mk(t("investigate"), investigate, "primary");
    ui.panel.append(canvas, hud, pad, feedback);
    function near() { return Core.STATIONS.find(st => Math.abs(st.x - s.x) <= 30); }
    function move(dir) { const n = Core.drive(s, dir); if (n.blocked) { feedback.textContent = t("noEnergy"); render(); return; } s = n; feedback.textContent = ""; render(); }
    function investigate() {
      const st = near(); if (!st) return;
      if (stationDone(st.id)) { feedback.textContent = t("done"); return; }
      if (stage() !== st.stage) { feedback.textContent = t("locked"); return; }
      ui.hide();
      if (st.id === "lander") openLander();
      else if (st.id === "eagle_crater") window.StarHematiteEnigma?.open();
      else if (st.id === "homestake") window.StarMarsEnigmas?.open("gypsum");
      else if (st.id === "esperance") window.StarMarsEnigmas?.open("clay");
      else if (st.id === "habitability") window.StarMarsEnigmas?.openHabitability();
      else if (st.id === "perseverance") openStorm();
    }
    function draw() {
      const c = canvas.getContext?.("2d"); if (!c) return;
      c.fillStyle = "#D9593A"; c.fillRect(0, 0, 500, 160); c.fillStyle = "#A63A26"; c.fillRect(0, 110, 500, 50);
      c.fillStyle = "#7A2818"; for (let x = 0; x < 500; x += 6) c.fillRect(x, 108 + Math.round(Math.sin(x * .05) * 3), 6, 3);
      for (const st of Core.STATIONS) { const x = 20 + st.x * 0.46; c.fillStyle = stationDone(st.id) ? "#8FF0D8" : stage() === st.stage ? "#FFE066" : "#575C74"; c.fillRect(x - 3, 70, 6, 40); c.fillRect(x - 8, 62, 16, 10); }
      const rx = 20 + s.x * 0.46; c.fillStyle = "#4F86D9"; c.fillRect(rx - 12, 92, 24, 4); c.fillStyle = "#C3C7D6"; c.fillRect(rx - 8, 96, 16, 8); c.fillStyle = "#262C66"; c.fillRect(rx - 10, 104, 6, 6); c.fillRect(rx + 4, 104, 6, 6);
    }
    function render() { en.textContent = t("energy", { e: Math.round(s.energy) }); const st = near(); where.textContent = st ? t("st_" + st.id) : "—"; inv.disabled = !st; draw(); route.state = s; }
    ui.root.addEventListener("keydown", e => { if (e.key === "ArrowLeft") move(-1); if (e.key === "ArrowRight") move(1); });
    route = { ui, move, investigate, charge: () => charge.click(), state: s, get pos() { return s; } };
    render(); return route;
  }

  function openLander() {
    const f = F(); if (!f || stage() !== "mars_exploration") return false;
    const loc = f.locateArtifact("lander", { mechanic: "mars_rover_scan" }); if (!loc.ok) return false;
    f.beginInspection("lander", { context: "mission", viewer: "fallback" });
    window.StarScienceCard?.open({
      kind: { es: T.es.landerKind, en: T.en.landerKind }, title: { es: T.es.landerTitle, en: T.en.landerTitle },
      photo: { src: "/static/assets/nasa/opportunity-eagle.webp", caption: { es: "Cráter Eagle desde el borde · Foto real NASA/JPL/Cornell", en: "Eagle Crater from the rim · Real photo NASA/JPL/Cornell" }, alt: { es: "Cráter Eagle con la plataforma en el centro", en: "Eagle Crater with the platform in the center" } },
      observed: { es: T.es.landerObs, en: T.en.landerObs }, interpreted: { es: T.es.landerInt, en: T.en.landerInt }, narrative: { es: T.es.landerNarr, en: T.en.landerNarr },
      source: "NASA Science · Mars Exploration Rovers", sourceUrl: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
      confirm: { es: "Guardar en la bitácora", en: "Save to logbook" },
      onConfirm: () => { for (const c of ["platform", "airbags"]) f.inspectComponent("lander", c, { context: "mission", viewer: "fallback" }); return { ok: f.getArtifact("lander").state === "registered" }; },
      onClose: refresh
    });
    return true;
  }

  // ── Tormenta ──
  let storm = null;
  function openStorm() {
    if (stage() !== "mars_storm") return false;
    const ui = shell(t("stormTitle"), t("stormText"));
    const canvas = el("canvas", "mg-canvas"); canvas.width = 480; canvas.height = 160;
    const hud = el("div", "mg-hud"); const solEl = el("span"), batEl = el("span"); hud.append(solEl, batEl);
    const meter = el("div", "mg-meter"); const bar = el("i"); meter.append(bar);
    const opts = el("div", "mg-options"); const feedback = el("p", "mg-feedback"); feedback.setAttribute("aria-live", "polite");
    const row = el("div", "mg-actions"); const end = el("button", "mg-btn primary", t("endSol")); end.type = "button"; row.append(end);
    ui.panel.append(canvas, hud, meter, el("p", "mg-kicker", t("pick")), opts, feedback, row);
    let s = { sol: 0, battery: Core.STORM.battery, tau: Core.STORM.taus[0], photo: false, sent: false, result: null }; const chosen = new Set();
    const buttons = Object.keys(Core.ACTIONS).map(a => { const b = el("button", "mg-option", t(a)); b.type = "button"; b.dataset.action = a;
      b.addEventListener("click", () => { if (s.result) return; if (chosen.has(a)) chosen.delete(a); else { if (chosen.size >= 2) chosen.delete([...chosen][0]); chosen.add(a); } render(); }); opts.append(b); return b; });
    function draw() {
      const c = canvas.getContext?.("2d"); if (!c) return;
      const dark = Math.min(1, s.tau / 11);
      c.fillStyle = `rgb(${Math.round(150 - 110 * dark)},${Math.round(90 - 65 * dark)},${Math.round(60 - 45 * dark)})`; c.fillRect(0, 0, 480, 160);
      c.fillStyle = `rgba(255,248,231,${1 - dark * 0.85})`; c.fillRect(380, 30, 16, 16);
      c.fillStyle = "#7A2818"; c.fillRect(0, 120, 480, 40); c.fillStyle = "#C3C7D6"; c.fillRect(200, 100, 40, 14); c.fillStyle = "#4F86D9"; c.fillRect(190, 96, 60, 4);
      c.fillStyle = "rgba(247,176,142,.5)"; for (let i = 0; i < 60 * dark; i++) c.fillRect((i * 53) % 480, (i * 29) % 120, 2, 1);
    }
    function render() {
      const tau = Core.STORM.taus[Math.min(s.sol, Core.STORM.taus.length - 1)];
      solEl.textContent = t("sol", { n: Math.min(s.sol + 1, Core.STORM.sols), t: Core.STORM.sols, tau: tau.toFixed(1), s: Core.solar(tau) });
      batEl.textContent = t("battery", { b: Math.round(s.battery) }); bar.style && (bar.style.width = `${s.battery}%`);
      for (const b of buttons) { b.setAttribute("aria-pressed", String(chosen.has(b.dataset.action))); b.disabled = !!s.result; }
      end.textContent = s.result === "lost" ? t("retry") : s.result === "sent" ? t("next") : t("endSol");
      draw();
    }
    end.addEventListener("click", () => {
      if (s.result === "sent") { ui.hide(); return; }
      if (s.result === "lost") { s = { sol: 0, battery: Core.STORM.battery, tau: Core.STORM.taus[0], photo: false, sent: false, result: null }; chosen.clear(); feedback.textContent = ""; render(); return; }
      s = Core.stormSol(s, [...chosen]); chosen.clear();
      if (s.result === "sent") { F().recordObjective("mars_storm.survive", { source: "storm_2018_minigame" }); feedback.textContent = t("sent"); window.StarSound?.effect?.("success"); }
      else if (s.result === "lost") feedback.textContent = t("lost");
      else feedback.textContent = [s.cold ? t("cold") : "", s.earlyPhoto ? t("early") : ""].filter(Boolean).join(" ");
      render();
    });
    storm = { ui, choose: a => buttons.find(b => b.dataset.action === a)?.click(), endSol: () => end.click(), get state() { return s; } };
    render(); return storm;
  }

  // Botón principal en el panel de Marte, según la etapa.
  let launcher = null;
  function refresh() {
    const list = document.querySelector?.(".mars-panel .station-list") || document.getElementById("marsActions");
    if (!launcher && list) { launcher = el("button", "pixel-button mint"); launcher.type = "button"; launcher.id = "openMarsRoute"; launcher.addEventListener("click", primary); list.prepend?.(launcher) ?? list.append(launcher); }
    if (launcher) { const st = stage(); launcher.textContent = st === "mars_transition" ? t("transTitle") : st === "mars_landing" ? t("landTitle") : t("routeBtn"); launcher.hidden = !st || !String(st).startsWith("mars_") && st !== "mars_transition"; }
  }
  function primary() { const st = stage(); if (st === "mars_transition") openTransition(); else if (st === "mars_landing") openLanding(); else openRoute(); }
  document.addEventListener("starflow:change", refresh);
  document.addEventListener("starstep:language", refresh);
  document.addEventListener("starstep:mars-refresh", refresh);
  // Al terminar (o saltar) la cinemática del viaje, se muestra la nota de conexión narrativa.
  function afterTransit() {
    const overlay = document.getElementById("starMarsTransit");
    if (overlay && !overlay.hidden) { setTimeout(afterTransit, 500); return; }
    if (stage() === "mars_transition") openTransition();
  }
  const start = () => { setTimeout(refresh, 0); setTimeout(afterTransit, 600); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();

  window.StarMarsMission = Object.freeze({ openTransition, openLanding, openRoute, openLander, openStorm, get landing() { return landing; }, get route() { return route; }, get storm() { return storm; } });
})();
