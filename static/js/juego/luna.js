
import { Motor } from "./motor.js";
import { Rover } from "./rover.js";
import { Camara } from "./camara.js";

const canvas = document.getElementById("gameCanvas");
const mensaje = document.getElementById("mensaje");

// Exploración lunar ampliada (luna-mision.js): oxígeno, muestras, placa y puntos seguros.
const Mision = () => window.StarMoonMission;
const WORLD_WIDTH = window.StarMoonCore?.WORLD_WIDTH || 2800;
const GROUND_Y = 320;

const motor = new Motor(canvas);
const rover = new Rover(100, GROUND_Y - 32);
const camara = new Camara(canvas.width, WORLD_WIDTH);

const artefacto = {
    nombre: "Apollo 11 - Eagle",
    // Eagle queda junto al punto de partida: ahí empieza la caminata.
    x: (window.StarMoonCore?.EAGLE_X ?? 2100) - 40,
    width: 80,
    descubierto: window.StarFlow?.getArtifact?.("eagle")?.state === "registered"
};

let teclaAnterior = false;

const estrellas = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * 270,
    size: Math.random() > 0.8 ? 3 : 1
}));

const rocas = Array.from({ length: 85 }, (_, i) => ({
    x: i * 34 + Math.random() * 20,
    y: 325 + Math.random() * 65,
    size: 4 + Math.random() * 15
}));

function update(dt, rawKeys) {

    const M = Mision();
    const keys = M ? M.keys(rawKeys) : rawKeys;

    // Tarjetas, visor 3D, pausa o pestaña oculta: se detiene el rover y el oxígeno.
    if (M?.paused()) {
        teclaAnterior = Boolean(keys.KeyE);
        return;
    }

    rover.update(dt, keys, WORLD_WIDTH);
    camara.update(rover, dt);

    const distancia = Math.abs(
        rover.x + rover.width / 2 -
        (artefacto.x + artefacto.width / 2)
    );

    const interactuar = Boolean(keys.KeyE);

    if (artefacto.descubierto && distancia < 100) {

        mensaje.textContent =
            "LITO: Eagle: el módulo lunar de Apollo 11.";

    } else if (!artefacto.descubierto && distancia < 100) {

        mensaje.textContent =
            "LITO: ¡Detecto un artefacto! Presioná E.";

        if (interactuar && !teclaAnterior) {

            artefacto.descubierto = true;

            document.dispatchEvent(
                new CustomEvent("artefacto:descubierto", {
                    detail: {
                        nombre: artefacto.nombre
                    }
                })
            );
        }

    } else if (!M) {

        mensaje.textContent =
            "LITO: Avancemos. Hay una señal más adelante.";
    }

    teclaAnterior = interactuar;
    M?.update(dt, rover);
}

function dibujarEspacio(ctx) {

    ctx.fillStyle = "#070b1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";

    estrellas.forEach(estrella => {
        ctx.fillRect(
            estrella.x,
            estrella.y,
            estrella.size,
            estrella.size
        );
    });

    // Planeta Tierra
    ctx.beginPath();
    ctx.arc(170, 90, 55, 0, Math.PI * 2);
    ctx.fillStyle = "#3478be";
    ctx.fill();

    ctx.fillStyle = "#65a88c";
    ctx.fillRect(140, 65, 35, 20);
    ctx.fillRect(165, 85, 25, 30);
}

function dibujarMontanas(ctx, factor, color, altura) {

    ctx.save();

    ctx.translate(
        -Math.round(camara.x * factor), 0
    );

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);

    for (let x = 0; x <= WORLD_WIDTH + 200; x += 160) {

        const y = GROUND_Y - 30 -
            Math.abs(Math.sin(x * 0.013)) * altura;

        ctx.lineTo(x, y);
    }

    ctx.lineTo(WORLD_WIDTH + 200, GROUND_Y);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function dibujarTerreno(ctx) {

    ctx.fillStyle = "#9296a6";
    ctx.fillRect(0, GROUND_Y, WORLD_WIDTH, 80);

    ctx.fillStyle = "#676d80";
    ctx.fillRect(0, GROUND_Y + 15, WORLD_WIDTH, 65);

    rocas.forEach(roca => {

        ctx.fillStyle = "#4b5060";

        ctx.fillRect(
            roca.x,
            roca.y,
            roca.size,
            roca.size / 2
        );
    });
}

function dibujarEagle(ctx) {

    const x = artefacto.x;
    const y = GROUND_Y;

    // Etapa de descenso
    ctx.fillStyle = "#c49a45";
    ctx.fillRect(x + 8, y - 45, 64, 25);

    // Estructura superior de la maqueta
    ctx.fillStyle = "#d8dce4";
    ctx.fillRect(x + 16, y - 60, 48, 15);

    // Patas
    ctx.strokeStyle = "#e4e7ed";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(x + 15, y - 25);
    ctx.lineTo(x, y);
    ctx.moveTo(x + 65, y - 25);
    ctx.lineTo(x + 80, y);
    ctx.stroke();

    // Indicador de descubrimiento
    ctx.fillStyle = artefacto.descubierto
        ? "#4ade80"
        : "#facc15";

    ctx.fillRect(x + 35, y - 88, 10, 10);

    ctx.font = "13px monospace";
    ctx.fillText("APOLLO 11", x, y - 100);
}

function dibujarHUD(ctx) {

    const progreso = Mision()
        ? Mision().state.box / 5
        : Math.min(rover.x / artefacto.x, 1);

    ctx.fillStyle = "#101729";
    ctx.fillRect(20, 20, 220, 54);

    ctx.font = "12px monospace";
    ctx.fillStyle = "#ffffff";

    ctx.fillText("EXPLORACION LUNAR", 32, 39);

    ctx.fillStyle = "#334155";
    ctx.fillRect(32, 50, 196, 10);

    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(32, 50, 196 * progreso, 10);
}

function render(ctx) {

    dibujarEspacio(ctx);

    dibujarMontanas(ctx, 0.15, "#252b40", 100);
    dibujarMontanas(ctx, 0.40, "#454b60", 65);

    ctx.save();

    camara.apply(ctx);

    dibujarTerreno(ctx);
    dibujarEagle(ctx);
    Mision()?.drawWorld(ctx, GROUND_Y);
    rover.draw(ctx);

    ctx.restore();

    dibujarHUD(ctx);
}

motor.start(update, render);
