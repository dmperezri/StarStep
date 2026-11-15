// Pruebas de la navegación contextual del Archivo NASA (Fase 1.1).
// Ejecutar desde la raíz del repositorio:
//   node --test tests/js/
// Carga los scripts reales de static/js en un navegador simulado (navegador-simulado.mjs).
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import vm from "node:vm";
import { source, template, makeStore, snapshot, FakeElement, makePage, newTab, openHome } from "./navegador-simulado.mjs";

const require = createRequire(import.meta.url);
const archive = require("../../static/js/archivo-nasa.js");


// Abre /archivo-nasa con los mismos scripts y en el mismo orden que la plantilla.
function openArchive(tab, search = "") {
  const back = new FakeElement("a", { id: "archiveBack", href: "/", dataset: { i18n: "science.back.menu" }, text: "VOLVER AL MENÚ" });
  const gallery = new FakeElement("div", { id: "scienceGallery" });
  const es = new FakeElement("button", { dataset: { lang: "es" } });
  const en = new FakeElement("button", { dataset: { lang: "en" } });
  const page = makePage({ path: "/archivo-nasa", search, tab, elements: [back, gallery, es, en] });
  page.load("main.js", "science-content.js", "archivo-nasa.js").ready();
  return Object.assign(page, { back, gallery, click: lang => (lang === "en" ? en : es).listeners.click.forEach(fn => fn()) });
}


const ORIGINS = [
  { search: "?desde=menu", href: "/", es: "VOLVER AL MENÚ", en: "BACK TO MENU", origin: "menu" },
  { search: "?desde=bitacora", href: "/bitacora", es: "VOLVER A LA BITÁCORA", en: "BACK TO JOURNAL", origin: "bitacora" },
  { search: "", href: "/", es: "VOLVER AL MENÚ", en: "BACK TO MENU", origin: "menu" }
];

// ── Resolución del destino (lista de rutas permitidas) ──────────
test("archivo: el origen se valida contra la lista de rutas permitidas", () => {
  assert.deepEqual(archive.resolveReturn("?desde=menu"), { origin: "menu", href: "/", i18n: "science.back.menu" });
  assert.deepEqual(archive.resolveReturn("?desde=bitacora"), { origin: "bitacora", href: "/bitacora", i18n: "science.back.journal" });
  assert.deepEqual(archive.resolveReturn("?desde=marte"), { origin: "marte", href: "/marte", i18n: "science.back.mars" });
  assert.equal(archive.resolveReturn("").origin, "menu", "acceso directo por URL → menú");
  assert.equal(archive.resolveReturn(undefined).origin, "menu");
  for (const bad of ["?desde=https://ejemplo.com", "?desde=//ejemplo.com", "?desde=/bitacora", "?desde=javascript:alert(1)",
    "?desde=__proto__", "?desde=constructor", "?desde=toString", "?desde=BITACORA", "?desde=", "?desde=luna", "?otro=bitacora"]) {
    const r = archive.resolveReturn(bad);
    assert.equal(r.origin, "menu", bad);
    assert.equal(r.href, "/", bad);
  }
  assert.equal(archive.resolveReturn("?flujo=x&desde=bitacora").href, "/bitacora", "admite otros parámetros");
  const hrefs = Object.values(archive.RETURN_ROUTES).map(r => r.href);
  assert.ok(hrefs.every(h => /^\/[a-z-]*$/.test(h)), "solo rutas internas fijas");
  assert.ok(Object.isFrozen(archive.RETURN_ROUTES), "la lista no se puede ampliar en tiempo de ejecución");
});

// ── Botón de regreso en ambos idiomas ───────────────────────────
for (const lang of ["es", "en"]) {
  for (const c of ORIGINS) {
    test(`archivo [${lang}] ${c.search || "(URL directa)"}: muestra «${c[lang]}» y regresa a ${c.href}`, () => {
      const tab = newTab({ starstep_lang: lang });
      const page = openArchive(tab, c.search);
      assert.equal(page.back.textContent, c[lang]);
      assert.equal(page.back.href, c.href);
      assert.equal(page.back.dataset.origin, c.origin);
      assert.equal(page.ctx.__historyBack, undefined, "no usa history.back()");
    });
  }
}

test("archivo: recargar conserva la procedencia y el idioma", () => {
  const tab = newTab({ starstep_lang: "en" });
  openArchive(tab, "?desde=bitacora");
  const reloaded = openArchive(tab, "?desde=bitacora");
  assert.equal(reloaded.back.textContent, "BACK TO JOURNAL");
  assert.equal(reloaded.back.href, "/bitacora");
});

test("archivo: cambiar de idioma traduce el botón sin cambiar el destino", () => {
  for (const c of ORIGINS) {
    const page = openArchive(newTab(), c.search);
    page.click("en");
    assert.equal(page.back.textContent, c.en, c.search);
    assert.equal(page.back.href, c.href);
    page.click("es");
    assert.equal(page.back.textContent, c.es, c.search);
    assert.equal(page.back.href, c.href);
    // Recargar después del cambio: el idioma elegido persiste y la procedencia también.
    page.click("en");
    const reloaded = openArchive({ localStorage: page.ctx.localStorage, sessionStorage: page.ctx.sessionStorage }, c.search);
    assert.equal(reloaded.back.textContent, c.en);
    assert.equal(reloaded.back.href, c.href);
  }
});

test("archivo: conserva fotografías, textos científicos y créditos en ambos idiomas", () => {
  const photos = vm.runInNewContext(source("science-content.js") + ";window.StarScience.photos", { window: {} });
  const page = openArchive(newTab(), "?desde=menu");
  const cards = () => page.gallery.findAll(n => n.tagName === "ARTICLE");
  assert.equal(cards().length, photos.length, "todas las fotografías");
  const texts = () => page.gallery.findAll(n => n.tagName === "P").map(p => p.textContent);
  assert.deepEqual(texts(), sortByGroup(photos).map(p => p.es));
  assert.deepEqual(page.gallery.findAll(n => n.tagName === "SMALL").map(s => s.textContent), sortByGroup(photos).map(p => p.credit));
  assert.deepEqual(page.gallery.findAll(n => n.tagName === "IMG").map(i => i.src), sortByGroup(photos).map(p => p.file));
  page.click("en");
  assert.deepEqual(texts(), sortByGroup(photos).map(p => p.en));
  assert.equal(cards().length, photos.length);
});
function sortByGroup(photos) {
  return ["apollo", "mars", "spirit"].flatMap(g => photos.filter(p => p.group === g));
}

// ── Consulta sin efectos sobre el progreso ──────────────────────
test("archivo: consultar no registra artefactos, objetivos ni misiones", () => {
  const tab = newTab({ starstep_lang: "es" });
  const home = openHome(tab);
  home.ctx.StarFlow.recordObjective("lito_welcome.heard", { source: "welcome_skip" });
  const flowBefore = home.ctx.StarFlow.getState();
  const before = snapshot(tab.localStorage);
  for (const c of ORIGINS) {
    const page = openArchive(tab, c.search);
    page.click("en"); page.click("es");
    assert.equal(page.ctx.StarFlow, undefined, "el archivo no carga el controlador del flujo");
    assert.equal(page.ctx.StarProgress, undefined, "el archivo no carga el almacenamiento del progreso");
  }
  assert.equal(snapshot(tab.localStorage), before, "localStorage intacto (solo cambia si el jugador elige otro idioma)");
  const after = openHome(tab).ctx.StarFlow.getState();
  assert.deepEqual(after.completed, flowBefore.completed);
  assert.deepEqual(after.objectives, flowBefore.objectives);
  assert.deepEqual(after.artifacts, flowBefore.artifacts);
  assert.equal(after.current, flowBefore.current);
  assert.equal(after.revision, flowBefore.revision);
  const code = source("archivo-nasa.js").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  for (const forbidden of ["localStorage", "StarFlow", "StarProgress", "recordObjective", "registerDiscovery", "history.back"]) {
    assert.equal(code.includes(forbidden), false, `archivo-nasa.js no usa ${forbidden}`);
  }
});

// ── Regreso al menú sin repetir la bienvenida ───────────────────
test("menú → archivo → VOLVER AL MENÚ: no repite la bienvenida en la misma sesión", () => {
  for (const lang of ["es", "en"]) {
    const tab = newTab({ starstep_lang: lang });
    const first = openHome(tab);
    assert.equal(first.ctx.StarFlow.getHomeMode(), "welcome", "apertura inicial");
    first.ctx.StarFlow.recordObjective("lito_welcome.heard", { source: "welcome_skip" });
    const page = openArchive(tab, "?desde=menu");
    assert.equal(page.back.href, "/");
    assert.equal(openHome(tab).ctx.StarFlow.getHomeMode(), "menu", lang);
    // Cambiar de idioma en el archivo y volver: sigue siendo el menú.
    openArchive(tab, "?desde=menu").click(lang === "es" ? "en" : "es");
    assert.equal(openHome(tab).ctx.StarFlow.getHomeMode(), "menu");
  }
});

test("bitácora → archivo → VOLVER A LA BITÁCORA → menú: no repite la bienvenida", () => {
  const tab = newTab();
  openHome(tab).ctx.StarFlow.recordObjective("lito_welcome.heard", { source: "transmission" });
  const page = openArchive(tab, "?desde=bitacora");
  assert.equal(page.back.href, "/bitacora");
  assert.equal(openHome(tab).ctx.StarFlow.getHomeMode(), "menu");
});

test("URL directa al archivo en una pestaña nueva: el menú no repite una bienvenida ya completada", () => {
  // Sesión anterior: la bienvenida se completó.
  const previous = newTab();
  openHome(previous).ctx.StarFlow.recordObjective("lito_welcome.heard", { source: "welcome_skip" });
  // Pestaña nueva (sessionStorage vacío) que abre directamente /archivo-nasa.
  const tab = { localStorage: previous.localStorage, sessionStorage: makeStore() };
  const page = openArchive(tab, "");
  assert.equal(page.back.href, "/");
  assert.equal(page.back.textContent, "VOLVER AL MENÚ");
  assert.equal(openHome(tab).ctx.StarFlow.getHomeMode(), "menu");
});

test("URL directa con una partida nueva: la bienvenida sigue siendo obligatoria", () => {
  const tab = newTab();
  openArchive(tab, "");
  assert.equal(openHome(tab).ctx.StarFlow.getHomeMode(), "welcome");
});

test("la marca de sesión del archivo es la misma que usa flujo.js", () => {
  const key = /SESSION_KEY\s*=\s*"([^"]+)"/.exec(source("flujo.js"))[1];
  assert.ok(source("archivo-nasa.js").includes(`sessionStorage.setItem("${key}", "1")`));
});

// ── Plantillas ──────────────────────────────────────────────────
test("plantillas: cada enlace al archivo declara su procedencia", () => {
  assert.match(template("index.html"), /url_for\('archivo_nasa', desde='menu'\)/);
  assert.match(template("bitacora.html"), /url_for\('archivo_nasa', desde='bitacora'\)/);
  assert.match(template("marte.html"), /url_for\('archivo_nasa', desde='marte'\)/);
  const html = template("archivo-nasa.html");
  assert.match(html, /id="archiveBack" href="\/" data-i18n="science.back.menu">VOLVER AL MENÚ</, "sin JavaScript: menú por defecto");
  assert.doesNotMatch(html, /progreso\.js|flujo\.js|flujo-definicion\.js/);
});
