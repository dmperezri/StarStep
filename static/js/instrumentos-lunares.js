"use strict";
/*
 * StarStep · Acto I · Instalación del EASEP y del retrorreflector (LRRR) — captura 06.
 * Mapa superior: cuadrícula de 1 m, norte arriba, escala de 5 m, Eagle como referencia.
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
      lrrrText: "Colocalo unos 5 m al nor-noroeste del EASEP y giralo (↺ ↻) hacia la Tierra. Después, DISPARAR LÁSER.",
      install: "INSTALAR", fire: "DISPARAR LÁSER", close: "CERRAR ✕", rotL: "↺", rotR: "↻",
      dEagle: "Distancia a Eagle: {d} m · {c}", dEasep: "Distancia al EASEP: {d} m · {c}", angle: "Orientación: {a}° (Tierra: {e}°)",
      tooFar: "Todavía no: el EASEP va unos 17 m al SUR de Eagle (margen del juego ±4 m).", badPos: "Posición: tiene que quedar unos 5 m al NNO del EASEP (±2,3 m).", badAngle: "Orientación: girá los espejos hacia la Tierra (±15°).",
      inspect: "Inspeccioná sus partes:", easepDone: "¡EASEP instalado! El sismómetro escuchará sismos lunares y la antena enviará datos a la Tierra.",
      lrrrDone: "¡Pulso recibido! Los prismas devuelven la luz al lugar de donde vino: así se mide la distancia Tierra–Luna. Este espejo todavía se usa.",
      note: "Distancias y márgenes son del minijuego, inspirados en la misión; no son medidas históricas exactas.",
      part_antenna: "Antena", part_solar_panel: "Panel solar", part_seismometer: "Sismómetro", part_prisms: "Prismas", part_support: "Soporte" },
    en: { open: "INSTALL INSTRUMENTS", kicker: "Act I · Moon · Instruments", easepTitle: "Install the EASEP", lrrrTitle: "Install the retroreflector",
      easepText: "Move the experiment package (◀ ▶ ▲ ▼ or drag) about 17 m south of Eagle and press INSTALL.",
      lrrrText: "Place it about 5 m north-northwest of the EASEP and turn it (↺ ↻) toward Earth. Then FIRE LASER.",
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
  const S = { phase: null, pos: { x: 0, y: 3 }, angle: 0, easepPos: null, feedback: "", laser: 0 };
  let ui = null;

  function phaseNow() {
    const f = F(); if (!f) return null;
    const cur = f.getCurrentStage();
    if (cur === "moon_install_easep") return "easep";
    if (cur === "moon_install_reflector") return "lrrr";
    return null;
  }
  function easepPosition() {
    const saved = f => f?.getState?.().checkpoint?.easepPos;
    return S.easepPos || saved(F()) || Core.easepTarget();
  }

  function build() {
    const root = el("section", "mg"); root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.hidden = true;
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
    const note = el("p", "moon-sim-note");
    panel.append(close, kicker, title, text, canvas, hud, pad, feedback, parts, actions, note); root.append(panel); document.body.append(root);
    // Arrastre táctil o con el mouse sobre el mapa.
    let dragging = false;
    const toMeters = e => { const r = canvas.getBoundingClientRect?.() || { left: 0, top: 0, width: 480, height: 300 }; const x = (e.clientX - r.left) / r.width * 480, y = (e.clientY - r.top) / r.height * 300; return { x: Math.round((x - 240) / 12), y: Math.round((y - 60) / 12) }; };
    canvas.addEventListener("pointerdown", e => { dragging = true; S.pos = clamp(toMeters(e)); draw(); render(); });
    canvas.addEventListener("pointermove", e => { if (dragging) { S.pos = clamp(toMeters(e)); draw(); render(); } });
    canvas.addEventListener("pointerup", () => { dragging = false; });
    // Teclado mientras el minijuego está abierto (aunque el foco haya quedado fuera del diálogo).
    document.addEventListener("keydown", e => {
      if (!ui || ui.root.hidden) return;
      const k = e.key; if (k === "ArrowLeft") move(-1, 0); else if (k === "ArrowRight") move(1, 0); else if (k === "ArrowUp") move(0, -1); else if (k === "ArrowDown") move(0, 1);
      else if (k === "q") rotate(-15); else if (k === "e") rotate(15); else if (k === "Escape") hide();
    });
    ui = { root, close, kicker, title, text, canvas, d1, d2, rotL, rotR, feedback, parts, go, note };
    document.addEventListener("starstep:language", render);
  }
  const clamp = p => ({ x: Math.max(-19, Math.min(19, p.x)), y: Math.max(-4, Math.min(19, p.y)) });
  function move(dx, dy) { S.pos = clamp({ x: S.pos.x + dx, y: S.pos.y + dy }); S.feedback = ""; draw(); render(); }
  function rotate(d) { S.angle = (S.angle + d + 360) % 360; S.feedback = ""; draw(); render(); }

  function draw() {
    const c = ui?.canvas?.getContext?.("2d"); if (!c) return;
    const X = m => 240 + m * 12, Y = m => 60 + m * 12;
    c.fillStyle = "#868CA4"; c.fillRect(0, 0, 480, 300);
    c.fillStyle = "#575C74"; for (let i = 0; i < 40; i++) c.fillRect((i * 97) % 480, (i * 53) % 300, 3, 2);
    c.fillStyle = "rgba(14,18,51,.35)"; for (let x = 0; x <= 480; x += 12) c.fillRect(x, 0, 1, 300); for (let y = 0; y <= 300; y += 12) c.fillRect(0, y, 480, 1);
    // Eagle
    c.fillStyle = "#FFC93C"; c.fillRect(X(0) - 12, Y(0) - 12, 24, 24); c.fillStyle = "#FFE066"; c.fillRect(X(0) - 7, Y(0) - 7, 14, 14);
    // Norte y escala
    c.fillStyle = "#0E1233"; c.fillRect(440, 8, 30, 40); c.fillStyle = "#FFF8E7"; c.fillRect(454, 14, 3, 18); c.font = "12px monospace"; c.fillText("N", 451, 44);
    c.fillStyle = "#FFF8E7"; c.fillRect(16, 282, 60, 4); c.fillText("5 m", 18, 278);
    if (S.phase === "lrrr") {
      const e = easepPosition(); c.fillStyle = "#4F86D9"; c.fillRect(X(e.x) - 9, Y(e.y) - 5, 18, 10); c.fillStyle = "#FFE066"; c.fillRect(X(e.x) - 2, Y(e.y) + 5, 4, 4);
      // Dirección de la Tierra
      const a = Core.LRRR.earthAngle * Math.PI / 180; c.fillStyle = "#3FD0E0"; c.fillRect(X(e.x) + Math.sin(a) * 140, Y(e.y) - Math.cos(a) * 140, 10, 10); c.fillText("⊕", X(e.x) + Math.sin(a) * 140 - 2, Y(e.y) - Math.cos(a) * 140 - 4);
    }
    // Instrumento del jugador
    const x = X(S.pos.x), y = Y(S.pos.y);
    if (S.phase === "easep") { c.fillStyle = "#4F86D9"; c.fillRect(x - 10, y - 6, 20, 12); c.fillStyle = "#FFE066"; c.fillRect(x - 2, y + 6, 4, 4); }
    else { c.save?.(); c.translate?.(x, y); c.rotate?.(S.angle * Math.PI / 180); c.fillStyle = "#E4DFFF"; c.fillRect(-8, -6, 16, 12); c.fillStyle = "#3E4256"; for (let i = 0; i < 3; i++) c.fillRect(-6 + i * 5, -4, 3, 3); c.fillStyle = "#3FD0E0"; c.fillRect(-1, -12, 2, 6); c.restore?.(); }
    if (S.laser > 0) { const a = Core.LRRR.earthAngle * Math.PI / 180; c.fillStyle = "#D9593A"; for (let i = 0; i < 30; i++) c.fillRect(x + Math.sin(a) * i * 6, y - Math.cos(a) * i * 6, 3, 3); }
  }

  function render() {
    if (!ui) return;
    ui.close.textContent = t("close"); ui.kicker.textContent = t("kicker"); ui.note.textContent = t("note");
    const easep = S.phase === "easep";
    ui.title.textContent = easep ? t("easepTitle") : t("lrrrTitle");
    ui.text.textContent = easep ? t("easepText") : t("lrrrText");
    ui.rotL.hidden = ui.rotR.hidden = easep;
    if (easep) { const r = Core.checkEasep(S.pos); ui.d1.textContent = t("dEagle", { d: r.fromEagle.toFixed(1), c: Core.compass(r.bearing) }); ui.d2.hidden = true; }
    else { const e = easepPosition(); const r = Core.checkReflector(S.pos, S.angle, e); ui.d1.textContent = t("dEasep", { d: r.fromEasep.toFixed(1), c: Core.compass(r.bearing) }); ui.d2.hidden = false; ui.d2.textContent = t("angle", { a: Math.round(S.angle), e: Core.LRRR.earthAngle }); }
    ui.go.textContent = easep ? t("install") : t("fire");
    ui.feedback.textContent = S.feedback;
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
    if (next && next !== S.phase) { S.phase = next; S.pos = clamp({ x: easepPosition().x, y: easepPosition().y - 2 }); setTimeout?.(() => { ui.parts.replaceChildren(); ui.go.disabled = false; render(); draw(); try { ui.go.focus?.({ preventScroll: true }); } catch { /* sin foco */ } }, 1800); }
    else { ui.go.disabled = true; }
  }

  function confirm() {
    const f = F(); if (!f) return;
    if (S.phase === "easep") {
      const r = Core.checkEasep(S.pos);
      if (!r.ok) { S.feedback = t("tooFar"); render(); return; }
      const loc = f.locateArtifact("easep", { mechanic: "easep_install_minigame" });
      if (!loc.ok) { S.feedback = loc.code; render(); return; }
      f.recordObjective("moon_install_easep.install", { source: "easep_install_minigame" });
      f.beginInspection("easep", { context: "mission", viewer: "fallback" });
      S.easepPos = { ...S.pos };
      ui.go.disabled = true; S.feedback = ""; render(); showParts("easep", t("easepDone"));
      return;
    }
    const r = Core.checkReflector(S.pos, S.angle, easepPosition());
    if (!r.position || !r.orientation) { S.feedback = [!r.position ? t("badPos") : "", !r.orientation ? t("badAngle") : ""].filter(Boolean).join(" "); render(); return; }
    const loc = f.locateArtifact("reflector", { mechanic: "reflector_install_minigame" });
    if (!loc.ok) { S.feedback = loc.code; render(); return; }
    f.recordObjective("moon_install_reflector.install", { source: "reflector_install_minigame" });
    f.recordObjective("moon_install_reflector.orient", { source: "reflector_orientation_minigame" });
    f.beginInspection("reflector", { context: "mission", viewer: "fallback" });
    S.laser = 1; draw(); ui.go.disabled = true; S.feedback = ""; render(); showParts("reflector", t("lrrrDone"));
  }

  function open() {
    const p = phaseNow(); if (!p) return false;
    if (!ui) build();
    S.phase = p; S.feedback = ""; S.laser = 0;
    if (p === "easep") { S.pos = { x: 0, y: 3 }; } else { const e = easepPosition(); S.pos = clamp({ x: e.x, y: e.y - 2 }); }
    ui.go.disabled = false; ui.parts.replaceChildren(); ui.root.hidden = false; render(); draw();
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
