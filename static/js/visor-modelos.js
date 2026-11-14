/* Modelos educativos multipieza. Coordenadas locales: suelo y=0, frente z positivo. */
import * as T from 'three';
export function disposeObject(root) {
  const seen = new Set();
  root.traverse(o => {
    if (o.geometry && !seen.has(o.geometry)) { seen.add(o.geometry); o.geometry.dispose(); }
    for (const m of [].concat(o.material || [])) {
      if (seen.has(m)) continue; seen.add(m);
      for (const v of Object.values(m)) if (v?.isTexture && !seen.has(v)) { seen.add(v); v.dispose(); }
      m.dispose();
    }
  });
}
export function makeArtifact(id) {
  const group = new T.Group(), mats = {};
  const mat = (c, metal = .25, rough = .65) => mats[`${c}/${metal}/${rough}`] ||= new T.MeshStandardMaterial({color:c,metalness:metal,roughness:rough,flatShading:true});
  const gold = mat('#FFE066', .8, .34), white = mat('#FFF8E7', .3, .6), steel = mat('#868CA4', .8, .35), dark = mat('#262C66', .2, .78), blue = mat('#213E87', .65, .24);
  function mesh(geo, m, x=0,y=0,z=0) { const o = new T.Mesh(geo,m); o.position.set(x,y,z); o.castShadow = o.receiveShadow = true; group.add(o); return o; }
  const box = (w,h,d,m,x,y,z) => mesh(new T.BoxGeometry(w,h,d),m,x,y,z);
  const cyl = (a,b,h,m,x,y,z,n=12) => mesh(new T.CylinderGeometry(a,b,h,n),m,x,y,z);
  const rod = (a,b,r=.025,m=steel) => {
    const start = new T.Vector3(...a), end = new T.Vector3(...b), d = end.clone().sub(start);
    const o = cyl(r,r,d.length(),m,...start.clone().add(end).multiplyScalar(.5).toArray(),6);
    o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize()); return o;
  };
  const solar = (x,y,z,w=1.1,d=.7,tilt=0) => {
    const p = new T.Group(); group.add(p); p.position.set(x,y,z); p.rotation.z=tilt;
    const base = box(w,.045,d,steel,0,0,0); group.remove(base); p.add(base);
    for(let a=0;a<6;a++) for(let b=0;b<4;b++) {
      const cell = box(w/6-.015,.012,d/4-.015,blue,-w/2+(a+.5)*w/6,.03,-d/2+(b+.5)*d/4); group.remove(cell); p.add(cell);
    }
    return p;
  };
  let points, dustMaterials = [];
  if (id==='eagle') {
    cyl(.98,1.08,.68,gold,0,.78,0,8);
    // Facetas Kapton con pliegues deterministas, sin textura externa.
    for(let i=0;i<8;i++) {
      const a=i*Math.PI/4;
      for(let j=0;j<4;j++) {
        const o=box(.32,.12,.025,j%2?gold:mat('#C99B36',.72,.47),Math.sin(a)*1.01,.54+j*.16,Math.cos(a)*1.01);
        o.rotation.set(.12*Math.sin(i+j),a,.08*Math.cos(j*3));
      }
    }
    cyl(.62,.72,.3,white,0,1.27,0,8); box(.8,.28,.7,steel,0,1.5,-.05);
    const nozzle=cyl(.16,.32,.32,dark,0,.29,0); nozzle.material.side=T.DoubleSide;
    for(let i=0;i<4;i++) {
      const a=Math.PI/4+i*Math.PI/2, x=Math.sin(a), z=Math.cos(a);
      rod([x*.66,.95,z*.66],[x*1.58,.12,z*1.58],.045);
      rod([x*.95,.48,z*.95],[x*1.58,.16,z*1.58],.027,gold);
      cyl(.28,.34,.08,gold,x*1.58,.07,z*1.58);
    }
    for(const x of [-.24,.24]) rod([x,1.1,1.05],[x,.09,1.56],.025,white);
    for(let i=0;i<8;i++) rod([-.24,.15+i*.12,1.53-i*.06],[.24,.15+i*.12,1.53-i*.06],.02,white);
    rod([.4,1.4,-.3],[.6,2,-.3],.022);
    const dish=mesh(new T.SphereGeometry(.27,12,6,0,Math.PI*2,0,Math.PI*.4),gold,.6,2,-.3); dish.rotation.z=-.5;
    points=[[0,1,1],[1.15,.32,1.15],[0,.7,1.3]];
  } else if (id==='opportunity') {
    box(1.65,.35,1.12,white,0,.75,0); box(1.3,.14,1.0,gold,0,.98,0);
    solar(0,1.08,0,1.7,1.2); solar(-1.18,1.08,0,.65,1.1,-.07); solar(1.18,1.08,0,.65,1.1,.07);
    // Capa de polvo translúcida sobre las tres alas, con materiales independientes.
    for(const [x,w] of [[0,1.7],[-1.18,.65],[1.18,.65]]) {
      const m=new T.MeshStandardMaterial({color:'#D9593A',transparent:true,opacity:.68,roughness:1,depthWrite:false});
      dustMaterials.push(m); const layer=box(w,.01,1.1,m,x,1.135,0); layer.rotation.z=x===0?0:x<0?-.07:.07;
    }
    for(const z of [-.78,.78]) {
      rod([-.9,.35,z],[0,.65,z],.045); rod([0,.65,z],[.95,.35,z],.045);
      rod([0,.65,z],[0,.78,0],.06);
      for(const x of [-.95,0,.95]) {
        const wheel=cyl(.27,.27,.19,dark,x,.29,z,16); wheel.rotation.x=Math.PI/2;
        for(let i=0;i<12;i++) {
          const a=i*Math.PI/6, tread=box(.09,.05,.23,steel,x+Math.sin(a)*.27,.29+Math.cos(a)*.27,z);
          tread.rotation.z=-a;
        }
      }
    }
    rod([.35,.95,.2],[.35,1.98,.2],.045); box(.5,.22,.25,white,.35,2.03,.22);
    for(const x of [.2,.5]) { const lens=cyl(.07,.07,.055,blue,x,2.03,.38); lens.rotation.x=Math.PI/2; }
    rod([-.55,.72,.55],[-1,.4,1],.045); rod([-1,.4,1],[-.5,.25,1.3],.035); cyl(.14,.14,.12,steel,-.5,.23,1.3);
    points=[[.35,2.1,.3],[.8,1.15,.3],[.95,.32,.9]];
  } else if (id==='easep'||id==='alsep') {
    box(.8,.38,.65,white,0,.4,0); box(.7,.12,.6,gold,0,.66,0);
    rod([0,.66,0],[0,1.8,0],.022); rod([-.3,1.7,0],[.3,1.7,0],.014);
    if(id==='alsep') { solar(-1,.65,0,.8,.65,.25); solar(1,.65,0,.8,.65,-.25); }
    else { box(.5,.2,.4,blue,-.9,.25,.3); } // EASEP: pequeño instrumento solar, sin atribuirle un núcleo Apollo 15.
    for(let i=0;i<3;i++) {
      const x=-.8+i*.8,z=.9;
      cyl(.13,.13,.22,steel,x,.16,z);
      const curve=new T.CatmullRomCurve3([new T.Vector3(0,.24,0),new T.Vector3(x*.6,.08,.45),new T.Vector3(x,.08,z)]);
      mesh(new T.TubeGeometry(curve,10,.012,5,false),dark);
    }
    if(id==='alsep') {
      const layers=['#C3C7D6','#575C74','#868CA4','#6E62CE','#FFE066','#3E4256'];
      for(let i=0;i<6;i++) cyl(.18,.18,.25,mat(layers[i],.1,.95),1.35,.2+i*.25,.65);
      const shell=new T.MeshStandardMaterial({color:'#3FD0E0',transparent:true,opacity:.18,wireframe:true});
      cyl(.22,.22,1.7,shell,1.35,.9,.65);
    }
    points=id==='alsep'?[[0,.7,0],[0,.2,.9],[1.35,1.5,.65]]:[[0,.7,0],[-.9,.5,.3],[0,.2,.9]];
  } else if(id==='reflector') {
    const frame=box(1.5,.12,.85,steel,0,.45,0); frame.rotation.x=.2;
    for(let x=0;x<8;x++)for(let z=0;z<4;z++) {
      const p=cyl(.055,.055,.08,white,-.63+x*.18,.56-z*.035,-.3+z*.18,6); p.rotation.x=.2;
    }
    for(const x of [-.6,.6]) rod([x,.4,0],[x,0,.6],.035);
    points=[[0,.7,0],[.6,.2,.5]];
  } else {
    const rock=mesh(new T.IcosahedronGeometry(1.25,1),mat('#D9593A',.05,1),0,.3,0); rock.scale.y=.45;
    for(let i=0;i<24;i++)mesh(new T.IcosahedronGeometry(.09,1),mat('#4F86D9',.3,.6),Math.sin(i*2.4)*.9,.6+Math.sin(i*1.7)*.14,Math.cos(i*2.4)*.7);
    points=[[.2,.8,.5]];
  }
  // Materiales compartidos: liberar sólo los que efectivamente utiliza el árbol.
  const used=new Set(); group.traverse(o=>{if(o.material)used.add(o.material);});
  Object.values(mats).forEach(m=>{if(!used.has(m))m.dispose();});
  return {group, points, setDust(on){dustMaterials.forEach(m=>m.opacity=on?.68:0);}};
}
