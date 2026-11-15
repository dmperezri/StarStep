"use strict";
// Ficha alternativa cuando el visor local o WebGL no están disponibles.
// Cumple las mismas reglas que el visor 3D: cada componente debe inspeccionarse
// y el registro lo decide StarFlow; no existe un botón que entregue el artefacto.
window.StarViewerFallback={
 open(id,options={}){
  const item=window.StarProgress?.catalog?.[id];
  if(!item)return;
  const context=options.context==='mission'?'mission':'journal';
  const fact=key=>window.StarScience?.facts?.[id]?.[StarI18n.lang]?.[key]||item[key];
  let overlay=document.getElementById('fallbackViewer');
  if(overlay)overlay.remove();
  overlay=document.createElement('div');overlay.id='fallbackViewer';overlay.className='visor-modal';
  overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
  const panel=document.createElement('div');panel.className='visor-panel';panel.style.padding='22px';
  const heading=document.createElement('h2');heading.textContent=item.name;
  const warning=document.createElement('p');warning.textContent=StarI18n.t('viewer.unavailable');
  const content=document.createElement('div');content.className='evidence observed';
  const info=document.createElement('div');info.className='evidence interpreted';
  const story=document.createElement('div');story.className='evidence narrative';
  const status=document.createElement('p');status.className='hint';status.setAttribute('aria-live','polite');
  const list=document.createElement('div');list.className='station-list';
  const required=window.StarFlow?.getArtifact(id)?.required||[];
  const setStatus=result=>{status.textContent=window.StarViewerStatus(result);};
  function reveal(componentId){
   content.textContent=StarI18n.t('science.observe')+': '+fact('observed');
   info.textContent=StarI18n.t('science.infer')+': '+fact('interpreted');
   story.textContent=StarI18n.t('science.story')+' · '+StarI18n.t(`component.${id}.${componentId}`)+': '+fact('narrative');
   const result=window.StarFlow?window.StarFlow.inspectComponent(id,componentId,{context,viewer:'fallback'}):{ok:false,code:'FLOW_UNAVAILABLE'};
   setStatus(result);
   if(result.ok&&result.mode==='inspect')list.querySelector(`[data-component="${componentId}"]`)?.classList.add('matched');
  }
  for(const componentId of required){
   const b=document.createElement('button');b.type='button';b.className='pixel-button small';b.dataset.component=componentId;
   b.textContent=StarI18n.t('viewer.inspectComponent',{name:StarI18n.t(`component.${id}.${componentId}`)});
   if(window.StarFlow?.getArtifact(id)?.components?.includes(componentId))b.classList.add('matched');
   b.onclick=()=>reveal(componentId);list.append(b);
  }
  const close=document.createElement('button');close.className='pixel-button';close.textContent=StarI18n.t('viewer.close');close.onclick=()=>overlay.remove();
  panel.append(heading,warning,list,content,info,story,status,close);overlay.append(panel);document.body.append(overlay);
  setStatus({ok:true,mode:context==='journal'?'consult':'start'});
  close.focus();
 }
};
// Traduce el resultado de StarFlow a un mensaje para el jugador (compartido por ambos visores).
window.StarViewerStatus=function(result){
 if(!result)return '';
 if(!result.ok)return StarI18n.t('flow.notice.'+(result.code==='ARTIFACT_NOT_LOCATED'?'locateFirst':result.code==='NOT_REGISTERED'?'notRegistered':'locked'));
 if(result.mode==='consult')return StarI18n.t('flow.viewer.consult');
 if(result.mode==='review')return StarI18n.t('flow.viewer.already');
 if(result.mode==='start')return StarI18n.t('flow.viewer.pending');
 if(result.state==='registered')return StarI18n.t('flow.viewer.registered');
 return StarI18n.t('flow.viewer.progress',{n:result.inspected,total:result.total});
};
// Puerta única de ambos visores: StarFlow decide si se inspecciona, se revisa o solo se consulta.
// context: 'mission' (escena de juego) | 'journal' (bitácora, por defecto: nunca registra).
window.openStarArtifact=async function(id,options={}){
 const context=options.context==='mission'?'mission':'journal';
 const gate=window.StarFlow?window.StarFlow.beginInspection(id,{context}):{ok:false,code:'FLOW_UNAVAILABLE'};
 if(!gate.ok){
  window.StarFlow?.notify?.(gate.code==='ARTIFACT_NOT_LOCATED'?'locateFirst':gate.code==='NOT_REGISTERED'?'notRegistered':'locked');
  return gate;
 }
 try{
  const module=await import('/static/js/visor3d.js');
  if(module && window.StarVisor?.open){window.StarVisor.open(id,{context});return gate;}
  throw Error('Visor no inicializado');
 }catch(error){
  console.warn('Visor 3D no disponible:',error);
  window.StarVisor?.close?.();
  window.StarViewerFallback.open(id,{context});
  return gate;
 }
};
