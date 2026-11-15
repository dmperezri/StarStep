"use strict";
document.addEventListener('DOMContentLoaded',()=>{
 const canvas=document.getElementById('world'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 const form=document.getElementById('avatarForm'),grid=document.getElementById('avatarGrid'),alias=document.getElementById('alias'),message=document.getElementById('litoMessage');
 const previous=window.StarProgress.player();let selected=StarArt.avatars.some(x=>x.id===previous.avatar)?previous.avatar:'astronauta';alias.value=previous.alias||'';
 for(const avatar of StarArt.avatars){const b=document.createElement('button');b.type='button';b.className='avatar-card';b.dataset.id=avatar.id;const portrait=document.createElement('canvas');portrait.width=48;portrait.height=48;StarArt.portrait(portrait,avatar.id);const label=document.createElement('span');label.dataset.avatarName=avatar.id;label.textContent=StarI18n.t('avatar.'+avatar.id);b.append(portrait,label);b.addEventListener('click',()=>{selected=avatar.id;StarSound.init();StarSound.effect('button');refresh();});grid.append(b);}
 function refresh(){grid.querySelectorAll('button').forEach(b=>{let active=b.dataset.id===selected;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});const name=alias.value.trim()||StarI18n.t('avatar.cadet');message.textContent=StarI18n.t('avatar.message',{name});grid.querySelectorAll('[data-avatar-name]').forEach(label=>{label.textContent=StarI18n.t('avatar.'+label.dataset.avatarName);});}
 alias.addEventListener('input',refresh);document.addEventListener('starstep:language',refresh);refresh();
 form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;StarProgress.setPlayer({alias:alias.value,avatar:selected});StarSound.init();StarSound.effect('success');document.querySelector('.curtain').classList.add('is-dark');setTimeout(()=>location.assign(document.getElementById('launchDestination').href),430);});
 let animationId=0;function frame(ms){StarArt.earthScene(ctx,ms/1000,{litoState:'happy'});animationId=requestAnimationFrame(frame);}animationId=requestAnimationFrame(frame);window.addEventListener('pagehide',()=>cancelAnimationFrame(animationId));
});
