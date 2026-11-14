
export class Rover {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.width = 64;
        this.height = 32;
        this.speed = 180;
    }

    update(dt, keys, worldWidth) {
        let direction = 0;

        if (keys.ArrowRight || keys.KeyD) {
            direction += 1;
        }

        if (keys.ArrowLeft || keys.KeyA) {
            direction -= 1;
        }

        this.x += direction * this.speed * dt;

        this.x = Math.max(
            0,
            Math.min(this.x, worldWidth - this.width)
        );
    }

    draw(ctx) {
        const x = Math.round(this.x);
        const y = this.y;

        // Cuerpo del rover
        ctx.fillStyle = "#dce4ed";
        ctx.fillRect(x + 8, y + 4, 48, 18);

        // Cabina
        ctx.fillStyle = "#60a5fa";
        ctx.fillRect(x + 18, y, 24, 12);

        // Panel solar
        ctx.fillStyle = "#264b91";
        ctx.fillRect(x + 4, y + 4, 12, 18);

        // Ruedas
        ctx.fillStyle = "#252934";

        for (let i = 0; i < 3; i++) {
            ctx.fillRect(
                x + 4 + i * 21,
                y + 22,
                14,
                10
            );
        }
    }
}
