import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const require = createRequire(import.meta.url);
const def = require('../../static/js/flujo-definicion.js');
const {createStarFlow} = require('../../static/js/flujo.js');
function setup(options={}) {
  let saved = options.saved ?? null;
  const definition = options.definition ?? def;
  const flow = createStarFlow({definition, storage:{load:()=>saved,save:s=>{saved=JSON.parse(JSON.stringify(s));},legacyInventory:()=>options.inventory??[],legacyActs:()=>options.acts??[],legacyProfile:()=>options.profile??{}},idGen:()=> 'guest-chapters01'});
  return flow;
}
function profile(f) {
  assert.ok(f.recordObjective('lito_welcome.heard',{source:'transmission'}).ok);
  assert.ok(f.recordObjective('profile.alias',{source:'avatar_form',alias:'Ana'}).ok);
  assert.ok(f.recordObjective('cadet_custom.avatar',{source:'avatar_form',avatar:'vice'}).ok);
}
function select(f) { assert.ok(f.recordObjective('chapter_select.chapter1',{source:'chapter_menu'}).ok); }
function brief(f) { assert.ok(f.recordObjective('chapter_briefing.ready',{source:'chapter_briefing_sequence'}).ok); }
test('capítulos: sin bienvenida ni perfil las rutas quedan bloqueadas',()=>{
  const f=setup();
  for (const p of ['/capitulos','/rock-roll','/despegue','/luna']) assert.equal(f.checkPage(p).allowed,false,p);
  assert.equal(f.recordObjective('chapter_select.chapter1',{source:'chapter_menu'}).code,'STAGE_LOCKED');
});
test('capítulos: perfil completo conduce a la selección; abrir no otorga avance',()=>{
  const f=setup();profile(f);const before=f.getState();
  assert.deepEqual(f.getEntryPoint(),{status:'in_progress',stage:'chapter_select',page:'/capitulos'});
  assert.ok(f.checkPage('/capitulos').allowed);
  assert.equal(f.checkPage('/rock-roll').allowed,false);
  assert.equal(f.recordObjective('launch.liftoff',{source:'launch_sequence'}).code,'STAGE_LOCKED');
  assert.equal(f.recordObjective('chapter_select.chapter1',{source:'button'}).code,'INVALID_EVIDENCE');
  assert.deepEqual(f.getState(),before);
});
test('capítulos: seleccionar solo habilita briefing, confirmar solo habilita despegue',()=>{
  const f=setup();profile(f);select(f);
  assert.equal(f.getCurrentStage(),'chapter_briefing');
  assert.ok(f.checkPage('/rock-roll').allowed);
  assert.equal(f.checkPage('/despegue').allowed,false);
  assert.equal(f.recordObjective('chapter_select.chapter1',{source:'chapter_menu'}).code,'ALREADY_COMPLETED');
  brief(f);assert.equal(f.getCurrentStage(),'launch');
  assert.ok(f.checkPage('/despegue').allowed);
  assert.equal(f.checkPage('/luna').allowed,false);
  assert.deepEqual(f.listRegistered(),[]);
});
test('capítulos: recargar conserva selección y etapa pendiente',()=>{
  const f=setup();profile(f);select(f);
  const again=setup({saved:f.getState()});
  assert.deepEqual(again.getEntryPoint(),{status:'in_progress',stage:'chapter_briefing',page:'/rock-roll'});
  assert.deepEqual(again.getState(),f.getState());
});
test('capítulos: partida anterior con lanzamiento conserva acceso sin objetivos ficticios',()=>{
  const oldDef=JSON.parse(JSON.stringify(def));
  oldDef.STAGES=oldDef.STAGES.filter(s=>s.id!=='chapter_briefing');
  const chapter=oldDef.STAGES.find(s=>s.id==='chapter_select');chapter.implemented=false;chapter.objectives[0].implemented=false;chapter.page='/';
  const travel=oldDef.STAGES.find(s=>s.id==='space_travel');travel.implemented=false;travel.objectives[0].implemented=false;
  const old=setup({definition:oldDef});profile(old);
  assert.ok(old.recordObjective('launch.liftoff',{source:'launch_sequence'}).ok);
  assert.ok(old.recordObjective('moon_landing.touchdown',{source:'descent_sequence'}).ok);
  assert.ok(old.locateArtifact('eagle',{mechanic:'rover_proximity_scan'}).ok);
  const previous=old.getState();const upgraded=setup({saved:previous});const state=upgraded.getState();
  assert.equal(upgraded.getEntryPoint().page,'/luna');
  assert.equal(state.completed.chapter_select.via,'legacy_access');
  assert.equal(state.completed.chapter_briefing.via,'legacy_access');
  assert.deepEqual(state.objectives,previous.objectives);
  assert.deepEqual(state.artifacts,previous.artifacts);
  assert.deepEqual(state.player,previous.player);
  assert.deepEqual(setup({saved:state}).getState(),state);
});
test('capítulos: perfil antiguo sin despegue debe elegir capítulo',()=>{
  const f=setup();profile(f);const s=f.getState();s.current='launch';
  const restored=setup({saved:s});assert.equal(restored.getCurrentStage(),'chapter_select');
  assert.equal(restored.isStageCompleted('chapter_select'),false);
});
test('capítulos: 2 y 3 bloqueados en HTML, sin objetivos ni enlaces de acceso',()=>{
  const html=readFileSync(new URL('../../templates/capitulos.html',import.meta.url),'utf8');
  assert.equal((html.match(/<article class="chapter locked">/g)||[]).length,2);
  for(const article of html.matchAll(/<article class="chapter locked">([\s\S]*?)<\/article>/g)) {
    assert.match(article[1],/<button[\s\S]*?disabled>/);
    assert.doesNotMatch(article[1],/<a\s/);
  }
});

// Scripts reales con DOM simulado y reloj controlado; no requieren Chromium.
import {FakeElement,makePage,newTab,openHome} from './navegador-simulado.mjs';
function tabWithProfile() {
  const tab=newTab(); const home=openHome(tab);
  profile(home.ctx.StarFlow);
  return tab;
}
function canvasFake() {
  const canvas=new FakeElement('canvas',{id:'stars'});
  canvas.getContext=()=>({fillRect(){}});
  return canvas;
}
function openChapters(tab) {
  const start=new FakeElement('button',{id:'startChapter',disabled:true});
  const notice=new FakeElement('p',{id:'chapterNotice',hidden:true});
  const title=new FakeElement('h1',{dataset:{text:'title'}});
  const es=new FakeElement('button',{dataset:{lang:'es'}}),en=new FakeElement('button',{dataset:{lang:'en'}});
  const page=makePage({path:'/capitulos',tab,elements:[start,notice,title,es,en,canvasFake()]});
  const original=page.document.querySelectorAll;
  page.document.querySelectorAll=selector=>selector==='[data-text]'?[title]:original(selector);
  page.ctx.matchMedia=()=>({matches:true});
  page.load('main.js','progreso.js','flujo-definicion.js','flujo.js','capitulos.js').ready();
  return {page,start,notice,title,en};
}
test('interfaz capítulos: idioma persistente, clic real registra selección',()=>{
  const tab=tabWithProfile();const {page,start,en,title}=openChapters(tab);
  assert.equal(start.disabled,false);en.click();assert.equal(title.textContent,'CHOOSE YOUR ADVENTURE');
  assert.equal(tab.localStorage.getItem('starstep_lang'),'en');start.click();
  assert.equal(page.ctx.StarFlow.getCurrentStage(),'chapter_briefing');
  assert.equal(page.ctx.__navigated,'/rock-roll');assert.equal(start.disabled,true);
});
function openBriefing(tab) {
  const ids=['worlds','titleBlock','acts','lito','briefing','nextButton','launchButton','pauseButton','progress','voiceButton','sceneLabel','missionText'];
  const el=Object.fromEntries(ids.map(id=>[id,new FakeElement('div',{id})]));
  const page=makePage({path:'/rock-roll',tab,elements:[...Object.values(el),canvasFake()]});
  page.ctx.matchMedia=()=>({matches:true});
  const frames=[]; page.ctx.requestAnimationFrame=fn=>frames.push(fn);
  page.ctx.StarSound={voiceOn:false,stopVoice(){},speak(){},setVoice(){},stopAll(){}};
  page.load('main.js','progreso.js','flujo-definicion.js','flujo.js','rock-roll.js').ready();
  let time=0;
  function elapse(ms) {for(let i=0;i<=ms/100;i++){const pending=frames.splice(0);time+=100;for(const fn of pending)fn(time);}}
  return {page,el,elapse};
}
// Bloque 1: con cinematica.js la presentación empieza con el video (tests/js/cinematica.test.mjs).
// Esta prueba no carga el reproductor: cubre la presentación de respaldo, que no cambió.
test("Rock & Roll sin reproductor: no permite avanzar",()=>{
    const tab=tabWithProfile();

    openChapters(tab).start.click();

    const {page,el,elapse}=openBriefing(tab);

    elapse(30000);

    assert.equal(el.launchButton.hidden,true);

    el.launchButton.click();

    assert.equal(
        page.ctx.StarFlow.getCurrentStage(),
        "chapter_briefing"
    );
});

test("selector accesible durante partida sin duplicar progreso",()=>{
    const tab=tabWithProfile();

    openChapters(tab).start.click();

    const {page,start}=openChapters(tab);

    const revision=page.ctx.StarFlow.getState().revision;

    start.click();

    assert.equal(page.ctx.__navigated,"/rock-roll");
    assert.equal(page.ctx.StarFlow.getState().revision,revision);
});
