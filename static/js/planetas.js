"use strict";
/* StarStep — planetas 16-bit: módulo compartido para escenas de Canvas 2D.
   Paleta tomada de la propuesta visual aprobada. Sin dependencias externas. */
window.StarPlanets = (() => {
  const palettes={
    earth:{water:'#174B96',waterLight:'#226FC0',coast:'#3FD0E0',land:'#2E9E6B',landLight:'#5BE39A',cloud:'#FFF8E7',dark:'#111B53',rim:'#8FF0D8'},
    moon:{ground:'#C3C7D6',sea:'#868CA4',deep:'#575C74',shade:'#3E4256',crater:'#FFE066',dark:'#1A1F4D',rim:'#D7DBE9'},
    mars:{ground:'#D9593A',light:'#F7B08E',darkland:'#A63A26',canyon:'#7A2818',ice:'#FFF8E7',dark:'#401829',rim:'#F7B08E'}
  };
  const cache=new Map();
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const pattern=(x,y,z)=>Math.sin(x*3.1+z*2.4)*Math.cos(y*2.7-z*1.9)+.45*Math.sin(x*6.3-y*5.1+z*4.8)+.2*Math.cos(x*11.2+y*9.4);
  const toRgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  const LUT=Object.fromEntries(Object.entries(palettes).map(([k,v])=>[k,Object.fromEntries(Object.entries(v).map(([key,val])=>[key,toRgb(val)]))]));
  function texture(kind,phase=0,lighting='day') {
    kind=kind==='earth'||kind==='mars'?kind:'moon';
    const tick=((Math.floor(phase)%48)+48)%48;
    const key=`${kind}:${tick}:${lighting}`;
    if(cache.has(key))return cache.get(key);
    const N=112,c=document.createElement('canvas');c.width=c.height=N;
    const g=c.getContext('2d'),pix=g.createImageData(N,N),p=LUT[kind];
    const rot=tick*Math.PI/24;const cr=Math.cos(rot),sr=Math.sin(rot);
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){
      const nx=(x-(N-1)/2)/51.5,ny=(y-(N-1)/2)/51.5,rr=nx*nx+ny*ny;
      if(rr>1.07)continue;
      const i=4*(y*N+x);
      let col;
      if(rr>1){col=p.rim;pix.data[i]=col[0];pix.data[i+1]=col[1];pix.data[i+2]=col[2];pix.data[i+3]=rr<1.035?255:((x+y)%2===0?160:0);continue;}
      const nz=Math.sqrt(Math.max(0,1-rr)),xx=nx*cr-nz*sr,zz=nx*sr+nz*cr;
      const h=pattern(xx,ny,zz);let material;
      if(kind==='earth'){
        material=h>.16?(h>.54?'landLight':'land'):(h>.01?'coast':((xx+zz)>.25?'waterLight':'water'));
        if(Math.abs(ny)+h*.05>.86)material='cloud';
        const clouds=pattern(xx*1.36+2.1+Math.sin(rot)*.13,ny*1.65,zz*1.36);
        if(clouds>.69&&Math.abs(ny)<.83)material='cloud';
      }else if(kind==='moon'){
        material=h>.16?'ground':h>-.4?'sea':'deep';
        const lon=Math.atan2(xx,zz),lat=Math.asin(clamp(ny,-1,1));
        const craters=[[.25,.4,.24],[-.35,1.1,.21],[.55,-.8,.18],[-.1,-1.7,.27],[.15,2.3,.2],[-.55,2.6,.17],[.4,3.1,.22],[-.25,-.2,.13]];
        for(const [cy,cx,r] of craters){let dl=Math.atan2(Math.sin(lon-cx),Math.cos(lon-cx));let d=Math.hypot(dl*Math.cos(lat),lat-cy);if(d<r*.7)material='deep';else if(d<r)material='crater';}
      }else{
        material=h>.35?'light':h<-.25?'canyon':h<0?'darkland':'ground';
        if(Math.abs(ny)+h*.05>.87)material='ice';
        if(Math.abs(ny+Math.sin(xx*2.5)*.14)<.055)material='canyon';
      }
      col=p[material];
      const direction=lighting==='eclipse'?[.17,.10,-.95]:lighting==='dusk'?[-.92,-.15,.22]:[-.55,-.35,.75];
      const bright=nx*direction[0]+ny*direction[1]+nz*direction[2];
      const dither=((x+y)&1)?-.035:.035;
      const q=bright+dither;
      const shade=q<-.18?.22:q<.1?.43:q<.3?.68:q<.65?.87:1;
      const k=kind==='earth'&&material==='cloud'?.96:shade;
      for(let j=0;j<3;j++)pix.data[i+j]=Math.round(col[j]*k);
      pix.data[i+3]=255;
    }
    g.putImageData(pix,0,0);cache.set(key,c);
    if(cache.size>72)cache.delete(cache.keys().next().value);
    return c;
  }
  function draw(ctx,kind,x,y,r,time=0,options={}){
    if(!ctx||!r||r<=0)return;
    const phase=options.phase??Math.floor(time*(kind==='earth'?4.5:kind==='mars'?3.4:2.5));
    const source=texture(kind,phase,options.lighting||'day');
    ctx.save();ctx.imageSmoothingEnabled=false;
    ctx.globalAlpha=options.opacity??1;
    const diameter=r*2.17;
    ctx.drawImage(source,Math.round(x-diameter/2),Math.round(y-diameter/2),Math.max(1,Math.round(diameter)),Math.max(1,Math.round(diameter)));
    ctx.restore();
  }
  return {draw,texture,palettes};
})();
