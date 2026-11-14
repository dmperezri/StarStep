
"use strict";

(() => {
    const earth = document.getElementById("earthCanvas");
    const ctx = earth.getContext("2d");

    const litoCanvas = document.getElementById("litoCanvas");
    const litoCtx = litoCanvas.getContext("2d");

    const planetArea = document.querySelector(".planet-area");
    const speaker = document.getElementById("speaker");
    const title = document.getElementById("sceneTitle");
    const dialog = document.getElementById("dialogText");
    const nextBtn = document.getElementById("nextBtn");
    const skipBtn = document.getElementById("skipBtn");
    const voiceBtn = document.getElementById("voiceBtn");
    const litoBox = document.getElementById("litoContainer");
    const destination = document.getElementById("avatarDestination");

    const speechSupported =
        "speechSynthesis" in window &&
        "SpeechSynthesisUtterance" in window;

    let voiceEnabled = speechSupported;
    let sceneIndex = -1;

    const scenes = [
        {
            speaker: "CONTROL DE MISIÓN",
            title: "BIENVENIDO A LA TIERRA",
            text:
                "Atención, futuro explorador. " +
                "Te damos la bienvenida a StarStep. " +
                "Desde nuestro hogar, la Tierra, " +
                "comenzará una nueva aventura.",
            button: "CONTINUAR"
        },
        {
            speaker: "CONTROL DE MISIÓN",
            title: "UNA MISIÓN ESPECIAL",
            text:
                "La humanidad dejó equipos científicos " +
                "en la Luna y Marte. Aunque sus misiones " +
                "terminaron, todavía podemos aprender " +
                "mucho de sus descubrimientos.",
            button: "CONTINUAR"
        },
        {
            speaker: "LITO",
            title: "¡HOLA, EXPLORADOR!",
            text:
                "¡Soy LITO! Te acompañaré durante " +
                "esta aventura. Juntos descubriremos " +
                "las huellas de Apollo 11 y Opportunity. " +
                "Pero primero, necesitamos preparar tu traje.",
            button: "CREAR ASTRONAUTA",
            showLito: true
        }
    ];

    // =====================================
    // TIERRA PIXEL ART
    // =====================================

    ctx.imageSmoothingEnabled = false;

    function paintEarth(time = 0) {
        const w = 64;
        const scale = 2;
        const rotation = time * 0.00007;

        ctx.clearRect(
            0, 0,
            earth.width,
            earth.height
        );

        for (let y = 0; y < w; y++) {
            for (let x = 0; x < w; x++) {
                const dx = x - 31.5;
                const dy = y - 31.5;
                const radius = Math.hypot(dx, dy);

                if (radius > 29) continue;

                const longitude = dx / 29 + rotation;
                const latitude = dy / 29;

                const land =
                    Math.sin(longitude * 8) *
                    Math.cos(latitude * 5) +
                    0.6 * Math.cos(
                        longitude * 15 + latitude * 8
                    );

                const clouds =
                    Math.sin(
                        longitude * 22 + latitude * 19
                    ) +
                    Math.cos(
                        longitude * 12 - latitude * 28
                    );

                let color = land > 0.42
                    ? "#3A9B79"
                    : "#3478BE";

                if (land > 1.1) {
                    color = "#68B88A";
                }

                if (clouds > 1.65) {
                    color = "#E4DFFF";
                }

                // Sombra de la esfera
                if (dx > 12) {
                    color = land > 0.42
                        ? "#245466"
                        : "#1A1F4D";
                }

                if (radius > 27.5 && dx < 9) {
                    color = "#81C9EE";
                }

                ctx.fillStyle = color;

                ctx.fillRect(
                    x * scale,
                    y * scale,
                    scale,
                    scale
                );
            }
        }
    }

    paintEarth();

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    let lastFrame = 0;

    function animateEarth(now) {
        if (now - lastFrame > 150) {
            paintEarth(now);
            lastFrame = now;
        }

        requestAnimationFrame(animateEarth);
    }

    if (!reducedMotion) {
        requestAnimationFrame(animateEarth);
    }

    // =====================================
    // SPRITE PIXEL ART DE LITO
    // =====================================

    const sprite = [
        "........M.......",
        ".......MMM......",
        ".......MMM......",
        "......LLL.......",
        ".....LLLLL......",
        "....LCCCCC L....".replace(" ", ""),
        "...LCCCCCCCL....",
        "...LPPPPPPPL....",
        "..LPPDDDDDPP L..".replace(" ", ""),
        "..LPPDMDMDPPL...",
        "..LPPDDDDD PPL..".replace(" ", ""),
        "...LPPPPPPPL....",
        "....LCCCCCL.....",
        ".....LLLLL......",
        "......MMM.......",
        ".......M........"
    ];

    const palette = {
        M: "#8FF0D8",
        L: "#E4DFFF",
        C: "#ABA1F5",
        P: "#6E62CE",
        D: "#120E33"
    };

    function drawLito() {
        litoCtx.clearRect(0, 0, 32, 32);
        litoCtx.imageSmoothingEnabled = false;

        sprite.forEach((row, y) => {
            [...row].forEach((key, x) => {
                if (!palette[key]) return;

                litoCtx.fillStyle = palette[key];
                litoCtx.fillRect(x * 2, y * 2, 2, 2);
            });
        });
    }

    drawLito();

    // =====================================
    // AUDIO
    // =====================================

    function stopVoice() {
        if (speechSupported) {
            window.speechSynthesis.cancel();
        }
    }

    function speak(text) {
        if (!voiceEnabled || !speechSupported) {
            return;
        }

        stopVoice();

        const speech =
            new SpeechSynthesisUtterance(text);

        speech.lang = "es-ES";
        speech.rate = 0.9;
        speech.pitch = sceneIndex === 2 ? 1.15 : 1;

        window.speechSynthesis.speak(speech);
    }

    if (!speechSupported) {
        voiceBtn.disabled = true;
        voiceBtn.textContent = "VOZ NO DISPONIBLE";
        voiceBtn.setAttribute("aria-pressed", "false");
    }

    // =====================================
    // ESCENAS
    // =====================================

    function goToAvatar() {
        stopVoice();
        window.location.assign(destination.href);
    }

    function nextScene() {
        if (sceneIndex === scenes.length - 1) {
            goToAvatar();
            return;
        }

        sceneIndex++;

        const scene = scenes[sceneIndex];

        speaker.textContent = scene.speaker;
        title.textContent = scene.title;
        dialog.textContent = scene.text;
        nextBtn.textContent = scene.button;

        litoBox.hidden = !scene.showLito;

        if (sceneIndex === 0) {
            planetArea.classList.add("visible");
        }

        speak(scene.text);
    }

    nextBtn.addEventListener("click", nextScene);
    skipBtn.addEventListener("click", goToAvatar);

    voiceBtn.addEventListener("click", () => {
        if (!speechSupported) return;

        voiceEnabled = !voiceEnabled;
        stopVoice();

        voiceBtn.textContent = voiceEnabled
            ? "VOZ: ON"
            : "VOZ: OFF";

        voiceBtn.setAttribute(
            "aria-pressed",
            String(voiceEnabled)
        );

        if (voiceEnabled && sceneIndex >= 0) {
            speak(scenes[sceneIndex].text);
        }
    });

    window.addEventListener("pagehide", stopVoice);
})();
