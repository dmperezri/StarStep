"use strict";
/*
 * StarStep · Cinemáticas de video (reproductor integrado).
 *
 * Uso: StarCinematic.mount(contenedor, { id, mode, onDone }).
 *   mode "chapter" (por defecto): parte obligatoria del capítulo. La primera vez se ve
 *        completa: sin SALTAR y sin adelantar más allá de lo ya visto. Al terminar se
 *        marca como vista (StarProgress.markCinematicSeen, preferencia del dispositivo).
 *   mode "replay": repetición desde la bitácora. Se puede saltar, adelantar y cerrar.
 *
 * Es solo presentación: no registra objetivos ni toca StarFlow. Quien la monta decide
 * qué sigue (onDone). Si el video no se puede reproducir, se ofrece su contenido como
 * narración en texto (mismo guion que los subtítulos) y se puede continuar.
 *
 * El guion (CUES) es la fuente única de los subtítulos: los archivos .vtt de
 * static/assets/videos/ se generan con toVTT() y una prueba comprueba que coinciden.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.StarCinematicCore = api;
})(typeof window !== "undefined" ? window : null, function () {
  // Guion del video del Capítulo 1 (subtítulos incrustados en inglés, transcritos con sus
  // tiempos; traducción al español del equipo de desarrollo). [inicio, fin, ES, EN]
  const ROCK_ROLL_CUES = Object.freeze([
    [3.0, 6.2, "Esta es la historia de un viaje a la Luna…", "This is the story of a journey to the Moon…"],
    [6.6, 8.6, "…y de las rocas que trajimos de regreso.", "…and of the rocks we brought back."],
    [11.8, 15.8, "Después del despegue, tres astronautas viajaron unos cuatro días para llegar a la Luna.", "After liftoff, three astronauts traveled for about four days to reach the Moon."],
    [16.2, 19.4, "Michael Collins permanecería en órbita a bordo del módulo Columbia,", "Michael Collins would remain in orbit aboard the Columbia module,"],
    [19.4, 24.6, "mientras Neil Armstrong y Buzz Aldrin descenderían a la superficie en el módulo lunar Eagle.", "while Neil Armstrong and Buzz Aldrin would descend to the surface in the lunar module Eagle."],
    [27.0, 30.2, "El 20 de julio de 1969, el Eagle se separó del Columbia", "On July 20, 1969, the Eagle separated from the Columbia"],
    [30.6, 33.0, "y encendió su motor de descenso durante más de doce minutos.", "and fired its descent engine for over twelve minutes."],
    [33.4, 36.2, "Abajo se extendía el Mar de la Tranquilidad: una llanura vasta y oscura.", "Below lay the Sea of Tranquility—a vast, dark plain."],
    [44.6, 49.8, "«Houston, aquí Base Tranquilidad. El Eagle ha alunizado.»", "“Houston, Tranquility Base here. The Eagle has landed.”"],
    [51.0, 54.6, "Horas después, Neil Armstrong bajó por la escalera y pisó la Luna.", "Hours later, Neil Armstrong descended the ladder and stepped onto the Moon."],
    [55.0, 57.0, "Diecinueve minutos más tarde, Buzz Aldrin lo siguió.", "Nineteen minutes later, Buzz Aldrin followed him."],
    [57.8, 62.4, "«Es un pequeño paso para un hombre, un gran salto para la humanidad.»", "“That's one small step for a man, one giant leap for mankind.”"],
    [64.6, 67.8, "Una de sus primeras tareas fue recoger una muestra «de emergencia»,", "One of their first tasks was to collect an ‘emergency’ sample,"],
    [68.2, 71.0, "por si tenían que irse de prisa.", "in case they had to leave in a hurry."],
    [71.4, 73.4, "Antes de plantar la bandera o tomar fotos,", "Before planting the flag or taking photos,"],
    [73.8, 77.0, "la prioridad era asegurar un pedazo de la Luna.", "the priority was to secure a piece of the Moon."],
    [79.0, 83.4, "Durante unas dos horas caminaron, tomaron fotografías y recogieron rocas y suelo.", "For about two hours, they walked around, took photographs, and collected rocks and soil."],
    [83.8, 87.0, "Se alejaron hasta 100 metros del módulo", "They ventured up to 100 meters away from the module"],
    [87.4, 89.4, "y reunieron 21,55 kilogramos de material lunar.", "and gathered 21.55 kilograms of lunar material."],
    [92.2, 93.8, "También dejaron instrumentos científicos:", "They also left behind scientific instruments:"],
    [94.2, 95.8, "un sismómetro para detectar sismos lunares,", "a seismometer to detect moonquakes,"],
    [96.2, 97.8, "y un retrorreflector: un conjunto de espejos", "and a retroreflector—an array of mirrors"],
    [98.2, 101.0, "que sirve para medir la distancia a la Tierra con láser.", "used to measure the distance to Earth via laser."],
    [101.4, 103.4, "Ese espejo todavía funciona hoy.", "That mirror is still in operation today."],
    [105.4, 109.8, "Después de 21 horas y media en la Luna, el Eagle despegó,", "After 21 and a half hours on the Moon, the Eagle took off,"],
    [110.2, 112.6, "se reunió con Collins y comenzó el viaje de regreso.", "rendezvoused with Collins, and began the journey home."],
    [112.6, 116.6, "El 24 de julio, la cápsula Columbia amerizó en el océano Pacífico.", "On July 24, the Columbia capsule splashed down in the Pacific Ocean."],
    [117.0, 118.6, "Las rocas habían llegado a casa.", "The rocks had arrived home."],
    [121.0, 123.4, "En el laboratorio, las rocas revelaron un secreto.", "In the laboratory, the rocks revealed a secret."],
    [123.4, 126.6, "Eran basalto: lava que se enfrió hace unos 3.600 millones de años.", "They were basalt—lava that cooled about 3.6 billion years ago."],
    [127.0, 128.6, "Esos agujeritos son burbujas de gas", "Those tiny holes are gas bubbles"],
    [129.0, 131.8, "que quedaron atrapadas cuando la lava todavía estaba caliente.", "that were trapped while the lava was still hot."],
    [134.6, 137.8, "Los mares oscuros que vemos desde la Tierra son lava antigua.", "The dark seas we see from Earth are ancient lava."],
    [138.2, 141.0, "La Luna, tan tranquila hoy, tuvo un pasado de fuego.", "The Moon, so tranquil today, once had a fiery past."],
    [144.0, 147.2, "Capítulo I · Rock & Roll. La roca cuenta la historia.", "Chapter I · Rock & Roll. The rock tells the story."],
    [147.4, 149.8, "Ahora es tu turno de investigar estas rocas.", "Now, it's your turn to investigate these rocks."]
  ]);
  // Agrupación del guion en partes para la narración alternativa (índices de CUES).
  const ROCK_ROLL_SLIDES = Object.freeze([[0, 1], [2, 4], [5, 8], [9, 11], [12, 15], [16, 18], [19, 23], [24, 27], [28, 33], [34, 35]]);

  const VIDEOS = Object.freeze({
    mars_intro: Object.freeze({
      src: "/static/assets/videos/mars-blueberry-hunt.mp4", duration: 168.4, width: 1280, height: 720,
      tracks: Object.freeze({es:"/static/assets/videos/mars-blueberry-hunt.es.vtt",en:"/static/assets/videos/mars-blueberry-hunt.en.vtt"}),
      cues: Object.freeze([[0, 9, "La Luna guarda las huellas del fuego. Marte guarda las del agua.", "The Moon holds traces of fire. Mars holds traces of water."], [9, 17, "¿Alguna vez hubo agua en Marte?", "Was Mars ever wet?"], [17, 27, "En julio de 2003, Opportunity partió hacia Marte.", "In July 2003, Opportunity launched toward Mars."], [27, 42, "Las bolsas de aire amortiguaron el aterrizaje en el cráter Eagle.", "Airbags cushioned the landing in Eagle Crater."], [42, 54, "Diseñado para 90 soles, el rover comenzó a estudiar rocas en capas.", "Designed for 90 sols, the rover began studying layered rocks."], [54, 66, "Halló pequeñas esférulas, llamadas blueberries.", "It found tiny spherules, nicknamed blueberries."], [66, 78, "Cámaras, microscopio, RAT y espectrómetros ayudaron a investigar.", "Cameras, a microscope, RAT and spectrometers helped investigate."], [78, 90, "En El Capitan observó sulfatos y huellas de cristales de sal.", "At El Capitan, it observed sulfates and traces of salt crystals."], [90, 103, "El análisis de las esférulas mostró hematita.", "Analysis of the spherules revealed hematite."], [103, 120, "El agua pudo favorecer el crecimiento de esférulas; la erosión las dejó al descubierto.", "Water may have helped spherules grow; erosion exposed them."], [120, 132, "Se compararon distintas explicaciones. El agua era la que mejor encajaba.", "Different explanations were compared. Water was the best fit."], [132, 145, "Opportunity recorrió más de 45 km durante casi 15 años.", "Opportunity covered more than 45 km in nearly 15 years."], [145, 162, "Una tormenta global de polvo cortó su energía. El último contacto fue el 10 de junio de 2018.", "A global dust storm cut its power. Last contact was June 10, 2018."], [162, 168, "Ahora te toca investigar las rocas de Marte.", "Now it is your turn to investigate the rocks of Mars."]]), slides: Object.freeze([[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10], [11, 11], [12, 12], [13, 13]])
    }),
    rock_roll_intro: Object.freeze({
      src: "/static/assets/videos/rock-roll-intro.mp4",
      duration: 152.5,
      width: 1024, height: 576,
      tracks: Object.freeze({ es: "/static/assets/videos/rock-roll-intro.es.vtt", en: "/static/assets/videos/rock-roll-intro.en.vtt" }),
      cues: ROCK_ROLL_CUES,
      slides: ROCK_ROLL_SLIDES
    })
  });
  const LANGS = Object.freeze(["es", "en"]);

  function cuesFor(id, lang) {
    const video = VIDEOS[id];
    if (!video) return [];
    const column = lang === "en" ? 3 : 2;
    return video.cues.map(c => ({ start: c[0], end: c[1], text: c[column] }));
  }
  function stamp(seconds) {
    const ms = Math.round(seconds * 1000);
    const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60, r = ms % 1000;
    const p = (n, w) => String(n).padStart(w, "0");
    return `${p(h, 2)}:${p(m, 2)}:${p(s, 2)}.${p(r, 3)}`;
  }
  function toVTT(id, lang) {
    const lines = ["WEBVTT", ""];
    cuesFor(id, lang).forEach((c, i) => { lines.push(String(i + 1), `${stamp(c.start)} --> ${stamp(c.end)}`, c.text, ""); });
    return lines.join("\n");
  }
  function parseVTT(text) {
    const toSeconds = v => { const parts = v.trim().split(":").map(Number); return parts.reduce((acc, n) => acc * 60 + n, 0); };
    const cues = [];
    for (const block of String(text).replace(/\r/g, "").split(/\n\n+/)) {
      const rows = block.split("\n").filter(Boolean);
      const timing = rows.findIndex(r => r.includes("-->"));
      if (timing < 0) continue;
      const [a, b] = rows[timing].split("-->");
      cues.push({ start: toSeconds(a), end: toSeconds(b.trim().split(/\s+/)[0]), text: rows.slice(timing + 1).join("\n") });
    }
    return cues;
  }
  function cueAt(cues, t) {
    for (const c of cues) if (t >= c.start && t < c.end) return c;
    return null;
  }
  // La primera vez en el capítulo no se salta ni se adelanta; en la repetición sí.
  function canSkip({ seen = false, mode = "chapter" } = {}) { return mode === "replay" || seen === true; }
  function clampSeek(target, { maxWatched = 0, seen = false, mode = "chapter", duration = Infinity } = {}) {
    const limit = canSkip({ seen, mode }) ? duration : Math.max(0, maxWatched);
    return Math.max(0, Math.min(Number(target) || 0, limit, duration));
  }
  function formatTime(seconds) {
    const s = Math.max(0, Math.floor(Number(seconds) || 0));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }
  function slidesFor(id, lang) {
    const video = VIDEOS[id];
    if (!video) return [];
    const cues = cuesFor(id, lang);
    return video.slides.map(([a, b]) => cues.slice(a, b + 1).map(c => c.text).join(" "));
  }

  return Object.freeze({ VIDEOS, LANGS, cuesFor, toVTT, parseVTT, cueAt, canSkip, clampSeek, formatTime, slidesFor });
});

/* ── Navegador ───────────────────────────────────────────────── */
(function () {
  if (typeof window === "undefined" || typeof document === "undefined" || !window.StarCinematicCore) return;
  const Core = window.StarCinematicCore;
  const FADE_MS = 420;
  const TEXT = {
    es: {
      label: "Cinemática · Apollo 11", start: "▶ VER CINEMÁTICA", play: "▶ REPRODUCIR", pause: "❚❚ PAUSA",
      soundOn: "SONIDO: SÍ", soundOff: "SONIDO: NO", volume: "Volumen",
      ccOn: "SUBTÍTULOS: SÍ", ccOff: "SUBTÍTULOS: NO", full: "PANTALLA COMPLETA", exitFull: "SALIR DE PANTALLA COMPLETA",
      skip: "SALTAR CINEMÁTICA ›", close: "CERRAR ✕", progress: "Progreso del video",
      firstTime: "Primera vez: mirá la cinemática completa para comenzar la misión.",
      blocked: "Tocá el botón para comenzar la cinemática con sonido.",
      paused: "Cinemática en pausa.",
      retry: "No se pudo reproducir. Pulsa Reproducir para reintentar.",
      error: "No se pudo reproducir el video. Te contamos la misma historia con texto.",
      next: "SIGUIENTE ›", finish: "CONTINUAR ›", part: "Parte {n} de {t}",
      galleryTitle: "✦ CINEMÁTICA · APOLLO 11", galleryButton: "VER CINEMÁTICA",
      galleryHint: "El video del Capítulo 1: de la Tierra a la Luna y de regreso con las rocas.",
      galleryLocked: "Disponible después de verla al comenzar Rock & Roll."
    },
    en: {
      label: "Cinematic · Apollo 11", start: "▶ WATCH CINEMATIC", play: "▶ PLAY", pause: "❚❚ PAUSE",
      soundOn: "SOUND: ON", soundOff: "SOUND: OFF", volume: "Volume",
      ccOn: "SUBTITLES: ON", ccOff: "SUBTITLES: OFF", full: "FULL SCREEN", exitFull: "EXIT FULL SCREEN",
      skip: "SKIP CINEMATIC ›", close: "CLOSE ✕", progress: "Video progress",
      firstTime: "First time: watch the whole cinematic to begin the mission.",
      blocked: "Tap the button to start the cinematic with sound.",
      paused: "Cinematic paused.",
      retry: "Playback failed. Press Play to retry.",
      error: "The video could not be played. Here is the same story as text.",
      next: "NEXT ›", finish: "CONTINUE ›", part: "Part {n} of {t}",
      galleryTitle: "✦ CINEMATIC · APOLLO 11", galleryButton: "WATCH CINEMATIC",
      galleryHint: "Chapter 1 video: from Earth to the Moon and back with the rocks.",
      galleryLocked: "Available after watching it when Rock & Roll begins."
    }
  };
  const lang = () => (window.StarI18n?.lang === "en" ? "en" : "es");
  const t = (key, vars) => { let v = TEXT[lang()][key] ?? TEXT.es[key] ?? key; for (const [k, x] of Object.entries(vars || {})) v = v.replace("{" + k + "}", x); return v; };
  const reducedMotion = () => { try { return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true; } catch { return false; } };
  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function button(cls, onClick) {
    const b = el("button", "cine-button " + (cls || ""));
    b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  }

  function mount(container, options = {}) {
    const id = options.id;
    const data = Core.VIDEOS[id];
    if (!container || !data) return null;
    const mode = options.mode === "replay" ? "replay" : "chapter";
    const onDone = typeof options.onDone === "function" ? options.onDone : () => {};
    const seen = () => window.StarProgress?.hasSeenCinematic?.(id) === true;
    let maxWatched = 0, done = false, captions = null, slide = -1, fallback = false;

    window.StarSound?.stopAll?.();      // sin música ni voz de LITO durante el video

    // ── Estructura ──────────────────────────────────────────────
    const root = el("section", "cine");
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.dataset.mode = mode;
    root.tabIndex = -1;
    const frame = el("div", "cine-frame");
    const video = document.createElement("video");
    video.className = "cine-video";
    video.setAttribute("playsinline", "");
    video.setAttribute("preload", "auto");
    video.playsInline = true;
    video.preload = "auto";
    for (const code of Core.LANGS) {
      const track = document.createElement("track");
      track.kind = "subtitles";
      track.srclang = code;
      track.label = code === "es" ? "Español" : "English";
      track.src = data.tracks[code];
      video.append(track);
    }
    const caption = el("p", "cine-caption");
    caption.setAttribute("aria-hidden", "true");
    caption.hidden = true;
    const startButton = button("cine-start", () => play());
    startButton.hidden = true;
    const narrative = el("div", "cine-narrative");
    narrative.hidden = true;
    narrative.setAttribute("aria-live", "polite");
    const narrativeCount = el("p", "cine-narrative-count");
    const narrativeText = el("p", "cine-narrative-text");
    const narrativeNext = button("cine-next", () => nextSlide());
    narrative.append(narrativeCount, narrativeText, narrativeNext);
    frame.append(video, caption, startButton, narrative);

    const controls = el("div", "cine-controls");
    const playButton = button("cine-play", () => (video.paused ? play() : video.pause()));
    const time = el("span", "cine-time", "0:00 / " + Core.formatTime(data.duration));
    const progress = document.createElement("input");
    progress.className = "cine-progress";
    progress.type = "range"; progress.min = "0"; progress.max = "1000"; progress.step = "1"; progress.value = "0";
    progress.addEventListener("input", () => seek(Number(progress.value) / 1000 * duration()));
    const muteButton = button("cine-mute", () => { video.muted = !video.muted; render(); });
    const volume = document.createElement("input");
    volume.className = "cine-volume";
    volume.type = "range"; volume.min = "0"; volume.max = "1"; volume.step = "0.05"; volume.value = "1";
    volume.addEventListener("input", () => { video.volume = Number(volume.value); video.muted = video.volume === 0; render(); });
    const ccButton = button("cine-cc", () => { captions = !captionsVisible(); render(); updateCaption(); });
    const langEs = button("cine-lang", () => window.StarI18n?.setLang?.("es"));
    langEs.textContent = "ES"; langEs.dataset.cineLang = "es";
    const langEn = button("cine-lang", () => window.StarI18n?.setLang?.("en"));
    langEn.textContent = "EN"; langEn.dataset.cineLang = "en";
    const fullButton = button("cine-full", () => toggleFullscreen());
    const skipButton = button("cine-skip", () => finish({ completed: false, skipped: true }));
    controls.append(playButton, time, progress, muteButton, volume, ccButton, langEs, langEn, fullButton, skipButton);

    const status = el("p", "cine-status");
    status.setAttribute("role", "status");
    const live = el("p", "cine-sr");          // lector de pantalla: subtítulo actual
    live.setAttribute("aria-live", "polite");
    const curtain = el("div", "cine-curtain");
    curtain.dataset.state = "in";
    root.append(frame, controls, status, live, curtain);
    container.append(root);
    container.hidden = false;

    // ── Utilidades ──────────────────────────────────────────────
    function duration() { return Number.isFinite(video.duration) && video.duration > 0 ? video.duration : data.duration; }
    function skippable() { return Core.canSkip({ seen: seen(), mode }); }
    // Subtítulos visibles por defecto en español: el video trae el inglés incrustado.
    function captionsVisible() { return captions === null ? lang() === "es" : captions; }
    function seek(target) {
      video.currentTime = Core.clampSeek(target, { maxWatched, seen: seen(), mode, duration: duration() });
    }
    function updateCaption() {
      const cue = Core.cueAt(Core.cuesFor(id, lang()), Number(video.currentTime) || 0);
      const text = cue ? cue.text : "";
      if (live.textContent !== text) live.textContent = text;
      caption.textContent = text;
      caption.hidden = !text || !captionsVisible() || fallback;
    }
    function render() {
      root.setAttribute("aria-label", id === "mars_intro" ? (lang() === "en" ? "Cinematic · Opportunity" : "Cinemática · Opportunity") : t("label"));
      startButton.textContent = t("start");
      playButton.textContent = video.paused ? t("play") : t("pause");
      muteButton.textContent = video.muted ? t("soundOff") : t("soundOn");
      muteButton.setAttribute("aria-pressed", String(!video.muted));
      volume.setAttribute("aria-label", t("volume"));
      progress.setAttribute("aria-label", t("progress"));
      ccButton.textContent = captionsVisible() ? t("ccOn") : t("ccOff");
      ccButton.setAttribute("aria-pressed", String(captionsVisible()));
      for (const b of [langEs, langEn]) b.setAttribute("aria-pressed", String(b.dataset.cineLang === lang()));
      fullButton.textContent = document.fullscreenElement ? t("exitFull") : t("full");
      skipButton.textContent = mode === "replay" ? t("close") : t("skip");
      skipButton.hidden = !skippable();
      status.textContent = statusText();
      if (fallback) renderSlide();
    }
    // Sin aviso puntual, la primera vez se explica por qué no hay SALTAR.
    let statusKey = null;
    function statusText() {
      const key = statusKey || (mode === "chapter" && !skippable() && !fallback ? "firstTime" : null);
      return key ? t(key) : "";
    }
    function setStatus(key) { statusKey = key || null; status.textContent = statusText(); }
    function updateProgress() {
      const now = Number(video.currentTime) || 0;
      progress.value = String(Math.round(now / duration() * 1000));
      time.textContent = Core.formatTime(now) + " / " + Core.formatTime(duration());
    }
    function play() {
      if (done || fallback) return;
      window.StarSound?.stopVoice?.();
      let result;
      try {
        if(video.error && id === "rock_roll_intro") video.load();
        result = video.play();
      } catch (error) { showNarrative(); return; }
      if (result && typeof result.then === "function") {
        result.then(() => { startButton.hidden = true; setStatus(null); render(); })
          .catch(error => {
            if (error && error.name === "NotAllowedError") { startButton.hidden = false; setStatus("blocked"); render(); }
            else if (!done) showNarrative();
          });
      } else { startButton.hidden = true; }
    }
    function toggleFullscreen() {
      try {
        if (document.fullscreenElement) document.exitFullscreen?.();
        else if (frame.requestFullscreen) frame.requestFullscreen();
        else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();   // iOS: subtítulos nativos
      } catch { /* sin pantalla completa */ }
    }

    // ── Narración alternativa (si el video falla) ───────────────
    function showNarrative() {
      if (done || fallback) return;

      if(id === "rock_roll_intro") {
        try { video.pause(); } catch {}
        startButton.hidden = false;
        setStatus("retry");
        render();
        return;
      }
      fallback = true;
      try { video.pause(); } catch { /* sin video */ }
      video.hidden = true;
      startButton.hidden = true;
      controls.hidden = true;
      narrative.hidden = false;
      setStatus("error");
      slide = 0;
      renderSlide();
    }
    function renderSlide() {
      const slides = Core.slidesFor(id, lang());
      narrativeCount.textContent = t("part", { n: slide + 1, t: slides.length });
      narrativeText.textContent = slides[slide] || "";
      narrativeNext.textContent = slide >= slides.length - 1 ? t("finish") : t("next");
      try { narrativeNext.focus?.({ preventScroll: true }); } catch { /* sin foco */ }
    }
    function nextSlide() {
      if (!fallback || done) return;
      const total = Core.slidesFor(id, lang()).length;
      if (slide < total - 1) { slide++; renderSlide(); return; }
      // Leer la historia completa cuenta como haberla visto (cubre el mismo contenido).
      if (mode === "chapter") window.StarProgress?.markCinematicSeen?.(id);
      finish({ completed: true, via: "narrative" });
    }

    // ── Cierre ──────────────────────────────────────────────────
    function finish(result) {
      if (done) return;
      done = true;
      try { video.pause(); } catch { /* sin video */ }
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("starstep:language", onLanguage);
      try { if (document.fullscreenElement) document.exitFullscreen?.(); } catch { /* sin pantalla completa */ }
      curtain.hidden = false;
      curtain.dataset.state = "in";
      const close = () => { root.hidden = true; container.hidden = true; onDone(result); };
      const ms = reducedMotion() ? 0 : FADE_MS;
      if (ms === 0) close(); else setTimeout(close, ms);
    }

    // ── Eventos ─────────────────────────────────────────────────
    video.addEventListener("play", () => { window.StarSound?.stopVoice?.(); startButton.hidden = true; setStatus(null); render(); });
    video.addEventListener("pause", () => { if (!done && !video.ended) setStatus("paused"); render(); });
    video.addEventListener("timeupdate", () => {
      const now = Number(video.currentTime) || 0;
      if (now <= maxWatched + 1.5) maxWatched = Math.max(maxWatched, now);
      updateProgress();
      updateCaption();
    });
    video.addEventListener("seeking", () => {
      const now = Number(video.currentTime) || 0;
      if (!skippable() && now > maxWatched + 0.5) video.currentTime = maxWatched;
    });
    video.addEventListener("loadedmetadata", updateProgress);
    video.addEventListener("ended", () => {
      if (mode === "chapter") window.StarProgress?.markCinematicSeen?.(id);
      finish({ completed: true, via: "video" });
    });
    video.addEventListener("error", () => showNarrative());
    root.addEventListener("keydown", event => {
      if (done || fallback) return;
      const key = event.key;
      if (key === " " || key === "k") { event.preventDefault?.(); video.paused ? play() : video.pause(); }
      else if (key === "m") { video.muted = !video.muted; render(); }
      else if (key === "c") { captions = !captionsVisible(); render(); updateCaption(); }
      else if (key === "f") toggleFullscreen();
      else if (key === "ArrowRight") seek((Number(video.currentTime) || 0) + 5);
      else if (key === "ArrowLeft") seek((Number(video.currentTime) || 0) - 5);
      else if (key === "Escape" && mode === "replay") finish({ completed: false, closed: true });
    });
    document.addEventListener("fullscreenchange", render);
    function onVisibility() { if (document.hidden && !video.paused) video.pause(); }
    function onLanguage() { render(); updateCaption(); }
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("starstep:language", onLanguage);

    // ── Inicio: fundido desde azul noche y reproducción ─────────
    video.src = data.src;
    for (const track of Array.from(video.textTracks || [])) track.mode = "hidden";   // se dibujan en .cine-caption
    render();
    updateProgress();
    setStatus(mode === "chapter" && !skippable() ? "firstTime" : null);
    // El telón se retira también por tiempo: si el navegador frena la transición CSS
    // (pestaña en segundo plano), el video nunca queda tapado a medias.
    const open = () => {
      if (done) return;
      curtain.dataset.state = "out";
      if (reducedMotion()) curtain.hidden = true;
      else setTimeout(() => { if (!done && curtain.dataset.state === "out") curtain.hidden = true; }, FADE_MS + 60);
    };
    if (reducedMotion()) open(); else setTimeout(open, 30);
    try { root.focus?.({ preventScroll: true }); } catch { /* sin foco */ }
    play();

    return {
      root, video, finish, play,
      get state() { return { mode, done, fallback, maxWatched, skippable: skippable(), captions: captionsVisible(), slide }; }
    };
  }

  // Repetición desde la bitácora: <button data-cinematic-replay="rock_roll_intro">.
  function wireReplayButtons() {
    const buttons = Array.from(document.querySelectorAll?.("[data-cinematic-replay]") || []);
    const texts = Array.from(document.querySelectorAll?.("[data-cine-i18n]") || []);
    function refresh() {
      for (const node of texts) node.textContent = t(node.dataset.cineI18n);
      for (const b of buttons) {
        const ok = window.StarProgress?.hasSeenCinematic?.(b.dataset.cinematicReplay) === true;
        b.disabled = !ok;
        b.title = ok ? "" : t("galleryLocked");
      }
    }
    for (const b of buttons) {
      b.addEventListener("click", () => {
        if (b.disabled) return;
        const host = el("div", "cine-host");
        document.body.append(host);
        window.StarSound?.effect?.("button");
        mount(host, { id: b.dataset.cinematicReplay, mode: "replay", onDone: () => { host.hidden = true; try { b.focus?.(); } catch { /* sin foco */ } } });
      });
    }
    refresh();
    document.addEventListener("starstep:language", refresh);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wireReplayButtons);
  else wireReplayButtons();

  window.StarCinematic = Object.freeze({ mount, TEXT });
})();
