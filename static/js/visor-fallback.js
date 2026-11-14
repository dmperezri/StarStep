"use strict";
// Este modal sólo se usa cuando el CDN de Three.js no está disponible.
window.StarViewerFallback={
 open(id){
  const item=window.StarProgress?.catalog?.[id];
  if(!item)return;
  let overlay=document.getElementById('fallbackViewer');
  if(overlay)overlay.remove();
  overlay=document.createElement('div');overlay.id='fallbackViewer';overlay.className='visor-modal';
  const panel=document.createElement('div');panel.className='visor-panel';panel.style.padding='22px';
  const heading=document.createElement('h2');heading.textContent=item.name;
  const warning=document.createElement('p');warning.textContent='Visor 3D no disponible sin conexión. Podés inspeccionar la ficha científica.';
  const content=document.createElement('div');content.className='evidence observed';
  content.textContent='LO QUE SE VIO: '+item.observed;
  const info=document.createElement('div');info.className='evidence interpreted';
  info.textContent='LO QUE INTERPRETAN: '+item.interpreted;
  const story=document.createElement('div');story.className='evidence narrative';
  story.textContent='NUESTRA HISTORIA: '+item.narrative;
  const unlock=document.createElement('button');unlock.className='pixel-button mint';unlock.textContent='GUARDAR DESCUBRIMIENTO';
  unlock.onclick=()=>{StarProgress.unlock(id);overlay.remove();};
  const close=document.createElement('button');close.className='pixel-button';close.textContent='CERRAR';close.onclick=()=>overlay.remove();
  panel.append(heading,warning,content,info,story,unlock,close);overlay.append(panel);document.body.append(overlay);
 }
};
// Si una página carga el visor por módulo, se reemplaza a través de StarVisor.
window.openStarArtifact=async function(id){
 try{
  const module=await import('/static/js/visor3d.js');
  if(module && window.StarVisor?.open)return window.StarVisor.open(id);
  throw Error('Visor no inicializado');
 }catch(error){
  console.warn('Visor 3D no disponible:',error);
  window.StarViewerFallback.open(id);
 }
};
