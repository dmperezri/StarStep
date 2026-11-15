// Regreso (acoplamiento) y laboratorio (Acto I): física del acoplamiento, reintentos y análisis.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { makePage, newTab, openHome, completeGroup } from "./navegador-simulado.mjs";

const require = createRequire(import.meta.url);
const Core = require("../../static/js/regreso-laboratorio.js");

test("acoplamiento: llegar rápido o desalineado rebota; alineado y lento acopla", () => {
  let s = Core.initialDock(), r;
  do { r = Core.stepDock(s, 0.1); s = r.state; } while (!r.result);
  assert.equal(r.result, "bounce", "sin corregir nada (desalineado) no acopla");
  s = Core.initialDock(); r = null;
  for (let i = 0; i < 400 && !r?.result; i++) {
    const input = { up: s.offset > 1, down: s.offset < -1, slower: s.speed > 1 };
    r = Core.stepDock(s, 0.1, input); s = r.state;
    if (r.result) break; r = null;
  }
  assert.equal(r.result, "docked");
  const fast = Core.stepDock({ distance: 1, speed: 3, offset: 0, drift: 0 }, 0.1);
  assert.equal(fast.result, "bounce", "demasiado rápido");
});

test("laboratorio: vesículas por posición, sin contar dos veces", () => {
  const found = new Set();
  const v = Core.VESICLES[0];
  assert.equal(Core.hitVesicle(v.x + 3, v.y - 2, found), 0);
  found.add(0);
  assert.equal(Core.hitVesicle(v.x, v.y, found), -1, "ya encontrada");
  assert.equal(Core.hitVesicle(5, 5, found), -1);
  assert.equal(Core.STATEMENTS.filter(s => s.kind === "observed").length, 2);
  assert.equal(Core.QUESTION.es.options[Core.QUESTION.es.answer].includes("lava"), true);
  assert.match(Core.QUESTION.es.explain[2], /no tienen vida/);
});

function tabAtReturn() {
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
  const D = home.ctx.StarFlowDefinition, M = { context: "mission", viewer: "3d" };
  for (const id of ["moon_exploration", "moon_install_easep", "moon_install_reflector"]) {
    for (const ob of D.STAGES.find(s => s.id === id).objectives) {
      if (ob.type === "artifact") { const a = D.ARTIFACTS[ob.artifact]; F.locateArtifact(ob.artifact, { mechanic: a.locate[0].mechanic }); F.beginInspection(ob.artifact, M); for (const c of a.components) F.inspectComponent(ob.artifact, c.id, M); }
      else F.recordObjective(ob.id, { source: ob.sources[0] });
    }
  }
  return tab;
}
function openReturn(tab) {
  const page = makePage({ path: "/luna", tab, elements: [] });
  page.document.removeEventListener = () => {};
  page.ctx.setTimeout = fn => { fn(); return 0; };
  page.ctx.requestAnimationFrame = () => 0;
  page.load("main.js", "progreso.js", "flujo-definicion.js", "flujo.js", "regreso-laboratorio.js").ready();
  const R = page.ctx.StarMoonReturn;
  const roots = () => page.document.body.children.filter(n => n.className === "mg" && !n.hidden);
  const find = pred => roots().at(-1).findAll(pred);
  return { page, R, F: page.ctx.StarFlow, roots, find };
}

test("regreso: el acoplamiento se registra solo al acoplar bien; luego el laboratorio completa el Acto I", () => {
  const m = openReturn(tabAtReturn());
  assert.equal(m.F.getCurrentStage(), "moon_return", "el regreso va antes del laboratorio");
  assert.equal(m.R.openLab(), false, "el laboratorio todavía no");
  assert.equal(m.R.openDock(), true);
  m.R.dock.start();
  for (let i = 0; i < 400 && m.R.dock.state.running; i++) m.R.dock.tick(0.1);
  assert.equal(m.F.getState().objectives["moon_return.docking"], undefined, "sin corregir: rebota y no registra");
  m.R.dock.start();
  for (let i = 0; i < 600 && m.R.dock.state.running; i++) {
    const s = m.R.dock.state;
    const key = s.offset > 1 ? "ArrowUp" : s.offset < -1 ? "ArrowDown" : s.speed > 1 ? "ArrowLeft" : null;
    if (key) for (const fn of m.R.dock.root.listeners.keydown) fn({ key });
    m.R.dock.tick(0.1);
  }
  assert.equal(m.R.dock.state.finished, true);
  assert.equal(m.F.getCurrentStage(), "moon_lab");
  // Laboratorio: 3 vesículas → clasificar → pregunta.
  assert.equal(m.R.openLab(), true);
  for (const v of Core.VESICLES) m.R.lab.clickRock(v.x, v.y);
  for (const st of Core.STATEMENTS) {
    const row = m.find(n => n.dataset?.statement === st.id)[0];
    const wrong = row.findAll(n => n.dataset?.kind && n.dataset.kind !== st.kind)[0];
    wrong.click();
    assert.ok(row.classList.contains("bad"), "clasificación incorrecta: se marca y no avanza");
    row.findAll(n => n.dataset?.kind === st.kind)[0].click();
  }
  m.find(n => n.dataset?.option === "2")[0].click();
  assert.equal(m.F.isStageCompleted("moon_lab"), false, "respuesta incorrecta: no completa");
  m.find(n => n.dataset?.option === "1")[0].click();
  assert.equal(m.F.isStageCompleted("moon_lab"), true);
  assert.equal(m.F.isActComplete("luna"), true, "Acto I completo: diploma lunar disponible");
});
