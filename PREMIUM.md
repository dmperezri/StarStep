# StarStep · visor y despegue premium

Esta actualización conserva sin cambios `static/js/juego/`, `static/js/intro.js` y `static/css/juego.css`. El puente sigue siendo `artefacto:descubierto` → `starstep:inspect` → `StarVisor.open(id)`. Abrir el visor libera las teclas retenidas y captura las teclas del rover mientras está abierto; no cambia su física.

## Archivos

- `static/js/visor3d.js`: interfaz, foco, controles, fichas y modo sin WebGL.
- `static/js/visor-renderer.js`: luces, PMREM, pedestal, pines proyectados, cámara, GLB y liberación de recursos.
- `static/js/visor-modelos.js`: seis modelos procedurales y polvo interactivo.
- `static/js/despegue.js`: cinco fases temporizadas; preparación, cuenta regresiva, ignición, ascenso/separación y travesía/alunizaje. La secuencia dura unos 25,5 segundos de tiempo activo.
- `static/js/planetas.js`: esferas pixeladas, nubes, cráteres, halos y terminador con dithering. Incluye Tierra, Luna y Marte; el viaje actual usa Tierra y Luna.
- `main.js`: el código de la portada sólo se activa cuando existe su botón de inicio.
- `progreso.js`: añade la ficha ALSEP/Apollo 15 como una estación distinta de EASEP/Apollo 11.
- `despegue.html`, `luna.html`, `bitacora.html`, `style.css`: integración y controles.
- `static/vendor/three/`: Three.js 0.170.0 y sus módulos necesarios, con licencia MIT. No depende del CDN.

## Modelos de Blender opcionales

Colocar GLB autocontenidos, sin Draco/KTX2, en `static/assets/models/`: `eagle.glb`, `easep.glb`, `alsep.glb`, `reflector.glb`, `opportunity.glb`, `blueberries.glb`. Las animaciones esqueléticas no se reproducen en este visor de piezas estáticas.

El visor muestra el modelo procedural inmediatamente. Si el GLB carga, sustituye el modelo, ajusta su escala a 2,8 unidades y apoya su base sobre el pedestal. Para ubicar los pines con precisión, incluir nodos `hotspot_1`, `hotspot_2`, `hotspot_3` en orden de los botones de cada pieza. Sin estos nodos se conservan las posiciones orientativas del esquema procedural. Nombrar las mallas o materiales de paneles con `solar` o `panel` para aplicar el polvo interactivo a un GLB de Opportunity; también se reconocen materiales predominantemente azules. El GLB no sustituye el modelo procedural si falta, es inválido o su caja no es válida.

## Resiliencia y rendimiento

El visor funciona con ratón, tacto y botones accesibles por teclado. Escape cierra y devuelve el foco. Si falta WebGL2 o falla un módulo, las fichas y el guardado siguen disponibles. La carga de GLB tiene un límite de red de ocho segundos y se descarta si se cerró o cambió el visor.

Se detienen los ciclos al ocultar la pestaña. Al cerrar se liberan controles, geometrías, materiales, texturas, PMREM y contexto WebGL. El buffer usa resolución reducida; tras muestras sostenidas de lentitud baja de 0,8 a 0,5 y desactiva sombras. Los equipos con cuatro núcleos o menos comienzan sin sombras. Las partículas están acotadas. El alunizaje final no mantiene un ciclo permanente. Movimiento reducido omite la cinemática, elimina flotación y desactiva auto-rotación.

No se garantiza 60 FPS en todos los dispositivos. Las comprobaciones en Chrome con renderizado software verifican funcionalidad, no el rendimiento real de una GPU ni todos los navegadores. El audio conserva el sistema existente y empieza con el gesto de iniciar.

## Precisión educativa

Los modelos y las escalas temporales son representaciones didácticas, no reconstrucciones ni simulaciones orbitales exactas. El ALSEP real usaba un generador RTG; los paneles de este esquema son ilustrativos. El núcleo de Apollo 15 recuperado tenía 2,42 m; el cilindro de 3 m representa un esquema visual ampliado. La limpieza de Opportunity es una interacción visual: no implica que el rover tuviera un mecanismo de limpieza ni se recuperara de la tormenta de 2018.

Fuentes consultadas:
- NASA, núcleo profundo Apollo 15: https://www.nasa.gov/wp-content/uploads/static/history/alsj/a15/A15DeepCoreDrill15001-006Lunar%20SampleCompendium.pdf
- NASA, Apollo 15 y RTG: https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/a/Apollo_15-1.pdf
- JPL, recuperación de Opportunity y limpieza por viento: https://www.jpl.nasa.gov/news/update-on-opportunity-rover-recovery-efforts/
- Three.js: https://threejs.org/docs/ y licencia incluida en static/vendor/three/LICENSE.

## Ejecutar

Desde la carpeta del proyecto, con Flask instalado: `python app.py`. Abrir `http://127.0.0.1:5000/despegue` o el flujo normal de la portada. No abrir las plantillas directamente como archivos locales.
