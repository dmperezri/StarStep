"use strict";
document.addEventListener('DOMContentLoaded',()=>{
 const translations={
 es:{title:'MI BITÁCORA DE ASTRONAUTA',subtitle:'Cada descubrimiento deja una huella en el universo.',tabDiary:'📖 MI DIARIO',tabAchievements:'🚀 LOGROS',tabBadges:'🏅 MEDALLAS',tabDiplomas:'📜 DIPLOMAS',identity:'✦ CREDENCIAL DEL EXPLORADOR',cadet:'NOMBRE DEL CADETE',missionProgress:'✦ MI PROGRESO DE MISIÓN',notes:'✦ NOTAS DE CAMPO',pageTwo:'PÁGINA 02',question:'¿QUÉ APRENDISTE HOY?',observations:'✦ ARCHIVO DE OBSERVACIONES',noteExplain:'Tus anotaciones se conservan en este navegador; no se borran al cambiar de pestaña.',achievements:'✦ REGISTRO DE LOGROS',journey:'✦ HUELLAS DEL VIAJE',achExplain:'Los logros reflejan descubrimientos registrados realmente en StarStep.',badgeShowcase:'✦ VITRINA DE MEDALLAS',badgeDetails:'✦ FICHA DE INSIGNIAS',badgeExplain:'Solo se marcan como obtenidas las insignias respaldadas por los descubrimientos registrados.',diplomas:'✦ DIPLOMAS DE MISIÓN',originalReference:'✦ DISEÑO ORIGINAL',referenceWarning:'Referencia visual con datos de ejemplo. El certificado descargable utiliza los datos del jugador y solo se habilita al completar los requisitos.',locked:'Aún no desbloqueado',certificateHeading:'CERTIFICADO DE RECONOCIMIENTO',awardTo:'Se otorga a · Awarded to',previewNotice:'Esta vista previa utiliza el nombre del astronauta registrado. El diploma se habilita únicamente al cumplir los requisitos.',lockedDiploma:'DIPLOMA BLOQUEADO',ready:'Disponible para descargar',completed:'Completado',pending:'Pendiente',observed:'Descubierto',steps:'descubrimientos registrados',act:'Actos completos',unlocked:'Desbloqueado'},
 en:{title:'MY ASTRONAUT LOGBOOK',subtitle:'Every discovery leaves a mark on the universe.',tabDiary:'📖 MY LOGBOOK',tabAchievements:'🚀 ACHIEVEMENTS',tabBadges:'🏅 MEDALS',tabDiplomas:'📜 DIPLOMAS',identity:'✦ EXPLORER CREDENTIAL',cadet:'CADET NAME',missionProgress:'✦ MY MISSION PROGRESS',notes:'✦ FIELD NOTES',pageTwo:'PAGE 02',question:'WHAT DID YOU LEARN TODAY?',observations:'✦ OBSERVATION ARCHIVE',noteExplain:'Your notes stay in this browser and will not be lost when switching tabs.',achievements:'✦ ACHIEVEMENT RECORD',journey:'✦ JOURNEY TRACKER',achExplain:'Achievements reflect discoveries actually registered in StarStep.',badgeShowcase:'✦ MEDAL SHOWCASE',badgeDetails:'✦ BADGE DETAILS',badgeExplain:'Only badges supported by registered discoveries are marked as earned.',diplomas:'✦ MISSION DIPLOMAS',originalReference:'✦ ORIGINAL DESIGN',referenceWarning:'Visual reference contains sample data. The downloadable certificate uses the player details and only unlocks after requirements are met.',locked:'Not yet unlocked',certificateHeading:'CERTIFICATE OF ACHIEVEMENT',awardTo:'Awarded to · Se otorga a',previewNotice:'This preview uses the registered astronaut name. The diploma unlocks only after meeting the requirements.',lockedDiploma:'DIPLOMA LOCKED',ready:'Ready to download',completed:'Completed',pending:'Pending',observed:'Discovered',steps:'registered discoveries',act:'Completed acts',unlocked:'Unlocked'}
 };
 const byId=id=>document.getElementById(id);
 const lang=()=>window.StarI18n?.lang==='en'?'en':'es';
 const tr=k=>translations[lang()][k]||k;
 const safe=(value)=>String(value??'');
 const textNode=(parent,tag,value,cls)=>{const el=document.createElement(tag);el.textContent=safe(value);if(cls)el.className=cls;parent.appendChild(el);return el};
 const card=(parent,title,description,locked=false)=>{const div=document.createElement('article');div.className='mission-mini-card'+(locked?' locked':'');textNode(div,'strong',title);textNode(div,'p',description);parent.appendChild(div)};
 document.querySelectorAll('[data-diary-tab]').forEach(button=>button.addEventListener('click',()=>{
  const target=button.dataset.diaryTab;
  document.querySelectorAll('[data-diary-tab]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active))});
  document.querySelectorAll('.diary-tab-panel').forEach(panel=>panel.hidden=panel.id!==`diary-tab-${target}`);
 }));
 function render(){
  document.querySelectorAll('[data-di-i18n]').forEach(el=>el.textContent=tr(el.dataset.diI18n));
  const progress=window.StarProgress,flow=window.StarFlow;
  const discoveries=progress?.list?.()||[];
  const actList=progress?.completed?.()||[];
  const catalog=progress?.catalog||{};
  const mission=byId('diaryMissionProgress');mission.replaceChildren();
  textNode(mission,'strong',`${discoveries.length} ${tr('steps')}`);
  textNode(mission,'p',`${tr('act')}: ${actList.length} / 3`);
  const achievements=byId('achievementCards');achievements.replaceChildren();
  const achievementCount=byId('achievementCount');achievementCount.textContent=`${discoveries.length} / ${Object.keys(catalog).length}`;
  for(const [id,item] of Object.entries(catalog)){
    const found=discoveries.some(d=>d.id===id);
    card(achievements,item.name,found?`${tr('observed')}: ${item.observed}`:tr('pending'),!found);
  }
  const summary=byId('achievementSummary');summary.replaceChildren();
  textNode(summary,'strong',`${discoveries.length} / ${Object.keys(catalog).length} ${tr('steps')}`);
  textNode(summary,'p',`${actList.length} / 3 ${tr('act')}`);
  const badgeBox=byId('badges');badgeBox.replaceChildren();
  // Badges are descriptive indications of registered discoveries, never independent awards.
  for(const [id,item] of Object.entries(catalog)){
    const found=discoveries.some(d=>d.id===id);
    card(badgeBox,`${found?'🏅':'🔒'} ${item.name}`,found?tr('unlocked'):tr('pending'),!found);
  }
  byId('badgeCount').textContent=`${discoveries.length} / ${Object.keys(catalog).length}`;
  const diploma=byId('diplomaStatus');diploma.replaceChildren();
  const profile=progress?.player?.()||{};
  const name=typeof profile.alias==='string'?profile.alias.trim():'';
  const eligible=Boolean(progress?.canFinish?.() && name);
  const official=flow?.getChapterStatus?.()==='official_complete';
  const liveName=byId('liveCertificateName');if(liveName)liveName.textContent=name||'—';
  const lock=byId('liveCertificateLock');if(lock)lock.hidden=eligible;
  const lockText=byId('liveCertificateLockText');if(lockText)lockText.textContent=tr('lockedDiploma');
  const certificate=byId('certificate');if(certificate)certificate.hidden=!eligible;
  const certificateName=byId('certificateName');if(certificateName)certificateName.textContent=name||'—';
  const download=byId('printCertificate');if(download)download.hidden=!eligible;
  // Certificado lunar independiente del diploma de capítulo completo.
  // Se habilita únicamente cuando StarFlow confirma el Acto I terminado.
  const lunarReady=Boolean(name && flow?.isActComplete?.('luna'));
  const lunarStatus=flow?.getActStatus?.('luna');
  const lunarLabel=lang()==='en'?'Apollo 11 · Lunar diploma':'Apollo 11 · Diploma lunar';
  textNode(diploma,'strong',`${lunarLabel}: ${lunarReady?tr('unlocked'):tr('locked')}`);
  if(lunarReady && lunarStatus==='provisional') textNode(diploma,'p',lang()==='en'?'Educational recognition for the implemented lunar activities; the complete scientific mission is still in development.':'Reconocimiento educativo por las actividades lunares implementadas; la misión científica completa aún está en desarrollo.');
  const lunarButton=document.createElement('button');
  lunarButton.type='button';lunarButton.className='pixel-button mint';
  lunarButton.textContent=lang()==='en'?'DOWNLOAD LUNAR DIPLOMA PNG':'DESCARGAR DIPLOMA LUNAR PNG';
  lunarButton.disabled=!lunarReady;
  lunarButton.addEventListener('click',()=>window.StarLunarDiploma?.download?.());
  diploma.appendChild(lunarButton);
  textNode(diploma,'p',lang()==='en'
    ?'Requires a finished lunar act and a registered cadet name.'
    :'Requiere haber completado el acto lunar y tener un nombre de cadete registrado.');
  textNode(diploma,'strong',lang()==='en'?'CHAPTER DIPLOMA':'DIPLOMA DEL CAPÍTULO');
  textNode(diploma,'strong',eligible?tr('ready'):tr('locked'));
  textNode(diploma,'p',official?'Chapter 1 · Rock & Roll':`${tr('act')}: ${actList.length} / 3`);
 }
 render();document.addEventListener('starstep:language',render);
 document.addEventListener('starstep:unlocked',render);document.addEventListener('starstep:completed',render);
});
