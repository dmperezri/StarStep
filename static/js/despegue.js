"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);
    const canvas = $("world");
    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = false;

    const player = StarProgress.player();
    const flow = window.StarFlow;

    if (!flow) return;

    const current = flow.getCurrentStage();

    if (!["launch", "moon_landing"].includes(current)) {
        location.replace(flow.getEntryPoint().page);
        return;
    }

    flow.resume();

    $("crew").textContent =
        `${player.avatar || "astronauta"} · ${(player.alias || "Cadete").toUpperCase()} + LITO`;

    const caption = $("travelCaption");
    const counter = $("countdown");
    const landing = $("landingBriefing");
    const pauseButton = $("pauseSequence");

    const reduced = matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const tr = (es, en) =>
        StarI18n.lang === "en" ? en : es;

    let phase = current === "moon_landing"
        ? "landing_briefing" : "pan";

    let elapsed = 0;
    let lastFrame = null;
    let paused = false;
    let countShown = 0;
    let voiceDone = false;
    let voiceToken = 0;

    function translate() {

        $("landingTitle").textContent = tr(
            "APOLLO 11 · SEPARACIÓN DEL EAGLE",
            "APOLLO 11 · SEPARATION OF EAGLE"
        );

        $("landingObserved").textContent = tr(
            "O · LO QUE SE VIO",
            "O · WHAT WAS OBSERVED"
        );

        $("landingPhotoCaption").textContent = tr(
            "El Eagle se separa del Columbia. NASA · AS11-44-6574.",
            "Eagle separates from Columbia. NASA · AS11-44-6574."
        );

        $("landingIntro").textContent = tr(
            "Lito: Cadete, observa esta fotografía histórica. Ahora simularemos el descenso al Mar de la Tranquilidad.",
            "Lito: Cadet, look at this historical photograph. Now we will simulate the descent to the Sea of Tranquility."
        );

        $("landingPhoto").alt = tr(
            "Fotografía histórica del módulo lunar Eagle",
            "Historical photograph of the Eagle lunar module"
        );

        $("beginDescent").textContent = tr(
            "INICIAR DESCENSO",
            "BEGIN DESCENT"
        );

        pauseButton.textContent = paused
            ? tr("REANUDAR", "RESUME")
            : tr("PAUSA", "PAUSE");

        pauseButton.setAttribute(
            "aria-pressed", String(paused)
        );
    }

    function message(kind) {
        return kind === "preparation"
            ? tr(
                `¡Todo preparado, ${player.alias || "cadete"}! Comienza la cuenta regresiva.`,
                `All systems ready, ${player.alias || "cadet"}! The countdown begins.`
              )
            : tr(
                "¡Estamos en el espacio, cadete! Próxima parada: la Luna.",
                "We're in space, cadet! Next stop: the Moon."
              );
    }

    function enter(next) {

        phase = next;
        elapsed = 0;
        voiceDone = false;

        const token = ++voiceToken;

        if (next === "leaving") pauseButton.hidden = true;

        if (["preparation", "arrival_message"].includes(next)) {
            try {
                StarSound.speak(message(next), {
                    lito: true,
                    onEnd: () => {
                        if (token === voiceToken) voiceDone = true;
                    }
                });
            } catch {
                voiceDone = true;
            }
        }
    }

    function messageFinished() {
        return elapsed >= 8 ||
            (elapsed >= 3.5 && voiceDone);
    }

    function togglePause() {

        if ([
            "landing_briefing", "arrived", "leaving", "pan"
        ].includes(phase)) return;

        paused = !paused;
        lastFrame = null;

        if (paused) {
            StarSound.stopAll();
            voiceDone = true;
        }

        translate();
    }

    pauseButton.addEventListener("click", togglePause);

    document.addEventListener(
        "starstep:language", translate
    );

    document.addEventListener("visibilitychange", () => {
        lastFrame = null;

        if (document.hidden) {
            StarSound.stopAll();
            voiceDone = true;
        }
    });

    $("beginDescent").addEventListener("click", () => {

        if (phase !== "landing_briefing") return;

        landing.hidden = true;
        pauseButton.hidden = false;

        enter("descent");
        lastFrame = null;

        pauseButton.focus();
    });

    translate();

    $("skipLaunch").hidden = true;

    if (phase === "landing_briefing") {

        $("startLaunch").hidden = true;
        counter.hidden = true;
        caption.hidden = true;
        landing.hidden = false;
        pauseButton.hidden = true;

        $("beginDescent").focus();

    } else {
        landing.hidden = true;
        pauseButton.hidden = false;
    }

    function beginLaunch(withAudio = true) {

        if (phase !== "pan") return;

        if (withAudio) {
            StarSound.init();
            StarSound.startMusic();
            StarSound.effect("button");
        }

        enter("preparation");

        $("startLaunch").hidden = true;
        counter.hidden = true;
    }

    $("startLaunch").addEventListener(
        "click", () => beginLaunch()
    );

    if (current === "launch") beginLaunch(false);

    function smooth(x) {
        x = Math.max(0, Math.min(1, x));
        return x * x * (3 - 2 * x);
    }

    function curtain(on) {
        document.querySelector(".curtain")
            .classList.toggle("is-dark", on);
    }

    function render(now) {

        if (document.hidden || paused) {
            lastFrame = null;
            requestAnimationFrame(render);
            return;
        }

        const dt = lastFrame === null
            ? 0
            : Math.min(.1, Math.max(0, (now - lastFrame) / 1000));

        lastFrame = now;
        elapsed += dt;

        const t = now / 1000;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (phase === "pan") {

            StarArt.earthScene(ctx, t);

        } else if (phase === "preparation") {

            StarArt.earthScene(ctx, t);
            caption.textContent = "LITO: " + message(phase);

            if (messageFinished()) {
                StarSound.stopVoice();
                enter("countdown");
                counter.hidden = false;
            }

        } else if (phase === "countdown") {

            const n = Math.max(1, 3 - Math.floor(elapsed));

            if (n !== countShown) {
                countShown = n;
                StarSound.effect("count");
            }

            if (!reduced.matches) {
                ctx.translate(
                    Math.sin(t * 24) * Math.min(2, elapsed * .6),
                    0
                );
            }

            StarArt.earthScene(ctx, t);

            counter.textContent = n;
            caption.textContent = tr(
                "CUENTA REGRESIVA", "COUNTDOWN"
            );

            if (elapsed >= 3) {

                enter("launch");

                StarSound.effect("launch");

                counter.textContent = tr(
                    "¡DESPEGUE!", "LIFTOFF!"
                );
            }

        } else if (phase === "launch") {

            const progress = smooth(elapsed / 6);

            StarArt.launchScene(ctx, t, progress * .529);

            counter.hidden = elapsed >= 1;

            caption.textContent = tr(
                "ASCENSO · DE LA TIERRA AL ESPACIO",
                "ASCENT · FROM EARTH TO SPACE"
            );

            if (elapsed >= 6) enter("space_transition");

        } else if (phase === "space_transition") {

            StarArt.spaceScene(ctx, t, smooth(elapsed / 1.5));

            counter.hidden = true;

            caption.textContent = tr(
                "LLEGADA AL ESPACIO", "REACHING SPACE"
            );

            if (elapsed >= 1.5) {

                const result = flow.recordObjective(
                    "launch.liftoff",
                    {source: "launch_sequence"}
                );

                if (result.ok &&
                    flow.getCurrentStage() === "space_travel") {

                    enter("arrival_message");
                    StarSound.effect("arrival");

                } else {

                    enter("leaving");
                    location.replace(flow.getEntryPoint().page);
                }
            }

        } else if (phase === "arrival_message") {

            StarArt.spaceScene(ctx, t, 1);

            caption.textContent = "LITO: " + message(phase);

            if (messageFinished()) {

                StarSound.stopVoice();
                enter("leaving");
                curtain(true);

                setTimeout(() => location.replace("/vuelo"), 350);
            }

        } else if (phase === "leaving") {

            StarArt.spaceScene(ctx, t, 0);

        } else if (phase === "landing_briefing") {

            StarArt.descentScene(ctx, t, 0);

        } else if (phase === "descent") {

            caption.hidden = false;
            curtain(elapsed < .5);

            const progress = smooth(
                Math.max(0, elapsed - .45) / 3.2
            );

            StarArt.descentScene(ctx, t, progress);

            caption.textContent = tr(
                "N · SIMULACIÓN DE ALUNIZAJE · MARE TRANQUILLITATIS",
                "N · LANDING SIMULATION · MARE TRANQUILLITATIS"
            );

            if (elapsed >= 3.9) {

                const result = flow.recordObjective(
                    "moon_landing.touchdown",
                    {source: "descent_sequence"}
                );

                if (result.ok) {
                    enter("arrived");
                    pauseButton.hidden = true;
                    StarSound.effect("arrival");
                } else {
                    enter("leaving");
                    location.replace(flow.getEntryPoint().page);
                }
            }

        } else if (phase === "arrived") {

            StarArt.descentScene(ctx, t, 1);

            caption.hidden = true;
            $("actCard").hidden = false;
            $("enterMoon").hidden = false;
        }

        ctx.restore();

        requestAnimationFrame(render);
    }

    window.addEventListener("pageshow", event => {
        if (event.persisted) location.reload();
    });

    window.addEventListener("pagehide", () => {
        voiceToken++;
        StarSound.stopAll();
    });

    requestAnimationFrame(render);
});
