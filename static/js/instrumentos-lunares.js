"use strict";
/*
 * StarStep · Acto I · Instalación del EASEP y del retrorreflector (LRRR) — captura 06.
 * Mapa superior: cuadrícula de 5 m, norte arriba, escala de 5 m, Eagle como referencia.
 *   EASEP: ~17 m al sur de Eagle (tolerancia del juego ±4 m) → inspeccionar antena,
 *          panel solar y sismómetro → StarFlow registra easep + moon_install_easep.install.
 *   LRRR:  ~5 m al nor-noroeste (337,5°) del EASEP (±2,3 m) y orientado hacia la Tierra
 *          (±15°) → pulso láser → prismas y soporte → reflector + install + orient.
 * Distancias y tolerancias son parámetros del minijuego inspirados en la misión; no son
 * especificaciones históricas exactas.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.StarInstrumentsCore = api;
})(typeof window !== "undefined" ? window : null, function () {
  const EAGLE = Object.freeze({ x: 0, y: 0 });              // metros; y crece hacia el sur
  const EASEP = Object.freeze({ distance: 17, bearing: 180, tolerance: 4 });
  const LRRR = Object.freeze({ distance: 5, bearing: 337.5, tolerance: 2.3, earthAngle: 60, angleTolerance: 15 });
  const rad = d => d * Math.PI / 180;
  // Rumbo 0° = norte, 90° = este. En el mapa, norte = y negativa.
  function target(from, distance, bearing) { return { x: from.x + distance * Math.sin(rad(bearing)), y: from.y - distance * Math.cos(rad(bearing)) }; }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function bearing(from, to) { const b = Math.atan2(to.x - from.x, -(to.y - from.y)) * 180 / Math.PI; return (b + 360) % 360; }
  function compass(deg) { const n = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"]; return n[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16]; }
  function angleDiff(a, b) { const d = Math.abs(((a - b) % 360 + 540) % 360 - 180); return d; }
  const easepTarget = () => target(EAGLE, EASEP.distance, EASEP.bearing);
  function checkEasep(pos) { const err = dist(pos, easepTarget()); return { ok: err <= EASEP.tolerance, error: err, fromEagle: dist(pos, EAGLE), bearing: bearing(EAGLE, pos) }; }
  function checkReflector(pos, angle, easepPos) {
    const goal = target(easepPos, LRRR.distance, LRRR.bearing);
    const err = dist(pos, goal), aerr = angleDiff(angle, LRRR.earthAngle);
    return { position: err <= LRRR.tolerance, orientation: aerr <= LRRR.angleTolerance, error: err, angleError: aerr, fromEasep: dist(pos, easepPos), bearing: bearing(easepPos, pos) };
  }
  return Object.freeze({ EAGLE, EASEP, LRRR, target, dist, bearing, compass, angleDiff, easepTarget, checkEasep, checkReflector });
});

/* ── Navegador ───────────────────────────────────────────────── */
(function () {
  if (typeof window === "undefined" || typeof document === "undefined" || !window.StarInstrumentsCore) return;
  const Core = window.StarInstrumentsCore;
  const T = {
    es: { open: "INSTALAR INSTRUMENTOS", kicker: "Acto I · Luna · Instrumentos", easepTitle: "Instalar el EASEP", lrrrTitle: "Instalar el retrorreflector",
      easepText: "Mové el paquete de experimentos (◀ ▶ ▲ ▼ o arrastrá) unos 17 m al sur de Eagle y pulsá INSTALAR.",
      lrrrText: "Ubicalo 5 m al NNO del EASEP. Girá hacia la Tierra (60°) y dispará el láser.",
      install: "INSTALAR", fire: "DISPARAR LÁSER", close: "CERRAR ✕", rotL: "↺", rotR: "↻",
      dEagle: "Distancia a Eagle: {d} m · {c}", dEasep: "Distancia al EASEP: {d} m · {c}", angle: "Orientación: {a}° (Tierra: {e}°)",
      tooFar: "Todavía no: el EASEP va unos 17 m al SUR de Eagle (margen del juego ±4 m).", badPos: "Posición: tiene que quedar unos 5 m al NNO del EASEP (±2,3 m).", badAngle: "Orientación: girá los espejos hacia la Tierra (±15°).",
      inspect: "Inspeccioná sus partes:", easepDone: "¡EASEP instalado! El sismómetro escuchará sismos lunares y la antena enviará datos a la Tierra.",
      lrrrDone: "¡Pulso recibido! Los prismas devuelven la luz al lugar de donde vino: así se mide la distancia Tierra–Luna. Este espejo todavía se usa.",
      note: "Distancias y márgenes son del minijuego, inspirados en la misión; no son medidas históricas exactas.",
      part_antenna: "Antena", part_solar_panel: "Panel solar", part_seismometer: "Sismómetro", part_prisms: "Prismas", part_support: "Soporte" },
    en: { open: "INSTALL INSTRUMENTS", kicker: "Act I · Moon · Instruments", easepTitle: "Install the EASEP", lrrrTitle: "Install the retroreflector",
      easepText: "Move the experiment package (◀ ▶ ▲ ▼ or drag) about 17 m south of Eagle and press INSTALL.",
      lrrrText: "Place it 5 m NNW of the EASEP. Turn toward Earth (60°) and fire the laser.",
      install: "INSTALL", fire: "FIRE LASER", close: "CLOSE ✕", rotL: "↺", rotR: "↻",
      dEagle: "Distance to Eagle: {d} m · {c}", dEasep: "Distance to EASEP: {d} m · {c}", angle: "Orientation: {a}° (Earth: {e}°)",
      tooFar: "Not yet: the EASEP goes about 17 m SOUTH of Eagle (game margin ±4 m).", badPos: "Position: it must be about 5 m NNW of the EASEP (±2.3 m).", badAngle: "Orientation: turn the mirrors toward Earth (±15°).",
      inspect: "Inspect its parts:", easepDone: "EASEP installed! The seismometer will listen for moonquakes and the antenna will send data to Earth.",
      lrrrDone: "Pulse received! The prisms send light back where it came from: that is how the Earth–Moon distance is measured. This mirror is still used.",
      note: "Distances and margins are minigame values inspired by the mission; they are not exact historical measurements.",
      part_antenna: "Antenna", part_solar_panel: "Solar panel", part_seismometer: "Seismometer", part_prisms: "Prisms", part_support: "Support" }
  };
  const lang = () => (window.StarI18n?.lang === "en" ? "en" : "es");
  const t = (k, v) => { let s = T[lang()][k] ?? k; for (const [a, b] of Object.entries(v || {})) s = s.replace("{" + a + "}", b); return s; };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const F = () => window.StarFlow;
  const S = { phase: null, pos: { x: 0, y: 3 }, angle: 0, easepPos: null, feedback: "", laser: 0, locked: false, finished: false };
  let ui = null;

  function phaseNow() {
    const f = F(); if (!f) return null;
    const cur = f.getCurrentStage();
    if (cur === "moon_install_easep") return "easep";
    if (cur === "moon_install_reflector") return "lrrr";
    return null;
  }
  function easepPosition() {
    return Core.easepTarget();
  }

  function build() {
    const root = el("section", "mg"); root.dataset.instrumentMap = "true"; root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.hidden = true;
    const panel = el("div", "mg-panel");
    const close = el("button", "mg-btn"); close.type = "button"; close.style && (close.style.float = "right"); close.addEventListener("click", hide);
    const kicker = el("p", "mg-kicker"); const title = el("h2", "mg-title"); const text = el("p", "mg-text");
    const canvas = el("canvas", "mg-canvas"); canvas.width = 480; canvas.height = 300;
    const hud = el("div", "mg-hud"); const d1 = el("span"); const d2 = el("span"); hud.append(d1, d2);
    const pad = el("div", "mg-pad");
    const mk = (label, fn) => { const b = el("button", "mg-btn", label); b.type = "button"; b.addEventListener("click", fn); pad.append(b); return b; };
    mk("◀", () => move(-1, 0)); mk("▲", () => move(0, -1)); mk("▼", () => move(0, 1)); mk("▶", () => move(1, 0));
    const rotL = mk("↺", () => rotate(-15)), rotR = mk("↻", () => rotate(15));
    const feedback = el("p", "mg-feedback"); feedback.setAttribute("aria-live", "polite");
    const parts = el("div", "mg-actions");
    const actions = el("div", "mg-actions"); const go = el("button", "mg-btn primary"); go.type = "button"; go.addEventListener("click", confirm); actions.append(go);
    const note = el("p", "moon-sim-note"); note.hidden = true;
    const frame = el("div", "evidence-scene-photo");frame.append(canvas);
    const refEasep = window.StarEvidenceVisual?.figure("easep"), refLrrr = window.StarEvidenceVisual?.figure("reflector");
    for (const photo of [refEasep,refLrrr]) if(photo){photo.hidden=true;frame.append(photo);}
    pad.append(go); panel.append(close, kicker, title, text, frame, hud, pad, feedback, parts, note); root.append(panel); document.body.append(root);
    // Arrastre táctil o con el mouse sobre el mapa.
    let dragging = false;
    const toMeters = e => { const r = canvas.getBoundingClientRect?.() || { left: 0, top: 0, width: 480, height: 300 }; const x = (e.clientX - r.left) / r.width * 480, y = (e.clientY - r.top) / r.height * 300; return { x: Math.round((x - 240) / 12), y: Math.round((y - 60) / 12) }; };
    canvas.addEventListener("pointerdown", e => { if (S.locked) return; dragging = true; canvas.setPointerCapture?.(e.pointerId); S.pos = clamp(toMeters(e)); draw(); render(); });
    canvas.addEventListener("pointermove", e => { if (dragging && !S.locked) { S.pos = clamp(toMeters(e)); draw(); render(); } });
    for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) canvas.addEventListener(ev, () => { dragging = false; });
    // Teclado mientras el minijuego está abierto (aunque el foco haya quedado fuera del diálogo).
    document.addEventListener("keydown", e => {
      if (!ui || ui.root.hidden) return;
      const k = e.key; if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","q","e","Escape"].includes(k)) e.preventDefault?.(); if (k === "ArrowLeft") move(-1, 0); else if (k === "ArrowRight") move(1, 0); else if (k === "ArrowUp") move(0, -1); else if (k === "ArrowDown") move(0, 1);
      else if (k === "q") rotate(-15); else if (k === "e") rotate(15); else if (k === "Escape") hide();
    });
    ui = { root, pad, close, kicker, title, text, canvas, d1, d2, rotL, rotR, feedback, parts, go, note, refEasep, refLrrr };
    document.addEventListener("starstep:language", () => { render(); if (!ui.root.hidden) draw(); });
  }
  const clamp = p => ({ x: Math.max(-19, Math.min(19, p.x)), y: Math.max(-4, Math.min(19, p.y)) });
  function move(dx, dy) { if (S.locked) return; S.pos = clamp({ x: S.pos.x + dx, y: S.pos.y + dy }); S.feedback = ""; draw(); render(); }
  function rotate(d) { if (S.locked || S.phase !== "lrrr") return; S.angle = (S.angle + d + 360) % 360; S.feedback = ""; draw(); render(); }

  function draw() {
    const c = ui?.canvas?.getContext?.("2d"); if (!c) return;
    const X = m => 240 + m * 12, Y = m => 60 + m * 12;
    c.fillStyle = "#71778f"; c.fillRect(0, 0, 480, 300);
    for(let i=0;i<100;i++){const x=(i*97)%480,y=(i*53)%300;c.fillStyle=i%4===0?"#C3C7D6":"#575C74";c.fillRect(x,y,i%5+1,2);}
    for(let i=0;i<9;i++){const x=18+(i*83)%440,y=16+(i*59)%260;for(let dy=-4;dy<=4;dy++){const w=Math.floor(12*Math.sqrt(Math.max(0,1-dy*dy/17)));c.fillStyle=dy<0?"#9A9FB5":"#575C74";c.fillRect(x-w,y+dy,w*2+1,1);}}
    c.fillStyle="rgba(228,223,255,.22)";for(let x=0;x<=480;x+=60)for(let y=0;y<300;y+=4)c.fillRect(x,y,1,2);for(let y=0;y<=300;y+=60)for(let x=0;x<480;x+=4)c.fillRect(x,y,2,1);
    // Destino a escala: zona de tolerancia y referencia visual.
    const isEasep = S.phase === "easep";
    const goal = isEasep ? Core.easepTarget() : Core.target(easepPosition(), Core.LRRR.distance, Core.LRRR.bearing);
    const good = isEasep ? Core.checkEasep(S.pos).ok : Core.checkReflector(S.pos, S.angle, easepPosition()).position;
    const radius = (isEasep ? Core.EASEP.tolerance : Core.LRRR.tolerance) * 12;
    c.save(); c.beginPath(); const ref = isEasep ? Core.EAGLE : easepPosition(); c.moveTo(X(ref.x),Y(ref.y)); c.lineTo(X(goal.x),Y(goal.y)); c.strokeStyle="#FFE066"; c.setLineDash?.([3,4]); c.stroke(); c.beginPath(); c.arc(X(goal.x), Y(goal.y), radius, 0, Math.PI*2);
    c.fillStyle = good ? "rgba(143,240,216,.35)" : "rgba(255,224,102,.17)"; c.fill();
    c.strokeStyle = good ? "#8FF0D8" : "#FFE066"; c.lineWidth = 2; c.setLineDash?.([4,3]); c.stroke(); c.restore();
    c.font = "bold 10px monospace"; c.fillStyle = "#FFF8E7"; c.fillText(lang() === "es" ? "ZONA OBJETIVO" : "TARGET ZONE", X(goal.x)+radius+5, Y(goal.y));
    // Eagle
    c.fillStyle="#1A1340";c.fillRect(X(0)-15,Y(0)-15,30,30);for(const dx of [-18,15])for(const dy of [-18,15])c.fillRect(X(0)+dx,Y(0)+dy,4,4);c.fillStyle = "#FFC93C"; c.fillRect(X(0) - 12, Y(0) - 12, 24, 24); c.fillStyle = "#FFE066"; c.fillRect(X(0) - 7, Y(0) - 7, 14, 14);
    c.fillStyle = "#FFF8E7"; c.font = "bold 11px monospace"; c.fillText("EAGLE", X(0)+20, Y(0)+4);
    // Norte y escala
    c.fillStyle = "#0E1233"; c.fillRect(440, 8, 30, 40); c.fillStyle = "#FFF8E7"; c.fillRect(454, 14, 3, 18); c.font = "12px monospace"; c.fillText("N", 451, 44);
    c.fillStyle = "#FFF8E7"; c.fillRect(16, 282, 60, 4); c.fillText("5 m", 18, 278);
    if (S.phase === "lrrr") {
      const e = easepPosition(); c.fillStyle = "#4F86D9"; c.fillRect(X(e.x) - 9, Y(e.y) - 5, 18, 10); c.fillStyle = "#FFE066"; c.fillRect(X(e.x) - 2, Y(e.y) + 5, 4, 4);
      c.fillStyle = "#FFF8E7"; c.fillText("EASEP", X(e.x)+14, Y(e.y)+4);
      // La flecha es un rumbo, no un punto fijo: Tierra a 60° del norte.
      const a = Core.LRRR.earthAngle * Math.PI / 180;
      c.fillStyle = "#0E1233"; c.fillRect(350, 58, 120, 44);
      c.strokeStyle = "#3FD0E0"; c.lineWidth = 2; c.beginPath(); c.moveTo(363,84); c.lineTo(363+Math.sin(a)*23,84-Math.cos(a)*23); c.stroke();
      c.fillStyle = "#3FD0E0"; c.fillText("⊕", 382, 76); c.fillText(lang() === "es" ? "TIERRA 60°" : "EARTH 60°", 390, 90);
    }
    // Instrumento del jugador
    const x = X(S.pos.x), y = Y(S.pos.y);
    if (S.phase === "easep") { c.fillStyle = "#4F86D9"; c.fillRect(x - 10, y - 6, 20, 12); c.fillStyle="#1A1340";for(let i=0;i<5;i++)c.fillRect(x-9+i*4,y-5,1,10);c.fillStyle="#8BB6E8";c.fillRect(x-9,y-5,18,1); c.fillStyle = "#FFE066"; c.fillRect(x - 2, y + 6, 4, 4); }
    else { c.save?.(); c.translate?.(x, y); c.rotate?.(S.angle * Math.PI / 180); c.fillStyle = "#E4DFFF"; c.fillRect(-8, -6, 16, 12); c.fillStyle = "#3E4256"; for(let j=0;j<3;j++)for(let i=0;i<4;i++)c.fillRect(-6+i*3,-4+j*3,2,2); c.fillStyle = "#3FD0E0"; c.fillRect(-1, -12, 2, 6); c.restore?.(); }
    if (S.phase === "lrrr") {
      const a = S.angle * Math.PI / 180;
      c.fillStyle = S.laser ? "#8FF0D8" : "#FFF8E7";
      for (let i = 3; i < (S.laser ? 45 : 12); i++) c.fillRect(x + Math.sin(a) * i * 4, y - Math.cos(a) * i * 4, 2, 2);
    }
  }

  function render() {
    if (!ui) return;
    ui.close.textContent = t("close"); ui.kicker.textContent = t("kicker"); ui.note.textContent = t("note");
    const easep = S.phase === "easep";
    if (ui.refEasep) ui.refEasep.hidden = !easep; if(ui.refLrrr) ui.refLrrr.hidden = easep;
    ui.title.textContent = easep ? t("easepTitle") : t("lrrrTitle");
    ui.text.textContent = easep ? t("easepText") : t("lrrrText");
    ui.rotL.hidden = ui.rotR.hidden = easep;
    if (easep) { const r = Core.checkEasep(S.pos); ui.d1.textContent = t("dEagle", { d: r.fromEagle.toFixed(1), c: lang() === "en" ? Core.compass(r.bearing).replace(/O/g,"W") : Core.compass(r.bearing) }); ui.d2.hidden = true; }
    else { const e = easepPosition(); const r = Core.checkReflector(S.pos, S.angle, e); ui.d1.textContent = t("dEasep", { d: r.fromEasep.toFixed(1), c: lang() === "en" ? Core.compass(r.bearing).replace(/O/g,"W") : Core.compass(r.bearing) }); ui.d2.hidden = false; ui.d2.textContent = t("angle", { a: Math.round(S.angle), e: Core.LRRR.earthAngle }); }
    ui.go.textContent = S.finished ? (lang() === "es" ? "CONTINUAR" : "CONTINUE") : easep ? t("install") : t("fire");
    const r = easep ? Core.checkEasep(S.pos) : Core.checkReflector(S.pos, S.angle, easepPosition());
    const positionOK = easep ? r.ok : r.position;
    const ok = s => s ? " ✓" : " ·";
    ui.d1.textContent += ok(positionOK);
    ui.d1.dataset.valid = String(positionOK);
    if (!easep) { ui.d2.textContent += ok(r.orientation); ui.d2.dataset.valid = String(r.orientation); }
    for (const b of ui.pad.children) if (b !== ui.go) b.disabled = S.locked;
    ui.go.disabled = S.locked && !S.finished;
    ui.go.hidden = S.locked && !S.finished;
    ui.feedback.textContent = S.feedback || (S.locked ? "" : !positionOK ? (lang() === "es" ? "Mové el instrumento a la zona marcada." : "Move the instrument into the marked zone.") : (!easep && !r.orientation) ? (lang() === "es" ? "Posición correcta. Girá hacia 60°." : "Position correct. Rotate toward 60°.") : (lang() === "es" ? "¡Listo! Confirmá la instalación." : "Ready! Confirm the installation."));
  }

  function showParts(id, done) {
    ui.parts.replaceChildren(el("span", "mg-text", t("inspect")));
    const f = F(); const art = f.getArtifact(id);
    for (const comp of art.required) {
      const b = el("button", "mg-btn", t("part_" + comp)); b.type = "button"; b.dataset.part = comp;
      if (art.components.includes(comp)) b.disabled = true;
      b.addEventListener("click", () => {
        const r = f.inspectComponent(id, comp, { context: "mission", viewer: "fallback" });
        if (r.ok) b.disabled = true;
        window.StarSound?.effect?.("scan");
        if (f.getArtifact(id).state === "registered") { S.feedback = done; window.StarSound?.effect?.("success"); render(); finishPhase(); }
      });
      ui.parts.append(b);
    }
  }
  function finishPhase() {
    // Si el reflector sigue pendiente, la misma pantalla continúa con él.
    const next = phaseNow();
    if (next && next !== S.phase) {
      S.phase = next; S.locked = false; S.laser = 0; S.angle = 0; S.feedback = "";
      S.pos = clamp({ x: easepPosition().x, y: easepPosition().y - 2 });
      ui.parts.replaceChildren(); render(); draw();
    } else { S.finished = true; render(); draw(); }
  }

  function confirm() {
    const f = F(); if (!f) return;
    if (S.finished) { hide(); return; }
    if (S.locked || phaseNow() !== S.phase) return;
    if (S.phase === "easep") {
      const r = Core.checkEasep(S.pos);
      if (!r.ok) { S.feedback = t("tooFar"); render(); return; }
      const loc = f.locateArtifact("easep", { mechanic: "easep_install_minigame" });
      if (!loc.ok) { S.feedback = loc.code; render(); return; }
      f.recordObjective("moon_install_easep.install", { source: "easep_install_minigame" });
      f.beginInspection("easep", { context: "mission", viewer: "fallback" });
      S.pos = Core.easepTarget(); S.easepPos = { ...S.pos }; S.locked = true;
      S.feedback = ""; render(); draw(); showParts("easep", t("easepDone"));
      return;
    }
    const r = Core.checkReflector(S.pos, S.angle, easepPosition());
    if (!r.position || !r.orientation) { S.feedback = [!r.position ? t("badPos") : "", !r.orientation ? t("badAngle") : ""].filter(Boolean).join(" "); render(); return; }
    const loc = f.locateArtifact("reflector", { mechanic: "reflector_install_minigame" });
    if (!loc.ok) { S.feedback = loc.code; render(); return; }
    f.recordObjective("moon_install_reflector.install", { source: "reflector_install_minigame" });
    f.recordObjective("moon_install_reflector.orient", { source: "reflector_orientation_minigame" });
    f.beginInspection("reflector", { context: "mission", viewer: "fallback" });
    S.pos = Core.target(easepPosition(), Core.LRRR.distance, Core.LRRR.bearing); S.angle = Core.LRRR.earthAngle; S.locked = true;
    S.laser = 1; draw(); S.feedback = ""; render(); showParts("reflector", t("lrrrDone"));
  }

  function open() {
    const p = phaseNow(); if (!p) return false;
    if (!ui) build();
    S.phase = p; S.feedback = ""; S.laser = 0; S.angle = 0; S.locked = false; S.finished = false;
    if (p === "easep") { S.pos = { x: 0, y: 3 }; } else { const e = easepPosition(); S.pos = clamp({ x: e.x, y: e.y - 2 }); }
    ui.go.disabled = false; ui.parts.replaceChildren(); ui.root.hidden = false;
    const f = F(), id = p === "easep" ? "easep" : "reflector";
    const objectives = f.getState().objectives;
    const installed = p === "easep" ? !!objectives["moon_install_easep.install"] : !!objectives["moon_install_reflector.install"] && !!objectives["moon_install_reflector.orient"];
    if (installed) {
      const started = f.beginInspection(id, {context:"mission", viewer:"fallback"});
      if (started.ok) {
        S.locked = true;
        S.pos = p === "easep" ? Core.easepTarget() : Core.target(easepPosition(), Core.LRRR.distance, Core.LRRR.bearing);
        if (p === "lrrr") { S.angle = Core.LRRR.earthAngle; S.laser = 1; }
        showParts(id, p === "easep" ? t("easepDone") : t("lrrrDone"));
      }
    }
    render(); draw();
    try { ui.go.focus?.({ preventScroll: true }); } catch { /* sin foco */ }
    return true;
  }
  function hide() { if (ui) ui.root.hidden = true; refreshLauncher(); }

  // Botón en /luna, visible cuando StarFlow está en una etapa de instrumentos.
  let launcher = null;
  function refreshLauncher() {
    const hud = document.getElementById("moonHud");
    if (!launcher && hud) { launcher = el("button", "mg-btn primary"); launcher.type = "button"; launcher.id = "openInstruments"; launcher.addEventListener("click", open); hud.append(launcher); }
    if (launcher) { launcher.textContent = t("open"); launcher.hidden = !phaseNow(); }
  }
  document.addEventListener("starflow:change", refreshLauncher);
  document.addEventListener("starstep:language", refreshLauncher);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(refreshLauncher, 0)); else setTimeout(refreshLauncher, 0);

  window.StarLunarInstruments = Object.freeze({ open, hide, move, rotate, confirm, get state() { return { phase: S.phase, pos: { ...S.pos }, angle: S.angle, open: !!ui && !ui.root.hidden }; } });
})();
