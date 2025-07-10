
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

// object cube
const cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
const defaultMaterial  = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true})
const cube = new THREE.Mesh(cubeGeometry, defaultMaterial);
cube.position.y = 1
scene.add(cube);

// object sphere
const sphereGeometry = new THREE.SphereGeometry(1.5, 16, 8)
const sphereMesh = new THREE.Mesh(sphereGeometry, defaultMaterial)
sphereMesh.position.y = 1
scene.add(sphereMesh)
// const sphereMaterial = new THREE.MeshBasicMaterial({

// })



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
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.005;
        cube.rotation.z += 0.005;
        sphereMesh.rotation.x -= 0.005;
        sphereMesh.rotation.y -= 0.005;
        sphereMesh.rotation.z -= 0.005;
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
    sphereMesh.rotation.y -= deltaMove.x * rotationspeed;
    sphereMesh.rotation.x -= deltaMove.y * rotationspeed;
})

// touch

let previousTouchPosition = { x: 0, y: 0 };

handler?.addEventListener('touchstart', (event) => {
  if (event.touches.length === 1) { // один палец
    isDragging = true;
    previousTouchPosition.x = event.touches[0].clientX;
    previousTouchPosition.y = event.touches[0].clientY;
  }
});

handler?.addEventListener('touchmove', (event) => {
  if (!isDragging) return;
  if (event.touches.length !== 1) return;

  const touch = event.touches[0];
  const deltaMove = {
    x: touch.clientX - previousTouchPosition.x,
    y: touch.clientY - previousTouchPosition.y
  };

  event.preventDefault();

  const rotationSpeed = 0.01;

  cube.rotation.y += deltaMove.x * rotationSpeed;
  cube.rotation.x += deltaMove.y * rotationSpeed;
  sphereMesh.rotation.y -= deltaMove.x * rotationSpeed;
  sphereMesh.rotation.x -= deltaMove.y * rotationSpeed;

  previousTouchPosition.x = touch.clientX;
  previousTouchPosition.y = touch.clientY;
  
});

handler?.addEventListener('touchend', () => {
  isDragging = false;
});

handler?.addEventListener('touchcancel', () => {
  isDragging = false;
});

// handler?.addEventListener('mouseleave', ()=>{
//     isDragging = false
//     handler.classList.remove('isDraggin')
// })
return{
    animate
}
}
