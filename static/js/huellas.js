"use strict";
document.addEventListener('DOMContentLoaded',()=>{
 const root=document.getElementById('matchingGame'),feedback=document.getElementById('matchFeedback'),finish=document.getElementById('finishAdventure');
 if(!root)return;
 const pairs=[
  {id:'eagle',es:['Etapa de descenso Eagle','Plataforma para el ascenso desde la Luna'],en:['Eagle descent stage','Launch platform for ascent from the Moon']},
  {id:'easep',es:['Paquete EASEP','Mediciones sísmicas del entorno lunar'],en:['EASEP package','Seismic measurements of the lunar environment']},
  {id:'reflector',es:['Retrorreflector LRRR','Distancia Tierra–Luna mediante pulsos láser'],en:['LRRR retroreflector','Earth–Moon distance using laser pulses']},
  {id:'plaque',es:['Placa y bandera Apollo 11','Testimonio histórico y mensaje de paz'],en:['Apollo 11 plaque and flag','Historical record and a message of peace']},
  {id:'lander',es:['Plataforma de aterrizaje de Opportunity','Aterrizaje con bolsas de aire en el cráter Eagle'],en:['Opportunity landing platform','Airbag landing at Eagle Crater']},
  {id:'opportunity',es:['Rover Opportunity','Pruebas minerales de ambientes con agua antigua'],en:['Opportunity rover','Mineral evidence of ancient water-related environments']}
 ];
 let selected=null;const solved=new Set();
 function draw(){root.replaceChildren();const left=document.createElement('div'),right=document.createElement('div');left.className=right.className='match-column';
  const language=StarI18n.lang;const button=(label,id,answer)=>{const b=document.createElement('button');b.type='button';b.className='pixel-button';b.textContent=label;b.dataset.id=id;if(solved.has(id)){b.disabled=true;b.classList.add('matched');}
   b.addEventListener('click',()=>{if(solved.has(id))return;if(!answer){selected=id;draw();return;}if(!selected){feedback.textContent=StarI18n.t('puzzle.pick');return;}
    if(selected!==id){feedback.textContent=StarI18n.t('puzzle.bad');selected=null;window.StarSound?.effect('button');draw();return;}
    solved.add(id);selected=null;feedback.textContent=StarI18n.t('puzzle.good');window.StarSound?.effect('success');draw();if(solved.size===pairs.length){StarProgress.completeAct('huellas');finish.hidden=false;feedback.textContent=StarI18n.t('puzzle.complete');}
   });if(selected===id&&!answer)b.classList.add('selected');return b;};
  for(const pair of pairs)left.append(button(pair[language][0],pair.id,false));for(const pair of [...pairs].reverse())right.append(button(pair[language][1],pair.id,true));root.append(left,right);
 }
 draw();document.addEventListener('starstep:language',()=>{draw();if(solved.size===pairs.length)feedback.textContent=StarI18n.t('puzzle.complete');});
});
