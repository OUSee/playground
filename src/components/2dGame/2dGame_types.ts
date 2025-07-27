export type Vector2d = {
    x: number | 0,
    y: number | 0
}

export type Vector3d = {
    x: number | 0,
    y: number | 0,
    z: number | 0
}

export type Animation = {
    x: number, 
    y: number, 
    w: number, 
    h: number
}

export type Animations = {
    [key: string]: Array<Animation>
}

export class GameObject {
    x: number | 0;
    y: number | 0;
    width: number | 0;
    height: number | 0;
    color: string | 'black';
    collideble: Boolean | true;
    id: string;
    collision: Array<{object_id: string, direction: string}>;
    weight: number | 10; // default weight 10
    velocity: Vector2d;
    acceleration: Vector2d;
    position: Vector2d;
    sprite: string | null;
    animations: Animations | null;
    currentAnimation: Animation | null;
    currentAnimationFrame: number | null;

    constructor(
        x: number | 0, 
        y: number | 0, 
        width: number | 0, 
        height: number | 0, 
        color: string | 'black', 
        collideble: boolean, 
        id: string, 
        collision:  Array<{object_id: string, direction: string}> | null,
        weight: number | 10,
        velocity: Vector2d,
        acceleration: Vector2d, 
        position: Vector2d,
        sprite: string | null,
        animations: Animations | null,
        currentAnimation: Animation | null,
        currentAnimationFrame: number | null
    ){

    }
}

export const CreateGameObject = () => {
    const newObject = new GameObject
    return 
}