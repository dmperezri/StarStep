"use strict";
(function(){
 const base="/static/assets/evidencias/";
 const items={
 basalt:["artefactos/basalt10057.jpg","Basalto lunar 10057,0.","Lunar basalt 10057,0.","NASA · S69-46287"],
 plaque:["artefactos/plaque.jpg","Placa conmemorativa.","Commemorative plaque.","NASA · AS11-40-5899"],
 flag:["artefactos/flag.jpg","Bandera lunar.","Lunar flag.","NASA · AS11-37-5545"],
 route:["artefactos/route.jpg","Ruta de Opportunity.","Opportunity’s route.","NASA/JPL-Caltech/MSSS · PIA23178"],
 footprint:["huella.webp","Huella de Aldrin en el regolito del Mar de la Tranquilidad.","Aldrin’s footprint in the regolith of the Sea of Tranquility.","NASA · AS11-40-5880"],
 ascent:["eagle-acoplamiento.webp","La etapa de ascenso del Eagle se acerca a Columbia, con la Tierra al fondo.","Eagle’s ascent stage approaches Columbia, with Earth in the background.","NASA · AS11-44-6642"],
 easep:["a3_easep.jpg","Aldrin descarga el sismómetro pasivo del EASEP.","Aldrin unloads the EASEP passive seismometer.","NASA · AS11-40-5931"],
 reflector:["a4_lrrr.jpg","Retrorreflector láser de Base Tranquilidad.","Laser retroreflector at Tranquility Base.","NASA NSSDCA · 1969-059C-04"],
 lander:["o1_lionking.jpg","Panorámica «Lion King»: plataforma de aterrizaje en el cráter Eagle.","“Lion King” panorama: landing platform in Eagle Crater.","NASA/JPL/Cornell · PIA05755"],
 hematite:["hematita.webp","Esférulas de hematita cerca del cráter Fram, abril de 2004. Área de 3 cm.","Hematite spherules near Fram Crater, April 2004. Area 3 cm across.","NASA/JPL-Caltech/Cornell/USGS"],
 gypsum:["o3_homestake.jpg","Aproximación de Opportunity a Homestake.","Opportunity’s approach to Homestake.","NASA/JPL-Caltech"],
 clay:["o4_esperance.jpg","Roca clara Esperance, borde del cráter Endeavour.","Pale Esperance rock, Endeavour Crater rim.","NASA/JPL-Caltech"],
 storm:["ultima-imagen.webp","Últimas imágenes de Opportunity, 10 de junio de 2018. Opacidad τ 10,8.","Opportunity’s final images, June 10, 2018. Opacity τ 10.8.","NASA/JPL-Caltech/Cornell/ASU · PIA22930"],
 separation:["a1_eagle_sep.jpg","Eagle se separa de Columbia.","Eagle separates from Columbia.","NASA · AS11-44-6574"],
 rover:["o5_autorretrato.jpg","Autorretrato de Opportunity, marzo de 2014.","Opportunity self-portrait, March 2014.","NASA/JPL-Caltech/Cornell/ASU"],
 shadow:["o6_sombra.jpg","Sombra de Opportunity sobre Marte.","Opportunity’s shadow on Mars.","NASA/JPL-Caltech"],
 mars:["o7_marte.jpg","Marte desde órbita: Mars Global Surveyor.","Mars from orbit: Mars Global Surveyor.","NASA · Mars Global Surveyor"]
 };
 const artifactPhoto={eagle:"separation",easep:"easep",reflector:"reflector",opportunity:"rover",blueberries:"hematite",lander:"lander",plaque:"plaque",basalt10057:"basalt",gypsum:"gypsum",clay:"clay"};
 const en=()=>window.StarI18n?.lang==='en';
 const el=(tag,klass,txt)=>{const e=document.createElement(tag);if(klass)e.className=klass;if(txt!==undefined)e.textContent=txt;return e;};
 function figure(id,{dismiss=false}={}){const data=items[id];if(!data)return null;const f=el('figure','evidence-photo');f.dataset.evidence=id;
  const im=el('img');im.src=base+data[0];im.loading='lazy';const c=el('figcaption');const tx=el('span','evidence-caption');const tag=el('strong','evidence-observed');const credit=el('small','evidence-credit',data[3]);c.append(tx,tag,credit);f.append(im,c);
  if(dismiss){const b=el('button','evidence-dismiss','×');b.type='button';b.setAttribute('aria-label',en()?'Close photograph':'Cerrar fotografía');b.addEventListener('click',()=>{f.hidden=true;});f.append(b);}
  function render(){im.alt=data[en()?2:1];tx.textContent=im.alt;tag.textContent=en()?'OBSERVED · Real photo':'OBSERVADO · Foto real';}
  render();return f;
 }
 function render(){document.querySelectorAll('.evidence-photo').forEach(f=>{const d=items[f.dataset.evidence];if(!d)return;const caption=f.querySelector('.evidence-caption'),im=f.querySelector('img'),tag=f.querySelector('.evidence-observed');if(caption)caption.textContent=d[en()?2:1];if(im)im.alt=d[en()?2:1];if(tag)tag.textContent=en()?'OBSERVED · Real photo':'OBSERVADO · Foto real';});const h=document.getElementById('evidenceGalleryTitle');if(h)h.textContent=en()?'Historical photographs':'Fotografías reales';const b=document.getElementById('openEvidenceGallery');if(b)b.textContent=en()?'REAL PHOTOS':'FOTOS REALES'; }
 function init(){const moon=document.getElementById('moonEvidenceHost');if(moon){const f=figure('footprint',{dismiss:true});if(f)moon.append(f);}
 const gallery=document.getElementById('evidenceGallery');if(gallery){for(const id of ['separation','footprint','plaque','flag','basalt','easep','reflector','ascent','lander','hematite','gypsum','clay','rover','shadow','mars','route','storm']){const f=figure(id);if(f)gallery.append(f);}}
 render();}
 document.addEventListener('DOMContentLoaded',init);document.addEventListener('starstep:language',render);
 window.StarEvidenceVisual=Object.freeze({figure,items,artifactFigure(id){return figure(artifactPhoto[id]);}});
})();
