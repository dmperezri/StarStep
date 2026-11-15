"use strict";
/*
 * StarStep · Secuencia de entrada de la portada (presentación).
 *
 *   OUTSTRIP → idioma → introducción histórica → bienvenida de LITO → estación terrestre y menú
 *
 * Toda la presentación ocurre dentro de un contenedor permanente a pantalla completa
 * (#introSequence). El escenario terrestre, el HUD, el logotipo y el menú están ocultos desde
 * el primer renderizado (clase is-entering en <body>) y solo se revelan al entrar al menú.
 * Entre etapas hay un fundido a azul noche (#introFade, ~420 ms; inmediato con movimiento
 * reducido). No hay recargas entre etapas.
 *
 * Qué pasos se muestran lo decide planEntry() (pura, probada en Node):
 *   - initialOpening ... apertura real: primera página de la pestaña (StarFlow.isInitialOpening())
 *                        o recarga de la portada (Navigation Timing: type === 'reload').
 *   - historySeen ...... StarProgress.hasSeenCinematic('history_intro'): por jugador.
 *   - welcomeCompleted . StarFlow.isStageCompleted('lito_welcome').
 *
 * Reglas (docs/FLUJO_OFICIAL.md, sección 5.7):
 *   - Regreso interno (desde una misión, la bitácora o el Archivo NASA) con la bienvenida
 *     completada → menú directo. getHomeMode() no cambia.
 *   - OUTSTRIP y el selector de idioma: en cada apertura real, también al recargar.
 *   - Introducción histórica: después de cada elección de idioma, en ese idioma (textos y
 *     narración). La primera vez no se puede saltar; si ya se vio completa, aparece SALTAR.
 *     En un regreso interno con la bienvenida pendiente, solo si todavía no se vio.
 *   - Bienvenida de LITO: hasta completarla (objetivo lito_welcome.heard).
 *   - NUEVA PARTIDA (sección 5.8): newGameWelcome() muestra solo un mensaje breve de LITO
 *     (~3 s, sin botón) y entrega el control a main.js, que navega a /astronauta. No repite
 *     OUTSTRIP, idioma, intro, la bienvenida extensa ni el menú.
 *
 * Es solo presentación: no avanza etapas, no registra artefactos ni desbloquea misiones.
 * El único evento de juego es el que ya existía: lito_welcome.heard al confirmar a LITO.
 * (La bienvenida breve no registra nada aquí: lo hace flujo.js en la página siguiente.)
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.StarIntroCore = api;
})(typeof window !== "undefined" ? window : null, function () {
  const SCENES = Object.freeze(["curiosity", "apollo", "footprints", "mars", "story"]);
  const STEPS = Object.freeze(["splash", "language", "history", "lito", "menu"]);
  const SPLASH_MS = 3200;
  const SPLASH_MS_REDUCED = 1500;
  const FADE_MS = 420;            // fundido a azul noche entre etapas (350–500 ms)
  const NEW_GAME_MS = 3000;       // mensaje breve de LITO en NUEVA PARTIDA
  const NEW_GAME_VOICE_GRACE_MS = 1000; // si LITO sigue hablando, espera hasta este margen extra
  // El selector aparece antes de elegir idioma: muestra la consigna en ambos.
  const LANGUAGE_PROMPT = Object.freeze({ es: "SELECCIONÁ TU IDIOMA", en: "CHOOSE YOUR LANGUAGE" });

  function planEntry(input) {
    const { initialOpening = true, historySeen = false, welcomeCompleted = false } = input || {};
    if (!initialOpening && welcomeCompleted) return ["menu"];
    const steps = [];
    if (initialOpening) steps.push("splash", "language");
    // Tras elegir idioma la intro siempre se muestra (con SALTAR si ya se vio).
    if (initialOpening || !historySeen) steps.push("history");
    if (!welcomeCompleted) steps.push("lito");
    steps.push("menu");
    return steps;
  }

  return Object.freeze({ SCENES, STEPS, SPLASH_MS, SPLASH_MS_REDUCED, FADE_MS, NEW_GAME_MS, NEW_GAME_VOICE_GRACE_MS, LANGUAGE_PROMPT, planEntry });
});

/* ── Navegador ───────────────────────────────────────────────── */
(function () {
  if (typeof window === "undefined" || typeof document === "undefined" || !window.StarIntroCore) return;
  const Core = window.StarIntroCore;
  const $ = id => document.getElementById(id);
  const t = (key, vars) => (window.StarI18n ? window.StarI18n.t(key, vars) : key);
  const lang = () => (window.StarI18n?.lang === "en" ? "en" : "es");
  const sound = () => window.StarSound || null;
  const SCREENS = ["introSplash", "introLanguage", "introHistory", "introLito"];
  const SCREEN_OF = { splash: "introSplash", language: "introLanguage", history: "introHistory", lito: "introLito" };

  let step = null, queue = [], onMenu = null;
  let sceneIndex = 0, canSkipHistory = false;
  let splashTimer = 0, typingTimer = 0, frame = 0, bound = false;
  let fadeToken = 0, fadeTimers = [], busy = false;
  let briefTimer = 0, briefDue = false, leaving = false, briefDone = null;

  // ── Utilidades ────────────────────────────────────────────────
  function reducedMotion() {
    try { return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true; } catch { return false; }
  }
  function fadeMs() { return reducedMotion() ? 0 : Core.FADE_MS; }
  function focus(node) { try { node?.focus?.({ preventScroll: true }); } catch { /* sin foco */ } }
  function stopTimers() {
    clearTimeout(splashTimer); splashTimer = 0;
    clearInterval(typingTimer); typingTimer = 0;
    clearTimeout(briefTimer); briefTimer = 0;
    if (frame && typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
    frame = 0;
  }
  function stopNarration() {
    sound()?.stopVoice?.();
    window.litoState = "idle";
  }
  function narrate(text, lito, onEnd) {
    const s = sound();
    if (!s || !s.voiceOn) return;
    s.speak(text, {
      lito: !!lito,
      onStart: () => { window.litoState = "talking"; },
      onEnd: () => { window.litoState = "idle"; if (typeof onEnd === "function") onEnd(); }
    });
  }
  // Texto de LITO escrito de a poco; sin animación (movimiento reducido) aparece entero.
  function typeText(node, text, animate) {
    if (!node) return;
    clearInterval(typingTimer); typingTimer = 0;
    node.dataset.fullText = text;
    if (!animate) { node.textContent = text; return; }
    node.textContent = "";
    let i = 0;
    typingTimer = setInterval(() => {
      i = Math.min(text.length, i + 2);
      node.textContent = text.slice(0, i);
      if (i % 6 === 0) sound()?.effect?.("type");
      if (i >= text.length) { clearInterval(typingTimer); typingTimer = 0; }
    }, 26);
  }
  // Solo desplazamiento, nunca opacidad: si el navegador pausa la animación (pestaña en
  // segundo plano), el texto sigue legible.
  function reveal(node) {
    if (node && typeof node.animate === "function" && !reducedMotion()) {
      node.animate([{ transform: "translateY(6px)" }, { transform: "none" }], { duration: 380, easing: "steps(6)" });
    }
  }
  function showScreen(id) {
    for (const screen of SCREENS) { const node = $(screen); if (node) node.hidden = screen !== id; }
  }
  function setPresenting(on) {
    const wrap = $("introSequence");
    if (on) {
      document.body?.classList?.add("is-entering");
      if (wrap) { wrap.hidden = false; wrap.dataset.reveal = "false"; }
    } else {
      document.body?.classList?.remove("is-entering");
      if (wrap) wrap.dataset.reveal = "true";
    }
  }

  // ── Fundido a azul noche ──────────────────────────────────────
  // fade: telón opaco → swap() → telón transparente. Un solo fundido activo: uno nuevo
  // anula los temporizadores del anterior. Mientras el telón se oscurece se ignoran los clics.
  function transition(swap, after) {
    const token = ++fadeToken;
    fadeTimers.forEach(clearTimeout);
    fadeTimers = [];
    const curtain = $("introFade");
    const ms = fadeMs();
    const finish = () => {
      if (token !== fadeToken) return;
      if (typeof after === "function") after();
    };
    busy = true;
    if (curtain?.style) curtain.style.setProperty?.("--intro-fade-ms", ms + "ms");
    document.body?.style?.setProperty?.("--intro-fade-ms", ms + "ms");
    const alreadyDark = !curtain || curtain.dataset.state === "in";
    // Desde el menú (contenedor retirado): se vuelve a mostrar transparente para que el
    // telón se funda sobre la estación terrestre.
    const wrap = $("introSequence");
    if (wrap?.hidden) {
      wrap.dataset.reveal = "true";
      wrap.hidden = false;
      void curtain?.offsetWidth;            // aplica el estado inicial antes de animar
    }
    const swapAndOpen = () => {
      if (token !== fadeToken) return;
      swap();
      // La pantalla nueva ya está a la vista mientras el telón se aclara: se puede usar.
      // Solo se bloquean los clics mientras el telón se oscurece (evita dobles avances).
      busy = false;
      if (curtain) curtain.dataset.state = "out";
      if (ms === 0) finish(); else fadeTimers.push(setTimeout(finish, ms));
    };
    if (curtain) curtain.dataset.state = "in";
    if (alreadyDark || ms === 0) swapAndOpen();
    else fadeTimers.push(setTimeout(swapAndOpen, ms));
  }

  // ── Motor de pasos ────────────────────────────────────────────
  function run(steps, menuCallback) {
    stopTimers();
    stopNarration();
    queue = steps.filter(s => Core.STEPS.includes(s));
    if (queue[queue.length - 1] !== "menu") queue.push("menu");
    if (typeof menuCallback === "function") onMenu = menuCallback;
    next();
  }
  function next() {
    stopTimers();
    stopNarration();
    const upcoming = queue.shift() || "menu";
    if (upcoming === "menu") { enterMenu(); return; }
    transition(() => {
      step = upcoming;
      if (document.body) document.body.dataset.introStep = step;
      setPresenting(true);
      showScreen(SCREEN_OF[step]);
      ({ splash: showSplash, language: showLanguage, history: showHistory, lito: showLito })[step]();
    });
  }

  // 1. OUTSTRIP: no se puede omitir en la apertura real; avanza solo.
  function showSplash() {
    splashTimer = setTimeout(next, (reducedMotion() ? Core.SPLASH_MS_REDUCED : Core.SPLASH_MS) + fadeMs());
  }

  // 2. Idioma: la elección actualiza toda la interfaz siguiente (StarI18n).
  function showLanguage() {
    renderLanguage();
    focus($(lang() === "en" ? "introLangEn" : "introLangEs"));
  }
  function renderLanguage() {
    const current = lang(), other = current === "en" ? "es" : "en";
    const title = $("introLanguageTitle"), alt = $("introLanguageAlt");
    if (title) { title.textContent = Core.LANGUAGE_PROMPT[current]; title.lang = current; }
    if (alt) { alt.textContent = Core.LANGUAGE_PROMPT[other]; alt.lang = other; }
    for (const id of ["introLangEs", "introLangEn"]) {
      const button = $(id);
      button?.setAttribute?.("aria-pressed", String(button.dataset.introLang === current));
    }
  }
  function chooseLanguage(choice) {
    if (step !== "language" || busy) return;
    const s = sound();
    s?.init?.();          // primer gesto del jugador: habilita audio y voz
    s?.startMusic?.();    // startMusic no duplica la música si ya suena
    s?.effect?.("button");
    window.StarI18n?.setLang?.(choice);
    next();
  }

  // 3. Introducción histórica.

  let videoActive = false;

  const hv = () => $("historyVideo");

  const trVideo = (es, en) => lang() === "en" ? en : es;

  function updateHistoryVideo() {

    if (!videoActive) return;

    const v = hv();

    $("historyVideoTitle").textContent =
      trVideo("CAMINO AL APOLO 11", "ROAD TO APOLLO 11");

    $("historyVideoPlay").textContent =
      v.paused
        ? trVideo("REPRODUCIR", "PLAY")
        : trVideo("PAUSAR", "PAUSE");

    $("historyVideoMute").textContent =
      v.muted
        ? trVideo("ACTIVAR AUDIO", "UNMUTE")
        : trVideo("SILENCIAR", "MUTE");

    $("historyVideoSkip").textContent =
      trVideo("SALTAR", "SKIP");

    $("historyVideoSkip").hidden = !canSkipHistory;

    const d =
      Number.isFinite(v.duration) && v.duration > 0
        ? v.duration
        : 157;

    $("historyVideoProgress").value =
      Math.min(1, v.currentTime / d || 0);

    const fmt = n =>
      `${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,"0")}`;

    $("introSceneCount").textContent =
      `${fmt(v.currentTime || 0)} / ${fmt(d)}`;
  }

  function playHistoryVideo() {

    sound()?.stopAll?.();

    hv().play().catch(updateHistoryVideo);
  }

  function openHistoryVideo() {

    const v = hv();

    if (!v || v.error) return false;

    videoActive = true;

    stopNarration();

    $("introHistory").classList.add("video-mode");

    $("introHistory").setAttribute(
      "aria-labelledby", "historyVideoTitle"
    );

    for (const id of [
      "introCanvas", "introCaption", "introVoice"
    ]) {
      $(id).hidden = true;
    }

    v.hidden = false;

    $("historyVideoPanel").hidden = false;

    v.muted = sound()?.voiceOn === false;

    try { v.currentTime = 0; } catch {}

    updateHistoryVideo();

    playHistoryVideo();

    focus($("historyVideoPlay"));

    return true;
  }

  function closeHistoryVideo() {

    videoActive = false;

    hv().pause();
    hv().hidden = true;

    $("historyVideoPanel").hidden = true;

    for (const id of [
      "introCanvas", "introCaption", "introVoice"
    ]) {
      $(id).hidden = false;
    }

    $("introHistory").classList.remove("video-mode");

    $("introHistory").setAttribute(
      "aria-labelledby", "introSceneTitle"
    );

    sound()?.startMusic?.();
  }

  function finishHistoryVideo(completed) {

    if (!videoActive || step !== "history" ||
        (!completed && (!canSkipHistory || busy))) return;

    closeHistoryVideo();

    if (completed) {
      window.StarProgress?.markCinematicSeen?.("history_intro");
    }

    next();
  }

  function fallbackHistoryVideo() {

    if (!videoActive) return;

    closeHistoryVideo();

    sceneIndex = 0;

    renderScene(true);
    startCanvas("history");
  }

  function showHistory() {
    sceneIndex = 0;
    canSkipHistory = window.StarProgress?.hasSeenCinematic?.("history_intro") === true;
    if (openHistoryVideo()) return;
    renderScene(true);
    startCanvas("history");
  }
  function renderScene(speak) {
    const id = Core.SCENES[sceneIndex];
    const title = t(`intro.scene.${id}.title`), text = t(`intro.scene.${id}.text`);
    const titleNode = $("introSceneTitle"), textNode = $("introSceneText");
    if (titleNode) titleNode.textContent = title;
    if (textNode) textNode.textContent = text;
    const count = $("introSceneCount");
    if (count) count.textContent = `${sceneIndex + 1} / ${Core.SCENES.length}`;
    const history = $("introHistory");
    if (history) history.dataset.scene = id;
    const skip = $("introSkip");
    if (skip) skip.hidden = !canSkipHistory;
    renderVoiceButtons();
    reveal($("introCaption"));
    if (speak) { stopNarration(); narrate(`${title}. ${text}`, false); }
    focus($("introNext"));
  }
  function nextScene() {
    if (step !== "history" || busy) return;
    sound()?.effect?.("button");
    sceneIndex++;
    if (sceneIndex < Core.SCENES.length) { renderScene(true); return; }
    window.StarProgress?.markCinematicSeen?.("history_intro"); // vista completa: ya se puede saltar
    next();
  }
  function skipHistory() {
    if (step !== "history" || busy || !canSkipHistory) return;
    sound()?.effect?.("button");
    next();
  }
  function renderVoiceButtons() {
    const on = sound()?.voiceOn !== false;
    for (const id of ["introVoice", "litoVoice"]) {
      const button = $(id);
      if (!button) continue;
      button.textContent = on ? t("voice.on") : t("voice.off");
      button.setAttribute?.("aria-pressed", String(on));
    }
  }
  function toggleVoice() {
    const s = sound();
    if (!s || busy) return;
    s.setVoice(!s.voiceOn);
    renderVoiceButtons();
    if (!s.voiceOn) { stopNarration(); return; }
    if (step === "history") renderScene(true);
    else if (step === "lito") { stopNarration(); narrate(t("lito.welcome"), true); }
    else if (step === "newgame" && !leaving) { stopNarration(); narrate(t("lito.newgame"), true, briefVoiceEnded); }
  }

  // 4. Bienvenida de LITO (pantalla propia de la presentación): texto animado, voz y botón.
  function showLito() {
    renderLito(true);
    startCanvas("lito");
  }
  function renderLito(speak) {
    const button = $("litoReady"), node = $("litoText");
    const text = t("lito.welcome");
    if (button) { button.textContent = t("lito.ready"); button.hidden = false; }
    renderVoiceButtons();
    typeText(node, text, true);
    if (speak) { stopNarration(); narrate(text, true); }
    focus(button);
  }
  function completeTyping() {
    const node = $("litoText");
    if ((step !== "lito" && step !== "newgame") || !node || !typingTimer) return;
    clearInterval(typingTimer); typingTimer = 0;
    node.textContent = node.dataset.fullText || "";
  }
  function confirmLito() {
    if (step !== "lito" || busy) return;
    const s = sound();
    s?.init?.();
    s?.startMusic?.();
    // Mismo objetivo y misma evidencia que la transmisión anterior: StarFlow decide.
    window.StarFlow?.recordObjective?.("lito_welcome.heard", { source: "transmission" });
    s?.effect?.("success");
    next();
  }

  // 5. Estación terrestre y menú: se revela solo aquí, con fundido desde azul noche.
  function enterMenu() {
    transition(() => {
      step = "menu";
      if (document.body) document.body.dataset.introStep = step;
      showScreen(null);
      const menu = $("menu"); if (menu) menu.hidden = false;
      const help = $("help"); if (help) help.hidden = true;
      window.litoState = "idle";
      updateReplayButton();
      setPresenting(false);
      if (typeof onMenu === "function") onMenu();
    }, () => {
      const wrap = $("introSequence");
      if (wrap && step === "menu") wrap.hidden = true;     // deja de interceptar clics
      document.dispatchEvent(new CustomEvent("starstep:intro-done", { detail: { step: "menu" } }));
    });
  }
  // ── NUEVA PARTIDA: bienvenida breve de LITO (sección 5.8) ─────
  // main.js ya reinició los datos. Fundido a azul noche sobre el menú, mensaje breve con LITO
  // animado y narración (si la voz está activa); a los ~3 s el telón se oscurece y se llama
  // a onDone (main.js navega a /astronauta). Sin botón: avanza sola. No registra nada.
  function newGameWelcome(options) {
    bind();
    const onDone = options?.onDone;
    if (busy || leaving || step === "newgame" || typeof onDone !== "function") return false;
    stopTimers();
    stopNarration();
    queue = [];
    briefDone = onDone;
    briefDue = false;
    transition(() => {
      step = "newgame";
      if (document.body) document.body.dataset.introStep = step;
      const help = $("help"); if (help) help.hidden = true;
      setPresenting(true);
      showScreen("introLito");
      renderBrief(true);
      startCanvas("lito");
      briefTimer = setTimeout(briefElapsed, Core.NEW_GAME_MS);
    });
    return true;
  }
  function renderBrief(speak) {
    const button = $("litoReady"), node = $("litoText");
    const text = t("lito.newgame");
    if (button) button.hidden = true;       // sin confirmación: avanza sola
    renderVoiceButtons();
    typeText(node, text, !reducedMotion());
    if (speak) { stopNarration(); narrate(text, true, briefVoiceEnded); }
    focus($("litoVoice"));                  // el foco queda dentro de la pantalla de LITO
  }
  // A los ~3 s: si LITO sigue hablando, se espera a que termine (con un margen máximo).
  function briefElapsed() {
    briefTimer = 0;
    if (step !== "newgame" || leaving) return;
    briefDue = true;
    if (window.litoState === "talking") briefTimer = setTimeout(leaveBrief, Core.NEW_GAME_VOICE_GRACE_MS);
    else leaveBrief();
  }
  function briefVoiceEnded() { if (step === "newgame" && briefDue) leaveBrief(); }
  function leaveBrief() {
    if (step !== "newgame" || leaving) return;
    leaving = true;
    stopTimers();
    const token = ++fadeToken;
    fadeTimers.forEach(clearTimeout);
    fadeTimers = [];
    busy = true;                            // la página se va: no se aceptan más clics
    const curtain = $("introFade");
    if (curtain) curtain.dataset.state = "in";
    const go = () => {
      if (token !== fadeToken) return;
      stopNarration();
      const done = briefDone; briefDone = null;
      if (typeof done === "function") done();
    };
    const ms = fadeMs();
    if (ms === 0) go(); else fadeTimers.push(setTimeout(go, ms));
  }

  function updateReplayButton() {
    const button = $("replayIntro");
    if (button) button.hidden = window.StarProgress?.hasSeenCinematic?.("history_intro") !== true;
  }

  // ── Escenas pixel art (sin recursos externos) ─────────────────
  const STARS = Array.from({ length: 90 }, (_, i) => ({ x: (i * 137 + 29) % 480, y: (i * 71 + 13) % 190, big: i % 13 === 0 }));
  function px(c, x, y, w, h, color) { c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function disc(c, x, y, r, color) { c.fillStyle = color; for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); c.fillRect(Math.round(x - w), Math.round(y + dy), w * 2, 1); } }
  function starfield(c, t, top, bottom) {
    const bands = [top, "#121845", "#18205A", bottom];
    for (let i = 0; i < bands.length; i++) px(c, 0, i * 68, 480, 68, bands[i]);
    for (let i = 0; i < STARS.length; i++) {
      const s = STARS[i];
      if (Math.sin(i * 1.7 + t * 2.2) > -0.55) px(c, s.x, s.y, s.big ? 2 : 1, s.big ? 2 : 1, i % 6 ? "#FFF8E7" : "#8FF0D8");
    }
  }
  function sceneCuriosity(c, t) {
    starfield(c, t, "#0A0E2A", "#22285E");
    disc(c, 392, 58, 18, "#FFE066"); disc(c, 400, 52, 16, "#121845");        // luna creciente
    const shoot = (t * 0.35) % 1;                                              // estrella fugaz
    if (shoot < 0.35) { const k = shoot / 0.35; for (let i = 0; i < 14; i++) px(c, 60 + k * 220 - i * 3, 30 + k * 70 - i, 2, 1, i ? "#B9BEE6" : "#FFF8E7"); }
    for (let x = 0; x < 480; x += 4) px(c, x, 206 + Math.round(Math.sin(x * 0.018) * 10), 4, 80, "#141A3F");  // colinas
    for (let i = 0; i < 5; i++) { px(c, 70 + i * 22, 176, 9, 32, "#2A3070"); }                               // círculo de piedras
    px(c, 66, 170, 106, 7, "#2A3070");
    const fire = Math.sin(t * 9) > 0 ? "#FFC93C" : "#FF8A3C";                                                // fogata
    px(c, 300, 202, 10, 4, "#4F45A6"); px(c, 302, 194 - (Math.sin(t * 7) > 0 ? 2 : 0), 6, 8, fire); px(c, 304, 190, 2, 4, "#FFF8E7");
    px(c, 326, 178, 6, 6, "#E4DFFF"); px(c, 325, 184, 8, 14, "#6E62CE"); px(c, 326, 198, 2, 8, "#262C66"); px(c, 331, 198, 2, 8, "#262C66");
    px(c, 331, 172, 2, 10, "#E4DFFF"); px(c, 333, 168, 2, 4, "#E4DFFF");                                    // señala el cielo
  }
  function sceneApollo(c, t) {
    if (window.StarArt?.launchScene) { window.StarArt.launchScene(c, t, (t * 0.11) % 0.62); return; }
    starfield(c, t, "#0A0E2A", "#22285E");
  }
  function sceneFootprints(c, t) {
    if (window.StarArt?.descentScene) window.StarArt.descentScene(c, t, 1);
    else { starfield(c, t, "#0A0E2A", "#22285E"); px(c, 0, 178, 480, 92, "#575C74"); }
    const steps = Math.floor((t * 3) % 14);
    for (let i = 0; i < steps; i++) { const x = 120 + i * 13, y = 238 - (i % 2) * 7; px(c, x, y, 7, 3, "#3E4256"); px(c, x + 1, y + 1, 5, 1, "#2B2F40"); }
    px(c, 360, 150, 2, 46, "#E4DFFF");                                         // bandera
    px(c, 362, 150, 22, 13, "#FFF8E7"); px(c, 362, 150, 9, 7, "#4F86D9");
    for (let i = 0; i < 3; i++) px(c, 371, 152 + i * 4, 13, 2, "#D9593A");
  }
  function sceneMars(c, t) {
    const sky = ["#E9A07E", "#E39371", "#DB8565", "#D47A5B", "#C96F52"];
    for (let i = 0; i < sky.length; i++) px(c, 0, i * 30, 480, 30, sky[i]);
    disc(c, 92, 42, 9, "#FCE8D2"); disc(c, 92, 42, 6, "#FFF8E7");
    for (let x = 0; x < 480; x += 6) px(c, x, 150 + Math.round(Math.sin(x * 0.013 + 1) * 12), 6, 40, "#B9553A");     // colinas
    px(c, 0, 186, 480, 84, "#A63A26");
    for (let x = 0; x < 480; x += 8) px(c, x, 184 + Math.round(Math.sin(x * 0.05) * 3), 8, 6, "#D9593A");
    for (let i = 0; i < 16; i++) px(c, (i * 67) % 480, 200 + (i * 29) % 60, 6 + (i % 3) * 4, 3, "#7A2818");
    const x = ((t * 22) % 560) - 70;                                           // rover y huellas
    for (let k = 10; k < 160; k += 9) px(c, x - k, 238, 5, 2, "#7A2818");
    px(c, x - 26, 210, 52, 4, "#3E4256"); px(c, x - 30, 207, 60, 3, "#4F86D9");        // panel solar
    px(c, x - 18, 214, 36, 12, "#C3C7D6"); px(c, x - 18, 214, 36, 2, "#FFF8E7");       // cuerpo
    px(c, x + 10, 190, 3, 24, "#868CA4"); px(c, x + 6, 186, 11, 6, "#575C74"); px(c, x + 14, 188, 2, 2, "#8FF0D8"); // mástil
    for (let w = -1; w <= 1; w++) { px(c, x + w * 16 - 5, 226, 10, 10, "#262C66"); px(c, x + w * 16 - 2, 229, 4, 4, "#868CA4"); }
  }
  function sceneStory(c, t) {
    starfield(c, t, "#0A0E2A", "#1A1F4D");
    disc(c, 110, 92, 34, "#C3C7D6"); disc(c, 100, 84, 8, "#868CA4"); disc(c, 124, 104, 6, "#868CA4");           // Luna
    disc(c, 372, 92, 32, "#D9593A"); disc(c, 362, 82, 9, "#A63A26"); disc(c, 384, 104, 7, "#F7B08E");           // Marte
    disc(c, 240, 330, 118, "#2D69B8"); disc(c, 200, 240, 22, "#4C9A62"); disc(c, 286, 232, 16, "#4C9A62");     // Tierra
    const glow = Math.sin(t * 2) > 0 ? "#8FF0D8" : "#ABA1F5";
    px(c, 146, 92, 70, 1, glow); px(c, 264, 92, 76, 1, glow);                                                     // dos historias
    if (window.StarArt?.lito) window.StarArt.lito(c, 228, 120 + Math.round(Math.sin(t * 2.4) * 3), t, "earth", "happy");
  }
  // LITO en su propia pantalla (canvas 120×90 ampliado con píxeles nítidos).
  function drawLito(c, t) {
    c.clearRect?.(0, 0, 120, 90);
    const glow = 30 + Math.round(Math.sin(t * 2) * 2);
    disc(c, 60, 46, glow, "rgba(171, 161, 245, 0.16)");
    disc(c, 60, 46, glow - 10, "rgba(143, 240, 216, 0.14)");
    if (window.StarArt?.lito) window.StarArt.lito(c, 60, 46, t, "earth", window.litoState === "talking" ? "excited" : "happy");
  }
  const DRAW = { curiosity: sceneCuriosity, apollo: sceneApollo, footprints: sceneFootprints, mars: sceneMars, story: sceneStory };
  // Un solo bucle de animación activo: se detiene al cambiar de paso.
  function startCanvas(kind) {
    const canvas = $(kind === "lito" ? "litoCanvas" : "introCanvas");
    const ctx = canvas?.getContext?.("2d");
    if (!ctx || typeof requestAnimationFrame !== "function") return;
    if (frame && typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
    ctx.imageSmoothingEnabled = false;
    const owner = step;                     // «lito» o «newgame» dibujan a LITO
    const loop = ms => {
      if (step !== owner) { frame = 0; return; }
      try {
        if (kind === "lito") drawLito(ctx, ms / 1000);
        else DRAW[Core.SCENES[sceneIndex]](ctx, ms / 1000);
      } catch (error) { console.warn("Intro: escena no disponible", error); }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
  }

  // ── Eventos (una sola vez) ────────────────────────────────────
  function bind() {
    if (bound) return;
    bound = true;
    $("introLangEs")?.addEventListener("click", () => chooseLanguage("es"));
    $("introLangEn")?.addEventListener("click", () => chooseLanguage("en"));

    const video = hv();

    if (video) {

      $("historyVideoPlay").addEventListener("click", () => {

        if (!videoActive || busy) return;

        if (video.paused) {
          playHistoryVideo();
        } else {
          video.pause();
        }

      });

      $("historyVideoMute").addEventListener("click", () => {
        video.muted = !video.muted;
      });

      $("historyVideoSkip").addEventListener("click", () => {
        finishHistoryVideo(false);
      });

      for (const event of [
        "play", "pause", "timeupdate",
        "loadedmetadata", "volumechange"
      ]) {
        video.addEventListener(event, updateHistoryVideo);
      }

      video.addEventListener("ended", () => {
        finishHistoryVideo(true);
      });

      video.addEventListener("error", fallbackHistoryVideo);

      document.addEventListener("visibilitychange", () => {
        if (document.hidden && videoActive) video.pause();
      });

      window.addEventListener("pagehide", () => {
        if (videoActive) video.pause();
      });

    }

    $("introNext")?.addEventListener("click", nextScene);
    
    $("introSkip")?.addEventListener("click", skipHistory);
    $("introVoice")?.addEventListener("click", toggleVoice);
    $("litoVoice")?.addEventListener("click", toggleVoice);
    $("litoReady")?.addEventListener("click", confirmLito);
    $("litoText")?.addEventListener("click", completeTyping);
    document.addEventListener("starstep:language", () => {
      if (step === "language") renderLanguage();

      else if (step === "history") {
        if (videoActive) {
          updateHistoryVideo();
        } else {
          renderScene(true);
        }
      }
    
      else if (step === "lito") renderLito(true);
      else if (step === "newgame" && !leaving) renderBrief(true);
    });
    window.addEventListener("pagehide", () => { stopTimers(); stopNarration(); fadeTimers.forEach(clearTimeout); });
  }

  function isReload() {
    try {
      const entry = typeof performance !== "undefined" && performance.getEntriesByType?.("navigation")?.[0];
      return entry?.type === "reload";
    } catch { return false; }
  }

  // ── Interfaz pública ──────────────────────────────────────────
  function start(options) {
    bind();
    const flow = window.StarFlow;
    const firstPage = typeof flow?.isInitialOpening === "function" ? flow.isInitialOpening() : true;
    const plan = Core.planEntry({
      initialOpening: firstPage || isReload(),
      historySeen: window.StarProgress?.hasSeenCinematic?.("history_intro") === true,
      welcomeCompleted: flow?.isStageCompleted?.("lito_welcome") === true
    });
    run(plan, options?.onMenu);
    return plan.slice();
  }
  // «VER INTRODUCCIÓN» desde el menú: ya vista, así que se puede saltar. No toca el progreso.
  function replayHistory() {
    bind();
    if (busy || window.StarProgress?.hasSeenCinematic?.("history_intro") !== true) return false;
    run(["history", "menu"]);
    return true;
  }

  window.StarIntro = Object.freeze({
    start, replayHistory, newGameWelcome, planEntry: Core.planEntry,
    get step() { return step; },
    get transitioning() { return busy; }
  });
})();
