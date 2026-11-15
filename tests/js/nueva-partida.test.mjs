// Pruebas de «Nueva partida» y de cómo se reconoce a un jugador nuevo (Fase 1.1).
// Ejecutar desde la raíz del repositorio:
//   node --test tests/js/
// Hoy no hay cuentas: un jugador = este navegador (LocalStorage). Un jugador es nuevo
// cuando no existe partida guardada ni datos heredados; entonces StarFlow crea un
// invitado con un identificador nuevo y getEntryPoint() devuelve status "new".
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { source, template, makeStore, newTab, openHome } from "./navegador-simulado.mjs";

const M = { context: "mission", viewer: "3d" };

// Juega como lo haría la interfaz: bienvenida, perfil, despegue, alunizaje y Eagle.
function playUntilEagle(page, alias = "ARIEL") {
  const { StarFlow, StarProgress } = page.ctx;
  StarFlow.recordObjective("lito_welcome.heard", { source: "welcome_skip" });
  StarProgress.setPlayer({ alias, avatar: "vice" });
  StarFlow.recordObjective("profile.alias", { source: "avatar_form", alias });
  StarFlow.recordObjective("cadet_custom.avatar", { source: "avatar_form", avatar: "vice" });
  StarFlow.recordObjective("launch.liftoff", { source: "launch_sequence" });
  StarFlow.recordObjective("moon_landing.touchdown", { source: "descent_sequence" });
  StarFlow.locateArtifact("eagle", { mechanic: "rover_proximity_scan" });
  StarFlow.beginInspection("eagle", M);
  for (const c of ["structure", "legs", "ladder"]) StarFlow.inspectComponent("eagle", c, M);
  StarProgress.setNotes("Notas del jugador anterior");
  page.ctx.localStorage.setItem("starstep_foto", "data:image/webp;base64,AAAA"); // como bitacora.js
  StarProgress.markCinematicSeen("history_intro"); // como la introducción histórica
}

test("jugador nuevo: sin datos guardados, StarFlow crea un invitado nuevo", () => {
  const tab = newTab();
  const home = openHome(tab);
  const { StarFlow, StarProgress } = home.ctx;
  assert.equal(StarFlow.getEntryPoint().status, "new");
  assert.equal(StarFlow.getHomeMode(), "welcome", "la bienvenida es obligatoria");
  assert.equal(StarProgress.hasPersonalData(), false, "no hay nada que borrar");
  assert.match(StarFlow.getState().player.id, /^guest-[a-z0-9]{8,}$/);
  assert.equal(StarFlow.getState().player.mode, "guest");
  // Otro navegador (otro LocalStorage) es otro jugador, con otro identificador.
  assert.notEqual(openHome(newTab()).ctx.StarFlow.getState().player.id, StarFlow.getState().player.id);
});

test("jugador existente: el mismo navegador conserva la partida y el identificador", () => {
  const tab = newTab();
  const first = openHome(tab);
  playUntilEagle(first);
  const id = first.ctx.StarFlow.getState().player.id;
  const again = openHome(tab);
  assert.equal(again.ctx.StarFlow.getState().player.id, id);
  assert.equal(again.ctx.StarFlow.getEntryPoint().status, "in_progress");
  assert.equal(again.ctx.StarProgress.hasPersonalData(), true);
});

test("nueva partida: borra todos los datos del jugador y conserva idioma y audio", () => {
  const tab = newTab({ starstep_lang: "en", starstep_audio: JSON.stringify({ music: false, fx: true, voice: false }) });
  const home = openHome(tab);
  playUntilEagle(home);
  const oldId = home.ctx.StarFlow.getState().player.id;
  assert.equal(home.ctx.StarFlow.getArtifact("eagle").state, "registered");
  for (const key of home.ctx.StarProgress.PLAYER_KEYS.filter(k => k !== "starstep_flujo_respaldo")) {
    assert.notEqual(tab.localStorage.getItem(key), null, `antes del reinicio existe ${key}`);
  }

  const result = home.ctx.StarProgress.resetPlayerData();
  assert.equal(result.ok, true);
  for (const key of home.ctx.StarProgress.PLAYER_KEYS) assert.equal(tab.localStorage.getItem(key), null, key);
  assert.equal(tab.localStorage.getItem("starstep_lang"), "en", "idioma conservado");
  assert.notEqual(tab.localStorage.getItem("starstep_audio"), null, "audio conservado");

  // La portada se recarga: el jugador es nuevo de verdad.
  const fresh = openHome(tab);
  const { StarFlow, StarProgress, StarI18n } = fresh.ctx;
  const state = StarFlow.getState();
  assert.notEqual(state.player.id, oldId, "identificador de invitado nuevo");
  assert.equal(StarFlow.getEntryPoint().status, "new");
  assert.equal(StarFlow.getHomeMode(), "welcome", "la bienvenida vuelve a ser obligatoria, aunque sea la misma sesión");
  assert.equal(JSON.stringify(state.completed), "{}");
  assert.equal(JSON.stringify(state.objectives), "{}");
  assert.equal(StarFlow.getArtifact("eagle").state, "undiscovered");
  assert.equal(state.legacy.inventory.length, 0, "no se migró nada del jugador anterior");
  assert.equal(JSON.stringify(StarProgress.list()), "[]");
  assert.equal(JSON.stringify(StarProgress.completed()), "[]");
  assert.equal(JSON.stringify(StarProgress.player()), "{}");
  assert.equal(StarProgress.getNotes(), "");
  assert.equal(StarProgress.hasPersonalData(), false);
  assert.equal(StarI18n.lang, "en");
  assert.equal(StarFlow.checkPage("/luna").allowed, false, "las misiones vuelven a estar bloqueadas");
});

test("nueva partida: se puede jugar otra vez y obtener resultados nuevos", () => {
  const tab = newTab();
  const first = openHome(tab);
  playUntilEagle(first, "ARIEL");
  first.ctx.StarProgress.resetPlayerData();
  const second = openHome(tab);
  playUntilEagle(second, "LUNA");
  assert.equal(second.ctx.StarProgress.player().alias, "LUNA");
  assert.equal(second.ctx.StarFlow.getArtifact("eagle").state, "registered");
  assert.equal(second.ctx.StarProgress.list().length, 1, "Eagle registrado una sola vez");
  assert.equal(second.ctx.StarFlow.getEntryPoint().page, "/marte");
  assert.equal(second.ctx.StarFlow.getState().legacy.inventory.length, 0);
});

test("por qué se borran juntos: dejar datos heredados reviviría al jugador anterior", () => {
  // Control: borrar solo el estado del flujo NO alcanza; la migración lo reconstruye.
  const tab = newTab();
  playUntilEagle(openHome(tab));
  tab.localStorage.removeItem("starstep_flujo");
  const revived = openHome(tab).ctx.StarFlow;
  assert.notEqual(revived.getEntryPoint().status, "new", "el perfil heredado reinicia la partida anterior");
  assert.equal(revived.getArtifact("eagle").state, "registered");
});

test("nueva partida: el controlador en memoria ya no puede guardar la partida borrada", () => {
  const tab = newTab();
  const home = openHome(tab);
  playUntilEagle(home);
  home.ctx.StarProgress.resetPlayerData();
  // Un evento tardío de la página anterior (antes de recargar) no escribe nada.
  home.ctx.StarFlow.recordObjective("mars_exploration.inexistente", { source: "x" });
  home.ctx.StarFlow.saveCheckpoint();
  home.ctx.StarProgress.setNotes("tarde");
  home.ctx.StarProgress.setPlayer({ alias: "TARDE" });
  for (const key of home.ctx.StarProgress.PLAYER_KEYS) assert.equal(tab.localStorage.getItem(key), null, key);
});

test("otra pestaña con la partida anterior vuelve a la portada y deja de guardar", () => {
  const local = makeStore();
  const tabA = { localStorage: local, sessionStorage: makeStore() };
  const tabB = { localStorage: local, sessionStorage: makeStore() };
  const pageA = openHome(tabA);
  playUntilEagle(pageA);
  const pageB = openHome(tabB); // por ejemplo, la bitácora abierta en otra pestaña

  // Cambios ajenos al reinicio no la afectan.
  pageB.fire("storage", { key: "starstep_lang", newValue: "en", storageArea: local });
  pageB.fire("storage", { key: "starstep_flujo", newValue: null, storageArea: tabB.sessionStorage });
  assert.equal(pageB.ctx.__navigated, undefined);

  pageA.ctx.StarProgress.resetPlayerData();
  pageB.fire("storage", { key: "starstep_flujo", oldValue: "{}", newValue: null, storageArea: local });
  assert.equal(pageB.ctx.__navigated, "/");
  pageB.ctx.StarFlow.saveCheckpoint();
  pageB.ctx.StarProgress.setNotes("pestaña vieja");
  for (const key of pageB.ctx.StarProgress.PLAYER_KEYS) assert.equal(local.getItem(key), null, key);

  // Borrar los datos del sitio desde el navegador (key === null) también la detiene.
  const pageC = openHome({ localStorage: makeStore(), sessionStorage: makeStore() });
  pageC.fire("storage", { key: null, newValue: null, storageArea: pageC.ctx.localStorage });
  assert.equal(pageC.ctx.__navigated, "/");
});

test("toda clave de almacenamiento está clasificada como dato del jugador o preferencia", () => {
  const P = openHome(newTab()).ctx.StarProgress;
  const known = new Set([...P.PLAYER_KEYS, ...P.PREFERENCE_KEYS, "starstep_sesion"]);
  const dir = new URL("../../static/js/", import.meta.url);
  const files = readdirSync(dir, { recursive: true }).filter(f => String(f).endsWith(".js"));
  const used = new Set();
  for (const f of files) for (const m of source(String(f).replaceAll("\\", "/")).matchAll(/starstep_[a-z_]+/g)) used.add(m[0]);
  for (const key of used) assert.ok(known.has(key), `${key} debe estar en PLAYER_KEYS o PREFERENCE_KEYS (progreso.js)`);
  assert.ok(P.PLAYER_KEYS.includes("starstep_foto"), "la foto de la bitácora es del jugador");
  assert.ok(!P.PLAYER_KEYS.includes("starstep_lang") && !P.PLAYER_KEYS.includes("starstep_audio"));
});

test("portada: botón NUEVA PARTIDA oculto por defecto y diálogo de confirmación bilingüe", () => {
  const html = template("index.html");
  // Independiente del formato de la plantilla (atributos en una o varias líneas).
  const tag = id => (html.match(new RegExp(`<[a-z]+[^>]*[\\s]id="${id}"[^>]*>`)) || [""])[0];
  assert.match(tag("newGame"), /data-i18n="newgame.button"/);
  assert.match(tag("newGame"), /\shidden\b/, "oculto por defecto");
  assert.match(tag("newGameDialog"), /role="alertdialog"/);
  assert.match(tag("newGameDialog"), /\shidden\b/);
  for (const id of ["newGameCancel", "newGameConfirm"]) assert.match(html, new RegExp(`id="${id}"`));
  for (const lang of ["es", "en"]) {
    const { StarI18n } = openHome(newTab({ starstep_lang: lang })).ctx;
    for (const key of ["newgame.button", "newgame.title", "newgame.body", "newgame.cancel", "newgame.confirm", "flow.notice.resetFailed"]) {
      assert.notEqual(StarI18n.t(key), key, `${lang}: falta ${key}`);
    }
  }
  const { StarI18n } = openHome(newTab({ starstep_lang: "en" })).ctx;
  assert.equal(StarI18n.t("newgame.button"), "NEW GAME");
});
