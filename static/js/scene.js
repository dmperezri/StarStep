"use strict";
window.StarArt = (() => {
 const P={night:'#0E1233',panel:'#1A1F4D',raised:'#262C66',outline:'#1A1340',cream:'#FFF8E7',soft:'#B9BEE6',mint:'#8FF0D8',crystal:'#ABA1F5',facet:'#6E62CE',moon:'#FFE066',mars:'#D9593A'};
 const fill=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
 function dot(c,x,y,r,color){for(let v=-r;v<=r;v++){const width=Math.floor(Math.sqrt(r*r-v*v));fill(c,x-width,y+v,width*2+1,1,color);}}
 function cloud(c,x,y,s=1){[[8,0,16,6],[3,6,27,6],[0,12,35,6],[6,18,24,3]].forEach(([a,b,w,h])=>fill(c,x+a*s,y+b*s,w*s,h*s,P.cream));fill(c,x+4*s,y+17*s,29*s,2*s,'#C7DCE9');}
 function mountain(c,x,base,w,h,col){for(let r=0;r<h;r+=2){let hw=w*(r/h)/2;fill(c,x+w/2-hw,base-h+r,hw*2,2,col);}fill(c,x+w/2-4,base-h,8,4,'#D8E5E7');}
 function tree(c,x,y){fill(c,x-2,y-30,5,32,'#70533B');for(let i=0;i<4;i++){fill(c,x-13+i%2*3,y-32+i*5,26,7,i%2?'#328857':'#53AD63');}}
 function rocket(c,x,y,s=1,flame=0,side=false){c.save();c.translate(Math.round(x),Math.round(y));c.scale(s,s);if(side)c.rotate(Math.PI/2);
  fill(c,-8,-27,16,40,P.outline);fill(c,-6,-25,12,35,'#E4DFFF');fill(c,-5,-31,10,8,P.mint);fill(c,-3,-36,6,6,P.cream);fill(c,-5,-10,10,12,P.facet);fill(c,-3,-8,6,7,P.night);fill(c,-2,-7,4,5,P.mint);fill(c,-13,3,6,13,P.facet);fill(c,7,3,6,13,P.facet);fill(c,-8,10,16,5,P.outline);
  if(flame){fill(c,-5,15,10,12+12*flame,'#FF9B3A');fill(c,-3,15,6,7+10*flame,P.moon);fill(c,-1,15,2,4+6*flame,P.cream);}c.restore();}
 function lito(c,x,y,t=0,world='earth',state='idle'){
  const accent=world==='moon'?P.moon:world==='mars'?'#3FD0E0':P.mint;
  c.save();c.translate(Math.round(x),Math.round(y+Math.sin(t*3)*2));
  // Cuatro satélites en cruz con pulsación escalonada.
  const pulse=Math.round(Math.sin(t*5)*2);
  fill(c,-2,-24-pulse,4,5,accent);fill(c,-2,20+pulse,4,5,accent);
  fill(c,-21-pulse,-1,5,4,P.crystal);fill(c,16+pulse,-1,5,4,P.crystal);
  fill(c,-11,-15,22,32,P.facet);fill(c,-14,-8,28,18,'#E4DFFF');fill(c,-10,-13,20,28,P.crystal);
  fill(c,-11,-6,22,15,P.facet);fill(c,-9,-5,18,12,'#120E33');
  if(state==='happy'){
   fill(c,-7,-1,3,2,accent);fill(c,-4,-3,3,2,accent);
   fill(c,2,-3,3,2,accent);fill(c,5,-1,3,2,accent);
   fill(c,-3,4,7,1,accent);
  }else if(state==='scan'||state==='excited'){
   for(const dx of [-5,4]){fill(c,dx-2,0,5,2,accent);fill(c,dx,-2,2,6,accent);}
   if(state==='scan')for(let yy=0;yy<20;yy+=3)fill(c,-7-yy/4,16+yy,14+yy/2,1,'#3FD0E0');
  }else{
   const blink=Math.sin(t*2.3)>-.97; if(blink){fill(c,-6,-2,4,5,accent);fill(c,3,-2,4,5,accent);}
   if(state==='talking')fill(c,-2,5,5,Math.sin(t*14)>0?3:1,accent);
  }
  // Brillos blancos/dorados puntuales
  if(Math.sin(t*6)>.55){fill(c,-18,-13,2,2,P.cream);fill(c,16,12,2,2,P.moon);}
  c.restore();
 }
 function earthScene(c,t=0,opts={}){
  for(let y=0;y<270;y+=9){const sky=['#2861B3','#2E70C9','#387ED5','#509DE1','#6DB9EB','#83C8ED'];fill(c,0,y,480,9,sky[Math.min(5,Math.floor(y/43))]);}
  cloud(c,13+(t*3)%50,79);cloud(c,235+(t*1.8)%35,54,.85);cloud(c,411-(t*2)%30,85,.72);
  mountain(c,63,214,170,66,'#9DBCC0');mountain(c,255,217,187,88,'#6D9DB6');fill(c,0,194,480,17,'#4C96B6');fill(c,0,211,480,7,'#A8D6C5');fill(c,0,218,480,52,'#53964D');fill(c,0,223,480,3,'#77B76C');
  for(let i=0;i<160;i++){fill(c,(i*79)%480,229+(i*19)%40,2,1,i%3?'#3F814A':'#75B96C');}
  // Centro espacial y antena
  fill(c,0,149,155,65,'#CAD8E7');fill(c,0,145,155,6,P.crystal);fill(c,7,153,143,55,'#E4DFFF');for(let i=0;i<6;i++){fill(c,13+i*23,161,17,16,'#45A2D5');fill(c,13+i*23,161,17,3,'#A4E2F0');}
  fill(c,53,185,27,25,'#6E62CE');fill(c,58,190,17,20,P.mint);fill(c,36,138,18,8,P.cream);fill(c,44,127,3,13,P.outline);
  tree(c,186,216);tree(c,347,218);
  // Torre y cohete
  fill(c,388,94,12,119,'#A63A26');for(let y=98;y<210;y+=11){fill(c,388,y,12,3,P.mars);fill(c,389,y+4,10,2,'#7A2818');}fill(c,400,126,32,5,'#A63A26');fill(c,400,161,22,4,'#A63A26');fill(c,402,209,77,7,'#565769');
  if(!opts.hideRocket)rocket(c,451,192,1.12);lito(c,234,155,t,'earth',opts.litoState||'idle');
 }
 const stars=Array.from({length:130},(_,i)=>({x:(i*131+17)%480,y:(i*67+31)%270,s:i%11===0?2:1}));
 function skyStars(c,t){fill(c,0,0,480,270,P.night);for(let i=0;i<stars.length;i++){const s=stars[i];if(Math.sin(i+t*2)>-.6)fill(c,s.x,s.y,s.s,s.s,i%7?P.cream:P.mint);}}
 function spaceScene(c,t,progress){skyStars(c,t);dot(c,40-progress*75,175+progress*20,Math.max(5,31-progress*20),'#447FD2');dot(c,33-progress*75,175+progress*20,Math.max(2,8-progress*5),'#60AD77');dot(c,415,146,30,'#C3C7D6');dot(c,405,140,8,'#868CA4');dot(c,430,157,5,'#868CA4');rocket(c,176+progress*158,132,1.2,1,true);lito(c,166+progress*140,89,t,'moon');}
 function launchScene(c,t,p){if(p<.53){earthScene(c,t,{hideRocket:true});const a=p/.53;rocket(c,451-a*96,192-a*300,1.12,Math.min(1,a+.1));}else{spaceScene(c,t,(p-.53)/.47);}}
 function descentScene(c,t,progress){
  skyStars(c,t);dot(c,63,75,13,'#3D86D8');dot(c,60,74,4,'#63AA79');
  fill(c,0,178,480,92,'#575C74');
  for(let x=0;x<480;x+=11)fill(c,x,179+Math.sin(x*.1)*7,12,4,'#868CA4');
  for(let i=0;i<12;i++){let x=(i*61)%480;fill(c,x,198+(i*23)%56,12+(i%4)*3,3,'#3E4256');}
  rocket(c,240,18+progress*145,1.15,progress<.93?.55:0);
  lito(c,298,84+progress*70,t,'moon',progress>.86?'happy':'idle');
 }
 const avatars=[{id:'vice',name:'Vice',skin:'#C98D6A',suit:'#6E62CE',hair:'#33213D',hat:'#3B285B'},{id:'astronauta',name:'Astronauta',skin:'#F1BC96',suit:'#E4DFFF',hair:'#563F32',hat:'#E4DFFF'},{id:'jaguar',name:'Jaguar UAM',skin:'#F9C969',suit:'#EBAA39',hair:'#9B5D25',hat:'#E9B44A'},{id:'geologa',name:'Geóloga',skin:'#F4BB97',suit:'#ABA1F5',hair:'#754A3D',hat:'#FFE066'},{id:'piloto',name:'Piloto',skin:'#996344',suit:'#3FD0E0',hair:'#2B2130',hat:'#4774A6'},{id:'guardian',name:'Guardián',skin:'#BC8B67',suit:'#56C88C',hair:'#3A3029',hat:'#FFE066'}];
 function portrait(canvas,id){const a=avatars.find(a=>a.id===id)||avatars[1];const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,48,48);fill(c,0,0,48,48,P.raised);fill(c,3,3,42,42,'#48558D');fill(c,7,34,34,13,P.outline);fill(c,11,32,26,14,a.suit);fill(c,20,28,8,9,a.skin);
  if(id==='jaguar'){fill(c,11,10,26,24,'#EBAA39');fill(c,9,8,8,10,'#F9C969');fill(c,31,8,8,10,'#F9C969');fill(c,16,17,16,15,'#F9C969');fill(c,16,20,4,4,P.night);fill(c,28,20,4,4,P.night);fill(c,23,27,3,3,'#754A3D');}
  else{fill(c,13,12,22,21,a.hair);fill(c,16,16,16,16,a.skin);if(id==='astronauta'){fill(c,10,9,28,26,'#E4DFFF');fill(c,13,13,22,20,P.crystal);fill(c,16,16,16,16,a.skin);}else{fill(c,12,10,24,8,a.hat);fill(c,10,16,28,4,a.hat);}fill(c,18,23,3,3,P.night);fill(c,27,23,3,3,P.night);}fill(c,22,37,5,5,P.moon);fill(c,23,38,3,3,P.cream);
 }
 return {colors:P,earthScene,launchScene,spaceScene,descentScene,portrait,avatars,lito};
})();
