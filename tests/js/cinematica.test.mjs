// Pruebas de la cinemática de Apollo 11 (Bloque 1): reproductor, subtítulos y su lugar en
// /rock-roll. Ejecutar desde la raíz:  node --test tests/js/*.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { FakeElement, makePage, newTab, openHome, template } from "./navegador-simulado.mjs";

const require = createRequire(import.meta.url);
const Core = require("../../static/js/cinematica.js");
const asset = name => new URL("../../static/assets/videos/" + name, import.meta.url);
const ID = "rock_roll_intro";

// ── Guion y subtítulos ──────────────────────────────────────────
test("subtítulos ES/EN: los .vtt coinciden con el guion y tienen los mismos tiempos", () => {
  for (const lang of ["es", "en"]) {
    // Git en Windows puede convertir los saltos de línea a CRLF al descargar: se comparan
    // normalizados (el reproductor y parseVTT también ignoran \r).
    const file = readFileSync(asset(`rock-roll-intro.${lang}.vtt`), "utf8").replace(/\r\n/g, "\n");
    assert.equal(file, Core.toVTT(ID, lang), `${lang}: regenerar con toVTT()`);
    assert.ok(file.startsWith("WEBVTT\n"));
  }
  const es = Core.parseVTT(readFileSync(asset("rock-roll-intro.es.vtt"), "utf8"));
  const en = Core.parseVTT(readFileSync(asset("rock-roll-intro.en.vtt"), "utf8"));
  assert.equal(es.length, en.length);
  assert.ok(es.length >= 30);
  const duration = Core.VIDEOS[ID].duration;
  es.forEach((cue, i) => {
    assert.equal(cue.start, en[i].start); assert.equal(cue.end, en[i].end);
    assert.ok(cue.start < cue.end && cue.end <= duration, `frase ${i}`);
    if (i) assert.ok(cue.start >= es[i - 1].end, `sin superposición en ${i}`);
    assert.notEqual(cue.text, en[i].text, `frase ${i} traducida`);
  });
  assert.match(es[8].text, /Base Tranquilidad/);
  assert.match(en[8].text, /The Eagle has landed/);
  assert.equal(Core.cueAt(Core.cuesFor(ID, "es"), 13).text, es[2].text);
  assert.equal(Core.cueAt(Core.cuesFor(ID, "es"), 10), null, "silencio entre frases");
});

test("narración alternativa: cubre todo el guion, en orden y sin repetir", () => {
  const slides = Core.VIDEOS[ID].slides;
  const covered = slides.flatMap(([a, b]) => Array.from({ length: b - a + 1 }, (_, k) => a + k));
  assert.deepEqual(covered, Core.VIDEOS[ID].cues.map((_, i) => i));
  for (const lang of ["es", "en"]) assert.equal(Core.slidesFor(ID, lang).length, slides.length);
});

test("reglas: la primera vez no se salta ni se adelanta; vista o repetida, sí", () => {
  assert.equal(Core.canSkip({ seen: false, mode: "chapter" }), false);
  assert.equal(Core.canSkip({ seen: true, mode: "chapter" }), true);
  assert.equal(Core.canSkip({ seen: false, mode: "replay" }), true);
  assert.equal(Core.clampSeek(90, { maxWatched: 30, seen: false, duration: 152.5 }), 30, "no adelanta más allá de lo visto");
  assert.equal(Core.clampSeek(10, { maxWatched: 30, seen: false, duration: 152.5 }), 10, "retroceder sí");
  assert.equal(Core.clampSeek(90, { maxWatched: 30, seen: true, duration: 152.5 }), 90);
  assert.equal(Core.clampSeek(999, { seen: true, duration: 152.5 }), 152.5);
  assert.equal(Core.formatTime(152.5), "2:32");
});

test("video: archivo local, MP4 con inicio rápido (moov antes de mdat)", () => {
  const file = new URL("../../static/assets/videos/rock-roll-intro.mp4", import.meta.url);
  assert.ok(statSync(file).size > 1_000_000);
  const head = readFileSync(file).subarray(0, 4096).toString("latin1");
  assert.ok(head.indexOf("moov") > 0 && (head.indexOf("mdat") < 0 || head.indexOf("moov") < head.indexOf("mdat")));
  assert.equal(Core.VIDEOS[ID].src, "/static/assets/videos/rock-roll-intro.mp4");
});

// ── Navegador simulado ──────────────────────────────────────────
class FakeVideo extends FakeElement {
  constructor() { super("video"); this.paused = true; this.ended = false; this.currentTime = 0; this.duration = 152.5; this.muted = false; this.volume = 1; this.playResult = "ok"; this.plays = 0; }
  play() {
    this.plays++;
    if (this.playResult === "blocked") return Promise.reject(Object.assign(new Error("blocked"), { name: "NotAllowedError" }));
    this.paused = false; this.fire("play"); return Promise.resolve();
  }
  pause() { if (!this.paused) { this.paused = true; this.fire("pause"); } }
  fire(type) { for (const fn of this.listeners[type] || []) fn({ type, target: this }); }
  at(t) { this.currentTime = t; this.fire("timeupdate"); }
}
const tick = () => new Promise(r => setTimeout(r, 0));
const IDS = ["worlds", "titleBlock", "acts", "lito", "briefing", "nextButton", "launchButton", "pauseButton", "progress", "voiceButton", "sceneLabel", "missionText", "cinematic"];

function tabAtBriefing() {
  const tab = newTab();
  const { StarFlow, StarProgress } = openHome(tab).ctx;
  StarFlow.recordObjective("lito_welcome.heard", { source: "transmission" });
  StarProgress.setPlayer({ alias: "ARIEL", avatar: "vice" });
  StarFlow.recordObjective("profile.alias", { source: "avatar_form", alias: "ARIEL" });
  StarFlow.recordObjective("cadet_custom.avatar", { source: "avatar_form", avatar: "vice" });
  assert.equal(StarFlow.recordObjective("chapter_select.chapter1", { source: "chapter_menu" }).ok, true);
  return tab;
}
function openRockRoll(tab, { playResult = "ok", withPlayer = true } = {}) {
  const el = Object.fromEntries(IDS.map(id => [id, new FakeElement("div", { id })]));
  el.cinematic.hidden = true;
  const canvas = new FakeElement("canvas", { id: "stars" }); canvas.getContext = () => ({ fillRect() {}, set fillStyle(v) {}, set globalAlpha(v) {} });
  const page = makePage({ path: "/rock-roll", tab, elements: [...Object.values(el), canvas] });
  const videos = [], sound = { calls: [], voiceOn: false, stopVoice() { this.calls.push("stopVoice"); }, speak(text) { this.calls.push("speak:" + text.slice(0, 12)); }, setVoice() {}, stopAll() { this.calls.push("stopAll"); }, effect() {} };
  const create = page.document.createElement;
  page.document.createElement = tag => { if (tag === "video") { const v = new FakeVideo(); v.playResult = playResult; videos.push(v); return v; } return create(tag); };
  page.document.removeEventListener = () => {};
  page.ctx.matchMedia = () => ({ matches: true });           // movimiento reducido: sin fundidos
  const frames = []; page.ctx.requestAnimationFrame = fn => frames.push(fn);
  page.ctx.StarSound = sound;
  page.ctx.Promise = Promise;
  page.load("main.js", "progreso.js", "flujo-definicion.js", "flujo.js", ...(withPlayer ? ["cinematica.js"] : []), "rock-roll.js").ready();
  let time = 0;
  const elapse = ms => { for (let i = 0; i <= ms / 100; i++) { const pending = frames.splice(0); time += 100; for (const fn of pending) fn(time); } };
  const root = () => el.cinematic.children[0];
  const find = cls => root()?.findAll(n => String(n.className || "").split(" ").includes(cls))[0];
  return { page, el, videos, video: () => videos[0], sound, elapse, root, find };
}

test("Rock & Roll: la cinemática se ve completa antes de LITO, sin saltar ni registrar nada", async () => {
  const tab = tabAtBriefing();
  const r = openRockRoll(tab);
  const flow = r.page.ctx.StarFlow;
  const before = flow.getState().revision;
  assert.equal(r.el.cinematic.hidden, false, "reproductor a la vista");
  assert.ok(r.sound.calls.includes("stopAll"), "música y voz detenidas");
  const v = r.video();
  assert.equal(v.plays, 1, "intenta reproducir solo");
  await tick();
  assert.equal(r.find("cine-skip").hidden, true, "sin SALTAR la primera vez");
  assert.equal(r.find("cine-start").hidden, true);
  // Las escenas no avanzan mientras dura el video y LITO no habla.
  r.elapse(20000);
  assert.equal(r.el.nextButton.disabled, undefined, "ninguna escena se mostró todavía (showScene no corrió)");
  assert.equal(r.el.missionText.textContent, "");
  assert.ok(!r.sound.calls.some(c => c.startsWith("speak:")), "LITO no habla durante el video");
  // Subtítulos ES visibles (cubren el inglés incrustado); en EN, solo para lectores de pantalla.
  v.at(13);
  assert.equal(r.find("cine-caption").hidden, false);
  assert.match(r.find("cine-caption").textContent, /tres astronautas/);
  r.page.ctx.StarI18n.setLang("en");
  assert.equal(r.find("cine-caption").hidden, true, "en inglés ya están incrustados");
  assert.match(r.find("cine-sr").textContent, /three astronauts/);
  r.find("cine-cc").click();
  assert.equal(r.find("cine-caption").hidden, false, "se pueden activar en inglés");
  r.page.ctx.StarI18n.setLang("es");
  // No se puede adelantar más allá de lo visto.
  v.currentTime = 120; v.fire("seeking");
  assert.ok(v.currentTime <= 14.5, `volvió a ${v.currentTime}`);
  r.find("cine-progress").value = "900"; for (const fn of r.find("cine-progress").listeners.input) fn({});
  assert.ok(v.currentTime <= 14.5);
  // Pausa y ocultar la pestaña pausan.
  r.find("cine-play").click(); assert.equal(v.paused, true);
  r.find("cine-play").click(); assert.equal(v.paused, false);
  assert.equal(flow.getState().revision, before, "el video no registra objetivos");
  // Termina → vista, y sigue la presentación (tres actos → LITO → instrucciones).
  for (let t = 20; t <= 152; t += 1) v.at(t);
  v.ended = true; v.fire("ended");
  assert.equal(r.page.ctx.StarProgress.hasSeenCinematic("rock_roll_intro"), true);
  assert.equal(r.el.cinematic.hidden, true);
  assert.equal(r.el.acts.hidden, false, "escena «tres actos» (el título y «Dos mundos» del inicio se omiten)");
  assert.match(r.el.sceneLabel.textContent, /TRES ACTOS/);
  r.elapse(5200);
  assert.equal(r.el.briefing.hidden, false, "mensaje breve de LITO");
  assert.match(r.el.missionText.textContent,/robot geólogo/);

  r.el.nextButton.click();
  assert.match(r.el.missionText.textContent,/testigos/);

  r.el.nextButton.click();
  assert.match(r.el.missionText.textContent,/nuestro turno/);

  r.el.nextButton.click();
  assert.match(r.el.missionText.textContent,/Apollo 11/);

  r.el.nextButton.click();

  assert.equal(r.el.missionText.textContent,"","instrucciones en vuelo");
  assert.equal(r.el.launchButton.hidden, false);
  r.el.launchButton.click();
  assert.equal(flow.getCurrentStage(), "launch");
  assert.equal(r.page.ctx.__navigated, "/despegue?inicio=capitulo");
});

test("Rock & Roll: con la cinemática ya vista se puede saltar (también tras NUEVA PARTIDA)", async () => {
  const tab = tabAtBriefing();
  openRockRoll(tab).page.ctx.StarProgress.markCinematicSeen("rock_roll_intro");
  // Nueva partida: la cinemática vista es preferencia del dispositivo y se conserva.
  const home = openHome(tab);
  home.ctx.StarProgress.resetPlayerData();
  assert.equal(openHome(tab).ctx.StarProgress.hasSeenCinematic("rock_roll_intro"), true);
  const again = tabAtBriefing(); again.localStorage.setItem("starstep_cinematicas", tab.localStorage.getItem("starstep_cinematicas"));
  const r = openRockRoll(again);
  await tick();
  assert.equal(r.find("cine-skip").hidden, false);
  r.video().currentTime = 120; r.video().fire("seeking");
  assert.equal(r.video().currentTime, 120, "ya vista: se puede adelantar");
  r.find("cine-skip").click();
  assert.equal(r.el.cinematic.hidden, true);
  assert.equal(r.el.acts.hidden, false);
  assert.equal(r.page.ctx.StarFlow.getCurrentStage(), "chapter_briefing", "saltar no registra nada");
});

test("reproducción bloqueada por el navegador: botón propio para comenzar", async () => {
  const r = openRockRoll(tabAtBriefing(), { playResult: "blocked" });
  await tick(); await tick();
  assert.equal(r.find("cine-start").hidden, false);
  assert.match(r.find("cine-start").textContent, /VER CINEMÁTICA/);
  assert.match(r.find("cine-status").textContent, /Tocá el botón/);
  r.video().playResult = "ok";
  r.find("cine-start").click(); await tick();
  assert.equal(r.find("cine-start").hidden, true);
  assert.equal(r.video().paused, false);
});

test("si Rock & Roll falla, solo permite reintentar sin avance",async()=>{
    const r=openRockRoll(tabAtBriefing());

    await tick();
    r.video().fire("error");

    assert.equal(r.find("cine-narrative").hidden,true);
    assert.equal(r.find("cine-start").hidden,false);
    assert.match(r.find("cine-status").textContent,/reintentar/);

    assert.equal(
        r.page.ctx.StarProgress.hasSeenCinematic("rock_roll_intro"),
        false
    );

    assert.equal(
        r.page.ctx.StarFlow.getCurrentStage(),
        "chapter_briefing"
    );

    r.find("cine-start").click();

    await tick();

    assert.equal(r.video().paused,false);
});

test("ocultar la pestaña pausa el video", async () => {
  const r = openRockRoll(tabAtBriefing());
  await tick();
  assert.equal(r.video().paused, false);
  r.page.document.hidden = true;
  r.page.document.dispatchEvent({ type: "visibilitychange" });
  assert.equal(r.video().paused, true);
});

test("bitácora: VER CINEMÁTICA solo después de verla; abre en modo repetición con CERRAR", async () => {
  const tab = tabAtBriefing();
  const button = new FakeElement("button", { dataset: { cinematicReplay: "rock_roll_intro" } });
  const title = new FakeElement("h2", { dataset: { cineI18n: "galleryTitle" } });
  const page = makePage({ path: "/bitacora", tab, elements: [button, title] });
  const original = page.document.querySelectorAll;
  page.document.querySelectorAll = sel => sel === "[data-cinematic-replay]" ? [button] : sel === "[data-cine-i18n]" ? [title] : original(sel);
  const create = page.document.createElement;
  page.document.createElement = tag => tag === "video" ? new FakeVideo() : create(tag);
  page.document.removeEventListener = () => {};
  page.ctx.matchMedia = () => ({ matches: true });
  page.ctx.Promise = Promise;
  page.load("main.js", "progreso.js", "flujo-definicion.js", "flujo.js", "cinematica.js").ready();
  assert.equal(button.disabled, true, "bloqueado hasta verla");
  assert.equal(title.textContent, "✦ CINEMÁTICA · APOLLO 11");
  page.ctx.StarProgress.markCinematicSeen("rock_roll_intro");
  page.ctx.StarI18n.setLang("en");
  assert.equal(button.disabled, false);
  assert.equal(title.textContent, "✦ CINEMATIC · APOLLO 11");
  const before = page.ctx.StarFlow.getState().revision;
  button.click(); await tick();
  const host = page.document.body.children.at(-1);
  const close = host.findAll(n => String(n.className).includes("cine-skip"))[0];
  assert.equal(close.hidden, false);
  assert.equal(close.textContent, "CLOSE ✕");
  close.click();
  assert.equal(host.hidden, true);
  assert.equal(page.ctx.StarFlow.getState().revision, before, "repetir no toca la partida");
});

test("plantillas: /rock-roll carga el reproductor antes de la presentación; la bitácora ofrece repetirla", () => {
  const html = template("rock-roll.html");
  const pos = f => html.indexOf(`js/${f}`);
  assert.ok(pos("flujo.js") < pos("cinematica.js") && pos("cinematica.js") < pos("rock-roll.js"));
  assert.match(html, /id="cinematic"[^>]*hidden/);
  assert.match(html, /css\/cinematica\.css/);
  const diary = template("bitacora.html");
  assert.match(diary, /data-cinematic-replay="rock_roll_intro"/);
  assert.match(diary, /js\/cinematica\.js/);
});
