"use strict";
/* Narrative cutscene ONLY: does not mutate StarFlow, StarProgress, milestones or navigation. */
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('starMarsTransit');
  const canvas = document.getElementById('starMarsJourneyCanvas');
  if (!overlay || !canvas) return;
  // La cinemática MP4 reemplaza el viaje decorativo al iniciar el Acto II.
  // El reproductor oficial gestiona también las partidas antiguas y las visitas posteriores.
  // Nunca superponer la animación decorativa a la cinemática MP4.
  if (window.StarCinematic && document.getElementById("marsCinematic")) return;
  // La URL de la navegación válida identifica la cinemática, aunque el referrer se pierda.
  // Esto no desbloquea ningún nivel y no crea claves de almacenamiento nuevas.
  const fromMoon = (() => {
    const params = new URLSearchParams(location.search);
    const requested = params.get('viaje') === 'luna';
    if (requested) {
      params.delete('viaje');
      try { history.replaceState(history.state, '', location.pathname + (params.toString() ? '?' + params : '') + location.hash); } catch {}
    }
    let referred = false;
    try { referred = new URL(document.referrer).pathname.replace(/\/$/, '') === '/luna'; } catch {}
    return requested || referred;
  })();
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!fromMoon || reduced) return;
  const ctx = canvas.getContext('2d', {alpha:false});
  if (!ctx) return;
  const title = document.getElementById('starMarsJourneyTitle');
  const caption = document.getElementById('starMarsJourneyCaption');
  const skip = document.getElementById('starMarsJourneySkip');
  const isEnglish = () => (window.StarI18n?.lang || localStorage.getItem('starstep_lang') || 'es') === 'en';
  const translations = {
    es: [
      ['¡TODOS A BORDO!', 'El astronauta y LITO preparan la nave espacial.'],
      ['DESPEGANDO DE LA LUNA', 'La nave deja atrás las huellas de Apollo 11.'],
      ['RUMBO A MARTE', 'Viajamos entre las estrellas hacia el planeta rojo.'],
      ['¡MARTE A LA VISTA!', 'Comienza la misión de Opportunity.']
    ],
    en: [
      ['ALL ABOARD!', 'The astronaut and LITO prepare the spacecraft.'],
      ['LEAVING THE MOON', 'The ship leaves Apollo 11’s footprints behind.'],
      ['ON OUR WAY TO MARS', 'We travel through the stars toward the red planet.'],
      ['MARS IN SIGHT!', 'Opportunity’s mission is about to begin.']
    ]
  };
  let start = performance.now(), raf = 0, ended = false;
  overlay.hidden = false;
  skip.addEventListener('click', close);
  function close(){if(ended)return;ended=true;cancelAnimationFrame(raf);overlay.hidden=true;}
  const W=480,H=270;
  const px=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
  function circle(cx,cy,r,shade,kind){
    if(r<2)return;
    for(let y=-r;y<=r;y++){
      const extent=Math.sqrt(Math.max(0,r*r-y*y));
      for(let x=-Math.floor(extent);x<=extent;x+=2){
        const n=x/r, t=y/r;
        let col=shade;
        const noise=Math.sin(n*12+t*7)+Math.cos(n*9-t*15);
        if(kind==='earth')col=noise>0.68?'#5be39a':(noise>0.34?'#8ff0d8':'#1a4b9c');
        else if(kind==='moon')col=noise>0.95?'#575c74':(noise>0.35?'#868ca4':'#c3c7d6');
        else if(kind==='mars')col=noise>0.75?'#f7b08e':(noise<-.75?'#7a2818':'#d9593a');
        if(n>0.25 && ((x+y)&1)===0)col=kind==='mars'?'#a63a26':kind==='moon'?'#575c74':'#1a1f4d';
        px(cx+x,cy+y,2,1,col);
      }
    }
    px(cx-r*.25,cy-r*.78,r*.6,2,'#fff8e7');
  }
  function ship(x,y,scale){
    ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scale,scale);
    // game-appropriate 16-bit ship with transparent cockpit and gold engine
    px(-26,0,12,5,'#6e62ce');px(14,0,12,5,'#6e62ce');
    px(-14,-5,28,15,'#aba1f5');px(-9,-11,18,22,'#e4dfff');
    px(-6,-13,12,8,'#3fd0e0');px(-3,-11,6,4,'#0e1233');
    px(-15,11,30,6,'#575c74');px(-7,17,14,4,'#ffe066');
    ctx.restore();
  }
  // Personajes de la secuencia: un cadete con traje y LITO, en pixel art.
  // No depende de la lógica de avatar/progreso y no altera la partida.
  function astronaut(x,y,scale=1) {
    ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scale,scale);
    px(-5,-21,10,9,'#e4dfff');px(-4,-19,8,6,'#8ff0d8');px(-2,-17,4,3,'#1a1f4d');
    px(-6,-12,12,13,'#aba1f5');px(-9,-10,3,9,'#e4dfff');px(6,-10,3,9,'#e4dfff');
    px(-5,1,4,8,'#e4dfff');px(1,1,4,8,'#e4dfff');px(-6,8,5,3,'#575c74');px(1,8,5,3,'#575c74');
    ctx.restore();
  }
  function lito(x,y,sec) {
    ctx.save();ctx.translate(Math.round(x),Math.round(y+Math.sin(sec*5)*2));
    px(-7,-7,14,14,'#aba1f5');px(-5,-5,10,10,'#6e62ce');px(-4,-2,8,5,'#0e1233');
    px(-3,-1,2,2,'#8ff0d8');px(2,-1,2,2,'#8ff0d8');
    px(-1,-12,2,4,'#8ff0d8');px(-1,8,2,4,'#8ff0d8');
    ctx.restore();
  }
  function planet(kind,x,y,r,sec) {
    if (window.StarPlanets?.draw) window.StarPlanets.draw(ctx,kind,x,y,r,sec);
    else circle(x,y,r,'',kind);
  }
  function render(now){
    if(ended)return;
    const s=(now-start)/1000;
    if(s>=9){close();return;}
    const phase=s<2?0:s<4?1:s<7?2:3;
    const lang=isEnglish()?'en':'es';
    title.textContent=translations[lang][phase][0];caption.textContent=translations[lang][phase][1];
    skip.textContent=lang==='en'?'SKIP ANIMATION ›':'SALTAR ANIMACIÓN ›';
    px(0,0,W,H,'#0e1233');
    // stable tiny stars, travelling faster as ship accelerates
    for(let i=0;i<110;i++){
      const seed=(i*73+11)%480, sy=(i*41+19)%260;
      const speed=phase===2?40:phase===1?19:3;
      const x=(seed-Math.floor(s*speed*(.3+(i%5)/7))%480+480)%480;
      px(x,sy,phase===2?(i%4+1):1,i%9===0?2:1,['#fff8e7','#8ff0d8','#aba1f5'][i%3]);
    }
    // transition: moon behind on left, Mars approaching on right
    if(phase===0){planet('moon',110,161,73,s);ship(270,143,1.3);astronaut(185+Math.min(1,s/1.8)*54,169,.92);lito(183+Math.min(1,s/1.8)*55,139,s);px(269,123,6,6,'#ffe066');}
    if(phase===1){planet('moon',105-(s-2)*22,195,Math.max(23,73-(s-2)*17),s);ship(263,149-(s-2)*35,1.20);lito(292,143-(s-2)*35,s);}
    if(phase===2){planet('moon',32,212,16,s);planet('mars',432,110,19+(s-4)*10,s);ship(241,133+Math.sin(s*4)*2,1.15);lito(268,99+Math.sin(s*3)*3,s);}
    if(phase===3){planet('mars',376,138,68+(s-7)*12,s);ship(219+(s-7)*42,138,1.15-(s-7)*.24);lito(250+(s-7)*40,102,s);}
    // signature pixel HUD frame and progress strip
    px(15,13,450,2,'#6e62ce');px(15,255,450,2,'#6e62ce');
    px(24,243,Math.floor(432*s/9),3,'#8ff0d8');
    raf=requestAnimationFrame(render);
  }
  raf=requestAnimationFrame(render);
  window.addEventListener('pagehide',close,{once:true});
});
