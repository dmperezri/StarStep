"use strict";
/* Puente de eventos: NO toca motor.js/luna.js ni sus controles. */
window.StarProgress = (() => {
  const INVENTORY='starstep_inventario', PROFILE='starstep_astronauta', NOTES='starstep_notas';
  const catalog={
    eagle:{id:'eagle',name:'Eagle · Apollo 11',world:'moon',source:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',observed:'La etapa de descenso del módulo Eagle quedó en la superficie lunar.',interpreted:'La parte inferior actuó como plataforma para que la etapa de ascenso despegara de la Luna.',narrative:'Una plataforma silenciosa aún marca dónde comenzó el regreso.'},
    easep:{id:'easep',name:'EASEP · Apollo 11',world:'moon',source:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',observed:'Apollo 11 dejó un paquete de experimentos científicos en la Luna.',interpreted:'Sus instrumentos permitieron registrar datos del entorno lunar.',narrative:'Una pequeña estación se quedó escuchando la Luna.'},
    reflector:{id:'reflector',name:'Retrorreflector láser',world:'moon',source:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',observed:'Se dejó un reflector que devuelve pulsos de láser hacia la Tierra.',interpreted:'Los tiempos de ida y vuelta de la luz ayudan a medir la distancia Tierra-Luna.',narrative:'Una señal de luz conecta dos mundos.'},
    opportunity:{id:'opportunity',name:'Rover Opportunity',world:'mars',source:'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/',observed:'Opportunity investigó rocas de Marte durante más de 14 años.',interpreted:'Hematita, yeso y arcillas aportan evidencia de ambientes con agua pasada; no prueban vida.',narrative:'El geólogo de seis ruedas dejó huellas que cuentan una historia.'},
    blueberries:{id:'blueberries',name:'Esférulas de hematita',world:'mars',source:'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/',observed:'Opportunity encontró pequeñas esférulas ricas en hematita.',interpreted:'Su formación es compatible con procesos relacionados con agua líquida antigua.',narrative:'Pequeñas pistas azules, preguntas enormes.'}
  };
  const read=(key,fallback)=>{try{const x=JSON.parse(localStorage.getItem(key));return x??fallback;}catch{return fallback;}};
  function list(){const a=read(INVENTORY,[]);return Array.isArray(a)?a:[];}
  function unlock(id){const item=catalog[id];if(!item)return false;const all=list();if(all.some(v=>v.id===id))return false;all.push({id,at:new Date().toISOString()});try{localStorage.setItem(INVENTORY,JSON.stringify(all));}catch(e){console.warn('No se pudo guardar inventario',e);return false;}document.dispatchEvent(new CustomEvent('starstep:unlocked',{detail:{id,item}}));window.StarSound?.effect('success');return true;}
  function player(){return read(PROFILE,{});}
  function setPlayer(data){localStorage.setItem(PROFILE,JSON.stringify({alias:String(data.alias||'').trim().slice(0,18),avatar:data.avatar||'astronauta'}));}
  function getNotes(){return localStorage.getItem(NOTES)||'';}
  function setNotes(s){localStorage.setItem(NOTES,String(s).slice(0,1500));}
  /* El motor existente emite este evento al pulsar E junto a Eagle. */
  document.addEventListener('artefacto:descubierto',event=>{
    if(event.detail?.nombre==='Apollo 11 - Eagle'){
      document.dispatchEvent(new CustomEvent('starstep:inspect',{detail:{id:'eagle',world:'moon'}}));
      /* La pieza se gana al pulsar un hotspot en el visor. En modo sin CDN:
         el motor conserva su descubrimiento, pero no se guarda sin inspección. */
    }
  });
  const completedKey='starstep_completed';
  function completed(){return read(completedKey,[]);}
  function completeAct(act){if(!['luna','marte','huellas'].includes(act))return;const all=new Set(completed());all.add(act);localStorage.setItem(completedKey,JSON.stringify([...all]));document.dispatchEvent(new CustomEvent('starstep:completed',{detail:{act}}));}
  function canFinish(){return ['luna','marte','huellas'].every(x=>completed().includes(x));}
  return {catalog,list,unlock,player,setPlayer,getNotes,setNotes,completed,completeAct,canFinish};
})();
