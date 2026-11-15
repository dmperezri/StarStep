"use strict";
/*
 * StarStep · Acto II · Enigma de la hematita (cráter Eagle, 2004). Capturas 09 y 10.
 *
 * Observar la foto → elegir 2 instrumentos → Analizar → resultado (Observado /
 * Interpretado / Narrativa) → Guardar en la bitácora.
 * Reemplaza el botón provisional «HEMATITA 3D»: el descubrimiento solo se registra si el
 * análisis es correcto, y siempre a través de StarFlow (localizar → inspeccionar →
 * registrar). Respuesta educativa del prototipo: Microscopic Imager + Mössbauer.
 * El objetivo mars_hematite.enigma sigue «previsto» en StarFlow (no se registra aparte).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.StarHematiteCore = api;
})(typeof window !== "undefined" ? window : null, function () {
  const INSTRUMENTS = Object.freeze([
    { id: "pancam", name: "Pancam", es: "Cámaras panorámicas a color, como ojos.", en: "Panoramic color cameras, like eyes.",
      hint: { es: "Pancam ve el paisaje, pero no distingue de qué mineral está hecha una esferita.", en: "Pancam sees the landscape, but cannot tell which mineral a spherule is made of." } },
    { id: "minites", name: "Mini-TES", es: "Ve el calor de las rocas desde lejos.", en: "Sees the heat of rocks from afar.",
      hint: { es: "Mini-TES detectó hematita en el suelo desde lejos, pero no puede estudiar una sola esferita.", en: "Mini-TES detected hematite in the soil from afar, but cannot study a single spherule." } },
    { id: "mi", name: "Microscopic Imager", es: "Una lupa: fotos de detalles diminutos.", en: "A magnifier: photos of tiny details.",
      hint: { es: "", en: "" } },
    { id: "rat", name: "RAT", es: "Raspa la superficie de la roca.", en: "Grinds the rock surface.",
      hint: { es: "La RAT raspa rocas; las esferitas sueltas no necesitan limpiarse primero.", en: "The RAT grinds rocks; loose spherules do not need to be cleaned first." } },
    { id: "apxs", name: "APXS", es: "Mide los elementos químicos.", en: "Measures chemical elements.",
      hint: { es: "APXS encuentra hierro, pero no dice en qué mineral está: eso lo hace el Mössbauer.", en: "APXS finds iron, but not which mineral it is in: that is the Mössbauer's job." } },
    { id: "mossbauer", name: "Mössbauer", es: "Identifica minerales con hierro.", en: "Identifies iron-bearing minerals.",
      hint: { es: "", en: "" } }
  ]);
  const SOLUTION = Object.freeze(["mi", "mossbauer"]);
  const PICK = 2;
  // Resultado del análisis: "incomplete" (faltan instrumentos), "correct" o "wrong" con pistas.
  function evaluate(selection) {
    const chosen = [...new Set(selection || [])].filter(id => INSTRUMENTS.some(i => i.id === id));
    if (chosen.length !== PICK) return { result: "incomplete", hints: [] };
    if (SOLUTION.every(id => chosen.includes(id))) return { result: "correct", hints: [] };
    return { result: "wrong", hints: chosen.filter(id => !SOLUTION.includes(id)), missing: SOLUTION.filter(id => !chosen.includes(id)) };
  }
  const CARD = Object.freeze({
    es: {
      observed: "Esferitas grises de pocos milímetros en el suelo y en las rocas del cráter Eagle.",
      interpreted: "El Mössbauer confirmó hematita, un óxido de hierro que en la Tierra suele formarse con agua. Las esférulas crecieron dentro de rocas empapadas por agua subterránea antigua: es evidencia de agua, no de vida.",
      narrative: "«Pequeñas esferas, grandes preguntas sobre Marte.»"
    },
    en: {
      observed: "Gray spherules a few millimeters across in the soil and rocks of Eagle Crater.",
      interpreted: "The Mössbauer confirmed hematite, an iron oxide that on Earth usually forms with water. The spherules grew inside rocks soaked by ancient groundwater: evidence of water, not of life.",
      narrative: "“Tiny spheres, big questions about Mars.”"
    }
  });
  return Object.freeze({ INSTRUMENTS, SOLUTION, PICK, evaluate, CARD });
});

/* ── Navegador ───────────────────────────────────────────────── */
(function () {
  if (typeof window === "undefined" || typeof document === "undefined" || !window.StarHematiteCore) return;
  const Core = window.StarHematiteCore;
  const TEXT = {
    es: { kicker: "Enigma 1 de 3 · Cráter Eagle · 2004", question: "Hay esferitas grises por todas partes, como arándanos. ¿Qué dos instrumentos usarías para saber qué son?",
      pick: "Elegí 2 instrumentos y pulsá Analizar.", analyze: "Analizar", close: "CERRAR ✕", photo: "Esférulas de hematita cerca del cráter Fram, abril de 2004. El área mide 3 cm de ancho.",
      credit: "Foto real · NASA/JPL-Caltech/Cornell/USGS", observedTag: "OBSERVADO", interpretedTag: "INTERPRETADO", narrativeTag: "NARRATIVA",
      title: "Hematita en esférulas («blueberries»)", save: "Guardar en la bitácora", saved: "★ Guardado en la bitácora", retry: "Probá otra combinación.",
      wrong: "Ese análisis no alcanza.", incomplete: "Elegí exactamente 2 instrumentos.", correct: "¡Bien pensado! La lupa mostró su forma y el Mössbauer, su mineral.",
      locked: "Primero registrá a Opportunity.", already: "Las esférulas ya están en tu bitácora.", saveFailed: "No se pudo registrar: {code}" },
    en: { kicker: "Enigma 1 of 3 · Eagle Crater · 2004", question: "There are gray spherules everywhere, like blueberries. Which two instruments would you use to find out what they are?",
      pick: "Choose 2 instruments and press Analyze.", analyze: "Analyze", close: "CLOSE ✕", photo: "Hematite spherules near Fram Crater, April 2004. The area is 3 cm across.",
      credit: "Real photo · NASA/JPL-Caltech/Cornell/USGS", observedTag: "OBSERVED", interpretedTag: "INTERPRETED", narrativeTag: "NARRATIVE",
      title: "Hematite spherules (“blueberries”)", save: "Save to logbook", saved: "★ Saved to logbook", retry: "Try another combination.",
      wrong: "That analysis is not enough.", incomplete: "Choose exactly 2 instruments.", correct: "Well thought! The magnifier showed their shape and the Mössbauer, their mineral.",
      locked: "Register Opportunity first.", already: "The spherules are already in your logbook.", saveFailed: "Could not register: {code}" }
  };
  const lang = () => (window.StarI18n?.lang === "en" ? "en" : "es");
  const t = (k, v) => { let s = TEXT[lang()][k] ?? k; for (const [a, b] of Object.entries(v || {})) s = s.replace("{" + a + "}", b); return s; };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const flow = () => window.StarFlow;
  const ID = "blueberries";

  let ui = null;
  function build() {
    const root = el("section", "enigma"); root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.hidden = true;
    const panel = el("div", "enigma-panel");
    const close = el("button", "enigma-close"); close.type = "button"; close.addEventListener("click", hide);
    const head = el("div", "enigma-head");
    const figure = el("figure", "enigma-photo");
    const img = el("img"); img.src = "/static/assets/evidencias/hematita.webp"; img.loading = "lazy";
    const cap = el("figcaption"); const capText = el("span"); const credit = el("small", "enigma-credit");
    cap.append(capText, credit); figure.append(img, cap);
    const intro = el("div", "enigma-intro"); const kicker = el("p", "enigma-kicker"); const question = el("h2", "enigma-question"); const pick = el("p", "enigma-pick");
    intro.append(kicker, question, pick); head.append(figure, intro);
    const grid = el("div", "enigma-grid");
    const cards = Core.INSTRUMENTS.map(inst => {
      const b = el("button", "enigma-instrument"); b.type = "button"; b.dataset.instrument = inst.id;
      const name = el("strong", "", inst.name); const desc = el("span"); b.append(name, desc);
      b.addEventListener("click", () => toggle(inst.id)); grid.append(b); return { inst, b, desc };
    });
    const feedback = el("p", "enigma-feedback"); feedback.setAttribute("aria-live", "polite");
    const analyze = el("button", "enigma-analyze"); analyze.type = "button"; analyze.addEventListener("click", runAnalysis);
    const result = el("div", "enigma-result"); result.hidden = true;
    const rTitle = el("h2", "enigma-result-title");
    const block = cls => { const d = el("div", "enigma-block " + cls); const tag = el("span", "enigma-tag"); const p = el("p"); d.append(tag, p); return { d, tag, p }; };
    const obs = block("observed"), inter = block("interpreted"), narr = block("narrative");
    const save = el("button", "enigma-save"); save.type = "button"; save.addEventListener("click", saveDiscovery);
    result.append(rTitle);
    const proof = window.StarEvidenceVisual?.figure("hematite");
    if (proof) { proof.classList.add("enigma-result-photo"); result.append(proof); }
    result.append(obs.d, inter.d, narr.d, save);
    panel.append(close, head, grid, feedback, analyze, result);
    root.append(panel);
    root.addEventListener("keydown", e => { if (e.key === "Escape") hide(); });
    document.body.append(root);
    ui = { root, close, head, grid, proof, capText, credit, kicker, question, pick, cards, feedback, analyze, result, rTitle, obs, inter, narr, save, selected: new Set(), feedbackKey: null, solved: false };
    document.addEventListener("starstep:language", render);
  }
  function render() {
    if (!ui) return;
    ui.close.textContent = t("close");
    ui.capText.textContent = t("photo"); ui.credit.textContent = t("credit");
    ui.kicker.textContent = t("kicker"); ui.question.textContent = t("question"); ui.pick.textContent = t("pick");
    for (const c of ui.cards) { c.desc.textContent = c.inst[lang()]; c.b.setAttribute("aria-pressed", String(ui.selected.has(c.inst.id))); c.b.disabled = ui.solved; }
    ui.analyze.textContent = t("analyze"); ui.analyze.hidden = ui.solved;
    if (ui.proof) { ui.head.hidden = ui.solved; ui.grid.hidden = ui.solved; }
    ui.feedback.textContent = ui.feedbackText ? ui.feedbackText() : "";
    const card = Core.CARD[lang()];
    ui.rTitle.textContent = t("title");
    ui.obs.tag.textContent = t("observedTag"); ui.obs.p.textContent = card.observed;
    ui.inter.tag.textContent = t("interpretedTag"); ui.inter.p.textContent = card.interpreted;
    ui.narr.tag.textContent = t("narrativeTag"); ui.narr.p.textContent = card.narrative;
    const registered = flow()?.getArtifact?.(ID)?.state === "registered";
    ui.save.textContent = registered ? t("saved") : t("save"); ui.save.disabled = registered;
  }
  function toggle(id) {
    if (ui.solved) return;
    if (ui.selected.has(id)) ui.selected.delete(id);
    else { if (ui.selected.size >= Core.PICK) ui.selected.delete([...ui.selected][0]); ui.selected.add(id); }
    ui.feedbackText = null; window.StarSound?.effect?.("button"); render();
  }
  function runAnalysis() {
    const r = Core.evaluate([...ui.selected]);
    if (r.result === "incomplete") { ui.feedbackText = () => t("incomplete"); render(); return; }
    if (r.result === "wrong") {
      window.StarSound?.effect?.("button");
      ui.feedbackText = () => [t("wrong"), ...r.hints.map(id => Core.INSTRUMENTS.find(i => i.id === id).hint[lang()]), t("retry")].filter(Boolean).join(" ");
      render(); return;
    }
    ui.solved = true; ui.result.hidden = false; ui.feedbackText = () => t("correct");
    window.StarSound?.effect?.("scan"); render();
    try { ui.save.focus?.({ preventScroll: true }); } catch { /* sin foco */ }
  }
  // Solo después de un análisis correcto: StarFlow localiza, inspecciona y registra.
  function saveDiscovery() {
    if (!ui.solved) return;
    const F = flow(); if (!F) return;
    const located = F.locateArtifact(ID, { mechanic: "mars_rover_scan" });
    if (!located.ok) { ui.feedbackText = () => t("saveFailed", { code: located.code }); render(); return; }
    const begin = F.beginInspection(ID, { context: "mission", viewer: "fallback" });
    if (!begin.ok) { ui.feedbackText = () => t("saveFailed", { code: begin.code }); render(); return; }
    const res = F.inspectComponent(ID, "hematite", { context: "mission", viewer: "fallback" });
    if (!res.ok || F.getArtifact(ID).state !== "registered") { ui.feedbackText = () => t("saveFailed", { code: res.code || F.getArtifact(ID).state }); render(); return; }
    window.StarSound?.effect?.("success");
    render();
  }
  function open() {
    const F = flow();
    if (!F) return false;
    if (F.getArtifact?.(ID)?.state === "registered") { window.openStarArtifact?.(ID, { context: "mission" }); return true; }
    // StarFlow decide si ya se puede: las esférulas van después de registrar Opportunity.
    if (!F.canEnter?.("mars_hematite")) { F.notify?.("locked"); return false; }
    if (!ui) build();
    ui.root.hidden = false; render();
    try { ui.cards[0].b.focus?.({ preventScroll: true }); } catch { /* sin foco */ }
    return true;
  }
  function hide() { if (ui) ui.root.hidden = true; try { document.getElementById("openMarsRoute")?.focus?.(); } catch { /* sin foco */ } }

  window.StarHematiteEnigma = Object.freeze({ open, hide, get state() { return ui ? { open: !ui.root.hidden, solved: ui.solved, selected: [...ui.selected] } : null; } });
})();
