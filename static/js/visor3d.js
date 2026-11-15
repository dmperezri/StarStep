/* Visor 3D de estaciones y bitácora. Three.js 0.170.0, import map en luna.html y bitacora.html.
   Usa el GLB local. Eagle exige KHR_draco_mesh_compression: primero intenta DRACOLoader y el
   decodificador locales (static/vendor) y, si no están, los de la CDN (misma versión 0.170.0).
   Sin WebGL, sin red o con un error de carga queda el modelo procedural con sus puntos. */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const P={gold:0xFFE066,night:0x0E1233,blue:0x4F86D9,cream:0xFFF8E7,gray:0x868CA4,mars:0xD9593A,mint:0x8FF0D8};
const modelUrls={eagle:'/static/assets/models/eagle.glb',easep:'/static/assets/models/easep.glb',reflector:'/static/assets/models/reflector.glb',opportunity:'/static/assets/models/opportunity.glb',blueberries:'/static/assets/models/blueberries.glb'};
const $=(id)=>document.getElementById(id);
let modal,viewport,renderer,scene,camera,controls,root,hotspots=[],raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),animation=0,activeId=null,activeContext='journal',auto=true,dust=false,officialEagle=null,selectedMesh=null,previousMaterial=null,pointerStart=null;
const material=(hex)=>new THREE.MeshStandardMaterial({color:hex,metalness:hex===P.gold?.35:.07,roughness:.84,flatShading:true});
function addBox(group,w,h,d,color,x=0,y=0,z=0){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));mesh.position.set(x,y,z);group.add(mesh);return mesh;}
function addCylinder(group,r1,r2,h,color,x,y,z){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,8),material(color));m.position.set(x,y,z);group.add(m);return m;}
function addRod(group,a,b,r,color){const vec=new THREE.Vector3().subVectors(b,a),mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,vec.length(),6),material(color));mesh.position.copy(a).addScaledVector(vec,.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vec.normalize());group.add(mesh);return mesh;}
// Cada punto menta corresponde a un componente estable de flujo-definicion.js.
function hotspot(group,at,component){const m=new THREE.Mesh(new THREE.SphereGeometry(.105,8,6),new THREE.MeshBasicMaterial({color:P.mint}));m.position.set(...at);m.userData.component=component;group.add(m);hotspots.push(m);}
function makeEagle(g){addBox(g,2,.7,1.5,P.gold,0,.55,0);addBox(g,1.15,.3,1.1,P.cream,0,1.1,0);for(const x of [-1,1])for(const z of [-.75,.75]){addRod(g,new THREE.Vector3(x*.72,.6,z*.7),new THREE.Vector3(x*1.3,.08,z*1.3),.05,P.gray);addCylinder(g,.3,.3,.06,P.gray,x*1.3,.05,z*1.3);}for(let i=0;i<5;i++)addBox(g,.1,.08,.09,P.cream,.48,.65-i*.12,.85);hotspot(g,[0,1.38,0],'structure');hotspot(g,[1.4,.2,1.2],'legs');hotspot(g,[.48,.7,.93],'ladder');}
function makeEasep(g){addBox(g,1.25,.3,.7,P.gray,0,.45,0);for(const x of [-1,1])addBox(g,1,.08,.62,P.blue,x*1.04,.65,0);addCylinder(g,.055,.055,2,P.cream,0,1.35,0);addBox(g,.34,.32,.36,P.cream,.3,.86,.2);addCylinder(g,.2,.22,1.3,0x6E62CE,-.7,.7,.4);hotspot(g,[0,2.25,0],'antenna');hotspot(g,[-1.4,.85,0],'solar_panel');hotspot(g,[-.7,1.45,.4],'seismometer');}
function makeReflector(g){addBox(g,1.55,.25,.3,P.gray,0,.55,0);for(let x=-3;x<=3;x++)for(let y=0;y<2;y++)addCylinder(g,.07,.07,.09,P.cream,x*.2,.75+y*.18,.2);addRod(g,new THREE.Vector3(-.65,.45,0),new THREE.Vector3(-1,0,.65),.045,P.gray);addRod(g,new THREE.Vector3(.65,.45,0),new THREE.Vector3(1,0,.65),.045,P.gray);hotspot(g,[0,1.22,.25],'prisms');hotspot(g,[0,.4,0],'support');}
function makeOpportunity(g){addBox(g,2.1,.45,1.1,P.gray,0,.6,0);addBox(g,2.85,.1,1.3,dust?0x7A2818:P.blue,0,1,0);for(const x of [-1,.0,1])for(const z of [-.8,.8]){let m=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.12,10),material(0x323548));m.rotation.x=Math.PI/2;m.position.set(x,.29,z);g.add(m);}addRod(g,new THREE.Vector3(.4,.8,0),new THREE.Vector3(.4,2.05,0),.06,P.gray);addBox(g,.5,.24,.33,P.cream,.4,2.17,0);addBox(g,.32,.14,.12,P.blue,.4,2.22,.2);hotspot(g,[.4,2.5,0],'pancam');hotspot(g,[-1,1.22,.5],'solar_panels');hotspot(g,[1.05,.43,.8],'wheels');}
function makeBlueberries(g){const rock=new THREE.Mesh(new THREE.IcosahedronGeometry(1.3,1),material(P.mars));rock.scale.set(1,.5,.9);g.add(rock);for(let i=0;i<15;i++){const x=Math.sin(i*2.4)*1.03,z=Math.cos(i*2.4)*.75,y=.3+Math.sin(i)*.18;const b=new THREE.Mesh(new THREE.IcosahedronGeometry(.11,1),material(P.blue));b.position.set(x,y,z);g.add(b);}hotspot(g,[.7,.6,.5],'hematite');}
const makers={eagle:makeEagle,easep:makeEasep,reflector:makeReflector,opportunity:makeOpportunity,blueberries:makeBlueberries};
function buildModal(){modal=document.createElement('section');modal.className='visor-modal';modal.id='visorModal';modal.hidden=true;modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Visor holográfico de estación');modal.innerHTML=`<div class="visor-panel"><div class="visor-head"><strong id="visorTitle">VISOR DE ESTACIÓN</strong><button type="button" id="visorClose" class="pixel-button small">X CERRAR</button></div><div class="visor-body"><div id="visorViewport" class="visor-canvas"></div><aside class="visor-side"><p id="visorHelp">Girá, acercá y tocá los puntos luminosos.</p><button id="visorAuto" class="pixel-button small" type="button">ROTACIÓN: ON</button><button id="visorDust" class="pixel-button small" type="button" hidden>POLVO: OFF</button><div class="evidence observed"><b>LO QUE SE VIO</b><p id="evidenceObserved">Seleccioná un punto.</p></div><div class="evidence interpreted"><b>LO QUE INTERPRETAN</b><p id="evidenceInterpreted">Seleccioná un punto.</p></div><div class="evidence narrative"><b>NUESTRA HISTORIA</b><p id="evidenceStory">Seleccioná un punto.</p></div><a id="visorSource" href="#" target="_blank" rel="noopener noreferrer">FUENTE NASA</a><p id="visorStatus" aria-live="polite"></p></aside></div></div>`;document.body.append(modal);viewport=$('visorViewport');$('visorClose').addEventListener('click',close);$('visorAuto').addEventListener('click',()=>{auto=!auto;$('visorAuto').textContent='ROTACIÓN: '+(auto?'ON':'OFF');});$('visorDust').addEventListener('click',()=>{dust=!dust;$('visorDust').textContent='POLVO: '+(dust?'ON':'OFF');if(activeId==='opportunity')loadObject('opportunity');});modal.addEventListener('click',e=>{if(e.target===modal)close();});window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close();});}
function ensureRenderer(){if(renderer)return;scene=new THREE.Scene();scene.background=new THREE.Color(P.night);camera=new THREE.PerspectiveCamera(42,1,.1,100);camera.position.set(4,3.2,5);scene.add(new THREE.AmbientLight(0xffffff,2.1));const light=new THREE.DirectionalLight(0xfff8e7,3);light.position.set(4,8,5);scene.add(light);renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.domElement.style.imageRendering='auto';viewport.append(renderer.domElement);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=2;controls.maxDistance=11;controls.autoRotateSpeed=.6;renderer.domElement.addEventListener('pointerdown',e=>{pointerStart={x:e.clientX,y:e.clientY};});renderer.domElement.addEventListener('pointerup',onPointer);renderer.domElement.style.cursor='grab';}
function resize(){if(!renderer||!viewport)return;const w=viewport.clientWidth||450,h=viewport.clientHeight||360;renderer.setSize(w,h,false);renderer.domElement.style.width='100%';renderer.domElement.style.height='100%';camera.aspect=w/h;camera.updateProjectionMatrix();}
function clearRoot(){resetSelection();officialEagle=null;if(!root)return;scene.remove(root);root.traverse(o=>{o.geometry?.dispose?.();if(o.material){const all=Array.isArray(o.material)?o.material:[o.material];all.forEach(m=>m.dispose());}});root=null;hotspots=[];}
// NASA Eagle requires KHR_draco_mesh_compression. Load the decoder only when needed,
// preferring local copies (integración: «priorizar dependencias locales»).
const DRACO={
  localLoader:'/static/vendor/three/examples/jsm/loaders/DRACOLoader.js',
  localDecoder:'/static/vendor/draco/',
  remoteLoader:'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/DRACOLoader.js',
  remoteDecoder:'https://www.gstatic.com/draco/versioned/decoders/1.5.7/'
};
let dracoModulePromise;
async function localAvailable(url){try{return (await fetch(url,{method:'HEAD'})).ok;}catch{return false;}}
function dracoSources(){
  if(!dracoModulePromise){
    dracoModulePromise=(async()=>{
      let module=null,loaderSource='remote';
      if(await localAvailable(DRACO.localLoader)){
        try{module=await import(DRACO.localLoader);loaderSource='local';}catch{module=null;}
      }
      if(!module)module=await import(DRACO.remoteLoader);
      const decoder=await localAvailable(DRACO.localDecoder+'draco_wasm_wrapper.js')?DRACO.localDecoder:DRACO.remoteDecoder;
      return {DRACOLoader:module.DRACOLoader,decoder,loaderSource};
    })().catch(error=>{dracoModulePromise=null;throw error;});   // sin red: se reintenta al reabrir
  }
  return dracoModulePromise;
}
async function officialLoader(){
  const loader=new GLTFLoader();
  const {DRACOLoader,decoder}=await dracoSources();
  const draco=new DRACOLoader();
  draco.setDecoderPath(decoder);
  draco.setDecoderConfig({type:'wasm'});
  loader.setDRACOLoader(draco);
  return loader;
}
// Los marcadores del Eagle original se fijan sobre la superficie del GLB,
// no en las coordenadas del modelo provisional de baja resolucion.
function placeOfficialEagleMarkers(item, group){
  // No modificar el mesh ni materiales NASA: solo reemplazamos los indicadores.
  for(const marker of hotspots){
    marker.parent?.remove(marker);
    marker.geometry?.dispose();
    marker.material?.dispose();
  }
  hotspots=[];
  item.updateWorldMatrix(true,true);
  const box=new THREE.Box3().setFromObject(item);
  const size=box.getSize(new THREE.Vector3());
  const center=box.getCenter(new THREE.Vector3());
  const ray=new THREE.Raycaster();
  const specs=[
    // Posiciones relativas aproximadas para buscar la superficie visible.
    {component:'structure',x:0,y:.22},
    {component:'legs',x:.31,y:-.37},
    {component:'ladder',x:0,y:-.17}
  ];
  const surfaceOffset=Math.max(.035,Math.min(.065,size.length()*.012));
  const radius=Math.max(.045,Math.min(.075,size.length()*.016));
  for(const spec of specs){
    const target=center.clone().add(new THREE.Vector3(spec.x*size.x,spec.y*size.y,0));
    // Apuntar desde la camara hacia la zona de cada componente garantiza
    // que los puntos aparezcan sobre el objeto y no flotando fuera de el.
    const direction=target.clone().sub(camera.position).normalize();
    ray.set(camera.position,direction);
    let hits=ray.intersectObject(item,true).filter(h=>h.object.isMesh);
    if(!hits.length){
      // Intentar ligeramente hacia el centro cuando el objetivo cae entre patas.
      const middle=target.clone().lerp(center,.55);
      ray.set(camera.position,middle.sub(camera.position).normalize());
      hits=ray.intersectObject(item,true).filter(h=>h.object.isMesh);
    }
    if(!hits.length){
      console.warn('[StarStep 3D] No surface point for',spec.component);
      continue;
    }
    const hit=hits[0];
    const marker=new THREE.Mesh(
      new THREE.SphereGeometry(radius,12,8),
      new THREE.MeshBasicMaterial({color:P.mint})
    );
    marker.position.copy(hit.point).addScaledVector(direction,-surfaceOffset);
    marker.userData.component=spec.component;
    group.add(marker);
    hotspots.push(marker);
  }
}
async function loadObject(id){
  clearRoot();
  root=new THREE.Group();
  const target=root;
  scene.add(root);
  makers[id]?.(root);
  resize();
  const url=modelUrls[id];
  if(!url)return;
  const status=$('visorStatus');
  try{
    // GET is done by GLTFLoader itself: no HEAD dependency.
    status.textContent=StarI18n?.lang==='en'?'Loading official NASA model…':'Cargando modelo oficial NASA…';
    const loader=await officialLoader();
    const gltf=await loader.loadAsync(url);
    if(id!==activeId||root!==target||modal?.hidden)return;
    const item=gltf.scene;
    // Remove only the low-poly meshes. Keep educational interaction markers.
    const markers=new Set(hotspots);
    for(const child of [...target.children]){
      if(markers.has(child)) continue;
      target.remove(child);
      child.traverse(o=>{
        o.geometry?.dispose?.();
        const mats=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];
        mats.forEach(m=>m.dispose?.());
      });
    }
    const box=new THREE.Box3().setFromObject(item);
    const size=box.getSize(new THREE.Vector3());
    const max=Math.max(size.x,size.y,size.z)||1;
    const scale=2.8/max;
    const center=box.getCenter(new THREE.Vector3());
    item.scale.setScalar(scale);
    item.position.copy(center.multiplyScalar(-scale));
    target.add(item);
    if(id==='eagle'){
      // Select the NASA geometry directly, never floating proxy markers.
      for(const marker of [...hotspots]){marker.parent?.remove(marker);marker.geometry?.dispose();marker.material?.dispose();}
      hotspots=[];officialEagle=item;
      $('visorHelp').textContent=StarI18n?.lang==='en'?'Click a physical part of Eagle (structure, legs or ladder). Drag to rotate; scroll to zoom.':'Hacé clic directamente sobre una pieza de Eagle (estructura, patas o escalera). Arrastrá para girar; rueda para zoom.';
    }
    status.textContent=StarI18n?.lang==='en'?'Official NASA GLB loaded':'Modelo oficial NASA GLB cargado';
  }catch(error){
    console.error('[StarStep 3D] NASA model failed:',url,error);
    if(root===target && !modal?.hidden){
      status.textContent=(StarI18n?.lang==='en'?'NASA 3D unavailable; showing simplified model. ':'No se pudo cargar NASA 3D; se muestra modelo simplificado. ')+(error?.message||'');
    }
  }
}
// El hotspot solo informa a StarFlow; el registro ocurre cuando la inspección está completa.
function showEvidence(component){const a=StarProgress.catalog[activeId];if(!a)return;const fact=k=>window.StarScience?.facts?.[activeId]?.[StarI18n.lang]?.[k]||a[k];$('evidenceObserved').textContent=fact('observed');$('evidenceInterpreted').textContent=fact('interpreted');$('evidenceStory').textContent=`${StarI18n.t(`component.${activeId}.${component}`)}: ${fact('narrative')}`;$('visorSource').href=a.source;const result=window.StarFlow?StarFlow.inspectComponent(activeId,component,{context:activeContext,viewer:'3d'}):{ok:false,code:'FLOW_UNAVAILABLE'};$('visorStatus').textContent=window.StarViewerStatus?.(result)||'';window.StarSound?.effect('scan');}
// Clasificacion de zonas del GLB NASA: los nombres de sus mallas no describen
// las piezas. La seleccion se calcula a partir del punto real de interseccion.
// Es aproximada y puede calibrarse luego con una version etiquetada en Blender.
// Calibración (integración), medida sobre eagle.glb sin modificarlo: la escalera está al
// frente y centrada (x≈0.46–0.55, y≈0.10–0.52, z hasta 0.93). La zona lateral anterior
// (x<.28 o x>.72) nunca la alcanzaba y Eagle no podía registrarse con el modelo oficial.
// Peldaños y largueros comparten malla con las patas (group31_15/16), así que se reconocen
// por zona: el frente del cuerpo llega a z≈0.83, la escalera pasa de 0.84. El porche y sus
// pasamanos sí tienen mallas propias.
const EAGLE_LADDER_MESHES=new Set(['polySurfa1','pCube3','pCylinde11','pCylinder2']);
const EAGLE_LEG_MESH=/^group31_1[56](_|$)/;
function eagleComponent(hit){
  const name=hit.object?.name||'';
  const bounds=new THREE.Box3().setFromObject(officialEagle);
  const size=bounds.getSize(new THREE.Vector3());
  const local=hit.point.clone().sub(bounds.min);
  const y=local.y/(size.y||1);
  const x=local.x/(size.x||1);
  const z=local.z/(size.z||1);
  if(EAGLE_LADDER_MESHES.has(name))return 'ladder';
  if(y>=.08 && y<.56 && x>.42 && x<.58 && z>.84)return 'ladder';
  // Por debajo del cuerpo principal predominan patas, zapatas y puntales.
  if(EAGLE_LEG_MESH.test(name) || y<.30)return 'legs';
  return 'structure';
}
function resetSelection(){
  if(selectedMesh&&previousMaterial){
    const assigned=selectedMesh.material;
    selectedMesh.material=previousMaterial;
    const temp=Array.isArray(assigned)?assigned:[assigned];
    temp.forEach(m=>m?.dispose?.());
  }
  selectedMesh=null;previousMaterial=null;
}
function highlightMesh(mesh){
  resetSelection();
  if(!mesh?.material)return;
  selectedMesh=mesh;
  previousMaterial=mesh.material;
  const cloned=(Array.isArray(mesh.material)?mesh.material:[mesh.material]).map(m=>{
    const copy=m.clone();
    if(copy.emissive){copy.emissive.setHex(0x28b8a5);copy.emissiveIntensity=.38;}
    return copy;
  });
  mesh.material=Array.isArray(previousMaterial)?cloned:cloned[0];
}
function onPointer(e){
  if(modal?.hidden || !renderer)return;
  if(pointerStart && Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>7)return;
  const box=renderer.domElement.getBoundingClientRect();
  pointer.x=(e.clientX-box.left)/box.width*2-1;
  pointer.y=-(e.clientY-box.top)/box.height*2+1;
  raycaster.setFromCamera(pointer,camera);
  if(activeId==='eagle' && officialEagle){
    const hits=raycaster.intersectObject(officialEagle,true).filter(h=>h.object.isMesh);
    if(!hits.length)return;
    const hit=hits[0];
    const component=eagleComponent(hit);
    highlightMesh(hit.object);
    showEvidence(component);
    return;
  }
  const hits=raycaster.intersectObjects(hotspots);
  if(hits.length)showEvidence(hits[0].object.userData.component);
}
function animate(){if(modal.hidden){animation=0;return;}controls.autoRotate=auto;controls.update();renderer.render(scene,camera);animation=requestAnimationFrame(animate);}
function open(id,options={}){if(!StarProgress.catalog[id])return;activeId=id;activeContext=options.context==='mission'?'mission':'journal';if(!modal)buildModal();modal.hidden=false;ensureRenderer();$('visorTitle').textContent=StarProgress.catalog[id].name;$('visorDust').hidden=id!=='opportunity';$('visorHelp').textContent=StarI18n?.lang==='en'?'Drag to rotate · scroll to zoom · select a component':'Arrastrá para girar · rueda para zoom · seleccioná un componente';$('evidenceObserved').textContent='Seleccioná un hotspot luminoso';$('evidenceInterpreted').textContent='Seleccioná un hotspot luminoso';$('evidenceStory').textContent='LITO te contará la historia';$('visorStatus').textContent=window.StarViewerStatus?.({ok:true,mode:activeContext==='journal'?'consult':'start'})||'';$('visorSource').href=StarProgress.catalog[id].source;loadObject(id);cancelAnimationFrame(animation);animate();$('visorClose').focus();}
function close(){if(!modal)return;modal.hidden=true;cancelAnimationFrame(animation);animation=0;window.StarSound?.stopVoice();}
window.StarVisor={open,close};
window.addEventListener('resize',resize);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&modal&&!modal.hidden)close();});
