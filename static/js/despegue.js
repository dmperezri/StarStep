"use strict";
document.addEventListener('DOMContentLoaded',()=>{
 const c=document.getElementById('world'),ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;
 const $=id=>document.getElementById(id),p=StarProgress.player();$('crew').textContent=`${p.avatar||'astronauta'} · ${(p.alias||'Cadete').toUpperCase()} + LITO`;
 let phase='pan',start=performance.now(),countShown=0,launched=false,arrived=false;
 $('startLaunch').addEventListener('click',()=>{StarSound.init();StarSound.startMusic();StarSound.effect('button');phase='countdown';start=performance.now();$('startLaunch').hidden=true;});
 function smooth(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);}
 function curtain(on){document.querySelector('.curtain').classList.toggle('is-dark',on);}
 function render(now){const t=now/1000,sec=(now-start)/1000;let progress=0;
  ctx.save();ctx.clearRect(0,0,c.width,c.height);
  if(phase==='pan'){StarArt.earthScene(ctx,t);$('countdown').textContent='★';$('travelCaption').textContent='CENTRO DE MISIÓN · TIERRA';}
  else if(phase==='countdown'){
   const n=Math.max(1,3-Math.floor(sec));if(n!==countShown){countShown=n;StarSound.effect('count');}
   ctx.translate(Math.sin(t*24)*Math.min(2,sec*.6),0);StarArt.earthScene(ctx,t);$('countdown').textContent=n;
   if(sec>=3){phase='launch';start=now;StarSound.effect('launch');$('countdown').textContent='¡DESPEGUE!';}
  }
  else if(phase==='launch'){
   progress=smooth(sec/4.5);StarArt.launchScene(ctx,t,progress*.53);$('travelCaption').textContent='ASCENSO · DE LA TIERRA AL ESPACIO';
   if(sec>=4.5){phase='travel';start=now;StarSound.effect('travel');$('countdown').hidden=true;}
  }
  else if(phase==='travel'){
   progress=smooth(sec/4);StarArt.spaceScene(ctx,t,progress);$('travelCaption').textContent='RUMBO A LA LUNA • 384,400 km';
   if(sec>3.4)curtain(true);
   if(sec>=4){phase='descent';start=now;}
  }
  else if(phase==='descent'){
   if(sec<.5){curtain(true);}else{curtain(false);}
   progress=smooth(Math.max(0,sec-.45)/3.2);StarArt.descentScene(ctx,t,progress);$('travelCaption').textContent='ALUNIZAJE · MARE TRANQUILLITATIS';
   if(sec>=3.9){phase='arrived';start=now;StarSound.effect('arrival');}
  }
  else if(phase==='arrived'){
   StarArt.descentScene(ctx,t,1);$('actCard').hidden=false;$('enterMoon').hidden=false;$('travelCaption').textContent='LITO: ¡LO LOGRAMOS!';
  }
  ctx.restore();requestAnimationFrame(render);
 }
 requestAnimationFrame(render);
 window.addEventListener('pagehide',()=>StarSound.stopAll());
});
