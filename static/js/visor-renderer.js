/* Motor del museo: importación diferida; una instancia y recursos acotados por apertura. */
import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { makeArtifact, disposeObject } from './visor-modelos.js';
export function createViewer(viewport, pins, id, labels, inspect, status, reduced) {
  let renderer;
  try { renderer=new T.WebGLRenderer({antialias:false,powerPreference:'high-performance'}); }
  catch(error) { throw error; }
  let disposed=false, frame=0, last=0, ratio=.8, slow=0, samples=0, dusty=id==='opportunity', auto=false, transition=null;
  const scene=new T.Scene(); scene.background=new T.Color('#0E1233');
  const camera=new T.PerspectiveCamera(40,1,.05,70);
  renderer.setPixelRatio(1); renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15;
  const low=(navigator.hardwareConcurrency||4)<=4;
  renderer.shadowMap.enabled=!low; renderer.shadowMap.type=T.PCFSoftShadowMap;
  viewport.prepend(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Artefacto 3D manipulable');
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true; controls.dampingFactor=.07; controls.enablePan=false;
  controls.minDistance=2.8; controls.maxDistance=10; controls.maxPolarAngle=Math.PI*.49; controls.autoRotateSpeed=.65;
  controls.addEventListener('start',()=>{transition=null;});
  scene.add(new T.HemisphereLight('#E4DFFF','#262C66',2));
  const key=new T.DirectionalLight('#FFF0CF',4); key.position.set(3,6,4); key.castShadow=!low;
  key.shadow.mapSize.set(1024,1024); Object.assign(key.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:20}); key.shadow.normalBias=.035; scene.add(key);
  const rim=new T.DirectionalLight(id==='opportunity'?'#3FD0E0':'#8FF0D8',3.5); rim.position.set(-3,2,-3); scene.add(rim);
  let environment;
  try { const pmrem=new T.PMREMGenerator(renderer), room=new RoomEnvironment(); environment=pmrem.fromScene(room,.05); scene.environment=environment.texture; room.dispose(); pmrem.dispose(); } catch { /* Relleno hemisférico conserva legibilidad si falla PMREM. */ }
  const display=new T.Group(); scene.add(display);
  const artifact=makeArtifact(id); let setDust=artifact.setDust; display.add(artifact.group);
  const pedestal=new T.Group(); scene.add(pedestal);
  const holo=new T.MeshBasicMaterial({color:'#8FF0D8',transparent:true,opacity:.55,side:T.DoubleSide});
  for(const radius of [1.4,1.7,2]) {
    const ring=new T.Mesh(new T.RingGeometry(radius,radius+.018,64),holo); ring.rotation.x=-Math.PI/2; ring.position.y=-.09; pedestal.add(ring);
  }
  const floor=new T.Mesh(new T.CylinderGeometry(2.1,2.18,.12,48),new T.MeshStandardMaterial({color:'#1A1F4D',metalness:.5,roughness:.4}));
  floor.position.y=-.18; floor.receiveShadow=true; pedestal.add(floor);
  const spokes=[];
  for(let i=0;i<24;i++){const a=i*Math.PI/12;spokes.push(0,-.085,0,Math.cos(a)*2,-.085,Math.sin(a)*2);}
  const lines=new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(spokes,3)),new T.LineBasicMaterial({color:'#3FD0E0',transparent:true,opacity:.18}));pedestal.add(lines);
  const positions=[];for(let i=0;i<64;i++)positions.push(Math.sin(i*2.4)*(2+i%5*.08),.1+(i*13%37)/15,Math.cos(i*2.4)*(2+i%5*.08));
  const particles=new T.Points(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(positions,3)),new T.PointsMaterial({color:'#ABA1F5',size:.025,transparent:true,opacity:.65}));scene.add(particles);
  const projected=new T.Vector3(), target=new T.Vector3(), offset=new T.Vector3();
  // Pines HTML proyectados: táctiles y accesibles; la lista lateral siempre está disponible.
  const buttons=labels.map((label,index)=>{
    const b=document.createElement('button');b.type='button';b.className='visor-pin';b.textContent=String(index+1);b.setAttribute('aria-label',label);
    b.onclick=()=>{focus(index);inspect(index);};pins.append(b);return b;
  });
  function reset(){auto=false;transition=null;controls.autoRotate=false;controls.target.set(0,.85,0);camera.position.set(4,2.9,5);controls.update();}
  reset();
  function focus(index){
    auto=false;controls.autoRotate=false;document.getElementById('visorAuto')?.setAttribute('aria-pressed','false');
    target.set(...artifact.points[index]);display.localToWorld(target);
    offset.copy(camera.position).sub(controls.target).normalize().multiplyScalar(3.2);
    transition={from:camera.position.clone(),to:target.clone().add(offset),start:controls.target.clone(),target:target.clone(),elapsed:0};
    if(reduced){camera.position.copy(transition.to);controls.target.copy(target);transition=null;}
  }
  function resize(){if(disposed)return;const w=viewport.clientWidth,h=viewport.clientHeight;if(!w||!h)return;
    renderer.setSize(Math.max(1,Math.floor(w*ratio)),Math.max(1,Math.floor(h*ratio)),false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(viewport);resize();
  function render(now){
    if(disposed||document.hidden){frame=0;return;}
    const dt=last?Math.min((now-last)/1000,.05):0;last=now;
    if(!reduced){display.position.y=Math.sin(now*.0014)*.035;particles.rotation.y=now*.000025;}
    if(transition){transition.elapsed+=dt;const x=Math.min(1,transition.elapsed/.8),s=x*x*(3-2*x);camera.position.lerpVectors(transition.from,transition.to,s);controls.target.lerpVectors(transition.start,transition.target,s);if(x===1)transition=null;}
    controls.autoRotate=auto&&!reduced;controls.update(dt);renderer.render(scene,camera);
    for(let i=0;i<buttons.length;i++){
      projected.set(...artifact.points[i]);display.localToWorld(projected);projected.project(camera);
      const visible=projected.z>-1&&projected.z<1&&Math.abs(projected.x)<.95&&Math.abs(projected.y)<.95;
      buttons[i].hidden=!visible;if(visible){buttons[i].style.left=`${(projected.x*.5+.5)*100}%`;buttons[i].style.top=`${(-projected.y*.5+.5)*100}%`;}
    }
    // Descenso de calidad sólo tras muestras sostenidas. Nunca crece el buffer sin límite.
    if(dt>0){slow+=dt;samples++;if(samples===120){if(slow/samples>.024&&ratio>.5){ratio=.5;renderer.shadowMap.enabled=false;resize();}samples=0;slow=0;}}
    frame=requestAnimationFrame(render);
  }
  function visibility(){cancelAnimationFrame(frame);frame=0;last=0;if(!document.hidden&&!disposed)frame=requestAnimationFrame(render);}
  function contextLost(event){event.preventDefault();status('Se perdió el contexto 3D. Cerrá y abrí el visor para recuperarlo; las fichas siguen disponibles.');cancelAnimationFrame(frame);}
  renderer.domElement.addEventListener('webglcontextlost',contextLost);
  document.addEventListener('visibilitychange',visibility);frame=requestAnimationFrame(render);
  // Fallback visible primero. La carga GLB nunca bloquea los controles ni duplica la geometría.
  const abort=new AbortController();const timeout=setTimeout(()=>abort.abort(),8000);
  status('Representación procedural educativa · buscando modelo GLB local…');
  (async()=>{
    try {
      const response=await fetch(`/static/assets/models/${id}.glb`,{signal:abort.signal});
      if(!response.ok)throw new Error('missing');
      const bytes=await response.arrayBuffer();if(disposed)return;
      const model=await new GLTFLoader().parseAsync(bytes,`${location.origin}/static/assets/models/`);
      const object=model.scene;
      if(disposed){disposeObject(object);return;}
      const bounds=new T.Box3().setFromObject(object), size=bounds.getSize(new T.Vector3()),max=Math.max(size.x,size.y,size.z);
      if(!Number.isFinite(max)||max<=0){disposeObject(object);throw new Error('bounds');}
      const center=bounds.getCenter(new T.Vector3()),scale=2.8/max;
      object.scale.multiplyScalar(scale);object.position.multiplyScalar(scale);object.position.x-=center.x*scale;object.position.z-=center.z*scale;object.position.y-=bounds.min.y*scale;
      object.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
      if(id==='opportunity') {
        const panels=[];
        object.traverse(o=>{if(!o.isMesh)return;
          const materials=[].concat(o.material);
          const panel=/solar|panel/i.test(o.name)||materials.some(m=>/solar|panel/i.test(m.name)||m.color&&m.color.b>m.color.r*1.4);
          if(panel)for(const m of materials)if(m.color)panels.push({m,original:m.color.clone()});
        });
        setDust=on=>panels.forEach(({m,original})=>m.color.copy(original).lerp(new T.Color('#A65C3C'),on?.7:0));
        setDust(dusty);
        if(!panels.length)status('GLB cargado. Para simular polvo, nombrá las mallas solares con el prefijo solar.');
      }
      display.remove(artifact.group);disposeObject(artifact.group);display.add(object);
      status('Modelo GLB local · puntos orientativos del esquema educativo.');
      object.updateMatrixWorld(true);
      object.traverse(o=>{const index=labels.findIndex((_,i)=>o.name===`hotspot_${i+1}`);if(index>=0){const pos=o.getWorldPosition(new T.Vector3());display.worldToLocal(pos);artifact.points[index]=pos.toArray();}});
    } catch {if(!disposed)status('Representación procedural educativa · GLB local no disponible.');}
    finally {clearTimeout(timeout);}
  })();
  return {
    reset,focus,toggleAuto(){auto=reduced?false:!auto;return auto;},toggleDust(){dusty=!dusty;setDust(dusty);return dusty;},
    dispose(){if(disposed)return;disposed=true;abort.abort();clearTimeout(timeout);cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);controls.dispose();disposeObject(scene);environment?.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();pins.replaceChildren();}
  };
}
