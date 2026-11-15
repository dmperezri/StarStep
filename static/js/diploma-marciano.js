"use strict";
/* Diploma marciano independiente (Acto II). Sigue el diseño del diploma lunar
   (diploma-lunar.js, feature/integracion-visual). No concede logros: solo representa
   lo obtenido. Se habilita con el Acto II completo en StarFlow y un nombre de cadete. */
(function () {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const en = () => window.StarI18n?.lang === "en";
  const name = () => String(window.StarProgress?.player?.()?.alias || "").trim();
  const ready = () => Boolean(name() && window.StarFlow?.isActComplete?.("marte"));
  function download() {
    if (!ready()) return false;
    const award=window.StarProgress.getAward?.("marte");

    const player=award||window.StarProgress.player();
    const cv = document.createElement("canvas"); cv.width = 1600; cv.height = 1132;
    const c = cv.getContext("2d");
    const box = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
    const txt = (v, y, size, col = "#401829", font = "Arial") => { c.fillStyle = col; c.textAlign = "center"; c.font = `bold ${size}px ${font}`; c.fillText(v, 800, y, 1390); };
    box(0, 0, 1600, 1132, "#1a1340"); box(16, 16, 1568, 1100, "#F7B08E"); box(30, 30, 1540, 1072, "#D9593A"); box(45, 45, 1510, 1042, "#fff8e7");
    c.strokeStyle = "#A63A26"; c.lineWidth = 5; c.strokeRect(65, 65, 1470, 1002);
    for (const x of [110, 1490]) for (const y of [105, 1023]) { box(x - 18, y - 4, 36, 8, "#A63A26"); box(x - 4, y - 18, 8, 36, "#A63A26"); }
    txt("★ STARSTEP ★", 175, 74, "#A63A26", "monospace");
    txt(en() ? "MARS EXPLORER DIPLOMA" : "DIPLOMA DE EXPLORADOR MARCIANO", 285, 52);
    txt("OPPORTUNITY · ACTO II / ACT II", 348, 29, "#A63A26");
    txt(en() ? "Awarded to" : "Se otorga a", 430, 30, "#414379");
    const portrait = document.createElement("canvas"); portrait.width = portrait.height = 48;
    if (window.StarArt?.portrait) { window.StarArt.portrait(portrait, player.avatar || "astronauta"); c.imageSmoothingEnabled = false; c.drawImage(portrait, 722, 462, 156, 156); }
    txt(String(player.alias||"").slice(0,24),708,72);
    box(360, 741, 880, 4, "#401829");
    txt(en() ? "For reading the water clues left on Mars with Opportunity" : "Por leer las pistas del agua que Opportunity encontró en Marte", 822, 32);
    txt(en() ? "An educational recognition from StarStep" : "Reconocimiento educativo de StarStep", 879, 24, "#258f86");
    const date = new Intl.DateTimeFormat(en() ? "en-US" : "es-NI", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(award?.issuedAt || Date.now()));
    txt(`LITO · OUTSTRIP · ${date}`, 1007, 26, "#414379");
    const a = document.createElement("a"); a.download = "StarStep-Diploma-Marte-" + name().replace(/[^a-z0-9_-]/gi, "_") + ".png"; a.href = cv.toDataURL("image/png"); a.click();
    return true;
  }
  function render() {
    const host = document.getElementById("marsDiplomaStatus"); if (!host) return;
    host.replaceChildren();
    const title = document.createElement("strong");
    title.textContent = `${en() ? "Opportunity · Mars diploma" : "Opportunity · Diploma marciano"}: ${ready() ? (en() ? "Unlocked" : "Desbloqueado") : (en() ? "Not yet unlocked" : "Aún no desbloqueado")}`;
    const b = document.createElement("button"); b.type = "button"; b.className = "pixel-button mint";
    b.textContent = en() ? "DOWNLOAD MARS DIPLOMA PNG" : "DESCARGAR DIPLOMA MARCIANO PNG"; b.disabled = !ready(); b.id = "marsDiplomaButton";
    b.addEventListener("click", download);
    const note = document.createElement("p");
    note.textContent = en() ? "Requires completing Act II (Mars) and a registered cadet name." : "Requiere completar el Acto II (Marte) y tener un nombre de cadete registrado.";
    const row = document.createElement("p"); row.append(b);
    const head = document.createElement("p"); head.append(title);
    host.append(head, row, note);
  }
  document.addEventListener("DOMContentLoaded", render);
  document.addEventListener("starstep:language", render);
  document.addEventListener("starflow:change", render);
  window.StarMarsDiploma = Object.freeze({ download, ready, render });
})();
