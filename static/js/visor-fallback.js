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
  const warning=document.createElement('p');warning.textContent=StarI18n.t('viewer.unavailable');
  const content=document.createElement('div');content.className='evidence observed';
  content.textContent=StarI18n.t('science.observe')+': '+(window.StarScience?.facts?.[id]?.[StarI18n.lang]?.observed||item.observed);
  const info=document.createElement('div');info.className='evidence interpreted';
  info.textContent=StarI18n.t('science.infer')+': '+(window.StarScience?.facts?.[id]?.[StarI18n.lang]?.interpreted||item.interpreted);
  const story=document.createElement('div');story.className='evidence narrative';
  story.textContent=StarI18n.t('science.story')+': '+(window.StarScience?.facts?.[id]?.[StarI18n.lang]?.narrative||item.narrative);
  const unlock=document.createElement('button');unlock.className='pixel-button mint';unlock.textContent=StarI18n.t('viewer.store');
  unlock.onclick=()=>{StarProgress.unlock(id);overlay.remove();};
  const close=document.createElement('button');close.className='pixel-button';close.textContent=StarI18n.t('viewer.close');close.onclick=()=>overlay.remove();
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
