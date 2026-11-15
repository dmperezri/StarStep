"use strict";
/*
 * StarStep · Acto III · Huellas (capturas 12–16).
 *   eagle_connection: el módulo lunar Eagle (Apollo 11, 1969) y el cráter Eagle (Opportunity,
 *                     2004) son cosas distintas con el mismo nombre. Clasificar datos y responder.
 *   mirror_method:    método científico en espejo, 5 pasos (Preguntar, Observar, Medir,
 *                     Interpretar, Límites y legado). En cada paso se asigna cada afirmación a su
 *                     misión; al acertar se registra mirror_method.stepN y se completa la tabla.
 *   Asociación (huellas.js): solo con piezas conseguidas (pieceAvailable).
 * Todo se registra en StarFlow; consultar no otorga nada.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.StarFootprintsCore = api;
})(typeof window !== "undefined" ? window : null, function () {
  const EAGLE_FACTS = Object.freeze([
    { id: "e1", side: "moon", es: "Llevó a Armstrong y Aldrin a la superficie.", en: "It carried Armstrong and Aldrin to the surface." },
    { id: "e2", side: "mars", es: "Es un cráter pequeño en Meridiani Planum.", en: "It is a small crater in Meridiani Planum." },
    { id: "e3", side: "moon", es: "Su etapa de descenso sigue en el Mar de la Tranquilidad.", en: "Its descent stage is still in the Sea of Tranquility." },
    { id: "e4", side: "mars", es: "Opportunity aterrizó dentro de él en 2004.", en: "Opportunity landed inside it in 2004." }
  ]);
  const EAGLE_QUESTION = Object.freeze({
    es: { q: "¿Por qué el cráter de Marte se llama Eagle?", options: ["Porque Apollo 11 aterrizó en Marte", "El equipo de Opportunity le dio ese nombre recordando al Eagle de Apollo 11", "Porque allí se encontró un águila fósil"], answer: 1,
      explain: ["No: Apollo 11 fue a la Luna. Son dos misiones distintas.", "¡Sí! Dos historias distintas unidas por un nombre: 1969 en la Luna, 2004 en Marte.", "No: en Marte no se encontraron fósiles."] },
    en: { q: "Why is the Mars crater called Eagle?", options: ["Because Apollo 11 landed on Mars", "Opportunity's team gave it that name remembering Apollo 11's Eagle", "Because an eagle fossil was found there"], answer: 1,
      explain: ["No: Apollo 11 went to the Moon. They are two different missions.", "Yes! Two different stories joined by a name: 1969 on the Moon, 2004 on Mars.", "No: no fossils were found on Mars."] }
  });
  // Método en espejo: en cada paso, una afirmación de la Luna y una de Marte (captura 13).
  const MIRROR = Object.freeze([
    { step: 1, name: { es: "Preguntar", en: "Ask" }, cards: [
      { side: "moon", es: "¿Tuvo volcanes la Luna? ¿De qué está hecho un mar lunar?", en: "Did the Moon have volcanoes? What is a lunar sea made of?" },
      { side: "mars", es: "¿Hubo agua líquida en Marte? ¿Dónde quedaron sus huellas?", en: "Was there liquid water on Mars? Where did it leave its traces?" }] },
    { step: 2, name: { es: "Observar", en: "Observe" }, cards: [
      { side: "moon", es: "Fotografían el sitio y recogen 21,55 kg de rocas y suelo, más 2 tubos de núcleo.", en: "They photograph the site and collect 21.55 kg of rocks and soil, plus 2 core tubes." },
      { side: "mars", es: "Pancam y el Microscopic Imager observan capas, huecos y «arándanos».", en: "Pancam and the Microscopic Imager observe layers, holes and “blueberries”." }] },
    { step: 3, name: { es: "Medir", en: "Measure" }, cards: [
      { side: "moon", es: "Laboratorios en la Tierra analizan cristales, vesículas, química y edad.", en: "Laboratories on Earth analyze crystals, vesicles, chemistry and age." },
      { side: "mars", es: "Sobre la roca, la RAT raspa y APXS y Mössbauer miden los minerales.", en: "On the rock, the RAT grinds and APXS and Mössbauer measure the minerals." }] },
    { step: 4, name: { es: "Interpretar", en: "Interpret" }, cards: [
      { side: "moon", es: "Basalto: lava enfriada hace unos 3.600 millones de años.", en: "Basalt: lava cooled about 3.6 billion years ago." },
      { side: "mars", es: "Rocas formadas o alteradas por agua líquida (ácida al principio, más neutra después).", en: "Rocks formed or altered by liquid water (acidic at first, more neutral later)." }] },
    { step: 5, name: { es: "Límites y legado", en: "Limits and legacy" }, cards: [
      { side: "moon", es: "Sin agua ni vida en las muestras. El retrorreflector sigue midiendo hoy.", en: "No water or life in the samples. The retroreflector still measures today." },
      { side: "mars", es: "Agua confirmada; la pregunta sobre la vida sigue abierta. El rover quedó en Perseverance Valley.", en: "Water confirmed; the question of life remains open. The rover stayed in Perseverance Valley." }] }
  ]);
  // Asociación: una pieza vale si se registró, o si su etapa ya estaba completa en una partida
  // anterior a esa misión (compatibilidad: no se bloquea a quien no pudo conseguirla).
  function pieceAvailable(flow, def, id) {
    if (flow.getArtifact(id)?.state === "registered") return true;
    const a = def.ARTIFACTS[id]; const st = a && flow.getState().completed?.[a.stage];
    return !!st && flow.getArtifact(id)?.state !== "registered" && st.via === "legacy_access";
  }
  return Object.freeze({ EAGLE_FACTS, EAGLE_QUESTION, MIRROR, pieceAvailable });
});

/* ── Navegador ───────────────────────────────────────────────── */
(function () {
  if (typeof window === "undefined" || typeof document === "undefined" || !window.StarFootprintsCore) return;
  const Core = window.StarFootprintsCore;
  const T = {
    es: { eagleTitle: "Eagle y Eagle", eagleText: "Dos «Eagle», dos misiones. Indicá a cuál corresponde cada dato.", moon: "MÓDULO · LUNA 1969", mars: "CRÁTER · MARTE 2004", wrong: "Revisá: ¿es de la Luna o de Marte?", eagleDone: "★ Conexión registrada",
      mirrorTitle: "El método científico en espejo", mirrorText: "En cada paso, indicá qué hizo cada misión. Al acertar, se completa la tabla.", step: "Paso {n} · {name}", tMoon: "Luna · Apollo 11 (1969)", tMars: "Marte · Opportunity (2004–2018)", mirrorDone: "¡Método completo! Tu certificado te espera en la bitácora.", open: "CONTINUAR EL ACTO III", close: "CERRAR ✕" },
    en: { eagleTitle: "Eagle and Eagle", eagleText: "Two “Eagles”, two missions. Say which one each fact belongs to.", moon: "MODULE · MOON 1969", mars: "CRATER · MARS 2004", wrong: "Check again: Moon or Mars?", eagleDone: "★ Connection recorded",
      mirrorTitle: "The scientific method in a mirror", mirrorText: "At each step, say what each mission did. Each right answer fills the table.", step: "Step {n} · {name}", tMoon: "Moon · Apollo 11 (1969)", tMars: "Mars · Opportunity (2004–2018)", mirrorDone: "Method complete! Your certificate awaits in the logbook.", open: "CONTINUE ACT III", close: "CLOSE ✕" }
  };
  const lang = () => (window.StarI18n?.lang === "en" ? "en" : "es");
  const t = (k, v) => { let s = T[lang()][k] ?? k; for (const [a, b] of Object.entries(v || {})) s = s.replace("{" + a + "}", b); return s; };
  const pick = v => (v && typeof v === "object" ? (v[lang()] ?? v.es) : v);
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
  function sideButtons(row, correct, onRight, feedback) {
    for (const side of ["moon", "mars"]) {
      const b = el("button", "mg-btn", t(side)); b.type = "button"; b.dataset.side = side;
      b.addEventListener("click", () => { if (row.classList.contains("good")) return; if (side !== correct) { row.classList.add("bad"); feedback.textContent = t("wrong"); return; } row.classList.remove("bad"); row.classList.add("good"); feedback.textContent = ""; onRight(); });
      row.append(b);
    }
  }

  function openEagle() {
    if (stage() !== "eagle_connection") return false;
    const ui = shell(t("eagleTitle"), t("eagleText"));
    const list = el("div", "mg-options"); const feedback = el("p", "mg-feedback"); feedback.setAttribute("aria-live", "polite");
    const q = el("p", "mg-title"); q.hidden = true; const opts = el("div", "mg-options"); opts.hidden = true;
    let ok = 0;
    for (const f of Core.EAGLE_FACTS) { const row = el("div", "mg-option"); row.dataset.fact = f.id; row.append(el("p", "", f[lang()])); sideButtons(row, f.side, () => { if (++ok === Core.EAGLE_FACTS.length) question(); }, feedback); list.append(row); }
    function question() {
      const Q = Core.EAGLE_QUESTION[lang()]; q.textContent = Q.q; q.hidden = opts.hidden = false;
      Q.options.forEach((o, i) => { const b = el("button", "mg-option", o); b.type = "button"; b.dataset.option = String(i);
        b.addEventListener("click", () => { feedback.textContent = Q.explain[i]; if (i !== Q.answer) { b.classList.add("bad"); return; }
          b.classList.add("good"); const r = F().recordObjective("eagle_connection.link", { source: "eagle_connection_minigame" }); if (r.ok) feedback.textContent += " " + t("eagleDone"); window.StarSound?.effect?.("success"); });
        opts.append(b); });
    }
    ui.panel.append(list, q, opts, feedback); return ui;
  }

  function openMirror() {
    if (stage() !== "mirror_method") return false;
    const ui = shell(t("mirrorTitle"), t("mirrorText"));
    const table = el("div", "mirror-table"); const work = el("div"); const feedback = el("p", "mg-feedback"); feedback.setAttribute("aria-live", "polite");
    ui.panel.append(table, work, feedback);
    const recorded = n => !!F().getState().objectives["mirror_method.step" + n];
    function renderTable() {
      table.replaceChildren();
      const header=el("div","mirror-row mirror-header");header.append(el("strong","",lang()==="en"?"Step":"Paso"),el("strong","",t("tMoon")),el("strong","",t("tMars")));table.append(header);
      for (const s of Core.MIRROR) {
        const cell = el("div", "mirror-row mg-option" + (recorded(s.step) ? " good" : "")); cell.dataset.row = String(s.step);
        cell.append(el("strong", "", t("step", { n: s.step, name: pick(s.name) })));
        for(const side of ["moon","mars"]){const c=s.cards.find(x=>x.side===side);cell.append(el("p","",recorded(s.step)?c[lang()]:"—"));}
        table.append(cell);
      }
    }
    function next() {
      renderTable(); work.replaceChildren();
      const s = Core.MIRROR.find(x => !recorded(x.step));
      if (!s) { feedback.textContent = t("mirrorDone"); return; }
      work.append(el("p", "mg-kicker", t("step", { n: s.step, name: pick(s.name) })));
      let ok = 0;
      // Las afirmaciones aparecen en orden alterno para que haya que leerlas.
      const cards = s.step % 2 ? [...s.cards].reverse() : s.cards;
      for (const c of cards) {
        const row = el("div", "mg-option"); row.dataset.card = c.side; row.append(el("p", "", c[lang()]));
        sideButtons(row, c.side, () => { if (++ok === 2) { F().recordObjective("mirror_method.step" + s.step, { source: "mirror_method" }); window.StarSound?.effect?.("success"); next(); } }, feedback);
        work.append(row);
      }
    }
    next(); return ui;
  }

  // Botón en /huellas cuando StarFlow está en un paso del Acto III posterior a la asociación.
  let launcher = null;
  function refresh() {
    const finish = document.getElementById("finishAdventure");
    const st = stage();
    if (finish) finish.hidden = !(st === "chapter_reward" || st === null);
    const host = document.querySelector?.(".puzzle-window");
    if (!launcher && host) { launcher = el("button", "pixel-button mint"); launcher.type = "button"; launcher.id = "continueFootprints"; launcher.addEventListener("click", () => (stage() === "eagle_connection" ? openEagle() : openMirror())); host.append(launcher); }
    if (launcher) { launcher.textContent = t("open"); launcher.hidden = !(st === "eagle_connection" || st === "mirror_method"); }
  }
  document.addEventListener("starflow:change", refresh);
  document.addEventListener("starstep:language", refresh);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(refresh, 0)); else setTimeout(refresh, 0);
  window.StarFootprints = Object.freeze({ openEagle, openMirror, refresh });
})();
