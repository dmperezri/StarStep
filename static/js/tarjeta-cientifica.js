"use strict";
/*
 * StarStep · Tarjeta científica (capturas 05 y 10).
 * StarScienceCard.open({ title, kind, icon, photo, observed, interpreted, narrative, data,
 *   source, sourceUrl, confirm, onConfirm, onClose, steps }) → abre un diálogo modal.
 * Recorrido: INSPECCIONAR (revela observación, interpretación y datos) → CONFIRMAR.
 * Solo presentación: quien la abre decide qué registra en StarFlow (onConfirm).
 * Colores oficiales: Observado #3FD0E0 · Interpretado #B79CFF · Narrativa #FFD23F.
 */
(function () {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const T = {
    es: { inspect: "INSPECCIONAR", close: "CERRAR ✕", observed: "OBSERVADO", interpreted: "INTERPRETADO", narrative: "NARRATIVA",
      data: "DATOS", source: "Fuente", first: "Primero inspeccioná la evidencia.", done: "★ Guardado en la bitácora" },
    en: { inspect: "INSPECT", close: "CLOSE ✕", observed: "OBSERVED", interpreted: "INTERPRETED", narrative: "NARRATIVE",
      data: "DATA", source: "Source", first: "Inspect the evidence first.", done: "★ Saved to logbook" }
  };
  const lang = () => (window.StarI18n?.lang === "en" ? "en" : "es");
  const pick = v => (v && typeof v === "object" && !Array.isArray(v) ? (v[lang()] ?? v.es) : v);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  let current = null;

  function open(card) {
    close(false);
    const root = el("section", "sci-card"); root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true");
    const panel = el("div", "sci-panel");
    const head = el("div", "sci-head");
    const icon = el("canvas", "sci-icon"); icon.width = 48; icon.height = 48; icon.setAttribute("aria-hidden", "true");
    try { const c = icon.getContext?.("2d"); if (c && typeof card.icon === "function") { c.imageSmoothingEnabled = false; card.icon(c); } } catch { /* sin icono */ }
    const titles = el("div"); const kind = el("p", "sci-kind"); const title = el("h2", "sci-title"); titles.append(kind, title);
    const closeBtn = el("button", "sci-close"); closeBtn.type = "button"; closeBtn.addEventListener("click", () => close(true));
    icon.hidden = typeof card.icon !== "function";
    head.append(icon, titles, closeBtn);
    const figure = el("figure", "sci-photo"); figure.hidden = !card.photo;
    const img = el("img"); const cap = el("figcaption");
    if (card.photo) { img.src = card.photo.src; img.loading = "lazy"; figure.append(img, cap); }
    const body = el("div", "sci-body"); body.hidden = true;
    const block = cls => { const d = el("div", "sci-block " + cls); const tag = el("span", "sci-tag"); const p = el("p"); d.append(tag, p); body.append(d); return { d, tag, p }; };
    const obs = block("observed"), inter = block("interpreted"), narr = block("narrative"), data = block("data");
    const src = el("p", "sci-source"); const link = el("a"); link.target = "_blank"; link.rel = "noopener noreferrer"; src.append(link); body.append(src);
    const status = el("p", "sci-status"); status.setAttribute("aria-live", "polite");
    const actions = el("div", "sci-actions");
    const inspect = el("button", "sci-inspect"); inspect.type = "button";
    const confirm = el("button", "sci-confirm"); confirm.type = "button";
    actions.append(inspect, confirm);
    panel.append(head, figure, body, status, actions); root.append(panel);
    document.body.append(root);
    let inspected = !!card.preInspected, finished = !!card.finished, statusKey = null, statusText = "";
    function render() {
      const t = T[lang()];
      kind.textContent = pick(card.kind) || ""; title.textContent = pick(card.title) || "";
      closeBtn.textContent = t.close;
      if (card.photo) { img.alt = pick(card.photo.alt) || ""; cap.textContent = pick(card.photo.caption) || ""; }
      obs.tag.textContent = t.observed; obs.p.textContent = pick(card.observed) || "";
      inter.tag.textContent = t.interpreted; inter.p.textContent = pick(card.interpreted) || "";
      narr.tag.textContent = t.narrative; narr.p.textContent = pick(card.narrative) || "";
      data.tag.textContent = t.data; data.p.textContent = pick(card.data) || ""; data.d.hidden = !card.data;
      link.textContent = `${t.source}: ${pick(card.source) || ""}`; link.href = card.sourceUrl || "#"; src.hidden = !card.source;
      body.hidden = !inspected;
      inspect.textContent = t.inspect; inspect.hidden = inspected;
      confirm.textContent = finished ? t.done : (pick(card.confirm) || "OK"); confirm.disabled = finished;
      status.textContent = statusKey ? t[statusKey] : statusText;
    }
    inspect.addEventListener("click", () => { inspected = true; statusKey = null; window.StarSound?.effect?.("scan"); render(); try { confirm.focus?.(); } catch { /* sin foco */ } card.onInspect?.(); });
    confirm.addEventListener("click", () => {
      if (finished) return;
      if (!inspected) { statusKey = "first"; render(); return; }
      const result = card.onConfirm ? card.onConfirm() : { ok: true };
      if (result && result.ok === false) { statusKey = null; statusText = result.message || ""; render(); return; }
      finished = true; statusText = ""; window.StarSound?.effect?.("success"); render();
    });
    root.addEventListener("keydown", e => { if (e.key === "Escape") close(true); });
    const onLang = () => render();
    document.addEventListener("starstep:language", onLang);
    current = { root, onLang, card };
    render();
    try { (inspected ? confirm : inspect).focus?.({ preventScroll: true }); } catch { /* sin foco */ }
    return current;
  }
  function close(notify) {
    if (!current) return;
    const { root, onLang, card } = current; current = null;
    root.hidden = true; root.remove?.();
    document.removeEventListener?.("starstep:language", onLang);
    if (notify) card.onClose?.();
  }
  window.StarScienceCard = Object.freeze({ open, close, get isOpen() { return !!current; } });
})();
