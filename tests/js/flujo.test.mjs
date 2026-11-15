// Pruebas del controlador StarFlow. Ejecutar desde la raíz del repositorio:
//   node --test tests/js/
// Solo usa el ejecutor integrado de Node (>= 18); no requiere dependencias.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { completeGroup } from "./navegador-simulado.mjs";

const require = createRequire(import.meta.url);
const def = require("../../static/js/flujo-definicion.js");
const { createStarFlow } = require("../../static/js/flujo.js");

// ── Utilidades ──────────────────────────────────────────────────
function memoryStorage(initial = {}) {
  const box = { flow: initial.flow ?? null, backups: [], saves: 0 };
  return {
    box,
    load: () => box.flow,
    save: s => { box.flow = JSON.stringify(s); box.saves++; },
    backup: raw => box.backups.push(raw),
    legacyInventory: () => initial.inventory ?? [],
    legacyActs: () => initial.acts ?? [],
    legacyProfile: () => initial.profile ?? {}
  };
}
function spyWriter() {
  const calls = { discoveries: [], acts: [] };
  return { calls, commitDiscovery: id => calls.discoveries.push(id), commitAct: act => calls.acts.push(act) };
}
let clock = 0;
const now = () => new Date(Date.UTC(2026, 10, 14, 12, 0, clock++)).toISOString();
function makeFlow(initial, extra = {}) {
  const storage = extra.storage || memoryStorage(initial);
  const writer = extra.writer || spyWriter();
  const flow = createStarFlow({ definition: def, storage, writer, now, idGen: () => "guest-test0001" });
  return { flow, storage, writer };
}
const M = { context: "mission", viewer: "3d" };
const J = { context: "journal", viewer: "3d" };

function playIntro(flow) {
  assert.equal(flow.recordObjective("lito_welcome.heard", { source: "transmission" }).ok, true);
  assert.equal(flow.recordObjective("profile.alias", { source: "avatar_form", alias: "ARIEL" }).ok, true);
  assert.equal(flow.recordObjective("cadet_custom.avatar", { source: "avatar_form", avatar: "vice" }).ok, true);
  assert.equal(flow.recordObjective("chapter_select.chapter1", { source: "chapter_menu" }).ok, true);
  assert.equal(flow.recordObjective("chapter_briefing.ready", { source: "chapter_briefing_sequence" }).ok, true);
  assert.equal(flow.recordObjective("launch.liftoff", { source: "launch_sequence" }).ok, true);
  for (const cp of [6,12,18]) assert.ok(flow.saveFlightCheckpoint(cp,0).ok);
  assert.ok(flow.recordObjective("space_travel.arrive",{source:"travel_minigame",seconds:24}).ok);
  assert.equal(flow.recordObjective("moon_landing.touchdown", { source: "descent_sequence" }).ok, true);
}
function discover(flow, id, mechanic) {
  assert.equal(flow.locateArtifact(id, { mechanic }).ok, true, `localizar ${id}`);
  assert.equal(flow.beginInspection(id, M).ok, true, `inspeccionar ${id}`);
  for (const c of def.ARTIFACTS[id].components) flow.inspectComponent(id, c.id, M);
  assert.equal(flow.getArtifact(id).state, "registered", `${id} registrado`);
}
function playToFootprints(flow) {
  playIntro(flow);
  completeGroup(flow, def, "moon"); // Eagle, 5 muestras y placa (Acto I completo)
  // Acto II completo: transición, aterrizaje, exploración, enigmas, habitabilidad y tormenta.
  completeGroup(flow, def, "transition");
  completeGroup(flow, def, "mars");
}
function playFootprints(flow) {
  for (const id of ["eagle", "easep", "reflector", "plaque", "lander", "opportunity"]) {
    assert.equal(flow.recordObjective("footprints.pair." + id, { source: "matching_game" }).ok, true);
  }
  // Acto III: conexión Eagle–Eagle y método científico en espejo.
  completeGroup(flow, def, "footprints");
}

// ── Integridad de la definición ─────────────────────────────────
test("la definición es coherente (ids únicos, objetivos y artefactos válidos)", () => {
  const stageIds = def.STAGES.map(s => s.id);
  assert.equal(new Set(stageIds).size, stageIds.length);
  const objectiveIds = def.STAGES.flatMap(s => s.objectives.map(o => o.id));
  assert.equal(new Set(objectiveIds).size, objectiveIds.length);
  for (const s of def.STAGES) {
    if (s.implemented) assert.ok(s.objectives.some(o => o.implemented), `${s.id} necesita un objetivo implementado`);
    for (const o of s.objectives) {
      if (o.type === "artifact") {
        assert.ok(def.ARTIFACTS[o.artifact], `${o.id} referencia un artefacto conocido`);
        assert.equal(def.ARTIFACTS[o.artifact].stage, s.id, `${o.artifact} pertenece a ${s.id}`);
      } else {
        assert.ok(o.sources.length > 0, `${o.id} declara fuentes de evidencia`);
      }
    }
  }
  for (const [id, a] of Object.entries(def.ARTIFACTS)) {
    assert.ok(stageIds.includes(a.stage), `${id}.stage existe`);
    assert.ok(a.components.length > 0 && a.locate.length > 0, `${id} tiene componentes y mecánica`);
  }
  for (const [legacy, target] of Object.entries(def.LEGACY_ALIASES)) {
    assert.ok(target === null || def.ARTIFACTS[target], `alias ${legacy}`);
  }
  // Identificadores estables: sin acentos ni espacios (independientes del idioma).
  for (const id of [...stageIds, ...objectiveIds, ...Object.keys(def.ARTIFACTS)]) assert.match(id, /^[a-z0-9_.]+$/);
});

// 1
test("1. una partida nueva comienza en una etapa válida", () => {
  const { flow } = makeFlow();
  const current = flow.getCurrentStage();
  assert.equal(current, "lito_welcome");
  assert.equal(flow.canEnter(current), true);
  assert.equal(flow.getState().player.mode, "guest");
  assert.match(flow.getState().player.id, /^[a-zA-Z0-9_-]{8,64}$/); // compatible con valid_id() de app.py
});

// 2
test("2. no se puede avanzar sin completar objetivos", () => {
  const { flow } = makeFlow();
  assert.equal(flow.canAdvance(), false);
  assert.equal(flow.advance().code, "OBJECTIVES_PENDING");
  assert.equal(flow.completeStage("lito_welcome").code, "OBJECTIVES_PENDING");
  assert.equal(flow.getCurrentStage(), "lito_welcome");
});

// 3
test("3. un objetivo desconocido o con evidencia inválida es rechazado", () => {
  const { flow, storage } = makeFlow();
  const before = flow.getState().revision;
  assert.equal(flow.recordObjective("lito_welcome.fake", { source: "transmission" }).code, "UNKNOWN_OBJECTIVE");
  assert.equal(flow.recordObjective(42, {}).code, "INVALID_ARGUMENT");
  assert.equal(flow.recordObjective("lito_welcome.heard").code, "INVALID_EVIDENCE");
  assert.equal(flow.recordObjective("lito_welcome.heard", { source: "button" }).code, "INVALID_EVIDENCE");
  assert.equal(flow.recordObjective("profile.alias", { source: "avatar_form" }).code, "INVALID_EVIDENCE", "falta el alias");
  assert.equal(flow.recordObjective("profile.alias", { source: "avatar_form", alias: "ARIEL" }).code, "STAGE_LOCKED");
  assert.equal(flow.recordObjective("moon_exploration.eagle", { source: "x" }).code, "ARTIFACT_OBJECTIVE");
  assert.equal(flow.recordObjective("space_travel.arrive", { source: "travel_minigame" }).code, "STAGE_LOCKED");
  assert.equal(flow.getState().revision, before, "un rechazo no modifica el estado");
  assert.equal(JSON.parse(storage.box.flow).revision, before);
});

// 4
test("4. un evento repetido no duplica recompensas", () => {
  const { flow, writer } = makeFlow();
  playIntro(flow);
  assert.equal(flow.recordObjective("lito_welcome.heard", { source: "transmission" }).code, "ALREADY_COMPLETED");
  completeGroup(flow, def, "moon"); // Eagle, 5 muestras y placa (Acto I completo)
  const rev = flow.getState().revision;
  assert.equal(flow.registerDiscovery("eagle", M).code, "ALREADY_REGISTERED");
  assert.equal(flow.locateArtifact("eagle", { mechanic: "rover_proximity_scan" }).already, true);
  assert.equal(flow.inspectComponent("eagle", "legs", M).mode, "review");
  // Acto I completo: Eagle, 5 muestras y placa, cada uno registrado una sola vez.
  assert.ok(writer.calls.discoveries.includes("eagle"));
  assert.equal(writer.calls.discoveries.length, new Set(writer.calls.discoveries).size, "sin recompensas duplicadas");
  assert.deepEqual(writer.calls.acts.filter(a => a === "luna").length, 1);
  assert.equal(flow.getState().revision, rev);
});

// 5
test("5. no se puede completar una etapa futura", () => {
  const { flow } = makeFlow();
  assert.equal(flow.completeStage("footprints").code, "STAGE_LOCKED");
  assert.equal(flow.recordObjective("footprints.pair.eagle", { source: "matching_game" }).code, "STAGE_LOCKED");
  // Una etapa todavía prevista (las que quedan; se activan a medida que existen sus minijuegos).
  const plannedStage = def.STAGES.find(st => !st.implemented);
  if (plannedStage) assert.equal(flow.completeStage(plannedStage.id).code, "STAGE_NOT_IMPLEMENTED");
  assert.equal(flow.isStageCompleted("footprints"), false);
});

// 6
test("6. completar todos los objetivos permite avanzar", () => {
  const { flow } = makeFlow({}, {});
  const manual = createStarFlow({ definition: def, storage: memoryStorage(), now, idGen: () => "guest-manual01", autoAdvance: false });
  assert.equal(manual.recordObjective("lito_welcome.heard", { source: "welcome_skip" }).stageReady, true);
  assert.equal(manual.canAdvance(), true);
  const step = manual.advance();
  assert.deepEqual([step.ok, step.from, step.current], [true, "lito_welcome", "profile"]);
  // Con avance automático (configuración del juego) ocurre lo mismo al registrar el objetivo.
  assert.equal(flow.recordObjective("lito_welcome.heard", { source: "transmission" }).current, "profile");
});

// 7
test("7. una inspección incompleta no registra un artefacto", () => {
  const { flow, writer } = makeFlow();
  playIntro(flow);
  assert.equal(flow.beginInspection("eagle", M).code, "ARTIFACT_NOT_LOCATED");
  assert.equal(flow.locateArtifact("eagle", { mechanic: "journal_button" }).code, "INVALID_EVIDENCE");
  flow.locateArtifact("eagle", { mechanic: "rover_proximity_scan" });
  assert.equal(flow.inspectComponent("eagle", "legs", M).code, "INSPECTION_NOT_STARTED");
  flow.beginInspection("eagle", M);
  assert.equal(flow.inspectComponent("eagle", "antenna", M).code, "UNKNOWN_COMPONENT");
  assert.equal(flow.inspectComponent("eagle", "legs", { context: "mission" }).code, "INVALID_ARGUMENT");
  flow.inspectComponent("eagle", "structure", M);
  flow.inspectComponent("eagle", "legs", M);
  assert.equal(flow.registerDiscovery("eagle", M).code, "INSPECTION_INCOMPLETE");
  assert.equal(flow.getArtifact("eagle").state, "inspection_pending");
  assert.deepEqual(flow.listRegistered(), []);
  assert.deepEqual(writer.calls.discoveries, []);
  assert.equal(flow.getCurrentStage(), "moon_exploration");
});

// 8
test("8. la consulta de la bitácora no registra descubrimientos nuevos", () => {
  const { flow, writer } = makeFlow();
  playIntro(flow);
  flow.locateArtifact("eagle", { mechanic: "rover_proximity_scan" });
  assert.equal(flow.beginInspection("eagle", J).code, "NOT_REGISTERED");
  assert.equal(flow.beginInspection("eagle", { viewer: "fallback" }).code, "NOT_REGISTERED", "el contexto por defecto es bitácora");
  assert.equal(flow.inspectComponent("eagle", "legs", J).code, "NOT_REGISTERED");
  assert.equal(flow.registerDiscovery("eagle", { context: "journal" }).code, "CONSULT_ONLY");
  assert.equal(flow.registerDiscovery("eagle").code, "CONSULT_ONLY");
  assert.equal(flow.getArtifact("eagle").state, "located");
  // Un artefacto ya registrado se puede consultar sin efectos.
  discover(flow, "eagle", "rover_proximity_scan");
  const rev = flow.getState().revision;
  assert.equal(flow.beginInspection("eagle", J).mode, "consult");
  assert.equal(flow.inspectComponent("eagle", "ladder", { context: "journal", viewer: "fallback" }).mode, "consult");
  assert.equal(flow.getState().revision, rev);
  assert.deepEqual(writer.calls.discoveries, ["eagle"]);
});

// 9
test("9. guardar y recuperar conserva el estado", () => {
  const storage = memoryStorage();
  const { flow } = makeFlow(null, { storage });
  playIntro(flow);
  flow.locateArtifact("eagle", { mechanic: "rover_proximity_scan" });
  flow.beginInspection("eagle", M);
  flow.inspectComponent("eagle", "legs", M);
  const saved = flow.saveCheckpoint();
  assert.equal(saved.checkpoint.stage, "moon_exploration");
  const before = flow.getState();
  const { flow: again } = makeFlow(null, { storage });
  assert.deepEqual(again.getState(), before);
  assert.equal(again.getArtifact("eagle").components.join(), "legs");
  const resumed = again.resume();
  assert.deepEqual([resumed.stage, resumed.page], ["moon_exploration", "/luna"]);
});

// 10
test("10. los datos locales corruptos se manejan correctamente", () => {
  for (const raw of ["{no es json", JSON.stringify({ hola: 1 }), JSON.stringify([1, 2]),
    JSON.stringify({ schemaVersion: 99, player: { id: "guest-x0000001" }, completed: {}, objectives: {}, artifacts: {}, revision: 1 })]) {
    const storage = memoryStorage({ flow: raw, inventory: [{ id: "eagle", at: "2026-11-01T00:00:00Z" }], profile: { alias: "ARIEL" } });
    const { flow } = makeFlow(null, { storage });
    const state = flow.getState();
    assert.ok(state.recovered, "marca la recuperación");
    assert.equal(storage.box.backups[0], raw, "respalda el contenido original antes de reconstruir");
    assert.equal(state.artifacts.eagle.state, "registered", "reconstruye desde el respaldo heredado");
    assert.ok(flow.getCurrentStage());
  }
  // Datos con forma válida pero valores desconocidos: se apartan sin romper.
  const dirty = makeFlow().flow.getState();
  dirty.completed.etapa_inexistente = { at: "x" };
  dirty.artifacts.eagle = { state: "teletransportado", components: [] };
  dirty.artifacts.easep = { state: "inspection_pending", components: ["antenna", "antenna", "hack"] };
  const { flow } = makeFlow(null, { storage: memoryStorage({ flow: JSON.stringify(dirty) }) });
  const s = flow.getState();
  assert.equal(s.completed.etapa_inexistente, undefined);
  assert.equal(s.artifacts.eagle, undefined);
  assert.deepEqual(s.artifacts.easep.components, ["antenna"]);
  assert.deepEqual(s.legacy.unknown.stages, ["etapa_inexistente"]);
});

// 11
test("11. repetir una misión no elimina el progreso principal", () => {
  const { flow, writer } = makeFlow();
  playToFootprints(flow);
  assert.equal(flow.canReplay("footprints"), false, "solo contenido completado");
  assert.equal(flow.startReplay("footprints").code, "NOT_REPLAYABLE");
  playFootprints(flow);
  assert.equal(flow.isStageCompleted("footprints"), true);
  const snapshot = flow.getState();
  const actsBefore = writer.calls.acts.length;
  assert.equal(flow.startReplay("footprints").ok, true);
  assert.equal(flow.startReplay("moon_exploration").code, "REPLAY_ACTIVE");
  assert.equal(flow.recordObjective("footprints.pair.eagle", { source: "matching_game" }).replay, true);
  assert.equal(flow.recordObjective("footprints.pair.eagle", { source: "matching_game" }).code, "ALREADY_RECORDED");
  const done = flow.finishReplay();
  assert.deepEqual(done.summary.objectives, ["footprints.pair.eagle"]);
  const after = flow.getState();
  assert.deepEqual(after.completed, snapshot.completed);
  assert.deepEqual(after.objectives, snapshot.objectives);
  assert.deepEqual(after.artifacts, snapshot.artifacts);
  assert.equal(writer.calls.acts.length, actsBefore, "sin recompensas duplicadas");
  assert.equal(flow.finishReplay().code, "NO_REPLAY");
  assert.equal(flow.canReplay("chapter_reward"), false, "las recompensas no se repiten");
});

// 12
test("12. cambiar idioma conserva el estado", () => {
  // El controlador no lee ni guarda idioma: los identificadores son estables.
  // La prueba en navegador (tests/navegador/humo_flujo.py) cambia ES/EN de verdad.
  const storage = memoryStorage();
  const { flow } = makeFlow(null, { storage });
  playIntro(flow);
  const before = storage.box.flow;
  const { flow: reopened } = makeFlow(null, { storage });
  assert.equal(storage.box.flow.replace(/"updatedAt":"[^"]+"/, ""), before.replace(/"updatedAt":"[^"]+"/, ""));
  assert.equal(reopened.getCurrentStage(), "moon_exploration");
  assert.doesNotMatch(JSON.stringify(def.STAGES), /[áéíóúñ¿¡]/i, "sin textos traducibles en la lógica");
});

// 13
test("13. las etapas previstas no bloquean la versión actual", () => {
  const { flow, writer } = makeFlow();
  playToFootprints(flow);
  assert.equal(flow.getCurrentStage(), "footprints");
  playFootprints(flow);
  assert.equal(flow.getCurrentStage(), "chapter_reward");
  assert.equal(flow.checkPage("/bitacora").allowed, true);
  assert.equal(flow.recordObjective("chapter_reward.certificate", { source: "certificate_download" }).ok, true);
  assert.equal(flow.getCurrentStage(), null, "capítulo terminado");
  assert.deepEqual(["luna", "marte", "huellas"].map(flow.isActComplete), [true, true, true]);
  assert.deepEqual([...new Set(writer.calls.acts)].sort(), ["huellas", "luna", "marte"]);
  const planned = flow.getAvailableStages().filter(s => s.status === "planned").map(s => s.id);
  // Las etapas previstas se informan como «planned» y no bloquean el final del capítulo.
  assert.deepEqual(planned.sort(), def.STAGES.filter(st => !st.implemented).map(st => st.id).sort());
  for (const page of ["/astronauta", "/despegue", "/luna", "/marte", "/huellas"]) assert.equal(flow.checkPage(page).allowed, true, page);
});

// 14
test("14. el controlador rechaza transiciones inválidas", () => {
  const { flow } = makeFlow();
  assert.equal(flow.canEnter("etapa_falsa"), false);
  assert.equal(flow.completeStage("etapa_falsa").code, "UNKNOWN_STAGE");
  assert.equal(flow.getObjectives("etapa_falsa").code, "UNKNOWN_STAGE");
  assert.equal(flow.locateArtifact("moon_rock", { mechanic: "x" }).code, "UNKNOWN_ARTIFACT");
  // Un artefacto todavía previsto (el que quede: se activan a medida que existen sus minijuegos).
  const pending = Object.entries(def.ARTIFACTS).find(([, a]) => !a.implemented);
  if (pending) assert.equal(flow.locateArtifact(pending[0], { mechanic: pending[1].locate[0].mechanic }).code, "ARTIFACT_NOT_IMPLEMENTED");
  assert.equal(flow.locateArtifact("eagle", { mechanic: "rover_proximity_scan" }).code, "STAGE_LOCKED");
  playIntro(flow);
  assert.equal(flow.locateArtifact("blueberries", { mechanic: "mars_panel_scan" }).code, "STAGE_LOCKED", "Marte antes de la Luna");
  assert.equal(flow.pause().paused, true);
  assert.equal(flow.locateArtifact("eagle", { mechanic: "rover_proximity_scan" }).code, "PAUSED");
  assert.equal(flow.recordObjective("lito_welcome.heard", { source: "transmission" }).code, "PAUSED");
  assert.equal(flow.resume().stage, "moon_exploration");
  assert.equal(flow.locateArtifact("eagle", { mechanic: "rover_proximity_scan" }).ok, true);
  assert.equal(flow.beginInspection("eagle", { context: "admin" }).code, "INVALID_ARGUMENT");
  assert.equal(flow.markSynced(10 ** 6).code, "INVALID_ARGUMENT");
});

// Navegación (protección transitoria del frontend)
test("navegación: recargar o usar el historial no desbloquea contenido", () => {
  const storage = memoryStorage();
  const { flow } = makeFlow(null, { storage });
  assert.deepEqual(flow.checkPage("/huellas/"), { allowed: false, page: "/huellas", redirect: "/", stage: "lito_welcome" });
  assert.equal(flow.checkPage("/bitacora").allowed, true);
  assert.equal(flow.checkPage("/").allowed, true);
  playIntro(flow);
  const { flow: reloaded } = makeFlow(null, { storage });
  assert.equal(reloaded.checkPage("/luna").allowed, true);
  assert.deepEqual(reloaded.checkPage("/marte?x=1"), { allowed: false, page: "/marte", redirect: "/luna", stage: "moon_exploration" });
});

// Migración de partidas existentes
test("migración: conserva descubrimientos legítimos y no inventa equivalencias", () => {
  const storage = memoryStorage({
    inventory: [{ id: "eagle", at: "2026-11-02T10:00:00Z" }, { id: "alsep" }, { id: "lrrr" }, { id: "hem" }, "basura", { id: 7 }],
    acts: ["luna", "inventado"],
    profile: { alias: "ARIEL", avatar: "vice" }
  });
  const { flow, writer } = makeFlow(null, { storage });
  const s = flow.getState();
  assert.equal(s.artifacts.eagle.state, "registered");
  assert.equal(s.artifacts.eagle.legacy, true);
  assert.equal(s.artifacts.eagle.registeredAt, "2026-11-02T10:00:00Z");
  assert.equal(s.artifacts.reflector.state, "registered", "lrrr = retrorreflector de Apollo 11");
  assert.equal(s.artifacts.easep, undefined, "alsep (Apollo 15) no se convierte en EASEP");
  assert.deepEqual(s.legacy.unmapped.sort(), ["alsep", "basura", "hem"].sort());
  assert.deepEqual(s.legacy.acts, ["luna"]);
  // Marte empieza con la transición narrativa (Acto II).
  assert.equal(flow.getCurrentStage(), "mars_transition");
  assert.deepEqual(writer.calls.discoveries, [], "la migración no escribe artefactos nuevos en el inventario");
  // Ejecutar de nuevo es idempotente.
  const { flow: again } = makeFlow(null, { storage });
  assert.deepEqual(again.getState(), flow.getState());
});

// Sincronización idempotente (contrato de la Fase 2)
test("sincronización: operaciones con identificador único y confirmación por revisión", () => {
  const { flow } = makeFlow();
  playIntro(flow);
  const sync = flow.getSyncState();
  const ids = sync.pending.map(op => op.opId);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(sync.status, "local_only");
  const rev = flow.getState().revision;
  const confirmed = flow.markSynced(rev - 2);
  assert.equal(confirmed.sync.pending.length, 2);
  assert.equal(flow.markSynced(rev).sync.status, "synced");
  assert.equal(flow.markSynced(rev).sync.pending.length, 0, "confirmar dos veces es idempotente");
});

// Fase 1.1: regresar al menú (TIERRA) desde cualquier escena
test("regresar al menú no completa objetivos ni desbloquea artefactos", () => {
  const storage = memoryStorage();
  const { flow } = makeFlow(null, { storage });
  playIntro(flow);
  flow.locateArtifact("eagle", { mechanic: "rover_proximity_scan" });
  flow.beginInspection("eagle", M);
  flow.inspectComponent("eagle", "legs", M);
  const before = flow.getState();
  assert.equal(flow.checkPage("/").allowed, true, "la portada siempre es accesible");
  // Volver a la portada recarga el controlador desde el almacenamiento.
  const { flow: home } = makeFlow(null, { storage });
  assert.equal(home.checkPage("/").allowed, true);
  // Si el jugador vuelve a pulsar la transmisión, no hay efecto.
  assert.equal(home.recordObjective("lito_welcome.heard", { source: "transmission" }).code, "ALREADY_COMPLETED");
  assert.deepEqual(home.getState(), before);
  assert.equal(home.getArtifact("eagle").state, "inspection_pending");
  assert.equal(home.resume().stage, "moon_exploration", "el checkpoint sigue en la misión");
});

// Fase 1.1: «Continuar aventura»
test("continuar: jugador nuevo inicia; existente continúa en la etapa actual sin efectos", () => {
  const storage = memoryStorage();
  const { flow } = makeFlow(null, { storage });
  assert.deepEqual(flow.getEntryPoint(), { status: "new", stage: "profile", page: "/astronauta" });
  flow.recordObjective("lito_welcome.heard", { source: "welcome_skip" });
  assert.equal(flow.getEntryPoint().status, "new", "la bienvenida sola no inicia una partida");
  playIntro2(flow);
  const before = flow.getState();
  const entry = flow.getEntryPoint();
  assert.deepEqual(entry, { status: "in_progress", stage: "moon_exploration", page: "/luna" },
    "no vuelve al perfil ni al despegue");
  assert.deepEqual(flow.getState(), before, "consultar el punto de entrada no modifica nada");
  assert.equal(flow.checkPage(entry.page).allowed, true);
  assert.equal(flow.checkPage("/marte").allowed, false, "continuar no abre etapas futuras");
  completeGroup(flow, def, "moon"); // Eagle, 5 muestras y placa (Acto I completo)
  assert.deepEqual(flow.getEntryPoint(), { status: "in_progress", stage: "mars_transition", page: "/marte" });
});
function playIntro2(flow) {
  flow.recordObjective("profile.alias", { source: "avatar_form", alias: "ARIEL" });
  flow.recordObjective("cadet_custom.avatar", { source: "avatar_form", avatar: "vice" });
  assert.equal(flow.recordObjective("chapter_select.chapter1", { source: "chapter_menu" }).ok, true);
  assert.equal(flow.recordObjective("chapter_briefing.ready", { source: "chapter_briefing_sequence" }).ok, true);
  flow.recordObjective("launch.liftoff", { source: "launch_sequence" });
  for (const cp of [6,12,18]) assert.ok(flow.saveFlightCheckpoint(cp,0).ok);
  assert.ok(flow.recordObjective("space_travel.arrive",{source:"travel_minigame",seconds:24}).ok);
  flow.recordObjective("moon_landing.touchdown", { source: "descent_sequence" });
}

test("continuar: recorrido provisional terminado permite consultar sin reiniciar", () => {
  const { flow } = makeFlow();
  playToFootprints(flow);
  playFootprints(flow);
  flow.recordObjective("chapter_reward.certificate", { source: "certificate_download" });
  const before = flow.getState();
  assert.deepEqual(flow.getEntryPoint(), { status: "provisional_complete", stage: null, page: "/bitacora" });
  assert.deepEqual(flow.getState(), before);
  assert.equal(Object.keys(before.completed).length > 0, true, "nada se reinicia");
});

test("recompensas provisionales no se confunden con oficiales", () => {
  const { flow } = makeFlow();
  assert.deepEqual(["luna", "marte", "huellas"].map(flow.getActStatus), ["none", "none", "none"]);
  playToFootprints(flow);
  assert.equal(flow.getActStatus("luna"), "provisional", "Luna con etapas todavía previstas (prólogo lunar y diploma como etapa)");
  assert.equal(flow.getActStatus("marte"), "provisional");
  assert.equal(flow.getActStatus("huellas"), "none");
  playFootprints(flow);
  flow.recordObjective("chapter_reward.certificate", { source: "certificate_download" });
  // Huellas ya tiene todas sus etapas implementadas: su reconocimiento es oficial. Luna y Marte
  // conservan etapas previstas (prólogo lunar y diplomas como etapa) y siguen provisionales.
  assert.deepEqual(["luna", "marte", "huellas"].map(flow.getActStatus), ["provisional", "provisional", "official"]);
  assert.equal(flow.getChapterStatus(), "provisional_complete");
  assert.equal(flow.getActStatus("inventado"), "unknown");
  // Con todas las etapas implementadas y completadas, el estado pasa a oficial.
  const allDone = JSON.parse(JSON.stringify(def));
  for (const s of allDone.STAGES) { s.implemented = true; for (const o of s.objectives) o.implemented = true; }
  const st = flow.getState();
  for (const s of allDone.STAGES) st.completed[s.id] = { at: "x", via: "play" };
  const full = createStarFlow({ definition: allDone, storage: memoryStorage({ flow: JSON.stringify(st) }), now });
  assert.equal(full.getActStatus("luna"), "official");
  assert.equal(full.getChapterStatus(), "official_complete");
});

// Regresión: algunas integraciones antiguas conservaron Eagle registrado,
// pero perdieron los hitos narrativos de despegue y alunizaje.
test('partida previa con Eagle registrado recupera el alunizaje documentado, sin otorgar Marte', () => {
  const {flow,storage}=makeFlow();
  playIntro(flow);
  completeGroup(flow, def, "moon"); // Eagle, 5 muestras y placa (Acto I completo)
  const saved=JSON.parse(storage.box.flow);
  delete saved.completed.launch;
  delete saved.completed.moon_landing;
  saved.current='launch';
  const prior={flow:JSON.stringify(saved),profile:{alias:'ARIEL',avatar:'vice'}};
  const {flow:reopened}=makeFlow(prior);
  assert.equal(reopened.getArtifact('eagle').state,'registered');
  assert.equal(reopened.isStageCompleted('launch'),true);
  assert.equal(reopened.isStageCompleted('moon_landing'),true);
  assert.equal(reopened.isActComplete('luna'),true);
  assert.equal(reopened.canEnter('mars_transition'),true, 'el Acto II queda habilitado (empieza por la transición)');
  assert.equal(reopened.isActComplete('marte'),false);
  assert.equal(reopened.getArtifact('opportunity').state,'undiscovered');
});

test('la recuperación lunar no desbloquea misiones sin evidencia de Eagle',()=>{
  const {flow,storage}=makeFlow();
  playIntro(flow);
  const saved=JSON.parse(storage.box.flow);
  delete saved.completed.moon_landing;
  delete saved.objectives['moon_landing.touchdown'];
  saved.current='moon_landing';
  const {flow:reopened}=makeFlow({flow:JSON.stringify(saved),profile:{alias:'ARIEL'}});
  assert.equal(reopened.isStageCompleted('moon_landing'),false);
  assert.equal(reopened.canEnter('mars_exploration'),false);
  assert.equal(reopened.isActComplete('luna'),false);
});

// Integración (feature/integracion-visual + capítulos y vuelo): la recuperación lunar
// convive con las etapas agregadas después. Esas etapas se reconocen como legacy_access,
// nunca como juego real, y nada se otorga sin un alias válido.
test('integración: la recuperación lunar marca capítulo, presentación y vuelo solo como legacy_access', () => {
  const {flow,storage}=makeFlow();
  playIntro(flow);
  completeGroup(flow, def, "moon"); // Eagle, 5 muestras y placa (Acto I completo)
  const saved=JSON.parse(storage.box.flow);
  // Partida antigua: sin las etapas nuevas ni los hitos de despegue y alunizaje.
  for (const id of ['launch','moon_landing','chapter_select','chapter_briefing','space_travel']) delete saved.completed[id];
  for (const id of ['launch.liftoff','moon_landing.touchdown','chapter_select.chapter1','chapter_briefing.ready','space_travel.arrive']) delete saved.objectives[id];
  delete saved.checkpoint;
  saved.current='chapter_select';
  const {flow:reopened}=makeFlow({flow:JSON.stringify(saved),profile:{alias:'ARIEL',avatar:'vice'}});
  const st=reopened.getState();
  assert.equal(st.completed.launch.via,'registered_eagle_evidence');
  assert.equal(st.completed.moon_landing.via,'registered_eagle_evidence');
  for (const id of ['chapter_select','chapter_briefing','space_travel']) assert.equal(st.completed[id].via,'legacy_access',id);
  assert.equal(st.objectives['space_travel.arrive'],undefined,'no se inventa la victoria del vuelo');
  assert.equal(reopened.getArtifact('opportunity').state,'undiscovered');
  assert.notEqual(reopened.getChapterStatus(),'official_complete');
  // Sin alias válido no hay reparación.
  const {flow:invalid}=makeFlow({flow:JSON.stringify(saved),profile:{alias:' A ',avatar:'vice'}});
  assert.equal(invalid.isStageCompleted('launch'),false);
  assert.equal(invalid.canEnter('moon_exploration'),false);
});
