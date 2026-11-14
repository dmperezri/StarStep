
export class Camara {

    constructor(viewWidth, worldWidth) {
        this.x = 0;
        this.viewWidth = viewWidth;
        this.worldWidth = worldWidth;
    }

    update(rover, dt) {

        const target =
            rover.x + rover.width / 2 -
            this.viewWidth / 2;

        const limit = Math.max(
            0,
            this.worldWidth - this.viewWidth
        );

        const position = Math.max(
            0,
            Math.min(target, limit)
        );

        // Movimiento suave de cámara
        this.x += (position - this.x) *
            (1 - Math.exp(-6 * dt));
    }

    apply(ctx) {
        ctx.translate(-Math.round(this.x), 0);
    }
}
