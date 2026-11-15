
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
        // Visual sprite only; simulation rover dimensions and controls are unchanged.
        const map=[
 "........o.......",
 ".......ooo......",
 ".......oco......",
 "........o.......",
 "........o.......",
 "oooooooooooooooo",
 "obbbbbbbbbbbbbbo",
 "oooooooooooooooo",
 "...owwwwwwwo....",
 "..o.o..o..o.o...",
 ".ooo.ooo.ooo....",
 ".oko.oko.oko....",
 ".ooo.ooo.ooo...."];
        const pal={o:'#1A1340',b:'#262C66',w:'#E3A92B',c:'#3FD0E0',k:'#757B94'};
        const u=3,x=Math.round(this.x+(this.width-16*u)/2),y=Math.round(this.y+this.height-13*u);
        for(let j=0;j<map.length;j++)for(let i=0;i<map[j].length;i++){const col=pal[map[j][i]];if(col){ctx.fillStyle=col;ctx.fillRect(x+i*u,y+j*u,u,u);}}
        ctx.fillStyle='#4F86D9';for(let i=1;i<15;i+=3)ctx.fillRect(x+i*u,y+6*u,2*u,u);
    }
}
