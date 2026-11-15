"use strict";
document.addEventListener('DOMContentLoaded',()=>{
 const button=document.getElementById('printCertificate');if(!button)return;
 button.hidden=!(window.StarProgress?.canFinish() && String(window.StarProgress?.player?.()?.alias||'').trim());
 button.addEventListener('click',()=>{
  if(!StarProgress.canFinish() || !String(StarProgress.player()?.alias||'').trim())return;
  const award=StarProgress.getAward?.("chapter");

  const lang=StarI18n.lang,es=lang==='es',
    player=award||StarProgress.player();
  // Recorrido provisional ≠ capítulo oficial: el oficial exige también las etapas previstas.
  const official=window.StarFlow?.getChapterStatus()==='official_complete';const name=String(player.alias||'CADETE').slice(0,18);
  const cv=document.createElement('canvas');cv.width=1600;cv.height=1132;const c=cv.getContext('2d');c.fillStyle='#FFF8E7';c.fillRect(0,0,1600,1132);
  const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  rect(0,0,1600,1132,'#14183d');rect(16,16,1568,1100,'#FFE066');rect(28,28,1544,1076,'#ABA1F5');rect(42,42,1516,1048,'#FFF8E7');c.strokeStyle='#ABA1F5';c.lineWidth=5;c.strokeRect(56,56,1488,1020);
  const write=(text,x,y,size,color='#1A1340',font='Arial',bold=true)=>{c.fillStyle=color;c.font=(bold?'bold ':'')+size+'px '+font;c.textAlign='center';c.fillText(text,x,y);};
  const star=(x,y)=>{rect(x-4,y-20,8,40,'#FFE066');rect(x-20,y-4,40,8,'#FFE066');};[[85,85],[1515,85],[85,1047],[1515,1047],[800,760]].forEach(p=>star(...p));
  write('STARSTEP',800,160,82,'#4E3F98','monospace');
  if(official){write(es?'CERTIFICADO DE RECONOCIMIENTO':'CERTIFICATE OF ACHIEVEMENT',800,250,48);write(es?'CERTIFICATE OF ACHIEVEMENT':'CERTIFICADO DE RECONOCIMIENTO',800,292,24,'#6E62CE');}
  else{write(StarI18n.t('cert.provisional.title'),800,250,44);write(StarI18n.t('cert.provisional.subtitle'),800,292,24,'#D9593A');}
  write(es?'Se otorga a · Awarded to':'Awarded to · Se otorga a',800,352,26,'#414379');
  c.fillStyle='#ABA1F5';c.fillRect(713,382,174,174);c.fillStyle='#1A1340';c.fillRect(724,393,152,152);
  if(window.StarArt?.portrait){const avatar=document.createElement('canvas');avatar.width=avatar.height=48;try{StarArt.portrait(avatar,player.avatar||'astronauta');c.imageSmoothingEnabled=false;c.drawImage(avatar,731,400,138,138);}catch{write('★',800,500,95,'#FFE066');}}
  write(name,800,630,74,'#1A1340');rect(375,658,850,4,'#1A1340');
  write(official?(es?'por completar el Capítulo 1 · Rock & Roll':'for completing Chapter 1 · Rock & Roll'):StarI18n.t('cert.provisional.for'),800,716,official?32:28);
  if(!official)write(StarI18n.t('cert.provisional.note'),800,808,20,'#D9593A','Arial',false);
  write(es?'Detective de rocas de la Luna y Marte':'Rock Detective of the Moon and Mars',800,763,24,'#258f86');
  for(const [x,label,tone] of [[254,es?'Acto I · Luna':'Act I · Moon','#A6A7BB'],[1346,es?'Acto II · Marte':'Act II · Mars','#D9593A']]){c.fillStyle='#1A1340';c.beginPath();c.arc(x,523,71,0,Math.PI*2);c.fill();c.fillStyle=tone;c.beginPath();c.arc(x,523,61,0,Math.PI*2);c.fill();write(label,x,645,24);}
  write('✦ LITO ✦',800,875,40,'#6E62CE','monospace');
  const date=new Intl.DateTimeFormat(es?'es-NI':'en-US',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(award?.issuedAt || Date.now()));
  write(date,280,970,30);write('LITO · '+(es?'Guía de misión':'Mission guide'),800,970,26);write('Equipo OUTSTRIP',1310,970,30);
  rect(145,992,280,3,'#1A1340');rect(630,992,340,3,'#1A1340');rect(1140,992,340,3,'#1A1340');
  write('NASA Space Apps Challenge 2026 · Managua',800,1050,22,'#7775a2', 'Arial',false);
  window.StarFlow?.recordObjective('chapter_reward.certificate',{source:'certificate_download'});
  const link=document.createElement('a');link.download=(official?'StarStep-Certificado-':StarI18n.t('cert.provisional.file')+'-')+name.replace(/[^a-z0-9_-]/gi,'_')+'.png';link.href=cv.toDataURL('image/png');link.click();
 });
});
