// Diploma marciano (solo con el Acto II completo) y créditos (sin autorías inventadas).
import { test } from "node:test";
import assert from "node:assert/strict";
import { FakeElement, makePage, newTab, openHome, completeGroup, source, template } from "./navegador-simulado.mjs";

test("diploma marciano: bloqueado hasta completar Marte con nombre de cadete", () => {
  const tab = newTab();
  const home = openHome(tab); const { StarFlow: F, StarProgress: P } = home.ctx; const D = home.ctx.StarFlowDefinition;
  const page = () => { const host = new FakeElement("div", { id: "marsDiplomaStatus" }); const p = makePage({ path: "/bitacora", tab, elements: [host] }); p.load("main.js", "progreso.js", "flujo-definicion.js", "flujo.js", "diploma-marciano.js").ready(); return { p, host }; };
  let { p, host } = page();
  assert.equal(p.ctx.StarMarsDiploma.ready(), false);
  assert.equal(host.findAll(n => n.id === "marsDiplomaButton")[0].disabled, true);
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
  completeGroup(F, D, "moon");
  ({ p, host } = page());
  assert.equal(p.ctx.StarMarsDiploma.ready(), false, "con la Luna sola no alcanza");
  completeGroup(F, D, "transition"); completeGroup(F, D, "mars");
  ({ p, host } = page());
  assert.equal(p.ctx.StarMarsDiploma.ready(), true);
  assert.equal(host.findAll(n => n.id === "marsDiplomaButton")[0].disabled, false);
});

test("créditos: equipo OUTSTRIP, aviso de sitio no oficial y recursos sin licencia marcados como pendientes", () => {
  const js = source("creditos.js");
  for (const name of ["Ariel Talavera", "Liliana Perez", "Kevin Flores", "Dannia Perez", "Willam Perez", "Samantha Perez"]) assert.ok(js.includes(name), name);
  assert.match(js, /no es un sitio ni un juego oficial de la NASA/);
  assert.match(js, /autoría y licencia pendientes de verificación/);
  assert.match(js, /licencia y autoría por verificar/);
  assert.match(template("index.html"), /id="creditsButton"/);
  assert.match(template("bitacora.html"), /id="marsDiplomaStatus"/);
});
