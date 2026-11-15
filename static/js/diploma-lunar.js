"use strict";
/* Diploma lunar independiente; no concede logros, solo representa los ya obtenidos. */
window.StarLunarDiploma=Object.freeze({download(){
  const award=window.StarProgress?.getAward?.("luna");

  const player=award
    ||window.StarProgress?.player?.()
    ||{};
  const name=String(player.alias||'').trim();
  if(!name || !window.StarFlow?.isActComplete?.('luna'))return false;
  const english=window.StarI18n?.lang==='en';
  const cv=document.createElement('canvas');cv.width=1600;cv.height=1132;
  const c=cv.getContext('2d');
  function box(x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
  function txt(value,y,size,col='#1a1340',font='Arial'){c.fillStyle=col;c.textAlign='center';c.font=`bold ${size}px ${font}`;c.fillText(value,800,y,1390)}
  box(0,0,1600,1132,'#1a1340');box(16,16,1568,1100,'#ffe066');box(30,30,1540,1072,'#aba1f5');box(45,45,1510,1042,'#fff8e7');
  c.strokeStyle='#6e62ce';c.lineWidth=5;c.strokeRect(65,65,1470,1002);
  for(const x of [110,1490])for(const y of [105,1023]){box(x-18,y-4,36,8,'#6e62ce');box(x-4,y-18,8,36,'#6e62ce');}
  txt('★ STARSTEP ★',175,74,'#6e62ce','monospace');
  txt(english?'LUNAR EXPLORER DIPLOMA':'DIPLOMA DE EXPLORADOR LUNAR',285,52);
  txt('APOLLO 11 · ACTO I / ACT I',348,29,'#6e62ce');
  txt(english?'Awarded to':'Se otorga a',430,30,'#414379');
  // Retrato real del avatar elegido, no la identidad ficticia del ejemplo.
  const portrait=document.createElement('canvas');portrait.width=portrait.height=48;
  if(window.StarArt?.portrait){window.StarArt.portrait(portrait,player.avatar||'astronauta');c.imageSmoothingEnabled=false;c.drawImage(portrait,722,462,156,156);}
  txt(name.slice(0,24),708,72);
  box(360,741,880,4,'#1a1340');
  txt(english?'For completing the Apollo 11 lunar mission':'Por completar la misión lunar Apollo 11',822,34);
  txt(english?'An educational recognition from StarStep':'Reconocimiento educativo de StarStep',879,24,'#258f86');
  const date=new Intl.DateTimeFormat(english?'en-US':'es-NI',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(award?.issuedAt || Date.now()));
  txt(`LITO · OUTSTRIP · ${date}`,1007,26,'#414379');
  const a=document.createElement('a');a.download='StarStep-Diploma-Lunar-'+name.replace(/[^a-z0-9_-]/gi,'_')+'.png';a.href=cv.toDataURL('image/png');a.click();return true;
}});
