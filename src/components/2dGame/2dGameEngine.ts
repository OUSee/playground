    
    export const Use2dGameEngine = () => {
        return ()
    }
    
    
    // canvas
    const canvas = document.getElementById("myCanvas")
    const ctx = canvas.getContext("2d");

    // canvas properties
    canvas.width = 900;
    canvas.height = 900;

    // constants for game rules
    const GRAVITY = 15;
    const PLAYER_SPEED = 25;
    const PLAYER_JUMP_IMPULSE = 25;
    const GAME_SPEED = 250;
    const MAX_AIR_VELOCITY = 15;
    const JUMP_COOLDOWN = 1000;

    // flags
    let can_jump_flag = true;
    let lastTime = null;

    const keys = {
        ArrowLeft: false,
        ArrowRight: false
    }
    // assets
    const playerSprite = new Image();
    playerSprite.src = './sprites/player/player.png';

    const foeSprite = new Image();
    foeSprite.src = './sprites/foe/idle.png';

    // create a game object with properties
    function createObject(props) {
        return {
            x: props.x,
            y: props.y,
            width: props.width,
            height: props.height,
            color: props.color,
            collideble: props.collideble ?? true,
            id: props.id,
            collision: [],
            weight: props.weight ?? 10, // default weight 10
            velocity: { x: 0, y: 0 },
            acceleration: { x: 0, y: 0 },
            position: { x: props.x, y: props.y },
            sprite: props.sprite ?? null,
            animations: props.animations ?? null,
            currentAnimation: props.currentAnimation ?? null,
            currentAnimationFrame: props.currentAnimationFrame ?? null
        };
    }

    // list of objects
    const player = createObject({
        x: 0,
        y: 80,
        width: 10,
        height: 20,
        color: 'blue',
        collideble: true,
        id: 'player',
        collision: [],
        weight: 10,
        sprite: playerSprite,
        animations: {
            idle: [{ x: 0, y: 0, w: 100, h: 200 }],
            run: [{ x: 100, y: 0, w: 100, h: 200 }],
            jump: [{ x: 200, y: 0, w: 100, h: 200 }]
        },
        currentAnimation: 'idle',
        currentAnimationFrame: 0
    })


    const floor = createObject({
        x: 0,
        y: 100,
        width: 200,
        height: 5,
        color: 'brown',
        collideble: true,
        id: 'floor',
        collision: [],
        weight: -1
    })

    const floor2 = createObject({
        x: 150,
        y: 200,
        width: 50,
        height: 5,
        color: 'brown',
        collideble: true,
        id: 'floor2',
        collision: [],
        weight: -1
    })

    const floor3 = createObject({
        x: 200,
        y: 150,
        width: 100,
        height: 5,
        color: 'brown',
        collideble: true,
        id: 'floor3',
        collision: [],
        weight: -1
    })

    const wall = createObject({
        x: 200,
        y: 80,
        width: 5,
        height: 20,
        color: 'black',
        collideble: true,
        id: 'wall',
        collision: [],
        weight: -1
    })

    const foe = createObject({
        x: 225,
        y: 125,
        width: 10,
        height: 20,
        color: 'green',
        collideble: true,
        id: 'foe',
        collision: [],
        weight: 0,
        ai: true,
        speed: 15,
        move_area: { x1: 200, x2: 250 },
    })

    const objects = [
        player,
        floor,
        floor2,
        floor3, wall,
        foe
    ]


    // engine functions
    function animate(time) {
        if (!lastTime) lastTime = time;
        const dt = (time - lastTime) / GAME_SPEED; // delta time in seconds
        lastTime = time;

        updateHorizontalVelocity(player);
        updatePhysicsAll(dt);
        checkWorldCollision();

        // Update animation state and frames for player
        if (player.velocity.y !== 0) {
            player.currentAnimation = 'jump';
        } else if (player.velocity.x !== 0) {
            player.currentAnimation = 'run';
        } else {
            player.currentAnimation = 'idle';
        }

        player.frameTimer = (player.frameTimer || 0) + dt * 1000;

        if (player.frameTimer > (player.frameDuration || 100)) {
            player.currentAnimationFrame = (player.currentAnimationFrame + 1) % (player.animations[player.currentAnimation].length);
            player.frameTimer = 0;
        }

        // Update animation state and frames for foe
        // if (foe.velocity.y !== 0) {
        //     foe.currentAnimation = 'jump';
        // } else if (foe.velocity.x !== 0) {
        //     foe.currentAnimation = 'run';
        // } else {
        //     foe.currentAnimation = 'idle';
        // }

        // foe.frameTimer = (foe.frameTimer || 0) + dt * 1000;
        // if (foe.frameTimer > (foe.frameDuration || 100)) {
        //     foe.currentAnimationFrame = (foe.currentAnimationFrame + 1) % (foe.animations[foe.currentAnimation].length);
        //     foe.frameTimer = 0;
        // }

        draw();

        if (player.y > 500) {
            player.color = 'red'
            player.weight = -1
            setTimeout(() => {
                restartLevel()
            }, 300)
        }

        requestAnimationFrame(animate);
    }

    function restartLevel() {
        location.reload()
    }

    // Update physics for all objects
    function updatePhysicsAll(dt) {
        objects.forEach(obj => {
            updatePhysics(obj, dt);
        });
    }

    // Update physics for one object
    function updatePhysics(obj, dt) {
        // Immovable objects or zero weight: no gravity or movement
        if (obj.weight < 0) {
            obj.velocity.x = 0;
            obj.velocity.y = 0;
            obj.acceleration.x = 0;
            obj.acceleration.y = 0;
            return;
        }
        // Apply gravity acceleration downward
        obj.acceleration.y = GRAVITY * obj.weight;

        // Update velocity with acceleration
        obj.velocity.y += obj.acceleration.y * dt;

        // Update position with velocity
        obj.position.x += obj.velocity.x * dt;
        obj.position.y += obj.velocity.y * dt;

        // Update x, y for drawing and collision detection
        obj.x = obj.position.x;
        obj.y = obj.position.y;
    }

    // update horizontal velocity 
    function updateHorizontalVelocity(obj) {
        if (obj.id === 'player') {
            // console.log('obj.velocity', obj.velocity)
            if (obj.velocity.y === 0) { // on ground
                if (keys.ArrowLeft && !keys.ArrowRight) {
                    obj.velocity.x = -PLAYER_SPEED; // speed in pixels per second
                } else if (keys.ArrowRight && !keys.ArrowLeft) {
                    obj.velocity.x = PLAYER_SPEED;
                } else {
                    //horizontal movement if no keys pressed
                    if (obj.velocity.x > 0) {
                        while (obj.velocity.x > 0) {
                            obj.velocity.x -= 1;
                        }
                    }
                    else if (obj.velocity.x < 0) {
                        while (obj.velocity.x > 0) {
                            obj.velocity.x += 1;
                        }
                    }
                    obj.velocity.x = 0
                }
            } else {
                // In air, you can allow air control or set velocity.x = 0 if you want no air control
                if (obj.velocity.x > MAX_AIR_VELOCITY) {
                    obj.velocity.x -= 1;
                }
                else if (obj.velocity.x < -MAX_AIR_VELOCITY) {
                    obj.velocity.x += 1;
                }

            }
        }

        if (obj.ai && obj.velocity.y === 0) {
            obj.velocity.y = 0
            if (obj.x <= obj.move_area.x1) {
                obj.velocity.x = obj.speed; // move right
            } else if (obj.x >= obj.move_area.x2) {
                obj.velocity.x = -obj.speed; // move left
            }
            // Otherwise keep current velocity.x (or maintain speed)
        }
    }

    // Draw all objects
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        objects.forEach(obj => {
            if (obj.sprite) {
                const frame = obj.animations[obj.currentAnimation ?? 'idle'][obj.currentAnimationFrame ?? 0]
                ctx.drawImage(
                    obj.sprite,
                    frame.x, frame.y, frame.w, frame.h, obj.x, obj.y, obj.width, obj.height
                )
            }
            else {
                ctx.fillStyle = obj.color;
                ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            }
        });
    }

    // Move object manually (e.g., keyboard)
    function moveObject(obj, direction, amount) {
        obj.position[direction] += amount;
        obj.x = obj.position.x;
        obj.y = obj.position.y;
        draw();
    }

    // Collision detection (AABB)
    function isIntersecting(A, B) {
        return !(
            A.x + A.width < B.x ||
            A.x > B.x + B.width ||
            A.y + A.height < B.y ||
            A.y > B.y + B.height);
    }

    // Determine collision direction
    function checkCollisionAndDirection(A, B) {
        if (!isIntersecting(A, B)) return null;

        const centerA = { x: A.x + A.width / 2, y: A.y + A.height / 2 };
        const centerB = { x: B.x + B.width / 2, y: B.y + B.height / 2 };

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

    // Invert collision direction for the other object
    function invertDirection(dir) {
        switch (dir) {
            case 'x+': return 'x-';
            case 'x-': return 'x+';
            case 'y+': return 'y-';
            case 'y-': return 'y+';
        }
    }

    // Check collisions between all objects
    function checkWorldCollision() {
        // Clear previous collisions
        objects.forEach(obj => obj.collision = []);

        for (let i = 0; i < objects.length; i++) {
            for (let j = i + 1; j < objects.length; j++) {
                const A = objects[i];
                const B = objects[j];

                if (isIntersecting(A, B)) {
                    const direction = checkCollisionAndDirection(A, B);
                    A.collision.push({ object: B.id, direction });
                    B.collision.push({ object: A.id, direction: invertDirection(direction) });
                    // Simple collision response for floor and player on y+ collision
                    if ((A.id === 'player' || A.id === 'foe') && B.collideble && direction === 'y+') {
                        // Stop player falling through floor
                        A.position.y = B.y - A.height;
                        A.velocity.y = 0;
                        A.acceleration.y = 0;
                        A.y = A.position.y;
                    }
                    if ((A.id === 'player' || A.id === 'foe') && B.collideble && direction.includes('x')) {
                        if (direction === "x+") {
                            A.position.x = B.x - A.width;
                            A.velocity.x = 0;
                            A.acceleration.x = 0;
                        }
                        else {
                            A.position.x = B.x + B.width;
                            A.velocity.x = 0;
                            A.acceleration.x = 0;

                        }
                    }
                    // You can add more collision responses here
                }
            }
        }
    }

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            keys[e.key] = true;
        }

        if (e.key === 'ArrowUp') {
            // Jump only if on ground (velocity.y === 0)
            if (player.velocity.y === 0 && can_jump_flag) {
                player.velocity.y = -PLAYER_JUMP_IMPULSE; // jump impulse
                can_jump_flag = false;
                setTimeout(
                    () => can_jump_flag = true,
                    JUMP_COOLDOWN)
            }
        }
    })

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            keys[e.key] = false;
        }
        // if (e.key === 'ArrowUp') {
        //     // Jump only if on ground (velocity.y === 0)
        //     if (player.velocity.y === 0) {
        //         player.velocity.y = -PLAYER_JUMP_IMPULSE; // jump impulse
        //     }
        // }
    })

    // animations and sprites


    // Wait for both images to load before starting animation
    let assetsLoaded = 0;
    playerSprite.onload = () => { assetsLoaded++; checkAssetsLoaded(); };
    foeSprite.onload = () => { assetsLoaded++; checkAssetsLoaded(); };

    function checkAssetsLoaded() {
        if (assetsLoaded === 2) {
            requestAnimationFrame(animate);
        }
    }


    // // Start animation loop
    // requestAnimationFrame(animate);