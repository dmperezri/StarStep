/* Cinemática Canvas 480×270. Tiempo activo, cinco fases, partículas con límite fijo. */
(() => {
  'use strict';
  const boot=()=>{
    const canvas=document.getElementById('world');if(!canvas)return;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const $=id=>document.getElementById(id), reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    let player={};try{player=window.StarProgress?.player()||{};}catch{}
    $('crew').textContent=`${player.avatar||'astronauta'} · ${(player.alias||'Cadete').toUpperCase()} + LITO`;
    const phases=[{name:'Preparación',duration:2},{name:'Cuenta regresiva',duration:3},{name:'Ignición',duration:4.5},{name:'Ascenso y separación',duration:6},{name:'Travesía y alunizaje',duration:10}];
    let phase=-1,elapsed=0,total=0,last=0,raf=0,done=false,count=0;
    const particles=[],stars=Array.from({length:100},(_,i)=>({x:(i*137+19)%480,y:(i*71)%270}));
    const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
    const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
    function effect(key){try{window.StarSound?.effect(key);}catch{}}
    function setPhase(next){phase=next;elapsed=0;count=0;$('travelCaption').textContent=phases[next]?.name||'Alunizaje completo';document.dispatchEvent(new CustomEvent('starstep:launch-phase',{detail:{phase:next+1}}));if(next===2)effect('launch');if(next===4)effect('travel');}
    function finish(){if(done)return;done=true;phase=5;particles.length=0;$('countdown').hidden=true;$('actCard').hidden=false;$('enterMoon').hidden=false;$('startLaunch').hidden=true;$('skipIntro').hidden=true;$('travelCaption').textContent='LITO: ¡Llegamos a la Luna!';$('altitude').textContent='SUPERFICIE LUNAR';$('launchProgress').value=100;effect('arrival');document.dispatchEvent(new CustomEvent('starstep:launch-complete'));$('enterMoon').focus();}
    function rocket(x,y,scale=1,fire=0,angle=0,separated=false){
      ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.rotate(angle);ctx.scale(scale,scale);
      rect(-7,-28,14,39,'#1A1340');rect(-5,-27,10,35,'#FFF8E7');rect(-4,-33,8,7,'#8FF0D8');rect(-2,-37,4,5,'#E4DFFF');
      rect(-5,-12,10,3,'#262C66');rect(-3,-21,6,6,'#4F45A6');rect(-2,-20,4,3,'#3FD0E0');
      if(!separated){rect(-6,3,12,14,'#C3C7D6');rect(-11,7,5,11,'#8FF0D8');rect(6,7,5,11,'#8FF0D8');}
      if(fire){const flicker=1+Math.sin(total*47)*.16;rect(-6,17,12,Math.round(21*fire*flicker),'#D9593A');rect(-4,17,8,Math.round(16*fire*flicker),'#FFE066');rect(-2,17,4,Math.round(10*fire),'#FFF8E7');}
      ctx.restore();
    }
    function emit(x,y,kind,n){for(let i=0;i<n&&particles.length<180;i++)particles.push({x,y,vx:(Math.random()-.5)*(kind==='smoke'?80:130),vy:kind==='smoke'?-8-Math.random()*15:25+Math.random()*50,age:0,life:kind==='smoke'?2.5:1,size:kind==='smoke'?8+Math.random()*12:1,kind});}
    function drawParticles(dt){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.age+=dt;if(p.age>p.life){particles.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;ctx.globalAlpha=(1-p.age/p.life)*.85;const s=p.size*(1+p.age*.7);rect(p.x-s/2,p.y-s/2,Math.ceil(s),Math.ceil(s*.65),p.kind==='smoke'?(i%3?'#FFF8E7':'#C3C7D6'):'#FFE066');}ctx.globalAlpha=1;}
    function space(speed=0){rect(0,0,480,270,'#0E1233');for(const s of stars)rect(s.x,(s.y+total*speed)%270,1,speed>30?3:1,'#FFF8E7');}
    function ground(time,hide=true){if(window.StarArt)window.StarArt.earthScene(ctx,time,{hideRocket:hide,litoState:'excited'});else{rect(0,0,480,270,'#2861B3');rect(0,218,480,52,'#53964D');}}
    function sky(p){
      const start=[76,150,216],mid=[79,69,166],end=[14,18,51];
      for(let y=0;y<270;y+=3){const f=clamp(p+(270-y)*.0003),a=f<.5?start:mid,b=f<.5?mid:end,k=f<.5?f*2:(f-.5)*2;const rgb=a.map((v,i)=>Math.round(v+(b[i]-v)*k));rect(0,y,480,3,`rgb(${rgb})`);if(y%6===0){ctx.globalAlpha=.09;for(let x=y%4;x<480;x+=4)rect(x,y,1,1,'#FFF8E7');ctx.globalAlpha=1;}}
      if(p>.45){ctx.globalAlpha=(p-.45)/.55;for(const s of stars)rect(s.x,(s.y+total*65)%270,1,3,'#FFF8E7');ctx.globalAlpha=1;}
    }
    function surface(p){space();window.StarPlanets?.draw(ctx,'earth',65,61,21,total);rect(0,208,480,62,'#575C74');
      for(let i=0;i<40;i++)rect(i*13,210+(i*19)%55,7+i%6,2,i%2?'#868CA4':'#3E4256');
      rocket(260,32+smooth(p)*157,1,p<.98?.25:0,0,true);window.StarArt?.lito(ctx,315,154,total,'moon',p>=1?'happy':'scan');
    }
    function render(now){
      raf=0;if(document.hidden)return;
      const dt=last?Math.min(.05,(now-last)/1000):0;last=now;total+=dt;
      if(phase>=0&&!done){elapsed+=dt;if(elapsed>=phases[phase].duration){if(phase===4)finish();else setPhase(phase+1);}}
      ctx.save();ctx.imageSmoothingEnabled=false;
      if(done)surface(1);
      else if(phase<2){
        ground(total);rocket(451,192,1.12);
        if(phase===0){if(Math.random()<dt*18)emit(445,165,'smoke',1);$('countdown').textContent=elapsed<1?'T−5':'T−4';}
        else if(phase===1){const n=Math.max(1,3-Math.floor(elapsed));if(n!==count){count=n;effect('count');$('countdown').textContent=n;$('countdown').classList.remove('count-impact');void $('countdown').offsetWidth;$('countdown').classList.add('count-impact');}
          if(n===1){const retract=smooth(elapsed-2);rect(400,126,Math.round(32*retract),5,'#6D9DB6');rect(400,161,Math.round(22*retract),4,'#6D9DB6');}
        }
        if(phase>=0){rect(389,97,3,3,Math.sin(total*14)>0?'#FFE066':'#D9593A');drawParticles(dt);}
      } else if(phase===2){
        $('countdown').hidden=true;
        const p=elapsed/4.5,lift=165*(Math.exp(p*2.4)-1)/(Math.exp(2.4)-1),shake=reduced?0:(1-p)*2.5;
        ctx.translate(Math.sin(total*71)*shake,Math.cos(total*59)*shake*.7);ground(total);rocket(451,192-lift,1.12,1);
        if(!reduced){emit(451,215,'smoke',3);emit(451,210-lift,'spark',2);}drawParticles(dt);
      } else if(phase===3){
        const p=elapsed/6;sky(p);
        if(p<.35){ctx.save();ctx.translate(-200*p,p*850);ground(total);ctx.restore();ctx.globalAlpha=smooth(p/.35);sky(p);ctx.globalAlpha=1;}
        const rx=451-smooth(p)*211,ry=42+smooth(p)*78;
        rocket(rx,ry,1.12,.8,0,p>.6);
        if(p>.6&&p<.94){const s=(p-.6)/.34;ctx.save();ctx.translate(rx+24*s,ry+18+s*150);ctx.rotate(s*.9);rect(-6,0,12,15,'#C3C7D6');ctx.restore();if(p<.63){ctx.globalAlpha=.45;rect(rx-20,ry+12,40,4,'#FFF8E7');ctx.globalAlpha=1;}}
        $('altitude').textContent=p>=.96?'ÓRBITA':`ALTITUD: ${Math.round(120*p*p)} km`;
      } else if(phase===4){
        const p=elapsed/10;
        if(p<.6){const q=smooth(p/.6);space(12);window.StarPlanets?.draw(ctx,'earth',65-q*95,165,62-q*25,total);window.StarPlanets?.draw(ctx,'moon',430-q*42,100,35+q*32,total);rocket(155+q*160,145-q*30,.9,.4,Math.PI/2,true);window.StarArt?.lito(ctx,175+q*140,85,total,'moon','excited');}
        else{surface((p-.6)/.4);if(p<.65){ctx.globalAlpha=1-smooth((p-.6)/.05);rect(0,0,480,270,'#0E1233');ctx.globalAlpha=1;}}
        $('altitude').textContent=p<.6?'TRAVESÍA LUNAR':'DESCENSO CONTROLADO';
      }
      ctx.restore();
      if(!done&&phase>=0){const prior=phases.slice(0,phase).reduce((sum,v)=>sum+v.duration,0);$('launchProgress').value=(prior+elapsed)/25.5*100;}
      // La escena final es estática: no consume un ciclo permanente.
      if(!done)raf=requestAnimationFrame(render);
    }
    function start(){if(phase>=0||done)return;try{window.StarSound?.init();window.StarSound?.startMusic();}catch{}$('startLaunch').hidden=true;if(reduced){finish();surface(1);return;}setPhase(0);}
    $('startLaunch').addEventListener('click',start);
    $('skipIntro').addEventListener('click',()=>{finish();ctx.save();surface(1);ctx.restore();cancelAnimationFrame(raf);raf=0;});
    document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);raf=0;last=0;if(!document.hidden&&!done)raf=requestAnimationFrame(render);});
    window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);window.StarSound?.stopAll();});
    if(reduced)$('travelCaption').textContent='Movimiento reducido: podés pasar directamente al Acto I.';
    raf=requestAnimationFrame(render);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
