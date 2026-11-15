"use strict";
/* Diccionario bilingüe compartido, cargado también en las demás páginas. */
window.StarI18n=(()=>{
 const dict={
  es:{start:'INICIAR AVENTURA',choose:'ELEGIR AVATAR',how:'CÓMO JUGAR',settings:'AJUSTES',journal:'BITÁCORA',continue:'CONTINUAR',transmit:'INICIAR TRANSMISIÓN',menu:'ABRIR MENÚ',alias:'NOMBRE DEL CADETE',launch:'INICIAR AVENTURA',select:'ELIGE TU AVATAR',moon:'ACTO I • LUNA | Misión 1: Detective de lava',back:'← VOLVER',note:'MIS ANOTACIONES',save:'GUARDAR NOTAS',earth:'TIERRA',lang:'ES',speech:[['CONTROL DE MISIÓN','Desde la Tierra te damos la bienvenida a StarStep. Hoy comienza una aventura para descubrir lo que la NASA dejó en otros mundos.'],['CONTROL DE MISIÓN','En la Luna y en Marte hay instrumentos y exploradores que guardan pistas del pasado. Vamos a seguir sus huellas.'],['LITO','¡Hola! Soy LITO, tu compañero espacial. Vamos a elegir tu personaje y prepararnos para viajar a la Luna.']]},
  en:{start:'START ADVENTURE',choose:'CHOOSE AVATAR',how:'HOW TO PLAY',settings:'SETTINGS',journal:'JOURNAL',continue:'CONTINUE',transmit:'START TRANSMISSION',menu:'OPEN MENU',alias:'CADET NAME',launch:'START ADVENTURE',select:'CHOOSE YOUR AVATAR',moon:'ACT I • MOON | Mission 1: Lava Detective',back:'← BACK',note:'MY NOTES',save:'SAVE NOTES',earth:'EARTH',lang:'EN',speech:[['MISSION CONTROL','Welcome to StarStep from Earth. Today you begin an adventure to discover what NASA left behind on other worlds.'],['MISSION CONTROL','On the Moon and Mars, instruments and explorers still hold clues about the past. Let us follow their traces.'],['LITO','Hello! I am LITO, your space companion. Let us choose your character and prepare for our journey to the Moon.']]}
 };

 Object.assign(dict.es,{
 "brand.tagline": "«Un pequeño paso que dar, un universo por explorar.»",
 "chapter": "CAPÍTULO 1 · ROCK & ROLL",
 "skip": "SALTAR",
 "help.title": "CÓMO JUGAR",
 "help.body": "Elegí un avatar, escribí tu nombre y despegá. En la Luna, A/D o flechas mueven el rover; E inspecciona. En Marte, analizá los descubrimientos de Opportunity. Guardá tus hallazgos en el Librito.",
 "help.close": "ENTENDIDO",
 "home.title": "MENÚ DE MISIÓN",
 "music.on": "♪ MÚSICA ON",
 "voice.on": "VOZ ON",
 "avatar.subtitle": "VICE · ASTRONAUTA · JAGUAR UAM · GEÓLOGA · PILOTO · GUARDIÁN",
 "avatar.ready": "¡Listo, cadete! ¿Despegamos hacia la Luna?",
 "launch.crew": "TRIPULACIÓN · CADETE + LITO",
 "launch.start": "INICIAR DESPEGUE",
 "launch.skip": "SALTAR INTRO",
 "launch.enter": "EXPLORAR LA LUNA",
 "launch.intro": "CONTROL DE MISIÓN · PREPARADOS",
 "launch.arrived": "LITO: ¡Llegamos! Exploremos las huellas de Apollo 11.",
 "mars.back": "← LUNA",
 "mars.title": "ACTO II · MARTE",
 "mars.subtitle": "DETECTIVE DE AGUA · OPPORTUNITY",
 "mars.lito": "LITO: Las rocas guardan pistas del agua antigua.",
 "mars.opportunity": "ROVER OPPORTUNITY 3D",
 "mars.blueberries": "HEMATITA 3D",
 "mars.next": "CONTINUAR A HUELLAS",
 "moon.title": "ACTO I · LUNA",
 "moon.subtitle": "Misión 1: Detective de lava",
 "moon.lito": "LITO: Avancemos, hay una señal más adelante.",
 "moon.controls": "A / D o flechas: mover · E: inspeccionar",
 "moon.earth": "TIERRA",
 "moon.inspect": "VISOR DE EAGLE 3D",
 "moon.next": "ACTO II: MARTE",
 "puzzle.back": "← MARTE",
 "puzzle.title": "ACTO III · HUELLAS",
 "puzzle.heading": "LA MEMORIA DEL ESPACIO",
 "puzzle.desc": "Uní cada equipo con el descubrimiento que hizo posible.",
 "puzzle.finish": "VER MI BITÁCORA Y CERTIFICADO",
 "puzzle.pick": "Elegí primero un equipo.",
 "puzzle.bad": "PROBÁ OTRA VEZ",
 "puzzle.good": "¡CORRECTO!",
 "puzzle.complete": "¡Completaste el ACTO III!",
 "diary.back": "← VOLVER A MISIÓN",
 "diary.subtitle": "CUADERNO DE MISIÓN",
 "diary.title": "MI BITÁCORA ESPACIAL",
 "diary.desc": "Observá, investigá y guardá las huellas de la NASA.",
 "diary.id": "IDENTIFICACIÓN",
 "diary.cadet": "CADETE · STARSTEP",
 "diary.photo": "COLOCAR FOTO",
 "diary.remove": "Quitar foto",
 "diary.photoHint": "Foto opcional; se almacena únicamente en este navegador.",
 "diary.pieces": "PIEZAS RECOLECTADAS",
 "diary.badges": "INSIGNIAS",
 "diary.stations": "VISOR DE ESTACIONES",
 "diary.stationsHint": "Podés volver a girar los artefactos que descubriste.",
 "diary.print": "DESCARGAR CERTIFICADO PNG",
 "diary.count": "{n} piezas encontradas",
 "diary.empty": "Todavía no encontraste piezas. Explorá la Luna.",
 "diary.noBadge": "Las insignias aparecerán aquí.",
 "diary.open": "ABRIR EN 3D",
 "diary.badgeMoon": "★ EXPLORADOR LUNAR",
 "diary.saved": "✓ Guardado",
 "diary.saveError": "Error al guardar",
 "diary.cert": "CERTIFICADO DE RECONOCIMIENTO",
 "diary.award": "Se otorga a",
 "diary.for": "por completar el Capítulo 1 · Rock & Roll",
 "diary.team": "Equipo OUTSTRIP · Managua",
 "science.link": "ARCHIVO NASA",
 "science.title": "ARCHIVO CIENTÍFICO",
 "science.intro": "Fotografías de misiones NASA con créditos y contexto. Estas imágenes son referencias documentales, no escenas del videojuego.",
 "science.apollo": "APOLLO 11 · LUNA",
 "science.mars": "OPPORTUNITY · MARTE",
 "science.spirit": "SPIRIT · REFERENCIA PARA UN CAPÍTULO FUTURO",
 "science.back": "VOLVER A LA BITÁCORA",
 "science.observe": "OBSERVADO",
 "science.infer": "INTERPRETADO",
 "science.story": "NARRATIVA",
 "viewer.unavailable": "El visor 3D no está disponible; consultá la ficha científica.",
 "viewer.store": "GUARDAR DESCUBRIMIENTO",
 "viewer.close": "CERRAR"
});
 Object.assign(dict.en,{
 "brand.tagline": "«One small step to take, a universe to explore.»",
 "chapter": "CHAPTER 1 · ROCK & ROLL",
 "skip": "SKIP",
 "help.title": "HOW TO PLAY",
 "help.body": "Choose an avatar, enter your name, and launch. On the Moon, use A/D or the arrows to drive; press E to inspect. On Mars, investigate Opportunity’s findings. Save discoveries in your Collection Book.",
 "help.close": "GOT IT",
 "home.title": "MISSION MENU",
 "music.on": "♪ MUSIC ON",
 "voice.on": "VOICE ON",
 "avatar.subtitle": "VICE · ASTRONAUT · UAM JAGUAR · GEOLOGIST · PILOT · GUARDIAN",
 "avatar.ready": "Ready, cadet! Shall we launch for the Moon?",
 "launch.crew": "CREW · CADET + LITO",
 "launch.start": "START LAUNCH",
 "launch.skip": "SKIP INTRO",
 "launch.enter": "EXPLORE THE MOON",
 "launch.intro": "MISSION CONTROL · READY",
 "launch.arrived": "LITO: We made it! Let’s explore the traces of Apollo 11.",
 "mars.back": "← MOON",
 "mars.title": "ACT II · MARS",
 "mars.subtitle": "WATER DETECTIVE · OPPORTUNITY",
 "mars.lito": "LITO: The rocks hold clues to ancient water.",
 "mars.opportunity": "OPPORTUNITY ROVER 3D",
 "mars.blueberries": "HEMATITE 3D",
 "mars.next": "CONTINUE TO TRACES",
 "moon.title": "ACT I · MOON",
 "moon.subtitle": "Mission 1: Lava Detective",
 "moon.lito": "LITO: Let’s go forward; there is a signal ahead.",
 "moon.controls": "A / D or arrows: drive · E: inspect",
 "moon.earth": "EARTH",
 "moon.inspect": "VIEW EAGLE IN 3D",
 "moon.next": "ACT II: MARS",
 "puzzle.back": "← MARS",
 "puzzle.title": "ACT III · TRACES",
 "puzzle.heading": "MEMORIES OF SPACE",
 "puzzle.desc": "Match each piece of equipment with the discovery it made possible.",
 "puzzle.finish": "SEE MY JOURNAL AND CERTIFICATE",
 "puzzle.pick": "Choose a piece of equipment first.",
 "puzzle.bad": "TRY AGAIN",
 "puzzle.good": "CORRECT!",
 "puzzle.complete": "You completed ACT III!",
 "diary.back": "← BACK TO MISSION",
 "diary.subtitle": "MISSION LOG",
 "diary.title": "MY SPACE JOURNAL",
 "diary.desc": "Observe, investigate, and preserve NASA’s discoveries.",
 "diary.id": "IDENTIFICATION",
 "diary.cadet": "CADET · STARSTEP",
 "diary.photo": "ADD PHOTO",
 "diary.remove": "Remove photo",
 "diary.photoHint": "Optional photo; stored only in this browser.",
 "diary.pieces": "COLLECTED ITEMS",
 "diary.badges": "BADGES",
 "diary.stations": "ARTIFACT VIEWER",
 "diary.stationsHint": "You can rotate the artifacts you discovered again.",
 "diary.print": "DOWNLOAD PNG CERTIFICATE",
 "diary.count": "{n} items discovered",
 "diary.empty": "You have not discovered any items yet. Explore the Moon.",
 "diary.noBadge": "Your badges will appear here.",
 "diary.open": "OPEN IN 3D",
 "diary.badgeMoon": "★ LUNAR EXPLORER",
 "diary.saved": "✓ Saved",
 "diary.saveError": "Error saving",
 "diary.cert": "CERTIFICATE OF ACHIEVEMENT",
 "diary.award": "Awarded to",
 "diary.for": "for completing Chapter 1 · Rock & Roll",
 "diary.team": "Team OUTSTRIP · Managua",
 "science.link": "NASA ARCHIVE",
 "science.title": "SCIENCE ARCHIVE",
 "science.intro": "NASA mission photographs with credits and context. These images are documentary references, not game scenes.",
 "science.apollo": "APOLLO 11 · MOON",
 "science.mars": "OPPORTUNITY · MARS",
 "science.spirit": "SPIRIT · REFERENCE FOR A FUTURE CHAPTER",
 "science.back": "BACK TO JOURNAL",
 "science.observe": "OBSERVED",
 "science.infer": "INTERPRETED",
 "science.story": "STORY",
 "viewer.unavailable": "The 3D viewer is unavailable; explore the science card instead.",
 "viewer.store": "SAVE DISCOVERY",
 "viewer.close": "CLOSE"
});
 let lang=localStorage.getItem('starstep_lang')==='en'?'en':'es';
 function t(key,vars={}){let value=dict[lang][key]??dict.es[key]??key;if(typeof value==='string')for(const [k,v] of Object.entries(vars))value=value.replaceAll('{'+k+'}',String(v));return value;}
 function apply(){document.documentElement.lang=lang;document.querySelectorAll('[data-i18n]').forEach(el=>{const v=t(el.dataset.i18n);if(typeof v==='string')el.textContent=v;});document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{const v=t(el.dataset.i18nPlaceholder);if(typeof v==='string')el.placeholder=v;});document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));document.dispatchEvent(new CustomEvent('starstep:language',{detail:{lang}}));}
 function setLang(next){if(next!=='es'&&next!=='en')return;lang=next;localStorage.setItem('starstep_lang',lang);apply();}
 document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));apply();});
 return {get lang(){return lang;},t,apply,setLang};
})();

/* El resto solo corre en la portada. */
document.addEventListener('DOMContentLoaded',()=>{
 const canvas=document.getElementById('world');if(!canvas || !document.getElementById('start') || !document.getElementById('welcome'))return;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 const $=id=>document.getElementById(id);let step=-1,typingTimer=null,transition=false;
 function typeText(text){clearInterval(typingTimer);const node=$('speechText');node.textContent='';let i=0;typingTimer=setInterval(()=>{i=Math.min(text.length,i+2);node.textContent=text.slice(0,i);if(i%6===0)StarSound.effect('type');if(i>=text.length)clearInterval(typingTimer);},23);}
 function showStep(){const lines=StarI18n.t('speech'),line=lines[step];$('speaker').textContent=line[0];typeText(line[1]);$('start').textContent=step===2?StarI18n.t('menu'):StarI18n.t('continue');StarSound.effect('radio');StarSound.speak(line[1],{lito:step===2,onStart:()=>{window.litoState='talking';},onEnd:()=>{window.litoState='idle';}});}
 function openMenu(){clearInterval(typingTimer);StarSound.stopVoice();$('welcome').hidden=true;$('menu').hidden=false;StarSound.effect('success');}
 $('start').addEventListener('click',()=>{StarSound.init();StarSound.startMusic();step++;if(step<3)showStep();else openMenu();});
 $('skip').addEventListener('click',()=>{StarSound.init();StarSound.startMusic();openMenu();});
 $('how').addEventListener('click',()=>{$('help').hidden=false;$('closeHelp').focus();StarSound.effect('button');});
 $('closeHelp').addEventListener('click',()=>{$('help').hidden=true;$('how').focus();});
 $('music').addEventListener('click',()=>{StarSound.setMusic(!StarSound.musicOn);$('music').textContent=StarSound.musicOn?StarI18n.t('music.on'):'♪ OFF';});
 $('voice').addEventListener('click',()=>{StarSound.setVoice(!StarSound.voiceOn);$('voice').textContent=StarSound.voiceOn?StarI18n.t('voice.on'):'OFF';});
 document.addEventListener('starstep:language',()=>{if($('music'))$('music').textContent=StarSound.musicOn?StarI18n.t('music.on'):'♪ OFF';if($('voice'))$('voice').textContent=StarSound.voiceOn?StarI18n.t('voice.on'):'OFF';if(step>=0&&step<3){clearInterval(typingTimer);StarSound.stopVoice();showStep();}});
 document.querySelectorAll('a[href]').forEach(a=>a.addEventListener('click',ev=>{if(ev.metaKey||ev.ctrlKey||ev.button!==0)return;ev.preventDefault();if(transition)return;transition=true;StarSound.effect('travel');StarSound.stopAll();document.querySelector('.curtain').classList.add('is-dark');setTimeout(()=>location.assign(a.href),430);}));
 function render(ms){StarArt.earthScene(ctx,ms/1000,{litoState:window.litoState||'idle'});requestAnimationFrame(render);}requestAnimationFrame(render);
 window.addEventListener('pagehide',()=>{clearInterval(typingTimer);StarSound.stopAll();});
});
