"use strict";
document.addEventListener('DOMContentLoaded',()=>{
 const canvas=document.getElementById('world'),c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
 // Escenario marciano pixel art. Mantiene intacta la progresión y los eventos del visor.
 const fill=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
 function frame(now){
  const t=now/1000;
  // Cielo de Marte: franjas cálidas con pequeñas variaciones de luz.
  const sky=['#4a293b','#60303a','#78363b','#97403b','#b4513e','#d6714b','#e79a69'];
  for(let y=0;y<270;y+=9)fill(0,y,480,9,sky[Math.min(sky.length-1,Math.floor(y/27))]);
  // Disco solar difuso y atmósfera polvorienta.
  fill(73,50,26,26,'#f5b981');fill(77,47,18,3,'#ffd6a1');fill(67,59,38,7,'#ed9c68');
  // Mesetas lejanas de Meridiani, con siluetas escalonadas.
  const mesas=[{x:-18,w:98,h:35},{x:73,w:69,h:19},{x:157,w:115,h:31},{x:302,w:95,h:22},{x:398,w:94,h:36}];
  for(const m of mesas){const y=163-m.h;fill(m.x,y+15,m.w,25,'#973f39');fill(m.x+10,y+7,m.w-20,9,'#a54d3d');fill(m.x+19,y,m.w-42,8,'#b95e45');}
  fill(0,169,480,20,'#a84e3f');fill(0,187,480,83,'#b85a40');
  // Lomas y suelo próximo: sensación de profundidad sin imágenes externas.
  for(let x=0;x<480;x+=8){const h=6+Math.round(4*Math.sin(x*.035)+3*Math.sin(x*.097));fill(x,183-h,9,h,'#c46b4a');}
  fill(0,206,480,64,'#8b392e');fill(0,217,480,53,'#983f31');
  for(let i=0;i<75;i++){
   const x=(i*113+17)%480,y=205+(i*29)%65;
   const col=i%7===0?'#d98257':i%3===0?'#61313a':'#ac4c38';
   fill(x,y,2+i%5,1+(i%3),col);
   if(i%8===0)fill(x+1,y-2,5,2,'#cc7956');
  }
  // Viento tenue de polvo; no altera la interacción ni el orden narrativo.
  for(let i=0;i<17;i++){
   const x=((i*61+Math.floor(t*6))%540+540)%540-30;
   const y=96+(i*41)%95;
   fill(x,y,i%4===0?5:2,1,i%3?'#efaa7a':'#b85e4e');
  }
  StarArt.lito(c,405,142,t,'mars','scan');
  requestAnimationFrame(frame);
 }requestAnimationFrame(frame);
});
