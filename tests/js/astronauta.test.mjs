// Validación del nombre del cadete (templates/astronauta.html y StarFlowCore.normalizeAlias).
// Ejecutar desde la raíz del repositorio:
//   node --test tests/js/
// Los navegadores compilan el atributo pattern como ^(?:pattern)$ con la bandera «v».
// Si la expresión no es válida con esa bandera, el navegador la ignora en silencio y
// acepta cualquier alias (fallo corregido: el guion final de la clase debe escaparse).
// El pattern no puede recortar espacios: esa parte la valida normalizeAlias() en JS.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { template, makePage, newTab, openHome, FakeElement } from "./navegador-simulado.mjs";

const require = createRequire(import.meta.url);
const { normalizeAlias, ALIAS_MIN, ALIAS_MAX } = require("../../static/js/flujo.js");

const decode = s => s.replaceAll("&quot;", '"').replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");

function aliasPattern() {
  const match = /<input id="alias"[^>]*\spattern="([^"]*)"/.exec(template("astronauta.html"));
  assert.ok(match, "el campo alias tiene pattern");
  return decode(match[1]);
}

test("alias: el pattern es válido con la bandera v, como lo compila el navegador", () => {
  assert.doesNotThrow(() => new RegExp(`^(?:${aliasPattern()})$`, "v"));
});

test("alias: el pattern acepta nombres válidos y rechaza el resto", () => {
  const re = new RegExp(`^(?:${aliasPattern()})$`, "v");
  for (const ok of ["ARIEL", "José", "Ñandú 2", "cadete_01", "Ana-Sofía", "ab", "A".repeat(18)]) {
    assert.ok(re.test(ok), `debe aceptar «${ok}»`);
  }
  for (const bad of ["A", "A".repeat(19), "<script>", "ana@correo", "🚀 Luna", "a/b", "a.b", "", "Zoë"]) {
    assert.ok(!re.test(bad), `debe rechazar «${bad}»`);
  }
});

test("alias: el pattern coincide con minlength, maxlength y la regla de JS", () => {
  const input = /<input id="alias"[^>]*>/.exec(template("astronauta.html"))[0];
  assert.match(input, new RegExp(`minlength="${ALIAS_MIN}"`));
  assert.match(input, new RegExp(`maxlength="${ALIAS_MAX}"`));
  assert.match(aliasPattern(), new RegExp(`\\{${ALIAS_MIN},${ALIAS_MAX}\\}$`));
});

// ── Alias recortado antes de validar y guardar ──────────────────
const ONLY_SPACES = ["", " ", "   ", "\t \n", " ".repeat(18)];
const ONE_CHAR = [" A ", "  ñ  ", "\tZ\t", " 7", "_ "];
const VALID_WITH_SPACES = [
  ["  Ana  ", "Ana"], ["   José Ñandú", "José Ñandú"], ["Ana-Sofía_2   ", "Ana-Sofía_2"],
  [" Ü ü ", "Ü ü"], ["\tLuz Marina\n", "Luz Marina"], [" ab ", "ab"], ["  " + "B".repeat(16), "B".repeat(16)]
];

test("alias: solo espacios es un alias vacío", () => {
  for (const raw of ONLY_SPACES) assert.equal(normalizeAlias(raw).code, "ALIAS_EMPTY", JSON.stringify(raw));
  for (const raw of [undefined, null, 12, {}]) assert.equal(normalizeAlias(raw).code, "ALIAS_EMPTY");
});

test("alias: un carácter rodeado de espacios no alcanza el mínimo", () => {
  for (const raw of ONE_CHAR) assert.equal(normalizeAlias(raw).code, "ALIAS_LENGTH", JSON.stringify(raw));
});

test("alias: nombres válidos con espacios al principio o al final se recortan", () => {
  for (const [raw, expected] of VALID_WITH_SPACES) {
    assert.deepEqual(normalizeAlias(raw), { ok: true, alias: expected }, JSON.stringify(raw));
  }
  assert.equal(normalizeAlias("Ana   Sofía").alias, "Ana   Sofía", "los espacios internos se conservan");
  assert.equal(normalizeAlias("José").alias, "José", "tilde combinada → letra compuesta (NFC)");
  assert.equal(normalizeAlias("A".repeat(ALIAS_MAX)).ok, true);
  assert.equal(normalizeAlias(" " + "A".repeat(ALIAS_MAX + 1)).code, "ALIAS_LENGTH");
  assert.equal(normalizeAlias("A".repeat(ALIAS_MIN)).ok, true);
  for (const bad of ["<b>", " ana@correo ", "🚀", "Zoë", "a.b"]) assert.equal(normalizeAlias(bad).code, "ALIAS_CHARS", bad);
});

test("alias: el controlador y el almacenamiento usan la misma regla", () => {
  const tab = newTab();
  const { StarFlow, StarProgress } = openHome(tab).ctx;
  StarFlow.recordObjective("lito_welcome.heard", { source: "welcome_skip" });
  for (const raw of [...ONLY_SPACES, ...ONE_CHAR]) {
    assert.equal(StarProgress.setPlayer({ alias: raw, avatar: "vice" }), false, JSON.stringify(raw));
    assert.equal(tab.localStorage.getItem("starstep_astronauta"), null, "no se guarda nada");
    assert.equal(StarFlow.recordObjective("profile.alias", { source: "avatar_form", alias: raw }).code,
      "INVALID_EVIDENCE", JSON.stringify(raw));
  }
  assert.equal(StarFlow.isStageCompleted("profile"), false);
  assert.equal(StarProgress.setPlayer({ alias: "  Ana Sofía  ", avatar: "vice" }), true);
  assert.equal(StarProgress.player().alias, "Ana Sofía");
  assert.equal(StarFlow.recordObjective("profile.alias", { source: "avatar_form", alias: "  Ana Sofía  " }).ok, true);
});

// ── Formulario real de /astronauta (astronauta.js) en el navegador simulado ──
function openAvatarPage(tab) {
  class Input extends FakeElement {
    setCustomValidity(message) { this.validationMessage = message; }
    get validity() { return { customError: Boolean(this.validationMessage) }; }
  }
  const alias = new Input("input", { id: "alias", value: "", validationMessage: "" });
  const shown = [];
  const form = new FakeElement("form", { id: "avatarForm" });
  // Como el navegador: con un error propio, reportValidity muestra ese mensaje y devuelve false.
  form.reportValidity = () => {
    if (alias.validationMessage) { shown.push(alias.validationMessage); return false; }
    return true;
  };
  const grid = new FakeElement("div", { id: "avatarGrid" });
  grid.querySelectorAll = () => grid.children;
  const canvas = new FakeElement("canvas", { id: "world" });
  canvas.getContext = () => ({});
  const es = new FakeElement("button", { dataset: { lang: "es" } });
  const en = new FakeElement("button", { dataset: { lang: "en" } });
  const elements = [canvas, form, grid, alias, new FakeElement("p", { id: "litoMessage" }),
    new FakeElement("a", { id: "launchDestination", href: "/despegue" }), es, en];
  const page = makePage({ path: "/astronauta", tab, elements });
  page.load("main.js", "progreso.js", "flujo-definicion.js", "flujo.js");
  page.ctx.StarArt = { avatars: [{ id: "vice", name: "VICE" }, { id: "astronauta", name: "ASTRONAUTA" }], portrait() {}, earthScene() {} };
  page.ctx.StarSound = { init() {}, effect() {} };
  page.load("astronauta.js").ready();
  page.document.querySelector = sel => (sel === ".curtain" ? new FakeElement("div") : null);
  const type = value => { alias.value = value; alias.listeners.input.forEach(fn => fn()); };
  const submit = value => { type(value); form.listeners.submit.forEach(fn => fn({ preventDefault() {} })); };
  const click = lang => (lang === "en" ? en : es).listeners.click.forEach(fn => fn());
  return Object.assign(page, { alias, shown, type, submit, click });
}

function avatarPageAfterWelcome(lang) {
  const tab = newTab({ starstep_lang: lang });
  openHome(tab).ctx.StarFlow.recordObjective("lito_welcome.heard", { source: "welcome_skip" });
  return { tab, page: openAvatarPage(tab) };
}

const MESSAGES = {
  es: { empty: /no puede quedar vacío ni tener solo espacios/, length: /entre 2 y 18 caracteres/, chars: /Usá solo letras/ },
  en: { empty: /cannot be empty or contain only spaces/, length: /2 to 18 characters/, chars: /Use only letters/ }
};

for (const lang of ["es", "en"]) {
  test(`formulario [${lang}]: solo espacios muestra el mensaje propio y no guarda`, () => {
    const { tab, page } = avatarPageAfterWelcome(lang);
    for (const raw of ONLY_SPACES) {
      page.submit(raw);
      assert.match(page.shown.at(-1), MESSAGES[lang].empty, JSON.stringify(raw));
    }
    assert.equal(tab.localStorage.getItem("starstep_astronauta"), null, "nada guardado");
    assert.equal(page.ctx.StarFlow.isStageCompleted("profile"), false, "el perfil no se completa");
  });

  test(`formulario [${lang}]: un carácter rodeado de espacios muestra el mensaje de longitud`, () => {
    const { tab, page } = avatarPageAfterWelcome(lang);
    for (const raw of ONE_CHAR) {
      page.submit(raw);
      assert.match(page.shown.at(-1), MESSAGES[lang].length, JSON.stringify(raw));
    }
    page.submit(" <b> ");
    assert.match(page.shown.at(-1), MESSAGES[lang].chars);
    assert.equal(tab.localStorage.getItem("starstep_astronauta"), null);
    assert.equal(page.ctx.StarFlow.isStageCompleted("profile"), false);
  });

  test(`formulario [${lang}]: un nombre válido con espacios al principio o al final se recorta y se guarda`, () => {
    for (const [raw, expected] of VALID_WITH_SPACES) {
      const { tab, page } = avatarPageAfterWelcome(lang);
      page.submit(raw);
      assert.equal(page.shown.length, 0, `sin mensaje de error: ${JSON.stringify(raw)}`);
      assert.equal(page.alias.value, expected, "el campo muestra el nombre recortado");
      assert.equal(JSON.parse(tab.localStorage.getItem("starstep_astronauta")).alias, expected);
      assert.equal(page.ctx.StarFlow.isStageCompleted("profile"), true);
    }
  });
}

test("formulario: cambiar de idioma traduce el mensaje visible y corregir lo borra", () => {
  const { page } = avatarPageAfterWelcome("es");
  page.submit("   ");
  assert.match(page.alias.validationMessage, MESSAGES.es.empty);
  page.click("en");
  assert.match(page.alias.validationMessage, MESSAGES.en.empty);
  page.type("Ana");
  assert.equal(page.alias.validationMessage, "", "al escribir, el error desaparece");
});
