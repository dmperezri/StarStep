"use strict";
/*
 * StarStep · StarFlow — controlador central del flujo (Fase 1).
 *
 * Responsabilidades separadas:
 *   - Reglas de negocio ......... createStarFlow() (sin DOM, probado en Node).
 *   - Estado de progreso ........ objeto serializable "state" (contrato en docs/FLUJO_OFICIAL.md).
 *   - Persistencia .............. adaptador "storage" (en el navegador: StarProgress).
 *   - Presentación .............. bootstrap del navegador al final del archivo
 *                                 (guardas de página, enlaces condicionados y avisos).
 *
 * Ninguna función devuelve textos visibles: los resultados usan códigos
 * estables ({ok:false, code:'STAGE_LOCKED'}) y la interfaz los traduce con StarI18n.
 *
 * IMPORTANTE: todo lo que corre en el navegador puede ser manipulado por el
 * jugador. Estas reglas evitan saltos accidentales y errores de interfaz; la
 * validación definitiva corresponde a Flask (Fase 2).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.StarFlowCore = api;
})(typeof window !== "undefined" ? window : null, function () {

  const CONTEXTS = ["mission", "journal"];
  const VIEWERS = ["3d", "fallback"];
  const MAX_PENDING_OPS = 500;

  const isObject = v => v !== null && typeof v === "object" && !Array.isArray(v);
  const isId = v => typeof v === "string" && /^[a-z0-9_.-]{1,64}$/i.test(v);
  const clone = v => JSON.parse(JSON.stringify(v));
  const fail = (code, extra) => Object.assign({ ok: false, code }, extra);
  const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

  // Nombre del cadete: regla única para el formulario, el almacenamiento y el controlador.
  // Se normaliza (NFC: «é» compuesta o con tilde combinada es la misma letra) y se recorta
  // ANTES de validar. Permitidos: letras con tildes, ü y ñ, números, espacios internos,
  // guion y guion bajo; entre ALIAS_MIN y ALIAS_MAX caracteres ya recortados.
  const ALIAS_MIN = 2, ALIAS_MAX = 18;
  const ALIAS_CHARS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 _-]+$/;
  function normalizeAlias(value) {
    if (typeof value !== "string") return fail("ALIAS_EMPTY");
    const alias = value.normalize("NFC").trim();
    if (!alias) return fail("ALIAS_EMPTY");
    if (!ALIAS_CHARS.test(alias)) return fail("ALIAS_CHARS");
    if (alias.length < ALIAS_MIN || alias.length > ALIAS_MAX) return fail("ALIAS_LENGTH");
    return { ok: true, alias };
  }

  function defaultIdGen() {
    let out = "";
    try {
      const bytes = new Uint8Array(12);
      (globalThis.crypto || {}).getRandomValues(bytes);
      out = Array.from(bytes, b => b.toString(36).padStart(2, "0")).join("");
    } catch { out = Math.random().toString(36).slice(2) + Date.now().toString(36); }
    return "guest-" + out.slice(0, 20);
  }

  function createStarFlow(options) {
    const opts = options || {};
    const def = opts.definition;
    if (!def || !Array.isArray(def.STAGES)) throw new TypeError("StarFlow: definición inválida");
    const storage = opts.storage || {};
    const writer = opts.writer || null;
    const now = typeof opts.now === "function" ? opts.now : () => new Date().toISOString();
    const idGen = typeof opts.idGen === "function" ? opts.idGen : defaultIdGen;
    const onChange = typeof opts.onChange === "function" ? opts.onChange : () => {};
    const autoAdvance = opts.autoAdvance !== false;

    // ── Índices de la definición ────────────────────────────────
    const stages = def.STAGES;
    const stageIndex = new Map(stages.map((s, i) => [s.id, i]));
    const objectiveIndex = new Map();
    for (const s of stages) for (const ob of s.objectives) objectiveIndex.set(ob.id, s);
    const artifactsDef = def.ARTIFACTS;
    const stageById = id => (isId(id) && stageIndex.has(id) ? stages[stageIndex.get(id)] : null);
    const objectiveById = id => {
      const s = isId(id) ? objectiveIndex.get(id) : null;
      return s ? { stage: s, objective: s.objectives.find(x => x.id === id) } : null;
    };
    const artifactById = id => (isId(id) && own(artifactsDef, id) ? artifactsDef[id] : null);

    let state = null;

    // ── Estado nuevo y validación de forma ──────────────────────
    function freshState() {
      const t = now();
      return {
        schemaVersion: def.SCHEMA_VERSION,
        player: { id: idGen(), mode: "guest" },
        revision: 0,
        createdAt: t,
        updatedAt: t,
        current: null,
        completed: {},
        objectives: {},
        artifacts: {},
        checkpoint: null,
        paused: false,
        replay: null,
        sync: { status: "local_only", lastSyncedRevision: 0, pending: [] },
        legacy: { migratedAt: null, inventory: [], acts: [], unmapped: [] }
      };
    }

    function looksValid(s) {
      return isObject(s) && Number.isInteger(s.schemaVersion) && isObject(s.player) && isId(s.player.id) &&
        isObject(s.completed) && isObject(s.objectives) && isObject(s.artifacts) && Number.isInteger(s.revision);
    }

    // Elimina lo que no pertenece a la definición sin perderlo (pasa a legacy.unknown).
    function sanitize(s) {
      const unknown = { stages: [], objectives: [], artifacts: [] };
      for (const id of Object.keys(s.completed)) if (!stageById(id)) { unknown.stages.push(id); delete s.completed[id]; }
      for (const id of Object.keys(s.objectives)) if (!objectiveById(id)) { unknown.objectives.push(id); delete s.objectives[id]; }
      for (const id of Object.keys(s.artifacts)) {
        const a = s.artifacts[id];
        if (!artifactById(id) || !isObject(a) || !def.ARTIFACT_STATES.includes(a.state)) { unknown.artifacts.push(id); delete s.artifacts[id]; continue; }
        const valid = new Set(artifactsDef[id].components.map(x => x.id));
        a.components = Array.isArray(a.components) ? [...new Set(a.components.filter(x => valid.has(x)))] : [];
      }
      s.legacy = isObject(s.legacy) ? s.legacy : { migratedAt: null, inventory: [], acts: [], unmapped: [] };
      if (unknown.stages.length || unknown.objectives.length || unknown.artifacts.length) s.legacy.unknown = unknown;
      s.sync = isObject(s.sync) ? s.sync : { status: "local_only", lastSyncedRevision: 0, pending: [] };
      if (!Array.isArray(s.sync.pending)) s.sync.pending = [];
      s.paused = s.paused === true;
      if (s.replay && !(isObject(s.replay) && stageById(s.replay.stage))) s.replay = null;
      if (s.checkpoint && !(isObject(s.checkpoint) && stageById(s.checkpoint.stage))) s.checkpoint = null;
      return s;
    }

    // ── Migración desde progreso.js (inventario, actos y perfil) ─
    function migrateLegacy(s) {
      const read = fn => { try { return typeof fn === "function" ? fn() : null; } catch { return null; } };
      const inventory = read(storage.legacyInventory);
      const acts = read(storage.legacyActs);
      const profile = read(storage.legacyProfile);
      const t = now();
      s.legacy.migratedAt = t;

      for (const item of Array.isArray(inventory) ? inventory : []) {
        const raw = isObject(item) ? item.id : item;
        if (typeof raw !== "string") continue;
        s.legacy.inventory.push(raw);
        let id = raw;
        if (!artifactById(id)) id = own(def.LEGACY_ALIASES, raw) ? def.LEGACY_ALIASES[raw] : null;
        if (!id) { s.legacy.unmapped.push(raw); continue; }
        if (s.artifacts[id]?.state === "registered") continue;
        // Descubrimiento legítimo previo: se conserva. Nunca se crean artefactos nuevos.
        s.artifacts[id] = { state: "registered", components: [], legacy: true,
          registeredAt: (isObject(item) && typeof item.at === "string") ? item.at : t };
      }

      const validActs = (Array.isArray(acts) ? acts : []).filter(a => own(def.ACTS, a));
      s.legacy.acts = [...new Set(validActs)];
      const mark = id => { const st = stageById(id); if (st && st.implemented && !s.completed[id]) s.completed[id] = { at: t, via: "legacy_migration" }; };
      const hasProfile = isObject(profile) && typeof profile.alias === "string" && profile.alias.trim().length >= 2;
      if (hasProfile || validActs.length) ["lito_welcome", "profile", "cadet_custom"].forEach(mark);
      if (validActs.length || Object.values(s.artifacts).some(a => a.state === "registered")) ["launch", "moon_landing"].forEach(mark);
      for (const act of validActs) for (const st of stages) if (st.act === act) mark(st.id);
      return s;
    }

    // ── Reglas de avance ────────────────────────────────────────
    const isCompleted = id => !!(state && own(state.completed, id));

    function canEnter(stageId) {
      const st = stageById(stageId);
      if (!st || !st.implemented) return false;
      const idx = stageIndex.get(stageId);
      for (let i = 0; i < idx; i++) {
        const prev = stages[i];
        if (prev.implemented && !isCompleted(prev.id)) return false;
      }
      return true;
    }

    function computeCurrent() {
      for (const st of stages) if (st.implemented && !isCompleted(st.id)) return st.id;
      return null;
    }

    function objectiveDone(ob) {
      if (ob.type === "artifact") return state.artifacts[ob.artifact]?.state === "registered";
      return own(state.objectives, ob.id);
    }

    const requiredObjectives = st => st.objectives.filter(ob => ob.implemented);
    const stageReady = st => requiredObjectives(st).every(objectiveDone);

    // Un artefacto puede trabajarse en su etapa actual o ya completada; nunca en una futura.
    function artifactStageValid(a) {
      const st = stageById(a.stage);
      return !!st && st.implemented && canEnter(st.id);
    }

    // ── Persistencia y sincronización ───────────────────────────
    function commit(type, payload) {
      state.revision += 1;
      state.updatedAt = now();
      const op = { opId: `${state.player.id}:${state.revision}`, type, payload, at: state.updatedAt, revision: state.revision };
      state.sync.pending.push(op);
      if (state.sync.pending.length > MAX_PENDING_OPS) state.sync.pending.splice(0, state.sync.pending.length - MAX_PENDING_OPS);
      if (state.sync.status === "synced") state.sync.status = "pending";
      persist();
      try { onChange({ type, payload, revision: state.revision }); } catch { /* la UI nunca rompe la lógica */ }
    }

    // Si el respaldo local falla (cuota, modo privado) el estado sigue en memoria.
    function persist() {
      try { storage.save?.(clone(state)); state.storageError = false; }
      catch { state.storageError = true; }
    }

    function syncActs() {
      for (const act of Object.keys(def.ACTS)) {
        if (isActComplete(act)) try { writer?.commitAct?.(act); } catch { /* respaldo local opcional */ }
      }
    }

    // Acto completo en el RECORRIDO PROVISIONAL: todas sus etapas implementadas.
    function isActComplete(act) {
      if (!own(def.ACTS, act)) return false;
      const list = stages.filter(s => s.act === act && s.implemented);
      return list.length > 0 && list.every(s => isCompleted(s.id));
    }

    /*
     * Recompensas: 'provisional' = solo con lo implementado hoy; 'official' = todas las
     * etapas del acto (también las previstas) completadas. Mientras exista una etapa
     * prevista en el acto, nunca puede ser oficial.
     */
    function getActStatus(act) {
      if (!own(def.ACTS, act)) return "unknown";
      if (!isActComplete(act)) return "none";
      return stages.filter(s => s.act === act).every(s => s.implemented && isCompleted(s.id)) ? "official" : "provisional";
    }

    function getChapterStatus() {
      if (computeCurrent() !== null) return "in_progress";
      return stages.every(s => s.implemented && isCompleted(s.id) && state.completed[s.id].via !== "legacy_access") ? "official_complete" : "provisional_complete";
    }

    /*
     * Punto de entrada para «Continuar aventura». Solo lectura: no completa, no avanza
     * y no desbloquea nada. Devuelve la página de la etapa actual (siempre accesible).
     * La posición exacta dentro de la escena (p. ej. el rover) todavía no se guarda.
     */
    function getEntryPoint() {
      if (!isCompleted("profile")) return { status: "new", stage: "profile", page: stageById("profile")?.page || "/astronauta" };
      const cur = computeCurrent();
      if (cur === null) return { status: getChapterStatus(), stage: null, page: "/bitacora" };
      return { status: "in_progress", stage: cur, page: stageById(cur).page };
    }

    function updateCheckpoint() {
      const cur = state.current;
      const curIdx = cur ? stageIndex.get(cur) : stages.length - 1;
      for (let i = curIdx; i >= 0; i--) {
        const st = stages[i];
        if (st.checkpoint && st.implemented && canEnter(st.id)) {
          if (!state.checkpoint || state.checkpoint.stage !== st.id) state.checkpoint = { stage: st.id, at: now() };
          return state.checkpoint;
        }
      }
      return state.checkpoint;
    }

    // Completa en orden las etapas cuyos objetivos ya están cumplidos.
    function reconcile(via) {
      let changed = false;
      for (let guard = 0; guard < stages.length; guard++) {
        const cur = computeCurrent();
        const st = cur && stageById(cur);
        if (!st || !stageReady(st) || requiredObjectives(st).length === 0) break;
        state.completed[cur] = { at: now(), via };
        changed = true;
      }
      state.current = computeCurrent();
      updateCheckpoint();
      return changed;
    }

    function load() {
      let raw = null;
      try { raw = storage.load?.() ?? null; } catch { raw = null; }
      let parsed = raw;
      if (typeof raw === "string") { try { parsed = JSON.parse(raw); } catch { parsed = undefined; } }
      if (parsed === null) {
        state = migrateLegacy(freshState());
      } else if (!looksValid(parsed) || parsed.schemaVersion > def.SCHEMA_VERSION) {
        try { storage.backup?.(typeof raw === "string" ? raw : JSON.stringify(raw)); } catch { /* sin espacio */ }
        state = migrateLegacy(freshState());
        state.recovered = { at: now(), reason: parsed === undefined ? "invalid_json" : "invalid_shape" };
      } else {
        state = sanitize(parsed);
      }
      // Compatibilidad: un lanzamiento ya registrado prueba que la partida antigua
      // había entrado al único capítulo disponible. No inventar objetivos ni premios.
      if (isCompleted("launch")) {
        for (const id of ["chapter_select", "chapter_briefing"]) {
          if (stageById(id)?.implemented && !isCompleted(id)) {
            state.completed[id] = { at: state.completed.launch.at || now(), via: "legacy_access" };
          }
        }
      }
      // Las partidas que aterrizaron antes de incorporar el vuelo conservan el acceso.
      // No se inventa una victoria ni se modifica el inventario.
      if (stageById("space_travel")?.implemented && isCompleted("moon_landing") && !isCompleted("space_travel")) {
        state.completed.space_travel = { at: state.completed.moon_landing.at || now(), via: "legacy_access" };
      }
      reconcile("reconcile");
      syncActs();
      persist();
      return state;
    }

    // ── API pública: estado y etapas ────────────────────────────
    function getState() { return clone(state); }
    function getCurrentStage() { return state.current; }
    function isStageCompleted(stageId) { return isCompleted(stageId); }

    function getObjectives(stageId) {
      const st = stageById(stageId);
      if (!st) return fail("UNKNOWN_STAGE");
      const inReplay = state.replay?.stage === stageId;
      return {
        ok: true, stage: stageId, implemented: st.implemented,
        objectives: st.objectives.map(ob => ({
          id: ob.id, type: ob.type, implemented: ob.implemented,
          artifact: ob.artifact || null,
          done: objectiveDone(ob),
          replayDone: inReplay ? own(state.replay.objectives, ob.id) : undefined
        }))
      };
    }

    function canAdvance() {
      const st = stageById(state.current);
      return !!st && stageReady(st);
    }

    function recordObjective(objectiveId, evidence) {
      if (!isId(objectiveId)) return fail("INVALID_ARGUMENT");
      const found = objectiveById(objectiveId);
      if (!found) return fail("UNKNOWN_OBJECTIVE");
      const { stage, objective } = found;
      if (objective.type === "artifact") return fail("ARTIFACT_OBJECTIVE");
      if (!stage.implemented || !objective.implemented) return fail("OBJECTIVE_NOT_IMPLEMENTED");
      if (state.paused) return fail("PAUSED");
      if (!isObject(evidence) || !objective.sources.includes(evidence.source)) return fail("INVALID_EVIDENCE");
      for (const key of objective.requires || []) {
        if (typeof evidence[key] !== "string" || !evidence[key].trim()) return fail("INVALID_EVIDENCE");
        if (key === "alias" && !normalizeAlias(evidence[key]).ok) return fail("INVALID_EVIDENCE");
      }
      const record = { at: now(), source: evidence.source };

      if (state.replay && state.replay.stage === stage.id) {
        if (own(state.replay.objectives, objectiveId)) return fail("ALREADY_RECORDED", { replay: true });
        state.replay.objectives[objectiveId] = record;
        commit("replay_objective", { objective: objectiveId, source: evidence.source });
        return { ok: true, replay: true };
      }
      if (isCompleted(stage.id)) return fail("ALREADY_COMPLETED");
      if (!canEnter(stage.id)) return fail("STAGE_LOCKED");
      if (state.current !== stage.id) return fail("NOT_CURRENT_STAGE");
      if (own(state.objectives, objectiveId)) return fail("ALREADY_RECORDED");
      if (objectiveId === "space_travel.arrive" && (state.checkpoint?.stage !== "space_travel" || state.checkpoint.flight?.seconds !== 18 || evidence.seconds !== 24)) return fail("INVALID_EVIDENCE");

      state.objectives[objectiveId] = record;
      commit("objective", { objective: objectiveId, source: evidence.source });
      const ready = stageReady(stage);
      let advanced = null;
      if (ready && autoAdvance) advanced = advance();
      return { ok: true, stageReady: ready, current: state.current, advanced: advanced?.ok ? advanced.current : null };
    }

    function completeStage(stageId) {
      const st = stageById(stageId);
      if (!st) return fail("UNKNOWN_STAGE");
      if (!st.implemented) return fail("STAGE_NOT_IMPLEMENTED");
      if (isCompleted(stageId)) return fail("ALREADY_COMPLETED");
      if (!canEnter(stageId)) return fail("STAGE_LOCKED");
      if (state.paused) return fail("PAUSED");
      if (!stageReady(st)) return fail("OBJECTIVES_PENDING", { pending: requiredObjectives(st).filter(ob => !objectiveDone(ob)).map(ob => ob.id) });
      state.completed[stageId] = { at: now(), via: "play" };
      commit("stage_completed", { stage: stageId });
      syncActs();
      return { ok: true, stage: stageId };
    }

    function advance() {
      const cur = state.current;
      const st = stageById(cur);
      if (!st) return fail("CHAPTER_FINISHED");
      if (!isCompleted(cur)) {
        const done = completeStage(cur);
        if (!done.ok) return done;
      }
      state.current = computeCurrent();
      updateCheckpoint();
      commit("advance", { from: cur, to: state.current });
      return { ok: true, from: cur, current: state.current };
    }

    // Solo almacena límites de tramo seguros, nunca una posición en pleno obstáculo.
    function getFlightCheckpoint() {
      const f = state.checkpoint?.stage === "space_travel" ? state.checkpoint.flight : null;
      return { seconds: [0, 6, 12, 18].includes(f?.seconds) ? f.seconds : 0,
        fails: Number.isSafeInteger(f?.fails) && f.fails >= 0 ? f.fails : 0 };
    }
    function saveFlightCheckpoint(seconds, fails) {
      if (state.current !== "space_travel" || state.replay || state.paused) return fail("NOT_CURRENT_STAGE");
      if (![0, 6, 12, 18].includes(seconds) || !Number.isSafeInteger(fails) || fails < 0) return fail("INVALID_ARGUMENT");
      const previous = getFlightCheckpoint();
      if (seconds < previous.seconds || seconds > previous.seconds + 6 || fails < previous.fails) return fail("INVALID_ARGUMENT");
      if (seconds === previous.seconds && fails === previous.fails) return { ok:true, checkpoint:previous };
      const cp = updateCheckpoint();
      cp.flight = { seconds, fails };
      commit("flight_checkpoint", { seconds, fails });
      return { ok:true, checkpoint:getFlightCheckpoint() };
    }

    function saveCheckpoint() {
      const cp = updateCheckpoint();
      commit("checkpoint", { stage: cp?.stage || null });
      return { ok: true, checkpoint: cp ? clone(cp) : null };
    }

    function pause() {
      if (state.paused) return { ok: true, paused: true };
      state.paused = true;
      commit("pause", {});
      return { ok: true, paused: true };
    }

    // Reanuda y devuelve el último checkpoint válido para recuperar la partida.
    function resume() {
      const wasPaused = state.paused;
      state.paused = false;
      const cp = updateCheckpoint();
      if (wasPaused) commit("resume", {});
      const stage = cp?.stage || state.current;
      return { ok: true, stage, current: state.current, page: stageById(stage)?.page || "/" };
    }

    function getAvailableStages() {
      return stages.map(st => ({
        id: st.id, group: st.group, page: st.page, implemented: st.implemented,
        status: !st.implemented ? "planned" : isCompleted(st.id) ? "completed" : st.id === state.current ? "current" : "locked",
        replayable: canReplay(st.id)
      }));
    }

    function canReplay(stageId) {
      const st = stageById(stageId);
      return !!st && st.implemented && st.kind !== "reward" && isCompleted(stageId);
    }

    function startReplay(stageId) {
      if (!stageById(stageId)) return fail("UNKNOWN_STAGE");
      if (state.replay) return fail("REPLAY_ACTIVE");
      if (!canReplay(stageId)) return fail("NOT_REPLAYABLE");
      state.replay = { stage: stageId, startedAt: now(), objectives: {} };
      commit("replay_start", { stage: stageId });
      return { ok: true, stage: stageId };
    }

    function finishReplay() {
      if (!state.replay) return fail("NO_REPLAY");
      const summary = { stage: state.replay.stage, objectives: Object.keys(state.replay.objectives) };
      state.replay = null;
      commit("replay_finish", summary);
      return { ok: true, summary };
    }

    // ── API pública: descubrimientos ────────────────────────────
    function artifactState(id) { return state.artifacts[id]?.state || "undiscovered"; }
    const stateRank = s => def.ARTIFACT_STATES.indexOf(s);

    function getArtifact(id) {
      const a = artifactById(id);
      if (!a) return fail("UNKNOWN_ARTIFACT");
      const rec = state.artifacts[id] || { state: "undiscovered", components: [] };
      return { ok: true, id, state: rec.state, components: [...(rec.components || [])],
        required: a.components.map(x => x.id), legacy: !!rec.legacy };
    }

    function listRegistered() {
      return Object.keys(state.artifacts).filter(id => state.artifacts[id].state === "registered");
    }

    function readContext(o) {
      const context = isObject(o) && o.context !== undefined ? o.context : "journal";
      return CONTEXTS.includes(context) ? context : null;
    }

    function locateArtifact(id, evidence) {
      const a = artifactById(id);
      if (!a) return fail("UNKNOWN_ARTIFACT");
      if (!a.implemented) return fail("ARTIFACT_NOT_IMPLEMENTED");
      if (state.paused) return fail("PAUSED");
      if (!isObject(evidence) || !a.locate.some(l => l.mechanic === evidence.mechanic)) return fail("INVALID_EVIDENCE");
      if (!artifactStageValid(a)) return fail("STAGE_LOCKED");
      if (stateRank(artifactState(id)) >= stateRank("located")) return { ok: true, state: artifactState(id), already: true };
      state.artifacts[id] = { state: "located", components: [], locatedAt: now(), mechanic: evidence.mechanic };
      commit("artifact_located", { artifact: id, mechanic: evidence.mechanic });
      return { ok: true, state: "located" };
    }

    function beginInspection(id, o) {
      const a = artifactById(id);
      if (!a) return fail("UNKNOWN_ARTIFACT");
      const context = readContext(o);
      if (!context || (o && o.viewer !== undefined && !VIEWERS.includes(o.viewer))) return fail("INVALID_ARGUMENT");
      const current = artifactState(id);
      if (context === "journal") {
        // La bitácora solo consulta lo ya registrado y nunca cambia el avance.
        return current === "registered" ? { ok: true, mode: "consult", state: current } : fail("NOT_REGISTERED");
      }
      if (current === "registered") return { ok: true, mode: "review", state: current };
      if (!a.implemented) return fail("ARTIFACT_NOT_IMPLEMENTED");
      if (state.paused) return fail("PAUSED");
      if (!artifactStageValid(a)) return fail("STAGE_LOCKED");
      if (current === "undiscovered") return fail("ARTIFACT_NOT_LOCATED");
      if (current === "located") {
        state.artifacts[id].state = "inspection_pending";
        commit("inspection_started", { artifact: id, viewer: o?.viewer || null });
      }
      return { ok: true, mode: "inspect", state: artifactState(id), components: [...state.artifacts[id].components],
        required: a.components.map(x => x.id) };
    }

    function inspectComponent(id, componentId, o) {
      const a = artifactById(id);
      if (!a) return fail("UNKNOWN_ARTIFACT");
      const context = readContext(o);
      if (!context || !isObject(o) || !VIEWERS.includes(o.viewer)) return fail("INVALID_ARGUMENT");
      if (!a.components.some(x => x.id === componentId)) return fail("UNKNOWN_COMPONENT");
      const current = artifactState(id);
      if (context === "journal") return current === "registered" ? { ok: true, mode: "consult", state: current } : fail("NOT_REGISTERED");
      if (current === "registered") return { ok: true, mode: "review", state: current };
      if (state.paused) return fail("PAUSED");
      if (!artifactStageValid(a)) return fail("STAGE_LOCKED");
      if (current === "undiscovered") return fail("ARTIFACT_NOT_LOCATED");
      if (current === "located") return fail("INSPECTION_NOT_STARTED");
      const rec = state.artifacts[id];
      const required = a.components.map(x => x.id);
      if (!rec.components.includes(componentId)) {
        rec.components.push(componentId);
        if (required.every(x => rec.components.includes(x))) { rec.state = "inspected"; rec.inspectedAt = now(); }
        commit("component_inspected", { artifact: id, component: componentId, viewer: o.viewer });
      }
      const result = { ok: true, mode: "inspect", state: rec.state, inspected: rec.components.length, total: required.length };
      if (rec.state === "inspected" && o.autoRegister !== false) {
        const reg = registerDiscovery(id, { context: "mission" });
        result.registered = reg.ok;
        result.state = artifactState(id);
      }
      return result;
    }

    function registerDiscovery(id, o) {
      const a = artifactById(id);
      if (!a) return fail("UNKNOWN_ARTIFACT");
      const context = readContext(o);
      if (!context) return fail("INVALID_ARGUMENT");
      if (context === "journal") return fail("CONSULT_ONLY");
      const current = artifactState(id);
      if (current === "registered") return fail("ALREADY_REGISTERED");
      if (!a.implemented) return fail("ARTIFACT_NOT_IMPLEMENTED");
      if (state.paused) return fail("PAUSED");
      if (!artifactStageValid(a)) return fail("STAGE_LOCKED");
      if (current === "undiscovered") return fail("ARTIFACT_NOT_LOCATED");
      if (current !== "inspected") return fail("INSPECTION_INCOMPLETE");
      const rec = state.artifacts[id];
      rec.state = "registered";
      rec.registeredAt = now();
      try { writer?.commitDiscovery?.(id, rec.registeredAt); } catch { /* el estado del flujo sigue siendo la referencia */ }
      commit("artifact_registered", { artifact: id });
      // El objetivo de la etapa se deriva del estado del artefacto.
      const st = stageById(a.stage);
      if (autoAdvance && st && state.current === st.id && stageReady(st)) advance();
      return { ok: true, state: "registered", current: state.current };
    }

    // ── Navegación (guardas transitorias del frontend) ──────────
    function normalizePath(path) {
      const p = String(path || "/").split(/[?#]/)[0].replace(/\/+$/, "");
      return p === "" ? "/" : p;
    }

    function checkPage(path) {
      const page = normalizePath(path);
      if ((def.OPEN_PAGES || []).includes(page)) return { allowed: true, page };
      const hosted = stages.filter(s => s.page === page && s.implemented);
      if (!hosted.length) return { allowed: true, page };
      if (hosted.some(s => canEnter(s.id))) return { allowed: true, page };
      const cp = updateCheckpoint();
      const target = stageById(state.current) || stageById(cp?.stage);
      return { allowed: false, page, redirect: target ? target.page : "/", stage: target ? target.id : null };
    }

    // ── Sincronización (contrato para la Fase 2) ────────────────
    function getSyncState() { return clone(state.sync); }
    function markSynced(revision) {
      if (!Number.isInteger(revision) || revision < 0 || revision > state.revision) return fail("INVALID_ARGUMENT");
      state.sync.pending = state.sync.pending.filter(op => op.revision > revision);
      state.sync.lastSyncedRevision = Math.max(state.sync.lastSyncedRevision, revision);
      state.sync.status = state.sync.pending.length ? "pending" : "synced";
      persist();
      return { ok: true, sync: getSyncState() };
    }

    load();

    return Object.freeze({
      // Estado y etapas
      getState, getCurrentStage, getObjectives, canEnter, canAdvance, isStageCompleted,
      recordObjective, completeStage, advance, saveCheckpoint, getFlightCheckpoint, saveFlightCheckpoint, resume, pause,
      getAvailableStages, canReplay, startReplay, finishReplay, isActComplete,
      getActStatus, getChapterStatus, getEntryPoint,
      // Descubrimientos
      getArtifact, listRegistered, locateArtifact, beginInspection, inspectComponent, registerDiscovery,
      // Navegación y sincronización
      checkPage, getSyncState, markSynced,
      reload: () => { load(); return getState(); }
    });
  }

  return { createStarFlow, normalizeAlias, ALIAS_MIN, ALIAS_MAX };
});

/* ── Bootstrap del navegador: presentación e integración con progreso.js ── */
(function () {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (!window.StarFlowDefinition || !window.StarFlowCore) { console.warn("StarFlow: falta flujo-definicion.js"); return; }
  const P = window.StarProgress;
  const memory = { value: null };
  const storage = P && typeof P.loadFlow === "function"
    ? { load: P.loadFlow, save: P.saveFlow, backup: P.backupFlow, legacyInventory: P.list, legacyActs: P.completed, legacyProfile: P.player }
    : { load: () => memory.value, save: v => { memory.value = v; } };
  const writer = P && typeof P.connectFlow === "function" ? P.connectFlow() : null;

  let flow;
  try {
    flow = window.StarFlowCore.createStarFlow({
      definition: window.StarFlowDefinition, storage, writer,
      onChange: detail => document.dispatchEvent(new CustomEvent("starflow:change", { detail }))
    });
  } catch (error) {
    console.error("StarFlow no pudo iniciar:", error);
    return;
  }

  const t = (key, vars) => (window.StarI18n ? window.StarI18n.t(key, vars) : key);
  let noticeTimer = 0, noticeKey = null;

  function notify(code, vars) {
    const key = "flow.notice." + code;
    noticeKey = { key, vars };
    const show = () => {
      let node = document.getElementById("flowNotice");
      if (!node) {
        node = document.createElement("p");
        node.id = "flowNotice"; node.className = "flow-notice"; node.setAttribute("role", "status");
        node.addEventListener("click", () => { node.hidden = true; noticeKey = null; }); // tocar para cerrar
        document.body.append(node);
      }
      node.textContent = t(key, vars);
      node.hidden = false;
      clearTimeout(noticeTimer);
      noticeTimer = setTimeout(() => { node.hidden = true; noticeKey = null; }, 5000);
    };
    if (document.body) show(); else document.addEventListener("DOMContentLoaded", show, { once: true });
  }

  document.addEventListener("starstep:language", () => {
    const node = document.getElementById("flowNotice");
    if (node && !node.hidden && noticeKey) node.textContent = t(noticeKey.key, noticeKey.vars);
  });

  // Apertura inicial vs. navegación interna. sessionStorage vive solo en esta pestaña:
  // una pestaña o sesión nueva del navegador es una apertura inicial del videojuego.
  // Es solo presentación: no se guarda en el estado del flujo ni otorga progreso.
  const SESSION_KEY = "starstep_sesion";
  let internalNavigation = false;
  try { internalNavigation = sessionStorage.getItem(SESSION_KEY) === "1"; sessionStorage.setItem(SESSION_KEY, "1"); }
  catch { internalNavigation = false; }
  // La bienvenida es obligatoria hasta completarse; después, volver al menú no la repite.
  function getHomeMode() {
    return internalNavigation && flow.isStageCompleted("lito_welcome") ? "menu" : "welcome";
  }
  // Apertura real del juego en esta pestaña (primera página de la sesión): la secuencia de
  // entrada muestra OUTSTRIP y el selector de idioma solo en este caso. Solo presentación.
  function isInitialOpening() { return !internalNavigation; }

  // NUEVA PARTIDA (sección 5.8): la portada reinició los datos, mostró la bienvenida breve
  // de LITO y dejó una marca de un solo uso en esta pestaña. Aquí se registra el único
  // objetivo que esa bienvenida cumple, y solo si la partida está recién creada (ningún
  // objetivo, etapa actual lito_welcome). La marca se consume siempre: no se reutiliza.
  // No completa perfil, cadete, capítulo ni misiones; no toca artefactos.
  if (P && typeof P.takeNewGameWelcome === "function" && P.takeNewGameWelcome()) {
    const fresh = flow.getCurrentStage() === "lito_welcome" && Object.keys(flow.getState().objectives || {}).length === 0;
    if (fresh) flow.recordObjective("lito_welcome.heard", { source: "new_game_welcome" });
  }

  // Guarda de página: recargar o usar el historial no desbloquea contenido.
  function guard() {
    const result = flow.checkPage(location.pathname);
    if (!result.allowed) location.replace(result.redirect + "?flujo=bloqueado");
    return result;
  }
  guard();
  window.addEventListener("pageshow", event => { if (event.persisted) guard(); });

  if (/[?&]flujo=bloqueado\b/.test(location.search)) {
    notify("blocked");
    try { history.replaceState(null, "", location.pathname); } catch { /* sin historial */ }
  }

  // Enlaces condicionados: <a data-flow-requires="stage_id">.
  document.addEventListener("click", event => {
    const link = event.target instanceof Element ? event.target.closest("a[data-flow-requires]") : null;
    if (!link) return;
    if (flow.canEnter(link.dataset.flowRequires)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    notify("locked");
  }, true);

  window.StarFlow = Object.freeze(Object.assign({}, flow, { notify, getHomeMode, isInitialOpening }));
})();
