/* Visor 3D de estaciones y bitácora. Three.js 0.170.0, import map en luna.html y bitacora.html.
   Requiere conexión para el CDN; usa geometrías procedurales si no hay un .glb local. */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const P={gold:0xFFE066,night:0x0E1233,blue:0x4F86D9,cream:0xFFF8E7,gray:0x868CA4,mars:0xD9593A,mint:0x8FF0D8};
const modelUrls={eagle:'/static/assets/models/eagle.glb',easep:'/static/assets/models/easep.glb',reflector:'/static/assets/models/reflector.glb',opportunity:'/static/assets/models/opportunity.glb',blueberries:'/static/assets/models/blueberries.glb'};
const $=(id)=>document.getElementById(id);
let modal,viewport,renderer,scene,camera,controls,root,hotspots=[],raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),animation=0,activeId=null,auto=true,dust=false;
const material=(hex)=>new THREE.MeshStandardMaterial({color:hex,metalness:hex===P.gold?.35:.07,roughness:.84,flatShading:true});
function addBox(group,w,h,d,color,x=0,y=0,z=0){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));mesh.position.set(x,y,z);group.add(mesh);return mesh;}
function addCylinder(group,r1,r2,h,color,x,y,z){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,8),material(color));m.position.set(x,y,z);group.add(m);return m;}
function addRod(group,a,b,r,color){const vec=new THREE.Vector3().subVectors(b,a),mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,vec.length(),6),material(color));mesh.position.copy(a).addScaledVector(vec,.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vec.normalize());group.add(mesh);return mesh;}
function hotspot(group,at,label){const m=new THREE.Mesh(new THREE.SphereGeometry(.105,8,6),new THREE.MeshBasicMaterial({color:P.mint}));m.position.set(...at);m.userData.hotspot=label;group.add(m);hotspots.push(m);}
function makeEagle(g){addBox(g,2,.7,1.5,P.gold,0,.55,0);addBox(g,1.15,.3,1.1,P.cream,0,1.1,0);for(const x of [-1,1])for(const z of [-.75,.75]){addRod(g,new THREE.Vector3(x*.72,.6,z*.7),new THREE.Vector3(x*1.3,.08,z*1.3),.05,P.gray);addCylinder(g,.3,.3,.06,P.gray,x*1.3,.05,z*1.3);}for(let i=0;i<5;i++)addBox(g,.1,.08,.09,P.cream,.48,.65-i*.12,.85);hotspot(g,[0,1.38,0],'Estructura');hotspot(g,[1.4,.2,1.2],'Patas');hotspot(g,[.48,.7,.93],'Escalera');}
function makeEasep(g){addBox(g,1.25,.3,.7,P.gray,0,.45,0);for(const x of [-1,1])addBox(g,1,.08,.62,P.blue,x*1.04,.65,0);addCylinder(g,.055,.055,2,P.cream,0,1.35,0);addBox(g,.34,.32,.36,P.cream,.3,.86,.2);addCylinder(g,.2,.22,1.3,0x6E62CE,-.7,.7,.4);hotspot(g,[0,2.25,0],'Antena');hotspot(g,[-1.4,.85,0],'Panel solar');hotspot(g,[-.7,1.45,.4],'Núcleo de suelo');}
function makeReflector(g){addBox(g,1.55,.25,.3,P.gray,0,.55,0);for(let x=-3;x<=3;x++)for(let y=0;y<2;y++)addCylinder(g,.07,.07,.09,P.cream,x*.2,.75+y*.18,.2);addRod(g,new THREE.Vector3(-.65,.45,0),new THREE.Vector3(-1,0,.65),.045,P.gray);addRod(g,new THREE.Vector3(.65,.45,0),new THREE.Vector3(1,0,.65),.045,P.gray);hotspot(g,[0,1.22,.25],'Prismas');hotspot(g,[0,.4,0],'Soporte');}
function makeOpportunity(g){addBox(g,2.1,.45,1.1,P.gray,0,.6,0);addBox(g,2.85,.1,1.3,dust?0x7A2818:P.blue,0,1,0);for(const x of [-1,.0,1])for(const z of [-.8,.8]){let m=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.12,10),material(0x323548));m.rotation.x=Math.PI/2;m.position.set(x,.29,z);g.add(m);}addRod(g,new THREE.Vector3(.4,.8,0),new THREE.Vector3(.4,2.05,0),.06,P.gray);addBox(g,.5,.24,.33,P.cream,.4,2.17,0);addBox(g,.32,.14,.12,P.blue,.4,2.22,.2);hotspot(g,[.4,2.5,0],'Pancam');hotspot(g,[-1,1.22,.5],'Paneles solares');hotspot(g,[1.05,.43,.8],'Ruedas');}
function makeBlueberries(g){const rock=new THREE.Mesh(new THREE.IcosahedronGeometry(1.3,1),material(P.mars));rock.scale.set(1,.5,.9);g.add(rock);for(let i=0;i<15;i++){const x=Math.sin(i*2.4)*1.03,z=Math.cos(i*2.4)*.75,y=.3+Math.sin(i)*.18;const b=new THREE.Mesh(new THREE.IcosahedronGeometry(.11,1),material(P.blue));b.position.set(x,y,z);g.add(b);}hotspot(g,[.7,.6,.5],'Hematita');}
const makers={eagle:makeEagle,easep:makeEasep,reflector:makeReflector,opportunity:makeOpportunity,blueberries:makeBlueberries};

// Componentes educativos: seleccionados por botones, NO se inventa correspondencia con mallas NASA.
const eagleParts={
  descent:{es:{name:'Etapa de descenso',observed:'La etapa inferior con cuatro patas quedó en Base Tranquilidad.',interpreted:'Sostenía al módulo durante el alunizaje y después sirvió de plataforma de despegue.',story:'Una base inmóvil recuerda dónde comenzó el regreso.'},en:{name:'Descent stage',observed:'The four-legged lower stage remained at Tranquility Base.',interpreted:'It supported the landing and later served as a launch platform.',story:'A stationary base marks where the return journey began.'}},
  legs:{es:{name:'Patas y zapatas',observed:'El módulo lunar tenía cuatro patas con zapatas de apoyo.',interpreted:'Distribuían el peso y ayudaban a estabilizarlo al tocar el suelo.',story:'Cuatro puntos de contacto sobre otro mundo.'},en:{name:'Landing legs and pads',observed:'The lunar module had four legs with landing pads.',interpreted:'They distributed loads and helped stabilize the landing.',story:'Four points of contact on another world.'}},
  ladder:{es:{name:'Escalera',observed:'Una escalera estaba fijada a una de las patas del módulo.',interpreted:'Permitió a Armstrong y Aldrin bajar a la superficie lunar.',story:'Unos peldaños hacia un paso histórico.'},en:{name:'Ladder',observed:'A ladder was attached to one leg of the lunar module.',interpreted:'Armstrong and Aldrin used it to descend to the surface.',story:'A few steps toward a historic first.'}},
  engine:{es:{name:'Motor de descenso',observed:'La etapa inferior alojaba el motor de descenso.',interpreted:'Se utilizó para reducir la velocidad del módulo antes del alunizaje.',story:'El impulso que permitió llegar suavemente.'},en:{name:'Descent engine',observed:'The lower stage housed the descent engine.',interpreted:'It reduced the craft’s speed before touchdown.',story:'The thrust that made a gentle landing possible.'}},
  ascent:{es:{name:'Etapa de ascenso',observed:'La etapa superior se separó de la base al abandonar la Luna.',interpreted:'Transportó a los astronautas de regreso a la órbita lunar para reunirse con Columbia.',story:'La parte que regresó; la base permaneció.',},en:{name:'Ascent stage',observed:'The upper stage separated from the base when departing the Moon.',interpreted:'It carried the astronauts back to lunar orbit to rendezvous with Columbia.',story:'The part that departed; the base remained.'}}
};
const lang=()=>window.StarI18n?.lang==='en'?'en':'es';
const phrase=(es,en)=>lang()==='en'?en:es;
let eagleSelection=null,loadGeneration=0;
function refreshEagleMenu(){
 const menu=$('eagleParts');if(!menu)return;
 menu.hidden=activeId!=='eagle';menu.replaceChildren();
 if(activeId!=='eagle')return;
 const title=document.createElement('p');title.textContent=phrase('EXPLORAR COMPONENTES','EXPLORE COMPONENTS');menu.append(title);
 for(const [key,part] of Object.entries(eagleParts)){
  const b=document.createElement('button');b.type='button';b.className='pixel-button small';b.textContent=part[lang()].name;
  b.setAttribute('aria-pressed',String(eagleSelection===key));
  b.addEventListener('click',()=>selectEaglePart(key));menu.append(b);
 }
}
function selectEaglePart(key){
 const part=eagleParts[key]?.[lang()];if(!part)return;eagleSelection=key;
 $('evidenceObserved').textContent=part.observed;
 $('evidenceInterpreted').textContent=part.interpreted;
 $('evidenceStory').textContent=part.story;
 $('visorStatus').textContent=phrase('Componente: ','Component: ')+part.name;
 $('visorSave').disabled=false;refreshEagleMenu();
}
function saveEagle(){
 if(activeId!=='eagle'||!eagleSelection)return;
 const gained=StarProgress.unlock('eagle');
 if(StarProgress.list().some(x=>x.id==='eagle'))StarProgress.completeAct('luna');
 $('visorStatus').textContent=gained?phrase('★ Descubrimiento guardado en la bitácora','★ Discovery saved to journal'):phrase('Eagle ya está en tu bitácora','Eagle is already in your journal');
 $('visorSave').textContent=phrase('GUARDADO ✓','SAVED ✓');
}

function buildModal(){modal=document.createElement('section');modal.className='visor-modal';modal.id='visorModal';modal.hidden=true;modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Visor holográfico de estación');modal.innerHTML=`<div class="visor-panel"><div class="visor-head"><strong id="visorTitle">VISOR DE ESTACIÓN</strong><button type="button" id="visorClose" class="pixel-button small">X CERRAR</button></div><div class="visor-body"><div id="visorViewport" class="visor-canvas"></div><aside class="visor-side"><p id="visorHelp">Girá, acercá y tocá los puntos luminosos.</p><button id="visorAuto" class="pixel-button small" type="button">ROTACIÓN: ON</button><button id="visorDust" class="pixel-button small" type="button" hidden>POLVO: OFF</button><div id="eagleParts" class="eagle-parts" hidden></div><button id="visorSave" class="pixel-button mint small" type="button" hidden disabled>GUARDAR DESCUBRIMIENTO</button><div class="evidence observed"><b>LO QUE SE VIO</b><p id="evidenceObserved">Seleccioná un punto.</p></div><div class="evidence interpreted"><b>LO QUE INTERPRETAN</b><p id="evidenceInterpreted">Seleccioná un punto.</p></div><div class="evidence narrative"><b>NUESTRA HISTORIA</b><p id="evidenceStory">Seleccioná un punto.</p></div><a id="visorSource" href="#" target="_blank" rel="noopener noreferrer">FUENTE NASA</a><p id="visorStatus" aria-live="polite"></p></aside></div></div>`;document.body.append(modal);viewport=$('visorViewport');$('visorClose').addEventListener('click',close);$('visorAuto').addEventListener('click',()=>{auto=!auto;$('visorAuto').textContent='ROTACIÓN: '+(auto?'ON':'OFF');});$('visorSave').addEventListener('click',saveEagle);$('visorDust').addEventListener('click',()=>{dust=!dust;$('visorDust').textContent='POLVO: '+(dust?'ON':'OFF');if(activeId==='opportunity')loadObject('opportunity');});modal.addEventListener('click',e=>{if(e.target===modal)close();});window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close();});}
function ensureRenderer(){if(renderer)return;scene=new THREE.Scene();scene.background=new THREE.Color(P.night);camera=new THREE.PerspectiveCamera(42,1,.1,100);camera.position.set(4,3.2,5);scene.add(new THREE.AmbientLight(0xffffff,2.1));const light=new THREE.DirectionalLight(0xfff8e7,3);light.position.set(4,8,5);scene.add(light);renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.domElement.style.imageRendering='auto';viewport.append(renderer.domElement);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=2;controls.maxDistance=11;controls.autoRotateSpeed=.6;renderer.domElement.addEventListener('pointerup',onPointer);}
function resize(){if(!renderer||!viewport)return;const w=viewport.clientWidth||450,h=viewport.clientHeight||360;renderer.setSize(Math.max(180,Math.floor(w)),Math.max(150,Math.floor(h)),false);renderer.domElement.style.width='100%';renderer.domElement.style.height='100%';camera.aspect=w/h;camera.updateProjectionMatrix();}
function clearRoot(){if(!root)return;scene.remove(root);root.traverse(o=>{o.geometry?.dispose?.();if(o.material){const all=Array.isArray(o.material)?o.material:[o.material];all.forEach(m=>m.dispose());}});root=null;hotspots=[];}
async function loadObject(id){const generation=++loadGeneration;clearRoot();root=new THREE.Group();scene.add(root);makers[id]?.(root);resize();const u=modelUrls[id];if(!u)return;try{const head=await fetch(u,{method:'HEAD'});if(!head.ok)return;const loader=new GLTFLoader();
    // Cargador Draco opcional: se importa después de inicializar el visor.
    // Así, una falla de red no impide mostrar la alternativa 3D procedimental.
    let draco;
    try {
      const module=await import('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/DRACOLoader.js');
      draco=new module.DRACOLoader();
      draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
      loader.setDRACOLoader(draco);
    } catch(error) {
      console.warn('Decodificador Draco no disponible (se muestra Eagle 3D básico):',error);
      if($('visorStatus'))$('visorStatus').textContent='Modo 3D básico: falta el decodificador Draco (revisá conexión).';
      return;
    }
    const loaded=await loader.loadAsync(u);if(id!==activeId||!root||generation!==loadGeneration)return;const item=loaded.scene;const box=new THREE.Box3().setFromObject(item);const s=box.getSize(new THREE.Vector3()),max=Math.max(s.x,s.y,s.z)||1;item.scale.setScalar(2.8/max);item.position.sub(box.getCenter(new THREE.Vector3()).multiplyScalar(2.8/max));// El GLB oficial sustituye (no se superpone) a la maqueta provisional.
    for(const child of [...root.children]){root.remove(child);child.traverse(o=>{o.geometry?.dispose?.();if(o.material){for(const m of (Array.isArray(o.material)?o.material:[o.material]))m.dispose();}});}
    hotspots=[];
    root.add(item);$('visorStatus').textContent=id==='eagle'?phrase('Modelo NASA cargado · elegí un componente','NASA model loaded · select a component'):'Modelo oficial GLB cargado';}catch(e){console.warn('No se pudo cargar GLB; se conserva el modelo procedural:',id,e);if($('visorStatus'))$('visorStatus').textContent='Modelo 3D alternativo: no se pudo cargar el GLB.';}}
function showEvidence(label){if(activeId==='eagle')return;const a=StarProgress.catalog[activeId];if(!a)return;$('evidenceObserved').textContent=a.observed;$('evidenceInterpreted').textContent=a.interpreted;$('evidenceStory').textContent=`${label}: ${a.narrative}`;$('visorSource').href=a.source;const gained=StarProgress.unlock(activeId);if(activeId==='eagle'||activeId==='easep'||activeId==='reflector')StarProgress.completeAct('luna');if(['opportunity','blueberries'].every(x=>StarProgress.list().some(y=>y.id===x)))StarProgress.completeAct('marte');$('visorStatus').textContent=gained?'★ NUEVO DESCUBRIMIENTO GUARDADO':'Ya estaba en tu colección';window.StarSound?.effect('scan');}
function onPointer(e){if(modal.hidden||!hotspots.length)return;const box=renderer.domElement.getBoundingClientRect();pointer.x=(e.clientX-box.left)/box.width*2-1;pointer.y=-(e.clientY-box.top)/box.height*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(hotspots);if(hits.length)showEvidence(hits[0].object.userData.hotspot);}
function animate(){if(modal.hidden){animation=0;return;}controls.autoRotate=auto;controls.update();renderer.render(scene,camera);animation=requestAnimationFrame(animate);}
function open(id){if(!StarProgress.catalog[id])return;activeId=id;eagleSelection=null;if(!modal)buildModal();modal.hidden=false;ensureRenderer();$('visorTitle').textContent=StarProgress.catalog[id].name;$('visorDust').hidden=id!=='opportunity';$('visorHelp').textContent='Arrastrá para girar · rueda/pellizco para zoom · tocá puntos menta';$('evidenceObserved').textContent='Seleccioná un hotspot luminoso';$('evidenceInterpreted').textContent='Seleccioná un hotspot luminoso';$('evidenceStory').textContent='LITO te contará la historia';$('visorStatus').textContent='';$('visorSource').href=StarProgress.catalog[id].source;$('visorSave').hidden=id!=='eagle';$('visorSave').disabled=true;$('visorSave').textContent=phrase('GUARDAR DESCUBRIMIENTO','SAVE DISCOVERY');refreshEagleMenu();loadObject(id);cancelAnimationFrame(animation);animate();$('visorClose').focus();}
function close(){if(!modal)return;++loadGeneration;modal.hidden=true;cancelAnimationFrame(animation);animation=0;window.StarSound?.stopVoice();}
window.StarVisor={open,close};
// Los eventos de inspección los recibe visor-fallback.js, que importa este módulo una sola vez.
window.addEventListener('resize',resize);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&modal&&!modal.hidden)close();});

document.addEventListener('starstep:language',()=>{if(!modal||modal.hidden)return;refreshEagleMenu();if(activeId==='eagle'){$('visorSave').textContent=StarProgress.list().some(x=>x.id==='eagle')?phrase('GUARDADO ✓','SAVED ✓'):phrase('GUARDAR DESCUBRIMIENTO','SAVE DISCOVERY');if(eagleSelection)selectEaglePart(eagleSelection);}});
