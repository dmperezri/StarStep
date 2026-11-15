"use strict";

document.addEventListener("DOMContentLoaded", () => {

    if (!document.body.classList.contains("moon-page")) return;

    const $ = id => document.getElementById(id);
    const msg = $("mensaje");
    const frame = document.querySelector(".moon-evidence-frame");
    const panel = msg.closest(".dialogo");

    const tr = (es, en) =>
        window.StarI18n?.lang === "en" ? en : es;

    // Preparar el dialogo sin sustituir su contenido dinamico.

    panel.classList.add("ss-lunar-dialog");
    frame.append(panel);

    let portrait = $("lunarLitoPortrait");

    if (!portrait) {
        portrait = document.createElement("canvas");
        portrait.id = "lunarLitoPortrait";
        portrait.width = 64;
        portrait.height = 80;
        portrait.setAttribute("aria-hidden", "true");
        panel.prepend(portrait);
    }

    let messageBody = panel.querySelector(".ss-lunar-message");

    if (!messageBody) {
        messageBody = document.createElement("div");
        messageBody.className = "ss-lunar-message";

        const speaker = panel.querySelector(".moon-lito-name");

        if (speaker) messageBody.append(speaker);

        messageBody.append(msg);
        panel.append(messageBody);
    }

    const tag = document.createElement("span");
    tag.className = "ss-lunar-tag";
    tag.hidden = true;
    messageBody.insertBefore(tag, msg);

    const read = document.createElement("button");
    read.className = "ss-lunar-read";
    read.type = "button";
    read.textContent = "▶";
    panel.append(read);

    // Barra superior basada en la referencia.

    const header = document.querySelector(".contenedor > header");
    const nav = document.querySelector(".navegacion");
    let toolbar = header.querySelector(".ss-lunar-toolbar");

    header.classList.add("ss-lunar-header");

    if (!toolbar) {

        const brand = document.createElement("div");
        brand.className = "ss-lunar-brand";

        brand.innerHTML = `
          <b class="ss-lunar-wordmark">
            Star<span>Step</span>
          </b>
          <h1 data-i18n="moon.title">ACTO I · LUNA</h1>
          <progress id="lunarActProgress"
                    max="1" value="0"></progress>
        `;

        toolbar = document.createElement("div");
        toolbar.className = "ss-lunar-toolbar";

        toolbar.innerHTML = `
          <span id="lunarCadet"
                class="ss-lunar-control"></span>
          <a id="lunarSources"
             href="/archivo-nasa?desde=luna">NASA</a>
          <button type="button" id="lunarVoice">Voz</button>
          <button type="button" id="lunarMusic">Sonido</button>
        `;

        header.replaceChildren(brand, toolbar);

        if (nav) {

            const journal = nav.querySelector(
              'a[data-i18n="journal"]'
            );

            if (journal) toolbar.prepend(journal);

            const languages = nav.querySelectorAll("[data-lang]");

            for (const button of languages) {
                toolbar.insertBefore(button, $("lunarVoice"));
            }

            const menu = document.createElement("details");
            menu.className = "ss-lunar-menu";

            const summary = document.createElement("summary");
            summary.textContent = "☰";

            menu.append(summary, nav);
            toolbar.append(menu);
        }
    }

    const brand = header.querySelector(".ss-lunar-brand");
    const logo = brand?.querySelector(".ss-logo");

    if (logo) {
        const wordmark = document.createElement("b");
        wordmark.className = "ss-lunar-wordmark";
        wordmark.innerHTML = "Star<span>Step</span>";
        logo.replaceWith(wordmark);
    }

    // Retrato lunar de LITO.

    let talking = false;

    function drawPortrait() {

        const ctx = portrait.getContext("2d");

        ctx.clearRect(0, 0, portrait.width, portrait.height);
        ctx.imageSmoothingEnabled = false;

        ctx.fillStyle = "#262C66";
        ctx.fillRect(0, 0, portrait.width, portrait.height);

        if (window.StarArt?.lito) {

            ctx.save();

            ctx.translate(
                portrait.width / 2,
                portrait.height / 2
            );

            ctx.scale(.93, .93);

            StarArt.lito(
                ctx, 0, 0, 0,
                "moon",
                talking ? "excited" : "idle"
            );

            ctx.restore();
        }
    }

    drawPortrait();

    // Narrar mensajes reales de la mision.
    // Eliminar duplicaciones provocadas por el bucle del juego.

    let lastText = "";
    let timer = 0;
    let unlocked = false;
    let speechToken = 0;

    function narrate(force = false) {

        const text = msg.textContent.trim();
        const sound = window.StarSound;

        if (!text || !sound?.voiceOn ||
            !unlocked || document.hidden) return;

        if (!force && text === lastText) return;

        // No interrumpir las fichas cientificas.
        if (window.StarScienceCard?.isOpen) return;

        lastText = text;

        const token = ++speechToken;

        sound.speak(text, {
            lito: true,

            onStart: () => {
                if (token !== speechToken) return;
                talking = true;
                drawPortrait();
            },

            onEnd: () => {
                if (token !== speechToken) return;
                talking = false;
                drawPortrait();
            }
        });
    }

    let observedText = msg.textContent.trim();

    function schedule() {

        const text = msg.textContent.trim();

        if (text === observedText) return;

        observedText = text;

        clearTimeout(timer);

        updateTag();

        timer = setTimeout(() => narrate(), 250);
    }

    const observer = new MutationObserver(schedule);

    observer.observe(msg, {
        childList: true,
        characterData: true,
        subtree: true
    });

    function unlockAudio() {

        if (unlocked) return;

        unlocked = true;

        window.StarSound?.init?.();

        narrate();
    }

    document.addEventListener("pointerdown", unlockAudio, {
        once: true
    });

    document.addEventListener("keydown", unlockAudio, {
        once: true
    });

    read.addEventListener("click", () => {

        unlocked = true;

        const audio = window.StarSound;

        audio?.init?.();

        if (audio && !audio.voiceOn) audio.setVoice(true);

        narrate(true);
        render();
    });

    // Mostrar la etiqueta I solo en la explicacion cientifica.

    function updateTag() {

        const text = msg.textContent;

        tag.hidden = !(
            text.includes("lava solidificada") ||
            text.includes("solidified lava")
        );

        tag.textContent = tr(
            "♧ INTERPRETADO",
            "♧ INTERPRETED"
        );
    }

    // Indicador real del avance lunar.

    function progress() {

        const flow = window.StarFlow;

        const stages = (flow?.getAvailableStages?.() || [])
            .filter(s => s.group === "moon" && s.implemented);

        const objectives = stages.flatMap(s =>
            flow.getObjectives(s.id).objectives || []
        ).filter(o => o.implemented);

        const bar = $("lunarActProgress");

        if (bar) {
            bar.value = objectives.filter(o => o.done).length /
                Math.max(1, objectives.length);

            bar.setAttribute("aria-label",
                tr("Progreso del Acto I", "Act I progress")
            );
        }
    }

    function render() {

        const player = window.StarProgress?.player?.() || {};
        const audio = window.StarSound;

        const voice = $("lunarVoice");
        const music = $("lunarMusic");

        if ($("lunarCadet")) {
            $("lunarCadet").textContent =
                "▪ " + (player.alias || tr("Invitado", "Guest"));
        }

        if ($("lunarSources")) {
            $("lunarSources").textContent =
                tr("Fuentes NASA", "NASA Sources");
        }

        const journal = toolbar.querySelector(
            'a[data-i18n="journal"]'
        );

        if (journal) journal.textContent =
            tr("▣ Librito", "▣ Logbook");

        if (voice) {

            voice.textContent = audio?.voiceOn
                ? tr("♬ Voz", "♬ Voice")
                : tr("⊘ Sin voz", "⊘ No voice");

            voice.setAttribute(
                "aria-pressed", String(!!audio?.voiceOn)
            );
        }

        if (music) {

            music.textContent = audio?.musicOn
                ? tr("♪ Sonido", "♪ Sound")
                : tr("Sin música", "No music");

            music.setAttribute(
                "aria-pressed", String(!!audio?.musicOn)
            );
        }

        read.setAttribute("aria-label",
            tr("Escuchar a Lito", "Listen to Lito")
        );

        read.title = tr("Escuchar a Lito", "Listen to Lito");

        const title = header.querySelector("h1");

        if (title) title.textContent =
            tr("ACTO I · LUNA", "ACT I · MOON");

        updateTag();
        progress();
    }

    $("lunarVoice")?.addEventListener("click", () => {

        const audio = window.StarSound;
        if (!audio) return;

        unlocked = true;

        audio.init();
        audio.setVoice(!audio.voiceOn);

        if (audio.voiceOn) {
            narrate(true);
        } else {
            talking = false;
            drawPortrait();
        }

        render();
    });

    $("lunarMusic")?.addEventListener("click", () => {

        const audio = window.StarSound;

        if (audio) audio.setMusic(!audio.musicOn);

        render();
    });

    document.addEventListener("starflow:change", progress);

    document.addEventListener("starstep:language", () => {
        speechToken++;
        clearTimeout(timer);
        window.StarSound?.stopVoice?.();
        lastText = "";
        talking = false;
        drawPortrait();
        render();
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            clearTimeout(timer);
            speechToken++;
            window.StarSound?.stopVoice?.();
            talking = false;
            drawPortrait();
        }
    });

    window.addEventListener("pagehide", () => {
        observer.disconnect();
        clearTimeout(timer);
        window.StarSound?.stopVoice?.();
    });

    render();
});
