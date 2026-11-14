
import { Motor } from "./motor.js";
import { Rover } from "./rover.js";

const canvas = document.getElementById("gameCanvas");
const motor = new Motor(canvas);

const rover = new Rover(80, 288);

const artefacto = {
    x: 740,
    width: 48,
    descubierto: false
};

const mensaje = document.getElementById("mensaje");

const estrellas = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * 260
}));

function update(dt, keys) {
    rover.update(dt, keys, canvas.width);

    const distancia = Math.abs(
        rover.x + rover.width / 2 -
        (artefacto.x + artefacto.width / 2)
    );

    if (distancia < 85) {
        mensaje.textContent =
            "LITO: ¡Encontramos un artefacto! Presioná E.";

        if (keys.KeyE) {
            artefacto.descubierto = true;
        }
    } else {
        mensaje.textContent =
            "LITO: Explorá la superficie lunar.";
    }

    if (artefacto.descubierto) {
        mensaje.textContent =
            "LITO: ¡Artefacto descubierto!";
    }
}

function render(ctx) {
    // Espacio
    ctx.fillStyle = "#080c20";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Estrellas
    ctx.fillStyle = "#ffffff";

    estrellas.forEach((estrella) => {
        ctx.fillRect(estrella.x, estrella.y, 2, 2);
    });

    // Tierra
    ctx.beginPath();
    ctx.arc(160, 100, 45, 0, Math.PI * 2);
    ctx.fillStyle = "#3676ba";
    ctx.fill();

    // Montañas lunares
    ctx.fillStyle = "#454b60";
    ctx.beginPath();
    ctx.moveTo(0, 320);
    ctx.lineTo(120, 210);
    ctx.lineTo(240, 290);
    ctx.lineTo(420, 190);
    ctx.lineTo(620, 285);
    ctx.lineTo(800, 230);
    ctx.lineTo(960, 320);
    ctx.closePath();
    ctx.fill();

    // Superficie lunar
    ctx.fillStyle = "#8c92a3";
    ctx.fillRect(0, 320, canvas.width, 80);

    ctx.fillStyle = "#666c80";
    ctx.fillRect(0, 335, canvas.width, 65);

    // Artefacto provisional
    ctx.fillStyle = artefacto.descubierto
        ? "#72e0a0"
        : "#eab308";

    ctx.fillRect(artefacto.x, 275, 48, 45);

    ctx.fillStyle = "#ffffff";
    ctx.font = "12px monospace";
    ctx.fillText("OBJETIVO", artefacto.x - 5, 260);

    rover.draw(ctx);
}

motor.start(update, render);
