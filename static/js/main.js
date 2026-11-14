"use strict";
/* Diccionario bilingüe compartido, cargado también en las demás páginas. */
window.StarI18n=(()=>{
 const dict={
  es:{start:'INICIAR AVENTURA',choose:'ELEGIR AVATAR',how:'CÓMO JUGAR',settings:'AJUSTES',journal:'BITÁCORA',continue:'CONTINUAR',transmit:'INICIAR TRANSMISIÓN',menu:'ABRIR MENÚ',alias:'NOMBRE DEL CADETE',launch:'INICIAR AVENTURA',select:'ELIGE TU AVATAR',moon:'ACTO I • LUNA | Misión 1: Detective de lava',back:'← VOLVER',note:'MIS ANOTACIONES',save:'GUARDAR NOTAS',earth:'TIERRA',lang:'ES',speech:[['CONTROL DE MISIÓN','Desde la Tierra te damos la bienvenida a StarStep. Hoy comienza una aventura para descubrir lo que la NASA dejó en otros mundos.'],['CONTROL DE MISIÓN','En la Luna y en Marte hay instrumentos y exploradores que guardan pistas del pasado. Vamos a seguir sus huellas.'],['LITO','¡Hola! Soy LITO, tu compañero espacial. Vamos a elegir tu personaje y prepararnos para viajar a la Luna.']]},
  en:{start:'START ADVENTURE',choose:'CHOOSE AVATAR',how:'HOW TO PLAY',settings:'SETTINGS',journal:'JOURNAL',continue:'CONTINUE',transmit:'START TRANSMISSION',menu:'OPEN MENU',alias:'CADET NAME',launch:'START ADVENTURE',select:'CHOOSE YOUR AVATAR',moon:'ACT I • MOON | Mission 1: Lava Detective',back:'← BACK',note:'MY NOTES',save:'SAVE NOTES',earth:'EARTH',lang:'EN',speech:[['MISSION CONTROL','Welcome to StarStep from Earth. Today you begin an adventure to discover what NASA left behind on other worlds.'],['MISSION CONTROL','On the Moon and Mars, instruments and explorers still hold clues about the past. Let us follow their traces.'],['LITO','Hello! I am LITO, your space companion. Let us choose your character and prepare for our journey to the Moon.']]}
 };
 let lang=localStorage.getItem('starstep_lang')==='en'?'en':'es';
 function t(key){return dict[lang][key]??key;}
 function apply(){document.documentElement.lang=lang;document.querySelectorAll('[data-i18n]').forEach(el=>{const v=t(el.dataset.i18n);if(typeof v==='string')el.textContent=v;});document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));document.dispatchEvent(new CustomEvent('starstep:language',{detail:{lang}}));}
 function setLang(next){if(next!=='es'&&next!=='en')return;lang=next;localStorage.setItem('starstep_lang',lang);apply();}
 document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));apply();});
 return {get lang(){return lang;},t,apply,setLang};
})();

/* El resto solo corre en la portada. */
document.addEventListener('DOMContentLoaded',()=>{
 const canvas=document.getElementById('world');if(!canvas||!document.getElementById('start'))return;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 const $=id=>document.getElementById(id);let step=-1,typingTimer=null,transition=false;
 function typeText(text){clearInterval(typingTimer);const node=$('speechText');node.textContent='';let i=0;typingTimer=setInterval(()=>{i=Math.min(text.length,i+2);node.textContent=text.slice(0,i);if(i%6===0)StarSound.effect('type');if(i>=text.length)clearInterval(typingTimer);},23);}
 function showStep(){const lines=StarI18n.t('speech'),line=lines[step];$('speaker').textContent=line[0];typeText(line[1]);$('start').textContent=step===2?StarI18n.t('menu'):StarI18n.t('continue');StarSound.effect('radio');StarSound.speak(line[1],{lito:step===2,onStart:()=>{window.litoState='talking';},onEnd:()=>{window.litoState='idle';}});}
 function openMenu(){clearInterval(typingTimer);StarSound.stopVoice();$('welcome').hidden=true;$('menu').hidden=false;StarSound.effect('success');}
 $('start').addEventListener('click',()=>{StarSound.init();StarSound.startMusic();step++;if(step<3)showStep();else openMenu();});
 $('skip').addEventListener('click',()=>{StarSound.init();StarSound.startMusic();openMenu();});
 $('how').addEventListener('click',()=>{$('help').hidden=false;$('closeHelp').focus();StarSound.effect('button');});
 $('closeHelp').addEventListener('click',()=>{$('help').hidden=true;$('how').focus();});
 $('music').addEventListener('click',()=>{StarSound.setMusic(!StarSound.musicOn);$('music').textContent=StarSound.musicOn?'♪ ON':'♪ OFF';});
 $('voice').addEventListener('click',()=>{StarSound.setVoice(!StarSound.voiceOn);$('voice').textContent=StarSound.voiceOn?'VOZ ON':'VOZ OFF';});
 document.addEventListener('starstep:language',()=>{if(step>=0&&step<3){clearInterval(typingTimer);StarSound.stopVoice();showStep();}});
 document.querySelectorAll('a[href]').forEach(a=>a.addEventListener('click',ev=>{if(ev.metaKey||ev.ctrlKey||ev.button!==0)return;ev.preventDefault();if(transition)return;transition=true;StarSound.effect('travel');StarSound.stopAll();document.querySelector('.curtain').classList.add('is-dark');setTimeout(()=>location.assign(a.href),430);}));
 function render(ms){StarArt.earthScene(ctx,ms/1000,{litoState:window.litoState||'idle'});requestAnimationFrame(render);}requestAnimationFrame(render);
 window.addEventListener('pagehide',()=>{clearInterval(typingTimer);StarSound.stopAll();});
});
