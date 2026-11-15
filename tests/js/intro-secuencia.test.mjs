// Pruebas de la secuencia de entrada de la portada (intro-secuencia.js).
// Ejecutar desde la raíz del repositorio:
//   node --test tests/js/*.test.mjs
// Simula la portada completa (main.js + progreso.js + StarFlow + intro-secuencia.js) en el
// navegador simulado, con temporizadores controlados y la voz registrada (sin audio real).
// Invariante central: durante OUTSTRIP, idioma, introducción y LITO el menú y la estación
// terrestre nunca están visibles. Se comprueba después de CADA clic y de CADA temporizador.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { template, makePage, makeStore, newTab, openHome, FakeElement } from "./navegador-simulado.mjs";

const require = createRequire(import.meta.url);
const { planEntry, SCENES, FADE_MS, NEW_GAME_MS, NEW_GAME_VOICE_GRACE_MS } = require("../../static/js/intro-secuencia.js");

// ── Planificador (puro) ─────────────────────────────────────────
test("plan: combina apertura real, intro vista y bienvenida completada", () => {
  const cases = [
    [{ initialOpening: true, historySeen: false, welcomeCompleted: false }, ["splash", "language", "history", "lito", "menu"]],
    // Tras elegir idioma la intro aparece siempre (con SALTAR si ya se vio).
    [{ initialOpening: true, historySeen: true, welcomeCompleted: false }, ["splash", "language", "history", "lito", "menu"]],
    [{ initialOpening: true, historySeen: false, welcomeCompleted: true }, ["splash", "language", "history", "menu"]],
    [{ initialOpening: true, historySeen: true, welcomeCompleted: true }, ["splash", "language", "history", "menu"]],
    [{ initialOpening: false, historySeen: false, welcomeCompleted: false }, ["history", "lito", "menu"]],
    [{ initialOpening: false, historySeen: true, welcomeCompleted: false }, ["lito", "menu"]],
    [{ initialOpening: false, historySeen: false, welcomeCompleted: true }, ["menu"]],
    [{ initialOpening: false, historySeen: true, welcomeCompleted: true }, ["menu"]]
  ];
  for (const [input, expected] of cases) assert.deepEqual(planEntry(input), expected, JSON.stringify(input));
  assert.deepEqual(planEntry(), ["splash", "language", "history", "lito", "menu"], "sin datos: secuencia completa");
  assert.equal(SCENES.length, 5);
  assert.ok(FADE_MS >= 350 && FADE_MS <= 500, `fundido de ${FADE_MS} ms`);
});

test("plan: sin recarga, menú directo exactamente cuando getHomeMode() === 'menu'", () => {
  for (const internal of [false, true]) {
    for (const welcome of [false, true]) {
      const tab = newTab();
      if (internal) tab.sessionStorage.setItem("starstep_sesion", "1");
      if (welcome) {
        const prep = newTab();
        openHome(prep).ctx.StarFlow.recordObjective("lito_welcome.heard", { source: "welcome_skip" });
        tab.localStorage = prep.localStorage;
      }
      const { StarFlow } = openHome(tab).ctx;
      const plan = planEntry({ initialOpening: StarFlow.isInitialOpening(), historySeen: true, welcomeCompleted: StarFlow.isStageCompleted("lito_welcome") });
      assert.equal(plan.length === 1 && plan[0] === "menu", StarFlow.getHomeMode() === "menu", `interna=${internal} bienvenida=${welcome}`);
    }
  }
});

// ── Portada simulada ────────────────────────────────────────────
const IDS = ["world", "menu", "adventureButton", "newGame", "replayIntro",
  "how", "music", "voice", "help", "closeHelp", "newGameDialog", "newGameCancel", "newGameConfirm",
  "introSequence", "introFade", "introSplash", "introLanguage", "introLanguageTitle", "introLanguageAlt", "introLangEs", "introLangEn",
  "introHistory", "introSceneCount", "introVoice", "introCanvas", "introCaption", "introSceneTitle", "introSceneText",
  "introSkip", "introNext", "introLito", "litoCanvas", "litoText", "litoReady", "litoVoice"];
const I18N = { litoReady: "lito.ready", adventureButton: "start", newGame: "newgame.button", replayIntro: "intro.replay",
  introSkip: "intro.skip", introNext: "intro.next" };
// Estado inicial de la plantilla: presentación visible (telón opaco), todo lo demás oculto.
const HIDDEN = ["menu", "newGame", "replayIntro", "help", "newGameDialog", "introSplash",
  "introLanguage", "introHistory", "introLito", "introSkip"];
const PRESENTATION = { introSplash: "splash", introLanguage: "language", introHistory: "history", introLito: "lito" };

function openIndex(tab, { reload = false, reducedMotion = false } = {}) {
  const el = {};
  for (const id of IDS) {
    el[id] = new FakeElement(/canvas|world/i.test(id) ? "canvas" : "div", { id, dataset: I18N[id] ? { i18n: I18N[id] } : {} });
    el[id].hidden = HIDDEN.includes(id);
  }
  el.introFade.dataset.state = "in";
  el.introLangEs.dataset.introLang = "es";
  el.introLangEn.dataset.introLang = "en";
  const ops = [];
  const fake2d = { set fillStyle(v) { ops.push(v); }, fillRect() {}, clearRect() {}, imageSmoothingEnabled: false };
  el.world.getContext = () => ({});
  el.introCanvas.getContext = () => fake2d;
  el.litoCanvas.getContext = () => fake2d;
  const hudEs = new FakeElement("button", { dataset: { lang: "es" } }), hudEn = new FakeElement("button", { dataset: { lang: "en" } });
  const barEs = new FakeElement("button", { dataset: { lang: "es" } }), barEn = new FakeElement("button", { dataset: { lang: "en" } });
  const page = makePage({ path: "/", tab, elements: [...Object.values(el), hudEs, hudEn, barEs, barEn], bodyClasses: ["star-page", "home-page", "is-entering"] });
  const body = page.document.body;
  const timers = [], frames = [], speech = [], warnings = [], violations = [];
  let focused = null, earthDraws = 0;
  for (const node of Object.values(el)) node.ownerFocus = n => { focused = n; };

  // ¿Qué ve el jugador? La presentación tapa todo mientras el contenedor esté visible y no
  // esté en modo «revelar»; el escenario terrestre y el menú solo se ven sin is-entering.
  const stageVisible = () => !body.classList.contains("is-entering");
  const menuVisible = () => stageVisible() && !el.menu.hidden;
  const screensVisible = () => el.introSequence.hidden ? [] : Object.keys(PRESENTATION).filter(id => !el[id].hidden);
  const visible = () => [...screensVisible(), ...(menuVisible() ? ["menu"] : [])];
  function check(where) {
    const screens = screensVisible();
    const step = page.ctx.StarIntro?.step;
    if (screens.length > 1) violations.push(`${where}: dos pantallas a la vez ${screens}`);
    if (screens.length && (menuVisible() || stageVisible())) violations.push(`${where}: menú/escenario visible durante ${screens}`);
    if (step && step !== "menu" && (menuVisible() || stageVisible())) violations.push(`${where}: menú/escenario visible en el paso ${step}`);
  }

  Object.assign(page.ctx, {
    setTimeout: (fn, ms = 0) => { timers.push({ fn, ms }); return timers.length; },
    clearTimeout: id => { if (timers[id - 1]) timers[id - 1].cancelled = true; },
    requestAnimationFrame: fn => { frames.push(fn); return frames.length; },
    cancelAnimationFrame() {},
    matchMedia: query => ({ matches: reducedMotion && /reduce/.test(query) }),
    performance: { getEntriesByType: () => [{ type: reload ? "reload" : "navigate" }] },
    console: { ...console, warn: (...a) => warnings.push(a.join(" ")) },
    StarArt: { earthScene: () => { earthDraws++; }, launchScene: () => ops.push("launch"), descentScene: () => ops.push("descent"), lito: () => ops.push("lito") },
    StarSound: {
      voiceOn: true, musicOn: true, inits: 0, music: 0,
      init() { this.inits++; return true; }, startMusic() { this.music++; }, stopMusic() {}, effect() {}, stopAll() {},
      stopVoice() { speech.push({ stop: true }); },
      speak(text, opts = {}) { speech.push({ text, lito: !!opts.lito, lang: page.ctx.StarI18n.lang }); },
      setVoice(v) { this.voiceOn = !!v; }, setMusic(v) { this.musicOn = !!v; }
    }
  });
  page.load("progreso.js", "flujo-definicion.js", "flujo.js", "main.js", "intro-secuencia.js").ready();
  check("carga");

  // Ejecuta los temporizadores pendientes (fundidos); el del splash solo si se pide.
  function runTimers(includeLong) {
    for (let guard = 0; guard < 200; guard++) {
      const index = timers.findIndex(x => !x.cancelled && !x.done && (includeLong || x.ms < 1000));
      if (index < 0) return;
      timers[index].done = true;
      timers[index].fn();
      check(`temporizador ${timers[index].ms} ms`);
      if (includeLong) includeLong = false;   // un solo temporizador largo por llamada
    }
  }
  const settle = () => runTimers(false);
  settle();
  const click = node => { node.click(); check(`clic ${node.id || node.dataset.lang}`); };
  return Object.assign(page, {
    el, timers, speech, warnings, frames, ops, violations, body,
    focused: () => focused,
    earthDraws: () => earthDraws,
    visible, stageVisible, menuVisible, settle,
    step: () => page.ctx.StarIntro.step,
    curtain: () => el.introFade.dataset.state,
    // Avanza el splash (temporizador largo) y completa el fundido.
    flushSplash() {
      assert.ok(timers.some(x => !x.cancelled && !x.done && x.ms >= 1000), "hay temporizador del splash");
      runTimers(true); settle();
    },
    // Clic y fundido completo (como un jugador que espera la transición).
    tap(node) { click(node); settle(); },
    // Clic sin esperar el fundido.
    tapNow(node) { click(node); },
    spoken: () => speech.filter(s => !s.stop),
    barLang(lang) { click(lang === "en" ? barEn : barEs); settle(); },
    runFrames() { const pending = frames.splice(0); for (const fn of pending) fn(1000); }
  });
}

function playFullSequence(page, lang = "es") {
  page.flushSplash();
  page.tap(lang === "en" ? page.el.introLangEn : page.el.introLangEs);
  for (let i = 0; i < SCENES.length; i++) page.tap(page.el.introNext);
  if (page.step() === "lito") page.tap(page.el.litoReady);
}

// Nunca dos narraciones superpuestas: antes de cada voz se detiene la anterior.
function assertNoOverlappingVoice(page) {
  let speaking = false;
  for (const entry of page.speech) {
    if (entry.stop) { speaking = false; continue; }
    assert.equal(speaking, false, `voz superpuesta: «${entry.text.slice(0, 30)}…»`);
    speaking = true;
  }
}

const TEXT = {
  es: { first: "La curiosidad humana", last: "Tu historia comienza", ready: "¡ESTOY LISTO!", lito: /^¡Hola, cadete! Soy LITO/, next: "SIGUIENTE", start: "INICIAR AVENTURA", replay: "VER INTRODUCCIÓN" },
  en: { first: "Human curiosity", last: "Your story begins", ready: "I'M READY!", lito: /^Hello, cadet! I'm LITO/, next: "NEXT", start: "START ADVENTURE", replay: "WATCH INTRO" }
};

for (const lang of ["es", "en"]) {
  test(`apertura real, jugador nuevo [${lang}]: secuencia continua sin el menú hasta el final`, () => {
    const tab = newTab();
    const page = openIndex(tab);
    // Primer renderizado: escenario oculto; OUTSTRIP aparece desde el telón azul noche.
    assert.equal(page.stageVisible(), false);
    assert.deepEqual(page.visible(), ["introSplash"]);
    assert.equal(page.curtain(), "out");
    const splash = page.timers.find(x => x.ms >= 2000 && !x.done);
    assert.ok(splash.ms >= 2000 && splash.ms <= 4000 + FADE_MS, `duración ${splash.ms} ms`);
    assert.equal(page.spoken().length, 0, "el splash no narra (aún no hubo gesto del jugador)");
    page.flushSplash();
    assert.deepEqual(page.visible(), ["introLanguage"]);
    page.tap(lang === "en" ? page.el.introLangEn : page.el.introLangEs);
    assert.equal(tab.localStorage.getItem("starstep_lang"), lang);
    assert.deepEqual(page.visible(), ["introHistory"]);
    assert.equal(page.el.introSkip.hidden, true, "sin SALTAR la primera vez");
    assert.equal(page.el.introSceneTitle.textContent, TEXT[lang].first);
    assert.equal(page.el.introNext.textContent, TEXT[lang].next);
    page.tap(page.el.introSkip);
    assert.equal(page.step(), "history", "SALTAR no funciona si no se vio");
    for (let i = 1; i < SCENES.length; i++) page.tap(page.el.introNext);
    assert.equal(page.el.introSceneTitle.textContent, TEXT[lang].last);
    page.tap(page.el.introNext);
    assert.equal(page.ctx.StarProgress.hasSeenCinematic("history_intro"), true);
    // LITO en su propia pantalla de la presentación, no sobre la estación terrestre.
    assert.deepEqual(page.visible(), ["introLito"]);
    assert.equal(page.stageVisible(), false);
    assert.match(page.el.litoText.dataset.fullText, TEXT[lang].lito);
    assert.equal(page.el.litoReady.textContent, TEXT[lang].ready);
    assert.equal(page.spoken().at(-1).lito, true);
    assert.equal(page.focused(), page.el.litoReady);
    page.tap(page.el.litoReady);
    // Recién ahora: estación terrestre y menú.
    assert.deepEqual(page.visible(), ["menu"]);
    assert.equal(page.stageVisible(), true);
    assert.equal(page.el.introSequence.hidden, true, "la presentación ya no intercepta clics");
    assert.equal(page.el.adventureButton.textContent, TEXT[lang].start);
    assert.equal(page.el.replayIntro.textContent, TEXT[lang].replay);
    assert.deepEqual(page.violations, []);
    assertNoOverlappingVoice(page);
    assert.deepEqual(page.warnings, []);
  });
}

test("el menú y el escenario nunca son visibles antes de terminar la presentación (todas las rutas)", () => {
  const scenarios = {
    "jugador nuevo": tab => tab,
    "intro vista, LITO pendiente": tab => { openHome(tab).ctx.StarProgress.markCinematicSeen("history_intro"); return tab; },
    "LITO hecha, intro pendiente": tab => { openHome(tab).ctx.StarFlow.recordObjective("lito_welcome.heard", { source: "welcome_skip" }); return tab; }
  };
  for (const [name, prepare] of Object.entries(scenarios)) {
    for (const reducedMotion of [false, true]) {
      const tab = prepare(newTab());
      const page = openIndex({ localStorage: tab.localStorage, sessionStorage: makeStore() }, { reducedMotion });
      playFullSequence(page);
      assert.equal(page.step(), "menu", name);
      assert.deepEqual(page.violations, [], `${name} (movimiento reducido: ${reducedMotion})`);
    }
  }
});

test("fundido a azul noche entre etapas: telón opaco durante el cambio, clics ignorados", () => {
  const page = openIndex(newTab());
  page.flushSplash();
  page.tapNow(page.el.introLangEs);            // sin esperar el fundido
  assert.equal(page.curtain(), "in", "telón opaco");
  assert.equal(page.ctx.StarIntro.transitioning, true);
  const fade = page.timers.filter(x => !x.done && !x.cancelled);
  assert.ok(fade.every(x => x.ms === FADE_MS), "fundido de ~420 ms");
  page.tapNow(page.el.introLangEn);            // doble clic durante el fundido
  page.settle();
  assert.equal(page.step(), "history");
  assert.equal(page.ctx.StarI18n.lang, "es", "el segundo clic se ignoró");
  page.tapNow(page.el.introNext);
  assert.equal(page.el.introSceneCount.textContent, "2 / 5");
  // Pasar de la última escena a LITO: durante el fundido sigue viéndose la intro, nunca el menú.
  for (let i = 2; i < SCENES.length; i++) page.tap(page.el.introNext);
  page.tapNow(page.el.introNext);
  assert.equal(page.curtain(), "in");
  assert.equal(page.menuVisible(), false);
  page.tapNow(page.el.introNext);              // ignorado durante el fundido
  page.settle();
  assert.equal(page.step(), "lito");
  assert.deepEqual(page.violations, []);
});

test("movimiento reducido: cambios inmediatos, sin temporizadores de fundido", () => {
  const page = openIndex(newTab(), { reducedMotion: true });
  const splash = page.timers.find(x => x.ms >= 1000 && !x.done);
  assert.ok(splash.ms <= 1600, `splash breve: ${splash.ms} ms`);
  page.flushSplash();
  page.tapNow(page.el.introLangEs);
  assert.equal(page.step(), "history", "sin esperar fundido");
  assert.equal(page.curtain(), "out");
  assert.equal(page.timers.filter(x => !x.done && !x.cancelled && x.ms === FADE_MS).length, 0);
});

test("la estación terrestre solo se anima al entrar al menú (sin animaciones superpuestas)", () => {
  const page = openIndex(newTab());
  page.flushSplash();
  page.tap(page.el.introLangEs);
  page.runFrames();
  assert.equal(page.earthDraws(), 0, "sin dibujar la Tierra durante la intro");
  for (let i = 0; i < SCENES.length; i++) page.tap(page.el.introNext);
  page.runFrames();
  assert.equal(page.earthDraws(), 0, "tampoco durante LITO");
  page.tap(page.el.litoReady);
  page.runFrames();
  assert.ok(page.earthDraws() > 0, "al entrar al menú sí");
});

test("la secuencia solo completa la bienvenida: no avanza etapas ni registra artefactos", () => {
  const page = openIndex(newTab());
  playFullSequence(page);
  const state = page.ctx.StarFlow.getState();
  assert.deepEqual(Object.keys(state.completed), ["lito_welcome"]);
  assert.deepEqual(Object.keys(state.objectives), ["lito_welcome.heard"]);
  assert.equal(Object.values(state.artifacts).some(a => a.state === "registered"), false);
  assert.equal(page.ctx.StarFlow.checkPage("/luna").allowed, false);
  assert.equal(page.ctx.StarSound.music <= 2, true, "la música se pide al elegir idioma y al confirmar (startMusic no la duplica)");
});

test("cambiar ES/EN durante la intro y durante LITO traduce y vuelve a narrar sin superponer voces", () => {
  const page = openIndex(newTab());
  page.flushSplash();
  page.tap(page.el.introLangEs);
  page.tap(page.el.introNext);
  page.barLang("en");
  assert.equal(page.el.introSceneTitle.textContent, "The beginning of an adventure");
  assert.equal(page.el.introSceneCount.textContent, "2 / 5");
  assert.equal(page.spoken().at(-1).lang, "en");
  page.barLang("es");
  for (let i = 1; i < SCENES.length; i++) page.tap(page.el.introNext);
  assert.equal(page.step(), "lito");
  page.barLang("en");
  assert.match(page.el.litoText.dataset.fullText, TEXT.en.lito);
  assert.equal(page.el.litoReady.textContent, "I'M READY!");
  assert.equal(page.spoken().at(-1).lang, "en");
  page.tap(page.el.litoReady);
  assert.equal(page.el.adventureButton.textContent, "START ADVENTURE");
  assertNoOverlappingVoice(page);
  assert.deepEqual(page.violations, []);
});

test("voz desactivada: se muestran los textos sin narrar", () => {
  const page = openIndex(newTab({ starstep_audio: JSON.stringify({ voice: false }) }));
  page.ctx.StarSound.voiceOn = false;
  playFullSequence(page);
  assert.equal(page.spoken().length, 0);
  assert.equal(page.step(), "menu");
});

for (const lang of ["es", "en"]) {
  test(`apertura real con la intro ya vista [${lang}]: tras elegir idioma vuelve la intro en ese idioma, con SALTAR`, () => {
    const local = makeStore();
    playFullSequence(openIndex({ localStorage: local, sessionStorage: makeStore() }), lang === "es" ? "en" : "es");
    const second = openIndex({ localStorage: local, sessionStorage: makeStore() });   // pestaña nueva
    assert.deepEqual(second.visible(), ["introSplash"]);
    second.flushSplash();
    assert.deepEqual(second.visible(), ["introLanguage"]);
    second.tap(lang === "en" ? second.el.introLangEn : second.el.introLangEs);
    // La secuencia depende del idioma elegido ahora (no del de la vez anterior).
    assert.deepEqual(second.visible(), ["introHistory"]);
    assert.equal(second.el.introSceneTitle.textContent, TEXT[lang].first);
    assert.equal(second.el.introNext.textContent, TEXT[lang].next);
    assert.equal(second.spoken().at(-1).lang, lang, "narración en el idioma elegido");
    assert.match(second.spoken().at(-1).text, new RegExp("^" + TEXT[lang].first));
    assert.equal(second.el.introSkip.hidden, false, "ya vista: se puede saltar");
    assert.equal(second.el.introSkip.textContent, lang === "en" ? "SKIP" : "SALTAR");
    second.tap(second.el.introSkip);
    assert.deepEqual(second.visible(), ["menu"], "LITO completada: no se repite");
    assert.deepEqual(second.violations, []);
  });
}

test("apertura real con la intro ya vista: también se puede ver completa hasta el final", () => {
  const local = makeStore();
  playFullSequence(openIndex({ localStorage: local, sessionStorage: makeStore() }));
  const second = openIndex({ localStorage: local, sessionStorage: makeStore() });
  second.flushSplash();
  second.tap(second.el.introLangEs);
  for (let i = 0; i < SCENES.length; i++) second.tap(second.el.introNext);
  assert.deepEqual(second.visible(), ["menu"]);
  assert.deepEqual(second.violations, []);
});

test("regreso a Tierra desde Luna, Marte o Huellas: menú directo, sin OUTSTRIP, intro ni LITO", () => {
  for (const mission of ["/luna", "/marte", "/huellas"]) {
    const tab = newTab();
    playFullSequence(openIndex(tab));
    const missionPage = makePage({ path: mission, tab });                    // la misión marca la sesión
    missionPage.load("main.js", "progreso.js", "flujo-definicion.js", "flujo.js").ready();
    const home = openIndex(tab);
    assert.deepEqual(home.visible(), ["menu"], mission);
    assert.equal(home.stageVisible(), true);
    assert.equal(home.timers.some(x => x.ms >= 1000), false, "sin splash");
    assert.equal(home.spoken().length, 0, "sin narración");
    assert.equal(home.el.introSequence.hidden, true);
    assert.equal(home.ctx.StarFlow.getHomeMode(), "menu");
    assert.deepEqual(home.violations, []);
  }
});

test("recargar la portada: OUTSTRIP, idioma e intro (con SALTAR); LITO completada no se repite", () => {
  const tab = newTab();
  playFullSequence(openIndex(tab));
  const reload = openIndex(tab, { reload: true });
  assert.deepEqual(reload.visible(), ["introSplash"], "la recarga es una apertura real");
  reload.flushSplash();
  assert.deepEqual(reload.visible(), ["introLanguage"]);
  reload.tap(reload.el.introLangEn);
  assert.deepEqual(reload.visible(), ["introHistory"]);
  assert.equal(reload.el.introSceneTitle.textContent, TEXT.en.first);
  assert.equal(reload.el.introSkip.hidden, false);
  reload.tap(reload.el.introSkip);
  assert.deepEqual(reload.visible(), ["menu"]);
  assert.equal(reload.ctx.StarFlow.isStageCompleted("lito_welcome"), true, "progreso intacto");
  assert.deepEqual(reload.violations, []);
});

test("recargar a mitad de la intro: OUTSTRIP e idioma, la intro vuelve al inicio sin SALTAR y luego LITO", () => {
  const tab = newTab();
  const first = openIndex(tab);
  first.flushSplash();
  first.tap(first.el.introLangEs);
  first.tap(first.el.introNext); first.tap(first.el.introNext);
  const reload = openIndex(tab, { reload: true });
  reload.flushSplash();
  reload.tap(reload.el.introLangEs);
  assert.deepEqual(reload.visible(), ["introHistory"]);
  assert.equal(reload.el.introSceneCount.textContent, "1 / 5");
  assert.equal(reload.el.introSkip.hidden, true);
  for (let i = 0; i < SCENES.length; i++) reload.tap(reload.el.introNext);
  assert.deepEqual(reload.visible(), ["introLito"]);
  assert.deepEqual(reload.violations, []);
});

test("volver a la portada sin recargar a mitad de la secuencia: continúa sin OUTSTRIP", () => {
  const tab = newTab();
  const first = openIndex(tab);
  first.flushSplash();
  first.tap(first.el.introLangEs);
  const again = openIndex(tab);                         // p. ej. desde la bitácora (navegación interna)
  assert.deepEqual(again.visible(), ["introHistory"]);
  assert.deepEqual(again.violations, []);
});

test("partida existente: apertura real con intro sin ver → intro obligatoria y luego CONTINUAR AVENTURA", () => {
  const tab = newTab();
  const { StarFlow, StarProgress } = openHome(tab).ctx;
  StarFlow.recordObjective("lito_welcome.heard", { source: "welcome_skip" });
  StarProgress.setPlayer({ alias: "ARIEL", avatar: "vice" });
  StarFlow.recordObjective("profile.alias", { source: "avatar_form", alias: "ARIEL" });
  StarFlow.recordObjective("cadet_custom.avatar", { source: "avatar_form", avatar: "vice" });
  const before = StarFlow.getState();
  const page = openIndex({ localStorage: tab.localStorage, sessionStorage: makeStore() });
  page.flushSplash();
  page.tap(page.el.introLangEs);
  assert.deepEqual(page.visible(), ["introHistory"]);
  assert.equal(page.el.introSkip.hidden, true);
  for (let i = 0; i < SCENES.length; i++) page.tap(page.el.introNext);
  assert.deepEqual(page.visible(), ["menu"], "LITO ya completada: no se repite");
  assert.equal(page.el.adventureButton.textContent, "CONTINUAR AVENTURA");
  const after = page.ctx.StarFlow.getState();
  assert.deepEqual(after.completed, before.completed);
  assert.equal(after.revision, before.revision);
  assert.deepEqual(page.violations, []);
});

test("VER INTRODUCCIÓN: fundido desde el menú, se puede saltar y no toca la partida", () => {
  const page = openIndex(newTab());
  playFullSequence(page);
  const before = JSON.stringify(page.ctx.StarFlow.getState());
  page.tapNow(page.el.replayIntro);
  assert.equal(page.el.introSequence.hidden, false, "el telón vuelve sobre la estación");
  assert.equal(page.curtain(), "in");
  page.settle();
  assert.deepEqual(page.visible(), ["introHistory"]);
  assert.equal(page.stageVisible(), false);
  assert.equal(page.el.introSkip.hidden, false);
  page.tap(page.el.introSkip);
  assert.deepEqual(page.visible(), ["menu"], "vuelve al menú, sin LITO");
  page.tap(page.el.replayIntro);
  for (let i = 0; i < SCENES.length; i++) page.tap(page.el.introNext);
  assert.deepEqual(page.visible(), ["menu"]);
  assert.equal(JSON.stringify(page.ctx.StarFlow.getState()), before);
  assert.deepEqual(page.violations, []);
});

// ── NUEVA PARTIDA: bienvenida breve de LITO (sección 5.8) ──────
const BRIEF = {
  es: "¡Una nueva aventura nos espera! Prepará tu traje, cadete.",
  en: "A new adventure awaits! Get your suit ready, cadet."
};
const MARK = "starstep_nueva_partida";
// Jugador con partida en curso (perfil y cadete) en el menú, listo para NUEVA PARTIDA.
function menuWithGame(lang = "es", options = {}, local = {}) {
  const tab = newTab(local);
  const page = openIndex(tab, options);
  playFullSequence(page, lang);
  const { StarFlow, StarProgress } = page.ctx;
  StarProgress.setPlayer({ alias: "ARIEL", avatar: "vice" });
  assert.equal(StarFlow.recordObjective("profile.alias", { source: "avatar_form", alias: "ARIEL" }).ok, true);
  assert.equal(StarFlow.recordObjective("cadet_custom.avatar", { source: "avatar_form", avatar: "vice" }).ok, true);
  assert.deepEqual(page.visible(), ["menu"]);
  assert.equal(page.el.newGame.hidden, false, "hay partida: NUEVA PARTIDA visible");
  return { tab, page };
}
const pending = (page, ms) => page.timers.filter(x => !x.cancelled && !x.done && x.ms === ms);
function runPending(page, ms) {
  const [timer] = pending(page, ms);
  assert.ok(timer, `hay temporizador de ${ms} ms`);
  timer.done = true; timer.fn();
}
function openAstronauta(tab) {
  const page = makePage({ path: "/astronauta", tab });
  page.load("main.js", "progreso.js", "flujo-definicion.js", "flujo.js").ready();
  return page;
}

for (const lang of ["es", "en"]) {
  test(`NUEVA PARTIDA [${lang}]: mensaje breve de LITO y directo a /astronauta, sin OUTSTRIP, idioma, intro ni menú`, () => {
    const audio = JSON.stringify({ music: true, fx: true, voice: true });
    const { tab, page } = menuWithGame(lang, {}, { starstep_audio: audio });
    const oldId = page.ctx.StarFlow.getState().player.id;
    page.tap(page.el.newGame);
    assert.equal(page.el.newGameDialog.hidden, false, "se mantiene la confirmación");
    assert.equal(tab.localStorage.getItem("starstep_flujo") !== null, true, "abrir el diálogo no borra nada");
    const spokenBefore = page.spoken().length;

    page.tapNow(page.el.newGameConfirm);
    for (const key of page.ctx.StarProgress.PLAYER_KEYS) assert.equal(tab.localStorage.getItem(key), null, `borrado ${key}`);
    assert.equal(page.el.newGameDialog.hidden, true);
    assert.equal(page.curtain(), "in", "fundido a azul noche sobre el menú");
    page.settle();

    // Solo la pantalla de LITO, con el mensaje breve y sin ¡ESTOY LISTO!
    assert.equal(page.step(), "newgame");
    assert.deepEqual(page.visible(), ["introLito"]);
    assert.equal(page.stageVisible(), false, "menú y estación ocultos");
    assert.equal(page.el.litoReady.hidden, true, "sin botón: avanza sola");
    assert.equal(page.el.litoText.dataset.fullText, BRIEF[lang]);
    const voice = page.spoken().slice(spokenBefore);
    assert.equal(voice.length, 1, "una sola narración");
    assert.equal(voice[0].text, BRIEF[lang]);
    assert.equal(voice[0].lito, true);
    assert.equal(voice[0].lang, lang);
    assert.equal(page.focused(), page.el.litoVoice, "el foco queda dentro de la pantalla de LITO");
    page.runFrames();
    assert.ok(page.ops.includes("lito"), "LITO animado");

    // ~3 s después: telón opaco y navegación (no antes).
    assert.equal(pending(page, NEW_GAME_MS).length, 1);
    assert.equal(page.ctx.__navigated, undefined);
    runPending(page, NEW_GAME_MS);
    assert.equal(page.curtain(), "in");
    assert.equal(page.ctx.__navigated, undefined, "espera el fundido de salida");
    page.settle();
    assert.equal(page.ctx.__navigated, "/astronauta");
    assert.equal(tab.sessionStorage.getItem(MARK), "1");
    assert.notEqual(page.step(), "menu", "el menú nunca vuelve a aparecer");
    assert.equal(page.stageVisible(), false);

    // Preferencias conservadas; nada de la partida anterior.
    assert.equal(tab.localStorage.getItem("starstep_lang"), lang);
    assert.equal(tab.localStorage.getItem("starstep_audio"), audio);
    assert.equal(page.ctx.StarProgress.hasSeenCinematic("history_intro"), true, "intro vista conservada");
    for (const key of page.ctx.StarProgress.PLAYER_KEYS) assert.equal(tab.localStorage.getItem(key), null, `el mensaje no escribe ${key}`);

    // Página siguiente: /astronauta acepta al jugador nuevo con la bienvenida breve.
    const astro = openAstronauta(tab);
    assert.equal(astro.ctx.__navigated, undefined, "sin redirección");
    const state = astro.ctx.StarFlow.getState();
    assert.notEqual(state.player.id, oldId);
    assert.equal(state.objectives["lito_welcome.heard"].source, "new_game_welcome");
    assert.equal(Object.keys(state.objectives).length, 1);
    assert.equal(astro.ctx.StarFlow.getEntryPoint().page, "/astronauta");
    assert.equal(JSON.stringify(astro.ctx.StarProgress.player()), "{}");
    assert.equal(astro.ctx.StarI18n.lang, lang);
    assertNoOverlappingVoice(page);
    assert.deepEqual(page.violations, []);
  });
}

test("NUEVA PARTIDA con movimiento reducido: sin fundidos ni texto animado, y ~3 s de mensaje", () => {
  const { page } = menuWithGame("es", { reducedMotion: true });
  page.tap(page.el.newGame);
  page.tapNow(page.el.newGameConfirm);
  assert.deepEqual(page.visible(), ["introLito"], "cambio inmediato");
  assert.equal(page.el.litoText.textContent, BRIEF.es, "texto completo de una vez");
  assert.equal(pending(page, FADE_MS).length, 0, "sin temporizadores de fundido");
  runPending(page, NEW_GAME_MS);
  assert.equal(page.ctx.__navigated, "/astronauta", "sin fundido de salida");
  assert.deepEqual(page.violations, []);
});

test("NUEVA PARTIDA: cambiar idioma o voz durante el mensaje no superpone voces ni temporizadores", () => {
  const { page } = menuWithGame("es");
  page.tap(page.el.newGame);
  page.tap(page.el.newGameConfirm);
  page.barLang("en");
  assert.equal(page.el.litoText.dataset.fullText, BRIEF.en);
  assert.equal(page.spoken().at(-1).text, BRIEF.en);
  assert.equal(page.spoken().at(-1).lang, "en");
  page.tap(page.el.litoVoice);                       // voz OFF
  assert.equal(page.ctx.StarSound.voiceOn, false);
  const count = page.spoken().length;
  page.tap(page.el.litoVoice);                       // voz ON: vuelve a hablar una vez
  assert.equal(page.spoken().length, count + 1);
  assert.equal(pending(page, NEW_GAME_MS).length, 1, "un solo temporizador de salida");
  assertNoOverlappingVoice(page);
  runPending(page, NEW_GAME_MS); page.settle();
  assert.equal(page.ctx.__navigated, "/astronauta");
  assert.deepEqual(page.violations, []);
});

test("NUEVA PARTIDA: si LITO sigue hablando a los 3 s, espera a que termine (con un máximo)", () => {
  for (const ends of [true, false]) {
    const { page } = menuWithGame("es");
    let last = null;
    page.ctx.StarSound.speak = (text, opts = {}) => { page.speech.push({ text, lito: !!opts.lito, lang: page.ctx.StarI18n.lang }); last = opts; opts.onStart?.(); };
    page.tap(page.el.newGame);
    page.tap(page.el.newGameConfirm);
    runPending(page, NEW_GAME_MS);
    page.settle();
    assert.equal(page.ctx.__navigated, undefined, "no corta a LITO a mitad de la frase");
    assert.equal(pending(page, NEW_GAME_VOICE_GRACE_MS).length, 1);
    if (ends) last.onEnd();
    else runPending(page, NEW_GAME_VOICE_GRACE_MS);
    page.settle();
    assert.equal(page.ctx.__navigated, "/astronauta", ends ? "al terminar la voz" : "al cumplirse el máximo");
    assert.deepEqual(page.violations, []);
  }
});

test("NUEVA PARTIDA: confirmar dos veces no reinicia dos veces ni duplica el mensaje", () => {
  const { page } = menuWithGame("es");
  page.tap(page.el.newGame);
  page.tapNow(page.el.newGameConfirm);
  page.tapNow(page.el.newGameConfirm);
  page.settle();
  page.tap(page.el.newGameConfirm);
  assert.equal(pending(page, NEW_GAME_MS).length, 1);
  assert.equal(page.spoken().filter(s => s.text === BRIEF.es).length, 1);
  assert.equal(page.ctx.StarIntro.newGameWelcome({ onDone() {} }), false, "no se puede iniciar otra vez");
  assert.deepEqual(page.violations, []);
});

test("NUEVA PARTIDA: CANCELAR no borra nada y deja el menú como estaba", () => {
  const { tab, page } = menuWithGame("es");
  const before = JSON.stringify([...tab.localStorage.data.entries()].sort());
  page.tap(page.el.newGame);
  page.tap(page.el.newGameCancel);
  assert.equal(page.el.newGameDialog.hidden, true);
  assert.deepEqual(page.visible(), ["menu"]);
  assert.equal(JSON.stringify([...tab.localStorage.data.entries()].sort()), before);
  assert.equal(page.step(), "menu");
  assert.equal(page.ctx.__navigated, undefined);
});

test("NUEVA PARTIDA: recargar durante el mensaje no salta la bienvenida (secuencia completa, intro con SALTAR)", () => {
  const { tab, page } = menuWithGame("es");
  page.tap(page.el.newGame);
  page.tap(page.el.newGameConfirm);
  assert.equal(page.step(), "newgame");
  const reloaded = openIndex(tab, { reload: true });   // F5 antes de los 3 s: no hay marca
  assert.equal(tab.sessionStorage.getItem(MARK), null);
  assert.deepEqual(reloaded.visible(), ["introSplash"]);
  reloaded.flushSplash();
  reloaded.tap(reloaded.el.introLangEs);
  assert.deepEqual(reloaded.visible(), ["introHistory"]);
  assert.equal(reloaded.el.introSkip.hidden, false, "la intro vista se conservó: se puede saltar");
  reloaded.tap(reloaded.el.introSkip);
  assert.equal(reloaded.step(), "lito", "la bienvenida de LITO vuelve a ser obligatoria");
  assert.equal(reloaded.el.litoReady.hidden, false);
  assert.equal(reloaded.ctx.StarFlow.isStageCompleted("lito_welcome"), false);
  assert.deepEqual(reloaded.violations, []);
});

test("NUEVA PARTIDA sin intro-secuencia.js: recarga la portada con la bienvenida completa (sin marca)", () => {
  const { tab, page } = menuWithGame("es");
  page.ctx.StarIntro = undefined;
  page.tap(page.el.newGame);
  page.tapNow(page.el.newGameConfirm);
  assert.equal(page.ctx.__navigated, "/");
  assert.equal(tab.sessionStorage.getItem(MARK), null);
});

test("las cinco escenas y LITO se dibujan sin errores", () => {
  const page = openIndex(newTab());
  page.flushSplash();
  page.tap(page.el.introLangEs);
  for (let i = 0; i < SCENES.length; i++) { page.runFrames(); page.tap(page.el.introNext); }
  page.runFrames();
  assert.equal(page.step(), "lito");
  assert.deepEqual(page.warnings, []);
  assert.ok(page.ops.includes("launch") && page.ops.includes("descent") && page.ops.includes("lito"));
});

test("plantilla: escenario oculto desde el primer renderizado y presentación permanente", () => {
  const html = template("index.html");
  const pos = file => html.indexOf(`js/${file}`);
  assert.ok(pos("flujo.js") < pos("main.js") && pos("main.js") < pos("intro-secuencia.js"));
  assert.match(html, /<body class="[^"]*\bis-entering\b[^"]*"/, "is-entering desde el HTML");
  const tag = id => (html.match(new RegExp(`<[a-z]+[^>]*[\\s]id="${id}"[^>]*>`)) || [""])[0];
  assert.doesNotMatch(tag("introSequence"), /\shidden\b/, "contenedor permanente, visible desde el inicio");
  assert.match(tag("introFade"), /data-state="in"/, "telón azul noche opaco desde el inicio");
  for (const id of ["menu", "introSplash", "introLanguage", "introHistory", "introLito", "introSkip", "replayIntro"]) {
    assert.match(tag(id), /\shidden\b/, `${id} oculto por defecto`);
  }
  assert.doesNotMatch(html, /id="welcome"/, "la bienvenida antigua sobre el escenario ya no existe");
  assert.match(tag("litoReady"), /data-i18n="lito.ready"/);
  const css = template("../static/css/identidad.css");
  for (const selector of ["canvas#world", ".hud", ".logo", ".menu", ".chapter-label"]) {
    assert.match(css, new RegExp(`\\.home-page\\.is-entering [^{]*${selector.replace(".", "\\.")}`), `CSS oculta ${selector}`);
  }
  assert.match(css, /\.intro-fade\s*\{[^}]*background:\s*#0E1233/i);
  assert.match(css, /prefers-reduced-motion[\s\S]*\.intro-fade/);
});

test("la pantalla nueva responde mientras el telón se aclara (sin esperar el fin del fundido)", () => {
  const page = openIndex(newTab());
  page.runFrames();
  // Termina el splash pero NO el fundido de salida: idioma visible, telón aclarándose.
  const splash = page.timers.find(x => x.ms >= 1000 && !x.done);
  splash.done = true; splash.fn();
  const swap = page.timers.find(x => !x.done && !x.cancelled && x.ms === FADE_MS);
  swap.done = true; swap.fn();
  assert.equal(page.step(), "language");
  assert.equal(page.curtain(), "out", "telón aclarándose");
  page.tap(page.el.introLangEn);
  assert.equal(page.step(), "history", "el clic durante el aclarado sí cuenta");
  assert.equal(page.el.introSceneTitle.textContent, "Human curiosity");
  assert.deepEqual(page.violations, []);
});
