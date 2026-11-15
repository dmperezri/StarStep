# StarStep · Flujo oficial del Capítulo 1 (Fase 1)

Este documento describe el controlador central del flujo, **StarFlow**, y el contrato que deben respetar las escenas, los visores y las fases siguientes.

| Archivo | Responsabilidad |
|---|---|
| `static/js/flujo-definicion.js` | Datos: etapas, objetivos, artefactos, equivalencias heredadas. Sin textos visibles. |
| `static/js/flujo.js` | Reglas de negocio (`createStarFlow`, sin DOM) y, al final, el *bootstrap* del navegador (guardas de página, enlaces condicionados, avisos). |
| `static/js/progreso.js` | Almacenamiento local (único dueño de LocalStorage): inventario, actos, perfil, notas y estado del flujo. |
| `tests/js/flujo.test.mjs` | Pruebas del controlador (`node --test tests/js/flujo.test.mjs`). |
| `static/js/archivo-nasa.js` | Galería del Archivo NASA y botón de regreso contextual (sección 5.4). No usa StarFlow. |
| `tests/js/archivo-nasa.test.mjs` | Pruebas de la navegación del archivo en un navegador simulado (`node --test tests/js/`). |
| `tests/js/nueva-partida.test.mjs` | Pruebas de «Nueva partida», de la identidad del jugador y de la bienvenida breve (secciones 5.5 y 5.8). |
| `tests/js/astronauta.test.mjs` | Pruebas del nombre del cadete: pattern del navegador y regla de recorte (sección 5.6). |
| `static/js/intro-secuencia.js` | Secuencia de entrada: OUTSTRIP, idioma, introducción histórica y bienvenida de LITO (sección 5.7), y bienvenida breve de NUEVA PARTIDA (sección 5.8). Solo presentación. |
| `tests/js/intro-secuencia.test.mjs` | Pruebas de la secuencia de entrada (sección 5.7). |
| `tests/js/navegador-simulado.mjs` | Navegador simulado compartido por las pruebas (no es un archivo de pruebas). |
| `tests/test_rutas.py` | Pruebas de las rutas Flask (`python -m unittest tests.test_rutas -v`). |

Orden de carga obligatorio en cada plantilla de juego: `main.js` → `audio.js` → `progreso.js` → `flujo-definicion.js` → `flujo.js` → escena.

---

## 1. Flujo completo del capítulo

Leyenda: ✅ implementada en el recorrido actual · ⏳ prevista (no bloquea).

| # | Grupo | Etapa (`id`) | Página | Estado | Objetivos obligatorios implementados |
|---|---|---|---|---|---|
| 1 | Presentación | `outstrip_presentation` | `/` | ⏳ | — (pantalla implementada como presentación, sección 5.7) |
| 2 | Presentación | `history_intro` | `/` | ⏳ | — (intro implementada como cinemática del jugador, sección 5.7) |
| 3 | Presentación | `lito_welcome` | `/` | ✅ | `lito_welcome.heard` (¡ESTOY LISTO!, sección 5.7; en NUEVA PARTIDA, bienvenida breve, sección 5.8) |
| 4 | Presentación | `profile` | `/astronauta` | ✅ | `profile.alias` |
| 5 | Presentación | `cadet_custom` | `/astronauta` | ✅ | `cadet_custom.avatar` |
| 6 | Presentación | `chapter_select` | `/capitulos` | ✅ | `chapter_select.chapter1` |
| 6a | Prólogo | `chapter_briefing` | `/rock-roll` | ✅ | `chapter_briefing.ready` |
| 7 | Prólogo | `launch` | `/despegue` | ✅ | `launch.liftoff` |
| 8 | Prólogo | `space_travel` | `/vuelo` | ✅ | `space_travel.arrive` |
| 9 | Prólogo | `moon_prologue` | `/despegue` | ⏳ | — |
| 10 | Acto I | `moon_landing` | `/despegue` | ✅ | `moon_landing.touchdown` |
| 11 | Acto I | `moon_exploration` | `/luna` | ✅ | 5 muestras (`cont`, `basalt10057`, `regolith10084`, `core`, `swc`), `eagle` y `plaque` registrados |
| 12 | Acto I | `moon_install_easep` | `/luna` | ✅ | `moon_install_easep.install` + artefacto `easep` |
| 13 | Acto I | `moon_install_reflector` | `/luna` | ✅ | `.install`, `.orient` + artefacto `reflector` |
| 14 | Acto I | `moon_return` | `/luna` | ✅ | `moon_return.docking` (acoplamiento con Columbia) |
| 15 | Acto I | `moon_lab` | `/luna` | ✅ | `moon_lab.analysis` (laboratorio en la Tierra) |
| 16 | Acto I | `moon_reward` | `/bitacora` | ⏳ | — |
| 17 | Transición | `mars_transition` | `/marte` | ✅ | `mars_transition.seen` |
| 18 | Acto II | `mars_landing` | `/marte` | ✅ | `mars_landing.touchdown` |
| 19 | Acto II | `mars_exploration` | `/marte` | ✅ | artefactos `lander` y `opportunity` registrados |
| 20 | Acto II | `mars_hematite` | `/marte` | ✅ | artefacto `blueberries` registrado (enigma ⏳) |
| 21 | Acto II | `mars_gypsum` | `/marte` | ✅ | `mars_gypsum.enigma` + artefacto `gypsum` |
| 22 | Acto II | `mars_clay` | `/marte` | ✅ | `mars_clay.enigma` + artefacto `clay` |
| 23 | Acto II | `mars_habitability` | `/marte` | ✅ | `mars_habitability.answer` |
| 24 | Acto II | `mars_storm` | `/marte` | ✅ | `mars_storm.survive` |
| 25 | Acto II | `mars_reward` | `/bitacora` | ⏳ | — |
| 26 | Acto III | `footprints` | `/huellas` | ✅ | 6 asociaciones `footprints.pair.<id>` |
| 27 | Acto III | `eagle_connection` | `/huellas` | ✅ | `eagle_connection.link` |
| 28 | Acto III | `mirror_method` | `/huellas` | ✅ | 5 pasos `mirror_method.step1..5` |
| 29 | Final | `chapter_reward` | `/bitacora` | ✅ | `chapter_reward.certificate` |
| 30 | Final | `return_station` | `/` | ⏳ | — |

Los objetivos de una misma etapa no tienen orden entre sí (p. ej. las cinco muestras, Eagle y la placa en `moon_exploration`), pero **todos** los obligatorios implementados deben cumplirse antes de avanzar.

Las etapas no necesitan una página propia: varias etapas comparten página y se distinguen por el estado del controlador.

## 2. Prerrequisitos y reglas de desbloqueo

* El flujo es **lineal**: `canEnter(etapa)` exige que todas las etapas *implementadas* anteriores estén completadas.
* Una etapa prevista (`implemented:false`) se trata como inexistente: no bloquea, no se puede completar y no aparece como actual. Al implementarla, las partidas existentes la encontrarán pendiente (la etapa actual se recalcula al cargar).
* Lo mismo aplica por objetivo: un objetivo previsto no cuenta para completar su etapa.
* La etapa actual siempre es la primera etapa implementada no completada.
* Los actos heredados (`luna`, `marte`, `huellas` en `starstep_completed`) se derivan de las etapas: un acto está completo cuando todas sus etapas implementadas lo están. Ninguna pantalla decide por su cuenta qué acto se completó.
* Cada evento de juego llega con **evidencia** (`{source: 'launch_sequence'}`, etc.). Solo se aceptan las fuentes declaradas en la definición; las demás se rechazan con `INVALID_EVIDENCE`.

## 3. Estados de artefactos

```
undiscovered → located → inspection_pending → inspected → registered
```

| Transición | Función | Condición |
|---|---|---|
| → `located` | `locateArtifact(id, {mechanic})` | Mecánica declarada para ese artefacto y etapa del artefacto actual o ya completada. |
| → `inspection_pending` | `beginInspection(id, {context:'mission', viewer})` | Artefacto localizado. |
| componentes | `inspectComponent(id, componente, {context:'mission', viewer:'3d'\|'fallback'})` | Inspección iniciada; componente válido. |
| → `inspected` | automático | Todos los componentes requeridos inspeccionados. |
| → `registered` | `registerDiscovery(id, {context:'mission'})` (automático al completar la inspección) | Estado `inspected`, etapa válida, contexto de misión. |

**Nunca** se registra si: la etapa del artefacto todavía no se puede jugar, no se localizó con su mecánica, la inspección está incompleta o la petición viene de la bitácora (`context:'journal'`, que es el valor por defecto). El visor 3D y la ficha alternativa usan la misma puerta (`window.openStarArtifact`) y las mismas funciones; la ficha alternativa ya no tiene el botón «GUARDAR DESCUBRIMIENTO».

Componentes por artefacto (identificadores estables, traducidos con `component.<artefacto>.<componente>`):

| Artefacto | Tipo | Etapa | Mecánica de localización | Componentes |
|---|---|---|---|---|
| `eagle` | principal | `moon_exploration` | `rover_proximity_scan` (tecla E en `juego/luna.js`) | `structure`, `legs`, `ladder` |
| `plaque` | principal ⏳ | `moon_exploration` | `rover_proximity_scan` | `plaque`, `flag` |
| `easep` | principal ⏳ | `moon_install_easep` | `easep_install_minigame` | `antenna`, `solar_panel`, `seismometer` |
| `reflector` | principal ⏳ | `moon_install_reflector` | `reflector_install_minigame` | `prisms`, `support` |
| `lander` | principal ⏳ | `mars_exploration` | `mars_rover_scan` | `platform`, `airbags` |
| `opportunity` | principal | `mars_exploration` | `mars_panel_scan` **(provisional)** | `pancam`, `solar_panels`, `wheels` |
| `blueberries` | complementario | `mars_hematite` | `mars_panel_scan` **(provisional)** | `hematite` |
| `gypsum`, `clay` | complementarios ⏳ | `mars_gypsum`, `mars_clay` | `mars_rover_scan` | `veins` / `layers` |
| `cont`, `basalt10057`, `regolith10084`, `core`, `swc` | complementarios ⏳ | `moon_exploration` | `sample_collect` | `sample` |

`mars_panel_scan` es el botón actual del panel de Marte. Se acepta solo como localización transitoria para no bloquear el recorrido; la inspección completa sigue siendo obligatoria. Debe reemplazarse por la exploración con el rover en la fase de mecánicas.

## 4. Bitácora

* Siempre accesible (`/bitacora` es página abierta).
* El visor de estaciones solo lista descubrimientos **registrados** y los abre en modo consulta (`context:'journal'`), que nunca cambia el estado.
* El certificado sigue dependiendo de los tres actos (`StarProgress.canFinish()`); al descargarlo se registra `chapter_reward.certificate`.

## 5. Navegación y checkpoints

* **Guarda de página** (`checkPage`): se ejecuta al cargar cada página y al volver desde el historial (`pageshow` con caché). Si ninguna etapa implementada de esa página se puede jugar, redirige a la página de la etapa actual con `?flujo=bloqueado` y muestra un aviso traducido.
* **Enlaces condicionados**: `<a data-flow-requires="etapa">`. Hoy: «SALTAR INTRO» (`moon_exploration`), «ACTO II: MARTE» (`mars_exploration`), «CONTINUAR A HUELLAS» (`footprints`).
* Páginas abiertas: `/`, `/bitacora`, `/archivo-nasa`, `/diagnostico`. Volver al menú no completa nada.
* **Checkpoint**: la última etapa con `checkpoint:true` que ya se puede jugar. `resume()` devuelve `{stage, page}` para recuperar la partida. Recargar la página reconstruye el mismo estado y la misma guarda.
* **Pausa**: `pause()` rechaza nuevos eventos (`PAUSED`) hasta `resume()`.

### 5.1 Regreso al menú (Fase 1.1)

Enlaces internos a la portada `/`: **TIERRA** (`luna.html`, `data-i18n="moon.earth"`) y **← VOLVER** (`astronauta.html`). Marte, Huellas y la bitácora no tienen enlace a `/`; solo se llega por URL o por el historial del navegador, y se aplica la misma regla.

| Situación | Portada muestra |
|---|---|
| Apertura inicial: primera página de la pestaña o sesión del navegador | Bienvenida de LITO |
| Pestaña abierta directamente en `/archivo-nasa` y luego VOLVER AL MENÚ, con `lito_welcome` completada | Menú de misión (el archivo también marca la sesión, sección 5.4) |
| Bienvenida todavía no completada (partida nueva), en cualquier caso | Bienvenida (es obligatoria) |
| Navegación interna en la misma sesión con `lito_welcome` completada (TIERRA, VOLVER, URL, atrás/adelante) | Menú de misión, sin narración ni sonido |
| Recarga de la portada (F5) | `getHomeMode()` sigue devolviendo `'menu'`, pero la portada la trata como apertura real: OUTSTRIP → idioma → intro (con SALTAR) → menú (sección 5.7) |

* La decisión la toma `StarFlow.getHomeMode()` (`'welcome'` o `'menu'`) con una marca de sesión en `sessionStorage` (`starstep_sesion`). Es solo presentación: no forma parte del estado del flujo, no se sincroniza y no otorga progreso.
* Volver al menú **no** completa objetivos, no cambia artefactos, no mueve la etapa actual ni el checkpoint. Si el jugador vuelve a escuchar la transmisión, `recordObjective` responde `ALREADY_COMPLETED` sin efecto.
* Cambiar ES/EN en el menú traduce el menú sin reproducir la bienvenida. (Antes, en la apertura inicial, cambiar el idioma desde el menú volvía a mostrar la bienvenida; la secuencia de la sección 5.7 lo reemplaza: el idioma se elige antes de la intro.)
* La marca `sessionStorage` es **transitoria**. En las Fases 2 y 3 se distinguirán las preferencias del perfil, las cinemáticas vistas y el inicio de una sesión.

### 5.1.1 Botón principal: iniciar, continuar o consultar

El botón existente del menú (`#adventureButton`) cambia de texto y destino según `StarFlow.getEntryPoint()`, que es de **solo lectura**: no completa objetivos, no avanza etapas ni registra artefactos.

| `getEntryPoint().status` | Condición | Texto ES / EN | Destino |
|---|---|---|---|
| `new` | `profile` sin completar (la bienvenida sola no inicia una partida) | INICIAR AVENTURA / START ADVENTURE | `/astronauta` |
| `in_progress` | Hay una etapa implementada pendiente | CONTINUAR AVENTURA / CONTINUE ADVENTURE | página de la etapa actual (p. ej. `/luna`) |
| `provisional_complete` | Todas las etapas implementadas completadas | CONSULTAR PROGRESO / VIEW PROGRESS | `/bitacora` (no reinicia nada) |
| `official_complete` | Todas las etapas, incluidas las previstas | CONSULTAR PROGRESO / VIEW PROGRESS | `/bitacora` |

* Continuar no vuelve a pedir alias ni avatar y no repite el despegue si ya se completó. La página de destino siempre pasa la guarda; las etapas futuras siguen bloqueadas.
* «ELEGIR AVATAR» sigue disponible para cambiar el avatar. Si el despegue ya se completó, al guardar vuelve a la misión actual en lugar de repetir el despegue.
* **Limitación:** no se guarda la posición exacta dentro de la escena. Al continuar en `/luna`, el rover vuelve al inicio del terreno. Lo que sí se conserva es el estado de los artefactos: si Eagle ya estaba localizado, «VISOR DE EAGLE 3D» abre directamente la inspección. En Marte y Huellas no hay posición que perder.
* No hay múltiples partidas: una por navegador (LocalStorage).

### 5.2 Sustitución prevista: menú de pausa

El botón TIERRA es transitorio. En la fase de interfaz se reemplazará por un botón **PAUSA** en cada escena de misión:

1. Al abrirlo: `StarFlow.pause()` (los eventos de juego quedan rechazados con `PAUSED`), se detienen el motor, el audio y la narración.
2. Opciones: **Reanudar** (`resume()`), **Guardar** (`saveCheckpoint()` con confirmación visual), **Idioma ES/EN**, **Audio**, **Bitácora** (solo consulta) y **Volver a la Tierra**.
3. **Volver a la Tierra** pide confirmación e informa qué se conserva (objetivos, artefactos localizados o inspeccionados, checkpoint) y qué se pierde (posición del rover y estado temporal del minijuego). Guarda el checkpoint antes de salir y llega a la portada en modo menú.
4. El menú de la portada agregará **CONTINUAR**, que usa `resume().page` para volver al último checkpoint.
5. Todos los textos nuevos necesitan claves ES/EN; los identificadores siguen siendo estables.

### 5.3 Recompensas provisionales y oficiales

| Concepto | Provisional (Fase 1) | Oficial |
|---|---|---|
| Acto (`getActStatus`) | Etapas **implementadas** del acto completas → `provisional` | Todas las etapas del acto, incluidas las previstas → `official` |
| Capítulo (`getChapterStatus`) | `provisional_complete` | `official_complete` |
| Insignias de la bitácora | Una por acto (Explorador lunar, Detective de agua en Marte, Guardián de huellas), con la etiqueta **PROVISIONAL** | Sin etiqueta |
| Certificado PNG y sección imprimible | «CERTIFICADO DE RECORRIDO PROVISIONAL · VERSIÓN DE PRUEBA · NO ES EL CERTIFICADO OFICIAL» / «PROVISIONAL RUN CERTIFICATE · TEST VERSION · NOT THE OFFICIAL CERTIFICATE»; archivo `StarStep-Certificado-Provisional-<alias>.png` / `StarStep-Provisional-Certificate-<alias>.png` | Textos originales («CERTIFICADO DE RECONOCIMIENTO»), conservados en el código para cuando el capítulo oficial exista |

Mientras existan etapas previstas, ningún acto ni el capítulo pueden ser oficiales. El objetivo `chapter_reward.certificate` significa «certificado emitido» y en la versión 1 registra el certificado **provisional**. Los certificados lunar, marciano y final usarán objetivos nuevos (p. ej. `moon_reward.certificate`, ya previsto).

**Causa del fallo de insignias (corregido):** `bitacora.js` tenía una sola regla, «Explorador lunar si Eagle está en el inventario». No existían insignias de Marte ni de Huellas y la bitácora no consultaba los actos. Ahora las insignias se derivan de `StarFlow.getActStatus()`.

### 5.4 Navegación contextual del Archivo NASA (Fase 1.1)

**Fallo corregido:** el botón de regreso de `/archivo-nasa` era un enlace fijo a `/bitacora` con el texto «VOLVER A LA BITÁCORA», aunque el jugador llegara desde el menú principal o desde Marte.

**Solución:** cada enlace al archivo declara su procedencia con `?desde=<origen>` (`url_for('archivo_nasa', desde=…)`), y `archivo-nasa.js` resuelve el destino contra una lista cerrada (`StarArchive.RETURN_ROUTES`):

| Procedencia | Enlace | Botón ES / EN | Destino |
|---|---|---|---|
| Menú principal (`index.html`) | `/archivo-nasa?desde=menu` | VOLVER AL MENÚ / BACK TO MENU | `/` |
| Bitácora (`bitacora.html`) | `/archivo-nasa?desde=bitacora` | VOLVER A LA BITÁCORA / BACK TO JOURNAL | `/bitacora` |
| Marte (`marte.html`) | `/archivo-nasa?desde=marte` | VOLVER A MARTE / BACK TO MARS | `/marte` |
| URL directa, valor desconocido o manipulado | `/archivo-nasa` | VOLVER AL MENÚ / BACK TO MENU | `/` |

* **Lista permitida:** el parámetro solo selecciona una clave; nunca se usa como URL. Valores como `https://…`, `//…`, `/bitacora`, `__proto__` o mayúsculas caen en el menú. La lista está congelada (`Object.freeze`).
* **Recarga e idioma:** la procedencia vive en la URL, así que recargar la conserva. El botón usa claves i18n (`science.back.menu`, `science.back.journal`, `science.back.mars`), y cambiar ES/EN lo traduce sin cambiar el destino. La clave antigua `science.back` se conserva por compatibilidad.
* **Sin `history.back()`:** el botón es un enlace con `href` explícito. El botón «atrás» del navegador sigue funcionando por su cuenta.
* **Sin JavaScript:** la plantilla trae por defecto `href="/"` y «VOLVER AL MENÚ».
* **Bienvenida:** al volver al menú se aplica `getHomeMode()` (sección 5.1). El archivo no carga `flujo.js`, pero escribe la misma marca de sesión (`starstep_sesion`). Así, una pestaña abierta directamente en el archivo vuelve al menú sin repetir una bienvenida ya completada. En una partida nueva la bienvenida sigue siendo obligatoria.
* **Solo consulta:** `archivo-nasa.html` no carga `progreso.js`, `flujo-definicion.js` ni `flujo.js`. Consultar el archivo no registra artefactos, no completa objetivos, no desbloquea misiones y no ejecuta la migración. Solo puede escribir la preferencia de idioma (`starstep_lang`) si el jugador cambia ES/EN.
* Diseño, fotografías, textos científicos y créditos sin cambios: la galería se dibuja con el mismo código, ahora dentro del bloque del navegador de `archivo-nasa.js`.
* **Marte:** `marte.html` también enlazaba al archivo y sufría el mismo fallo, así que se incluyó en la lista. Si Marte está bloqueado y alguien escribe `?desde=marte` a mano, la guarda de `/marte` lo redirige al checkpoint.

Pruebas: `tests/js/archivo-nasa.test.mjs` (17 pruebas: lista permitida, los tres casos en ES y EN, recarga, cambio de idioma, galería y créditos, ausencia de efectos sobre el progreso, bienvenida no repetida, URL directa con partida nueva y existente, enlaces de las plantillas) y `tests/test_rutas.py` (enlaces renderizados por Flask, valor por defecto y que el servidor no refleje el parámetro).

### 5.5 Nueva partida e identidad del jugador (Fase 1.1)

**¿Cómo se sabe que un jugador es nuevo?** Todavía no hay cuentas: **un jugador = un navegador** (LocalStorage).

| Situación | Cómo lo detecta StarFlow | Resultado |
|---|---|---|
| Navegador sin datos de StarStep | No existe `starstep_flujo` ni datos heredados | `freshState()` crea un invitado `guest-…` con identificador nuevo; `getEntryPoint().status === 'new'` |
| Mismo navegador, partida guardada | Existe `starstep_flujo` | Mismo `player.id`; continúa donde quedó |
| Bienvenida hecha, perfil sin completar | `profile` no completada | Sigue siendo `new` (la bienvenida sola no inicia una partida, sección 5.1.1) |
| Otro jugador en la **misma** computadora | **No se puede detectar** | Vería la partida anterior → necesita **NUEVA PARTIDA** |

El alias no identifica a nadie (dos niños pueden llamarse igual y uno puede cambiarlo). La identidad real por jugador corresponde a la Fase 2 (sección 15).

**Botón NUEVA PARTIDA / NEW GAME** (menú de la portada):

* Solo aparece si hay algo que borrar: `getEntryPoint().status !== 'new'` o hay datos personales (`StarProgress.hasPersonalData()`). Un jugador nuevo no lo ve.
* Abre un diálogo de confirmación bilingüe (`role="alertdialog"`). El foco queda en **CANCELAR**, y Escape también cancela. El texto dice qué se borra, qué se conserva y que no se puede deshacer.
* Al confirmar, `StarProgress.resetPlayerData()` borra **juntas** las claves de `StarProgress.PLAYER_KEYS`: `starstep_flujo`, `starstep_flujo_respaldo`, `starstep_inventario`, `starstep_completed`, `starstep_astronauta`, `starstep_notas` y `starstep_foto`. Después LITO da una bienvenida breve y el jugador va directo a `/astronauta` (sección 5.8). Allí StarFlow crea un invitado nuevo; perfil, cadete, capítulo y misiones vuelven a ser obligatorios.
* Se conservan las preferencias del dispositivo (`PREFERENCE_KEYS`: `starstep_lang`, `starstep_audio` y `starstep_cinematicas`, la intro histórica vista).
* **Por qué se borran juntas:** si quedara el inventario, los actos o el perfil heredados, la migración (sección 8) reconstruiría la partida anterior. Hay una prueba de control que lo demuestra.
* **Escrituras tardías:** tras el reinicio, `progreso.js` bloquea toda escritura hasta recargar. Así el controlador en memoria no puede volver a guardar la partida borrada.
* **Otras pestañas:** una pestaña con la partida anterior escucha el evento `storage`. Si se borra `starstep_flujo` (o todos los datos del sitio), deja de guardar y vuelve a `/`. Esto reduce el riesgo de las dos pestañas (sección 14) para este caso.
* No toca el servidor ni la base de datos. Si el navegador impide borrar, se muestra `flow.notice.resetFailed` y no se recarga.
* Toda clave `starstep_*` usada en `static/js` debe estar clasificada en `PLAYER_KEYS`, `PREFERENCE_KEYS` o `SESSION_KEYS` (sessionStorage de la pestaña: `starstep_sesion`, `starstep_nueva_partida`); hay una prueba que falla si aparece una clave nueva sin clasificar.

Pruebas: `tests/js/nueva-partida.test.mjs` (15 pruebas: jugador nuevo y existente, borrado completo con preferencias conservadas, volver a jugar con resultados nuevos, control de la migración, escrituras tardías, otra pestaña, clasificación de claves, botón y textos ES/EN, y las 6 de la bienvenida breve de la sección 5.8) y `tests/test_rutas.py` (la portada incluye el botón oculto y el diálogo).

### 5.6 Nombre del cadete (Fase 1.1)

**Fallos corregidos:**

1. El atributo `pattern` del campo alias (`astronauta.html`) no era válido con la bandera `v` que usan los navegadores (guion final sin escapar en la clase). El navegador lo ignoraba en silencio y aceptaba cualquier texto. Ahora es `[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 _\-]{2,18}`.
2. Un alias vacío, de solo espacios o de un carácter rodeado de espacios (« A ») pasaba la validación y se guardaba vacío o de un carácter.

**Regla única:** `StarFlowCore.normalizeAlias(valor)` (en `flujo.js`, sin DOM). Normaliza a NFC, aplica `trim()` y **después** valida: entre 2 y 18 caracteres, solo letras con tildes, ü y ñ, números, espacios internos, guion y guion bajo. Devuelve `{ok:true, alias}` o `{ok:false, code}` con `ALIAS_EMPTY`, `ALIAS_LENGTH` o `ALIAS_CHARS`. La usan:

| Capa | Comportamiento |
|---|---|
| Formulario (`astronauta.js`) | Valida el texto recortado al enviar. Si falla, muestra un mensaje propio en ES/EN (`alias.error.empty`, `alias.error.length`, `alias.error.chars`) con `setCustomValidity`. Si es válido, el campo muestra el nombre recortado. Cambiar de idioma traduce el mensaje; escribir lo borra. |
| Almacenamiento (`StarProgress.setPlayer`) | Guarda el alias recortado. Si no es válido, devuelve `false` y no escribe nada. |
| Controlador (`recordObjective('profile.alias')`) | Rechaza con `INVALID_EVIDENCE` un alias que no cumpla la regla, así que el perfil no se completa. |

El `pattern` de HTML se mantiene como respaldo sin JavaScript. No puede expresar el recorte, por eso la regla definitiva está en JS. Los alias heredados ya guardados no se modifican.

Pruebas: `tests/js/astronauta.test.mjs` (14 pruebas). Cubren el pattern compilado con la bandera `v`, solo espacios, un carácter rodeado de espacios, nombres válidos con espacios al principio o al final, tildes combinadas, la misma regla en el almacenamiento y el controlador, y el formulario real en ES y EN.

### 5.7 Secuencia de entrada de la portada (rediseño visual)

`static/js/intro-secuencia.js` (`window.StarIntro`) muestra, encima de la lógica de StarFlow:

```
OUTSTRIP → selector de idioma → introducción histórica → bienvenida de LITO → menú principal
```

**Qué pasos se muestran** lo decide `StarIntroCore.planEntry()` (función pura, probada en Node) con tres datos:

| Dato | Fuente | Alcance |
|---|---|---|
| Apertura real | `StarFlow.isInitialOpening()`: primera página de la pestaña (marca `starstep_sesion`, sección 5.1) | Sesión |
| Intro histórica vista | `StarProgress.hasSeenCinematic('history_intro')` (clave `starstep_cinematicas`): decide si aparece SALTAR | Dispositivo (preferencia; NUEVA PARTIDA la conserva) |
| Bienvenida completada | `StarFlow.isStageCompleted('lito_welcome')` | Jugador (partida) |

| Situación | Pasos |
|---|---|
| Pestaña nueva, jugador nuevo | OUTSTRIP → idioma → intro (sin SALTAR) → LITO → menú (INICIAR AVENTURA) |
| Pestaña nueva, intro vista y bienvenida completada | OUTSTRIP → idioma → intro en el idioma elegido **con SALTAR** → menú (CONTINUAR AVENTURA si hay partida) |
| Pestaña nueva, partida anterior a este cambio (bienvenida completada, intro sin ver) | OUTSTRIP → idioma → intro (sin SALTAR hasta verla completa una vez) → menú |
| Regreso desde Luna, Marte, Huellas, bitácora o Archivo NASA (sin recargar) | Menú directo (es exactamente `getHomeMode() === 'menu'`) |
| Recarga de la portada (F5), con intro y bienvenida completadas | OUTSTRIP → idioma → intro con SALTAR → menú. LITO no se repite. |
| Recarga a mitad de la secuencia | OUTSTRIP → idioma → intro (si no se terminó, desde la escena 1, sin SALTAR) → LITO → menú |
| Volver a la portada sin recargar a mitad de la secuencia | Sin OUTSTRIP ni idioma: continúa con la intro y/o LITO pendientes |
| «VER INTRODUCCIÓN» en el menú | Intro con SALTAR → menú. No toca la partida. |
| NUEVA PARTIDA confirmada | Bienvenida breve de LITO → `/astronauta` (sección 5.8). Sin OUTSTRIP, idioma, intro, bienvenida extensa ni menú. |

**Pasos:**

1. **OUTSTRIP**: pantalla propia con «OUTSTRIP» y «Two Worlds, Two Stories», estrellas y destello en CSS (no hay logo independiente de OUTSTRIP). Dura 3,2 s (1,5 s con `prefers-reduced-motion`) y avanza sola. No se puede omitir en la apertura real; no se muestra en regresos internos.
2. **Idioma**: logo StarStep, consigna en ambos idiomas (la del idioma guardado arriba), botones ESPAÑOL / ENGLISH; el guardado aparece marcado. La elección usa `StarI18n.setLang()` (misma clave `starstep_lang`) y es el primer gesto del jugador: desde ahí se habilitan música y voz. Aparece en **cada apertura real**, antes de la intro.
3. **Introducción histórica**: aparece **después de cada elección de idioma** (apertura real o recarga), con títulos, subtítulos, botones y narración en el idioma elegido. Son cinco escenas pixel art en un canvas 480×270 sin recursos externos. Reutiliza `launchScene`, `descentScene` y `lito` de `scene.js` sin modificarlo; Curiosidad, Marte y el cierre se dibujan en `intro-secuencia.js`. Cada escena tiene título, subtítulo y narración (si la voz está activa), SIGUIENTE / NEXT y un botón de voz. **SALTAR solo aparece si ya se vio completa alguna vez** (la primera vez no se puede saltar). Se marca como vista al pulsar SIGUIENTE en la escena 5. En un regreso interno con la bienvenida pendiente (p. ej. volver sin recargar a mitad de la secuencia) solo aparece si todavía no se vio.
4. **Bienvenida de LITO**: pantalla propia dentro de la presentación (`#introLito`). Muestra LITO animado sobre el campo de estrellas, el panel crema con el texto animado, la voz de LITO, «¡ESTOY LISTO! / I'M READY!» e ES/EN/voz. Al confirmar registra `lito_welcome.heard` con la evidencia de siempre (`transmission`). Tocar el texto completa la animación. La bienvenida antigua sobre el escenario terrestre (`#welcome`) se eliminó.
5. **Menú**: sin cambios (`getEntryPoint()`, NUEVA PARTIDA, etc.), más «VER INTRODUCCIÓN / WATCH INTRO», visible solo si la intro ya se vio.

**Continuidad visual (sin cortes):**

* `<body class="… is-entering">` viene así desde el HTML. Desde el **primer renderizado**, el escenario terrestre, el HUD, el logotipo, el menú, la etiqueta del capítulo y los diálogos están ocultos (`opacity:0; visibility:hidden`), también mientras se decide el modo de entrada.
* `#introSequence` es un **contenedor permanente a pantalla completa**: visible desde el inicio (fondo `--night`) y con el telón `#introFade` opaco (`#0E1233`).
* Cada cambio de etapa es un **fundido a azul noche de 420 ms**. El telón se vuelve opaco, se cambia la pantalla y el telón se aclara. Ninguna etapa recarga la página.
* El escenario y el menú **solo se revelan al entrar al menú**: se quita `is-entering`, el escenario aparece con su propio fundido, el telón se aclara y el contenedor se retira (`hidden`) para no interceptar clics. En el regreso desde una misión ocurre lo mismo, sin pasos previos.
* VER INTRODUCCIÓN funde a azul noche sobre el menú, vuelve a ocultar el escenario y al terminar repite el fundido de entrada al menú.
* **Sin superposiciones:**
  * un solo fundido activo (uno nuevo anula los temporizadores del anterior); los clics se ignoran mientras el telón se oscurece (evita dobles avances) y la pantalla nueva responde en cuanto aparece, aunque el telón siga aclarándose;
  * antes de cada narración se detiene la anterior;
  * un solo bucle de animación por pantalla;
  * la estación terrestre (`earthScene`) solo se anima desde que el menú está a la vista;
  * `startMusic()` no duplica la música.
* **Movimiento reducido** (`prefers-reduced-motion`): cambios inmediatos sin fundidos, OUTSTRIP de 1,5 s y sin animaciones de estrellas, destello ni logotipo.

**Recarga:** una recarga de la portada (Navigation Timing `type === 'reload'`) cuenta como apertura real y vuelve a mostrar OUTSTRIP, el selector de idioma y la intro (con SALTAR si ya se vio). LITO no se repite si ya se completó. Ir a la portada sin recargar (TIERRA, VOLVER AL MENÚ, atrás) sigue siendo regreso interno. `getHomeMode()` y `flujo.js` no cambian para esto: la distinción está en `intro-secuencia.js`.

**Cambiar ES/EN durante la secuencia** (selector, barra de la intro o HUD durante LITO) traduce la pantalla actual y vuelve a narrarla en el idioma nuevo, sin cambiar de escena.

**Decisiones conservadoras:**

* `outstrip_presentation` e `history_intro` siguen como etapas **previstas** (`implemented:false`). Volverlas obligatorias en StarFlow bloquearía las partidas existentes (la etapa actual se recalcula). La intro vista se guarda como **cinemática del jugador** en `progreso.js`, fuera del estado del flujo.
* `starstep_cinematicas` es una **preferencia del dispositivo** (`PREFERENCE_KEYS`), no un dato de la partida: NUEVA PARTIDA la conserva (pedido del equipo, sección 5.8), así que tras una partida nueva la intro sigue teniendo SALTAR. Por sí sola no hace aparecer NUEVA PARTIDA. (Antes era dato del jugador y NUEVA PARTIDA la borraba.)
* **Cambio de regla (pedido del equipo):** antes la intro solo aparecía la primera vez por jugador. Ahora aparece tras cada elección de idioma, en ese idioma, y solo la primera vez es obligatoria. La «cinemática vista» ya no decide si se muestra, solo si se puede saltar. LITO sigue mostrándose solo hasta completarla.
* Los jugadores con partida previa ven la intro sin SALTAR hasta completarla una vez. Su partida no cambia.
* Si `intro-secuencia.js` no carga, `main.js` muestra el menú directamente. Las guardas siguen exigiendo la bienvenida para avanzar, así que no se desbloquea progreso.
* Reemplaza a la transmisión anterior de tres mensajes (INICIAR TRANSMISIÓN / SALTAR), al panel `#welcome` sobre el escenario y al comportamiento de la sección 5.1 que volvía a mostrar la bienvenida al cambiar el idioma desde el menú en una apertura inicial. `getHomeMode()` no cambia.
* `static/js/intro.js` (prototipo anterior) no está enlazado en ninguna plantilla; no se modificó.

**Limitaciones:** la voz depende de `speechSynthesis` del navegador y de un gesto previo. En una recarga a mitad de la secuencia, el primer texto puede aparecer sin voz hasta el siguiente clic. La intro no guarda en qué escena se quedó el jugador.

Pruebas: `tests/js/intro-secuencia.test.mjs` (32 pruebas; 9 son de la bienvenida breve, sección 5.8). Después de **cada** clic y de **cada** temporizador comprueban que, mientras se ve OUTSTRIP, el idioma, la intro o LITO, el menú y el escenario terrestre no estén visibles y que nunca haya dos pantallas a la vez. También cubren el fundido (telón opaco, ~420 ms, clics ignorados mientras se oscurece y pantalla usable mientras se aclara), la intro repetida en el idioma elegido (ES y EN, textos y narración, con SALTAR), el movimiento reducido, que la Tierra solo se anime en el menú, las voces sin superponerse, el regreso desde Luna, Marte y Huellas, la recarga con OUTSTRIP, la recarga y la vuelta sin recargar a mitad de la secuencia, VER INTRODUCCIÓN con fundido, NUEVA PARTIDA y el HTML/CSS del primer renderizado. También `tests/test_rutas.py` (la portada carga la secuencia).

### 5.8 NUEVA PARTIDA: bienvenida breve y directo al cadete

Antes, al confirmar NUEVA PARTIDA la portada se recargaba y el jugador volvía a pasar por la intro y la bienvenida extensa de LITO, y luego por el menú. Ahora:

```
NUEVA PARTIDA → confirmación → reinicio de la partida → LITO breve (~3 s) → /astronauta → /capitulos → Rock & Roll …
```

1. **Confirmación:** el mismo diálogo de la sección 5.5 (foco en CANCELAR, Escape cancela). CANCELAR no borra nada.
2. **Reinicio:** `StarProgress.resetPlayerData()` borra solo `PLAYER_KEYS`. Se conservan el idioma, el audio (música, efectos y voz) y la intro vista. Si el navegador impide borrar, se muestra `flow.notice.resetFailed` y no pasa nada más. Un segundo clic en confirmar no hace nada.
3. **Bienvenida breve** (`StarIntro.newGameWelcome()`, `intro-secuencia.js`): fundido a azul noche sobre el menú y la pantalla de LITO de la presentación (`#introLito`), con LITO animado, el texto que se escribe y la voz (si está activa):
   * ES: «¡Una nueva aventura nos espera! Prepará tu traje, cadete.»
   * EN: «A new adventure awaits! Get your suit ready, cadet.»

   No hay botón: a los **3 s** el telón se oscurece y la página se va. Si LITO sigue hablando, espera a que termine, como máximo 1 s más, para no cortarlo a mitad de la frase. ES/EN y el botón de voz funcionan durante el mensaje (traducen y vuelven a narrar sin superponer voces). Con `prefers-reduced-motion` no hay fundidos ni texto animado, pero el mensaje dura igual.
4. **Marca de un solo uso:** al terminar el mensaje, `StarProgress.markNewGameWelcome()` guarda `starstep_nueva_partida` en **sessionStorage** (solo esta pestaña). Solo se puede marcar en la página que acaba de reiniciar con éxito. Luego `location.replace('/astronauta')`: «atrás» no vuelve a la portada vieja, cuyo controlador tiene la partida borrada.
5. **`/astronauta`:** al cargar, `flujo.js` consume la marca (`takeNewGameWelcome()`; se borra siempre) y, **solo si la partida está recién creada** (etapa actual `lito_welcome` y ningún objetivo), registra `lito_welcome.heard` con la evidencia nueva `new_game_welcome` (agregada a `flujo-definicion.js`). Después corre la guarda de página de siempre. Es el único objetivo que se registra.
6. El jugador escribe su nombre y elige avatar (sin valores de la partida anterior), y sigue normalmente a `/capitulos` y al flujo de Rock & Roll.

**Qué no se repite:** OUTSTRIP, el selector de idioma, la introducción histórica, la bienvenida extensa de LITO y el menú.

**StarFlow sin atajos:**

* `profile`, `cadet_custom`, `chapter_select`, `chapter_briefing` y las siguientes siguen siendo obligatorias. La bienvenida breve no completa ninguna, no registra artefactos, certificados ni checkpoints y no desbloquea misiones.
* Identificador nuevo (`guest-…`) y checkpoint nuevo en `profile`. No queda nada de la partida anterior: ni descubrimientos, ni objetivos, ni certificados, ni checkpoints del vuelo, ni el nombre y el avatar.
* Sin la marca, `/astronauta` sigue bloqueada para una partida nueva (vuelve a la portada). Con una partida en curso, la marca no tiene efecto (StarFlow tampoco aceptaría el objetivo).

**Casos de borde (decisiones conservadoras):**

| Caso | Resultado |
|---|---|
| Recargar (F5) durante el mensaje | Todavía no hay marca: la portada hace la apertura real completa (OUTSTRIP → idioma → intro con SALTAR → LITO extensa → menú). Nunca se salta la bienvenida sin verla. |
| Cerrar la pestaña durante el mensaje | La partida ya se borró; la próxima apertura es la de un jugador nuevo. |
| `intro-secuencia.js` no carga | No hay bienvenida breve: la portada se recarga sin marca y pide la bienvenida completa (como antes). |
| Otra pestaña con la partida anterior | Deja de guardar y vuelve a `/` (sección 5.5); no revive datos borrados. Si esa pestaña ya creó el invitado nuevo, `/astronauta` lo usa y la marca sigue valiendo mientras la partida esté sin objetivos. |
| Primera apertura de StarStep | Sin cambios (sección 5.7). VER INTRODUCCIÓN sigue disponible en el menú. |

**Limitaciones:**

* La duración depende de la voz del navegador. Si no hay voz en el idioma, el navegador usa otra más lenta y el mensaje puede durar hasta ~4 s, o cortarse al final de ese margen.
* La marca vive en sessionStorage del navegador: quien edite el almacenamiento con las herramientas de desarrollo puede saltarse la bienvenida, igual que puede editar LocalStorage. La validación definitiva corresponde al servidor (Fase 2).
* Con dos pestañas abiertas sigue valiendo «la última escritura gana» (sección 14).

Pruebas: `tests/js/intro-secuencia.test.mjs`:

* recorrido completo en ES y EN: textos, narración, foco, sin menú ni otras pantallas, ~3 s, navegación a `/astronauta` y página siguiente aceptada;
* movimiento reducido, cambio de idioma y voz, espera de la voz (y su máximo), doble confirmación, CANCELAR, recarga durante el mensaje y la variante sin `intro-secuencia.js`.

`tests/js/nueva-partida.test.mjs`:

* marca de un solo uso;
* `/astronauta` con la bienvenida breve: solo `lito_welcome.heard`, identificador nuevo, nada heredado y misiones bloqueadas;
* recorrido perfil → cadete → `/capitulos` → Rock & Roll;
* sin la marca;
* marca sin efecto en una partida en curso;
* otra pestaña.

## 6. Repetición

* `canReplay(etapa)`: solo etapas implementadas, ya completadas y que no sean de recompensa.
* `startReplay` abre un espacio separado (`state.replay.objectives`). Los eventos de la repetición se guardan ahí y **no** tocan `completed`, `objectives`, `artifacts` ni los actos.
* `finishReplay` descarta el espacio de repetición y devuelve un resumen. Las recompensas nunca se duplican: el escritor de `progreso.js` es idempotente.

## 7. Interfaz pública (`window.StarFlow`)

Todas devuelven objetos `{ok:true, …}` o `{ok:false, code}`. Los códigos son estables y se traducen en la interfaz.

| Función | Descripción |
|---|---|
| `getState()` | Copia profunda del estado. |
| `getCurrentStage()` | Etapa actual o `null` si el capítulo terminó. |
| `getObjectives(stageId)` | Objetivos con `implemented` y `done`. |
| `canEnter(stageId)` / `canAdvance()` / `isStageCompleted(stageId)` | Consultas. |
| `recordObjective(objectiveId, evidence)` | Registra un objetivo **no** de artefacto; avanza solo si la etapa queda lista. |
| `completeStage(stageId)` / `advance()` | Validan objetivos; `advance()` mueve la etapa actual. |
| `saveCheckpoint()` / `resume()` / `pause()` | Checkpoints y pausa. |
| `getAvailableStages()` | Lista con estado `planned`/`locked`/`current`/`completed` y si es repetible. |
| `canReplay` / `startReplay` / `finishReplay` | Repeticiones. |
| `isActComplete(act)` | `luna`, `marte`, `huellas`. |
| `getArtifact` / `listRegistered` / `locateArtifact` / `beginInspection` / `inspectComponent` / `registerDiscovery` | Descubrimientos. |
| `checkPage(path)` | Guarda de navegación. |
| `getSyncState()` / `markSynced(revision)` | Contrato de sincronización (Fase 2). |
| `notify(code)` | Aviso visual traducido (`flow.notice.<code>`). |
| `getEntryPoint()` | Punto de entrada para continuar: `{status, stage, page}` (solo lectura, sección 5.1.1). |
| `getActStatus(act)` / `getChapterStatus()` | Recompensas `none`/`provisional`/`official` (sección 5.3). |
| `getHomeMode()` | Solo navegador: `'welcome'` en la apertura inicial, `'menu'` al regresar desde una misión (sección 5.1). |
| `isInitialOpening()` | Solo navegador: `true` si la portada es la primera página de la pestaña (secuencia de entrada, sección 5.7). |

Cambios respecto a la interfaz propuesta: se agregaron `isStageCompleted`, `isActComplete`, las funciones de artefactos, `checkPage`, `getSyncState`, `markSynced` y `notify`. `resume()` además de quitar la pausa devuelve el checkpoint a recuperar.

Códigos: `UNKNOWN_STAGE`, `UNKNOWN_OBJECTIVE`, `UNKNOWN_ARTIFACT`, `UNKNOWN_COMPONENT`, `INVALID_ARGUMENT`, `INVALID_EVIDENCE`, `STAGE_LOCKED`, `NOT_CURRENT_STAGE`, `STAGE_NOT_IMPLEMENTED`, `OBJECTIVE_NOT_IMPLEMENTED`, `ARTIFACT_NOT_IMPLEMENTED`, `ARTIFACT_OBJECTIVE`, `OBJECTIVES_PENDING`, `ALREADY_COMPLETED`, `ALREADY_RECORDED`, `ALREADY_REGISTERED`, `PAUSED`, `ARTIFACT_NOT_LOCATED`, `INSPECTION_NOT_STARTED`, `INSPECTION_INCOMPLETE`, `NOT_REGISTERED`, `CONSULT_ONLY`, `NOT_REPLAYABLE`, `REPLAY_ACTIVE`, `NO_REPLAY`, `CHAPTER_FINISHED`.

## 8. Contrato de persistencia (esquema v1)

Clave local: `starstep_flujo` (respaldo de datos corruptos: `starstep_flujo_respaldo`).

```json
{
  "schemaVersion": 1,
  "player": { "id": "guest-…", "mode": "guest" },
  "revision": 14,
  "createdAt": "ISO-8601", "updatedAt": "ISO-8601",
  "current": "moon_exploration",
  "completed": { "lito_welcome": { "at": "ISO-8601", "via": "play|legacy_migration|reconcile" } },
  "objectives": { "launch.liftoff": { "at": "ISO-8601", "source": "launch_sequence" } },
  "artifacts": { "eagle": { "state": "inspection_pending", "components": ["legs"], "locatedAt": "…", "mechanic": "rover_proximity_scan" } },
  "checkpoint": { "stage": "moon_exploration", "at": "…" },
  "paused": false,
  "replay": null,
  "sync": { "status": "local_only|pending|synced", "lastSyncedRevision": 0,
            "pending": [{ "opId": "guest-…:14", "type": "component_inspected", "payload": {}, "at": "…", "revision": 14 }] },
  "legacy": { "migratedAt": "…", "inventory": ["eagle"], "acts": ["luna"], "unmapped": ["alsep"] }
}
```

* `player.id` cumple el patrón de `valid_id()` de `app.py` (`[a-zA-Z0-9_-]{8,64}`).
* Cada cambio incrementa `revision` y agrega una operación con `opId` único (`<jugador>:<revisión>`). El servidor debe tratar `opId` como clave de idempotencia; `markSynced(rev)` confirma todo lo anterior. Se conservan como máximo 500 operaciones pendientes.
* Datos corruptos (JSON inválido, forma inválida o versión futura): se guarda una copia en `starstep_flujo_respaldo`, se reconstruye el estado desde el respaldo heredado y se marca `state.recovered`. Identificadores desconocidos se apartan en `legacy.unknown`, no se borran sin dejar rastro.
* `progreso.js` sigue siendo el único módulo que toca LocalStorage. StarFlow recibe un escritor de un solo uso (`StarProgress.connectFlow()`) para el inventario y los actos heredados; `StarProgress.unlock()` y `completeAct()` ya no conceden nada.

### Migración de partidas existentes

* Inventario heredado (`starstep_inventario`): cada artefacto conocido pasa a `registered` con `legacy:true` y su fecha original. **No se otorga ningún artefacto nuevo.**
* Equivalencias aceptadas: `lrrr → reflector` (Laser Ranging RetroReflector de Apollo 11; así lo nombran `huellas.js` y `science-content.js`) y `oppy → opportunity` (apodo público del rover; no aparece en el repositorio, se acepta por si existen partidas externas).
* Sin equivalencia: `alsep` (en el historial de git era «ALSEP y núcleo · Apollo 15», otro paquete y otra misión; `app.py` hoy lo convierte por error en `easep`) y `hem` (ambiguo entre las esférulas y el afloramiento). Se conservan en `legacy.unmapped`.
* Actos heredados: se respetan como recompensas obtenidas (marcan como completadas las etapas implementadas de ese acto con `via:'legacy_migration'`). Un perfil heredado completa bienvenida, perfil y avatar; cualquier progreso lunar completa despegue y alunizaje.
* La migración es idempotente: solo corre cuando no existe `starstep_flujo`.

## 9. Hacia los modelos SQLAlchemy (Fase 2)

| StarFlow | Modelo del equipo | Nota |
|---|---|---|
| `player` | `Astronauta` | Requiere `rango_edad`, `avatar_id` y `token_acceso_hash`; el modo invitado necesita una regla para esos campos. |
| `artifacts[id]` | `Descubrimiento` (`inspeccionado`, `componentes_revisados`) | Coincide con el estado y la lista de componentes. Falta un identificador estable en `Artefacto` (p. ej. columna `codigo` = `eagle`). |
| componente | `ComponenteArtefacto.nodo_3d` | Usar el id de componente o `hotspot_N` del GLB. |
| etapa / checkpoint | `Escena` (`orden`, `tipo`) + `Progreso.escena_actual_id` | Agregar un código estable de etapa a `Escena`. |
| acto | `Progreso` por `Mision` (`estado`) | `luna` → misión orden 1, `marte` → orden 2. |
| certificado | `Diploma` | Hoy uno por astronauta (`unique`); el plan de certificados lunar/marciano/final requiere revisar esa restricción. |

La tabla temporal `players` (`starstep.db` en la raíz) **no** se elimina; puede alimentar la migración. No se ejecutó ninguna migración de base de datos en esta fase.

## 10. Protecciones: transitorias y definitivas

Implementadas en el frontend (**transitorias**; un jugador puede manipular LocalStorage o la consola):

* Guardas de página, enlaces condicionados, redirección al checkpoint.
* Validación de etapa, evidencia, inspección y contexto de bitácora.
* Rechazo de identificadores desconocidos y de datos corruptos.

Pendientes en Flask (**obligatorias para declarar el sistema seguro**):

* `/api/descubrimiento` acepta cualquier artefacto de su lista sin verificar localización ni inspección, y convierte `alsep` en `easep`.
* `/api/bitacora` acepta actos completados enviados por el cliente.
* `/api/progreso` no autentica: cualquiera que conozca un `id` puede leerlo o modificarlo.
* Las rutas de páginas (`/luna`, `/marte`, `/huellas`…) no validan progreso en el servidor.

**El sistema no es seguro todavía.** Hoy el frontend ni siquiera llama a estas APIs: el progreso vive solo en LocalStorage.

## 11. Pruebas y comandos reproducibles

Desde la raíz del repositorio en Windows (PowerShell):

```powershell
cd C:\Users\ALS\Desktop\pr\StarStep
.venv\Scripts\activate
node --test tests/js/                    # StarFlow y Archivo NASA (Node 18 o superior)
python -m unittest tests.test_rutas -v   # rutas Flask; usa una base temporal para la API
python -m tests.verificar_bd             # estructura de las 19 tablas (prueba existente)
python app.py                            # http://127.0.0.1:5000
```

Prueba manual sugerida: abrir `/` en una pestaña nueva → SALTAR → INICIAR AVENTURA → avatar → despegue → Luna → TIERRA (menú con CONTINUAR AVENTURA) → continuar (vuelve a `/luna` sin perfil ni despegue). Para empezar de cero: borrar el almacenamiento del sitio en las herramientas del navegador.

## 12. Comparación con el prototipo

`StarStep · Capítulo 1_ Rock & Roll — Prototipo.zip` no estaba en el repositorio ni en la carpeta Descargas (la carpeta `Descargas\StarStep-fase1` solo contiene versiones locales de `progreso.js`, `visor3d.js` y `visor-fallback.js`). No se realizó la comparación ni se supuso su contenido. Las etapas de este documento salen de las decisiones oficiales del equipo; al disponer del prototipo deberán contrastarse sus mecánicas con los objetivos `implemented:false`.

## 13. Dependencias

Sin librerías nuevas. Tiempo de ejecución: navegador con LocalStorage; Three.js local (sin cambios). Pruebas: Node ≥ 18 (`node:test`) y Python con `requirements.txt` (`unittest`).

## 14. Riesgos técnicos

* LocalStorage es por navegador: borrar datos del sitio borra la partida hasta que exista sincronización.
* Dos pestañas abiertas pueden sobrescribirse (última escritura gana). Solo «Nueva partida» escucha el evento `storage` (sección 5.5); el resto de cambios sigue sin sincronizarse entre pestañas.
* Una computadora compartida no distingue jugadores: depende de que alguien pulse NUEVA PARTIDA (secciones 5.5 y 5.8).
* La localización de Marte es provisional (botón del panel).
* El visor 3D muestra varios textos fijos en español (heredado) y `juego/luna.js` escribe los mensajes de LITO en español.
* Hay dos archivos `starstep.db` distintos (raíz y `instance/`), lo que confunde diagnósticos.
* `visor-renderer.js`/`visor-modelos.js` no están conectados a ninguna página: si se activan, deben usar `openStarArtifact` y `inspectComponent` igual que `visor3d.js`.

## 15. Plan para la Fase 2

1. Identidad: cuentas + invitado (`player.mode`), tokens y aislamiento por jugador.
2. API de sincronización idempotente (`POST /api/flujo/ops` con `opId`), que valide cada operación contra la misma definición (exportar `flujo-definicion.js` como JSON compartido o generar su equivalente en Python).
3. Endurecer `/api/descubrimiento` y `/api/bitacora`: el servidor calcula actos y descubrimientos; corregir `alsep`.
4. Migración no destructiva `players` → `Astronauta`/`Descubrimiento`/`Progreso`, agregando códigos estables a `Artefacto` y `Escena`.
5. Recuperación: al iniciar, el servidor es la fuente oficial; LocalStorage queda como respaldo y cola de operaciones pendientes.
6. Guardas de página también en Flask para las rutas de misión.


## Integración del capítulo · selección y presentación

- El formulario del cadete navega a `getEntryPoint().page`. Un perfil nuevo llega a `/capitulos`; los capítulos 2 y 3 no tienen objetivos ni acceso.
- Elegir Rock & Roll registra `chapter_select.chapter1` y dirige a `/rock-roll`. La presentación exige visualizar sus escenas y confirmar las instrucciones de LITO antes de registrar `chapter_briefing.ready`.
- La confirmación final abre `/despegue?inicio=capitulo`, que inicia la cuenta regresiva existente sin repetirla. Continuar una aventura sigue utilizando la etapa actual. La preferencia del idioma se comparte mediante StarI18n y la de voz mediante StarSound.
- Compatibilidad: una partida que ya registró el lanzamiento antes de esta integración conserva el acceso al capítulo. Las nuevas etapas introductorias se anotan como `legacy_access`, sin fabricar objetivos, descubrimientos ni certificados oficiales. La partida con perfil pero sin lanzamiento sí debe seleccionar el capítulo.
- El minijuego de vuelo, el prólogo lunar y los checkpoints internos del vuelo siguen pendientes de integración. El despegue conserva por ahora su viaje automático provisional; las páginas `static/demo-*.html` no escriben progreso. Las guardas son de frontend y no reemplazan la futura validación del servidor.

## Integración del vuelo espacial

`launch.liftoff` conduce a `/vuelo` (`space_travel`). El motor de paso fijo de 24 s guarda los límites de 0, 6, 12 y 18 s y fallos mediante StarFlow, sin claves de almacenamiento adicionales. Recargar recupera el último límite seguro. La asistencia aumenta a los 3/6/9 fallos y no elimina colisiones. Solo la victoria registra `space_travel.arrive`, con fuente `travel_minigame`, 24 s y último checkpoint de 18 s; después `/despegue` comienza en descenso, sin repetir el lanzamiento. Partidas con alunizaje previo conservan acceso (`legacy_access`, sin victoria ficticia). El prólogo lunar narrativo sigue previsto. La validación es cliente local, no una protección contra manipulación deliberada ni sincronización de servidor.

## Integración de la bitácora, diplomas y Eagle 3D (feature/integracion-visual)

Integración de `origin/feature/integracion-visual` (`5c7b2e2`) sobre `integration/starstep-equipo` (`1fd33c1`). Ancestro común: `f12bdad`.

**Qué se incorporó (de la rama entrante):**

* Bitácora tipo libro con cuatro secciones (Mi diario, Logros, Medallas, Diplomas): `bitacora-libro.js`, `bitacora-libro.css` y `templates/bitacora.html`. Incluye credencial del explorador, foto opcional, notas de campo y vista del certificado.
* Diploma lunar independiente (`diploma-lunar.js`) y certificado general que exige un nombre de cadete válido (`certificado.js`, `bitacora.js`).
* Visor 3D con el GLB oficial de Eagle: selección directa sobre la malla, resaltado, rotación y zoom (`visor3d.js`).
* Indicadores de progreso lunar (`luna-estado.js`), guía de progreso de Marte, escenario marciano renovado (`marte.js`) y cinemática del viaje a Marte (`viaje-marte.js`, `viaje-marte.css`, `/marte?viaje=luna`).
* Planetas 16-bit compartidos (`planetas.js`) en las escenas de viaje y descenso, con el dibujo anterior como respaldo.
* Reparación de partidas antiguas con Eagle registrado (`recoverLunarArrivalEvidence` en `flujo.js`) y sus dos pruebas.
* Recursos de referencia: `static/bitacora_preview.html` (prototipo de diseño con datos de ejemplo; no está enlazado y no modifica el progreso) y las imágenes del certificado de referencia.

**Qué se descartó de la rama entrante, y por qué:** la rama traía copias anteriores al rediseño (iguales a `ef924bf`) de `main.js`, `progreso.js`, `docs/FLUJO_OFICIAL.md`, `tests/js/navegador-simulado.mjs` y `tests/js/nueva-partida.test.mjs`. `scene.js` e `index.html` también eran esas versiones, más el uso de `planetas.js`. Aplicarlas habría borrado la presentación OUTSTRIP, el idioma, la intro, la bienvenida de LITO, NUEVA PARTIDA rápida, la estación terrestre y sus pruebas. Se mantuvieron nuestras versiones y se aplicaron encima solo los cambios nuevos de esa rama (planetas en `scene.js`, `planetas.js` en las plantillas).

**StarFlow sigue siendo la autoridad:**

* La bitácora, los logros, las medallas, los diplomas, el estado lunar y el viaje a Marte solo **leen** StarFlow y StarProgress. No registran objetivos ni artefactos.
* Abrir el visor no es un descubrimiento: el registro sigue exigiendo localizar, inspeccionar todos los componentes y confirmar.
* Las notas y la foto siguen en `PLAYER_KEYS` (`starstep_notas`, `starstep_foto`): son de la partida y NUEVA PARTIDA las borra.
* La reparación lunar corre antes de la compatibilidad de capítulos y vuelo. Capítulo, presentación y vuelo quedan como `legacy_access` (nunca `official_complete`), no se inventa la victoria del vuelo y sin un alias válido no se repara nada (prueba de integración en `tests/js/flujo.test.mjs`).
* El diploma lunar exige `isActComplete('luna')` y un nombre. El certificado general distingue provisional de oficial con `getChapterStatus()`.

**Eagle 3D:** `static/assets/models/eagle.glb` (glTF 2.0, Blender I/O 4.2, 134 mallas) exige `KHR_draco_mesh_compression` y usa `EXT_texture_webp`. El repositorio solo incluye Three.js r170 (`three.module.js`, `GLTFLoader`, `OrbitControls`). El visor busca primero `static/vendor/three/examples/jsm/loaders/DRACOLoader.js` y `static/vendor/draco/`; si no están, usa la CDN con la misma versión (jsDelivr para el cargador y gstatic para el decodificador 1.5.7). Sin red o sin WebGL queda el modelo procedural con sus puntos de inspección. El GLB no se modificó.

**Pruebas agregadas por la integración:** una prueba de StarFlow (reparación lunar con las etapas nuevas) y una de rutas (recursos de la bitácora, el viaje a Marte, el estado lunar y el orden `planetas.js` → `scene.js`).

## Capítulo 1 · Bloque 1: cinemática de Apollo 11

Al elegir Rock & Roll en `/capitulos` (`chapter_select.chapter1`), `/rock-roll` empieza con el video completo de Apollo 11 y después sigue la presentación:

```
/capitulos → /rock-roll: video (2:32) → tres actos → mensaje breve de LITO → instrucciones del vuelo → ¡ESTOY LISTO! → /despegue (cuenta regresiva única) → /vuelo
```

* **Reproductor** (`static/js/cinematica.js`, `static/css/cinematica.css`, `window.StarCinematic.mount()`): marco con la relación de aspecto original (16:9), reproducir y pausar, barra de progreso, sonido y volumen, subtítulos, ES/EN, pantalla completa y teclado (espacio/K, M, C, F, ← →). Si el navegador bloquea la reproducción con sonido, muestra «▶ VER CINEMÁTICA». Al reproducir detiene la música y la voz de LITO, y al ocultar la pestaña pausa el video.
* **Primera vez:** se ve completa, sin SALTAR y sin adelantar más allá de lo ya visto (se puede retroceder y pausar). Al terminar se marca `rock_roll_intro` en `starstep_cinematicas`.
* **Después:** aparece «SALTAR CINEMÁTICA». La marca es una **preferencia del dispositivo** (`PREFERENCE_KEYS`), así que NUEVA PARTIDA la conserva.
* **Repetición:** botón «VER CINEMÁTICA» en la página «Mi diario» de la bitácora, habilitado solo si ya se vio. Se abre en modo repetición, con CERRAR.
* **Si el video falla:** se muestra la misma historia como narración en texto (10 partes, ES/EN). Leerla completa también cuenta como vista y permite continuar.
* **Solo presentación:** ver, saltar o repetir el video no registra objetivos. `chapter_briefing.ready` sigue registrándose al pulsar ¡ESTOY LISTO!. Si `cinematica.js` no carga, la presentación anterior sigue completa (respaldo).
* **Escenas:** después del video se omiten «Dos mundos» y el título, que el video ya muestra. El mensaje de LITO ahora retoma el video, y la escena «¡ESTOY LISTO!» explica los controles del vuelo.

**Subtítulos:** el video trae el inglés incrustado y no tiene pista de subtítulos. El guion se transcribió de esos subtítulos con sus tiempos (36 frases, incluidas las citas «The Eagle has landed» y «One small step»). La traducción al español es del equipo de desarrollo. El guion vive en `cinematica.js` (fuente única) y genera `static/assets/videos/rock-roll-intro.{es,en}.vtt`; una prueba verifica que coincidan. En español, la franja propia tapa el inglés incrustado solo mientras hay una frase. En inglés queda oculta (el texto ya está en el video) y se puede activar.

**Archivo:** `static/assets/videos/rock-roll-intro.mp4`. Es una copia sin modificar del video entregado: 2:32, 1024×576, H.264 + AAC, 24,8 MB, con inicio rápido. Flask lo sirve con rangos (206).

**Créditos y verificación pendientes:**

* La autoría y la licencia del video **no constan**: hay que verificarlas antes de una distribución pública.
* El video dice «They ventured up to 100 meters away from the module». Las fuentes de la NASA describen recorridos de unos 60 m (cráter Little West), así que conviene revisarlo. No se modificó el video; los subtítulos lo traducen tal cual.

Pruebas: `tests/js/cinematica.test.mjs` (11) y `tests/test_rutas.py::test_cinematica_rock_roll`. La prueba anterior de la interfaz de Rock & Roll (`capitulos.test.mjs`) se conserva y ahora cubre el respaldo sin reproductor.

## Capítulo 1 · Acto II: enigma de la hematita

`static/js/enigma-hematita.js` y `static/css/enigma.css` (capturas 09 y 10). En `/marte`, el botón «HEMATITA 3D» ya no registra las esférulas directamente: abre el enigma.

1. Foto real de las esférulas (`hematite-spherules.webp`, NASA/JPL-Caltech/Cornell/USGS) y la pregunta.
2. Se eligen 2 de 6 instrumentos: Pancam, Mini-TES, Microscopic Imager, RAT, APXS y Mössbauer.
3. **Analizar.** Si la combinación es incorrecta, se explica por qué cada instrumento no alcanza (por ejemplo, APXS mide hierro pero no el mineral) y se puede reintentar sin límite. La respuesta educativa del prototipo es Microscopic Imager + Mössbauer.
4. Resultado con las tres categorías oficiales: Observado (#3FD0E0), Interpretado (#B79CFF) y Narrativa (#FFD23F). Aclara que es evidencia de agua, no de vida.
5. **Guardar en la bitácora.** StarFlow localiza (`mars_panel_scan`), inspecciona (`hematite`) y registra `blueberries`. No hay duplicados, y solo se puede después de registrar Opportunity (`canEnter('mars_hematite')`).

`mars_hematite.enigma` sigue `implemented:false`: activarlo como objetivo nuevo bloquearía partidas que ya registraron las esférulas. El enigma se exige en la interfaz antes del registro. Pruebas: `tests/js/enigma-hematita.test.mjs` (4).

## Capítulo 1 · Minijuegos de los tres actos

Todos los minijuegos registran por la API pública de StarFlow (`locateArtifact`, `beginInspection`, `inspectComponent`, `recordObjective`) con su `source` declarado en `flujo-definicion.js`. No hay atajos de prueba en producción. Las piezas comunes son la tarjeta científica (`tarjeta-cientifica.js`: INSPECCIONAR → GUARDAR, con Observado/Interpretado/Narrativa y fuente) y los diálogos `.mg` de `static/css/mision.css`.

### Acto I · Luna (`/luna`)

* **Exploración con oxígeno** (`luna-mision.js`, capturas 03–05): mundo de 3200 px, O₂ de 135 s que baja al moverse y se recarga en los tanques (+30 s). Si se agota, el cadete vuelve al último punto seguro sin perder lo registrado. HUD con O₂, «Caja n/5» y controles táctiles ◀ ▶ ACCIÓN PAUSA. La muestra de contingencia va primero (como en la misión real). Cada muestra y la placa abren su tarjeta con datos del Lunar Sample Compendium y NSSDCA. El juego se pausa con tarjetas, diálogos o la pestaña oculta. El rover es una herramienta del juego (Apollo 11 no llevó rover) y la interfaz lo aclara.
* **EASEP** (`instrumentos-lunares.js`): mapa cenital con cuadrícula de 1 m. Se coloca el paquete a ~17 m al sur de Eagle (±4 m) y se registran antena, panel solar y sismómetro.
* **Retrorreflector LRRR**: se coloca a ~5 m al NNO y se orienta hacia la Tierra (60° ± 15°). Un pulso láser confirma la orientación. Se registran prismas y soporte.
* **Regreso** (`regreso-laboratorio.js`): acoplamiento con Columbia, con velocidad máxima de 1,2 m/s y desvío máximo de 6 m. Si se llega muy rápido, rebota y se reintenta. El orden pasó a ser `moon_return` → `moon_lab`: primero se vuelve y después se analizan las muestras en la Tierra.
* **Laboratorio:** se encuentran 3 vesículas en el basalto, se clasifican afirmaciones como observadas o interpretadas y se responde una pregunta final.

### Transición y Acto II · Marte (`/marte`)

* **Transición** (`marte-mision.js`): aparece al cerrar el viaje a Marte. Aclara que Apollo 11 nunca fue a Marte y que el puente entre las dos historias es el nombre «Eagle».
* **Aterrizaje 2004**: tres acciones con ventana de tiempo: paracaídas (11–7 km), retrocohetes (0,35–0,1 km) y bolsas de aire (0,1–0,01 km). Si se falla, se reintenta. Termina en el cráter Eagle.
* **Ruta de Opportunity**: rover con batería (moverse gasta, CARGAR recarga) y seis estaciones que se habilitan según la etapa actual: plataforma (tarjeta con foto real), cráter Eagle (enigma de la hematita), Homestake, Esperance, habitabilidad y Perseverance.
* **Enigmas de yeso y arcilla** (`enigmas-marte.js`): mismo mecanismo que la hematita. El yeso de Homestake (2011) se resuelve con Pancam + APXS y la arcilla de Esperance (2013) con RAT + APXS. Una respuesta incorrecta explica por qué cada instrumento no alcanza. La interpretación de la arcilla se presenta como indirecta. Por ahora usan ilustración pixel art; la foto real está pendiente.
* **¿Hubo vida en Marte?**: se clasifican cuatro afirmaciones (agua antigua, condición habitable, sin evidencia). Una de ellas es falsa a propósito: los fósiles de microbios. La respuesta correcta es «agua y lugares habitables, pero no se encontró vida».
* **Tormenta de 2018**: seis soles con τ creciente hasta 10,8. Se eligen hasta dos acciones por sol. Con τ ≥ 4,7, sin calefactores el frío consume batería. La última foto solo vale con τ ≥ 9 y hay que transmitirla. Una mala estrategia pierde. La nota final recuerda que Opportunity no volvió a despertar y que la misión terminó en febrero de 2019. Los parámetros están inspirados en la tormenta real; no son datos de ingeniería.

### Acto III · Huellas (`/huellas`)

* **Asociación**: las piezas que todavía no se consiguieron aparecen 🔒 y deshabilitadas. Las de `legacy_access` siguen disponibles.
* **Eagle y Eagle** (`huellas-mision.js`): cuatro datos que se asignan al módulo (Luna, 1969) o al cráter (Marte, 2004), y una pregunta final. Elegir «Apollo 11 fue a Marte» no avanza.
* **Método en espejo**: cinco pasos con una afirmación lunar y otra marciana cada uno (captura 13). El último deja abierta la pregunta de la vida. Al terminar, la etapa actual pasa a `chapter_reward`.

### Bitácora y portada

* **Diploma marciano** (`diploma-marciano.js`, pestaña Diplomas): PNG independiente del diploma lunar. Se habilita con `isActComplete('marte')` y un nombre de cadete. No registra objetivos (`mars_reward` sigue ⏳).
* **Créditos** (`creditos.js`, botón CRÉDITOS en la portada): equipo OUTSTRIP, reto Space Apps 2026 Managua, fuentes NASA, herramientas y uso de IA. El modelo Eagle y el video aparecen con autoría y licencia **pendientes de verificación**. También aclara que StarStep no es un sitio oficial de la NASA.

### Partidas existentes

Las etapas ya completadas se conservan. Una etapa recién implementada que la partida nunca completó pasa a ser la actual. Por ejemplo, una partida que ya estaba en Marte vuelve a `moon_install_easep` para instalar los instrumentos, sin perder nada registrado. Es intencional: así el capítulo se recorre completo.

### Pendiente

* Integrar el GLB de Opportunity (hoy el visor usa el modelo procedural; `opportunity.glb` no está en el repositorio y se ve el 404 del intento de carga).
* Fotos reales de las muestras lunares, del yeso y de la arcilla. Hoy hay ilustraciones o tarjetas sin foto.
* Copia local de Draco (descarga pendiente de autorización).
* Verificar la autoría y la licencia del video y del modelo Eagle.
* `moon_prologue`, `moon_reward`, `mars_reward` y `return_station` siguen ⏳. La cinemática de órbita y descenso lunar (Bloque 2) no está hecha.

Pruebas: `luna-mision` (6), `instrumentos-lunares` (3), `regreso-laboratorio` (3), `marte-mision` (5), `huellas-mision` (3) y `diplomas-creditos` (2), todas en `tests/js/`. El ayudante `completeGroup` de `navegador-simulado.mjs` completa los grupos con evidencia válida.
