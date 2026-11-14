/* Esferas pixeladas con relieve procedural, terminador solar y dithering Bayer. */
window.StarPlanets = (() => {
  const cache=new Map(), bayer=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
  const noise=(x,y)=>Math.sin(x*2.3+Math.sin(y*3))*Math.cos(y*3.8-x*.6);
  function texture(kind,frame){
    const key=kind+frame;if(cache.has(key))return cache.get(key);
    const c=document.createElement('canvas');c.width=c.height=100;const ctx=c.getContext('2d'),im=ctx.createImageData(100,100);
    for(let y=0;y<100;y++)for(let x=0;x<100;x++){
      const nx=(x-49.5)/47,ny=(y-49.5)/47,r=nx*nx+ny*ny;if(r>1)continue;
      const nz=Math.sqrt(1-r),lon=Math.atan2(nx,nz),lat=Math.asin(ny),n=noise(lon*3,lat*4);
      let color;
      if(kind==='earth'){
        color=n>.15?[71,139+Math.round(n*22),102]:[29,78+Math.round(n*10),170+Math.round(nz*32)];
        if(Math.abs(ny)>.83)color=[224,239,237];
        if(noise(lon*5+frame*.17,lat*7)>.57)color=[225,233,241];
      }else if(kind==='mars'){
        const canyon=Math.sin(lon*15+lat*6)>.86&&Math.abs(lat)<.5;
        color=canyon?[122,40,24]:[217+n*28,89+n*23,58+n*18];if(ny<-.9)color=[220,191,176];
      }else{
        color=n>.12?[195,199,214]:[105,111,139];
        for(let i=0;i<18;i++){
          const cx=Math.sin(i*7.1)*.85,cy=Math.cos(i*4.3)*.8,rad=.04+(i%4)*.018,d=Math.hypot(nx-cx,ny-cy);
          if(d<rad)color=d>rad*.72?[206,209,220]:[88,93,116];
        }
      }
      const light=nx*-.62+ny*-.3+nz*.72;
      const shade=.14+Math.max(0,Math.round((light+(bayer[(x%4)+(y%4)*4]/16-.5)*.09)*8)/8)*.86;
      const i=(y*100+x)*4;for(let j=0;j<3;j++)im.data[i+j]=Math.min(255,color[j]*shade);im.data[i+3]=255;
    }
    ctx.putImageData(im,0,0);cache.set(key,c);return c;
  }
  function draw(ctx,kind,x,y,r,time=0){
    ctx.save();
    if(kind!=='moon'){
      ctx.strokeStyle=kind==='mars'?'#F7B08E':'#8FF0D8';ctx.globalAlpha=.24;ctx.lineWidth=Math.max(1,r*.07);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
    }
    const frame=kind==='earth'?Math.floor(time*.4)%8:0;
    ctx.imageSmoothingEnabled=false;ctx.drawImage(texture(kind,frame),x-r*1.06,y-r*1.06,r*2.12,r*2.12);ctx.restore();
  }
  return {draw};
})();
