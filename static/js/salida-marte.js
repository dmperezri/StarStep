
"use strict";

(function () {

    let active = false;

    const tr = (es, en) =>
        window.StarI18n?.lang === "en" ? en : es;

    function ready() {

        const flow = window.StarFlow;

        return flow?.isActComplete?.("luna") === true &&
            flow?.canEnter?.("mars_transition") === true &&
            flow?.getCurrentStage?.() === "mars_transition";
    }

    function start(explanation = "") {

        if (active || !ready()) return false;

        const link = document.querySelector(
            'a.next-act[href^="/marte"]'
        );

        if (!link) return false;

        active = true;

        const destination = link.href;

        const overlay = document.createElement("dialog");

        overlay.className = "ss-mars-departure";
        overlay.setAttribute("aria-labelledby", "departureTitle");

        overlay.innerHTML = `
            <header class="ss-departure-header">

                <strong>STAR<span>STEP</span></strong>

                <span id="departureTitle"></span>

                <button type="button" id="departurePause"></button>

            </header>

            <canvas width="480" height="270"
                    id="departureCanvas"
                    aria-hidden="true"></canvas>

            <section class="ss-departure-dialog">

                <canvas id="departureLito"
                        width="64" height="64"
                        aria-hidden="true"></canvas>

                <div>
                    <strong>LITO</strong>
                    <p id="departureMessage"></p>
                    <small id="departureExplanation"></small>
                </div>

            </section>

            <progress id="departureProgress"
                      max="15" value="0"></progress>

            <p class="ss-departure-note"></p>
        `;

        document.body.append(overlay);

        const $ = id => overlay.querySelector("#" + id);

        const canvas = $("departureCanvas");
        const ctx = canvas.getContext("2d");
        const portrait = $("departureLito").getContext("2d");

        ctx.imageSmoothingEnabled = false;

        try {
            overlay.showModal();
        } catch {
            overlay.remove();
            active = false;
            return false;
        }

        link.hidden = true;

        const reduced = matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        let elapsed = 0;
        let last = null;
        let paused = false;
        let phase = -1;

        const sound = window.StarSound;

        sound?.init?.();
        sound?.startMusic?.();

        function messages() {

            return [
                [
                    tr("MISIÓN LUNAR COMPLETADA",
                       "LUNAR MISSION COMPLETE"),

                    tr(
                        "¡Excelente trabajo, cadete! Nuestro diploma lunar está en la bitácora. ¡Despegamos hacia Marte!",
                        "Great work, cadet! Our lunar diploma is in the logbook. We are heading to Mars!"
                    )
                ],
                [
                    tr("RUMBO AL PLANETA ROJO",
                       "HEADING TO THE RED PLANET"),

                    tr(
                        "En la Luna encontramos las huellas del fuego. En Marte buscaremos las huellas del agua.",
                        "On the Moon we found traces of fire. On Mars we will search for traces of water."
                    )
                ],
                [
                    tr("ACTO II · MARTE",
                       "ACT II · MARS"),

                    tr(
                        "¡Allí está Marte! Es hora de conocer al explorador Opportunity.",
                        "There is Mars! It is time to meet the explorer Opportunity."
                    )
                ]
            ];
        }

        function updatePhase(n) {

            phase = n;

            const message = messages()[n];

            $("departureTitle").textContent = message[0];
            $("departureMessage").textContent = message[1];

            $("departureExplanation").textContent =
                n === 0 ? explanation : "";

            if (sound?.voiceOn) {
                sound.speak(message[1], { lito: true });
            }

            if (n === 0) sound?.effect?.("launch");
            if (n === 2) sound?.effect?.("arrival");
        }

        overlay.querySelector(
            ".ss-departure-note"
        ).textContent = tr(
            "N · Simulación narrativa. Apollo 11 y Opportunity fueron misiones distintas.",
            "N · Narrative simulation. Apollo 11 and Opportunity were separate missions."
        );

        // Retrato de Lito.

        portrait.fillStyle = "#262C66";
        portrait.fillRect(0, 0, 64, 64);
        portrait.imageSmoothingEnabled = false;

        window.StarArt?.lito?.(
            portrait, 32, 29, 0, "moon", "happy"
        );

        function updatePause() {

            $("departurePause").textContent = paused
                ? tr("REANUDAR", "RESUME")
                : tr("PAUSA", "PAUSE");

            $("departurePause").setAttribute(
                "aria-pressed", String(paused)
            );
        }

        function togglePause() {

            paused = !paused;
            last = null;

            if (paused) {
                sound?.stopVoice?.();
            } else if (sound?.voiceOn && phase >= 0) {
                sound.speak(messages()[phase][1], { lito: true });
            }

            updatePause();
        }

        $("departurePause").onclick = togglePause;

        overlay.addEventListener("cancel", event => {
            event.preventDefault();
            togglePause();
        });

        updatePause();

        function rect(x, y, w, h, color) {

            ctx.fillStyle = color;

            ctx.fillRect(
                Math.round(x), Math.round(y), w, h
            );
        }

        function stars(t) {

            for (let i = 0; i < 115; i++) {

                const speed = reduced ? 0 : t * (5 + i % 3);

                const x = ((i * 137 - speed) % 480 + 480) % 480;
                const y = (i * 73 + 17) % 270;

                rect(x, y, i % 8 === 0 ? 2 : 1, 1,
                    i % 6 === 0 ? "#8FF0D8" : "#B9BEE6");
            }
        }

        function planet(kind, x, y, radius, time) {

            if (window.StarPlanets) {

                StarPlanets.draw(
                    ctx, kind, x, y,
                    Math.max(1, radius),
                    reduced ? 0 : time
                );

                return;
            }

            ctx.fillStyle = {
                earth: "#226FC0",
                moon: "#C3C7D6",
                mars: "#D9593A"
            }[kind];

            ctx.beginPath();
            ctx.arc(x, y, Math.max(1, radius),
                    0, Math.PI * 2);
            ctx.fill();
        }

        // Nave ficticia StarStep, estilo pixel art.

        function ship(x, y, angle, time) {

            ctx.save();
            ctx.translate(Math.round(x), Math.round(y));
            ctx.rotate(angle);

            rect(-24, -7, 36, 14, "#E4DFFF");
            rect(-9, -5, 14, 10, "#8FF0D8");
            rect(-20, -13, 12, 6, "#6E62CE");
            rect(-20, 7, 12, 6, "#6E62CE");
            rect(-29, -5, 5, 10, "#868CA4");

            ctx.fillStyle = "#E4DFFF";
            ctx.beginPath();
            ctx.moveTo(12, -7);
            ctx.lineTo(24, 0);
            ctx.lineTo(12, 7);
            ctx.fill();

            const flame = reduced
                ? 12
                : 12 + Math.floor(Math.sin(time * 22) * 7 + 7);

            rect(-29 - flame, -4, flame, 8, "#D9593A");
            rect(-29 - flame * .65, -2,
                 flame * .65, 4, "#FFE066");

            ctx.restore();
        }

        function render(now) {

            if (!overlay.isConnected) {
                active = false;
                link.hidden = false;
                return;
            }

            if (paused || document.hidden) {
                last = null;
                requestAnimationFrame(render);
                return;
            }

            elapsed += last === null
                ? 0
                : Math.min(.1, (now - last) / 1000);

            last = now;

            const next = elapsed < 5 ? 0
                : elapsed < 11 ? 1 : 2;

            if (next !== phase) updatePhase(next);

            const t = elapsed;

            rect(0, 0, 480, 270, "#0E1233");
            stars(t);

            if (phase === 0) {

                // Despegue desde la Tierra.

                const q = reduced ? .65 : Math.min(1, t / 5);

                planet("earth", 240, 340,
                    170 - q * 65, t);

                ship(240, 195 - q * 105,
                    -Math.PI / 2, t);

            } else if (phase === 1) {

                // La nave cruza el espacio.

                const q = reduced ? .5 : (t - 5) / 6;

                planet("earth", 60 - q * 40, 190,
                    48 - q * 24, t);

                planet("moon", 145 - q * 85, 75,
                    24 - q * 12, t);

                ship(175 + q * 130, 135, 0, t);

            } else {

                // Aproximacion al planeta rojo.

                const q = reduced ? .75 : (t - 11) / 4;

                planet("mars", 350 - q * 35, 128,
                    38 + q * 72, t);

                ship(115 + q * 80, 140, 0, t);
            }

            if (!reduced && t > 14) {

                ctx.fillStyle =
                    `rgba(14,18,51,${Math.min(1, t - 14)})`;

                ctx.fillRect(0, 0, 480, 270);
            }

            $("departureProgress").value = t;

            if (t >= 15) {

                sound?.stopVoice?.();

                // StarFlow vuelve a validar antes de navegar.

                if (ready()) {
                    window.location.assign(destination);
                    return;
                }

                overlay.close();
                overlay.remove();
                active = false;
                link.hidden = false;
                return;
            }

            requestAnimationFrame(render);
        }

        updatePhase(0);

        requestAnimationFrame(render);

        return true;
    }

    window.StarMarsDeparture = Object.freeze({
        start, ready
    });

    document.addEventListener("DOMContentLoaded", () => {

        const link = document.querySelector(
            'a.next-act[href^="/marte"]'
        );

        // Respaldo para partidas anteriores a esta actualizacion.

        link?.addEventListener("click", event => {

            if (ready() && start()) {
                event.preventDefault();
            }
        });
    });

})();
