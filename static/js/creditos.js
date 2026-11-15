"use strict";
/* StarStep · Créditos (captura 17). Solo datos verificables del equipo y de las fuentes.
   No inventa autorías ni licencias: lo que no consta se marca como pendiente de verificación. */
(function () {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const TEAM = "Ariel Talavera · Liliana Perez · Kevin Flores · Dannia Perez · Willam Perez · Samantha Perez";
  const C = {
    es: { title: "Créditos", team: "Equipo OUTSTRIP", challenge: "Reto oficial: «Abandoned but not Forgotten» · NASA Space Apps Challenge 2026 · Sede Managua",
      data: "Datos e imágenes", dataText: "El contenido científico proviene de la NASA: NSSDCA (Apollo 11, EASEP, retrorreflector), Lunar Sample Compendium, NASA Science y NASA/JPL Photojournal (Opportunity). Cada foto indica su crédito en su tarjeta. Las fotografías de huella, acoplamiento, hematita y últimas imágenes se extrajeron de las evidencias del equipo; las demás proceden de los recursos del prototipo, con sus créditos originales.",
      media: "Recursos audiovisuales", model: "Modelo 3D del módulo lunar Eagle: archivo GLB proporcionado al equipo; licencia y autoría por verificar antes de su distribución pública.",
      video: "Video «Capítulo I · Rock & Roll»: autoría y licencia pendientes de verificación. Subtítulos transcritos del video; traducción al español del equipo. Video «Blueberry Hunt» de Marte: archivo aportado al proyecto, autoría y licencia pendientes; subtítulos resumidos ES/EN.",
      tools: "Herramientas", toolsText: "HTML, CSS y JavaScript con pixel art dibujado en código; Flask; Three.js (MIT) para el visor 3D.",
      ai: "Uso de inteligencia artificial", aiText: "Partes del código se programaron con ayuda de Claude (Anthropic) y otros asistentes. El guion, los datos y las decisiones de diseño son del equipo.",
      notice: "Sitio educativo independiente: StarStep no es un sitio ni un juego oficial de la NASA.", close: "CERRAR ✕", button: "CRÉDITOS" },
    en: { title: "Credits", team: "Team OUTSTRIP", challenge: "Official challenge: “Abandoned but not Forgotten” · NASA Space Apps Challenge 2026 · Managua",
      data: "Data and images", dataText: "Scientific content comes from NASA: NSSDCA (Apollo 11, EASEP, retroreflector), Lunar Sample Compendium, NASA Science and NASA/JPL Photojournal (Opportunity). Each photo shows its credit on its card. The footprint, docking, hematite and final images were extracted from the team’s evidence; other photos come from the prototype resources, retaining their original credits.",
      media: "Audiovisual resources", model: "Eagle lunar module 3D model: GLB file provided to the team; license and authorship to be verified before public distribution.",
      video: "“Chapter I · Rock & Roll” video: authorship and license pending verification. Subtitles transcribed from the video; Spanish translation by the team. Mars “Blueberry Hunt” video: supplied to the project, authorship and license pending; summarized ES/EN captions.",
      tools: "Tools", toolsText: "HTML, CSS and JavaScript with pixel art drawn in code; Flask; Three.js (MIT) for the 3D viewer.",
      ai: "Use of artificial intelligence", aiText: "Parts of the code were written with help from Claude (Anthropic) and other assistants. The script, the data and the design decisions are the team's.",
      notice: "Independent educational site: StarStep is not an official NASA site or game.", close: "CLOSE ✕", button: "CREDITS" }
  };
  const lang = () => (window.StarI18n?.lang === "en" ? "en" : "es");
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  let root = null;
  function open() {
    if (root) root.remove?.();
    const t = C[lang()];
    root = el("section", "mg"); root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.id = "creditsDialog";
    const panel = el("div", "mg-panel"); const close = el("button", "mg-btn", t.close); close.type = "button";
    panel.append(close, el("h2", "mg-title", t.title),
      el("h3", "mg-kicker", t.team), el("p", "mg-text", TEAM), el("p", "mg-text", t.challenge),
      el("h3", "mg-kicker", t.data), el("p", "mg-text", t.dataText),
      el("h3", "mg-kicker", t.media), el("p", "mg-text", t.model), el("p", "mg-text", t.video),
      el("h3", "mg-kicker", t.tools), el("p", "mg-text", t.toolsText),
      el("h3", "mg-kicker", t.ai), el("p", "mg-text", t.aiText),
      el("p", "mg-feedback", t.notice));
    root.append(panel); document.body.append(root);
    const hide = () => { root.hidden = true; document.getElementById("creditsButton")?.focus?.(); };
    close.addEventListener("click", hide); root.addEventListener("keydown", e => { if (e.key === "Escape") hide(); });
    try { close.focus?.(); } catch { /* sin foco */ }
    return root;
  }
  function label() { const b = document.getElementById("creditsButton"); if (b) b.textContent = C[lang()].button; }
  document.addEventListener("DOMContentLoaded", () => { document.getElementById("creditsButton")?.addEventListener("click", open); label(); });
  document.addEventListener("starstep:language", label);
  window.StarCredits = Object.freeze({ open, TEAM });
})();
