"use strict";
/*
 * StarStep · Acto I · Regreso (acoplamiento con Columbia) y laboratorio en la Tierra.
 * Captura 07 y escenas finales del video.
 *   Regreso: la etapa de descenso de Eagle queda en la Luna; la de ascenso sube a la órbita.
 *            Acoplamiento interactivo: corregir altura (▲▼) y velocidad de acercamiento (◀▶).
 *            Contacto seguro: desalineación ≤ 6 y velocidad ≤ 1,2 (unidades del juego).
 *            Si falla, rebota y se reintenta. Luego, regreso y amerizaje → moon_return.docking.
 *   Laboratorio: encontrar 3 vesículas en el basalto 10057, clasificar Observado / Interpretado
 *            y responder qué cuentan las vesículas → moon_lab.analysis.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.StarReturnCore = api;
})(typeof window !== "undefined" ? window : null, function () {
  const DOCK = Object.freeze({ start: 300, maxSpeed: 1.2, maxOffset: 6, accel: 0.2, nudge: 2 });
  function initialDock() { return { distance: DOCK.start, speed: 2, offset: 22, drift: 0.15 }; }
  // Un paso de simulación (dt en segundos). Devuelve { state, result: null|"docked"|"bounce" }.
  function stepDock(s, dt, input = {}) {
    const n = { ...s };
    if (input.faster) n.speed = Math.min(6, n.speed + DOCK.accel);
    if (input.slower) n.speed = Math.max(0.2, n.speed - DOCK.accel);
    if (input.up) n.offset -= DOCK.nudge;
    if (input.down) n.offset += DOCK.nudge;
    n.offset += n.drift * dt * 10;
    n.distance = Math.max(0, n.distance - n.speed * dt * 10);
    if (n.distance > 0) return { state: n, result: null };
    const ok = Math.abs(n.offset) <= DOCK.maxOffset && n.speed <= DOCK.maxSpeed;
    return { state: n, result: ok ? "docked" : "bounce" };
  }
  const VESICLES = Object.freeze([{ x: 150, y: 110, r: 14 }, { x: 250, y: 150, r: 12 }, { x: 330, y: 100, r: 13 }]);
  function hitVesicle(x, y, found) { return VESICLES.findIndex((v, i) => !found.has(i) && Math.hypot(v.x - x, v.y - y) <= v.r + 6); }
  const STATEMENTS = Object.freeze([
    { id: "s1", kind: "observed", es: "La roca 10057 tiene agujeritos redondos.", en: "Rock 10057 has round little holes." },
    { id: "s2", kind: "interpreted", es: "Los agujeritos fueron burbujas de gas en lava.", en: "The holes were gas bubbles in lava." },
    { id: "s3", kind: "observed", es: "La roca es oscura y pesa 919 g.", en: "The rock is dark and weighs 919 g." },
    { id: "s4", kind: "interpreted", es: "Los mares oscuros de la Luna son lava antigua.", en: "The Moon's dark seas are ancient lava." }
  ]);
  const QUESTION = Object.freeze({
    es: { q: "¿Qué nos cuentan las vesículas del basalto?", options: ["Que hubo agua líquida", "Que la roca fue lava con gas que se enfrió", "Que hubo vida en la Luna"], answer: 1,
      explain: ["No: el basalto lunar no muestra agua líquida.", "¡Sí! Burbujas de gas atrapadas al enfriarse la lava, hace unos 3.600 millones de años.", "No: las muestras de Apollo 11 no tienen vida."] },
    en: { q: "What do the basalt's vesicles tell us?", options: ["That there was liquid water", "That the rock was lava with gas that cooled", "That there was life on the Moon"], answer: 1,
      explain: ["No: lunar basalt shows no liquid water.", "Yes! Gas bubbles trapped as the lava cooled, about 3.6 billion years ago.", "No: the Apollo 11 samples contain no life."] }
  });
  return Object.freeze({ DOCK, initialDock, stepDock, VESICLES, hitVesicle, STATEMENTS, QUESTION });
});

/* ── Navegador ───────────────────────────────────────────────── */
(function () {
  if (typeof window === "undefined" || typeof document === "undefined" || !window.StarReturnCore) return;
  const Core = window.StarReturnCore;
  const T = {
    es: { openReturn: "REGRESO A LA TIERRA", openLab: "LABORATORIO", close: "CERRAR ✕", kicker: "Acto I · Luna",
      dockTitle: "Acoplamiento con Columbia", dockText: "La etapa de descenso de Eagle se queda en la Luna: fue la plataforma de despegue. La etapa de ascenso sube hasta Columbia, donde espera Collins. Acoplá con ▲▼ (altura) y ◀▶ (velocidad): llegá alineado y despacio.",
      start: "ENCENDER MOTOR", retry: "REINTENTAR", dist: "Distancia: {d}", speed: "Velocidad: {s}", offset: "Desalineación: {o}",
      docked: "¡Acoplados! Aldrin y Armstrong pasan a Columbia con las muestras. El 24 de julio de 1969, la cápsula amerizó en el océano Pacífico.",
      bounce: "¡Rebote! Llegaste {why}. Probá de nuevo.", tooFast: "demasiado rápido", offAxis: "desalineado", continue: "AL LABORATORIO ›",
      labTitle: "Laboratorio en la Tierra", labText: "Las rocas llegaron a casa. Estudiemos el basalto 10057.", step1: "1 · Tocá las 3 vesículas (agujeritos) de la roca.", found: "Vesículas: {n}/3",
      step2: "2 · ¿Es una observación o una interpretación?", observed: "OBSERVADO", interpreted: "INTERPRETADO", step3: "3 · Pregunta final", labDone: "¡Análisis completo! Ya podés recibir tu diploma lunar en la bitácora.", wrong: "Revisá: ¿se ve directamente o es una explicación?" },
    en: { openReturn: "RETURN TO EARTH", openLab: "LABORATORY", close: "CLOSE ✕", kicker: "Act I · Moon",
      dockTitle: "Docking with Columbia", dockText: "Eagle's descent stage stays on the Moon: it was the launch platform. The ascent stage climbs to Columbia, where Collins waits. Dock with ▲▼ (height) and ◀▶ (speed): arrive aligned and slow.",
      start: "FIRE ENGINE", retry: "RETRY", dist: "Distance: {d}", speed: "Speed: {s}", offset: "Misalignment: {o}",
      docked: "Docked! Aldrin and Armstrong move to Columbia with the samples. On July 24, 1969, the capsule splashed down in the Pacific Ocean.",
      bounce: "Bounce! You arrived {why}. Try again.", tooFast: "too fast", offAxis: "misaligned", continue: "TO THE LAB ›",
      labTitle: "Laboratory on Earth", labText: "The rocks are home. Let's study basalt 10057.", step1: "1 · Tap the 3 vesicles (little holes) in the rock.", found: "Vesicles: {n}/3",
      step2: "2 · Is it an observation or an interpretation?", observed: "OBSERVED", interpreted: "INTERPRETED", step3: "3 · Final question", labDone: "Analysis complete! You can now receive your lunar diploma in the logbook.", wrong: "Check again: is it seen directly, or is it an explanation?" }
  };
  const lang = () => (window.StarI18n?.lang === "en" ? "en" : "es");
  const t = (k, v) => { let s = T[lang()][k] ?? k; for (const [a, b] of Object.entries(v || {})) s = s.replace("{" + a + "}", b); return s; };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const F = () => window.StarFlow;
  const stage = () => F()?.getCurrentStage?.();

  // ── Acoplamiento ──
  let dock = null;
  function openDock() {
    if (stage() !== "moon_return") return false;
    const root = el("section", "mg ss-docking"); root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true");
    const panel = el("div", "mg-panel"); const close = el("button", "mg-btn", t("close")); close.type = "button";
    const kicker = el("p", "mg-kicker", t("kicker")); const title = el("h2", "mg-title", t("dockTitle")); const text = el("p", "mg-text", t("dockText"));
    const canvas = el("canvas", "mg-canvas"); canvas.width = 480; canvas.height = 220;
    const hud = el("div", "mg-hud"); const hd = el("span"), hs = el("span"), ho = el("span"); hud.append(hd, hs, ho);
    const pad = el("div", "mg-pad"); const feedback = el("p", "mg-feedback"); feedback.setAttribute("aria-live", "polite");
    const input = { up: false, down: false, faster: false, slower: false };
    const mk = (label, key) => { const b = el("button", "mg-btn", label); b.type = "button"; b.addEventListener("click", () => { input[key] = true; tick(0.05); }); pad.append(b); return b; };
    mk("▲", "up"); mk("▼", "down"); mk("◀", "slower"); mk("▶", "faster");
    const actions = el("div", "mg-actions"); const go = el("button", "mg-btn primary", t("start")); go.type = "button"; actions.append(go);
    const frame = el("div", "evidence-scene-photo");frame.append(canvas);const historical = window.StarEvidenceVisual?.figure("ascent");if(historical) frame.append(historical);
    panel.append(close, kicker, title, text, frame, hud, pad, feedback, actions); root.append(panel); document.body.append(root);
    let s = Core.initialDock(), running = false, raf = 0, last = 0, finished = false;
    function draw() {
      const c = canvas.getContext?.("2d"); if (!c) return;
      c.fillStyle = "#0E1233"; c.fillRect(0, 0, 480, 220); c.fillStyle = "#FFF8E7"; for (let i = 0; i < 40; i++) c.fillRect((i * 83) % 480, (i * 37) % 160, 1, 1);
      for(let y=160;y<220;y+=2){const half=Math.sqrt(Math.max(0,180*180-(y-340)**2));c.fillStyle="#C3C7D6";c.fillRect(240-half,y,half*2,2);}c.fillStyle="#868CA4";c.fillRect(200,208,30,7);
      // Tierra visible durante el acoplamiento.
      if (window.StarPlanets?.draw) {
        const reduced = window.matchMedia?.(
          "(prefers-reduced-motion: reduce)"
        )?.matches;

        window.StarPlanets.draw(
          c, "earth", 135, 65, 43,
          reduced ? 0 : performance.now()/1600
        );
      }

      c.fillStyle = "#E4DFFF"; c.fillRect(380, 92, 80, 26); c.fillStyle = "#868CA4"; c.fillRect(370, 98, 12, 14);   // Columbia
      const x = 380 - s.distance - 34, y = 92 + s.offset;
      c.fillStyle = "#C3C7D6"; c.fillRect(x, y, 30, 24); c.fillStyle = "#3FD0E0"; c.fillRect(x + 20, y + 6, 6, 6); c.fillStyle = "#FFE066"; c.fillRect(x - 6, y + 10, 6, 4);
      c.fillStyle = "rgba(143,240,216,.6)"; c.fillRect(0, 104, 480, 1);
    }
    function render() {
      hd.textContent = t("dist", { d: Math.round(s.distance) }); hs.textContent = t("speed", { s: s.speed.toFixed(1) }); ho.textContent = t("offset", { o: Math.round(s.offset) });
      draw();
    }
    function tick(dt) {
      if (!running || finished) { input.up = input.down = input.faster = input.slower = false; render(); return; }
      const r = Core.stepDock(s, dt, input); s = r.state; input.up = input.down = input.faster = input.slower = false;
      if (r.result === "docked") {
        finished = true; running = false;
        F().recordObjective("moon_return.docking", { source: "docking_minigame" });
        feedback.textContent = t("docked"); go.textContent = t("continue"); go.disabled = false; window.StarSound?.effect?.("success");
      } else if (r.result === "bounce") {
        running = false;
        const why = [s.speed > Core.DOCK.maxSpeed ? t("tooFast") : "", Math.abs(s.offset) > Core.DOCK.maxOffset ? t("offAxis") : ""].filter(Boolean).join(" y ");
        feedback.textContent = t("bounce", { why }); go.textContent = t("retry"); go.disabled = false; s = Core.initialDock();
      }
      render();
    }
    const loop = now => { if (!running) return; const dt = last ? Math.min(0.1, (now - last) / 1000) : 0; last = now; tick(dt); raf = requestAnimationFrame(loop); };
    go.addEventListener("click", () => {
      if (finished) { hide(); openLab(); return; }
      s = Core.initialDock(); running = true; feedback.textContent = ""; go.disabled = true; last = 0;
      if (typeof requestAnimationFrame === "function") raf = requestAnimationFrame(loop);
    });
    root.addEventListener("keydown", e => { const m = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "slower", ArrowRight: "faster" }[e.key]; if (m) { input[m] = true; tick(0.05); } if (e.key === "Escape") hide(); });
    function hide() { running = false; if (raf && typeof cancelAnimationFrame === "function") cancelAnimationFrame(raf); root.hidden = true; refresh(); }
    close.addEventListener("click", hide);
    dock = { root, tick, get state() { return { ...s, running, finished }; }, start: () => go.click(), hide };
    render(); return true;
  }

  // ── Laboratorio ──
  let lab = null;
  function openLab() {
    if (stage() !== "moon_lab") return false;
    const root = el("section", "mg ss-laboratory"); root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true");
    const panel = el("div", "mg-panel"); const close = el("button", "mg-btn", t("close")); close.type = "button";
    const title = el("h2", "mg-title", t("labTitle")); const text = el("p", "mg-text", t("labText"));
    const s1 = el("p", "mg-text", t("step1")); const canvas = el("canvas", "mg-canvas"); canvas.width = 480; canvas.height = 240;
    const count = el("p", "mg-hud"); const s2 = el("p", "mg-text", t("step2")); s2.hidden = true;
    const list = el("div", "mg-options"); list.hidden = true;
    const s3 = el("p", "mg-text", t("step3")); s3.hidden = true; const q = el("p", "mg-title"); q.hidden = true;
    const opts = el("div", "mg-options"); opts.hidden = true;
    const feedback = el("p", "mg-feedback"); feedback.setAttribute("aria-live", "polite");
    panel.append(close, title, text); const historicalRock = window.StarEvidenceVisual?.figure("basalt"); if (historicalRock) panel.append(historicalRock); panel.append(s1, canvas, count, s2, list, s3, q, opts, feedback); root.append(panel); document.body.append(root);
    const found = new Set(), classified = new Set();
    function drawRock() {
      const c = canvas.getContext?.("2d"); if (!c) return;
      c.fillStyle="#1A1F4D";c.fillRect(0,0,480,240);c.fillStyle="#262C66";c.fillRect(0,200,480,40);c.fillStyle="#ABA1F5";c.fillRect(0,197,480,3);
      for(let i=0;i<5;i++){c.fillStyle="#14162B";c.fillRect(10+i*96,9,72,22);}
      // Textured rock cross section, matching the original prototype laboratory.
      const oval=(cx,cy,rx,ry,col)=>{c.fillStyle=col;for(let dy=-ry;dy<=ry;dy+=2){const w=Math.floor(rx*Math.sqrt(Math.max(0,1-dy*dy/(ry*ry+.5))));c.fillRect(cx-w,cy+dy,w*2+1,2);}};
      oval(240,124,183,91,"#14162B");oval(240,124,178,86,"#4D5268");oval(221,108,155,65,"#5A6078");
      for(let i=0;i<50;i++){const x=112+(i*73)%250,y=66+(i*37)%120;c.fillStyle=i%4?"#3E4256":"#868CA4";c.fillRect(x,y,2+i%5,2+i%3);}
      Core.VESICLES.forEach((v, i) => { c.fillStyle = found.has(i) ? "#8FF0D8" : "#1A1F4D"; oval(v.x,v.y,Math.max(3,Math.floor(v.r/2)),Math.max(3,Math.floor(v.r/2)),found.has(i)?"#8FF0D8":"#14162B"); });
      c.fillStyle = "#2B2F40"; for (let i = 0; i < 12; i++) c.fillRect(110 + (i * 23) % 260, 70 + (i * 31) % 110, 3, 3);
    }
    function clickRock(x, y) {
      const i = Core.hitVesicle(x, y, found); if (i < 0) return;
      found.add(i); window.StarSound?.effect?.("scan"); count.textContent = t("found", { n: found.size }); drawRock();
      if (found.size === Core.VESICLES.length) { s2.hidden = list.hidden = false; buildStatements(); }
    }
    canvas.addEventListener("pointerdown", e => { const r = canvas.getBoundingClientRect?.() || { left: 0, top: 0, width: 480, height: 240 }; clickRock((e.clientX - r.left) / r.width * 480, (e.clientY - r.top) / r.height * 240); });
    function buildStatements() {
      list.replaceChildren();
      for (const st of Core.STATEMENTS) {
        const row = el("div", "mg-option"); row.dataset.statement = st.id; row.append(el("p", "", st[lang()]));
        for (const kind of ["observed", "interpreted"]) {
          const b = el("button", "mg-btn", t(kind)); b.type = "button"; b.dataset.kind = kind;
          b.addEventListener("click", () => {
            if (classified.has(st.id)) return;
            if (kind !== st.kind) { feedback.textContent = t("wrong"); row.classList.add("bad"); return; }
            classified.add(st.id); row.classList.remove("bad"); row.classList.add("good"); feedback.textContent = "";
            if (classified.size === Core.STATEMENTS.length) { s3.hidden = q.hidden = opts.hidden = false; buildQuestion(); }
          });
          row.append(b);
        }
        list.append(row);
      }
    }
    function buildQuestion() {
      const Q = Core.QUESTION[lang()]; q.textContent = Q.q; opts.replaceChildren();
      Q.options.forEach((o, i) => {
        const b = el("button", "mg-option", o); b.type = "button"; b.dataset.option = String(i);
        b.addEventListener("click", () => {
          feedback.textContent = Q.explain[i];
          if (i !== Q.answer) { b.classList.add("bad"); return; }
          b.classList.add("good");
          const previousStage = F().getCurrentStage();
          const r = F().recordObjective("moon_lab.analysis", { source: "lab_minigame" });

          if (r.ok && previousStage === "moon_lab") {
            window.StarMarsDeparture?.start(Q.explain[i]);
          }
          if (r.ok || r.code === "ALREADY_RECORDED") feedback.textContent = Q.explain[i] + " " + t("labDone");
          window.StarSound?.effect?.("success");
        });
        opts.append(b);
      });
    }
    function hide() { root.hidden = true; refresh(); }
    close.addEventListener("click", hide); root.addEventListener("keydown", e => { if (e.key === "Escape") hide(); });
    count.textContent = t("found", { n: 0 }); drawRock();
    lab = { root, clickRock, hide }; return true;
  }

  // Botones en el HUD de /luna según la etapa actual.
  let bReturn = null, bLab = null;
  function refresh() {
    const hud = document.getElementById("moonHud"); if (!hud) return;
    if (!bReturn) { bReturn = el("button", "mg-btn primary"); bReturn.type = "button"; bReturn.id = "openReturn"; bReturn.addEventListener("click", openDock); hud.append(bReturn); }
    if (!bLab) { bLab = el("button", "mg-btn primary"); bLab.type = "button"; bLab.id = "openLab"; bLab.addEventListener("click", openLab); hud.append(bLab); }
    bReturn.textContent = t("openReturn"); bLab.textContent = t("openLab");
    bReturn.hidden = stage() !== "moon_return"; bLab.hidden = stage() !== "moon_lab";
  }
  document.addEventListener("starflow:change", refresh);
  document.addEventListener("starstep:language", refresh);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(refresh, 0)); else setTimeout(refresh, 0);

  window.StarMoonReturn = Object.freeze({ openDock, openLab, get dock() { return dock; }, get lab() { return lab; } });
})();
