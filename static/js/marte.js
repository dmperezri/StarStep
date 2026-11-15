"use strict";
document.addEventListener('DOMContentLoaded',()=>{
 const canvas=document.getElementById('world'),c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
 // Localización PROVISIONAL (mars_panel_scan) hasta implementar la exploración con el rover.
 // StarFlow valida la etapa: las esférulas solo se localizan después de registrar Opportunity.
 function scan(id){const found=window.StarFlow?.locateArtifact(id,{mechanic:'mars_panel_scan'});if(found&&!found.ok&&found.code!=='ARTIFACT_NOT_IMPLEMENTED'){window.StarFlow.notify('locked');return;}window.openStarArtifact(id,{context:'mission'});}
 document.getElementById('inspectOpportunity').addEventListener('click',()=>scan('opportunity'));
 document.getElementById('inspectBlueberries').addEventListener('click',()=>scan('blueberries'));
 function frame(now){
  const t=now/1000;
  c.fillStyle='#F7B08E';c.fillRect(0,0,480,270);
  for(let y=0;y<220;y+=9){c.fillStyle=y<110?'#7A2818':y<180?'#D9593A':'#F7B08E';c.fillRect(0,y,480,9);}
  c.fillStyle='#A63A26';c.fillRect(0,196,480,74);
  for(let i=0;i<60;i++){const x=(i*53)%480,y=205+(i*17)%65;c.fillStyle=i%5?'#D9593A':'#4F86D9';c.fillRect(x,y,4,2);}
  StarArt.lito(c,405,142,t,'mars','scan');requestAnimationFrame(frame);
 }requestAnimationFrame(frame);
});
