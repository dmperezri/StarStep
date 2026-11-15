// Enigma de la hematita (Acto II): selección de instrumentos y registro solo vía StarFlow.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { FakeElement, makePage, newTab, openHome, template } from "./navegador-simulado.mjs";

const require = createRequire(import.meta.url);
const Core = require("../../static/js/enigma-hematita.js");

test("evaluación: dos instrumentos; solo Microscopic Imager + Mössbauer resuelven", () => {
  assert.equal(Core.evaluate([]).result, "incomplete");
  assert.equal(Core.evaluate(["mi"]).result, "incomplete");
  assert.equal(Core.evaluate(["mi", "mossbauer", "apxs"]).result, "incomplete");
  assert.equal(Core.evaluate(["mossbauer", "mi"]).result, "correct");
  const wrong = Core.evaluate(["apxs", "mossbauer"]);
  assert.equal(wrong.result, "wrong");
  assert.deepEqual(wrong.hints, ["apxs"]);
  assert.deepEqual(wrong.missing, ["mi"]);
  assert.equal(Core.INSTRUMENTS.length, 6);
  for (const i of Core.INSTRUMENTS) if (!Core.SOLUTION.includes(i.id)) assert.ok(i.hint.es && i.hint.en, `${i.id} explica por qué no`);
  assert.match(Core.CARD.es.interpreted, /no de vida/, "agua no es lo mismo que vida");
});

// Partida que ya registró Opportunity (como lo haría el visor).
function tabAtHematite({ opportunity = true } = {}) {
  const tab = newTab();
  const { StarFlow: F, StarProgress: P } = openHome(tab).ctx;
  F.recordObjective("lito_welcome.heard", { source: "transmission" });
  P.setPlayer({ alias: "ARIEL", avatar: "vice" });
  F.recordObjective("profile.alias", { source: "avatar_form", alias: "ARIEL" });
  F.recordObjective("cadet_custom.avatar", { source: "avatar_form", avatar: "vice" });
  F.recordObjective("chapter_select.chapter1", { source: "chapter_menu" });
  F.recordObjective("chapter_briefing.ready", { source: "chapter_briefing_sequence" });
  F.recordObjective("launch.liftoff", { source: "launch_sequence" });
  for (const cp of [6, 12, 18]) F.saveFlightCheckpoint(cp, 0);
  F.recordObjective("space_travel.arrive", { source: "travel_minigame", seconds: 24 });
  F.recordObjective("moon_landing.touchdown", { source: "descent_sequence" });
  const M = { context: "mission", viewer: "3d" };
  F.locateArtifact("eagle", { mechanic: "rover_proximity_scan" }); F.beginInspection("eagle", M);
  for (const c of ["structure", "legs", "ladder"]) F.inspectComponent("eagle", c, M);
  if (opportunity) {
    F.locateArtifact("opportunity", { mechanic: "mars_panel_scan" }); F.beginInspection("opportunity", M);
    for (const c of ["pancam", "solar_panels", "wheels"]) F.inspectComponent("opportunity", c, M);
  }
  return tab;
}
function openMars(tab) {
  const page = makePage({ path: "/marte", tab, elements: [] });
  page.load("main.js", "progreso.js", "flujo-definicion.js", "flujo.js", "enigma-hematita.js").ready();
  const E = page.ctx.StarHematiteEnigma;
  const root = () => page.document.body.children.find(n => n.className === "enigma");
  const all = pred => root().findAll(pred);
  const byClass = cls => all(n => String(n.className || "").split(" ").includes(cls))[0];
  const instrument = id => all(n => n.dataset?.instrument === id)[0];
  return { page, E, root, byClass, instrument };
}

test("enigma: pistas al fallar, y el registro solo después del análisis correcto", () => {
  const tab = tabAtHematite();
  const m = openMars(tab);
  const F = m.page.ctx.StarFlow;
  assert.equal(F.getCurrentStage(), "mars_hematite");
  assert.equal(m.E.open(), true);
  assert.equal(m.root().hidden, false);
  assert.equal(F.getArtifact("blueberries").state, "undiscovered", "abrir el enigma no localiza nada");
  // Combinación incorrecta: explica por qué y deja reintentar.
  m.instrument("pancam").click(); m.instrument("apxs").click();
  m.byClass("enigma-analyze").click();
  assert.match(m.byClass("enigma-feedback").textContent, /Pancam ve el paisaje.*APXS encuentra hierro.*otra combinación/s);
  assert.equal(m.byClass("enigma-result").hidden, true);
  assert.equal(F.getArtifact("blueberries").state, "undiscovered");
  // Con un tercer instrumento se reemplaza el más antiguo (máximo 2).
  m.instrument("mi").click(); m.instrument("mossbauer").click();
  assert.deepEqual([...m.E.state.selected].sort(), ["mi", "mossbauer"]);
  m.byClass("enigma-analyze").click();
  assert.equal(m.byClass("enigma-result").hidden, false);
  assert.equal(m.byClass("enigma-analyze").hidden, true);
  assert.equal(F.getArtifact("blueberries").state, "undiscovered", "todavía no se registró");
  m.byClass("enigma-save").click();
  assert.equal(F.getArtifact("blueberries").state, "registered");
  assert.equal(m.byClass("enigma-save").disabled, true);
  assert.ok(m.page.ctx.StarProgress.list().some(i => i.id === "blueberries"), "en la bitácora");
  m.byClass("enigma-save").click();
  assert.equal(m.page.ctx.StarProgress.list().filter(i => i.id === "blueberries").length, 1, "sin duplicados");
});

test("enigma: bloqueado antes de registrar Opportunity; bilingüe", () => {
  const m = openMars(tabAtHematite({ opportunity: false }));
  assert.equal(m.E.open(), false);
  assert.equal(m.page.ctx.StarFlow.getArtifact("blueberries").state, "undiscovered");
  const ok = openMars(tabAtHematite());
  ok.page.ctx.StarI18n.setLang("en");
  ok.E.open();
  assert.match(ok.byClass("enigma-question").textContent, /Which two instruments/);
  assert.match(ok.byClass("enigma-analyze").textContent, /Analyze/);
});

test("plantilla de Marte: carga el enigma antes de marte.js y sus estilos", () => {
  const html = template("marte.html");
  assert.ok(html.indexOf("js/enigma-hematita.js") > 0 && html.indexOf("js/enigma-hematita.js") < html.indexOf("js/marte.js"));
  assert.match(html, /css\/enigma\.css/);
});
