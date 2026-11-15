"use strict";


"use strict";

/* ==================================================
   STARSTEP — MOTOR DE VUELO ESPACIAL
   Referencia: prototipo Rock & Roll
   ================================================== */

const Flight = (() => {

    const W = 320;
    const H = 180;

    const X = 56;

    const TOTAL = 24;
    const DT = 1 / 120;

    const RX = 12;
    const RY = 8;

    // Obstáculos distribuidos en cuatro tramos.

    const centers = [
        [90, 110, 76, 99],
        [104, 75, 113, 86],
        [78, 115, 88, 104],
        [109, 73, 105, 90]
    ];

    const layout = centers.flatMap(
        (row, s) => row.map(
            (center, i) => ({
                at: s * 6 + 1.1 + i * 1.15,
                center,
                s
            })
        )
    );

    // Asistencia progresiva.

    const level = n =>
        Math.min(3, Math.floor(n / 3));

    // Estado inicial.

    function create() {

        return {
            time: 0,
            y: 90,
            vy: 0,
            cp: 0,
            fails: 0,
            mode: "ready"
        };

    }

    // Recuperar el último checkpoint.

    function reset(g) {

        g.time = g.cp;
        g.y = 90;
        g.vy = 0;
        g.mode = "ready";

    }

    // Calcular la posición de los obstáculos.

    function obstacles(g) {

        return layout.map(o => {

            const gap =
                74 - o.s * 7 +
                level(g.fails) * 12;

            return {

                x: X +
                    (o.at - g.time) *
                    (95 + o.s * 11),

                top: o.center - gap / 2,

                bottom: o.center + gap / 2,

                w: 14

            };

        });

    }

    // Físicas de vuelo.

    function step(g, held) {

        if (g.mode !== "running") {
            return;
        }

        const dt =
            DT * (1 - .09 * level(g.fails));

        // Mantener: ascender.
        // Soltar: descender.

        g.vy = Math.max(

            -150,

            Math.min(
                150,
                g.vy +
                (held ? -560 : 300) * dt
            )

        );

        g.y += g.vy * dt;

        g.time = Math.min(
            TOTAL,
            g.time + dt
        );

        // Detectar colisiones.

        const hit =

            g.y - RY < 0 ||

            g.y + RY > H ||

            obstacles(g).some(o =>

                Math.abs(o.x - X) <
                    o.w / 2 + RX &&

                (
                    g.y - RY < o.top ||

                    g.y + RY > o.bottom
                )

            );

        // La colisión tiene prioridad.

        if (hit) {

            g.fails++;
            g.mode = "crashed";

            return;

        }

        // Guardar puntos de control seguros.

        g.cp = Math.max(

            g.cp,

            Math.min(

                18,

                Math.floor(
                    (g.time + 1e-8) / 6
                ) * 6

            )

        );

        // Victoria.

        if (g.time >= TOTAL) {

            g.mode = "won";

        }

    }

    return {

        W,
        H,
        X,
        TOTAL,
        DT,
        RX,
        RY,

        create,
        reset,
        obstacles,
        step,
        level

    };

})();


if(typeof module!=="undefined" && module.exports)module.exports=Flight;
