(function(){


"use strict";

/* ==================================================
   TRADUCCIONES
   ================================================== */

const $ = id => document.getElementById(id);
const F=window.StarFlow;
if(!F)return;
if(F.getCurrentStage()!=="space_travel"){
    location.replace(F.isStageCompleted("lito_welcome")?F.getEntryPoint().page:"/");return;
}
F.resume();
window.addEventListener("pageshow",e=>{if(e.persisted)location.reload();});
$("flightMain").hidden=false;

const text = {

    es: {

        back: "GUARDAR Y VOLVER AL MENÚ", journal:"BITÁCORA", prep:"Prepará los controles: el vuelo comienza en un momento.",

        title: "RUMBO A LA LUNA",

        sub:
            "Mantené para subir, soltá para bajar. " +
            "Esquivá los asteroides.",

        distance: "DISTANCIA SIMULADA RESTANTE",

        checkpoint: "CHECKPOINT",

        attempt: "INTENTO",

        assist: "ASISTENCIA",

        thrust: "↑ MANTENÉ PARA ASCENDER",

        pause: "PAUSA",

        preview:
            "CAPÍTULO 1 · ROCK & ROLL",

        ready: [

            "CONTROL DE MISIÓN",

            "Cadete, mantené ESPACIO, ↑ o el botón " +
            "de impulso para ascender. Soltá para bajar. " +
            "Superá los cuatro tramos del vuelo.",

            "¡INICIAR VUELO!"

        ],

        crashed: [

            "¡CHOQUE!",

            "Volverás al último punto de control seguro. " +
            "No hay límite de intentos.",

            "REINTENTAR"

        ],

        paused: [

            "VUELO EN PAUSA",

            "Reanudá cuando estés preparado.",

            "REANUDAR"

        ],

        won: [

            "¡LLEGAMOS A LA ÓRBITA LUNAR!",

            "Completaste el viaje. " +
            "Preparando el alunizaje.",

            "CONTINUAR"

        ],

        hints: [

            "ESPACIO / ↑ / control táctil",

            "Asistencia 1 · corredores más amplios",

            "Asistencia 2 · más tiempo para reaccionar",

            "Asistencia 3 · máxima ayuda, colisiones activas"

        ]

    },

    en: {

        back: "SAVE AND RETURN TO MENU", journal:"JOURNAL", prep:"Get your controls ready: flight starts shortly.",

        title: "BOUND FOR THE MOON",

        sub:
            "Hold to rise, release to fall. " +
            "Dodge the asteroids.",

        distance: "SIMULATED DISTANCE REMAINING",

        checkpoint: "CHECKPOINT",

        attempt: "ATTEMPT",

        assist: "ASSIST",

        thrust: "↑ HOLD TO ASCEND",

        pause: "PAUSE",

        preview:
            "CHAPTER 1 · ROCK & ROLL",

        ready: [

            "MISSION CONTROL",

            "Cadet, hold SPACE, ↑ or the thrust button " +
            "to ascend. Release to descend. " +
            "Clear all four flight sections.",

            "START FLIGHT!"

        ],

        crashed: [

            "CRASH!",

            "Return to the last safe checkpoint. " +
            "Retries are unlimited.",

            "RETRY"

        ],

        paused: [

            "FLIGHT PAUSED",

            "Resume when ready.",

            "RESUME"

        ],

        won: [

            "WE REACHED LUNAR ORBIT!",

            "You completed the flight. " +
            "Preparing for landing.",

            "CONTINUE"

        ],

        hints: [

            "SPACE / ↑ / touch controls",

            "Assist 1 · wider corridors",

            "Assist 2 · more reaction time",

            "Assist 3 · maximum help, collisions active"

        ]

    }

};

/* ==================================================
   ESTADO DEL MINIJUEGO
   ================================================== */

let lang = "es";

let g = Flight.create();
const saved=F.getFlightCheckpoint();
g.cp=saved.seconds;g.fails=saved.fails;Flight.reset(g);
let lastSaved={...saved}, graceUntil=performance.now()+1500, finishing=false;
g.mode="ready";
function persistFlight(){
    if(g.cp===lastSaved.seconds && g.fails===lastSaved.fails)return;
    const result=F.saveFlightCheckpoint(g.cp,g.fails);
    if(result.ok)lastSaved={seconds:g.cp,fails:g.fails};
}
function finishFlight(){
    if(finishing || g.mode!=="won")return;
    finishing=true;persistFlight();
    const r=F.recordObjective("space_travel.arrive",{source:"travel_minigame",seconds:g.time});
    if(r.ok && F.getCurrentStage()==="moon_landing"){
        $("action").disabled=true;
        setTimeout(()=>location.replace("/despegue"),650);
    }else{location.replace(F.getEntryPoint().page);}
}
window.addEventListener("pagehide",()=>{persistFlight();window.StarSound?.stopAll();});

let keys = new Set();

let pointers = new Set();

let acc = 0;

let last = null;

const c = $("world").getContext("2d");

c.imageSmoothingEnabled = false;

const reduced = matchMedia(
    "(prefers-reduced-motion: reduce)"
);

/* ==================================================
   LIBERAR CONTROLES
   ================================================== */

function release() {

    keys.clear();

    pointers.clear();

    $("thrust").classList.remove("held");

}

/* ==================================================
   ACTUALIZAR INTERFAZ
   ================================================== */

function refresh() {

    const w = text[lang];

    const running =
        g.mode === "running";

    const distance = Math.max(

        0,

        Math.round(
            384400 * (1 - g.time / 24)
        )

    );

    $("distance").textContent =

        distance.toLocaleString(

            lang === "es"
                ? "es-ES"
                : "en-US"

        ) + " km";

    $("checkpoint").textContent =

        Math.round(
            (g.mode==="won"?24:g.cp) / 24 * 100
        ) + "%";

    $("attempt").textContent =
        g.fails + 1;

    $("assist").textContent =
        Flight.level(g.fails) + "/3";

    $("hint").textContent =
        g.mode==="running" && performance.now()<graceUntil ? w.prep : w.hints[Flight.level(g.fails)];

    $("overlay").hidden = running;

    $("pause").disabled = !running;

    $("thrust").disabled = !running;

    document.querySelectorAll(".track span")

        .forEach((e, i) => {

            e.classList.toggle(

                "done",

                g.time >= (i + 1) * 6

            );

            e.classList.toggle(

                "active",

                g.time >= i * 6 &&

                g.time < (i + 1) * 6

            );

            const progress = Math.max(

                0,

                Math.min(
                    100,
                    (g.time - i * 6) / 6 * 100
                )

            );

            e.style.setProperty(
                "--p",
                progress + "%"
            );

        });

    if (!running) {

        const m = w[g.mode];

        $("messageTitle").textContent = m[0];

        $("messageText").textContent = m[1];

        $("action").textContent = m[2];

    }

}

/* ==================================================
   CAMBIO DE IDIOMA
   ================================================== */

function language(l) {

    lang = l;

    document.documentElement.lang = l;

    document.querySelectorAll("[data-t]")

        .forEach(e => {

            e.textContent =
                text[l][e.dataset.t];

        });

    document.querySelectorAll("[data-lang]")

        .forEach(b => {

            b.setAttribute(

                "aria-pressed",

                String(b.dataset.lang === l)

            );

        });

    $("world").setAttribute(

        "aria-label",

        l === "es"
            ? "Nave y asteroides"
            : "Ship and asteroids"

    );

    refresh();

}

/* ==================================================
   PAUSA
   ================================================== */

function pause() {

    if (g.mode === "running") {

        g.mode = "paused";

        release();

        acc = 0;

        refresh();

        $("action").focus();

    }

}

/* ==================================================
   INICIO, REINTENTO Y REANUDACIÓN
   ================================================== */

$("action").onclick = () => {

    release();

    acc = 0;

    last = null;

    if (g.mode === "crashed") {

        Flight.reset(g);

    } else if (g.mode === "won") {
        finishFlight();return;
    }

    g.mode = "running";
    graceUntil=performance.now()+1000;
    refresh();

    $("thrust").focus();

};

$("pause").onclick = pause;

document.addEventListener("starstep:language",()=>language(StarI18n.lang));

/* ==================================================
   CONTROLES DE TECLADO
   ================================================== */

addEventListener("keydown", e => {

    if (e.code === "Escape") {

        pause();

        return;

    }

    if (

        g.mode !== "running" ||

        !["Space", "ArrowUp"].includes(e.code)

    ) {

        return;

    }

    if (

        e.code === "Space" && e.target.closest?.("button,a") &&

        e.target !== $("thrust")

    ) {

        return;

    }

    e.preventDefault();

    if (!e.repeat) {

        keys.add(e.code);

    }

});

addEventListener("keyup", e => {

    if (keys.delete(e.code)) {

        e.preventDefault();

    }

});

/* ==================================================
   CONTROLES TÁCTILES Y RATÓN
   ================================================== */

for (const el of [

    $("thrust"),

    $("world")

]) {

    el.addEventListener("pointerdown", e => {

        if (g.mode !== "running") {
            return;
        }

        e.preventDefault();

        pointers.add(e.pointerId);

        el.setPointerCapture(e.pointerId);

    });

    for (const type of [

        "pointerup",

        "pointercancel",

        "lostpointercapture"

    ]) {

        el.addEventListener(type, e => {

            pointers.delete(e.pointerId);

        });

    }

}

// Evitar perder el control al cambiar de ventana.

addEventListener("blur", pause);

document.addEventListener(

    "visibilitychange",

    () => {

        if (document.hidden) {

            pause();

        }

        last = null;

    }

);

/* ==================================================
   MOTOR GRÁFICO PIXEL ART
   ================================================== */

function R(x, y, w, h, col) {

    c.fillStyle = col;

    c.fillRect(

        Math.round(x),

        Math.round(y),

        Math.round(w),

        Math.round(h)

    );

}

// Círculos pixelados.

function disc(x, y, r, col) {

    r = Math.max(
        1,
        Math.round(r)
    );

    for (let a = -r; a <= r; a++) {

        const b = Math.floor(

            Math.sqrt(r * r - a * a)

        );

        R(
            x - b,
            y + a,
            b * 2 + 1,
            1,
            col
        );

    }

}

/* ==================================================
   LUNA — APROXIMACIÓN PROGRESIVA
   ================================================== */

function moon(x, y, r) {

    // Contorno.

    disc(
        x,
        y,
        r + 1,
        "#1A1340"
    );

    // Superficie.

    disc(
        x,
        y,
        r,
        "#C3C7D6"
    );

    // Sombra lunar.

    disc(

        x + r * .18,

        y + r * .15,

        r * .78,

        "#868CA4"

    );

    // Cráteres.

    for (const [a, b, s] of [

        [-.35, -.3, .18],

        [.3, -.15, .12],

        [-.1, .35, .14],

        [.45, .35, .08],

        [.05, -.55, .09]

    ]) {

        disc(

            x + a * r,

            y + b * r,

            s * r,

            "#575C74"

        );

        disc(

            x + a * r - 1,

            y + b * r - 1,

            s * r * .55,

            "#9A9FB5"

        );

    }

}

/* ==================================================
   ASTEROIDES VIOLETAS
   ================================================== */

function rock(x, y) {

    // Contorno oscuro.

    disc(
        x,
        y,
        7,
        "#1A1340"
    );

    // Cuerpo de la roca.

    disc(
        x,
        y,
        6,
        "#6A62B5"
    );

    // Iluminación.

    disc(
        x - 2,
        y - 2,
        2,
        "#8F88D6"
    );

    // Sombra.

    R(
        x + 1,
        y + 1,
        3,
        2,
        "#4F45A6"
    );

}

// Barreras de asteroides.

function column(x, y, h) {

    if (h <= 0) {
        return;
    }

    c.save();

    c.beginPath();

    c.rect(
        x - 7,
        y,
        14,
        h
    );

    c.clip();

    R(
        x - 7,
        y,
        14,
        h,
        "#262C66"
    );

    for (

        let v = y + 5;

        v < y + h + 7;

        v += 10

    ) {

        rock(x, v);

    }

    c.restore();

}

/* ==================================================
   NAVE STARSTEP
   ================================================== */

function ship(x, y, t, held) {

    const P = (a, b, w, h, col) => {

        R(

            x - 12 + a,

            y - 5 + b,

            w,

            h,

            col

        );

    };

    const O = "#1A1340";

    // Animación de propulsión.

    const f = held

        ? 3

        : Math.floor(t * 14) % 2;

    P(
        -6 - f,
        3,
        6 + f,
        5,
        "#D9593A"
    );

    P(
        -4 - f,
        4,
        4 + f,
        3,
        "#FFE066"
    );

    P(
        -2,
        5,
        2,
        1,
        "#FFF8E7"
    );

    // Aleta superior.

    P(1, -2, 5, 3, O);

    P(2, -1, 4, 2, "#6E62CE");

    // Aleta inferior.

    P(1, 10, 5, 3, O);

    P(2, 10, 4, 2, "#6E62CE");

    // Contorno del fuselaje.

    P(0, 1, 17, 9, O);

    // Cuerpo blanco.

    P(1, 2, 15, 7, "#FFF8E7");

    // Sombra inferior.

    P(1, 7, 15, 2, "#C3C7D6");

    // Franja violeta.

    P(5, 2, 2, 7, "#ABA1F5");

    // Ventana.

    P(9, 3, 4, 4, O);

    P(10, 4, 2, 2, "#3FD0E0");

    // Punta menta.

    P(16, 1, 3, 9, O);

    P(16, 2, 3, 7, "#8FF0D8");

    P(19, 2, 2, 7, O);

    P(19, 3, 2, 5, "#8FF0D8");

    P(21, 3, 2, 5, O);

    P(21, 4, 1, 3, "#4FC9AE");

    P(23, 5, 1, 1, O);

    P(16, 7, 5, 1, "#4FC9AE");

}

/* ==================================================
   DIBUJAR ESCENARIO COMPLETO
   ================================================== */

function draw() {

    const p = g.time / 24;

    const t = reduced.matches
        ? 0
        : g.time;

    // Fondo espacial.

    R(
        0,
        0,
        320,
        180,
        "#0E1233"
    );

    // Estrellas con movimiento de profundidad.

    for (let i = 0; i < 140; i++) {

        const x = (

            (

                i * 137 + 19 -

                t * (i % 3 + 1) * 20

            ) % 320 + 320

        ) % 320;

        R(

            x,

            (i * 71 + 13) % 180,

            i % 13 === 0 ? 2 : 1,

            i % 13 === 0 ? 2 : 1,

            i % 7 === 0

                ? "#8FF0D8"

                : "#B9BEE6"

        );

    }

    // La Luna aumenta de tamaño.

    moon(

        360 - p * 120,

        90,

        20 + p * 60

    );

    // Corredores de asteroides.

    for (const o of Flight.obstacles(g)) {

        if (

            o.x < -14 ||

            o.x > 334

        ) {

            continue;

        }

        // Barrera superior.

        column(

            o.x,

            0,

            o.top

        );

        // Barrera inferior.

        column(

            o.x,

            o.bottom,

            180 - o.bottom

        );

    }

    // Explosión al colisionar.

    if (g.mode === "crashed") {

        for (let i = 0; i < 10; i++) {

            disc(

                Flight.X +
                ((i * 7) % 21) - 10,

                g.y +
                ((i * 11) % 19) - 9,

                2,

                i % 2

                    ? "#FFE066"

                    : "#D9593A"

            );

        }

    } else {

        // Nave en funcionamiento.

        ship(

            Flight.X,

            g.y,

            t,

            keys.size + pointers.size > 0

        );

    }

}

/* ==================================================
   BUCLE PRINCIPAL
   ================================================== */

function tick(now) {

    if (last === null) {

        last = now;

    }

    const delta = Math.min(

        .1,

        Math.max(

            0,

            (now - last) / 1000

        )

    );

    last = now;

    if (g.mode === "running" && now >= graceUntil) {

        acc += delta;

        while (

            acc >= Flight.DT &&

            g.mode === "running"

        ) {

            Flight.step(

                g,

                keys.size + pointers.size > 0

            );

            acc -= Flight.DT;
            persistFlight();

        }

        if (g.mode !== "running") {

            release();

            acc = 0;

            refresh();

            if(g.mode==="won")finishFlight();else $("action").focus();

        } else {

            refresh();

        }

    }

    $("thrust").classList.toggle(

        "held",

        keys.size + pointers.size > 0

    );

    draw();

    requestAnimationFrame(tick);

}

/* ==================================================
   INICIAR STARSTEP
   ================================================== */

language(StarI18n.lang);
$("action").focus();

requestAnimationFrame(tick);


})();
