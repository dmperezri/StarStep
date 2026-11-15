"use strict";
/* Puente de eventos y almacenamiento local: NO toca motor.js/luna.js ni sus controles.
 * Las reglas de avance viven en flujo.js (StarFlow). Este módulo solo guarda datos:
 *   - inventario de descubrimientos registrados (starstep_inventario),
 *   - actos completados (starstep_completed), perfil y notas,
 *   - estado del flujo (starstep_flujo) como respaldo local de la base de datos.
 */
window.StarProgress = (() => {
  const INVENTORY='starstep_inventario', PROFILE='starstep_astronauta', NOTES='starstep_notas';
  const FLOW='starstep_flujo', FLOW_BACKUP='starstep_flujo_respaldo', completedKey='starstep_completed';
  const ACTS=['luna','marte','huellas'];
  const PHOTO='starstep_foto';
  // Cinemáticas vistas en este navegador (solo presentación: no otorga progreso ni toca StarFlow).
  // Es una preferencia del dispositivo: NUEVA PARTIDA la conserva (solo decide si aparece SALTAR).
  const CINEMATICS='starstep_cinematicas', CINEMATIC_IDS=['history_intro'];
  // Marca de un solo uso, en sessionStorage (solo esta pestaña): la bienvenida breve de NUEVA
  // PARTIDA terminó. flujo.js la consume al cargar la página siguiente (sección 5.8).
  const SESSION='starstep_sesion', NEW_GAME_WELCOME='starstep_nueva_partida';
  /* Identidad actual: no hay cuentas; un jugador = este navegador (LocalStorage).
     PLAYER_KEYS son los datos del jugador y se borran juntos en «Nueva partida»: si quedara
     alguno heredado (inventario, actos o perfil), la migración de flujo.js reconstruiría
     la partida anterior. PREFERENCE_KEYS son del dispositivo y se conservan. SESSION_KEYS
     viven en sessionStorage (solo la pestaña actual) y no son progreso. */
  const PLAYER_KEYS=Object.freeze([FLOW,FLOW_BACKUP,INVENTORY,completedKey,PROFILE,NOTES,PHOTO]);
  const PREFERENCE_KEYS=Object.freeze(['starstep_lang','starstep_audio',CINEMATICS]);
  const SESSION_KEYS=Object.freeze([SESSION,NEW_GAME_WELCOME]);
  let resetting=false;
  const catalog={
    eagle:{id:'eagle',name:'Eagle · Apollo 11',world:'moon',source:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',observed:'La etapa de descenso del módulo Eagle quedó en la superficie lunar.',interpreted:'La parte inferior actuó como plataforma para que la etapa de ascenso despegara de la Luna.',narrative:'Una plataforma silenciosa aún marca dónde comenzó el regreso.'},
    easep:{id:'easep',name:'EASEP · Apollo 11',world:'moon',source:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',observed:'Apollo 11 dejó un paquete de experimentos científicos en la Luna.',interpreted:'Sus instrumentos permitieron registrar datos del entorno lunar.',narrative:'Una pequeña estación se quedó escuchando la Luna.'},
    reflector:{id:'reflector',name:'Retrorreflector láser',world:'moon',source:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',observed:'Se dejó un reflector que devuelve pulsos de láser hacia la Tierra.',interpreted:'Los tiempos de ida y vuelta de la luz ayudan a medir la distancia Tierra-Luna.',narrative:'Una señal de luz conecta dos mundos.'},
    opportunity:{id:'opportunity',name:'Rover Opportunity',world:'mars',source:'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/',observed:'Opportunity investigó rocas de Marte durante más de 14 años.',interpreted:'Hematita, yeso y arcillas aportan evidencia de ambientes con agua pasada; no prueban vida.',narrative:'El geólogo de seis ruedas dejó huellas que cuentan una historia.'},
    blueberries:{id:'blueberries',name:'Esférulas de hematita',world:'mars',source:'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/',observed:'Opportunity encontró pequeñas esférulas ricas en hematita.',interpreted:'Su formación es compatible con procesos relacionados con agua líquida antigua.',narrative:'Pequeñas pistas azules, preguntas enormes.'}
  };
  const read=(key,fallback)=>{try{const x=JSON.parse(localStorage.getItem(key));return x??fallback;}catch{return fallback;}};
  // Durante un reinicio no se escribe nada: evita que el estado en memoria reviva la partida borrada.
  const write=(key,value)=>{if(resetting)return;localStorage.setItem(key,typeof value==='string'?value:JSON.stringify(value));};
  function list(){const a=read(INVENTORY,[]);return Array.isArray(a)?a.filter(v=>v&&typeof v.id==='string'):[];}
  function completed(){const a=read(completedKey,[]);return Array.isArray(a)?a.filter(x=>ACTS.includes(x)):[];}

  /* Escritura reservada para StarFlow: se entrega una sola vez.
     Ambos visores (3D y alternativo) registran a través de StarFlow → este escritor. */
  let flowConnected=false;
  function connectFlow(){
    if(flowConnected)return null;flowConnected=true;
    return {
      commitDiscovery(id,at){
        if(!Object.prototype.hasOwnProperty.call(catalog,id))return false;
        const all=list();if(all.some(v=>v.id===id))return false;
        all.push({id,at:at||new Date().toISOString()});
        try{write(INVENTORY,all);}catch(e){console.warn('No se pudo guardar inventario',e);return false;}
        document.dispatchEvent(new CustomEvent('starstep:unlocked',{detail:{id,item:catalog[id]}}));
        window.StarSound?.effect('success');return true;
      },
      commitAct(act){
        if(!ACTS.includes(act))return false;const all=new Set(completed());if(all.has(act))return false;all.add(act);
        try{write(completedKey,[...all]);}catch(e){console.warn('No se pudo guardar el acto',e);return false;}
        document.dispatchEvent(new CustomEvent('starstep:completed',{detail:{act}}));return true;
      }
    };
  }
  function loadFlow(){try{return localStorage.getItem(FLOW);}catch{return null;}}
  function saveFlow(state){write(FLOW,state);}
  function backupFlow(raw){try{write(FLOW_BACKUP,JSON.stringify({at:new Date().toISOString(),raw:String(raw).slice(0,200000)}));}catch{}}

  /* Compatibilidad: estas funciones ya no conceden nada por sí mismas. */
  function unlock(id){return window.StarFlow?.registerDiscovery(id,{context:'mission'})?.ok===true;}
  function completeAct(act){return window.StarFlow?.isActComplete(act)===true;}

  function player(){const p=read(PROFILE,{});return p&&typeof p==='object'&&!Array.isArray(p)?p:{};}
  /* Guarda el perfil solo si el alias recortado es válido (StarFlowCore.normalizeAlias).
     Devuelve false y no escribe nada si es vacío, solo espacios, corto, largo o con caracteres no permitidos. */
  function setPlayer(data){
    const raw=String(data?.alias??'');
    const check=window.StarFlowCore?.normalizeAlias?.(raw);
    const alias=check?(check.ok?check.alias:null):(raw.trim().length>=2?raw.trim().slice(0,18):null);
    if(alias===null)return false;
    write(PROFILE,{alias,avatar:data.avatar||'astronauta'});
    return true;
  }
  function getNotes(){try{return localStorage.getItem(NOTES)||'';}catch{return '';}}
  function setNotes(s){write(NOTES,String(s).slice(0,1500));}

  /* El motor existente emite este evento al pulsar E junto a Eagle: eso LOCALIZA el
     artefacto. El registro exige además inspeccionar sus componentes en un visor. */
  document.addEventListener('artefacto:descubierto',event=>{
    if(event.detail?.nombre!=='Apollo 11 - Eagle')return;
    const result=window.StarFlow?.locateArtifact('eagle',{mechanic:'rover_proximity_scan'});
    if(result?.ok)document.dispatchEvent(new CustomEvent('starstep:inspect',{detail:{id:'eagle',world:'moon',context:'mission'}}));
    else window.StarFlow?.notify?.('locked');
  });

  function canFinish(){return ACTS.every(x=>completed().includes(x));}

  /* Nueva partida: borra solo los datos del jugador de este navegador. No toca el servidor.
     Quien llama debe recargar la página después (el controlador en memoria queda obsoleto). */
  function hasPersonalData(){
    // Haber visto una cinemática no es progreso (es preferencia): no hace aparecer «Nueva partida».
    try{return PLAYER_KEYS.some(k=>k!==FLOW&&k!==FLOW_BACKUP&&localStorage.getItem(k)!==null);}catch{return false;}
  }
  function cinematics(){const c=read(CINEMATICS,{});return c&&typeof c==='object'&&!Array.isArray(c)?c:{};}
  function hasSeenCinematic(id){return CINEMATIC_IDS.includes(id)&&typeof cinematics()[id]?.seenAt==='string';}
  function markCinematicSeen(id){
    if(!CINEMATIC_IDS.includes(id))return false;
    if(hasSeenCinematic(id))return true;
    const all=cinematics();all[id]={seenAt:new Date().toISOString()};
    try{write(CINEMATICS,all);}catch{return false;}
    return hasSeenCinematic(id);
  }
  function resetPlayerData(){
    resetting=true;
    const failed=[];
    for(const key of PLAYER_KEYS){try{localStorage.removeItem(key);}catch{failed.push(key);}}
    return {ok:failed.length===0,removed:PLAYER_KEYS.filter(k=>!failed.includes(k)),failed};
  }
  /* Bienvenida breve de NUEVA PARTIDA (sección 5.8). Solo se puede marcar en la página que
     acaba de reiniciar con éxito; la siguiente página la consume una vez (takeNewGameWelcome).
     No otorga nada por sí sola: flujo.js solo la acepta en una partida recién creada (otra
     pestaña puede haber creado ya el invitado nuevo; eso no impide usarla). */
  function markNewGameWelcome(){
    if(!resetting)return false;
    try{sessionStorage.setItem(NEW_GAME_WELCOME,'1');return true;}catch{return false;}
  }
  function takeNewGameWelcome(){
    try{const pending=sessionStorage.getItem(NEW_GAME_WELCOME)==='1';sessionStorage.removeItem(NEW_GAME_WELCOME);return pending;}catch{return false;}
  }
  // Otra pestaña inició una partida nueva (o se borraron los datos del sitio): esta pestaña
  // tiene la partida anterior en memoria y la volvería a guardar. Se detiene y vuelve a la portada.
  window.addEventListener('storage',event=>{
    if(resetting||(event.storageArea&&event.storageArea!==localStorage))return;
    if(event.key===null||(event.key===FLOW&&event.newValue===null)){resetting=true;location.replace('/');}
  });

  return {catalog,list,unlock,player,setPlayer,getNotes,setNotes,completed,completeAct,canFinish,connectFlow,loadFlow,saveFlow,backupFlow,
    PLAYER_KEYS,PREFERENCE_KEYS,SESSION_KEYS,hasPersonalData,resetPlayerData,markNewGameWelcome,takeNewGameWelcome,hasSeenCinematic,markCinematicSeen};
})();
