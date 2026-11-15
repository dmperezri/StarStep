
import { Motor } from "./motor.js";
import { Rover } from "./rover.js";
import { Camara } from "./camara.js";

const canvas = document.getElementById("gameCanvas");
const mensaje = document.getElementById("mensaje");

// Exploración lunar ampliada (luna-mision.js): oxígeno, muestras, placa y puntos seguros.
const Mision = () => window.StarMoonMission;
const WORLD_WIDTH = window.StarMoonCore?.WORLD_WIDTH || 2800;
const GROUND_Y = 280;

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
    y: GROUND_Y + 12 + ((i * 53) % Math.max(1, canvas.height - GROUND_Y - 25)),
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
            window.StarI18n?.lang === "en" ? "Eagle · Apollo 11" : "Eagle · Apollo 11";

    } else if (!artefacto.descubierto && distancia < 100) {

        mensaje.textContent =
            window.StarI18n?.lang === "en" ? "Eagle detected · E to inspect" : "Eagle detectado · E para inspeccionar";

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
            window.StarI18n?.lang === "en" ? "A signal ahead." : "Hay una señal más adelante.";
    }

    teclaAnterior = interactuar;
    M?.update(dt, rover);
}

function dibujarEspacio(ctx) {

    ctx.fillStyle = "#0d1026";
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

    // Small pixel Earth at upper right.
    const ex=canvas.width-105, ey=60;
    for(let y=-16;y<=16;y+=2){const w=Math.floor(Math.sqrt(17*17-y*y)/2)*2;ctx.fillStyle="#346eae";ctx.fillRect(ex-w,ey+y,w*2,2);}
    ctx.fillStyle="#71a58b";ctx.fillRect(ex-10,ey-6,9,6);ctx.fillRect(ex+2,ey+1,10,8);ctx.fillStyle="#c3c7d6";ctx.fillRect(ex-8,ey-11,10,3);

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

// Layered silhouettes and crater textures adapted from prototype moonScape.
function dibujarTerreno(ctx) {
    const top=GROUND_Y,h=canvas.height-top;
    ['#868CA4','#9A9FB5','#A9AEC0','#B7BBCB','#C3C7D6'].forEach((col,i)=>{ctx.fillStyle=col;ctx.fillRect(0,top+i*h/5,WORLD_WIDTH,h/5+1);});
    ctx.fillStyle='#C3C7D6';ctx.fillRect(0,top,WORLD_WIDTH,2);
    const oval=(cx,cy,rx,ry,col)=>{ctx.fillStyle=col;for(let dy=-ry;dy<=ry;dy+=2){const w=Math.floor(rx*Math.sqrt(Math.max(0,1-dy*dy/(ry*ry+.5))));ctx.fillRect(Math.round(cx-w),Math.round(cy+dy),2*w+1,2);}};
    for(let i=0;i<rocas.length;i++){const r=rocas[i];if(r.x<camara.x-65||r.x>camara.x+canvas.width+65)continue;
      if(i%3===0){const rx=14+Math.round(r.size*1.6),ry=4+Math.round(r.size*.28);oval(r.x,r.y,rx+3,ry+2,'#CDD0DD');oval(r.x,r.y,rx,ry,'#575C74');oval(r.x+2,r.y+2,Math.max(3,rx-4),Math.max(2,ry-2),'#757B94');}
      else{ctx.fillStyle='#3E4256';ctx.fillRect(r.x,r.y,5+r.size*.4,3);ctx.fillStyle='#E4DFFF';ctx.fillRect(r.x,r.y-1,4,1);}
    }
    for(let i=0;i<340;i++){const x=(i*97+13)%WORLD_WIDTH;if(x<camara.x||x>camara.x+canvas.width)continue;const y=top+5+(i*53)%Math.max(1,h-6);ctx.fillStyle=i%4===0?'#575C74':'#E4DFFF';ctx.fillRect(x,y,2,2);}
}
function dibujarEagle(ctx) {
    const scale=2.8, x=artefacto.x+7, y=GROUND_Y-24*scale;
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
    const R=(x,y,w,h,col,c=ctx)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const line=(x,y,x2,y2,col,c=ctx)=>{c.strokeStyle=col;c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();};
    function drawEagle(x,y,withAscent=true,ctx){
 const O='#1A1340';
 // legs
 line(x+2,y+14,x-4,y+22,O,ctx);line(x+22,y+14,x+28,y+22,O,ctx);line(x+3,y+14,x-3,y+22,'#B9BEE6',ctx);line(x+21,y+14,x+27,y+22,'#B9BEE6',ctx);
 R(x-7,y+22,6,2,O,ctx);R(x+25,y+22,6,2,O,ctx);
 // descent stage (gold)
 R(x-1,y+5,26,11,O,ctx);R(x,y+6,24,9,'#E3A92B',ctx);R(x,y+6,24,2,'#FFD23F',ctx);R(x+4,y+9,1,6,'#B9801C',ctx);R(x+12,y+9,1,6,'#B9801C',ctx);R(x+19,y+9,1,6,'#B9801C',ctx);
 R(x+8,y+16,8,3,'#4D5268',ctx);
 // plaque
 R(x+20,y+12,3,3,'#CDD0DD',ctx);
 if(withAscent){R(x+3,y-7,18,13,O,ctx);R(x+4,y-6,16,11,'#CDD0DD',ctx);R(x+4,y-6,16,2,'#E8ECF5',ctx);R(x+7,y-3,4,3,'#1A1340',ctx);R(x+8,y-2,2,1,'#3FD0E0',ctx);R(x+15,y-9,1,3,O,ctx);R(x+13,y-10,5,1,O,ctx)}
}
    drawEagle(0,0,true,ctx);
    // Escalera y detalles de la etapa de descenso.
    R(17,12,1,9,'#CDD0DD');R(20,12,1,9,'#CDD0DD');for(let n=13;n<21;n+=2)R(17,n,4,1,'#FFF8E7');
    ctx.restore();ctx.fillStyle=artefacto.descubierto?'#8FF0D8':'#FFE066';ctx.fillRect(artefacto.x+35,GROUND_Y-113,9,9);ctx.font='13px monospace';ctx.fillText('APOLLO 11',artefacto.x,GROUND_Y-121);
}

function dibujarHUD(ctx) {

    const progreso = Mision()
        ? Mision().state.box / 5
        : Math.min(rover.x / artefacto.x, 1);

    ctx.fillStyle = "#1A1F4D";
    ctx.fillRect(20, 20, 220, 54);

    ctx.font = "12px monospace";
    ctx.fillStyle = "#ffffff";

    ctx.fillText("EXPLORACION LUNAR", 32, 39);

    ctx.fillStyle = "#334155";
    ctx.fillRect(32, 50, 196, 10);

    ctx.fillStyle = "#FFE066";
    ctx.fillRect(32, 50, 196 * progreso, 10);
}

function render(ctx) {

    dibujarEspacio(ctx);

    dibujarMontanas(ctx, 0.15, "#575c74", 22);
    dibujarMontanas(ctx, 0.40, "#868ca4", 12);

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
