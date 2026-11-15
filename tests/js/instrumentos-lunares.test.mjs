// Instalación del EASEP y del retrorreflector (Acto I): posición, orientación y registro vía StarFlow.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { makePage, newTab, openHome, completeGroup } from "./navegador-simulado.mjs";

const require = createRequire(import.meta.url);
const Core = require("../../static/js/instrumentos-lunares.js");

test("geometría: 17 m al sur de Eagle; el reflector ~5 m al NNO del EASEP y hacia la Tierra", () => {
  const e = Core.easepTarget();
  assert.ok(Math.abs(e.x) < 1e-9 && Math.abs(e.y - 17) < 1e-9, "al sur = y positiva");
  assert.equal(Core.compass(Core.bearing(Core.EAGLE, e)), "S");
  assert.equal(Core.checkEasep({ x: 0, y: 17 }).ok, true);
  assert.equal(Core.checkEasep({ x: 2, y: 20 }).ok, true, "dentro del margen de ±4 m");
  assert.equal(Core.checkEasep({ x: 0, y: 9 }).ok, false);
  const goal = Core.target(e, 5, 337.5);
  assert.equal(Core.compass(Core.bearing(e, goal)), "NNO");
  assert.deepEqual([Core.checkReflector(goal, 60, e).position, Core.checkReflector(goal, 60, e).orientation], [true, true]);
  assert.equal(Core.checkReflector(goal, 90, e).orientation, false, "30° fuera: falla la orientación");
  assert.equal(Core.checkReflector({ x: e.x + 4, y: e.y }, 60, e).position, false);
  assert.equal(Core.angleDiff(350, 10), 20);
});

function tabAtInstruments() {
  const tab = newTab();
  const home = openHome(tab); const { StarFlow: F, StarProgress: P } = home.ctx;
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
  // Solo la exploración (Eagle, muestras y placa): los instrumentos quedan pendientes.
  const M = { context: "mission", viewer: "3d" }, D = home.ctx.StarFlowDefinition;
  for (const ob of D.STAGES.find(s => s.id === "moon_exploration").objectives) {
    const a = D.ARTIFACTS[ob.artifact]; F.locateArtifact(ob.artifact, { mechanic: a.locate[0].mechanic }); F.beginInspection(ob.artifact, M);
    for (const c of a.components) F.inspectComponent(ob.artifact, c.id, M);
  }
  return tab;
}
function openInstruments(tab) {
  const page = makePage({ path: "/luna", tab, elements: [] });
  page.document.removeEventListener = () => {};
  page.ctx.setTimeout = fn => { fn(); return 0; };
  page.load("main.js", "progreso.js", "flujo-definicion.js", "flujo.js", "instrumentos-lunares.js").ready();
  const I = page.ctx.StarLunarInstruments;
  const root = () => page.document.body.children.find(n => n.className === "mg");
  const parts = () => root().findAll(n => n.dataset?.part);
  return { page, I, F: page.ctx.StarFlow, root, parts };
}

test("EASEP: mal ubicado no se instala; bien ubicado exige inspeccionar sus 3 partes", () => {
  const m = openInstruments(tabAtInstruments());
  assert.equal(m.F.getCurrentStage(), "moon_install_easep");
  assert.equal(m.I.open(), true);
  m.I.confirm();
  assert.equal(m.F.getArtifact("easep").state, "undiscovered", "a 3 m de Eagle no alcanza");
  for (let i = 0; i < 14; i++) m.I.move(0, 1);
  m.I.confirm();
  assert.equal(m.F.getArtifact("easep").state, "inspection_pending");
  assert.equal(m.parts().length, 3);
  for (const b of m.parts()) b.click();
  assert.equal(m.F.getArtifact("easep").state, "registered");
  assert.equal(m.F.isStageCompleted("moon_install_easep"), true);
  assert.equal(m.F.getCurrentStage(), "moon_install_reflector");
  assert.equal(m.I.state.phase, "lrrr", "sigue con el retrorreflector");
});

test("retrorreflector: posición y orientación con margen; luego prismas y soporte", () => {
  const m = openInstruments(tabAtInstruments());
  m.I.open(); for (let i = 0; i < 14; i++) m.I.move(0, 1); m.I.confirm(); for (const b of m.parts()) b.click();
  // Ahora en la fase del reflector, cerca del EASEP pero mal orientado.
  const e = Core.easepTarget(), goal = Core.target(e, 5, 337.5);
  const s = m.I.state; m.I.move(Math.round(goal.x) - s.pos.x, Math.round(goal.y) - s.pos.y);
  m.I.confirm();
  assert.equal(m.F.getArtifact("reflector").state, "undiscovered", "sin orientar no se instala");
  for (let i = 0; i < 4; i++) m.I.rotate(15);                // 60° hacia la Tierra
  m.I.confirm();
  assert.equal(m.F.getArtifact("reflector").state, "inspection_pending");
  for (const b of m.parts()) b.click();
  assert.equal(m.F.getArtifact("reflector").state, "registered");
  assert.equal(m.F.isStageCompleted("moon_install_reflector"), true);
  const ob = m.F.getState().objectives;
  assert.ok(ob["moon_install_reflector.install"] && ob["moon_install_reflector.orient"]);
});

test("instrumentos: se fijan tras validar, el EASEP usa la misma referencia al recargar y no arrastra el láser", () => {
  const tab = tabAtInstruments();
  let m = openInstruments(tab);
  m.I.open(); m.I.move(2, 14); m.I.confirm();
  assert.ok(Math.abs(m.I.state.pos.x) < 1e-9, "EASEP encajado en posición nominal");
  assert.equal(m.I.state.pos.y, 17);
  const locked = JSON.stringify(m.I.state);
  m.I.move(5, 5); m.I.rotate(90);
  assert.equal(JSON.stringify(m.I.state), locked, "no se mueve durante inspección");
  m.parts()[0].click();
  m = openInstruments(tab); m.I.open();
  assert.equal(m.parts().length, 3);
  assert.equal(m.parts()[0].disabled, true, "conserva inspección parcial tras recarga");
  for (const b of m.parts().filter(b=>!b.disabled)) b.click();
  assert.equal(m.I.state.phase, "lrrr");
  const goal = Core.target(Core.easepTarget(),5,337.5);
  m.I.move(Math.round(goal.x)-m.I.state.pos.x,Math.round(goal.y)-m.I.state.pos.y);
  m.I.rotate(60); m.I.confirm();
  const fixed = JSON.stringify(m.I.state);
  m.I.move(8, 5); m.I.rotate(-90); m.I.confirm();
  assert.equal(JSON.stringify(m.I.state),fixed);
  assert.equal(m.F.getArtifact("reflector").state,"inspection_pending");
  m = openInstruments(tab); m.I.open();
  assert.equal(m.I.state.angle,60);
  assert.equal(m.parts().length,2);
  for(const b of m.parts()) b.click();
  assert.equal(m.F.getArtifact("reflector").state,"registered");
  m.I.confirm();
  assert.equal(m.I.state.open,false,"Continuar cierra el diálogo terminado");
});
