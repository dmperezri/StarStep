import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createRequire} from "node:module";
const read=p=>readFileSync(new URL("../../"+p,import.meta.url),"utf8");
const require=createRequire(import.meta.url);
test("Marte: la plantilla carga exclusivamente la cinematica MP4 antes del controlador",()=>{
 const t=read("templates/marte.html");
 assert.match(t,/id="marsCinematic"/); assert.doesNotMatch(t,/starMarsTransit|js\/viaje-marte\.js/);
 assert.ok(t.indexOf("js/cinematica.js")<t.indexOf("js/marte-mision.js"));
 const moon=read("templates/luna.html");
 assert.match(moon,/href="\/marte\?viaje=luna&amp;cine=3"[^>]*data-flow-requires="mars_transition"/);
 const core=require("../../static/js/cinematica.js");
 assert.ok(existsSync(new URL("../../"+core.VIDEOS.mars_intro.src.slice(1),import.meta.url)));
});
