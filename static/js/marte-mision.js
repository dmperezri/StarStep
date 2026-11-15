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
  // Descenso guiado: la simulación espera dentro de cada ventana. Las tres acciones
  // siguen siendo obligatorias; los límites son parámetros del juego, no telemetría real.
  const LANDING_HOLD = Object.freeze([8, 0.16, 0.035]);
  function landingStep(alt, phase, dt) {
    const w = LANDING[phase]; if (!w) return 0;
    const rate = alt > w.from ? [22, 2.3, 0.16][phase] : [0.8, 0.06, 0.018][phase];
    const next = Math.min(alt, Math.max(LANDING_HOLD[phase], alt - rate * Math.max(0, dt)));
    return alt > w.from ? Math.max(w.from, next) : next;
  }
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
  const STORM = Object.freeze({ sols: 6, taus: [1.0, 2.1, 4.7, 7.3, 9.5, 10.8], battery: 70, critical: 10, coldTau: 4.7, coldPenalty: 10, photoTau: 8 });
  const ACTIONS = Object.freeze({ science: 10, heaters: 6, minimal: 0, photo: 8, transmit: 10 });
  function solar(tau) { return Math.round(30 * Math.exp(-tau / 2.5)); }
  // Un sol: la batería recibe la energía solar y paga las acciones elegidas. Sin calefactores
  // cuando el polvo enfría (τ ≥ 4,7) el frío cuesta batería. La «última imagen» solo vale con
  // la tormenta intensa (τ ≥ 8; umbral de juego) y hay que transmitirla.
  function stormSol(s, actions) {
    if (s.result) return s;
    actions = [...new Set(actions)].filter(a => Object.prototype.hasOwnProperty.call(ACTIONS, a)).slice(0, 2);
    const tau = STORM.taus[s.sol] ?? STORM.taus[STORM.taus.length - 1];
    const cold = tau >= STORM.coldTau && !actions.includes("heaters");
    const cost = 4 - (actions.includes("minimal") ? 4 : 0) + actions.reduce((sum, a) => sum + ACTIONS[a], 0) + (cold ? STORM.coldPenalty : 0);
    const battery = Math.max(0, Math.min(100, s.battery + solar(tau) - cost));
    const photoNow = actions.includes("photo") && tau >= STORM.photoTau;
    const photo = s.photo || photoNow;
    const sent = !!s.sent || (!!s.photo && actions.includes("transmit") && battery > STORM.critical);
    const n = { sol: s.sol + 1, battery, tau, photo, sent, cold, earlyPhoto: actions.includes("photo") && tau < STORM.photoTau };
    n.result = sent ? "sent" : battery <= STORM.critical ? "lost" : n.sol >= STORM.sols ? "lost" : null;
    return n;
  }
  return Object.freeze({ LANDING, LANDING_HOLD, landingStep, landingAction, STATIONS, ENERGY, drive, rest, STORM, ACTIONS, solar, stormSol });
});

/* ── Navegador ───────────────────────────────────────────────── */
(function () {
  if (typeof window === "undefined" || typeof document === "undefined" || !window.StarMarsCore) return;
  const Core = window.StarMarsCore;
  const T = {
    es: { close: "CERRAR ✕", next: "CONTINUAR ›", retry: "REINTENTAR",
      transTitle: "Una conexión entre dos historias", transText: "Este viaje une dos misiones reales y distintas: Apollo 11 llegó a la Luna en 1969 con tres astronautas; Opportunity, un rover robótico, llegó a Marte en 2004. Apollo 11 nunca viajó a Marte: el juego conecta sus historias.",
      landTitle: "Aterrizaje de Opportunity", landText: "Enero de 2004 · Activá las tres fases cuando se iluminen. El descenso te espera en cada zona segura.",
      start: "COMENZAR DESCENSO", chute: "PARACAÍDAS", rockets: "RETROCOHETES", bags: "SOLTAR BOLSAS", alt: "Altura: {a} km", early: "¡Muy pronto!", late: "¡Muy tarde!",
      landWait: "LITO · Prepará {action}.", landNow: "LITO · ¡Ahora! {action}.", landHold: "LITO · Zona segura. Sin prisa: {action}.", landReady: "LITO · Todo listo para descender.", landFail: "No se pudo registrar el aterrizaje. Reintentá.", landRestart: "REINICIAR DESCENSO", landCrater: "CRÁTER EAGLE", landEntry: "ENTRADA ATMOSFÉRICA",
      bounce: "¡Rebote! ¡Otro rebote! Las bolsas de aire rodaron por la llanura…", landed: "¡Hoyo en uno! Opportunity terminó dentro de un cráter pequeño: el cráter Eagle, cuyo nombre recuerda al módulo de Apollo 11.",
      routeBtn: "RUTA DE OPPORTUNITY", routeTitle: "Ruta de Opportunity", routeText: "Llegá a la señal amarilla e investigá. Recargá la batería cuando lo necesités.",
      energy: "Batería: {e}%", charge: "CARGAR ☀", investigate: "INVESTIGAR", noEnergy: "Sin batería: esperá a que los paneles carguen.", locked: "Esta estación se habilita más adelante.", done: "Estación completada.",
      st_lander: "Plataforma de aterrizaje · 2004", st_eagle_crater: "Cráter Eagle · hematita · 2004", st_homestake: "Homestake · yeso · 2011", st_esperance: "Esperance · arcillas · 2013", st_habitability: "¿Hubo vida en Marte?", st_perseverance: "Perseverance Valley · tormenta · 2018",
      landerKind: "PATRIMONIO · MARTE", landerTitle: "Plataforma de aterrizaje de Opportunity", landerObs: "La plataforma con restos de las bolsas de aire quedó dentro del cráter Eagle.", landerInt: "Protegió al rover en la llegada y después le abrió el camino para bajar y explorar.", landerNarr: "«Un hoyo en uno en Marte.»",
      stormTitle: "Tormenta de polvo de 2018", stormText: "Junio de 2018. Una tormenta global oscurece el cielo (opacidad τ). Los paneles casi no cargan. Elegí hasta 2 acciones por sol. Racioná la batería: con τ ≥ 4,7 el frío exige CALEFACTORES. La última imagen tiene que mostrar la tormenta intensa (τ ≥ 8; umbral de juego) y transmitirse antes de que la batería llegue al mínimo.",
      sol: "Sol {n}/{t} · τ {tau} · Solar +{s}", battery: "Batería: {b}%", science: "CIENCIA (−18)", heaters: "CALEFACTORES (−10)", minimal: "MODO MÍNIMO (−4)", photo: "TOMAR FOTO (−12)", transmit: "TRANSMITIR (−14)", endSol: "TERMINAR SOL",
      lost: "La batería se agotó antes de enviar la imagen. Administrá mejor la energía y reintentá.", sent: "¡Imagen enviada! En la misión real, Opportunity perdió contacto durante la tormenta de 2018. Su misión terminó en febrero de 2019.",
      pick: "Elegí hasta 2 acciones.", cold: "Sin calefactores, el frío gastó batería.", early: "La foto todavía no muestra lo peor de la tormenta (τ < 9)." },
    en: { close: "CLOSE ✕", next: "CONTINUE ›", retry: "RETRY",
      transTitle: "A link between two stories", transText: "This trip joins two real, different missions: Apollo 11 reached the Moon in 1969 with three astronauts; Opportunity, a robotic rover, reached Mars in 2004. Apollo 11 never traveled to Mars: the game connects their stories.",
      landTitle: "Opportunity's landing", landText: "January 2004 · Activate all three phases when they light up. The simulation waits at each safe zone.",
      start: "BEGIN DESCENT", chute: "PARACHUTE", rockets: "ROCKETS", bags: "RELEASE AIRBAGS", alt: "Altitude: {a} km", early: "Too early!", late: "Too late!",
      landWait: "LITO · Get ready: {action}.", landNow: "LITO · Now! {action}.", landHold: "LITO · Safe zone. Take your time: {action}.", landReady: "LITO · Ready for descent.", landFail: "Landing could not be recorded. Try again.", landRestart: "RESTART DESCENT", landCrater: "EAGLE CRATER", landEntry: "ATMOSPHERIC ENTRY",
      bounce: "Bounce! Another bounce! The airbags rolled across the plain…", landed: "Hole in one! Opportunity ended up inside a small crater: Eagle Crater, whose name recalls Apollo 11's module.",
      routeBtn: "OPPORTUNITY'S ROUTE", routeTitle: "Opportunity's route", routeText: "Reach the yellow marker and investigate. Recharge your battery as needed.",
      energy: "Battery: {e}%", charge: "CHARGE ☀", investigate: "INVESTIGATE", noEnergy: "No battery: wait for the panels to charge.", locked: "This station unlocks later.", done: "Station complete.",
      st_lander: "Landing platform · 2004", st_eagle_crater: "Eagle Crater · hematite · 2004", st_homestake: "Homestake · gypsum · 2011", st_esperance: "Esperance · clays · 2013", st_habitability: "Was there life on Mars?", st_perseverance: "Perseverance Valley · storm · 2018",
      landerKind: "HERITAGE · MARS", landerTitle: "Opportunity's landing platform", landerObs: "The platform with the airbag remains stayed inside Eagle Crater.", landerInt: "It protected the rover on arrival and then opened the way for it to roll off and explore.", landerNarr: "“A hole in one on Mars.”",
      stormTitle: "The 2018 dust storm", stormText: "June 2018. A global storm darkens the sky (opacity τ). The panels barely charge. Choose up to 2 actions per sol. Ration the battery: with τ ≥ 4.7 the cold requires HEATERS. The last image must show the storm at its worst (τ ≥ 9) and be transmitted before the battery hits the minimum.",
      sol: "Sol {n}/{t} · τ {tau} · Solar +{s}", battery: "Battery: {b}%", science: "SCIENCE (−18)", heaters: "HEATERS (−10)", minimal: "MINIMAL MODE (−4)", photo: "TAKE PHOTO (−12)", transmit: "TRANSMIT (−14)", endSol: "END SOL",
      lost: "The battery ran out before sending the image. Manage energy better and retry.", sent: "Image transmitted! In the real mission, Opportunity lost contact during the 2018 storm. Its mission ended in February 2019.",
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
  let marsVideo = null;
  function openTransition(revisit = false) {
    const pending = stage() === "mars_transition";
    const allowedRevisit = revisit === true && F()?.canEnter?.("mars_transition") && F()?.isStageCompleted?.("mars_transition");
    if (!pending && !allowedRevisit) return false;
    const host = document.getElementById("marsCinematic");
    if (host && window.StarCinematic) {
      if (marsVideo && !marsVideo.state?.done) return marsVideo;
      marsVideo = window.StarCinematic.mount(host, { id: "mars_intro", mode: "chapter", onDone: result => {
        marsVideo = null;
        if (!result?.completed && !(result?.skipped && window.StarProgress?.hasSeenCinematic?.("mars_intro"))) return;
        // Volver a ver la película nunca reescribe los objetivos de una partida avanzada.
        if (!pending || stage() !== "mars_transition") {
          if (stage() === "mars_landing") openLanding();
          refresh();
          return;
        }
        const recorded = F().recordObjective("mars_transition.seen", { source: "transition_sequence" });
        if (recorded.ok && stage() === "mars_landing") openLanding();
        refresh();
      }});
      if (marsVideo) return marsVideo;
    }
    if (!pending) return false;
    const ui = shell(t("transTitle"), t("transText"));
    const go = el("button", "mg-btn primary", t("next")); go.type = "button"; const row = el("div", "mg-actions"); row.append(go); ui.panel.append(row);
    go.addEventListener("click", () => { F().recordObjective("mars_transition.seen", { source: "transition_sequence" }); ui.hide(); if (stage() === "mars_landing") openLanding(); });
    return ui;
  }

  // ── Aterrizaje ──
  let landing = null;
  function openLanding() {
    if (stage() !== "mars_landing") return false;
    if (landing && !landing.ui.root.hidden) return landing;
    const ui = shell(t("landTitle"), t("landText"));
    ui.root.dataset.marsLanding = "true";
    const canvas = el("canvas", "mg-canvas"); canvas.width = 480; canvas.height = 200;
    const hud = el("div", "mg-hud"); const altEl = el("span"), phaseEl = el("span"); hud.append(altEl, phaseEl);
    const pad = el("div", "mg-pad"), feedback = el("p", "mg-feedback"); feedback.setAttribute("aria-live", "polite");
    const go = el("button", "mg-btn primary", t("start")); go.type = "button";
    const acts = Core.LANDING.map((w, i) => { const b = el("button", "mg-btn", t(w.id)); b.type = "button"; b.dataset.action = w.id; b.disabled = true; b.addEventListener("click", () => act(i)); pad.append(b); return b; });
    const row = el("div", "mg-actions"); row.append(go);
    const landingPhoto = window.StarEvidenceVisual?.figure("lander");
    const landingFrame = el("div", "evidence-scene-photo"); landingFrame.append(canvas);
    if (landingPhoto) { landingPhoto.hidden = true; landingFrame.append(landingPhoto); }
    ui.panel.append(landingFrame, hud, pad, feedback, row);
    let alt = 125, phase = 0, running = false, done = false, bounce = 0, failed = false;
    let raf = 0, last = null;
    const actionable = () => running && phase < 3 && Core.landingAction(alt, phase) === "ok";
    const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
    function draw() {
      const c = canvas.getContext?.("2d"); if (!c) return;
      const px = (x,y,w,h,col) => { c.fillStyle=col; c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h))); };
      marsLandscape(c,480,212); // shared terrain; crater overlay uses existing 153px horizon
      // Cráter Eagle y pendiente de entrada.
      for(let x=299;x<440;x+=3){const q=(x-369.5)/70.5;const depth=Math.round(20*Math.sqrt(Math.max(0,1-q*q)));px(x,153,3,depth+3,"#7A2818");px(x,153+depth,3,2,"#D88A60");}
      px(311,151,5,3,"#FFE066");px(428,151,5,3,"#FFE066");
      c.fillStyle="#FFF8E7";c.font="bold 9px monospace";c.textAlign="center";c.fillText(t("landCrater"),369,190);
      // Altura visual no lineal: cada fase permanece visible incluso cerca del suelo.
      const progress=alt>=11?.48*(125-alt)/114:alt>=.35?.48+.28*(11-alt)/10.65:.76+.24*(.35-alt)/.35;
      let x=240+50*progress,y=32+101*progress;
      if(phase===3){const z=Math.min(1,bounce/1.8);x=290+79*z;y=139+(z*18)-Math.abs(Math.sin(z*3*Math.PI))*30*(1-z);}
      if(done){x=369;y=154;}
      if(phase===0){ // escudo térmico con brillo de entrada
        px(x-13,y+2,26,5,"#D9593A");px(x-8,y+7,16,5,"#FFC93C");px(x-5,y+12,10,4,"#F7B08E");
        px(x-6,y-10,12,4,"#E4DFFF");px(x-10,y-6,20,5,"#C3C7D6");px(x-13,y-1,26,5,"#575C74");px(x-4,y-6,8,4,"#3FD0E0");
      } else if(phase<3){
        // Paracaídas ancho con bandas y cuerdas; plataforma y retrocohetes.
        px(x-13,y-42,26,4,"#FFF8E7");px(x-23,y-38,46,5,"#FFF8E7");px(x-28,y-33,56,6,"#D9593A");px(x-20,y-33,10,6,"#FFF8E7");px(x+8,y-33,10,6,"#FFF8E7");
        for(let j=0;j<18;j++){px(x-27+j*.95,y-27+j,1,2,"#FFF8E7");px(x+26-j*.95,y-27+j,1,2,"#FFF8E7");}
        px(x-13,y-9,26,5,"#FFC93C");px(x-9,y-4,18,8,"#C3C7D6");px(x-4,y-6,8,4,"#4F86D9");px(x-12,y+4,24,3,"#575C74");
        if(phase===2){for(const dx of [-8,8]){px(x+dx-3,y+7,6,7,"#D9593A");px(x+dx-2,y+8,4,7,"#FFE066");}}
      } else {
        // Bolsas de aire y rebotes amortiguados, sin gráficos externos.
        for(const [dx,dy] of [[-9,-8],[0,-12],[9,-8],[-12,0],[12,0],[-9,8],[0,12],[9,8],[0,0]]){px(x+dx-6,y+dy-5,12,10,"#C3C7D6");px(x+dx-4,y+dy-4,8,7,"#FFF8E7");px(x+dx-3,y+dy-3,6,2,"#E4DFFF");}
        if(done){px(x-9,y-5,18,9,"#FFC93C");px(x-15,y-7,30,4,"#4F86D9");px(x-12,y+4,5,5,"#262C66");px(x+7,y+4,5,5,"#262C66");}
      }
      // Guía de progreso permanente. Diferencia las tres fases por color y número.
      px(10,10,116,24,"#1A1F4D");
      for(let i=0;i<3;i++){px(16+i*36,14,30,16,i<phase?"#8FF0D8":i===phase&&actionable()?"#FFE066":"#4F45A6");c.fillStyle=i<phase||i===phase&&actionable()?"#0E1233":"#FFF8E7";c.font="bold 10px monospace";c.fillText(i<phase?"✓":String(i+1),31+i*36,26);}
      if(actionable()){px(450,14,15,2,"#FFE066");px(450,14,2,15,"#FFE066");px(463,14,2,15,"#FFE066");px(450,27,15,2,"#FFE066");}
    }
    function render() {
      if (landingPhoto) landingPhoto.hidden = !done;
      altEl.textContent = t("alt", { a: alt.toFixed(alt < 1 ? 2 : 0) });
      phaseEl.textContent = `${Math.min(phase,3)}/3`;
      acts.forEach((b,i)=>{const ready=i===phase&&actionable(); b.disabled=!ready; b.className=ready?"mg-btn primary":"mg-btn";b.textContent=(i<phase?"✓ ":`${i+1}. `)+t(Core.LANDING[i].id);});
      const msg=done?t("landed"):failed?t("landFail"):!running?t("landReady"):phase===3?t("bounce"):t(actionable()?(alt<=Core.LANDING_HOLD[phase]?"landHold":"landNow"):"landWait",{action:t(Core.LANDING[phase].id)});
      if(feedback.textContent!==msg) feedback.textContent=msg;
      go.textContent=done?t("next"):failed?t("retry"):running?t("landRestart"):t("start");
      draw();
    }
    function finish(){
      alt=0;running=false;
      const result=F().recordObjective("mars_landing.touchdown", { source: "mars_landing_sequence" });
      done=!!result?.ok;failed=!done;
      if(done){window.StarSound?.effect?.("success");refresh();}
    }
    function tick(dt) {
      if(!running||done||ui.root.hidden||document.hidden) return;
      if(phase===3){const before=Math.floor(bounce/.6);bounce+=Math.max(0,dt);if(Math.floor(bounce/.6)>before&&bounce<1.8)window.StarSound?.effect?.("bounce");if(bounce>=1.8)finish();}
      else alt=Core.landingStep(alt,phase,dt);
      render();
    }
    function act(i) {
      if(!running||i!==phase||!actionable()||ui.root.hidden||document.hidden) return;
      phase++;window.StarSound?.effect?.(phase===3?"bounce":phase===2?"boom":"pick");
      if(phase===3){alt=0;bounce=0;if(reduced())finish();}
      render();
    }
    function stopFrame(){if(raf&&typeof cancelAnimationFrame==="function")cancelAnimationFrame(raf);raf=0;last=null;}
    const loop=now=>{if(!running||ui.root.hidden){stopFrame();return;}const dt=last===null?0:Math.max(0,Math.min(.1,(now-last)/1000));last=now;tick(dt);if(running)raf=requestAnimationFrame(loop);};
    function restart(){stopFrame();alt=125;phase=0;running=true;done=false;failed=false;bounce=0;render();if(typeof requestAnimationFrame==="function")raf=requestAnimationFrame(loop);}
    go.addEventListener("click",()=>{if(done){ui.hide();openRoute();return;}restart();});
    ui.root.addEventListener("keydown",e=>{if(e.key==="Escape")stopFrame();});
    ui.panel.children[0]?.addEventListener("click",stopFrame);
    landing={tick,act,get state(){return {alt,phase,running,done};},start:restart,ui};
    render();return landing;
  }

  // ── Ruta de Opportunity ──
  let route = null;
  const stationDone = id => {
    const f = F(); if (!f) return false;
    return { lander: f.getArtifact("lander")?.state === "registered" && f.getArtifact("opportunity")?.state === "registered", eagle_crater: f.getArtifact("blueberries")?.state === "registered",
      homestake: f.getArtifact("gypsum")?.state === "registered", esperance: f.getArtifact("clay")?.state === "registered",
      habitability: f.isStageCompleted("mars_habitability"), perseverance: f.isStageCompleted("mars_storm") }[id];
  };
  const routeStage = () => Core.STATIONS.find(st => st.stage === stage());
  const stationTitle = st => st.id === "lander" && F()?.getArtifact("lander")?.state === "registered"
    ? (lang() === "en" ? "Inspect Opportunity · 3D" : "Inspeccioná Opportunity · 3D") : t("st_" + st.id);
  // Palette, crater pattern and rover sprite from the supplied prototype.
  function marsLandscape(c,w,h,dark=0){
    const px=(x,y,a,b,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(a)),Math.max(1,Math.round(b)));};
    const ground=Math.round(h*.72),bands=['#B8836A','#C8937A','#D3A084','#DDAC8C','#E5B898'];
    bands.forEach((col,i)=>px(0,i*ground/5,w,ground/5+1,col));
    const sx=w*.84,sy=h*.18;px(sx-5,sy-7,10,14,'#FFE0AA');px(sx-8,sy-4,16,8,'#FFE0AA');
    for(let x=0;x<w;x+=4){const a=4+Math.round(5+Math.sin(x*.048)*4+Math.sin(x*.13)*2);px(x,ground-a,4,a,'#8A3E2A');const b=10+Math.round((Math.cos(x*.025)+1)*9);px(x,ground-a-b,4,b,'#AA6C52');}
    px(0,ground,w,h-ground,'#7A3424');px(0,ground,w,3,'#A64A30');
    let seed=21;const r=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
    const oval=(cx,cy,rx,ry,col)=>{for(let dy=-ry;dy<=ry;dy++){const n=Math.floor(rx*Math.sqrt(Math.max(0,1-dy*dy/(ry*ry+.5))));px(cx-n,cy+dy,2*n+1,1,col);}};
    for(let i=0;i<9;i++){const x=r()*w,y=ground+8+r()*Math.max(1,h-ground-12),rx=9+r()*20;oval(x,y,rx,3,'#8A4430');oval(x,y-1,rx*.6,1,'#A85A3C');}
    for(let i=0;i<110;i++){const x=r()*w,y=ground+4+r()*Math.max(1,h-ground-5);px(x,y,1+i%3,1,i%7===0?'#4F86D9':i%3===0?'#4E1E14':'#C06A4A');}
    if(dark>0)px(0,0,w,h,`rgba(49,27,25,${Math.min(.86,dark*.8)})`);
    return {px,ground};
  }
  function drawRover(px,x,y,scale=1){
    const map=[
 "........o.......",
 ".......ooo......",
 ".......oco......",
 "........o.......",
 "........o.......",
 "oooooooooooooooo",
 "obbbbbbbbbbbbbbo",
 "oooooooooooooooo",
 "...owwwwwwwo....",
 "..o.o..o..o.o...",
 ".ooo.ooo.ooo....",
 ".oko.oko.oko....",
 ".ooo.ooo.ooo...."];
    const pal={o:'#1A1340',b:'#262C66',w:'#E3A92B',c:'#3FD0E0',k:'#757B94'},u=2.6*scale;
    for(let j=0;j<map.length;j++)for(let i=0;i<map[j].length;i++){const col=pal[map[j][i]];if(col)px(x+(i-8)*u,y+(j-13)*u,u,u,col);}
    for(let i=1;i<15;i+=3)px(x+(i-8)*u,y-7*u,2*u,u,'#4F86D9');
  }
  function openRoute() {
    if (!routeStage()) return false;
    if (route && !route.ui.root.hidden) return route;
    const L=(es,en)=>lang()==="en"?en:es;
    const ui = shell(t("routeTitle"), L("Recorré seis estaciones y descubrí las pistas del agua.", "Explore six stations and uncover clues to water."));
    ui.root.setAttribute("data-mars-route", "");
    const mission = el("p", "mars-route-target");
    const canvas = el("canvas", "mg-canvas"); canvas.width = 500; canvas.height = 190;
    const hud = el("div", "mg-hud mars-game-hud"); const en = el("span"), where = el("span"), progress = el("span"); hud.append(en, where, progress);
    const meter=el("div","mg-meter"); const bar=el("i"); meter.append(bar);
    const pad = el("div", "mg-pad"); const feedback = el("p", "mg-feedback mars-guide"); feedback.setAttribute("aria-live", "polite");
    const mk = (label, fn, cls = "") => { const b = el("button", "mg-btn " + cls, label); b.type = "button"; b.addEventListener("click", fn); pad.append(b); return b; };
    let s = { x: route?.state?.x ?? 0, energy: route?.state?.energy ?? Core.ENERGY.max };
    let moved=false, rechargeTimer=0, holdTimer=0, held=0;
    const left=mk("◀", () => move(-1)), right=mk("▶", () => move(1));
    left.setAttribute("aria-label",L("Mover a la izquierda","Move left")); right.setAttribute("aria-label",L("Mover a la derecha","Move right"));
    const inv = mk(t("investigate"), investigate, "primary");
    ui.panel.append(mission,hud,meter,canvas,pad,feedback,el("p","mars-game-note",L("Flechas o botones · Al detenerte, la batería se recarga sola.","Arrow keys or buttons · Stop to recharge automatically.")));
    const historicalRoute =
      window.StarEvidenceVisual?.figure("route");

    if (historicalRoute) {
      historicalRoute.classList.add("ss-route-reference");

      const map = el("div", "ss-route-map");
      ui.panel.insertBefore(map, canvas);
      map.append(canvas, historicalRoute);
    }

    function stopHold(){if(holdTimer)clearInterval(holdTimer);holdTimer=0;held=0;}
    function cleanup(){stopHold();if(rechargeTimer)clearInterval(rechargeTimer);rechargeTimer=0;}
    const hide=ui.hide; ui.hide=()=>{cleanup();hide();};
    ui.panel.children[0].addEventListener("click",cleanup);
    ui.root.addEventListener("keydown",e=>{if(e.key==="Escape")cleanup();});
    function chargeTick(){if(ui.root.hidden||document.hidden)return;if(moved||held){moved=false;return;}if(s.energy<Core.ENERGY.max){s=Core.rest(s);render();}}
    rechargeTimer=setInterval(chargeTick,500);
    for(const [b,dir] of [[left,-1],[right,1]]){
      b.addEventListener("pointerdown",e=>{if(e.button!==undefined&&e.button!==0)return;stopHold();held=dir;b.setPointerCapture?.(e.pointerId);holdTimer=setInterval(()=>{if(ui.root.hidden||document.hidden){stopHold();return;}move(dir);},150);});
      for(const event of ["pointerup","pointercancel","lostpointercapture"])b.addEventListener(event,stopHold);
    }

    function near() {
      const candidates = Core.STATIONS.filter(st => Math.abs(st.x - s.x) <= 30);
      return candidates.find(st => st.stage === stage()) || candidates.sort((a,b) => Math.abs(a.x-s.x) - Math.abs(b.x-s.x))[0];
    }
    function move(dir) { if(ui.root.hidden||document.hidden||!routeStage())return; const n=Core.drive(s,dir); if(n.blocked){stopHold();moved=false;render();return;} s=n;moved=true;render(); }
    function investigate() {
      if(ui.root.hidden||document.hidden)return; const st = near(); if (!st) return;
      if (stationDone(st.id)) { feedback.textContent = t("done"); return; }
      if (stage() !== st.stage) { feedback.textContent = t("locked"); return; }
      if (st.id === "lander" && F().getArtifact("lander")?.state === "registered") {
        if (!window.openStarArtifact) { feedback.textContent = t("locked"); return; }
        const loc = F().locateArtifact("opportunity", { mechanic: "mars_rover_scan" });
        if (!loc.ok) { feedback.textContent = t("locked"); return; }
        ui.hide(); window.openStarArtifact("opportunity", { context: "mission" }); return;
      }
      ui.hide();
      if (st.id === "lander") openLander();
      else if (st.id === "eagle_crater") window.StarHematiteEnigma?.open();
      else if (st.id === "homestake") window.StarMarsEnigmas?.open("gypsum");
      else if (st.id === "esperance") window.StarMarsEnigmas?.open("clay");
      else if (st.id === "habitability") window.StarMarsEnigmas?.openHabitability();
      else if (st.id === "perseverance") openStorm();
    }
    function draw() {
      const c=canvas.getContext?.("2d");if(!c)return;
      const {px,ground}=marsLandscape(c,500,190);
      const X=v=>20+v*.46;
      px(20,ground+14,460,2,"#D88A60");
      Core.STATIONS.forEach((st,i)=>{const x=X(st.x),done=stationDone(st.id),active=stage()===st.stage&&!done, y=(i%2===0?49:29),col=done?"#8FF0D8":active?"#FFE066":"#B9BEE6";
        if(active){px(x-13,ground-2,26,3,col);px(x-14,ground-7,2,8,col);px(x+12,ground-7,2,8,col);}
        px(x-1,y+17,2,ground-y-17,col);px(x-10,y,20,18,"#1A1F4D");px(x-10,y,20,2,col);px(x-10,y+16,20,2,col);
        c.fillStyle=col;c.font="bold 11px monospace";c.textAlign="center";c.fillText(done?"✓":String(i+1),x,y+13);
      });
      drawRover(px,X(s.x),ground,1.1);
    }
    function render() {
      const st=near(),target=routeStage(), complete=Core.STATIONS.filter(x=>stationDone(x.id)).length;
      en.textContent=t("energy",{e:Math.round(s.energy)});if(bar.style){bar.style.width=`${s.energy}%`;bar.style.background=s.energy<20?"#F7B08E":"#8FF0D8";}
      progress.textContent=L("Hallazgos","Stations")+` ${complete}/6`;
      where.textContent=target?L("Estación ","Station ")+(Core.STATIONS.indexOf(target)+1)+"/6":"";
      mission.textContent=target?L("SIGUIENTE · ","NEXT · ")+stationTitle(target):"";
      const ready=!!st&&st.stage===stage()&&!stationDone(st.id);inv.disabled=!ready;
      const message=ready?L("¡Llegaste! Pulsá INVESTIGAR.","You arrived! Press INVESTIGATE."):s.energy<Core.ENERGY.perMove?L("Batería baja · Esperá la recarga automática.","Low battery · Wait for automatic recharge."):target?L("Movete ","Move ")+(s.x<target.x?"▶":"◀")+L(" hacia la señal amarilla."," toward the yellow marker."):L("Ruta completa.","Route complete.");
      if(feedback.textContent!==message)feedback.textContent=message;
      draw();route.state=s;
    }
    ui.root.addEventListener("keydown",e=>{if(["ArrowLeft","ArrowRight"].includes(e.key)){e.preventDefault?.();move(e.key==="ArrowLeft"?-1:1);}});
    route={ui,move,investigate,chargeTick,state:s,get pos(){return s;}};
    ui.root.tabIndex=-1;ui.root.focus?.();render();return route;
  }

  function openLander() {
    const f = F(); if (!f || stage() !== "mars_exploration") return false;
    const loc = f.locateArtifact("lander", { mechanic: "mars_rover_scan" }); if (!loc.ok) return false;
    f.beginInspection("lander", { context: "mission", viewer: "fallback" });
    window.StarScienceCard?.open({
      kind: { es: T.es.landerKind, en: T.en.landerKind }, title: { es: T.es.landerTitle, en: T.en.landerTitle },
      photo: { src: "/static/assets/evidencias/o1_lionking.jpg", caption: { es: "Panorámica Lion King del cráter Eagle · NASA/JPL/Cornell · PIA05755", en: "Lion King panorama of Eagle Crater · NASA/JPL/Cornell · PIA05755" }, alt: { es: "Cráter Eagle con la plataforma en el centro", en: "Eagle Crater with the platform in the center" } },
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
    if(storm && !storm.ui.root.hidden)return storm;
    const L=(es,en)=>lang()==="en"?en:es;
    const ui=shell(t("stormTitle"),L("2018 · Conservá energía y enviá una imagen de la tormenta.","2018 · Save energy and transmit an image of the storm."));
    ui.root.setAttribute("data-mars-storm", "");
    const goal=el("p","mars-route-target",L("OBJETIVO · Foto en tormenta intensa → transmitir a la Tierra.","GOAL · Photograph the severe storm → transmit to Earth."));
    const canvas=el("canvas","mg-canvas");canvas.width=500;canvas.height=165;
    const hud=el("div","mg-hud mars-game-hud");const solEl=el("span"),tauEl=el("span"),solarEl=el("span"),batEl=el("span");hud.append(solEl,tauEl,solarEl,batEl);
    const meter=el("div","mg-meter");const bar=el("i");meter.append(bar);
    const opts=el("div","mg-options");const feedback=el("p","mg-feedback mars-guide");feedback.setAttribute("aria-live","polite");
    const guide=el("p","mars-storm-guide"),selection=el("p","mg-kicker"),preview=el("p","mars-game-note");
    const row=el("div","mg-actions");const end=el("button","mg-btn primary",t("endSol"));end.type="button";row.append(end);
    const stormPhoto=window.StarEvidenceVisual?.figure("storm");const stormFrame=el("div","evidence-scene-photo");stormFrame.append(canvas);if(stormPhoto){stormPhoto.hidden=true;stormFrame.append(stormPhoto);}
    ui.panel.append(goal,hud,meter,stormFrame,guide,selection,opts,preview,feedback,row,el("p","mars-game-note",L("Valores de energía y opacidad simplificados para el juego.","Energy and opacity values simplified for gameplay.")));
    const initial=()=>({sol:0,battery:Core.STORM.battery,tau:Core.STORM.taus[0],photo:false,sent:false,result:null});
    let s=initial();const chosen=new Set();const tau=()=>Core.STORM.taus[Math.min(s.sol,Core.STORM.sols-1)];
    const names={science:L("Tomar datos","Collect data"),heaters:L("Calentar sistemas","Heat systems"),minimal:L("Ahorrar energía","Save energy"),photo:L("Tomar foto","Take photo"),transmit:L("Transmitir","Transmit")};
    const hints={science:L("Ciencia adicional","Extra science"),heaters:L("Protege del frío","Protects from cold"),minimal:L("Evita gasto base de 4%","Saves 4% base cost"),photo:L("Disponible con τ ≥ 8","Available at τ ≥ 8"),transmit:L("Requiere foto válida","Needs a valid photo")};
    function allowed(a){return !s.result&&(a!=="photo"||(!s.photo&&tau()>=Core.STORM.photoTau))&&(a!=="transmit"||s.photo);}
    const buttons=Object.keys(Core.ACTIONS).map(a=>{const b=el("button","mg-option");b.type="button";b.dataset.action=a;const head=el("strong","mars-action-name",names[a]),cost=el("small","mars-action-cost",a==="minimal"?L("AHORRO 4%","SAVE 4%"):"−"+Core.ACTIONS[a]+"%");b.append(head,cost,el("small","mars-action-hint",hints[a]));b.addEventListener("click",()=>{if(!allowed(a))return;if(chosen.has(a))chosen.delete(a);else if(chosen.size<2)chosen.add(a);else return;feedback.textContent="";window.StarSound?.effect?.("click");render();});opts.append(b);return b;});
    function draw(){const c=canvas.getContext?.("2d");if(!c)return;const dark=Math.min(1,tau()/11);const {px,ground}=marsLandscape(c,500,165,dark);drawRover(px,250,ground,1.55);for(let i=0;i<Math.round(85*dark);i++)px((i*53+21)%500,(i*29)%ground,2+i%3,1,`rgba(247,176,142,${.12+dark*.18})`);}
    function render(){
      const v=tau(),n=Math.min(s.sol+1,Core.STORM.sols);if(stormPhoto)stormPhoto.hidden=!s.photo;
      solEl.textContent=`Sol ${n}/${Core.STORM.sols}`;tauEl.textContent=L("Polvo","Dust")+` τ ${v.toFixed(1)}`;solarEl.textContent=L("Solar","Solar")+` +${Core.solar(v)}%`;batEl.textContent=t("battery",{b:Math.round(s.battery)});if(bar.style){bar.style.width=`${s.battery}%`;bar.style.background=s.battery<=25?"#F7B08E":"#8FF0D8";}
      guide.textContent=s.result==="sent"?L("✓ Imagen enviada.","✓ Image transmitted."):s.result?L("Reintentá con menos gasto.","Retry with less energy use."):s.photo?L("Foto lista · Seleccioná TRANSMITIR.","Photo ready · Select TRANSMIT."):v>=Core.STORM.photoTau?L("¡Ahora! Tomá la foto. En el próximo sol podrás transmitir.","Now! Take the photo. Transmit on the next sol."):v>=Core.STORM.coldTau?L("Hace frío · Calentá los sistemas y esperá la tormenta intensa.","Cold conditions · Heat the systems and wait for severe dust."):L("Ahorrá energía mientras aumenta el polvo.","Save energy as the dust thickens.");
      selection.textContent=L("ACCIONES ELEGIDAS ","ACTIONS SELECTED ")+`${chosen.size}/2`;
      const recommended=s.photo?"transmit":v>=Core.STORM.photoTau?"photo":v>=Core.STORM.coldTau?"heaters":"minimal";
      for(const b of buttons){const a=b.dataset.action;const selected=chosen.has(a);b.setAttribute("aria-pressed",String(selected));b.disabled=!allowed(a)||(!selected&&chosen.size>=2);b.className="mg-option"+(a===recommended&&!b.disabled?" mars-recommended":"");}
      const projected=Core.stormSol(s,[...chosen]);preview.textContent=s.result?"":L("Batería al terminar el sol: ","Battery at end of sol: ")+Math.round(projected.battery)+"%"+(projected.cold?L(" · Frío −10% sin calefactores"," · Cold −10% without heaters"):"");
      end.textContent=s.result==="lost"?t("retry"):s.result==="sent"?t("next"):t("endSol");draw();
    }
    end.addEventListener("click",()=>{
      if(s.result==="sent"){ui.hide();return;}
      if(s.result==="lost"){s=initial();chosen.clear();feedback.textContent="";render();return;}
      s=Core.stormSol(s,[...chosen]);chosen.clear();
      if(s.result==="sent"){const recorded=F().recordObjective("mars_storm.survive",{source:"storm_2018_minigame"});if(!recorded?.ok){s={...s,result:"lost",sent:false};feedback.textContent=L("No se pudo registrar. Reintentá.","Could not save. Retry.");}else{feedback.textContent=t("sent");window.StarSound?.effect?.("success");}}
      else if(s.result==="lost"){window.StarSound?.effect?.("sad");feedback.textContent=L("No se envió la imagen a tiempo. Reintentá ahorrando energía.","Image not sent in time. Retry while saving energy.");}
      else feedback.textContent=s.photo?L("✓ Foto guardada. Transmitila en el siguiente sol.","✓ Photo saved. Transmit next sol."):s.cold?t("cold"):L("Sol completado.","Sol completed.");
      render();
    });
    storm={ui,choose:a=>buttons.find(b=>b.dataset.action===a)?.click(),endSol:()=>end.click(),get state(){return s;}};render();return storm;
  }

  // Botón principal en el panel de Marte, según la etapa.
  let launcher = null;
  function refresh() {
    const list = document.getElementById("marsActions") || document.querySelector?.(".mars-panel .station-list");
    if (!launcher && list) {
      launcher = document.getElementById("openMarsRoute");
      if (!launcher) { launcher = el("button", "pixel-button mint"); launcher.type = "button"; launcher.id = "openMarsRoute"; list.append(launcher); }
      launcher.addEventListener("click", primary);
    }
    const st = stage(), en = lang() === "en", f = F();
    const done = Core.STATIONS.filter(x => stationDone(x.id)).length;
    const ready = !!f?.canEnter?.("footprints");
    const label = document.getElementById("marsProgressLabel"), count = document.getElementById("marsProgressCount"), meter = document.getElementById("marsProgressBar");
    const guide = document.getElementById("marsMissionGuide"), next = document.getElementById("marsNext");
    if (label) label.textContent = en ? "Science route" : "Ruta científica";
    if (count) count.textContent = `${done} / ${Core.STATIONS.length}`;
    if (meter) { meter.max = Core.STATIONS.length; meter.value = done; meter.setAttribute("aria-label", en ? "Mars progress" : "Progreso de Marte"); }
    if (guide) guide.textContent = ready ? (en ? "Mission complete!" : "¡Misión completada!")
      : st === "mars_transition" ? (en ? "Watch the introduction." : "Mirá la introducción.")
      : st === "mars_landing" ? (en ? "Land Opportunity." : "Aterrizá Opportunity.")
      : routeStage() ? stationTitle(routeStage()) : (en ? "Complete the current mission." : "Completá la misión actual.");
    if (launcher) { launcher.textContent = st === "mars_transition" ? (en ? "WATCH INTRO" : "VER INTRODUCCIÓN") : st === "mars_landing" ? t("landTitle") : t("routeBtn"); launcher.hidden = !st || !(st === "mars_transition" || st === "mars_landing" || routeStage()); }
    if (next) next.hidden = !ready;
  }
  function primary() { const st = stage(); if (st === "mars_transition") openTransition(); else if (st === "mars_landing") openLanding(); else if (routeStage()) openRoute(); }
  document.addEventListener("starflow:change", refresh);
  document.addEventListener("starstep:language", refresh);
  document.addEventListener("starstep:mars-refresh", refresh);
  // Al terminar (o saltar) la cinemática del viaje, se muestra la nota de conexión narrativa.
  function afterTransit() {
    const overlay = document.getElementById("starMarsTransit");
    if (overlay && !overlay.hidden) { setTimeout(afterTransit, 500); return; }
    if (stage() === "mars_transition") openTransition();
  }
  const start = () => {
    setTimeout(refresh, 0);
    if (document.getElementById("marsCinematic") && window.StarCinematic) {
      // El enlace de Luna solicita el video; se consume la marca para que F5 no lo repita.
      const params = new URLSearchParams(location.search || "");
      let referred = false;
      try { referred = new URL(document.referrer).pathname.replace(/\/$/, "") === "/luna"; } catch {}
      const fromMoon = params.get("viaje") === "luna" || referred;
      if (fromMoon) {
        params.delete("viaje");
        params.delete("cine");
        try { history.replaceState(history.state, "", location.pathname + (params.toString() ? "?" + params : "") + (location.hash || "")); } catch {}
      }
      if (stage() === "mars_transition") { openTransition(); return; }
      if (F()?.canEnter?.("mars_transition") && F()?.isStageCompleted?.("mars_transition") &&
          (fromMoon || window.StarProgress?.hasSeenCinematic?.("mars_intro") !== true)) {
        openTransition(true);
      }
      return;
    }
    setTimeout(afterTransit, 600);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();

  window.StarMarsMission = Object.freeze({ openTransition, openLanding, openRoute, openLander, openStorm, get landing() { return landing; }, get route() { return route; }, get storm() { return storm; } });
})();
