(function () {
    "use strict";
    if (!window.StarFlow || !window.StarI18n) return;
    if (StarFlow.getCurrentStage() !== "chapter_briefing") {
        const entry = StarFlow.getEntryPoint();
        const target = !StarFlow.isStageCompleted("lito_welcome") ? "/" : entry.page;
        if (target !== location.pathname) location.replace(target);
        return;
    }
    window.addEventListener("pageshow", event => { if (event.persisted) location.reload(); });

        // ==========================================
        // TRADUCCIONES
        // ==========================================

        const translations = {

            es: {
                back: "VOLVER",
                chapter: "CAPÍTULO 01",
                subtitle: "DOS MUNDOS, DOS HISTORIAS",
                moon: "LUNA",
                mars: "MARTE",
                traces: "HUELLAS",
                moonLabel: "Luna",
                marsLabel: "Marte",

                speaker: "LITO · CONTROL DE MISIÓN",

                // Mensaje breve tras la cinemática de Apollo 11.
                briefing:
                    "¡Ahora es nuestro turno, cadete! " +
                    "Vamos a explorar dos mundos, investigar sus secretos " +
                    "y descubrir las huellas que la ciencia dejó en la Luna y Marte.",

                // Instrucciones del vuelo (minijuego de /vuelo).
                ready:
                    "Primero, el viaje a la Luna. Mantené ESPACIO, la flecha ↑ " +
                    "o tocá la pantalla para subir; soltá para bajar. " +
                    "Esquivá los asteroides: si chocás, volvés al último punto seguro. " +
                    "¿Listo para la cuenta regresiva?",

                next: "CONTINUAR",
                launch: "¡ESTOY LISTO!",
                pause: "PAUSA",
                resume: "REANUDAR",
                voiceOn: "VOZ ON",
                voiceOff: "VOZ OFF",
                liftoff: "¡DESPEGUE!",
                replay: "REPETIR PRESENTACIÓN",

                demoEnd:
                    "Aquí comenzará el minijuego del viaje espacial.",

                preview:
                    "VISTA DE DESARROLLO · NO MODIFICA TU PARTIDA",

                scenes: [
                    "DOS MUNDOS",
                    "ROCK & ROLL",
                    "TRES ACTOS",
                    "INSTRUCCIONES DE MISIÓN",
                    "PREPARACIÓN",
                    "CUENTA REGRESIVA",
                    "MISIÓN LISTA"
                ]
            },

            en: {
                back: "BACK",
                chapter: "CHAPTER 01",
                subtitle: "TWO WORLDS, TWO STORIES",
                moon: "MOON",
                mars: "MARS",
                traces: "TRACES",
                moonLabel: "Moon",
                marsLabel: "Mars",

                speaker: "LITO · MISSION CONTROL",

                briefing:
                    "Now it's our turn, cadet! " +
                    "We will explore two worlds, investigate their secrets " +
                    "and discover the traces science left on the Moon and Mars.",

                ready:
                    "First, the trip to the Moon. Hold SPACE, the ↑ arrow " +
                    "or touch the screen to climb; release to drop. " +
                    "Dodge the asteroids: if you crash, you return to the last safe point. " +
                    "Ready for the countdown?",

                next: "CONTINUE",
                launch: "I'M READY!",
                pause: "PAUSE",
                resume: "RESUME",
                voiceOn: "VOICE ON",
                voiceOff: "VOICE OFF",
                liftoff: "LIFTOFF!",
                replay: "REPLAY INTRODUCTION",

                demoEnd:
                    "The space travel minigame will begin here.",

                preview:
                    "DEVELOPMENT PREVIEW · DOES NOT MODIFY YOUR SAVE",

                scenes: [
                    "TWO WORLDS",
                    "ROCK & ROLL",
                    "THREE ACTS",
                    "MISSION BRIEFING",
                    "PREPARATION",
                    "COUNTDOWN",
                    "MISSION READY"
                ]
            }

        };

        let language = StarI18n.lang;
        let voiceEnabled = StarSound.voiceOn;
        let paused = false;
        let scene = 0;

        // Duración en milisegundos.
        const durations = [
            3000,
            3000,
            5000,
            8000,
            0
        ];

        let elapsed = 0;
        let lastTime = null;
        // Mientras se reproduce la cinemática no avanza ninguna escena ni habla LITO.
        let cinematicActive = false;

        const $ = id => document.getElementById(id);

        const canSpeak =
            "speechSynthesis" in window &&
            "SpeechSynthesisUtterance" in window;

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        // ==========================================
        // NARRACIÓN
        // ==========================================

        function stopVoice() { StarSound.stopVoice(); }
        function speak(text) {
            if (voiceEnabled && !paused && !document.hidden && !cinematicActive) StarSound.speak(text, {lito:true});
        }

        function currentSpeech() {

            if (scene === 3) {
                return translations[language].briefing;
            }

            if (scene === 4) {
                return translations[language].ready;
            }

            return "";

        }

        // ==========================================
        // IDIOMA
        // ==========================================

        function updateLanguage() {

            const text = translations[language];

            document.documentElement.lang = language;

            document.querySelectorAll("[data-text]")
                .forEach(element => {

                    element.textContent =
                        text[element.dataset.text];

                });

            document.querySelectorAll("[data-label]")
                .forEach(element => {

                    element.setAttribute(
                        "aria-label",
                        text[element.dataset.label]
                    );

                });

            document.querySelectorAll("[data-lang]")
                .forEach(button => {

                    const active =
                        button.dataset.lang === language;

                    button.classList.toggle(
                        "active", active
                    );

                    button.setAttribute(
                        "aria-pressed",
                        String(active)
                    );

                });

            $("voiceButton").textContent =
                voiceEnabled
                    ? text.voiceOn
                    : text.voiceOff;

            $("voiceButton").setAttribute(
                "aria-pressed",
                String(voiceEnabled)
            );

            $("pauseButton").textContent =
                paused ? text.resume : text.pause;

            $("pauseButton").setAttribute(
                "aria-pressed",
                String(paused)
            );

            $("sceneLabel").textContent =
                text.scenes[scene];

            $("missionText").textContent =
                currentSpeech();

            $("progress").setAttribute(
                "aria-label",
                language === "es"
                    ? "Progreso de la presentación"
                    : "Introduction progress"
            );

        }

        // ==========================================
        // CONTROL DE ESCENAS
        // ==========================================

        function showScene(number) {

                stopVoice();

                scene = number;
                elapsed = 0;
                lastTime = null;
                paused = false;

            document.body.classList.remove("paused");

            $("worlds").hidden = scene > 2;

            $("titleBlock").hidden =
                scene < 1 || scene > 4;

            $("acts").hidden = scene !== 2;

            $("lito").hidden =
                scene !== 3 && scene !== 4;

            $("briefing").hidden =
                scene !== 3 && scene !== 4;

            $("nextButton").hidden = scene !== 3;
            $("nextButton").disabled = true;

            $("launchButton").hidden = scene !== 4;

            $("pauseButton").hidden =
                scene === 4;

            $("progress").hidden =
                durations[scene] === 0;

            $("progress").value = 0;

            [
                "worlds",
                "titleBlock",
                "acts",
                "briefing"
            ].forEach(id => {

                const element = $(id);

                element.classList.remove("reveal");

                if (!element.hidden) {

                    void element.offsetWidth;

                    element.classList.add("reveal");

                }

            });

            updateLanguage();

            const speech = currentSpeech();

            if (speech) {
                speak(speech);
            }

        }

        // ==========================================
        // TEMPORIZADOR
        // ==========================================

        function updateScene(time) {

            if (lastTime === null) {
                lastTime = time;
            }

            const delta = Math.min(
                time - lastTime,
                100
            );

            lastTime = time;

            if (!paused && !document.hidden && !cinematicActive) {

                const duration = durations[scene];

                if (duration > 0) {

                    elapsed += delta;

                    $("progress").value =
                        Math.min(elapsed / duration, 1);

                    if (elapsed >= duration) {

                        if (scene === 3) {

                            // El jugador confirma que
                            // terminó de leer las instrucciones.
                            $("nextButton").disabled = false;

                        } else {

                            showScene(scene + 1);

                        }

                    }

                }

            }

            requestAnimationFrame(updateScene);

        }

        // ==========================================
        // BOTONES
        // ==========================================

        document.addEventListener("starstep:language", () => {
            language = StarI18n.lang;
            updateLanguage();
            if (currentSpeech()) speak(currentSpeech());
        });

        $("voiceButton").disabled = !canSpeak;

        $("voiceButton").addEventListener("click", () => {

            voiceEnabled = !voiceEnabled;
            StarSound.setVoice(voiceEnabled);

            updateLanguage();

            const speech = currentSpeech();

            if (voiceEnabled && speech) {
                speak(speech);
            } else {
                stopVoice();
            }

        });

        $("pauseButton").addEventListener("click", () => {

            paused = !paused;

            document.body.classList.toggle(
                "paused", paused
            );

            lastTime = null;

            updateLanguage();

            if (paused) {

                stopVoice();

                $("nextButton").disabled = true;

            } else {

                const speech = currentSpeech();

                if (speech) {
                    speak(speech);
                }

            }

        });

        $("nextButton").addEventListener("click", () => {

            if (scene === 3 && !paused &&
                elapsed >= durations[3]) {

                showScene(4);

            }

        });

        $("launchButton").addEventListener("click", () => {

            if (scene !== 4) return;
            const result = StarFlow.recordObjective("chapter_briefing.ready", {source:"chapter_briefing_sequence"});
            if (!result.ok) { StarFlow.notify("locked"); return; }
            $("launchButton").disabled = true;
            StarSound.stopAll();
            location.replace(StarFlow.getEntryPoint().page + "?inicio=capitulo");

        });

        document.addEventListener("visibilitychange", () => {

            lastTime = null;

            if (document.hidden) {
                stopVoice();
            } else if (currentSpeech() && !paused) { speak(currentSpeech()); }

        });

        window.addEventListener("pagehide", stopVoice);

        // ==========================================
        // FONDO ESPACIAL
        // ==========================================

        const canvas = $("stars");

        const ctx = canvas.getContext("2d");

        const stars = Array.from(
            { length: 170 },
            (_, i) => ({
                x: (i * 131 + 17) % 480,
                y: (i * 67 + 31) % 270,
                size: i % 13 === 0 ? 2 : 1
            })
        );

        let starTime = 0;

        function drawStars(time = 0) {

            if (cinematicActive) { requestAnimationFrame(drawStars); return; }

            if (!paused && !reducedMotion.matches) {
                starTime = time;
            }

            ctx.fillStyle = "#0E1233";
            ctx.fillRect(0, 0, 480, 270);

            stars.forEach((star, i) => {

                ctx.globalAlpha =
                    .4 + .6 *
                    ((Math.sin(starTime * .001 + i) + 1) / 2);

                ctx.fillStyle =
                    i % 7 === 0
                        ? "#8FF0D8"
                        : "#FFF8E7";

                ctx.fillRect(
                    star.x,
                    star.y,
                    star.size,
                    star.size
                );

            });

            ctx.globalAlpha = 1;

            requestAnimationFrame(drawStars);

        }

        // ==========================================
        // INICIO
        // ==========================================

        // Bloque 1: al elegir Rock & Roll se ve completa la cinemática de Apollo 11
        // (cinematica.js). Al terminar siguen los tres actos, el mensaje breve de LITO y las
        // instrucciones del vuelo; se omiten «Dos mundos» y el título, que el video ya muestra.
        // Si el reproductor no está disponible, sigue la presentación anterior completa.
        const cinematicHost = $("cinematic");
        if (window.StarCinematic && cinematicHost) {
            cinematicActive = true;
            window.StarCinematic.mount(cinematicHost, {
                id: "rock_roll_intro",
                mode: "chapter",
                onDone: () => { cinematicActive = false; showScene(2); }
            });
        } else {
            showScene(0);
        }
        requestAnimationFrame(updateScene);
        requestAnimationFrame(drawStars);

})();
