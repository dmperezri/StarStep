"use strict";
/*
 * StarStep · Definición oficial del flujo (Fase 1).
 *
 * Solo datos: etapas, objetivos, artefactos y equivalencias heredadas.
 * No contiene textos visibles: cada texto se resuelve con StarI18n mediante
 * las claves "flow.*" y "component.*" definidas en main.js.
 *
 * implemented:false marca contenido PREVISTO. Las etapas y objetivos previstos
 * no bloquean el recorrido actual; cuando se implementen bastará con cambiar
 * la bandera y las partidas existentes los encontrarán pendientes.
 */
(function (root, factory) {
  const definition = factory();
  if (typeof module === "object" && module.exports) module.exports = definition;
  if (root) root.StarFlowDefinition = definition;
})(typeof window !== "undefined" ? window : null, function () {

  const SCHEMA_VERSION = 1;

  // Estados de artefacto, en orden. Un artefacto solo avanza, nunca retrocede.
  const ARTIFACT_STATES = ["undiscovered", "located", "inspection_pending", "inspected", "registered"];

  // Actos heredados de progreso.js (starstep_completed) y su grupo de etapas.
  const ACTS = { luna: "moon", marte: "mars", huellas: "footprints" };

  /*
   * Fuentes de evidencia aceptadas por objetivo. Una fuente identifica la
   * mecánica que produjo el evento; las fuentes "provisional" se documentan en
   * docs/FLUJO_OFICIAL.md y serán reemplazadas por los minijuegos previstos.
   */
  const o = (id, extra) => Object.assign({ id, type: "event", implemented: true, sources: [] }, extra);

  const STAGES = [
    // ── PRESENTACIÓN ─────────────────────────────────────────────
    { id: "outstrip_presentation", group: "presentation", page: "/", implemented: false, kind: "narrative",
      objectives: [o("outstrip_presentation.seen", { implemented: false, sources: ["presentation_sequence"] })] },
    { id: "history_intro", group: "presentation", page: "/", implemented: false, kind: "narrative",
      objectives: [o("history_intro.seen", { implemented: false, sources: ["history_sequence", "history_skip"] })] },
    { id: "lito_welcome", group: "presentation", page: "/", implemented: true, kind: "narrative",
      objectives: [o("lito_welcome.heard", { sources: ["transmission", "welcome_skip"] })] },
    { id: "profile", group: "presentation", page: "/astronauta", implemented: true, kind: "interactive", checkpoint: true,
      objectives: [o("profile.alias", { sources: ["avatar_form"], requires: ["alias"] })] },
    { id: "cadet_custom", group: "presentation", page: "/astronauta", implemented: true, kind: "interactive",
      objectives: [o("cadet_custom.avatar", { sources: ["avatar_form"], requires: ["avatar"] })] },
    { id: "chapter_select", group: "presentation", page: "/", implemented: false, kind: "interactive",
      objectives: [o("chapter_select.chapter1", { implemented: false, sources: ["chapter_menu"] })] },

    // ── PRÓLOGO ──────────────────────────────────────────────────
    { id: "launch", group: "prologue", page: "/despegue", implemented: true, kind: "narrative", checkpoint: true,
      objectives: [o("launch.liftoff", { sources: ["launch_sequence"] })] },
    { id: "space_travel", group: "prologue", page: "/despegue", implemented: false, kind: "challenge",
      objectives: [o("space_travel.arrive", { implemented: false, sources: ["travel_minigame"] })] },
    { id: "moon_prologue", group: "prologue", page: "/despegue", implemented: false, kind: "narrative",
      objectives: [o("moon_prologue.seen", { implemented: false, sources: ["prologue_sequence"] })] },

    // ── ACTO I · LUNA ────────────────────────────────────────────
    { id: "moon_landing", group: "moon", act: "luna", page: "/despegue", implemented: true, kind: "narrative",
      objectives: [o("moon_landing.touchdown", { sources: ["descent_sequence"] })] },
    { id: "moon_exploration", group: "moon", act: "luna", page: "/luna", implemented: true, kind: "interactive", checkpoint: true,
      objectives: [
        o("moon_exploration.sample.cont", { type: "artifact", artifact: "cont", implemented: false }),
        o("moon_exploration.sample.basalt10057", { type: "artifact", artifact: "basalt10057", implemented: false }),
        o("moon_exploration.sample.regolith10084", { type: "artifact", artifact: "regolith10084", implemented: false }),
        o("moon_exploration.sample.core", { type: "artifact", artifact: "core", implemented: false }),
        o("moon_exploration.sample.swc", { type: "artifact", artifact: "swc", implemented: false }),
        o("moon_exploration.eagle", { type: "artifact", artifact: "eagle" }),
        o("moon_exploration.plaque", { type: "artifact", artifact: "plaque", implemented: false })
      ] },
    { id: "moon_install_easep", group: "moon", act: "luna", page: "/luna", implemented: false, kind: "challenge", checkpoint: true,
      objectives: [
        o("moon_install_easep.install", { implemented: false, sources: ["easep_install_minigame"] }),
        o("moon_install_easep.easep", { type: "artifact", artifact: "easep", implemented: false })
      ] },
    { id: "moon_install_reflector", group: "moon", act: "luna", page: "/luna", implemented: false, kind: "challenge", checkpoint: true,
      objectives: [
        o("moon_install_reflector.install", { implemented: false, sources: ["reflector_install_minigame"] }),
        o("moon_install_reflector.orient", { implemented: false, sources: ["reflector_orientation_minigame"] }),
        o("moon_install_reflector.reflector", { type: "artifact", artifact: "reflector", implemented: false })
      ] },
    { id: "moon_lab", group: "moon", act: "luna", page: "/luna", implemented: false, kind: "challenge", checkpoint: true,
      objectives: [o("moon_lab.analysis", { implemented: false, sources: ["lab_minigame"] })] },
    { id: "moon_return", group: "moon", act: "luna", page: "/luna", implemented: false, kind: "challenge", checkpoint: true,
      objectives: [o("moon_return.docking", { implemented: false, sources: ["docking_minigame"] })] },
    { id: "moon_reward", group: "moon", act: "luna", page: "/bitacora", implemented: false, kind: "reward",
      objectives: [o("moon_reward.certificate", { implemented: false, sources: ["certificate_download"] })] },

    // ── TRANSICIÓN ───────────────────────────────────────────────
    { id: "mars_transition", group: "transition", act: "marte", page: "/marte", implemented: false, kind: "narrative",
      objectives: [o("mars_transition.seen", { implemented: false, sources: ["transition_sequence"] })] },

    // ── ACTO II · MARTE ──────────────────────────────────────────
    { id: "mars_landing", group: "mars", act: "marte", page: "/marte", implemented: false, kind: "narrative", checkpoint: true,
      objectives: [o("mars_landing.touchdown", { implemented: false, sources: ["mars_landing_sequence"] })] },
    { id: "mars_exploration", group: "mars", act: "marte", page: "/marte", implemented: true, kind: "interactive", checkpoint: true,
      objectives: [
        o("mars_exploration.lander", { type: "artifact", artifact: "lander", implemented: false }),
        o("mars_exploration.opportunity", { type: "artifact", artifact: "opportunity" })
      ] },
    { id: "mars_hematite", group: "mars", act: "marte", page: "/marte", implemented: true, kind: "challenge", checkpoint: true,
      objectives: [
        o("mars_hematite.blueberries", { type: "artifact", artifact: "blueberries" }),
        o("mars_hematite.enigma", { implemented: false, sources: ["hematite_enigma"] })
      ] },
    { id: "mars_gypsum", group: "mars", act: "marte", page: "/marte", implemented: false, kind: "challenge", checkpoint: true,
      objectives: [
        o("mars_gypsum.gypsum", { type: "artifact", artifact: "gypsum", implemented: false }),
        o("mars_gypsum.enigma", { implemented: false, sources: ["gypsum_enigma"] })
      ] },
    { id: "mars_clay", group: "mars", act: "marte", page: "/marte", implemented: false, kind: "challenge", checkpoint: true,
      objectives: [
        o("mars_clay.clay", { type: "artifact", artifact: "clay", implemented: false }),
        o("mars_clay.enigma", { implemented: false, sources: ["clay_enigma"] })
      ] },
    { id: "mars_habitability", group: "mars", act: "marte", page: "/marte", implemented: false, kind: "challenge",
      objectives: [o("mars_habitability.answer", { implemented: false, sources: ["habitability_question"] })] },
    { id: "mars_storm", group: "mars", act: "marte", page: "/marte", implemented: false, kind: "challenge", checkpoint: true,
      objectives: [o("mars_storm.survive", { implemented: false, sources: ["storm_2018_minigame"] })] },
    { id: "mars_reward", group: "mars", act: "marte", page: "/bitacora", implemented: false, kind: "reward",
      objectives: [o("mars_reward.certificate", { implemented: false, sources: ["certificate_download"] })] },

    // ── ACTO III · HUELLAS ───────────────────────────────────────
    { id: "footprints", group: "footprints", act: "huellas", page: "/huellas", implemented: true, kind: "challenge", checkpoint: true,
      objectives: ["eagle", "easep", "reflector", "plaque", "lander", "opportunity"].map(id =>
        o("footprints.pair." + id, { sources: ["matching_game"] })) },
    { id: "eagle_connection", group: "footprints", act: "huellas", page: "/huellas", implemented: false, kind: "challenge",
      objectives: [o("eagle_connection.link", { implemented: false, sources: ["eagle_connection_minigame"] })] },
    { id: "mirror_method", group: "footprints", act: "huellas", page: "/huellas", implemented: false, kind: "challenge",
      objectives: [1, 2, 3, 4, 5].map(n => o("mirror_method.step" + n, { implemented: false, sources: ["mirror_method"] })) },

    // ── FINALIZACIÓN ─────────────────────────────────────────────
    { id: "chapter_reward", group: "final", page: "/bitacora", implemented: true, kind: "reward", checkpoint: true,
      objectives: [o("chapter_reward.certificate", { sources: ["certificate_download"] })] },
    { id: "return_station", group: "final", page: "/", implemented: false, kind: "narrative",
      objectives: [o("return_station.seen", { implemented: false, sources: ["return_sequence"] })] }
  ];

  /*
   * Artefactos. "components" son los puntos que deben inspeccionarse antes de
   * registrar. "locate" lista las mecánicas válidas para localizarlo.
   * provisional:true => mecánica transitoria del recorrido actual.
   */
  const c = (...ids) => ids.map(id => ({ id }));
  const ARTIFACTS = {
    eagle: { kind: "primary", world: "moon", stage: "moon_exploration", implemented: true,
      locate: [{ mechanic: "rover_proximity_scan" }], components: c("structure", "legs", "ladder") },
    plaque: { kind: "primary", world: "moon", stage: "moon_exploration", implemented: false,
      locate: [{ mechanic: "rover_proximity_scan" }], components: c("plaque", "flag") },
    easep: { kind: "primary", world: "moon", stage: "moon_install_easep", implemented: false,
      locate: [{ mechanic: "easep_install_minigame" }], components: c("antenna", "solar_panel", "seismometer") },
    reflector: { kind: "primary", world: "moon", stage: "moon_install_reflector", implemented: false,
      locate: [{ mechanic: "reflector_install_minigame" }], components: c("prisms", "support") },
    lander: { kind: "primary", world: "mars", stage: "mars_exploration", implemented: false,
      locate: [{ mechanic: "mars_rover_scan" }], components: c("platform", "airbags") },
    opportunity: { kind: "primary", world: "mars", stage: "mars_exploration", implemented: true,
      locate: [{ mechanic: "mars_panel_scan", provisional: true }, { mechanic: "mars_rover_scan" }],
      components: c("pancam", "solar_panels", "wheels") },

    blueberries: { kind: "complementary", world: "mars", stage: "mars_hematite", implemented: true,
      locate: [{ mechanic: "mars_panel_scan", provisional: true }, { mechanic: "mars_rover_scan" }],
      components: c("hematite") },
    gypsum: { kind: "complementary", world: "mars", stage: "mars_gypsum", implemented: false,
      locate: [{ mechanic: "mars_rover_scan" }], components: c("veins") },
    clay: { kind: "complementary", world: "mars", stage: "mars_clay", implemented: false,
      locate: [{ mechanic: "mars_rover_scan" }], components: c("layers") },
    cont: { kind: "complementary", world: "moon", stage: "moon_exploration", implemented: false,
      locate: [{ mechanic: "sample_collect" }], components: c("sample") },
    basalt10057: { kind: "complementary", world: "moon", stage: "moon_exploration", implemented: false,
      locate: [{ mechanic: "sample_collect" }], components: c("sample") },
    regolith10084: { kind: "complementary", world: "moon", stage: "moon_exploration", implemented: false,
      locate: [{ mechanic: "sample_collect" }], components: c("sample") },
    core: { kind: "complementary", world: "moon", stage: "moon_exploration", implemented: false,
      locate: [{ mechanic: "sample_collect" }], components: c("sample") },
    swc: { kind: "complementary", world: "moon", stage: "moon_exploration", implemented: false,
      locate: [{ mechanic: "sample_collect" }], components: c("sample") }
  };

  /*
   * Equivalencias de identificadores anteriores. null = sin equivalencia
   * segura: el registro se conserva en state.legacy.unmapped, pero NO se
   * convierte ni otorga ningún artefacto.
   *  - alsep: en el historial de git (stash cea502b, progreso.js) era
   *    "ALSEP y núcleo · Apollo 15", otro paquete de otra misión. No es EASEP.
   *  - lrrr: Laser Ranging RetroReflector de Apollo 11 = "reflector".
   *  - oppy: apodo de Opportunity; no aparece en el repositorio.
   *  - hem: no aparece en el repositorio; podría ser las esférulas o el
   *    afloramiento con hematita (enigma). Ambiguo.
   */
  const LEGACY_ALIASES = { alsep: null, lrrr: "reflector", oppy: "opportunity", hem: null };

  // Páginas que nunca se bloquean (consulta / navegación libre).
  const OPEN_PAGES = ["/", "/bitacora", "/archivo-nasa", "/diagnostico"];

  return Object.freeze({ SCHEMA_VERSION, ARTIFACT_STATES, ACTS, STAGES, ARTIFACTS, LEGACY_ALIASES, OPEN_PAGES });
});
