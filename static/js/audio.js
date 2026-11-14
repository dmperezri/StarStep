"use strict";
/* Música original procedural. Activa audio solo tras un gesto del usuario. */
window.StarSound=(()=>{
 let ac,master,musicTimer,beat=0,currentUtterance=null,wordCb=null;
 const settings=(()=>{try{return JSON.parse(localStorage.getItem('starstep_audio'))||{};}catch{return {};}})();
 let musicOn=settings.music!==false,fxOn=settings.fx!==false,voiceOn=settings.voice!==false;
 const theme=[392,493.88,587.33,493.88,440,523.25,659.25,523.25,392,493.88,587.33,783.99,698.46,587.33,523.25,440];
 function init(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;if(!ac){ac=new AC();master=ac.createGain();master.gain.value=.18;master.connect(ac.destination);}if(ac.state==='suspended')ac.resume().catch(()=>{});return true;}
 function tone(freq,dur=.1,delay=0,type='square',vol=.13){if(!ac)return;const t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+Math.max(.03,dur));o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.03);}
 function noise(dur=.22,vol=.15){if(!ac)return;const b=ac.createBuffer(1,Math.ceil(ac.sampleRate*dur),ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;const src=ac.createBufferSource(),lp=ac.createBiquadFilter(),gain=ac.createGain();src.buffer=b;lp.type='lowpass';lp.frequency.value=1100;gain.gain.setValueAtTime(vol,ac.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+dur);src.connect(lp);lp.connect(gain);gain.connect(master);src.start();src.stop(ac.currentTime+dur);}
 function startMusic(){if(!musicOn||!init()||musicTimer)return;musicTimer=setInterval(()=>{const n=theme[beat%theme.length];tone(n,.14,0,'square',.08);if(beat%4===0)tone(n/4,.3,0,'triangle',.15);beat++;},215);}
 function stopMusic(){if(musicTimer)clearInterval(musicTimer);musicTimer=null;}
 function effect(k){if(!fxOn||!init())return;switch(k){case'button':tone(660,.06);break;case'type':tone(650,.025,0,'square',.025);break;case'radio':noise(.15,.1);tone(880,.12,.1,'sine');break;case'count':tone(440,.16);break;case'launch':noise(1.9,.18);for(let i=0;i<9;i++)tone(100+i*34,.33,i*.13,'sawtooth',.08);break;case'travel':[440,554,659,880].forEach((n,i)=>tone(n,.22,i*.12,'triangle',.13));break;case'success':case'arrival':[523,659,784,1046].forEach((n,i)=>tone(n,.21,i*.11));break;case'scan':tone(800,.15);tone(1020,.17,.18);break;}}
 function stopVoice(){if('speechSynthesis'in window)window.speechSynthesis.cancel();currentUtterance=null;}
 function speak(text,{lito=false,onStart=()=>{},onEnd=()=>{}}={}){stopVoice();if(!voiceOn||!('speechSynthesis'in window)){onEnd();return;}const u=new SpeechSynthesisUtterance(text);u.lang=(window.StarI18n?.lang||'es')==='en'?'en-US':'es-ES';u.rate=1.16;u.pitch=lito?1.16:1.02;u.volume=.95;const choices=speechSynthesis.getVoices(),voice=choices.find(v=>v.lang.toLowerCase().startsWith(u.lang.slice(0,2).toLowerCase()));if(voice)u.voice=voice;u.onstart=onStart;u.onend=onEnd;u.onerror=onEnd;currentUtterance=u;speechSynthesis.speak(u);}
 function persist(){try{localStorage.setItem('starstep_audio',JSON.stringify({music:musicOn,fx:fxOn,voice:voiceOn}));}catch{}}
 function setMusic(v){musicOn=!!v;musicOn?startMusic():stopMusic();persist();}
 function setVoice(v){voiceOn=!!v;if(!voiceOn)stopVoice();persist();}
 function setFX(v){fxOn=!!v;persist();}
 function stopAll(){stopMusic();stopVoice();}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stopMusic();stopVoice();}});
 return {init,effect,startMusic,stopMusic,stopVoice,stopAll,speak,setMusic,setVoice,setFX,get musicOn(){return musicOn;},get voiceOn(){return voiceOn;},get fxOn(){return fxOn;}};
})();
