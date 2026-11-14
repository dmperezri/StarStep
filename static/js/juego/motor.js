
export class Motor {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.width = canvas.width;
        this.height = canvas.height;

        this.ctx.imageSmoothingEnabled = false;
        this.keys = {};
        this.lastTime = 0;

        window.addEventListener("keydown", (event) => {
            this.keys[event.code] = true;

            if (["ArrowLeft", "ArrowRight"].includes(event.code)) {
                event.preventDefault();
            }
        });

        window.addEventListener("keyup", (event) => {
            this.keys[event.code] = false;
        });

        window.addEventListener("blur", () => {
            this.keys = {};
        });
    }

    start(update, render) {
        const loop = (time) => {
            const dt = this.lastTime
                ? Math.min((time - this.lastTime) / 1000, 0.05)
                : 0;

            this.lastTime = time;

            update(dt, this.keys);

            this.ctx.clearRect(
                0, 0, this.width, this.height
            );

            render(this.ctx);

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }
}
