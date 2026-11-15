"use strict";
/* Diccionario bilingüe compartido, cargado también en las demás páginas. */
window.StarI18n=(()=>{
 const dict={
  es:{start:'INICIAR AVENTURA',choose:'ELEGIR AVATAR',how:'CÓMO JUGAR',settings:'AJUSTES',journal:'BITÁCORA',continue:'CONTINUAR',transmit:'INICIAR TRANSMISIÓN',menu:'ABRIR MENÚ',alias:'NOMBRE DEL CADETE',launch:'INICIAR AVENTURA',select:'ELIGE TU AVATAR',moon:'ACTO I • LUNA | Misión 1: Detective de lava',back:'← VOLVER',note:'MIS ANOTACIONES',save:'GUARDAR NOTAS',earth:'TIERRA',lang:'ES',speech:[['CONTROL DE MISIÓN','Desde la Tierra te damos la bienvenida a StarStep. Hoy comienza una aventura para descubrir lo que la NASA dejó en otros mundos.'],['CONTROL DE MISIÓN','En la Luna y en Marte hay instrumentos y exploradores que guardan pistas del pasado. Vamos a seguir sus huellas.'],['LITO','¡Hola! Soy LITO, tu compañero espacial. Vamos a elegir tu personaje y prepararnos para viajar a la Luna.']]},
  en:{start:'START ADVENTURE',choose:'CHOOSE AVATAR',how:'HOW TO PLAY',settings:'SETTINGS',journal:'JOURNAL',continue:'CONTINUE',transmit:'START TRANSMISSION',menu:'OPEN MENU',alias:'CADET NAME',launch:'START ADVENTURE',select:'CHOOSE YOUR AVATAR',moon:'ACT I • MOON | Mission 1: Lava Detective',back:'← BACK',note:'MY NOTES',save:'SAVE NOTES',earth:'EARTH',lang:'EN',speech:[['MISSION CONTROL','Welcome to StarStep from Earth. Today you begin an adventure to discover what NASA left behind on other worlds.'],['MISSION CONTROL','On the Moon and Mars, instruments and explorers still hold clues about the past. Let us follow their traces.'],['LITO','Hello! I am LITO, your space companion. Let us choose your character and prepare for our journey to the Moon.']]}
 };

 Object.assign(dict.es,{
"welcome.speaker": "CONTROL DE MISIÓN",
"welcome.message": "¡Comenzá la transmisión para escuchar tu bienvenida!",
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
 "science.back.menu": "VOLVER AL MENÚ",
 "science.back.journal": "VOLVER A LA BITÁCORA",
 "science.back.mars": "VOLVER A MARTE",
 "science.observe": "OBSERVADO",
 "science.infer": "INTERPRETADO",
 "science.story": "NARRATIVA",
 "viewer.unavailable": "El visor 3D no está disponible; consultá la ficha científica.",
 "viewer.store": "GUARDAR DESCUBRIMIENTO",
 "viewer.close": "CERRAR"
});
 Object.assign(dict.en,{
    "welcome.speaker": "MISSION CONTROL",
"welcome.message": "Start the transmission to hear your welcome message!",
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
 "science.back.menu": "BACK TO MENU",
 "science.back.journal": "BACK TO JOURNAL",
 "science.back.mars": "BACK TO MARS",
 "science.observe": "OBSERVED",
 "science.infer": "INTERPRETED",
 "science.story": "STORY",
 "viewer.unavailable": "The 3D viewer is unavailable; explore the science card instead.",
 "viewer.store": "SAVE DISCOVERY",
 "viewer.close": "CLOSE"
});
 /* StarFlow: mensajes del controlador del flujo (Fase 1). */
 Object.assign(dict.es,{
 "flow.notice.blocked": "Esa misión todavía está bloqueada. Te llevamos a tu último punto de control.",
 "flow.notice.locked": "Completá los objetivos de la misión actual para continuar.",
 "flow.notice.locateFirst": "Primero localizá el artefacto con la mecánica de la misión.",
 "flow.notice.notRegistered": "La bitácora solo muestra descubrimientos ya registrados.",
 "flow.viewer.pending": "Inspección científica: tocá cada punto menta para registrar el hallazgo.",
 "flow.viewer.progress": "Inspección científica: {n}/{total} componentes revisados.",
 "flow.viewer.registered": "★ DESCUBRIMIENTO REGISTRADO EN TU BITÁCORA",
 "flow.viewer.already": "Ya estaba en tu colección.",
 "flow.viewer.consult": "Modo consulta: la bitácora no registra descubrimientos nuevos.",
 "flow.diary.noStations": "Todavía no hay estaciones descubiertas.",
 "start.continue": "CONTINUAR AVENTURA",
 "start.review": "CONSULTAR PROGRESO",
 "newgame.button": "NUEVA PARTIDA",
 "voice.off": "VOZ OFF",
 "intro.next": "SIGUIENTE",
 "intro.skip": "SALTAR",
 "intro.replay": "VER INTRODUCCIÓN",
 "intro.scene.curiosity.title": "La curiosidad humana",
 "intro.scene.curiosity.text": "Desde tiempos antiguos, la humanidad ha mirado hacia las estrellas, preguntándose qué secretos esconden otros mundos.",
 "intro.scene.apollo.title": "El comienzo de una aventura",
 "intro.scene.apollo.text": "Una misión cambiaría para siempre nuestra manera de comprender el universo: Apollo 11.",
 "intro.scene.footprints.title": "Las huellas en la Luna",
 "intro.scene.footprints.text": "Por primera vez, seres humanos caminaban sobre otro mundo. Sus descubrimientos abrieron nuevas preguntas.",
 "intro.scene.mars.title": "Un nuevo horizonte",
 "intro.scene.mars.text": "Décadas después, un pequeño explorador robótico continuaría la búsqueda de respuestas sobre Marte.",
 "intro.scene.story.title": "Tu historia comienza",
 "intro.scene.story.text": "Dos mundos. Dos historias. Una misma curiosidad. Ahora es tu turno de explorar.",
 "lito.welcome": "¡Hola, cadete! Soy LITO, tu compañero de exploración. Juntos viajaremos a lugares increíbles, resolveremos misterios y descubriremos los secretos del universo. ¿Estás preparado?",
 "lito.ready": "¡ESTOY LISTO!",
 "lito.newgame": "¡Una nueva aventura nos espera! Prepará tu traje, cadete.",
 "alias.error.empty": "Escribí el nombre del cadete: no puede quedar vacío ni tener solo espacios.",
 "alias.error.length": "El nombre del cadete debe tener entre 2 y 18 caracteres, sin contar los espacios del principio y del final.",
 "alias.error.chars": "Usá solo letras (con tildes o ñ), números, espacios, guiones o guiones bajos.",
 "newgame.title": "¿EMPEZAR UNA PARTIDA NUEVA?",
 "newgame.body": "Se borrarán de este navegador el nombre del cadete, el avatar, los descubrimientos, las insignias, las notas y la foto de la bitácora. El idioma, el audio y la introducción ya vista se conservan. No se puede deshacer.",
 "newgame.cancel": "CANCELAR",
 "newgame.confirm": "SÍ, EMPEZAR DE NUEVO",
 "flow.notice.resetFailed": "No se pudo borrar la partida en este navegador. Revisá los permisos de almacenamiento del sitio.",
 "diary.badgeMars": "★ DETECTIVE DE AGUA EN MARTE",
 "diary.badgeFootprints": "★ GUARDIÁN DE HUELLAS",
 "diary.badgeProvisional": "PROVISIONAL",
 "diary.print": "DESCARGAR CERTIFICADO PROVISIONAL PNG",
 "cert.provisional.title": "CERTIFICADO DE RECORRIDO PROVISIONAL",
 "cert.provisional.subtitle": "VERSIÓN DE PRUEBA · NO ES EL CERTIFICADO OFICIAL",
 "cert.provisional.award": "Reconocemos a",
 "cert.provisional.for": "por completar el recorrido provisional del Capítulo 1 · Rock & Roll",
 "cert.provisional.note": "Faltan mecánicas obligatorias del capítulo oficial",
 "cert.provisional.file": "StarStep-Certificado-Provisional",
 "viewer.inspectComponent": "INSPECCIONAR · {name}",
 "component.eagle.structure": "Estructura",
 "component.eagle.legs": "Patas",
 "component.eagle.ladder": "Escalera",
 "component.easep.antenna": "Antena",
 "component.easep.solar_panel": "Panel solar",
 "component.easep.seismometer": "Sismómetro",
 "component.reflector.prisms": "Prismas",
 "component.reflector.support": "Soporte",
 "component.opportunity.pancam": "Pancam",
 "component.opportunity.solar_panels": "Paneles solares",
 "component.opportunity.wheels": "Ruedas",
 "component.blueberries.hematite": "Hematita"
 });
 /* StarFlow: mensajes del controlador del flujo (Fase 1). */
 Object.assign(dict.en,{
 "flow.notice.blocked": "That mission is still locked. We took you back to your last checkpoint.",
 "flow.notice.locked": "Complete the current mission objectives to continue.",
 "flow.notice.locateFirst": "First locate the artifact using the mission mechanic.",
 "flow.notice.notRegistered": "The journal only shows discoveries you have already registered.",
 "flow.viewer.pending": "Scientific inspection: tap every mint point to register the finding.",
 "flow.viewer.progress": "Scientific inspection: {n}/{total} components reviewed.",
 "flow.viewer.registered": "★ DISCOVERY REGISTERED IN YOUR JOURNAL",
 "flow.viewer.already": "Already in your collection.",
 "flow.viewer.consult": "Review mode: the journal does not register new discoveries.",
 "flow.diary.noStations": "No stations discovered yet.",
 "start.continue": "CONTINUE ADVENTURE",
 "start.review": "VIEW PROGRESS",
 "newgame.button": "NEW GAME",
 "voice.off": "VOICE OFF",
 "intro.next": "NEXT",
 "intro.skip": "SKIP",
 "intro.replay": "WATCH INTRO",
 "intro.scene.curiosity.title": "Human curiosity",
 "intro.scene.curiosity.text": "Since ancient times, humanity has looked to the stars, wondering what secrets other worlds may hold.",
 "intro.scene.apollo.title": "The beginning of an adventure",
 "intro.scene.apollo.text": "One mission would forever change the way we understand the universe: Apollo 11.",
 "intro.scene.footprints.title": "Footprints on the Moon",
 "intro.scene.footprints.text": "For the first time, humans walked on another world. Their discoveries opened new questions.",
 "intro.scene.mars.title": "A new horizon",
 "intro.scene.mars.text": "Decades later, a small robotic explorer would continue the search for answers on Mars.",
 "intro.scene.story.title": "Your story begins",
 "intro.scene.story.text": "Two worlds. Two stories. One shared curiosity. Now it is your turn to explore.",
 "lito.welcome": "Hello, cadet! I'm LITO, your exploration companion. Together we will travel to incredible places, solve mysteries, and discover the secrets of the universe. Are you ready?",
 "lito.ready": "I'M READY!",
 "lito.newgame": "A new adventure awaits! Get your suit ready, cadet.",
 "alias.error.empty": "Enter the cadet name: it cannot be empty or contain only spaces.",
 "alias.error.length": "The cadet name must have 2 to 18 characters, not counting leading or trailing spaces.",
 "alias.error.chars": "Use only letters (accents and ñ allowed), numbers, spaces, hyphens or underscores.",
 "newgame.title": "START A NEW GAME?",
 "newgame.body": "This will delete the cadet name, avatar, discoveries, badges, notes and journal photo from this browser. Language, audio settings and the watched intro are kept. This cannot be undone.",
 "newgame.cancel": "CANCEL",
 "newgame.confirm": "YES, START OVER",
 "flow.notice.resetFailed": "The game could not be deleted in this browser. Check the site's storage permissions.",
 "diary.badgeMars": "★ MARS WATER DETECTIVE",
 "diary.badgeFootprints": "★ FOOTPRINT GUARDIAN",
 "diary.badgeProvisional": "PROVISIONAL",
 "diary.print": "DOWNLOAD PROVISIONAL PNG CERTIFICATE",
 "cert.provisional.title": "PROVISIONAL RUN CERTIFICATE",
 "cert.provisional.subtitle": "TEST VERSION · NOT THE OFFICIAL CERTIFICATE",
 "cert.provisional.award": "We recognize",
 "cert.provisional.for": "for completing the provisional run of Chapter 1 · Rock & Roll",
 "cert.provisional.note": "Required mechanics of the official chapter are still missing",
 "cert.provisional.file": "StarStep-Provisional-Certificate",
 "viewer.inspectComponent": "INSPECT · {name}",
 "component.eagle.structure": "Structure",
 "component.eagle.legs": "Legs",
 "component.eagle.ladder": "Ladder",
 "component.easep.antenna": "Antenna",
 "component.easep.solar_panel": "Solar panel",
 "component.easep.seismometer": "Seismometer",
 "component.reflector.prisms": "Prisms",
 "component.reflector.support": "Support",
 "component.opportunity.pancam": "Pancam",
 "component.opportunity.solar_panels": "Solar panels",
 "component.opportunity.wheels": "Wheels",
 "component.blueberries.hematite": "Hematite"
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
 const canvas=document.getElementById('world');if(!canvas || !document.getElementById('menu') || !document.getElementById('adventureButton'))return;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 const $=id=>document.getElementById(id);let transition=false;
 // Bienvenida, OUTSTRIP, idioma e introducción histórica: intro-secuencia.js (StarIntro).
 $('how').addEventListener('click',()=>{$('help').hidden=false;$('closeHelp').focus();StarSound.effect('button');});
 $('closeHelp').addEventListener('click',()=>{$('help').hidden=true;$('how').focus();});
 $('music').addEventListener('click',()=>{StarSound.setMusic(!StarSound.musicOn);$('music').textContent=StarSound.musicOn?StarI18n.t('music.on'):'♪ OFF';});
 $('voice').addEventListener('click',()=>{StarSound.setVoice(!StarSound.voiceOn);$('voice').textContent=StarSound.voiceOn?StarI18n.t('voice.on'):'OFF';});

// Etiquetas de audio del menú en el idioma actual.
document.addEventListener('starstep:language', () => {
    $('music').textContent = StarSound.musicOn
        ? StarI18n.t('music.on')
        : StarI18n.lang === 'en' ? '♪ MUSIC OFF' : '♪ MÚSICA OFF';
    $('voice').textContent = StarSound.voiceOn ? StarI18n.t('voice.on') : StarI18n.t('voice.off');
});

// Botón principal del menú: INICIAR, CONTINUAR o CONSULTAR PROGRESO.
// Solo lee StarFlow: no completa objetivos, no desbloquea etapas ni registra artefactos.
function updateAdventureButton() {
    const button = $('adventureButton');
    const entry = window.StarFlow?.getEntryPoint?.();
    if (!button || !entry) return;
    const key = entry.status === 'new' ? 'start'
        : entry.status === 'in_progress' ? 'start.continue'
        : 'start.review';
    button.dataset.i18n = key;
    button.textContent = StarI18n.t(key);
    button.href = entry.page;
}
updateAdventureButton();
document.addEventListener('starflow:change', updateAdventureButton);

// NUEVA PARTIDA: para otro jugador en el mismo navegador o para empezar de cero.
// Solo aparece si hay algo que borrar y pide confirmación. Al confirmar (sección 5.8):
//   1. se borran solo los datos de la partida (idioma, audio e intro vista se conservan);
//   2. LITO da una bienvenida breve (~3 s) sobre la presentación, sin volver a OUTSTRIP,
//      el idioma, la intro, la bienvenida extensa ni el menú;
//   3. se deja una marca de un solo uso y se navega a /astronauta. Allí flujo.js crea el
//      invitado nuevo y registra lito_welcome.heard (new_game_welcome); perfil, cadete,
//      capítulo y misiones siguen siendo obligatorios.
function updateNewGameButton() {
    const entry = window.StarFlow?.getEntryPoint?.();
    const hasData = (entry && entry.status !== 'new') || window.StarProgress?.hasPersonalData?.() === true;
    $('newGame').hidden = !(hasData && window.StarProgress?.resetPlayerData);
}
function closeNewGame() {
    $('newGameDialog').hidden = true;
    $('newGame').focus();
}
updateNewGameButton();
document.addEventListener('starflow:change', updateNewGameButton);
$('newGame').addEventListener('click', () => {
    $('help').hidden = true;
    $('newGameDialog').hidden = false;
    $('newGameCancel').focus(); // la opción segura queda seleccionada
    StarSound.effect('button');
});
$('newGameCancel').addEventListener('click', closeNewGame);
$('newGameDialog').addEventListener('keydown', event => { if (event.key === 'Escape') closeNewGame(); });
const NEW_GAME_PAGE = '/astronauta';
let newGameStarted = false;
$('newGameConfirm').addEventListener('click', () => {
    if (newGameStarted) return;                 // un solo reinicio por página
    const result = window.StarProgress.resetPlayerData();
    if (!result.ok) { closeNewGame(); window.StarFlow?.notify?.('resetFailed'); return; }
    newGameStarted = true;
    $('newGameDialog').hidden = true;
    StarSound.init();                           // el clic habilita la voz de LITO
    // replace: «atrás» no vuelve a esta página, cuyo controlador tiene la partida borrada.
    const leave = () => {
        StarSound.stopAll();
        if (window.StarProgress.markNewGameWelcome?.()) location.replace(NEW_GAME_PAGE);
        else location.replace('/');            // sin marca: portada con la bienvenida completa
    };
    // Sin la secuencia (script no cargado) no se muestra la bienvenida breve: la portada
    // se recarga y pide la bienvenida completa, como antes.
    if (!window.StarIntro?.newGameWelcome?.({ onDone: leave })) { StarSound.stopAll(); location.replace('/'); }
});

// «VER INTRODUCCIÓN»: vuelve a mostrar la introducción histórica (ya vista, se puede saltar).
$('replayIntro').addEventListener('click', () => {
    $('help').hidden = true;
    StarSound.effect('button');
    window.StarIntro?.replayHistory();
});

// Estación terrestre: se anima solo cuando está a la vista (al entrar al menú), para no
// superponer su animación con la presentación.
let renderRunning = false;
function startEarthScene() {
    if (renderRunning) return;
    renderRunning = true;
    const render = ms => { StarArt.earthScene(ctx, ms / 1000, { litoState: window.litoState || 'idle' }); requestAnimationFrame(render); };
    requestAnimationFrame(render);
}

// Secuencia de entrada (intro-secuencia.js):
//   apertura real o recarga ... OUTSTRIP → idioma → intro histórica → LITO (hasta completarla) → menú
//   regreso interno ........... menú directo cuando getHomeMode() === 'menu'
function onMenuShown() { updateAdventureButton(); updateNewGameButton(); startEarthScene(); }
if (window.StarIntro) {
    window.StarIntro.start({ onMenu: onMenuShown });
} else {
    // Sin la secuencia (script no cargado): menú directo. La guarda de páginas sigue exigiendo
    // la bienvenida para avanzar, así que esto no desbloquea progreso.
    console.warn('StarStep: intro-secuencia.js no está disponible');
    const presentation = $('introSequence');
    if (presentation) presentation.hidden = true;
    document.body.classList.remove('is-entering');
    $('menu').hidden = false;
    onMenuShown();
}

 document.querySelectorAll('a[href]').forEach(a=>a.addEventListener('click',ev=>{if(ev.metaKey||ev.ctrlKey||ev.button!==0)return;ev.preventDefault();if(transition)return;transition=true;StarSound.effect('travel');StarSound.stopAll();document.querySelector('.curtain').classList.add('is-dark');setTimeout(()=>location.assign(a.href),430);}));
 window.addEventListener('pagehide',()=>{StarSound.stopAll();});
});
