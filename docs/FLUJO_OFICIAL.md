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
| `tests/js/nueva-partida.test.mjs` | Pruebas de «Nueva partida» y de la identidad del jugador (sección 5.5). |
| `tests/js/astronauta.test.mjs` | Pruebas del nombre del cadete: pattern del navegador y regla de recorte (sección 5.6). |
| `static/js/intro-secuencia.js` | Secuencia de entrada: OUTSTRIP, idioma, introducción histórica y bienvenida de LITO (sección 5.7). Solo presentación. |
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
| 3 | Presentación | `lito_welcome` | `/` | ✅ | `lito_welcome.heard` (¡ESTOY LISTO!, sección 5.7) |
| 4 | Presentación | `profile` | `/astronauta` | ✅ | `profile.alias` |
| 5 | Presentación | `cadet_custom` | `/astronauta` | ✅ | `cadet_custom.avatar` |
| 6 | Presentación | `chapter_select` | `/` | ⏳ | — |
| 7 | Prólogo | `launch` | `/despegue` | ✅ | `launch.liftoff` |
| 8 | Prólogo | `space_travel` | `/despegue` | ⏳ | — |
| 9 | Prólogo | `moon_prologue` | `/despegue` | ⏳ | — |
| 10 | Acto I | `moon_landing` | `/despegue` | ✅ | `moon_landing.touchdown` |
| 11 | Acto I | `moon_exploration` | `/luna` | ✅ | artefacto `eagle` registrado (muestras y placa ⏳) |
| 12 | Acto I | `moon_install_easep` | `/luna` | ⏳ | — |
| 13 | Acto I | `moon_install_reflector` | `/luna` | ⏳ | — |
| 14 | Acto I | `moon_lab` | `/luna` | ⏳ | — |
| 15 | Acto I | `moon_return` | `/luna` | ⏳ | — |
| 16 | Acto I | `moon_reward` | `/bitacora` | ⏳ | — |
| 17 | Transición | `mars_transition` | `/marte` | ⏳ | — |
| 18 | Acto II | `mars_landing` | `/marte` | ⏳ | — |
| 19 | Acto II | `mars_exploration` | `/marte` | ✅ | artefacto `opportunity` registrado (plataforma ⏳) |
| 20 | Acto II | `mars_hematite` | `/marte` | ✅ | artefacto `blueberries` registrado (enigma ⏳) |
| 21 | Acto II | `mars_gypsum` | `/marte` | ⏳ | — |
| 22 | Acto II | `mars_clay` | `/marte` | ⏳ | — |
| 23 | Acto II | `mars_habitability` | `/marte` | ⏳ | — |
| 24 | Acto II | `mars_storm` | `/marte` | ⏳ | — |
| 25 | Acto II | `mars_reward` | `/bitacora` | ⏳ | — |
| 26 | Acto III | `footprints` | `/huellas` | ✅ | 6 asociaciones `footprints.pair.<id>` |
| 27 | Acto III | `eagle_connection` | `/huellas` | ⏳ | — |
| 28 | Acto III | `mirror_method` | `/huellas` | ⏳ | 5 pasos `mirror_method.step1..5` |
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
* Al confirmar, `StarProgress.resetPlayerData()` borra **juntas** las claves de `StarProgress.PLAYER_KEYS`: `starstep_flujo`, `starstep_flujo_respaldo`, `starstep_inventario`, `starstep_completed`, `starstep_astronauta`, `starstep_notas` y `starstep_foto`. Luego la portada se recarga: StarFlow crea un invitado nuevo, la bienvenida vuelve a ser obligatoria y las misiones vuelven a estar bloqueadas.
* Se conservan las preferencias del dispositivo (`PREFERENCE_KEYS`: `starstep_lang`, `starstep_audio`).
* **Por qué se borran juntas:** si quedara el inventario, los actos o el perfil heredados, la migración (sección 8) reconstruiría la partida anterior. Hay una prueba de control que lo demuestra.
* **Escrituras tardías:** tras el reinicio, `progreso.js` bloquea toda escritura hasta recargar. Así el controlador en memoria no puede volver a guardar la partida borrada.
* **Otras pestañas:** una pestaña con la partida anterior escucha el evento `storage`. Si se borra `starstep_flujo` (o todos los datos del sitio), deja de guardar y vuelve a `/`. Esto reduce el riesgo de las dos pestañas (sección 14) para este caso.
* No toca el servidor ni la base de datos. Si el navegador impide borrar, se muestra `flow.notice.resetFailed` y no se recarga.
* Toda clave `starstep_*` usada en `static/js` debe estar clasificada en `PLAYER_KEYS` o `PREFERENCE_KEYS`; hay una prueba que falla si aparece una clave nueva sin clasificar.

Pruebas: `tests/js/nueva-partida.test.mjs` (9 pruebas: jugador nuevo y existente, borrado completo con preferencias conservadas, volver a jugar con resultados nuevos, control de la migración, escrituras tardías, otra pestaña, clasificación de claves, botón y textos ES/EN) y `tests/test_rutas.py` (la portada incluye el botón oculto y el diálogo).

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
| Intro histórica vista | `StarProgress.hasSeenCinematic('history_intro')` (clave `starstep_cinematicas`): decide si aparece SALTAR | Jugador |
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
* `starstep_cinematicas` es dato del jugador (`PLAYER_KEYS`): NUEVA PARTIDA la borra y el siguiente jugador ve la intro sin poder saltarla. Por sí sola no hace aparecer NUEVA PARTIDA.
* **Cambio de regla (pedido del equipo):** antes la intro solo aparecía la primera vez por jugador. Ahora aparece tras cada elección de idioma, en ese idioma, y solo la primera vez es obligatoria. La «cinemática vista» ya no decide si se muestra, solo si se puede saltar. LITO sigue mostrándose solo hasta completarla.
* Los jugadores con partida previa ven la intro sin SALTAR hasta completarla una vez. Su partida no cambia.
* Si `intro-secuencia.js` no carga, `main.js` muestra el menú directamente. Las guardas siguen exigiendo la bienvenida para avanzar, así que no se desbloquea progreso.
* Reemplaza a la transmisión anterior de tres mensajes (INICIAR TRANSMISIÓN / SALTAR), al panel `#welcome` sobre el escenario y al comportamiento de la sección 5.1 que volvía a mostrar la bienvenida al cambiar el idioma desde el menú en una apertura inicial. `getHomeMode()` no cambia.
* `static/js/intro.js` (prototipo anterior) no está enlazado en ninguna plantilla; no se modificó.

**Limitaciones:** la voz depende de `speechSynthesis` del navegador y de un gesto previo. En una recarga a mitad de la secuencia, el primer texto puede aparecer sin voz hasta el siguiente clic. La intro no guarda en qué escena se quedó el jugador.

Pruebas: `tests/js/intro-secuencia.test.mjs` (24 pruebas). Después de **cada** clic y de **cada** temporizador comprueban que, mientras se ve OUTSTRIP, el idioma, la intro o LITO, el menú y el escenario terrestre no estén visibles y que nunca haya dos pantallas a la vez. También cubren el fundido (telón opaco, ~420 ms, clics ignorados mientras se oscurece y pantalla usable mientras se aclara), la intro repetida en el idioma elegido (ES y EN, textos y narración, con SALTAR), el movimiento reducido, que la Tierra solo se anime en el menú, las voces sin superponerse, el regreso desde Luna, Marte y Huellas, la recarga con OUTSTRIP, la recarga y la vuelta sin recargar a mitad de la secuencia, VER INTRODUCCIÓN con fundido, NUEVA PARTIDA y el HTML/CSS del primer renderizado. También `tests/test_rutas.py` (la portada carga la secuencia).

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
* Una computadora compartida no distingue jugadores: depende de que alguien pulse NUEVA PARTIDA (sección 5.5).
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
