
import * as THREE from 'three' 

export const useThreeHandler = () => {
const handler = document.getElementById('canvasHandler')

const sizes = {
    width: (handler?.offsetWidth && handler?.offsetWidth > 360) ? handler?.offsetWidth : 360,
    height: (handler?.offsetHeight && handler?.offsetHeight > 360) ? handler?.offsetWidth : 360
}
console.log(`=> sizes: `, sizes);

// scene
const scene = new THREE.Scene()

// camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.z = 5
camera.position.y = 1
scene.add(camera);

// object
const cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
const defaultMaterial  = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true})
const cube = new THREE.Mesh(cubeGeometry, defaultMaterial);
cube.position.y = 1
scene.add(cube);

// grid 
// const grid = new THREE.GridHelper(10, 10, 0x888888)
// scene.add(grid)

// renderer
const getCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas')
    canvas.classList.add('absolute')
    canvas.id = 'created_canvas'
    canvas.width = sizes.width
    canvas.height = sizes.height
    canvas.style.width = sizes.width + 'px';
    canvas.style.height = sizes.height + 'px';

    handler?.appendChild(canvas)
    return canvas
}

// const render = () => {
//     renderer.render(scene, camera)
// }
const renderer = new THREE.WebGLRenderer({canvas: getCanvas(), antialias: true});
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setClearColor(0x12438f, 0)
function animate () {
    try{
        requestAnimationFrame(animate);
        // cube.rotation.x += 0.05;
        // cube.rotation.y += 0.05;
        // cube.rotation.z += 0.05;
        renderer.render(scene, camera);
    }catch(err){
        console.log(`=> err: ${err}`);
    }
}

// listeners
let isDragging = false
document.addEventListener('resize', ()=>{
    sizes.width = (handler?.offsetWidth && handler?.offsetWidth > 360) ? handler?.offsetWidth : 360
    sizes.height = (handler?.offsetHeight && handler?.offsetHeight > 360) ? handler?.offsetWidth : 360
    camera.aspect = sizes.width / sizes.height
    renderer.setSize(sizes.width , sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio)
    camera.updateProjectionMatrix()
})

handler?.addEventListener('mousedown', ()=>{
    isDragging = true;
    handler.classList.add('isDraggin')
})

document?.addEventListener('mouseup', ()=> {
    isDragging = false
    handler?.classList.remove('isDraggin')
})

document?.addEventListener('mousemove', (e)=> {
    if(!isDragging)return

    const deltaMove = {
      x: e.movementX,
      y: e.movementY
    };

    const rotationspeed = 0.01;
    cube.rotation.y += deltaMove.x * rotationspeed;
    cube.rotation.x += deltaMove.y * rotationspeed;
})

// handler?.addEventListener('mouseleave', ()=>{
//     isDragging = false
//     handler.classList.remove('isDraggin')
// })
return{
    animate
}
}
