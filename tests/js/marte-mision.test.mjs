// Acto II: transición, aterrizaje, ruta con batería, enigmas de yeso y arcillas, habitabilidad y tormenta.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { makePage, newTab, openHome, completeGroup } from "./navegador-simulado.mjs";

const require = createRequire(import.meta.url);
const Mars = require("../../static/js/marte-mision.js");
const Enig = require("../../static/js/enigmas-marte.js");

test("aterrizaje: cada acción en su ventana; antes o después falla", () => {
  assert.equal(Mars.landingAction(12, 0), "early");
  assert.equal(Mars.landingAction(9, 0), "ok");
  assert.equal(Mars.landingAction(5, 0), "late");
  assert.equal(Mars.landingAction(0.2, 1), "ok");
  assert.equal(Mars.landingAction(0.05, 2), "ok");
  assert.equal(Mars.landingAction(1, 3), "done");
});

test("ruta: moverse gasta batería, sin batería no avanza, detenido recarga", () => {
  let s = { x: 0, energy: 4 };
  s = Mars.drive(s, 1); assert.equal(s.x, 20); assert.equal(s.energy, 2);
  s = Mars.drive(s, 1); s = Mars.drive(s, 1);
  assert.equal(s.blocked, true, "sin batería");
  assert.equal(s.x, 40);
  s = Mars.rest(s); assert.equal(s.energy > 0, true);
  assert.deepEqual(Mars.STATIONS.map(x => x.stage), ["mars_exploration", "mars_hematite", "mars_gypsum", "mars_clay", "mars_habitability", "mars_storm"]);
});

test("tormenta: buenas decisiones envían la última imagen; foto temprana o gastar de más pierde", () => {
  let s = { sol: 0, battery: 60 };
  for (const a of [["minimal"], ["minimal"], ["heaters"], ["heaters"], ["heaters", "photo"], ["heaters", "transmit"]]) s = Mars.stormSol(s, a);
  assert.equal(s.result, "sent");
  let early = { sol: 0, battery: 60 };
  for (let i = 0; i < 6 && !early.result; i++) early = Mars.stormSol(early, ["photo", "transmit"]);
  assert.equal(early.result, "lost", "la foto antes del peor momento no vale y agota la batería");
  let greedy = { sol: 0, battery: 60 };
  for (let i = 0; i < 6 && !greedy.result; i++) greedy = Mars.stormSol(greedy, ["science", "heaters"]);
  assert.equal(greedy.result, "lost");
  const cold = Mars.stormSol({ sol: 2, battery: 60 }, ["minimal"]);
  assert.equal(cold.cold, true, "sin calefactores con τ ≥ 4,7 el frío cuesta batería");
});

test("enigmas de yeso y arcillas: soluciones del prototipo, pistas y química indirecta", () => {
  assert.equal(Enig.evaluate("gypsum", ["pancam", "apxs"]).result, "correct");
  assert.equal(Enig.evaluate("clay", ["apxs", "rat"]).result, "correct");
  assert.deepEqual(Enig.evaluate("clay", ["mi", "apxs"]).hints, ["mi"]);
  assert.equal(Enig.evaluate("gypsum", ["pancam"]).result, "incomplete");
  assert.match(Enig.ENIGMAS.clay.card.interpreted.es, /interpretación/, "no afirma que se «vio» la arcilla");
  assert.equal(Enig.HAB_QUESTION.es.options[Enig.HAB_QUESTION.es.answer].includes("no se encontró vida"), true);
  assert.ok(Enig.ITEMS.some(i => i.kind === "life" && i.false), "la afirmación de fósiles es falsa");
});

// ── Recorrido en el navegador simulado ──
function tabAtMars() {
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
  completeGroup(F, home.ctx.StarFlowDefinition, "moon");
  return tab;
}
function openMars(tab) {
  const page = makePage({ path: "/marte", tab, elements: [] });
  page.document.removeEventListener = () => {};
  page.ctx.setTimeout = () => 0;
  page.ctx.requestAnimationFrame = () => 0;
  page.load("main.js", "progreso.js", "flujo-definicion.js", "flujo.js", "tarjeta-cientifica.js", "enigma-hematita.js", "enigmas-marte.js", "marte-mision.js").ready();
  const top = () => page.document.body.children.filter(n => !n.hidden).at(-1);
  const find = pred => top().findAll(pred);
  return { page, F: page.ctx.StarFlow, M: page.ctx.StarMarsMission, E: page.ctx.StarMarsEnigmas, top, find };
}

test("Acto II completo: transición, aterrizaje, ruta, enigmas, habitabilidad y tormenta, todo vía StarFlow", () => {
  const m = openMars(tabAtMars());
  const F = m.F;
  assert.equal(F.getCurrentStage(), "mars_transition");
  m.M.openTransition();
  m.find(n => n.className === "mg-btn primary")[0].click();
  assert.equal(F.getCurrentStage(), "mars_landing");
  // Aterrizaje: el paracaídas demasiado pronto falla.
  const L = m.M.landing;
  L.start(); L.act(0);
  assert.equal(F.getState().objectives["mars_landing.touchdown"], undefined);
  L.start(); while (L.state.alt > 9) L.tick(0.1); L.act(0);
  while (L.state.alt > 0.3) L.tick(0.1); L.act(1);
  while (L.state.alt > 0.05) L.tick(0.05); L.act(2);
  assert.equal(L.state.done, true);
  assert.equal(F.getCurrentStage(), "mars_exploration");
  // Ruta: hasta la plataforma y la tarjeta.
  m.M.openRoute(); const R = m.M.route;
  for (let i = 0; i < 6; i++) R.move(1);
  R.investigate();
  m.find(n => String(n.className).includes("sci-inspect"))[0].click();
  m.find(n => String(n.className).includes("sci-confirm"))[0].click();
  assert.equal(F.getArtifact("lander").state, "registered");
  m.page.ctx.StarScienceCard.close(false);
  // Opportunity (visor o ficha) y hematita como en sus pruebas propias.
  const V = { context: "mission", viewer: "3d" };
  F.locateArtifact("opportunity", { mechanic: "mars_rover_scan" }); F.beginInspection("opportunity", V);
  for (const c of ["pancam", "solar_panels", "wheels"]) F.inspectComponent("opportunity", c, V);
  F.locateArtifact("blueberries", { mechanic: "mars_rover_scan" }); F.beginInspection("blueberries", V); F.inspectComponent("blueberries", "hematite", V);
  assert.equal(F.getCurrentStage(), "mars_gypsum");
  // Yeso y arcillas.
  for (const [id, sol] of [["gypsum", ["pancam", "apxs"]], ["clay", ["rat", "apxs"]]]) {
    assert.ok(m.E.open(id));
    for (const inst of ["minites", "mossbauer"]) m.find(n => n.dataset?.instrument === inst)[0].click();
    m.find(n => n.className === "mg-btn primary")[0].click();
    assert.notEqual(F.getArtifact(id).state, "registered", `${id}: combinación incorrecta no registra`);
    for (const inst of sol) m.find(n => n.dataset?.instrument === inst)[0].click();
    m.find(n => n.className === "mg-btn primary")[0].click();
    m.find(n => n.className === "mg-btn primary")[1].click();
    assert.equal(F.getArtifact(id).state, "registered", id);
  }
  // Habitabilidad.
  assert.equal(F.getCurrentStage(), "mars_habitability");
  m.E.openHabitability();
  for (const item of Enig.ITEMS) m.find(n => n.dataset?.item === item.id)[0].findAll(n => n.dataset?.kind === item.kind)[0].click();
  m.find(n => n.dataset?.option === "0")[0].click();
  assert.equal(F.isStageCompleted("mars_habitability"), false, "«Marte tuvo vida» no es correcto");
  m.find(n => n.dataset?.option === "1")[0].click();
  assert.equal(F.getCurrentStage(), "mars_storm");
  // Tormenta: primero un intento perdido, después el correcto.
  const S = m.M.openStorm();
  for (let i = 0; i < 6 && !S.state.result; i++) { S.choose("science"); S.choose("heaters"); S.endSol(); }
  assert.equal(S.state.result, "lost");
  assert.equal(F.isStageCompleted("mars_storm"), false);
  S.endSol();                                                     // reintentar
  for (const a of [["minimal"], ["minimal"], ["heaters"], ["heaters"], ["heaters", "photo"], ["heaters", "transmit"]]) { for (const x of a) S.choose(x); S.endSol(); }
  assert.equal(S.state.result, "sent");
  assert.equal(F.isActComplete("marte"), true);
});
