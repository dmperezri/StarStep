import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const Flight=require('../../static/js/vuelo-motor.js');
const def=require('../../static/js/flujo-definicion.js');
const {createStarFlow}=require('../../static/js/flujo.js');
function setup(initial, definition=def){
 let data=initial;
 const storage={load:()=>data,save:s=>{data=structuredClone(s);}};
 const flow=createStarFlow({definition,storage,idGen:()=> 'guest-flight001'});
 return {flow,storage};
}
function launch(f){
 for(const [id,e] of [['lito_welcome.heard',{source:'transmission'}],['profile.alias',{source:'avatar_form',alias:'Cadete'}],['cadet_custom.avatar',{source:'avatar_form',avatar:'vice'}],['chapter_select.chapter1',{source:'chapter_menu'}],['chapter_briefing.ready',{source:'chapter_briefing_sequence'}],['launch.liftoff',{source:'launch_sequence'}]])assert.ok(f.recordObjective(id,e).ok,id);
}
const arrive={source:'travel_minigame',seconds:24};
function steer(g){const next=Flight.obstacles(g).find(o=>o.x>=Flight.X-19);const target=next&&next.x-Flight.X<85?(next.top+next.bottom)/2:90;return g.y+g.vy*.14>target;}
test('vuelo: una partida nueva no accede a vuelo ni Luna antes de despegar',()=>{
 const {flow:f}=setup();assert.equal(f.checkPage('/vuelo').allowed,false);assert.equal(f.checkPage('/luna').allowed,false);launch(f);
 assert.equal(f.getEntryPoint().page,'/vuelo');assert.ok(f.checkPage('/vuelo').allowed);assert.equal(f.checkPage('/luna').allowed,false);
 assert.equal(f.recordObjective('moon_landing.touchdown',{source:'descent_sequence'}).code,'STAGE_LOCKED');
 assert.equal(f.recordObjective('space_travel.arrive',arrive).code,'INVALID_EVIDENCE');
});
test('vuelo: motor a paso fijo completa los 24 segundos y habilita descenso solo al ganar',()=>{
 const {flow:f}=setup();launch(f);const g=Flight.create();g.mode='running';let cp=0;const checkpoints=[];
 for(let i=0;i<5000&&g.mode==='running';i++){Flight.step(g,steer(g));if(g.cp!==cp){cp=g.cp;checkpoints.push(cp);assert.ok(f.saveFlightCheckpoint(cp,g.fails).ok);}}
 assert.equal(g.mode,'won');assert.equal(g.time,24);assert.equal(g.fails,0);assert.deepEqual(checkpoints,[6,12,18]);
 assert.ok(f.recordObjective('space_travel.arrive',{source:'travel_minigame',seconds:g.time}).ok);
 assert.equal(f.getCurrentStage(),'moon_landing');assert.equal(f.getEntryPoint().page,'/despegue');assert.equal(f.checkPage('/luna').allowed,false);
 assert.ok(f.recordObjective('moon_landing.touchdown',{source:'descent_sequence'}).ok);assert.ok(f.checkPage('/luna').allowed);
 assert.equal(f.recordObjective('space_travel.arrive',arrive).code,'ALREADY_COMPLETED');
});
test('vuelo: checkpoint y fallos sobreviven recarga, no se puede saltar un tramo',()=>{
 const {flow:f}=setup();launch(f);assert.equal(f.saveFlightCheckpoint(18,0).ok,false);assert.equal(f.saveFlightCheckpoint(7,0).ok,false);
 assert.ok(f.saveFlightCheckpoint(6,3).ok);assert.ok(f.saveFlightCheckpoint(12,6).ok);
 const {flow:r}=setup(f.getState());assert.deepEqual(r.getFlightCheckpoint(),{seconds:12,fails:6});assert.equal(r.saveFlightCheckpoint(6,6).ok,false);assert.equal(r.saveFlightCheckpoint(12,5).ok,false);
 const g=Flight.create();g.cp=r.getFlightCheckpoint().seconds;g.fails=r.getFlightCheckpoint().fails;Flight.reset(g);assert.equal(g.time,12);assert.equal(g.y,90);assert.equal(g.vy,0);assert.equal(Flight.level(g.fails),2);
});
test('vuelo: colisión en el límite del checkpoint no permite guardarlo',()=>{
 const g=Flight.create();Object.assign(g,{mode:'running',time:6-Flight.DT/2,y:172,vy:100});Flight.step(g,false);
 assert.equal(g.mode,'crashed');assert.equal(g.cp,0);assert.equal(g.fails,1);Flight.reset(g);assert.equal(g.time,0);
});
test('vuelo: choque en el último paso tiene prioridad sobre victoria incluso con ayuda máxima',()=>{
 const g=Flight.create();Object.assign(g,{mode:'running',time:24-Flight.DT/2,y:172,vy:100,cp:18,fails:9});Flight.step(g,false);assert.equal(g.mode,'crashed');assert.equal(g.fails,10);assert.equal(g.cp,18);
});
test('vuelo: asistencia progresiva, corredores mayores, colisiones no desactivadas',()=>{
 assert.deepEqual([0,2,3,5,6,8,9,99].map(Flight.level),[0,0,1,1,2,2,3,3]);const g=Flight.create(),w=Flight.obstacles(g)[0];g.fails=9;const wider=Flight.obstacles(g)[0];assert.ok(wider.bottom-wider.top>w.bottom-w.top);
 Object.assign(g,{mode:'running',time:1.1,y:8,vy:0});Flight.step(g,false);assert.equal(g.mode,'crashed');
});
test('vuelo: partida antigua aterrizada conserva progreso sin inventar victoria',()=>{
 const oldDef=structuredClone(def);const st=oldDef.STAGES.find(s=>s.id==='space_travel');st.implemented=false;st.objectives[0].implemented=false;const {flow:old}=setup(null,oldDef);launch(old);assert.ok(old.recordObjective('moon_landing.touchdown',{source:'descent_sequence'}).ok);const before=old.getState();const {flow:f}=setup(before);assert.equal(f.getCurrentStage(),'moon_exploration');assert.equal(f.getState().completed.space_travel.via,'legacy_access');assert.deepEqual(f.getState().objectives,before.objectives);assert.deepEqual(f.getState().artifacts,before.artifacts);
});
test('vuelo: partida anterior que solo despegó tiene que superar el nuevo nivel',()=>{
 const oldDef=structuredClone(def);const st=oldDef.STAGES.find(s=>s.id==='space_travel');st.implemented=false;st.objectives[0].implemented=false;const {flow:old}=setup(null,oldDef);launch(old);const {flow:f}=setup(old.getState());assert.equal(f.getCurrentStage(),'space_travel');assert.equal(f.isStageCompleted('space_travel'),false);
});
test('vuelo: plantilla oficial con controlador y motor, sin enlaces demo',()=>{
 const html=readFileSync(new URL('../../templates/vuelo.html',import.meta.url),'utf8');assert.match(html,/js\/progreso\.js[\s\S]*js\/flujo-definicion\.js[\s\S]*js\/flujo\.js[\s\S]*js\/vuelo-motor\.js[\s\S]*js\/vuelo\.js/);assert.doesNotMatch(html,/demo-vuelo|demo-rock-roll|VISTA DE DESARROLLO/);assert.match(html,/id="flightMain" hidden/);
});
