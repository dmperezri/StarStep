// Exploración lunar (Acto I): oxígeno, orden de las muestras, puntos seguros y registro vía StarFlow.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { FakeElement, makePage, newTab, openHome, completeGroup } from "./navegador-simulado.mjs";

const require = createRequire(import.meta.url);
const Core = require("../../static/js/luna-mision.js");

test("oxígeno: 135 s, solo baja con la exploración activa, recargas de +30 s con tope", () => {
  assert.equal(Core.O2_MAX, 135);
  assert.equal(Core.stepOxygen(100, 1, true), 99);
  assert.equal(Core.stepOxygen(100, 5, false), 100, "pausado (tarjeta, visor, pestaña oculta): no baja");
  assert.equal(Core.stepOxygen(0.5, 1, true), 0);
  assert.equal(Core.refill(50), 80);
  assert.equal(Core.refill(120), 135, "no supera el máximo");
  assert.equal(Core.formatO2(135), "2:15");
});

test("muestras: 5 en la caja, la de contingencia primero y el SWC marcado como experimento", () => {
  assert.deepEqual([...Core.BOX], ["cont", "basalt10057", "regolith10084", "core", "swc"]);
  assert.equal(Core.locked("basalt10057", new Set()), true);
  assert.equal(Core.locked("cont", new Set()), false);
  assert.equal(Core.locked("basalt10057", new Set(["cont"])), false);
  assert.equal(Core.locked("plaque", new Set()), false, "la placa no depende de la caja");
  assert.match(Core.CARDS.swc.kind.es, /EXPERIMENTO/);
  assert.match(Core.CARDS.basalt10057.observed.es, /919 g/);
  for (const [id, card] of Object.entries(Core.CARDS)) {
    for (const k of ["title", "observed", "interpreted", "narrative"]) assert.ok(card[k].es && card[k].en, `${id}.${k} bilingüe`);
    assert.match(card.sourceUrl, /^https:\/\/(nssdc\.gsfc|curator\.jsc)\.nasa\.gov\//, `${id}: fuente NASA`);
  }
});

test("puntos seguros: se vuelve al último alcanzado (Eagle o la bandera de control)", () => {
  assert.equal(Core.lastSafe(300), Core.EAGLE_X);
  assert.equal(Core.lastSafe(2500), 2100);
  const ids = Core.POIS.map(p => p.id);
  for (const id of Core.BOX) assert.ok(ids.includes(id));
  assert.ok(Core.POIS.every(p => p.x > 0 && p.x < Core.WORLD_WIDTH));
});

// Partida en la exploración lunar (con el alunizaje hecho), en el navegador simulado.
function tabAtMoon() {
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
  return tab;
}
function openMoon(tab) {
  const canvas = new FakeElement("canvas", { id: "gameCanvas" });
  const mensaje = new FakeElement("p", { id: "mensaje" });
  const page = makePage({ path: "/luna", tab, elements: [canvas, mensaje] });
  page.document.removeEventListener = () => {};
  page.ctx.performance = { now: () => 0 };
  page.load("main.js", "progreso.js", "flujo-definicion.js", "flujo.js", "tarjeta-cientifica.js", "luna-mision.js").ready();
  const rover = x => ({ x: x - 32, width: 64 });
  const body = () => page.document.body;
  const byClass = cls => body().findAll(n => String(n.className || "").split(" ").includes(cls))[0];
  return { page, M: page.ctx.StarMoonMission, F: page.ctx.StarFlow, rover, byClass, mensaje };
}

test("recolección: acercarse localiza, la tarjeta exige INSPECCIONAR y GUARDAR registra una sola vez", () => {
  const m = openMoon(tabAtMoon());
  assert.equal(m.F.getCurrentStage(), "moon_exploration");
  // Otra muestra antes que la de contingencia: bloqueada.
  m.M.update(0.016, m.rover(1500));
  assert.equal(m.F.getArtifact("basalt10057").state, "undiscovered");
  assert.match(m.mensaje.textContent, /contingencia/);
  // Contingencia: acercarse la localiza; la tarjeta pausa la exploración.
  m.M.update(0.016, m.rover(640));
  assert.equal(m.F.getArtifact("cont").state, "located");
  m.M.openCard("cont");
  assert.equal(m.M.paused(), true);
  const o2 = m.M.state.o2;
  m.M.update(5, m.rover(640));
  assert.equal(m.M.state.o2, o2, "con la tarjeta abierta no se consume oxígeno");
  m.byClass("sci-confirm").click();
  assert.notEqual(m.F.getArtifact("cont").state, "registered", "sin inspeccionar no se guarda");
  m.byClass("sci-inspect").click();
  m.byClass("sci-confirm").click();
  assert.equal(m.F.getArtifact("cont").state, "registered");
  m.byClass("sci-confirm").click();
  assert.equal(m.page.ctx.StarProgress.list().filter(i => i.id === "cont").length, 1);
  assert.equal(m.M.state.box, 1);
});

test("oxígeno agotado: vuelve al punto seguro con el tanque lleno y conserva lo registrado", () => {
  const m = openMoon(tabAtMoon());
  const r = m.rover(640);
  m.M.update(0.016, r); m.M.openCard("cont"); m.byClass("sci-inspect").click(); m.byClass("sci-confirm").click();
  m.page.ctx.StarScienceCard.close(false);
  m.M.update(0.016, m.rover(2100));             // pasa por la bandera de control (2100)
  const far = m.rover(2300);
  m.M.update(0.016, far);
  assert.equal(m.M.state.safeX, 2100);
  for (let i = 0; i < 140; i++) m.M.update(1, far);
  assert.equal(m.M.state.o2 > 100, true, "se reinició el oxígeno");
  assert.equal(Math.round(far.x + 32), 2100, "volvió al último punto seguro");
  assert.equal(m.F.getArtifact("cont").state, "registered", "lo registrado se conserva");
});

test("Acto I: con Eagle, las 5 muestras y la placa se completa la exploración lunar", () => {
  const m = openMoon(tabAtMoon());
  completeGroup(m.F, m.page.ctx.StarFlowDefinition, "moon");
  assert.equal(m.F.isStageCompleted("moon_exploration"), true);
  for (const id of [...Core.BOX, "plaque", "eagle"]) assert.equal(m.F.getArtifact(id).state, "registered", id);
});
