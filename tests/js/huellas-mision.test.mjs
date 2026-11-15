// Acto III: asociación solo con piezas conseguidas, conexión Eagle–Eagle y método en espejo.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { makePage, newTab, openHome, completeGroup } from "./navegador-simulado.mjs";

const require = createRequire(import.meta.url);
const Core = require("../../static/js/huellas-mision.js");

test("contenido: datos de cada Eagle y 5 pasos con una afirmación por misión", () => {
  assert.deepEqual(Core.EAGLE_FACTS.map(f => f.side).sort(), ["mars", "mars", "moon", "moon"]);
  assert.match(Core.EAGLE_QUESTION.es.explain[0], /dos misiones distintas/);
  assert.equal(Core.MIRROR.length, 5);
  for (const s of Core.MIRROR) assert.deepEqual(s.cards.map(c => c.side).sort(), ["mars", "moon"]);
  assert.match(Core.MIRROR[4].cards.find(c => c.side === "mars").es, /vida sigue abierta/);
});

function tabAtFootprints() {
  const tab = newTab();
  const home = openHome(tab); const { StarFlow: F, StarProgress: P } = home.ctx; const D = home.ctx.StarFlowDefinition;
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
  for (const g of ["moon", "transition", "mars"]) completeGroup(F, D, g);
  return tab;
}
function openFootprints(tab) {
  const page = makePage({ path: "/huellas", tab, elements: [] });
  page.document.removeEventListener = () => {};
  page.ctx.setTimeout = fn => { fn(); return 0; };
  page.load("main.js", "progreso.js", "flujo-definicion.js", "flujo.js", "huellas-mision.js").ready();
  const top = () => page.document.body.children.filter(n => !n.hidden).at(-1);
  const find = pred => top().findAll(pred);
  return { page, F: page.ctx.StarFlow, H: page.ctx.StarFootprints, D: page.ctx.StarFlowDefinition, find };
}

test("asociación: solo piezas conseguidas", () => {
  const tab = newTab(); const { StarFlow: F, StarFlowDefinition: D } = openHome(tab).ctx;
  assert.equal(Core.pieceAvailable(F, D, "easep"), false, "partida nueva: nada disponible");
  const m = openFootprints(tabAtFootprints());
  for (const id of ["eagle", "easep", "reflector", "plaque", "lander", "opportunity"]) assert.equal(Core.pieceAvailable(m.F, m.D, id), true, id);
});

test("Acto III: asociación → conexión Eagle–Eagle → método en espejo, con errores que no avanzan", () => {
  const m = openFootprints(tabAtFootprints());
  assert.equal(m.F.getCurrentStage(), "footprints");
  for (const id of ["eagle", "easep", "reflector", "plaque", "lander", "opportunity"]) m.F.recordObjective("footprints.pair." + id, { source: "matching_game" });
  assert.equal(m.F.getCurrentStage(), "eagle_connection");
  m.H.openEagle();
  for (const f of Core.EAGLE_FACTS) {
    const row = m.find(n => n.dataset?.fact === f.id)[0];
    row.findAll(n => n.dataset?.side && n.dataset.side !== f.side)[0].click();
    assert.ok(row.classList.contains("bad"));
    row.findAll(n => n.dataset?.side === f.side)[0].click();
  }
  m.find(n => n.dataset?.option === "0")[0].click();
  assert.equal(m.F.isStageCompleted("eagle_connection"), false, "Apollo 11 no fue a Marte");
  m.find(n => n.dataset?.option === "1")[0].click();
  assert.equal(m.F.getCurrentStage(), "mirror_method");
  m.H.openMirror();
  for (let step = 1; step <= 5; step++) {
    for (const side of ["moon", "mars"]) m.find(n => n.dataset?.card === side)[0].findAll(n => n.dataset?.side === side)[0].click();
    assert.ok(m.F.getState().objectives["mirror_method.step" + step], `paso ${step}`);
  }
  assert.equal(m.F.getCurrentStage(), "chapter_reward");
  assert.equal(m.F.isActComplete("huellas"), true);
});
