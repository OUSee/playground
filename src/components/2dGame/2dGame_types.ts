

export class World {
    gravity: number = 15;
    speed: number = 250;
    objects: Array<GameObject> = []
     
    checkWorldCollision(objects: GameObject[]) {

        function isIntersecting(A: GameObject, B: GameObject) : boolean {
            return !(
                A.position.x + A.width < B.position.x ||
                A.position.x > B.position.x + B.width ||
                A.position.y + A.height < B.position.y ||
                A.position.y > B.position.y + B.height ||
                !A.collidable || !B.collidable
            );
        }

        function checkCollisionAndDirection(A: GameObject, B: GameObject)   {
            if (!isIntersecting(A, B)) return;

            const centerA = { x: A.position.x + A.width / 2, y: A.position.y + A.height / 2 };
            const centerB = { x: B.position.x + B.width / 2, y: B.position.y + B.height / 2 };

            const dx = centerB.x - centerA.x;
            const dy = centerB.y - centerA.y;

            const overlapX = (A.width + B.width) / 2 - Math.abs(dx);
            const overlapY = (A.height + B.height) / 2 - Math.abs(dy);

            if (overlapX < overlapY) {
                return dx > 0 ? "x+" : "x-";
            } else {
                return dy > 0 ? "y+" : "y-";
            }
        }

        function invertDirection(dir: string) : string  {
            switch (dir) {
                case 'x+': return 'x-';
                case 'x-': return 'x+';
                case 'y+': return 'y-';
                default: return 'y+';
            }
        }

        // Clear previous collisions
        objects.forEach(obj => obj.collision = []);

        for (let i = 0; i < objects.length; i++) {
            for (let j = i + 1; j < objects.length; j++) {
                const A = objects[i];
                const B = objects[j];

                if (isIntersecting(A, B)) {
                    const direction = checkCollisionAndDirection(A, B);
                    if(!direction){
                        return
                    }
                    A.collision.push({ object_id: B.id, direction: direction});
                    B.collision.push({ object_id: A.id, direction: invertDirection(direction)});
                    // Simple collision response for floor and player on y+ collision

                    if (direction === "y+") {
                        // объект A стоит на объекте B
                        A.position.y = B.position.y - A.height;
                        A.velocity.y = 0;
                        A.acceleration.y = 0;
                        A.position.y = A.position.y;
                    }
                    if (direction === "x+") {
                        A.position.x = B.position.x - A.width;
                        A.velocity.x = 0;
                        A.acceleration.x = 0;
                    }
                    if (direction === "x-") {
                        A.position.x = B.position.x + B.width;
                        A.velocity.x = 0;
                        A.acceleration.x = 0;
                    }
                    
                    A.onCollisionWith(B, direction);
                    B.onCollisionWith(A, invertDirection(direction));
                }
            }
        }
    }
}

export type Vector2d = {
    x: number,
    y: number
}

export type Vector3d = {
    x: number,
    y: number,
    z: number
}

export type Animation = {
    x: number, 
    y: number, 
    w: number, 
    h: number
}

export type Animations = Record<string, Animation[]>

export class GameObject {
    width: number = 0;
    height: number = 0;
    color: string = 'black';
    collidable: boolean = true;
    id: string;
    collision: Array<{object_id: string, direction: string}> = [];
    weight: number = 10;
    velocity: Vector2d = {x: 0, y: 0};
    acceleration: Vector2d = {x: 0, y: 0};
    position: Vector2d = {x: 0, y: 0};
    sprite: HTMLImageElement | null = null;
    animations: Animations | null = null;
    currentAnimationKey: string | null = null;
    currentAnimationFrame: number | null = null;
    health: number | null = null;
    alive: boolean | null = null;
    damage: number | null = null;
    frameTimer: number | null = null;
    world: World;

    constructor(id: string, world: World){
        this.id = id
        this.world = world
    }
   
    updatePhysics(dt: number,){
        if (this.weight < 0) {
          this.velocity.x = 0;
          this.velocity.y = 0;
          this.acceleration.x = 0;
          this.acceleration.y = 0;
          return;
        }
        this.acceleration.y = this.world.gravity * this.weight;

        this.velocity.y += this.acceleration.y * dt;

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }

    onCollisionWith(other: GameObject, direction: string) {
      // По умолчанию делает ничего
    }
     
    takeDamage(ammount: number){
        if(this.health && this.health !== null) 
            {
                this.health -= ammount
                if(this.health < 0){
                    this.alive = false;
                    this.onDeath()
                }
            }
        
    }

    updateAnimation(dt: number, frameDuration: number = 100) {
        if (!this.animations || !this.currentAnimationKey) return;
        this.frameTimer = (this.frameTimer || 0) + dt * 1000;
        if (this.frameTimer > frameDuration) {
            const frames = this.animations[this.currentAnimationKey];
            this.currentAnimationFrame = ((this.currentAnimationFrame ?? 0) + 1) % frames.length;
            this.frameTimer = 0;
        }
    }

    onDeath(){
        this.color = 'red';
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.weight = 0;
        const index = this.world.objects.indexOf(this);
        if (index > -1) {
          this.world.objects.splice(index, 1);
        }
    }
}

export class Foe extends GameObject {
    health: number = 10;
    width: number = 50;
    height: number = 100;
}

export class Player extends GameObject {
    health: number = 100;
    width: number = 50;
    height: number = 100;
    alive: boolean = true;
    speed: number = 25;
    jump_impulse: number = 25;
    jump_cooldown: number = 1000;
    can_jump: boolean = true;
    last_jumtime: any = null;
    max_air_velocity: number = 20;
    keys: Record<string, boolean> = {};
    face_direction: null = null;

    loadSprite(src: string){
        const newSprite = new Image();
        newSprite.src = src
        newSprite.onload = () => { this.sprite = newSprite; }
    }

    jump(){
        if (this.velocity.y === 0 && this.can_jump) {
            this.velocity.y = -this.jump_impulse; // jump impulse
            this.can_jump = false;
            this.currentAnimationKey = 'jump'
            setTimeout(() => this.can_jump = true, this.jump_cooldown)
        }
    }
    
    move() {
        if (this.velocity.y === 0) { // on ground
            if (this.keys.ArrowLeft && !this.keys.ArrowRight) {
                this.velocity.x = -this.speed; // speed in pixels per second
            } else if (this.keys.ArrowRight && !this.keys.ArrowLeft) {
                this.velocity.x = this.speed;
            } else {
                const deceleration = 1;
                //horizontal movement if no keys pressed
                if (this.velocity.x > 0) {
                    this.velocity.x = Math.max(0, this.velocity.x - deceleration);
                } else if (this.velocity.x < 0) {
                    this.velocity.x = Math.min(0, this.velocity.x + deceleration);
                }
            }
        } else {
            // In air, you can allow air control or set velocity.x = 0 if you want no air control
            if (this.velocity.x > this.max_air_velocity) {
                this.velocity.x -= 1;
            }
            else if (this.velocity.x < -this.max_air_velocity) {
                this.velocity.x += 1;
            }
        }
    }

    shoot(objects: GameObject[]) {
        // Создаём новый снаряд в позиции перед игроком
        const projectile = new Projectile(`projectile ${Date.now()}`, this.world);
        objects.push(projectile);
    }
}

export class Projectile extends GameObject {
    onCollisionWith(other: GameObject, direction: string) {
        // Игнорируем столкновения с самим собой или с другими снарядами, если нужно
        if (other === this) return;

        // Наносим урон другому объекту
        if (this.damage && other.health) {
          other.takeDamage(this.damage);
        }

        // Удаляем снаряд из списка объектов (то есть "уничтожаем" его)
        const index = this.world.objects.indexOf(this);
        if (index > -1) {
          this.world.objects.splice(index, 1);
        }
    }
}