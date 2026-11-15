"use strict";
/*
 * StarStep · Acto II · Enigmas 2 y 3 (yeso y arcillas) y desafío de habitabilidad. Captura 09.
 *   Yeso · Homestake (borde del cráter Endeavour), 2011 — Pancam + APXS (respuesta del prototipo).
 *   Arcillas · Esperance, 2013 — RAT + APXS. La arcilla se INTERPRETA por la química medida;
 *   ningún instrumento la «ve» directamente.
 *   Habitabilidad: agua antigua ≠ condiciones habitables ≠ vida. Encontrar condiciones
 *   favorables no es descubrir vida.
 * Cada enigma, solo tras el análisis correcto, registra en StarFlow su artefacto
 * (mars_rover_scan) y su objetivo de enigma. Usa la lista de instrumentos de enigma-hematita.js.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.StarMarsEnigmasCore = api;
})(typeof window !== "undefined" ? window : null, function () {
  const ENIGMAS = Object.freeze({
    gypsum: {
      stage: "mars_gypsum", artifact: "gypsum", component: "veins", objective: "mars_gypsum.enigma", source: "gypsum_enigma", solution: ["pancam", "apxs"],
      kicker: { es: "Enigma 2 de 3 · Homestake · 2011", en: "Enigma 2 of 3 · Homestake · 2011" },
      question: { es: "Una veta blanca y brillante cruza la roca. ¿Qué dos instrumentos usarías para saber qué es?", en: "A bright white vein crosses the rock. Which two instruments would you use to find out what it is?" },
      hints: { es: { minites: "Mini-TES mira desde lejos; la veta es muy fina.", mi: "La lupa muestra la textura, pero no la química.", rat: "No hace falta raspar: la veta ya está a la vista.", mossbauer: "El Mössbauer estudia minerales con hierro; esta veta casi no tiene hierro." },
        en: { minites: "Mini-TES looks from afar; the vein is very thin.", mi: "The magnifier shows texture, not chemistry.", rat: "No need to grind: the vein is already exposed.", mossbauer: "The Mössbauer studies iron minerals; this vein has almost no iron." } },
      card: {
        title: { es: "Vetas de yeso · Homestake", en: "Gypsum veins · Homestake" },
        observed: { es: "Pancam vio una veta brillante. APXS midió mucho calcio y azufre.", en: "Pancam saw a bright vein. APXS measured lots of calcium and sulfur." },
        interpreted: { es: "Es sulfato de calcio (probablemente yeso) que el agua depositó al circular por grietas de la roca.", en: "It is calcium sulfate (probably gypsum) deposited by water flowing through cracks in the rock." },
        narrative: { es: "«Una línea blanca escrita por el agua.»", en: "“A white line written by water.”" }
      }
    },
    clay: {
      stage: "mars_clay", artifact: "clay", component: "layers", objective: "mars_clay.enigma", source: "clay_enigma", solution: ["rat", "apxs"],
      kicker: { es: "Enigma 3 de 3 · Esperance · 2013", en: "Enigma 3 of 3 · Esperance · 2013" },
      question: { es: "Una roca clara parece alterada por dentro. ¿Qué dos instrumentos usarías para estudiarla?", en: "A pale rock looks altered inside. Which two instruments would you use to study it?" },
      hints: { es: { pancam: "Pancam ve el color, pero no la química del interior.", minites: "Mini-TES no ve debajo del polvo de la superficie.", mi: "La lupa ve detalles, pero no mide elementos.", mossbauer: "Esta roca tiene poco hierro: el Mössbauer no alcanza." },
        en: { pancam: "Pancam sees color, not the chemistry inside.", minites: "Mini-TES cannot see under the surface dust.", mi: "The magnifier sees details but does not measure elements.", mossbauer: "This rock has little iron: the Mössbauer is not enough." } },
      card: {
        title: { es: "Arcillas · Esperance", en: "Clays · Esperance" },
        observed: { es: "La RAT raspó la superficie y APXS midió mucho aluminio y sílice, y poco calcio y hierro.", en: "The RAT ground the surface and APXS measured lots of aluminum and silica, and little calcium and iron." },
        interpreted: { es: "Esa química indica minerales de arcilla, formados con agua de acidez más neutra. Es una interpretación de las mediciones: no se «vio» la arcilla.", en: "That chemistry points to clay minerals, formed with more neutral water. It is an interpretation of the measurements: the clay was not “seen”." },
        narrative: { es: "«Agua más amable en el pasado de Marte.»", en: "“Kinder water in Mars's past.”" }
      }
    }
  });
  function evaluate(id, selection) {
    const e = ENIGMAS[id]; const chosen = [...new Set(selection || [])];
    if (!e) return { result: "unknown" };
    if (chosen.length !== 2) return { result: "incomplete", hints: [] };
    if (e.solution.every(x => chosen.includes(x))) return { result: "correct", hints: [] };
    return { result: "wrong", hints: chosen.filter(x => !e.solution.includes(x)) };
  }
  // Habitabilidad: clasificar evidencias y responder.
  const CLASSES = Object.freeze(["water", "habitable", "life"]);
  const ITEMS = Object.freeze([
    { id: "h1", kind: "water", es: "Las esférulas de hematita se formaron con agua.", en: "The hematite spherules formed with water." },
    { id: "h2", kind: "water", es: "El yeso de Homestake lo depositó agua en grietas.", en: "Homestake's gypsum was deposited by water in cracks." },
    { id: "h3", kind: "habitable", es: "El agua más neutra de Esperance pudo ser favorable para microbios.", en: "Esperance's more neutral water could have been favorable for microbes." },
    { id: "h4", kind: "life", es: "Opportunity encontró fósiles de microbios.", en: "Opportunity found microbe fossils.", false: true }
  ]);
  const HAB_QUESTION = Object.freeze({
    es: { q: "Con todas estas pruebas, ¿qué podemos afirmar?", options: ["Marte tuvo vida", "Marte tuvo agua y algunos lugares pudieron ser habitables, pero no se encontró vida", "Marte nunca tuvo agua"], answer: 1,
      explain: ["No: no hay evidencia directa de vida.", "¡Exacto! Condiciones favorables no son lo mismo que vida. La pregunta sigue abierta.", "No: hematita, yeso y arcillas son pruebas de agua antigua."] },
    en: { q: "With all this evidence, what can we say?", options: ["Mars had life", "Mars had water and some places could have been habitable, but no life was found", "Mars never had water"], answer: 1,
      explain: ["No: there is no direct evidence of life.", "Exactly! Favorable conditions are not the same as life. The question is still open.", "No: hematite, gypsum and clays are evidence of ancient water."] }
  });
  return Object.freeze({ ENIGMAS, evaluate, CLASSES, ITEMS, HAB_QUESTION });
});

/* ── Navegador ───────────────────────────────────────────────── */
(function () {
  if (typeof window === "undefined" || typeof document === "undefined" || !window.StarMarsEnigmasCore) return;
  const Core = window.StarMarsEnigmasCore;
  const INSTRUMENTS = () => window.StarHematiteCore?.INSTRUMENTS || [];
  const T = {
    es: { pick: "Elegí 2 instrumentos y pulsá Analizar.", analyze: "Analizar", close: "CERRAR ✕", wrong: "Ese análisis no alcanza.", retry: "Probá otra combinación.", incomplete: "Elegí exactamente 2 instrumentos.",
      correct: "¡Bien pensado!", save: "Guardar en la bitácora", saved: "★ Guardado en la bitácora", observed: "OBSERVADO", interpreted: "INTERPRETADO", narrative: "NARRATIVA", art: "Ilustración pixel art (la foto real se suma en una próxima versión).",
      habTitle: "¿Hubo vida en Marte?", habKicker: "Desafío final de interpretación", habText: "Clasificá cada afirmación:", water: "AGUA ANTIGUA", habitable: "CONDICIÓN HABITABLE", life: "NO HAY EVIDENCIA", lifeNote: "Ninguna misión encontró vida en Marte.", habDone: "★ Interpretación registrada" },
    en: { pick: "Choose 2 instruments and press Analyze.", analyze: "Analyze", close: "CLOSE ✕", wrong: "That analysis is not enough.", retry: "Try another combination.", incomplete: "Choose exactly 2 instruments.",
      correct: "Well thought!", save: "Save to logbook", saved: "★ Saved to logbook", observed: "OBSERVED", interpreted: "INTERPRETED", narrative: "NARRATIVE", art: "Pixel art illustration (the real photo will be added in a later version).",
      habTitle: "Was there life on Mars?", habKicker: "Final interpretation challenge", habText: "Classify each statement:", water: "ANCIENT WATER", habitable: "HABITABLE CONDITION", life: "NO EVIDENCE", lifeNote: "No mission has found life on Mars.", habDone: "★ Interpretation recorded" }
  };
  const lang = () => (window.StarI18n?.lang === "en" ? "en" : "es");
  const t = k => T[lang()][k] ?? k;
  const pick = v => (v && typeof v === "object" ? (v[lang()] ?? v.es) : v);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const F = () => window.StarFlow;

  function shell(titleText, kickerText) {
    const root = el("section", "mg"); root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true");
    const panel = el("div", "mg-panel"); const close = el("button", "mg-btn", t("close")); close.type = "button";
    const kicker = el("p", "mg-kicker", kickerText); const title = el("h2", "mg-title", titleText);
    panel.append(close, kicker, title); root.append(panel); document.body.append(root);
    const hide = () => { root.hidden = true; document.dispatchEvent(new CustomEvent("starstep:mars-refresh")); };
    close.addEventListener("click", hide); root.addEventListener("keydown", e => { if (e.key === "Escape") hide(); });
    return { root, panel, hide };
  }
  function drawArt(canvas, id) {
    const c = canvas.getContext?.("2d"); if (!c) return;
    c.fillStyle = "#D9593A"; c.fillRect(0, 0, 240, 150); c.fillStyle = "#A63A26"; c.fillRect(0, 100, 240, 50);
    if (id === "gypsum") { c.fillStyle = "#7A2818"; c.fillRect(30, 40, 180, 70); c.fillStyle = "#FFF8E7"; for (let i = 0; i < 18; i++) c.fillRect(40 + i * 9, 60 + Math.round(Math.sin(i) * 6), 10, 4); }
    else { c.fillStyle = "#F7B08E"; c.fillRect(40, 45, 160, 65); c.fillStyle = "#3FD0E0"; c.fillRect(105, 65, 30, 30); c.fillStyle = "#575C74"; c.fillRect(110, 70, 20, 20); }
  }

  function openEnigma(id) {
    const e = Core.ENIGMAS[id]; const f = F(); if (!e || !f) return false;
    if (f.getArtifact(id)?.state === "registered") return false;
    if (f.getCurrentStage() !== e.stage) { f.notify?.("locked"); return false; }
    const ui = shell(pick(e.card.title), pick(e.kicker));
    const art = el("canvas", "mg-canvas"); art.width = 240; art.height = 150; art.style && (art.style.maxWidth = "320px"); drawArt(art, id);
    const artNote = el("p", "moon-sim-note", t("art"));
    const q = el("p", "mg-text", pick(e.question)); const pickText = el("p", "mg-kicker", t("pick"));
    const grid = el("div", "mg-options"); const selected = new Set();
    for (const inst of INSTRUMENTS()) {
      const b = el("button", "mg-option"); b.type = "button"; b.dataset.instrument = inst.id;
      b.append(el("strong", "", inst.name), el("br"), el("span", "", inst[lang()]));
      b.addEventListener("click", () => { if (solved) return; if (selected.has(inst.id)) selected.delete(inst.id); else { if (selected.size >= 2) selected.delete([...selected][0]); selected.add(inst.id); }
        for (const x of grid.children) x.setAttribute?.("aria-pressed", String(selected.has(x.dataset.instrument))); feedback.textContent = ""; });
      grid.append(b);
    }
    const feedback = el("p", "mg-feedback"); feedback.setAttribute("aria-live", "polite");
    const actions = el("div", "mg-actions"); const analyze = el("button", "mg-btn primary", t("analyze")); analyze.type = "button"; actions.append(analyze);
    const result = el("div"); result.hidden = true;
    const block = (cls, tagKey, text) => { const d = el("div", "sci-block " + cls); d.append(el("span", "sci-tag", t(tagKey)), el("p", "", pick(text))); return d; };
    result.append(block("observed", "observed", e.card.observed), block("interpreted", "interpreted", e.card.interpreted), block("narrative", "narrative", e.card.narrative));
    const save = el("button", "mg-btn primary", t("save")); save.type = "button"; const saveRow = el("div", "mg-actions"); saveRow.append(save); result.append(saveRow);
    ui.panel.append(art, artNote, q, pickText, grid, feedback, actions, result);
    let solved = false;
    analyze.addEventListener("click", () => {
      const r = Core.evaluate(id, [...selected]);
      if (r.result === "incomplete") { feedback.textContent = t("incomplete"); return; }
      if (r.result === "wrong") { const h = e.hints[lang()]; feedback.textContent = [t("wrong"), ...r.hints.map(x => h[x]).filter(Boolean), t("retry")].join(" "); return; }
      solved = true; feedback.textContent = t("correct"); analyze.hidden = true; result.hidden = false; window.StarSound?.effect?.("scan");
    });
    save.addEventListener("click", () => {
      if (!solved || save.disabled) return;
      const loc = f.locateArtifact(id, { mechanic: "mars_rover_scan" }); if (!loc.ok) { feedback.textContent = loc.code; return; }
      f.recordObjective(e.objective, { source: e.source });
      f.beginInspection(id, { context: "mission", viewer: "fallback" });
      f.inspectComponent(id, e.component, { context: "mission", viewer: "fallback" });
      if (f.getArtifact(id).state === "registered") { save.textContent = t("saved"); save.disabled = true; window.StarSound?.effect?.("success"); }
    });
    return ui;
  }

  function openHabitability() {
    const f = F(); if (!f || f.getCurrentStage() !== "mars_habitability") { f?.notify?.("locked"); return false; }
    const ui = shell(t("habTitle"), t("habKicker"));
    const text = el("p", "mg-text", t("habText")); const list = el("div", "mg-options"); const feedback = el("p", "mg-feedback"); feedback.setAttribute("aria-live", "polite");
    const q = el("p", "mg-title"); q.hidden = true; const opts = el("div", "mg-options"); opts.hidden = true;
    const done = new Set();
    for (const item of Core.ITEMS) {
      const row = el("div", "mg-option"); row.dataset.item = item.id; row.append(el("p", "", item[lang()]));
      for (const k of Core.CLASSES) {
        const b = el("button", "mg-btn", t(k)); b.type = "button"; b.dataset.kind = k;
        b.addEventListener("click", () => {
          if (done.has(item.id)) return;
          if (k !== item.kind) { row.classList.add("bad"); feedback.textContent = item.false && k !== "life" ? t("lifeNote") : t("wrong"); return; }
          done.add(item.id); row.classList.remove("bad"); row.classList.add("good"); feedback.textContent = item.false ? t("lifeNote") : "";
          if (done.size === Core.ITEMS.length) buildQuestion();
        });
        row.append(b);
      }
      list.append(row);
    }
    function buildQuestion() {
      const Q = Core.HAB_QUESTION[lang()]; q.textContent = Q.q; q.hidden = opts.hidden = false; opts.replaceChildren();
      Q.options.forEach((o, i) => { const b = el("button", "mg-option", o); b.type = "button"; b.dataset.option = String(i);
        b.addEventListener("click", () => { feedback.textContent = Q.explain[i]; if (i !== Q.answer) { b.classList.add("bad"); return; }
          b.classList.add("good"); const r = f.recordObjective("mars_habitability.answer", { source: "habitability_question" });
          if (r.ok || r.code === "ALREADY_RECORDED") feedback.textContent = Q.explain[i] + " " + t("habDone"); window.StarSound?.effect?.("success"); });
        opts.append(b); });
    }
    ui.panel.append(text, list, q, opts, feedback);
    return ui;
  }
  window.StarMarsEnigmas = Object.freeze({ open: openEnigma, openHabitability });
})();
