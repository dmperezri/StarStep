
"use strict";

window.StarArt = (() => {

    // =========================================================
    // PALETA OFICIAL STARSTEP
    // =========================================================

    const P = {
        night: '#0E1233',
        panel: '#1A1F4D',
        raised: '#262C66',
        outline: '#1A1340',
        cream: '#FFF8E7',
        soft: '#B9BEE6',
        mint: '#8FF0D8',
        crystal: '#ABA1F5',
        facet: '#6E62CE',
        moon: '#FFE066',
        mars: '#D9593A'
    };

    // =========================================================
    // UTILIDADES DE DIBUJO PIXEL ART
    // =========================================================

    const fill = (c, x, y, w, h, color) => {
        c.fillStyle = color;

        c.fillRect(
            Math.round(x),
            Math.round(y),
            Math.max(1, Math.round(w)),
            Math.max(1, Math.round(h))
        );
    };

    function dot(c, x, y, r, color) {
        for (let v = -r; v <= r; v++) {
            const width = Math.floor(
                Math.sqrt(r * r - v * v)
            );

            fill(c, x - width, y + v, width * 2 + 1, 1, color);
        }
    }

    // Polígonos con bordes pixelados.

    function polygon(c, points, color) {

        const ymin = Math.floor(
            Math.min(...points.map(p => p[1]))
        );

        const ymax = Math.ceil(
            Math.max(...points.map(p => p[1]))
        );

        for (let y = ymin; y < ymax; y++) {

            const xs = [];

            for (let i = 0; i < points.length; i++) {

                const [x1, y1] = points[i];

                const [x2, y2] =
                    points[(i + 1) % points.length];

                if (
                    (y1 <= y + .5 && y2 > y + .5) ||
                    (y2 <= y + .5 && y1 > y + .5)
                ) {
                    xs.push(
                        x1 +
                        (y + .5 - y1) *
                        (x2 - x1) /
                        (y2 - y1)
                    );
                }
            }

            xs.sort((a, b) => a - b);

            for (let i = 0; i + 1 < xs.length; i += 2) {

                const a = Math.ceil(xs[i] - .5);
                const b = Math.ceil(xs[i + 1] - .5);

                if (b > a) {
                    fill(c, a, y, b - a, 1, color);
                }
            }
        }
    }

    function random(seed) {

        let n = seed >>> 0;

        return () => {

            n = (
                Math.imul(n, 1664525) + 1013904223
            ) >>> 0;

            return n / 4294967296;
        };
    }

    // =========================================================
    // NUBES
    // =========================================================

    function cloud(c, x, y, s = 1) {

        c.save();

        c.translate(Math.round(x), Math.round(y));
        c.scale(s, s);

        polygon(c, [
            [0,17], [4,17], [4,11], [11,11],
            [11,5], [18,5], [18,0], [31,0],
            [31,4], [40,4], [40,10], [49,10],
            [49,15], [56,15], [56,22], [48,22],
            [48,25], [9,25], [9,22], [0,22]
        ], '#D5E8ED');

        polygon(c, [
            [2,17], [6,17], [6,11], [13,11],
            [13,5], [19,5], [19,1], [30,1],
            [30,6], [39,6], [39,12], [47,12],
            [47,16], [54,16], [54,20], [43,20],
            [43,22], [11,22], [11,20], [2,20]
        ], P.cream);

        fill(c, 23, 19, 24, 2, '#B7D4E6');
        fill(c, 10, 14, 8, 2, '#FFFFFF');

        c.restore();
    }

    // =========================================================
    // COHETE STARSTEP
    // =========================================================

    function rocket(c, x, y, s = 1, flame = 0, side = false) {

        c.save();

        c.translate(Math.round(x), Math.round(y));
        c.scale(s, s);

        if (side) {
            c.rotate(Math.PI / 2);
        }

        // Contorno.

        polygon(c, [
            [-8,-26], [-5,-34], [0,-41],
            [5,-34], [8,-26], [8,13],
            [13,17], [13,22], [5,22],
            [3,16], [-3,16], [-5,22],
            [-13,22], [-13,17], [-8,13]
        ], P.outline);

        // Cuerpo principal.

        polygon(c, [
            [-6,-25], [-3,-33], [0,-38],
            [3,-33], [6,-25], [6,13], [-6,13]
        ], '#E4DFFF');

        // Punta.

        polygon(c, [
            [-5,-27], [0,-37], [5,-27],
            [5,-23], [-5,-23]
        ], P.mint);

        // Iluminación y sombras.

        fill(c, 3, -22, 3, 34, '#ABA1F5');
        fill(c, -5, -21, 2, 29, P.cream);

        fill(c, -6, -18, 12, 2, '#6E62CE');
        fill(c, -6, 8, 12, 3, '#6E62CE');

        // Ventana.

        fill(c, -5, -12, 10, 11, P.facet);
        fill(c, -3, -10, 6, 7, P.night);
        fill(c, -2, -9, 3, 4, P.mint);

        // Aletas.

        polygon(c, [
            [-8,5], [-12,18], [-12,20],
            [-6,20], [-6,7]
        ], P.facet);

        polygon(c, [
            [8,5], [12,18], [12,20],
            [6,20], [6,7]
        ], '#4F45A6');

        // Motor.

        fill(c, -5, 13, 10, 4, '#575C74');
        fill(c, -3, 17, 6, 2, P.outline);

        // Propulsión.

        if (flame) {

            const h = 10 + Math.round(17 * flame);

            polygon(c, [
                [-5,19], [5,19], [4,23],
                [2,19+h], [0,23+h],
                [-3,19+h], [-4,23]
            ], '#D9593A');

            fill(
                c, -3, 19, 6,
                Math.max(4, h - 4),
                '#FFC93C'
            );

            fill(
                c, -1, 19, 2,
                Math.max(3, h - 8),
                P.cream
            );
        }

        c.restore();
    }

    // =========================================================
    // LITO — NUEVO DISEÑO PRISMÁTICO
    // =========================================================

    function lito(
        c,
        x,
        y,
        t = 0,
        world = 'earth',
        state = 'idle'
    ) {

        const colors = world === 'moon'
            ? [
                '#C3C7D6',
                '#868CA4',
                '#575C74',
                P.moon,
                '#FFF1AC'
            ]
            : world === 'mars'
            ? [
                '#F7B08E',
                '#D9593A',
                '#7A2818',
                '#3FD0E0',
                '#C5FAFF'
            ]
            : [
                '#ABA1F5',
                '#6E62CE',
                '#4F45A6',
                P.mint,
                '#E4DFFF'
            ];

        const [
            light,
            mid,
            dark,
            accent,
            shine
        ] = colors;

        const excited = state === 'excited';

        const bob =
            Math.round(Math.sin(t * 3) * 2) -
            (
                excited
                    ? Math.round(
                        Math.max(0, Math.sin(t * 4)) * 4
                    )
                    : 0
            );

        c.save();

        c.translate(
            Math.round(x),
            Math.round(y + bob)
        );

        // Cristales flotantes.

        const diamond = (dx, dy, r) => {

            polygon(c, [
                [dx,dy-r-1],
                [dx+r+1,dy],
                [dx,dy+r+1],
                [dx-r-1,dy]
            ], P.outline);

            polygon(c, [
                [dx,dy-r],
                [dx+r,dy],
                [dx,dy+r],
                [dx-r,dy]
            ], accent);

            fill(c, dx - 1, dy - 2, 2, 2, P.cream);
        };

        fill(c, -1, -26, 3, 7, P.outline);
        fill(c, -1, 21, 3, 6, P.outline);

        diamond(0, -28, 4);
        diamond(0, 27, 3);

        diamond(
            -19 - Math.round(Math.sin(t * 3) * 2),
            1,
            3
        );

        diamond(
            19 + Math.round(Math.sin(t * 3) * 2),
            1,
            3
        );

        // Contorno del prisma.

        polygon(c, [
            [0,-21], [15,-6], [15,8],
            [0,23], [-15,8], [-15,-6]
        ], P.outline);

        // Cristal principal.

        polygon(c, [
            [0,-18], [13,-5], [13,7],
            [0,20], [-13,7], [-13,-5]
        ], light);

        // Facetas.

        polygon(c, [
            [0,-18], [13,-5], [13,7],
            [0,20], [0,8], [5,-5]
        ], mid);

        polygon(c, [
            [13,-5], [13,7], [0,20],
            [5,8], [5,-5]
        ], dark);

        polygon(c, [
            [0,-18], [-11,-5], [-11,2],
            [-7,-4], [-3,-8]
        ], shine);

        // Línea de energía.

        fill(c, -12, -6, 24, 2, accent);

        // Pantalla facial.

        fill(c, -10, -3, 20, 13, dark);
        fill(c, -8, -2, 16, 11, P.night);
        fill(c, -7, -1, 14, 1, '#262C66');

        // Expresión feliz.

        if (state === 'happy') {

            for (const dx of [-4, 4]) {

                fill(c, dx - 2, 3, 1, 2, accent);
                fill(c, dx - 1, 1, 3, 2, accent);
                fill(c, dx + 2, 3, 1, 2, accent);
            }

            fill(c, -3, 6, 7, 1, accent);

        // Exploración y emoción.

        } else if (state === 'scan' || excited) {

            for (const dx of [-4, 4]) {

                fill(c, dx - 2, 2, 5, 1, accent);
                fill(c, dx, 0, 1, 5, accent);
            }

            fill(c, -2, 6, 5, 1, accent);

            if (state === 'scan') {

                for (let yy = 0; yy < 16; yy += 3) {

                    fill(
                        c,
                        -6 - yy / 4,
                        23 + yy,
                        12 + yy / 2,
                        1,
                        '#3FD0E0'
                    );
                }
            }

        // Expresión normal y narración.

        } else {

            const blink = Math.sin(t * 2.3) < -.97;

            for (const dx of [-5, 2]) {

                fill(
                    c,
                    dx,
                    blink ? 3 : 1,
                    3,
                    blink ? 1 : 4,
                    accent
                );
            }

            if (state === 'talking') {

                fill(
                    c,
                    -2,
                    6,
                    5,
                    Math.sin(t * 14) > 0 ? 2 : 1,
                    accent
                );

            } else {

                fill(c, -2, 6, 5, 1, accent);
            }
        }

        // Destellos ambientales.

        if (Math.sin(t * 6) > .55) {

            fill(c, -17, -13, 1, 4, P.cream);
            fill(c, -18, -12, 3, 1, P.cream);
            fill(c, 16, 14, 2, 2, accent);
        }

        c.restore();
    }

    // =========================================================
    // VEGETACIÓN TROPICAL
    // =========================================================

    function palm(c, x, y, s = 1) {

        c.save();

        c.translate(x, y);
        c.scale(s, s);

        // Tronco.

        polygon(c, [
            [-2,0], [3,0], [1,-16],
            [-3,-31], [-6,-35],
            [-8,-33], [-5,-17]
        ], '#654D48');

        polygon(c, [
            [-1,-1], [1,-1], [-2,-19],
            [-6,-33], [-5,-20]
        ], '#A88462');

        for (let i = 0; i < 4; i++) {

            fill(
                c, -4 + i, -29 + i * 6,
                3, 1, '#4A433D'
            );
        }

        // Hojas.

        polygon(c, [
            [-6,-34], [-18,-40], [-29,-38],
            [-30,-35], [-19,-36],
            [-13,-32], [-6,-31]
        ], '#246B55');

        polygon(c, [
            [-6,-34], [-17,-45],
            [-13,-47], [-6,-43], [0,-34]
        ], '#4B9E65');

        polygon(c, [
            [-6,-34], [1,-45], [9,-44],
            [6,-40], [1,-33], [12,-38],
            [24,-36], [28,-32],
            [14,-34], [3,-29]
        ], '#2D865B');

        polygon(c, [
            [-8,-34], [-15,-33], [-24,-26],
            [-26,-19], [-21,-23],
            [-13,-28], [-5,-30]
        ], '#398F5C');

        polygon(c, [
            [-5,-34], [7,-32], [16,-24],
            [18,-18], [12,-22],
            [6,-27], [-4,-30]
        ], '#56AA6A');

        fill(c, -8, -34, 5, 4, '#8CC47A');

        c.restore();
    }

    // =========================================================
    // OBSERVATORIO Y ESTACIÓN TERRESTRE
    // =========================================================

    function observatory(c) {

        // Estructura.

        fill(c, 11, 155, 135, 61, P.outline);
        fill(c, 13, 158, 131, 55, '#B5C5DD');

        fill(c, 15, 160, 127, 45, '#E4DFFF');
        fill(c, 15, 200, 127, 5, '#ABA1F5');

        // Techo.

        fill(c, 6, 153, 145, 6, P.outline);
        fill(c, 7, 151, 143, 5, '#6E62CE');
        fill(c, 9, 151, 139, 2, '#ABA1F5');

        // Ventanas.

        for (let i = 0; i < 5; i++) {

            const x = 21 + i * 23;

            fill(c, x, 169, 18, 17, '#4F45A6');
            fill(c, x + 2, 171, 14, 13, '#3F84B8');

            fill(c, x + 2, 171, 14, 3, '#8FD6E4');
            fill(c, x + 9, 175, 1, 9, '#76B8D7');
        }

        // Entrada.

        fill(c, 58, 189, 27, 25, P.outline);
        fill(c, 60, 191, 23, 23, '#6E62CE');

        fill(c, 64, 195, 15, 19, P.mint);
        fill(c, 71, 195, 1, 19, '#4F45A6');

        // Escalones.

        fill(c, 48, 214, 46, 3, '#6E738E');
        fill(c, 44, 217, 54, 2, '#A7B5C2');

        // Cúpula del observatorio.

        fill(c, 29, 143, 39, 9, P.outline);
        fill(c, 32, 143, 33, 6, '#B9C9D9');

        polygon(c, [
            [29,144], [29,138], [34,131],
            [42,127], [55,127], [63,131],
            [68,138], [68,144]
        ], P.outline);

        polygon(c, [
            [32,142], [32,137], [37,132],
            [43,129], [54,129], [60,133],
            [65,138], [65,142]
        ], P.cream);

        fill(c, 49, 129, 4, 13, '#868CA4');
        fill(c, 54, 136, 11, 6, '#C3C7D6');

        // Antena satelital.

        fill(c, 116, 143, 4, 9, P.outline);

        polygon(c, [
            [107,134], [127,124], [130,127],
            [125,135], [117,139], [110,139]
        ], P.outline);

        polygon(c, [
            [110,134], [126,127], [126,130],
            [121,135], [114,137]
        ], '#D5E1EE');

        fill(c, 120, 124, 2, 6, '#6E62CE');
    }

    // =========================================================
    // TORRE DE LANZAMIENTO
    // =========================================================

    function tower(c) {

        // Base.

        fill(c, 383, 213, 97, 8, '#464B67');
        fill(c, 383, 211, 97, 4, '#868CA4');

        // Estructura.

        fill(c, 388, 95, 15, 116, P.outline);
        fill(c, 390, 98, 3, 111, '#D9593A');
        fill(c, 398, 98, 3, 111, '#A63A26');

        for (let y = 100; y < 207; y += 12) {

            fill(c, 390, y, 11, 2, '#F7B08E');

            polygon(c, [
                [391,y+2], [393,y+2],
                [400,y+10], [398,y+10]
            ], '#D9593A');

            polygon(c, [
                [399,y+2], [401,y+2],
                [393,y+10], [391,y+10]
            ], '#7A2818');
        }

        fill(c, 386, 94, 19, 4, '#D9593A');
        fill(c, 394, 88, 2, 6, P.outline);

        // Brazos de servicio.

        for (const [y, w] of [[126,31], [162,23]]) {

            fill(c, 402, y, w, 5, P.outline);
            fill(c, 402, y, w, 2, '#D9593A');

            for (let x = 405; x < 402 + w; x += 5) {

                fill(c, x, y + 2, 2, 2, '#F7B08E');
            }
        }

        // Plataforma.

        fill(c, 418, 207, 56, 4, '#575C74');
        fill(c, 423, 205, 46, 2, '#C3C7D6');

        // Marcas de seguridad.

        for (let x = 387; x < 479; x += 9) {

            fill(c, x, 216, 4, 2, '#FFC93C');
        }
    }

    // =========================================================
    // PAISAJE TERRESTRE
    // =========================================================

    function terrain(c) {

        // Montañas lejanas.

        polygon(c, [
            [0,171], [39,145], [62,153],
            [97,119], [125,138], [155,151],
            [199,129], [234,154], [269,142],
            [307,164], [345,136], [384,155],
            [420,147], [480,166],
            [480,213], [0,213]
        ], '#85B7CD');

        // Cordillera y volcán.

        polygon(c, [
            [0,185], [44,163], [85,178],
            [117,157], [143,166], [180,189],
            [227,174], [250,181], [270,165],
            [299,148], [330,110], [343,110],
            [369,143], [398,170], [429,177],
            [480,162], [480,214], [0,214]
        ], '#6297B0');

        // Iluminación del volcán.

        polygon(c, [
            [250,181], [279,160], [330,110],
            [343,110], [336,117], [317,150],
            [312,169], [329,183], [346,197],
            [250,207]
        ], '#79B0C3');

        polygon(c, [
            [330,110], [343,110],
            [348,116], [324,117]
        ], '#D5E6E7');

        fill(c, 331, 110, 11, 2, '#E7F0EB');

        // Litoral.

        polygon(c, [
            [0,192], [42,184], [78,192],
            [130,181], [176,194], [221,184],
            [272,195], [312,185], [362,196],
            [414,185], [480,192],
            [480,214], [0,214]
        ], '#498A9E');

        // Lago.

        fill(c, 0, 194, 480, 22, '#438AA7');
        fill(c, 0, 195, 480, 2, '#6FAFC3');

        const rnd = random(807);

        for (let i = 0; i < 65; i++) {

            const x = Math.floor(rnd() * 480);
            const y = 198 + Math.floor(rnd() * 16);

            fill(
                c,
                x,
                y,
                3 + Math.floor(rnd() * 16),
                1,
                i % 3 ? '#589EB4' : '#8BC2CD'
            );
        }

        // Terreno.

        fill(c, 0, 214, 480, 5, '#9ACCC0');
        fill(c, 0, 219, 480, 51, '#3F8657');
        fill(c, 0, 220, 480, 3, '#6EAF72');
        fill(c, 0, 225, 480, 45, '#4B965A');

        // Camino hacia la plataforma.

        polygon(c, [
            [135,219], [480,219], [480,233],
            [293,233], [170,252], [89,252],
            [89,244], [146,232], [168,226],
            [135,226]
        ], '#316D50');

        polygon(c, [
            [135,219], [480,219], [480,230],
            [292,230], [168,249], [93,249],
            [93,245], [149,231], [169,224],
            [135,224]
        ], '#AAB7B8');

        fill(c, 170, 221, 310, 2, '#D1D7D1');

        for (let x = 186; x < 480; x += 24) {

            fill(c, x, 226, 11, 1, '#E4DFFF');
        }

        // Textura del césped.

        for (let i = 0; i < 160; i++) {

            const x = Math.floor(rnd() * 480);
            const y = 234 + Math.floor(rnd() * 36);

            if (x < 90 || x > 300 || y > 252) {

                fill(
                    c,
                    x,
                    y,
                    1 + Math.floor(rnd() * 3),
                    1,
                    i % 3 ? '#34784E' : '#83B873'
                );
            }
        }

        // Estación y vegetación.

        observatory(c);

        palm(c, 181, 220, .92);
        palm(c, 366, 220, 1.06);

        tower(c);

        // Vegetación del primer plano.

        for (const x of [5,154,287,375,467]) {

            fill(c, x, 265, 11, 5, '#327449');
            fill(c, x + 2, 262, 4, 5, '#4EA260');
            fill(c, x + 6, 264, 5, 3, '#65AD6D');
        }
    }

    // =========================================================
    // ESCENARIO PRINCIPAL — TIERRA
    // =========================================================

    let terrainCache = null;

    function earthScene(c, t = 0, opts = {}) {

        c.imageSmoothingEnabled = false;

        const sky = [
            '#24549C',
            '#285DAA',
            '#2D69B8',
            '#3276C4',
            '#3983CE',
            '#4794D6',
            '#58A4DE',
            '#6BB4E3',
            '#80C2E7',
            '#92CBE7'
        ];

        // Cielo por capas.

        for (let y = 0; y < 270; y += 18) {

            fill(
                c,
                0,
                y,
                480,
                18,
                sky[
                    Math.min(
                        sky.length - 1,
                        Math.floor(y / 18)
                    )
                ]
            );
        }

        // Nubes animadas.

        cloud(c, ((35 + t * 1.8) % 560) - 40, 79, .9);

        cloud(c, ((440 + t * .8) % 560) - 40, 66, .65);

        cloud(c, ((365 + t * 1.1) % 560) - 40, 104, .8);

        // Caché del paisaje estático para mejorar rendimiento.

        if (!terrainCache && typeof document !== 'undefined') {

            terrainCache = document.createElement('canvas');

            terrainCache.width = 480;
            terrainCache.height = 270;

            const ctx = terrainCache.getContext('2d');

            ctx.imageSmoothingEnabled = false;

            terrain(ctx);
        }

        if (
            terrainCache &&
            typeof c.drawImage === 'function'
        ) {

            c.drawImage(terrainCache, 0, 0);

        } else {

            terrain(c);
        }

        // Luz de advertencia de la torre.

        if (Math.sin(t * 2) > 0) {

            fill(c, 394, 87, 2, 2, '#FF6681');
        }

        // Luces de la plataforma.

        for (let x = 409; x < 480; x += 17) {

            fill(
                c,
                x,
                212,
                2,
                1,
                Math.sin(t * 3 + x) > 0
                    ? P.mint
                    : '#4F45A6'
            );
        }

        // Cohete.

        if (!opts.hideRocket) {

            rocket(c, 451, 192, 1.12);
        }

        // LITO.

        lito(
            c,
            234,
            155,
            t,
            'earth',
            opts.litoState || 'idle'
        );
    }

    // =========================================================
    // FONDO ESPACIAL
    // =========================================================

    const stars = Array.from(
        { length: 130 },
        (_, i) => ({
            x: (i * 131 + 17) % 480,
            y: (i * 67 + 31) % 270,
            s: i % 11 === 0 ? 2 : 1
        })
    );

    function skyStars(c, t) {

        fill(c, 0, 0, 480, 270, P.night);

        for (let i = 0; i < stars.length; i++) {

            const s = stars[i];

            if (Math.sin(i + t * 2) > -.6) {

                fill(
                    c,
                    s.x,
                    s.y,
                    s.s,
                    s.s,
                    i % 7 ? P.cream : P.mint
                );
            }
        }
    }

    // =========================================================
    // VIAJE ESPACIAL
    // =========================================================

    function spaceScene(c, t, progress) {

        skyStars(c, t);

        // Tierra y Luna: planetas 16-bit compartidos (planetas.js) si están cargados;
        // si no, el dibujo anterior.

        if (window.StarPlanets) {

            window.StarPlanets.draw(
                c,
                'earth',
                40 - progress * 75,
                175 + progress * 20,
                Math.max(5, 31 - progress * 20),
                t
            );

            window.StarPlanets.draw(c, 'moon', 415, 146, 30, t);

        } else {

            dot(
                c,
                40 - progress * 75,
                175 + progress * 20,
                Math.max(5, 31 - progress * 20),
                '#447FD2'
            );

            dot(
                c,
                33 - progress * 75,
                175 + progress * 20,
                Math.max(2, 8 - progress * 5),
                '#60AD77'
            );

            dot(c, 415, 146, 30, '#C3C7D6');
            dot(c, 405, 140, 8, '#868CA4');
            dot(c, 430, 157, 5, '#868CA4');
        }

        // Nave.

        rocket(
            c,
            176 + progress * 158,
            132,
            1.2,
            1,
            true
        );

        // Acompañante.

        lito(
            c,
            166 + progress * 140,
            89,
            t,
            'moon'
        );
    }

    // =========================================================
    // CINEMÁTICA DE DESPEGUE
    // =========================================================

    function launchScene(c, t, p) {

        if (p < .53) {

            earthScene(c, t, {
                hideRocket: true
            });

            const a = p / .53;

            rocket(
                c,
                451 - a * 96,
                192 - a * 300,
                1.12,
                Math.min(1, a + .1)
            );

        } else {

            spaceScene(
                c,
                t,
                (p - .53) / .47
            );
        }
    }

    // =========================================================
    // DESCENSO LUNAR
    // =========================================================

    function descentScene(c, t, progress) {

        skyStars(c, t);

        // Tierra en el horizonte (planetas.js si está cargado).

        if (window.StarPlanets) {

            window.StarPlanets.draw(c, 'earth', 63, 75, 13, t);

        } else {

            dot(c, 63, 75, 13, '#3D86D8');
            dot(c, 60, 74, 4, '#63AA79');
        }

        // Superficie lunar.

        fill(c, 0, 178, 480, 92, '#575C74');

        for (let x = 0; x < 480; x += 11) {

            fill(
                c,
                x,
                179 + Math.sin(x * .1) * 7,
                12,
                4,
                '#868CA4'
            );
        }

        // Detalles del terreno.

        for (let i = 0; i < 12; i++) {

            const x = (i * 61) % 480;

            fill(
                c,
                x,
                198 + (i * 23) % 56,
                12 + (i % 4) * 3,
                3,
                '#3E4256'
            );
        }

        rocket(
            c,
            240,
            18 + progress * 145,
            1.15,
            progress < .93 ? .55 : 0
        );

        lito(
            c,
            298,
            84 + progress * 70,
            t,
            'moon',
            progress > .86 ? 'happy' : 'idle'
        );
    }

    // =========================================================
    // AVATARES EXISTENTES
    // =========================================================

    const avatars = [

        {
            id: 'vice',
            name: 'Vice',
            skin: '#C98D6A',
            suit: '#6E62CE',
            hair: '#33213D',
            hat: '#3B285B'
        },

        {
            id: 'astronauta',
            name: 'Astronauta',
            skin: '#F1BC96',
            suit: '#E4DFFF',
            hair: '#563F32',
            hat: '#E4DFFF'
        },

        {
            id: 'jaguar',
            name: 'Jaguar UAM',
            skin: '#F9C969',
            suit: '#EBAA39',
            hair: '#9B5D25',
            hat: '#E9B44A'
        },

        {
            id: 'geologa',
            name: 'Geóloga',
            skin: '#F4BB97',
            suit: '#ABA1F5',
            hair: '#754A3D',
            hat: '#FFE066'
        },

        {
            id: 'piloto',
            name: 'Piloto',
            skin: '#996344',
            suit: '#3FD0E0',
            hair: '#2B2130',
            hat: '#4774A6'
        },

        {
            id: 'guardian',
            name: 'Guardián',
            skin: '#BC8B67',
            suit: '#56C88C',
            hair: '#3A3029',
            hat: '#FFE066'
        }
    ];

    // =========================================================
    // RETRATOS DE LOS AVATARES
    // =========================================================

    function portrait(canvas, id) {

        const a =
            avatars.find(a => a.id === id) ||
            avatars[1];

        const c = canvas.getContext('2d');

        c.imageSmoothingEnabled = false;

        c.clearRect(0, 0, 48, 48);

        fill(c, 0, 0, 48, 48, P.raised);
        fill(c, 3, 3, 42, 42, '#48558D');

        fill(c, 7, 34, 34, 13, P.outline);
        fill(c, 11, 32, 26, 14, a.suit);
        fill(c, 20, 28, 8, 9, a.skin);

        // Jaguar UAM.

        if (id === 'jaguar') {

            fill(c, 11, 10, 26, 24, '#EBAA39');

            fill(c, 9, 8, 8, 10, '#F9C969');
            fill(c, 31, 8, 8, 10, '#F9C969');

            fill(c, 16, 17, 16, 15, '#F9C969');

            fill(c, 16, 20, 4, 4, P.night);
            fill(c, 28, 20, 4, 4, P.night);

            fill(c, 23, 27, 3, 3, '#754A3D');

        } else {

            fill(c, 13, 12, 22, 21, a.hair);
            fill(c, 16, 16, 16, 16, a.skin);

            if (id === 'astronauta') {

                fill(c, 10, 9, 28, 26, '#E4DFFF');
                fill(c, 13, 13, 22, 20, P.crystal);
                fill(c, 16, 16, 16, 16, a.skin);

            } else {

                fill(c, 12, 10, 24, 8, a.hat);
                fill(c, 10, 16, 28, 4, a.hat);
            }

            fill(c, 18, 23, 3, 3, P.night);
            fill(c, 27, 23, 3, 3, P.night);
        }

        // Accesorios de identidad de los avatares.

        if(id==='vice'){
            fill(c,12,10,24,8,'#D9593A');
            fill(c,16,21,16,7,P.outline);
            fill(c,18,22,5,3,'#3FD0E0');
            fill(c,26,22,5,3,'#3FD0E0');
        }

        if(id==='astronauta'){
            fill(c,15,17,18,13,'#FFC93C');
            fill(c,17,18,4,3,P.cream);
        }

        if(id==='jaguar'){
            for(const [x,y] of [
                [13,13],[29,13],[15,28],[32,28],[21,16]
            ]) fill(c,x,y,2,2,'#9B5D25');
        }

        if(id==='geologa'){
            fill(c,13,10,22,8,'#8A5A2B');
            fill(c,9,17,30,3,'#B07A3F');
        }

        if(id==='piloto'){
            fill(c,15,21,18,8,P.outline);
            fill(c,17,23,14,3,P.mint);
        }

        if(id==='guardian'){
            fill(c,12,12,24,21,'#868CA4');
            fill(c,15,20,18,9,P.outline);
            fill(c,17,22,14,4,P.mint);
        }

        // Insignia del traje.

        fill(c, 22, 37, 5, 5, P.moon);
        fill(c, 23, 38, 3, 3, P.cream);
    }

    // =========================================================
    // Cabina de personalizacion.

    function cabin(c,t=0){
        c.save();
        c.scale(c.canvas.width/320,c.canvas.height/180);

        fill(c,0,0,320,180,P.night);
        fill(c,60,18,200,92,P.outline);
        fill(c,64,22,192,84,'#05060F');

        c.save();
        c.beginPath();
        c.rect(64,22,192,84);
        c.clip();

        for(let i=0;i<55;i++){
            fill(c,64+(i*37+13)%192,
                 22+(i*23)%84,
                 i%7===0?2:1,1,P.cream);
        }

        if(window.StarPlanets){
            window.StarPlanets.draw(c,'moon',200,64,16,t);
        }else{
            dot(c,200,64,16,'#C3C7D6');
        }

        c.restore();

        fill(c,0,110,320,70,P.panel);
        fill(c,0,110,320,3,P.crystal);

        for(let i=0;i<8;i++){
            fill(c,20+i*36,124,26,12,P.raised);
            fill(c,23+i*36,127,4,3,
                 Math.floor(t*2+i)%3?P.mint:'#FF6681');
            fill(c,30+i*36,127,4,3,
                 Math.floor(t*3+i)%2?P.moon:P.raised);
        }

        c.restore();
    }

    // INTERFAZ PÚBLICA — COMPATIBILIDAD CON STARSTEP
    // =========================================================

    return {
        colors: P,
        earthScene,
        cabin,
        launchScene,
        spaceScene,
        descentScene,
        portrait,
        avatars,
        lito
    };

})();
