"use strict";
document.addEventListener('DOMContentLoaded',()=>{
 const canvas=document.getElementById('world'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 const form=document.getElementById('avatarForm'),grid=document.getElementById('avatarGrid'),alias=document.getElementById('alias'),message=document.getElementById('litoMessage');
 const previous=window.StarProgress.player();let selected=StarArt.avatars.some(x=>x.id===previous.avatar)?previous.avatar:'astronauta';alias.value=previous.alias||'';
 for(const avatar of StarArt.avatars){const b=document.createElement('button');b.type='button';b.className='avatar-card';b.dataset.id=avatar.id;const portrait=document.createElement('canvas');portrait.width=48;portrait.height=48;StarArt.portrait(portrait,avatar.id);const label=document.createElement('span');label.textContent=avatar.name;b.append(portrait,label);b.addEventListener('click',()=>{selected=avatar.id;StarSound.init();StarSound.effect('button');refresh();});grid.append(b);}
 function refresh(){grid.querySelectorAll('button').forEach(b=>{let active=b.dataset.id===selected;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});const name=alias.value.trim()||'cadete';message.textContent=StarI18n.lang==='es'?`¡Listo, cadete ${name}! ¿Elegimos nuestra aventura?`:`Ready, cadet ${name}! Shall we choose our adventure?`;}
 // Alias: se recorta antes de validar y guardar (regla única: StarFlowCore.normalizeAlias).
 // El mensaje propio (ES/EN) reemplaza al genérico del navegador en cualquier caso inválido.
 const aliasErrors={ALIAS_EMPTY:'alias.error.empty',ALIAS_LENGTH:'alias.error.length',ALIAS_CHARS:'alias.error.chars'};
 function checkAlias(){const r=window.StarFlowCore?.normalizeAlias?.(alias.value)??{ok:alias.value.trim().length>=2,alias:alias.value.trim(),code:'ALIAS_LENGTH'};alias.setCustomValidity(r.ok?'':StarI18n.t(aliasErrors[r.code]||'alias.error.chars'));return r;}
 alias.addEventListener('input',()=>{alias.setCustomValidity('');refresh();});refresh();
 document.addEventListener('starstep:language',()=>{if(alias.validity.customError)checkAlias();});
 form.addEventListener('submit',e=>{e.preventDefault();const checked=checkAlias();if(!form.reportValidity())return;alias.value=checked.alias;if(!StarProgress.setPlayer({alias:checked.alias,avatar:selected}))return;window.StarFlow?.recordObjective('profile.alias',{source:'avatar_form',alias:checked.alias});window.StarFlow?.recordObjective('cadet_custom.avatar',{source:'avatar_form',avatar:selected});StarSound.init();StarSound.effect('success');document.querySelector('.curtain').classList.add('is-dark');const next=window.StarFlow?.getEntryPoint().page||document.getElementById('launchDestination').href;setTimeout(()=>location.assign(next),430);});
 function frame(ms){StarArt.earthScene(ctx,ms/1000,{litoState:'happy'});requestAnimationFrame(frame);}requestAnimationFrame(frame);
});
