"use strict";
/*
 * StarStep · Archivo NASA — galería documental y regreso contextual (Fase 1.1).
 *
 * Procedencia: el enlace que abre el archivo indica de dónde viene con ?desde=<origen>.
 * El origen se valida contra RETURN_ROUTES (lista cerrada de rutas internas); cualquier
 * otro valor, o su ausencia (acceso directo por URL), usa el menú principal.
 * La procedencia vive en la URL, así que se conserva al recargar y al cambiar de idioma.
 * El botón navega con un href explícito: no depende de history.back().
 *
 * Consultar el archivo es solo lectura: esta página no carga progreso.js ni flujo.js,
 * no registra artefactos, no completa objetivos y no desbloquea misiones.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.StarArchive = api;
})(typeof window !== "undefined" ? window : null, function () {
  const RETURN_ROUTES = Object.freeze({
    menu: Object.freeze({ href: "/", i18n: "science.back.menu" }),
    bitacora: Object.freeze({ href: "/bitacora", i18n: "science.back.journal" }),
    marte: Object.freeze({ href: "/marte", i18n: "science.back.mars" })
  });
  const DEFAULT_ORIGIN = "menu";
  const own = key => typeof key === "string" && Object.prototype.hasOwnProperty.call(RETURN_ROUTES, key);

  // Devuelve un origen permitido. Nunca usa el valor recibido como destino.
  function readOrigin(search) {
    let value = null;
    try { value = new URLSearchParams(typeof search === "string" ? search : "").get("desde"); }
    catch { value = null; }
    return own(value) ? value : DEFAULT_ORIGIN;
  }

  function resolveReturn(search) {
    const origin = readOrigin(search);
    return { origin, href: RETURN_ROUTES[origin].href, i18n: RETURN_ROUTES[origin].i18n };
  }

  return Object.freeze({ RETURN_ROUTES, DEFAULT_ORIGIN, readOrigin, resolveReturn });
});

/* ── Navegador ───────────────────────────────────────────────── */
(function () {
  if (typeof window === "undefined" || typeof document === "undefined" || !window.StarArchive) return;

  // Marca de sesión compartida con flujo.js (SESSION_KEY): solo presentación.
  // Si la pestaña se abrió directamente en el archivo, volver al menú cuenta como
  // navegación interna y no repite la bienvenida ya completada.
  try { sessionStorage.setItem("starstep_sesion", "1"); } catch { /* sin sessionStorage */ }

  // Los scripts diferidos corren antes de DOMContentLoaded: se configura el botón
  // antes de que StarI18n.apply() traduzca la página con la clave correcta.
  const target = window.StarArchive.resolveReturn(location.search);
  const back = document.getElementById("archiveBack");
  if (back) {
    back.href = target.href;
    back.dataset.i18n = target.i18n;
    back.dataset.origin = target.origin;
    if (window.StarI18n) back.textContent = window.StarI18n.t(target.i18n);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("scienceGallery");
    if (!root || !window.StarScience || !window.StarI18n) return;
    const sections = [["apollo", "science.apollo"], ["mars", "science.mars"], ["spirit", "science.spirit"]];
    function draw() {
      root.replaceChildren();
      const language = StarI18n.lang;
      for (const [group, key] of sections) {
        const section = document.createElement("section"); section.className = "science-section";
        const heading = document.createElement("h2"); heading.textContent = StarI18n.t(key); section.append(heading);
        const grid = document.createElement("div"); grid.className = "science-grid";
        for (const photo of StarScience.photos.filter(p => p.group === group)) {
          const card = document.createElement("article"); card.className = "science-card";
          const image = document.createElement("img"); image.src = photo.file; image.alt = photo[language]; image.loading = "lazy";
          const title = document.createElement("h3"); title.textContent = photo.title;
          const text = document.createElement("p"); text.textContent = photo[language];
          const credit = document.createElement("small"); credit.textContent = photo.credit;
          card.append(image, title, text, credit);
          if (photo.url) {
            const a = document.createElement("a"); a.href = photo.url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = "NASA / JPL";
            card.append(a);
          }
          grid.append(card);
        }
        section.append(grid); root.append(section);
      }
    }
    draw();
    document.addEventListener("starstep:language", draw);
  });
})();
