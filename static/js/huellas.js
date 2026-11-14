"use strict";
document.addEventListener('DOMContentLoaded',()=>{
 const root=document.getElementById('matchingGame'),feedback=document.getElementById('matchFeedback'),finish=document.getElementById('finishAdventure');
 const pairs=[['luna','Equipos científicos lunares','Investigación del entorno lunar'],['laser','Retrorreflector','Medir la distancia Tierra-Luna'],['marte','Hematita en Meridiani Planum','Pistas sobre agua antigua']];
 let selected=null;const solved=new Set();
 const left=document.createElement('div'),right=document.createElement('div');left.className=right.className='match-column';
 function button(text,id,isAnswer){let el=document.createElement('button');el.type='button';el.className='pixel-button';el.textContent=text;el.dataset.id=id;
  el.addEventListener('click',()=>{
   if(solved.has(id))return;
   if(!isAnswer){selected=id;left.querySelectorAll('button').forEach(x=>x.classList.toggle('selected',x===el));return;}
   if(!selected){feedback.textContent='Elegí primero una evidencia.';return;}
   if(selected!==id){feedback.textContent='REVISÁ OTRA VEZ';StarSound.effect('button');selected=null;return;}
   solved.add(id);root.querySelectorAll('button').forEach(x=>{if(x.dataset.id===id){x.disabled=true;x.classList.add('matched');}});feedback.textContent='¡CORRECTO!';StarSound.effect('success');selected=null;
   if(solved.size===pairs.length){StarProgress.completeAct('huellas');finish.hidden=false;feedback.textContent='¡Completaste el ACTO III!';}
  });return el;
 }
 pairs.forEach(([id,a])=>left.append(button(a,id,false)));[...pairs].reverse().forEach(([id,,b])=>right.append(button(b,id,true)));
 root.append(left,right);
});
