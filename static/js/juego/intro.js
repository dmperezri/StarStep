
"use strict";

(() => {
    // ==========================================
    // 1. PLANETA TIERRA EN PIXEL ART
    // ==========================================

    const canvas = document.getElementById("earth");
    const ctx = canvas.getContext("2d");

    const size = 64;
    const pixel = canvas.width / size;

    ctx.imageSmoothingEnabled = false;

    function noise(x, y) {
        const n = Math.sin(
            x * 127.1 + y * 311.7
        ) * 43758.5453;

        return n - Math.floor(n);
    }

    function drawEarth(t = 0) {
        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        const shift = Math.floor(t / 180) % 64;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {

                const dx = x - 31.5;
                const dy = y - 31.5;

                const r = Math.hypot(dx, dy);

                if (r > 29) continue;

                const latitude = dy / 29;
                const longitude = (dx + shift) % 64;

                // Continentes estilizados
                const terrain =
                    Math.sin((longitude + 8) * 0.22) *
                    Math.cos(latitude * 4.2) +

                    0.65 * Math.sin(
                        longitude * 0.43 +
                        latitude * 8
                    ) +

                    0.25 * Math.cos(
                        longitude * 0.9 -
                        latitude * 13
                    );

                // Nubes
                const cloud =
                    Math.sin(
                        (longitude + 22) * 0.65 +
                        latitude * 17
                    ) +

                    Math.cos(
                        longitude * 0.3 -
                        latitude * 26
                    );

                const rim = r > 27;

                const shade =
                    0.35 +
                    0.65 * Math.max(
                        0,
                        (18 - dx * 0.7 - dy * 0.35) / 46
                    );

                let color;

                if (
                    cloud > 1.58 &&
                    noise(x, y) > 0.2
                ) {
                    color = "#CFE8EB";

                } else if (terrain > 0.49) {
                    color = shade > 0.53
                        ? (latitude < -0.5
                            ? "#B9BEE6"
                            : "#3A9B79")
                        : "#245466";

                } else {
                    color = shade > 0.53
                        ? "#3D86D8"
                        : "#1B3F88";
                }

                if (rim) {
                    color = "#76C6E9";
                }

                ctx.fillStyle = color;

                ctx.fillRect(
                    x * pixel,
                    y * pixel,
                    pixel,
                    pixel
                );
            }
        }
    }

    drawEarth();

    // Animación de rotación
    let last = 0;

    function loop(time) {
        if (time - last > 220) {
            drawEarth(time);
            last = time;
        }

        requestAnimationFrame(loop);
    }

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!reduceMotion) {
        requestAnimationFrame(loop);
    }

    // ==========================================
    // 2. ELEMENTOS DE LA INTERFAZ
    // ==========================================

    const label = document.getElementById("scene-label");
    const title = document.getElementById("stage-title");
    const story = document.getElementById("story");

    const next = document.getElementById("next");
    const skip = document.getElementById("skip");
    const audio = document.getElementById("audio");

    const lito = document.getElementById("lito");
    const link = document.getElementById("avatar-link");

    let step = -1;
    let voiceOn = true;

    // ==========================================
    // 3. ESCENAS DE LA INTRODUCCIÓN
    // ==========================================

    const scenes = [
        {
            label: "SEÑAL RECIBIDA · PLANETA TIERRA",

            title: "BIENVENIDO A STARSTEP",

            story:
                "Desde la Tierra, nuestra aventura comienza. " +
                "Hay historias esperando en el espacio, " +
                "mucho más allá de nuestro hogar.",

            button: "CONTINUAR"
        },

        {
            label: "ARCHIVO DE EXPLORACIÓN · NASA",

            title: "HUELLAS EN OTROS MUNDOS",

            story:
                "En la Luna y en Marte quedaron instrumentos " +
                "y exploradores que nos enseñaron a comprender " +
                "sus rocas y su suelo. " +
                "Sus misiones terminaron, " +
                "pero sus descubrimientos siguen vivos.",

            button: "CONOCER A LITO"
        },

        {
            label: "COMPAÑERO CONECTADO",

            title: "¡HOLA, EXPLORADOR!",

            story:
                "Soy LITO, tu compañero de misión. " +
                "Juntos descubriremos qué nos cuentan " +
                "los equipos que permanecen en otros mundos. " +
                "Primero, vamos a preparar tu personaje.",

            button: "CREAR ASTRONAUTA",

            lito: true
        }
    ];

    // ==========================================
    // 4. NARRACIÓN
    // ==========================================

    const speechAvailable =
        "speechSynthesis" in window &&
        "SpeechSynthesisUtterance" in window;

    if (!speechAvailable) {
        voiceOn = false;
        audio.textContent = "Voz no disponible";
        audio.disabled = true;
        audio.setAttribute("aria-pressed", "false");
    }

    function speak(text) {
        if (!voiceOn || !speechAvailable) {
            return;
        }

        window.speechSynthesis.cancel();

        const utterance =
            new SpeechSynthesisUtterance(text);

        utterance.lang = "es-ES";
        utterance.rate = 0.88;

        // LITO tiene voz ligeramente diferente
        utterance.pitch = step === 2 ? 1.16 : 1;

        window.speechSynthesis.speak(utterance);
    }

    // ==========================================
    // 5. NAVEGACIÓN
    // ==========================================

    function goAvatar() {
        if (speechAvailable) {
            window.speechSynthesis.cancel();
        }

        window.location.assign(link.href);
    }

    function showNext() {

        // Última escena: ir al astronauta
        if (step === scenes.length - 1) {
            goAvatar();
            return;
        }

        step++;

        const scene = scenes[step];

        label.textContent = scene.label;
        title.textContent = scene.title;
        story.textContent = scene.story;

        next.textContent = scene.button;

        // Mostrar LITO únicamente en su escena
        lito.hidden = !scene.lito;

        speak(scene.story);
    }

    // ==========================================
    // 6. EVENTOS
    // ==========================================

    next.addEventListener("click", showNext);

    skip.addEventListener("click", goAvatar);

    audio.addEventListener("click", () => {

        voiceOn = !voiceOn;

        audio.setAttribute(
            "aria-pressed",
            String(voiceOn)
        );

        audio.textContent = voiceOn
            ? "Voz: activada"
            : "Voz: desactivada";

        if (speechAvailable) {
            window.speechSynthesis.cancel();
        }

        if (voiceOn && step >= 0) {
            speak(scenes[step].story);
        }
    });

    // Detener narración al salir
    window.addEventListener("pagehide", () => {
        if (speechAvailable) {
            window.speechSynthesis.cancel();
        }
    });

})();
