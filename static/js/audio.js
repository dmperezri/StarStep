"use strict";
/* Música y efectos procedurales adaptados del prototipo Rock & Roll aportado por el equipo. */
window.StarSound=(()=>{
 let ac,master,musicTimer,beat=0,currentUtterance=null,wordCb=null;
 const settings=(()=>{try{return JSON.parse(localStorage.getItem('starstep_audio'))||{};}catch{return {};}})();
 let musicOn=settings.music!==false,fxOn=settings.fx!==false,voiceOn=settings.voice!==false;
 const THEMES={
 title:{b:262,sp:.2,n:[0,7,12,7,4,7,12,16, 0,7,12,7,5,9,12,17],bass:[0,0,5,5]},
 launch:{b:294,sp:.15,n:[0,12,7,12,3,12,7,12, 0,12,7,12,5,12,10,12],bass:[0,0,-2,-2]},
 moon:{b:220,sp:.26,n:[0,3,7,10,7,3,0,-2, 0,3,7,12,10,7,5,3],bass:[0,0,-4,-4]},
 mars:{b:247,sp:.22,n:[0,2,3,7,9,7,3,2, 0,2,5,9,10,9,5,2],bass:[0,0,5,3]},
 storm:{b:147,sp:.42,n:[0,null,1,null,0,null,-1,null],bass:[0,0,0,-1]},
 end:{b:262,sp:.24,n:[0,4,7,11,12,11,7,4, 5,9,12,16,14,12,9,7],bass:[0,0,5,7]}
};
 let activeTheme=null;
 function init(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;try{if(!ac){ac=new AC();master=ac.createGain();master.gain.value=.32;master.connect(ac.destination);}if(ac.state==='suspended')ac.resume().catch(()=>{});return true;}catch{return false;}}
 function tone(freq,dur=.1,delay=0,type='square',vol=.06,slide=0){if(!ac)return;const t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+Math.max(.03,dur));o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.03);}
 function noise(dur=.22,vol=.15){if(!ac)return;const b=ac.createBuffer(1,Math.ceil(ac.sampleRate*dur),ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;const src=ac.createBufferSource(),lp=ac.createBiquadFilter(),gain=ac.createGain();src.buffer=b;lp.type='lowpass';lp.frequency.value=1100;gain.gain.setValueAtTime(vol,ac.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+dur);src.connect(lp);lp.connect(gain);gain.connect(master);src.start();src.stop(ac.currentTime+dur);}
 // Procedural chiptune score and SFX adapted from the supplied Rock & Roll prototype.
 function themeForPage(){const path=window.location?.pathname||'/';if(path==='/marte')return document.querySelector?.('[data-mars-storm]:not([hidden])')?'storm':'mars';if(path==='/luna')return 'moon';if(path==='/vuelo'||path==='/despegue')return 'launch';if(path==='/huellas')return 'end';return 'title';}
 function videoOpen(){return !!document.querySelector?.('.cine-host:not([hidden]) video');}
 function startMusic(name){if(!musicOn||document.hidden||videoOpen()||!init())return;const key=THEMES[name]?name:themeForPage();if(musicTimer&&activeTheme===key)return;stopMusic();activeTheme=key;beat=0;const th=THEMES[key];musicTimer=setInterval(()=>{if(document.hidden||videoOpen()){stopMusic();return;}const next=themeForPage();if(!name&&next!==activeTheme){startMusic();return;}const n=th.n[beat%th.n.length];if(n!==null)tone(th.b*Math.pow(2,n/12),th.sp*.9,.02,'square',.022);if(beat%4===0)tone(th.b/2*Math.pow(2,th.bass[(beat/4|0)%th.bass.length]/12),th.sp*3.6,.02,'triangle',.05);beat++;},th.sp*1000);}
 function stopMusic(){if(musicTimer)clearInterval(musicTimer);musicTimer=null;activeTheme=null;}
 function effect(k){if(!fxOn||document.hidden||videoOpen()||!init())return;switch(k){
 case 'click':case 'button':tone(660,.05,0,'square',.04);break;
 case 'letter':case 'type':tone(880+Math.random()*120,.025,0,'square',.018);break;
 case 'next':tone(520,.06,0,'square',.04,200);break;
 case 'ok':tone(523,.09);tone(659,.09,.09);tone(784,.16,.18);break;
 case 'bad':tone(220,.14,0,'square',.05,-60);tone(180,.18,.12,'square',.05,-40);break;
 case 'pick':tone(784,.07);tone(1175,.12,.07,'square',.05);break;
 case 'jump':tone(300,.05,0,'triangle',.05,250);break;
 case 'crash':noise(.4,.15);tone(120,.3,0,'sawtooth',.06,-80);break;
 case 'beep':case 'count':tone(1400,.09,0,'sine',.06);break;
 case 'badge':case 'success':case 'arrival':[523,659,784,1047].forEach((f,i)=>tone(f,.12,i*.1,'square',.05));break;
 case 'boom':case 'launch':noise(1.2,.18);tone(70,1,0,'sawtooth',.08,-30);break;
 case 'sad':tone(392,.3,0,'triangle',.06);tone(330,.4,.3,'triangle',.06);break;
 case 'bounce':tone(180,.08,0,'triangle',.07,-80);break;
 case 'radio':noise(.15,.1);tone(880,.12,.1,'sine');break;
 case 'travel':[440,554,659,880].forEach((n,i)=>tone(n,.22,i*.12,'triangle',.07));break;
 case 'scan':tone(800,.15);tone(1020,.17,.18);break;
 }}
 function stopVoice(){if('speechSynthesis'in window)window.speechSynthesis.cancel();currentUtterance=null;}
 function speak(text,{lito=false,onStart=()=>{},onEnd=()=>{}}={}){stopVoice();if(!voiceOn||!('speechSynthesis'in window)){onEnd();return;}const u=new SpeechSynthesisUtterance(text);u.lang=(window.StarI18n?.lang||'es')==='en'?'en-US':'es-ES';u.rate=1.16;u.pitch=lito?1.16:1.02;u.volume=.95;const choices=speechSynthesis.getVoices(),voice=choices.find(v=>v.lang.toLowerCase().startsWith(u.lang.slice(0,2).toLowerCase()));if(voice)u.voice=voice;u.onstart=onStart;u.onend=onEnd;u.onerror=onEnd;currentUtterance=u;speechSynthesis.speak(u);}
 function persist(){try{localStorage.setItem('starstep_audio',JSON.stringify({music:musicOn,fx:fxOn,voice:voiceOn}));}catch{}}
 function setMusic(v){musicOn=!!v;musicOn?startMusic():stopMusic();persist();}
 function setVoice(v){voiceOn=!!v;if(!voiceOn)stopVoice();persist();}
 function setFX(v){fxOn=!!v;persist();}
 function stopAll(){stopMusic();stopVoice();}
 // Start mission music only after a player gesture; never over a cinematic.
 const resumeMissionMusic=()=>{if(['/luna','/marte','/vuelo','/huellas'].includes(window.location?.pathname)&&!videoOpen())startMusic();};
 document.addEventListener('pointerdown',resumeMissionMusic,{passive:true});
 document.addEventListener('keydown',resumeMissionMusic);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stopMusic();stopVoice();}});
 return {init,effect,startMusic,stopMusic,stopVoice,stopAll,speak,setMusic,setVoice,setFX,get musicOn(){return musicOn;},get voiceOn(){return voiceOn;},get fxOn(){return fxOn;}};
})();
