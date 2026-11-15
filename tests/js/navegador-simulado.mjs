// Navegador simulado para las pruebas: carga los scripts reales de static/js en node:vm,
// página por página, compartiendo localStorage y sessionStorage como una pestaña real.
// No es un archivo de pruebas (no termina en .test.mjs); lo importan las pruebas.
import { readFileSync } from "node:fs";
import vm from "node:vm";

export const source = file => readFileSync(new URL("../../static/js/" + file, import.meta.url), "utf8");
export const template = file => readFileSync(new URL("../../templates/" + file, import.meta.url), "utf8");

export function makeStore(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: k => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { data.set(k, String(v)); },
    removeItem: k => { data.delete(k); },
    clear: () => data.clear()
  };
}
export const snapshot = store => JSON.stringify([...store.data.entries()].sort());

export class FakeElement {
  constructor(tag, attrs = {}) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.dataset = {};
    this.attrs = {};
    this.listeners = {};
    this.textContent = "";
    this.hidden = false;
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "dataset") Object.assign(this.dataset, v);
      else if (k === "text") this.textContent = v;
      else this[k] = v;
    }
  }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  get classList() { return { add() {}, remove() {}, toggle() {}, contains: () => false }; }
  findAll(pred, out = []) { for (const c of this.children) { if (pred(c)) out.push(c); c.findAll?.(pred, out); } return out; }
}

export function makePage({ path = "/", search = "", tab, elements = [] }) {
  const listeners = {};
  const byId = new Map(elements.filter(e => e.id).map(e => [e.id, e]));
  const body = new FakeElement("body");
  const document = {
    readyState: "loading",
    body,
    documentElement: { lang: "es" },
    getElementById: id => byId.get(id) || null,
    querySelector: () => null,
    querySelectorAll: selector => {
      if (selector === "[data-i18n]") return elements.filter(e => e.dataset.i18n);
      if (selector === "[data-lang]") return elements.filter(e => e.dataset.lang);
      return [];
    },
    createElement: tag => new FakeElement(tag),
    addEventListener: (type, fn) => { (listeners[type] ||= []).push(fn); },
    dispatchEvent: event => { for (const fn of listeners[event.type] || []) fn(event); return true; }
  };
  const windowListeners = {};
  const ctx = {
    console, URLSearchParams, JSON, Math, Date, Object, Array, Map, Set, Uint8Array, String, Number, Boolean, Error, TypeError,
    document,
    localStorage: tab.localStorage,
    sessionStorage: tab.sessionStorage,
    location: { pathname: path, search, assign: url => { ctx.__navigated = url; }, replace: url => { ctx.__navigated = url; } },
    history: { replaceState() {}, back: () => { ctx.__historyBack = true; } },
    CustomEvent: class { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } },
    addEventListener: (type, fn) => { (windowListeners[type] ||= []).push(fn); },
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    requestAnimationFrame: () => 0
  };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  return {
    ctx, document, elements,
    load(...files) { for (const f of files) vm.runInContext(source(f), ctx, { filename: f }); return this; },
    ready() { document.readyState = "complete"; document.dispatchEvent({ type: "DOMContentLoaded" }); return this; },
    // Dispara un evento de window (p. ej. «storage» desde otra pestaña).
    fire(type, event = {}) { for (const fn of windowListeners[type] || []) fn(Object.assign({ type }, event)); return this; }
  };
}


export function newTab(local = {}) { return { localStorage: makeStore(local), sessionStorage: makeStore() }; }

// Carga los scripts del controlador de la portada (sin el motor gráfico de main.js).
export function openHome(tab) {
  const page = makePage({ path: "/", tab });
  page.load("main.js", "progreso.js", "flujo-definicion.js", "flujo.js").ready();
  return page;
}
