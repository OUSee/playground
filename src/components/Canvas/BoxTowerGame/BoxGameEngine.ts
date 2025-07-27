import * as THREE from 'three'
import { ref } from 'vue'

export const useBoxGameEngine = () => {
  // Получаем контейнер для канваса
  const handler = document.getElementById('boxgamewindow')

  // Размеры канваса с минимальным значением 360px
  const sizes = {
    width: (handler?.offsetWidth && handler?.offsetWidth > 700) ? handler.offsetWidth : 700,
    height: (handler?.offsetHeight && handler?.offsetHeight > 700) ? handler.offsetHeight : 700
  }

  /**
   * Создание и добавление canvas в DOM
   * @returns HTMLCanvasElement
   */
  const getCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas')
    canvas.classList.add('absolute')
    canvas.id = 'created_canvas'
    canvas.width = sizes.width
    canvas.height = sizes.height
    canvas.style.width = sizes.width + 'px'
    canvas.style.height = sizes.height + 'px'

    handler?.appendChild(canvas)
    return canvas
  }
  

  // === Настройка рендерера ===
  const renderer = new THREE.WebGLRenderer({ canvas: getCanvas(), antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(0x12438f, 0)

  
  // === Создание сцены ===
  const scene = new THREE.Scene()

  // Создаём экземпляр часов
  const clock = new THREE.Clock()
  let deltaTime = 0

  // === Настройка камеры ===
  const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
  camera.position.set(0, 10, 10)
  camera.rotation.set(-0.55, 44, 0) 
  scene.add(camera)

  // Обработчик изменения размера окна и контейнера
  const adjustViewport = () => {
    sizes.width = (handler?.offsetWidth && handler.offsetWidth > 360) ? handler.offsetWidth : 360
    sizes.height = (handler?.offsetHeight && handler.offsetHeight > 360) ? handler.offsetHeight : 360

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(window.devicePixelRatio)
  }

  adjustViewport()

  window.addEventListener('resize', () => {
    adjustViewport()
  })

  const createBoxObject = () => {
     const cubeGeometry = new THREE.BoxGeometry(3, 3, 3)
     const cube = new THREE.Mesh(cubeGeometry, wiredMaterial)
     cube.position.y = 3 
     cube.position.x = THREE.MathUtils.randInt(0, 5) 
     cube.position.z = THREE.MathUtils.randInt(0, 5) 
     scene.add(cube)   
  }
  // Объект для хранения направления движения (например, из клавиатуры)
  const inputAcceleration = new THREE.Vector3(0, 0, 0)
  // Объект для хранения текущей дельты движения по осям
  const velocity = new THREE.Vector3(0, 0, 0)
  const acceleration = new THREE.Vector3(0, 0, 0)
  // Смещение камеры 
  const cameraOffset = new THREE.Vector3(0, 5, 5); // x, y (высота), z (отдаление)


  

  // === Создание материалов ===
  const wiredMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
//   const solidMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false })

  // === Куб (пока не добавлен в сцену) ===
  const cubeGeometry = new THREE.BoxGeometry(3, 3, 3)
  const cube = new THREE.Mesh(cubeGeometry, wiredMaterial)
  cube.position.y = 3  
  scene.add(cube)


  // Функция для обновления ускорения на основе ввода
  const updateAccelerationFromInput = () => {
    acceleration.copy(inputAcceleration).multiplyScalar(0.1) // масштабируем ускорение
  }


  // Функция движения сферы с учётом дельты движения и ускорения
  const moveMesh= (mesh : THREE.Mesh) => {
    // обновляем ускорение
    updateAccelerationFromInput()

    // Интегрируем ускорение, чтобы получить скорость
    velocity.add(acceleration.clone().multiplyScalar(deltaTime))

    // Интегрируем скорость, чтобы получить смещение
    const displacement = velocity.clone().multiplyScalar(deltaTime)

    // Обновляем позицию сферы
    mesh.position.add(displacement)
    velocity.multiplyScalar(0.85) // как быстро движение затухает

     // Вращаем сферу для визуализации движения
    // mesh.rotation.x += velocity.z * 0.06
    // mesh.rotation.z -= velocity.x * 0.06
  }

  // === Сетка для ориентации в пространстве ===
  const grid = new THREE.GridHelper(100, 100, 0x888888)
  scene.add(grid)
  
  // === Переменные для управления взаимодействием ===
  let isDragging = false
  let cameraDragging = false

  const calculateHeight = (a: number, b: number): number => {
    const c = Math.sqrt(a*a + b*b);
    const h = (a*b)/c
    return h
  }

  const  cube_position = ref({x: 0, y: 0, z: 0})

  // Обработчик начала перетаскивания мышью
  handler?.addEventListener('mousedown', () => {
    isDragging = true
    handler.classList.add('isDragging')
  })

  // Обработчик отпускания мыши
  document.addEventListener('mouseup', () => {
    isDragging = false
    handler?.classList.remove('isDragging')
    inputAcceleration.x = 0
    inputAcceleration.z = 0
    inputAcceleration.y = 0
  })

  // Обработчик движения мыши
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return

    const deltaMove = {
      x: e.movementX,
      y: e.movementY
    }

    const cameraRotationSpeed = 0.001

    if (cameraDragging) {
      // Вращаем камеру при зажатом Shift

      cameraOffset.x += deltaMove.x * cameraRotationSpeed
      cameraOffset.y += deltaMove.y * cameraRotationSpeed
      camera.rotation.y += deltaMove.x * cameraRotationSpeed
      camera.rotation.x += deltaMove.y * cameraRotationSpeed
    } else {
      // Иначе двигаем сферу
      inputAcceleration.x = e.movementX * 1000;
      inputAcceleration.y = -e.movementY * 1000
      inputAcceleration.z = calculateHeight(deltaMove.x, deltaMove.y) * 1000;  
    }
    // console.log(cube.position)
    cube_position.value = cube.position
  })


  // Обработчик нажатия клавиш
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') {
      cameraDragging = true
    }

    // switch (e.key) {
    //   case 'a':
    //   case 'ArrowLeft':
    //     inputAcceleration.x = -100
    //     break
    //   case 'w':
    //   case 'ArrowUp':
    //     inputAcceleration.z = -100
    //     break
    //   case 's':
    //   case 'ArrowDown':
    //     inputAcceleration.z = 100
    //     break
    //   case 'd':
    //   case 'ArrowRight':
    //     inputAcceleration.x = 100
    //     break
    //   default:
    //     break
    // }

    // moveMesh()
  })

  // Обработчик отпускания клавиш
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
      cameraDragging = false
    }

    // switch (e.key) {
    //   case 'a':
    //   case 'ArrowLeft':
    //   case 'd':
    //   case 'ArrowRight':
    //     inputAcceleration.x = 0
    //     break
    //   case 'w':
    //   case 'ArrowUp':
    //   case 's':
    //   case 'ArrowDown':
    //     inputAcceleration.z = 0
    //     break
      
    //   default:
    //     break
    // }

    // moveMesh()
  })

  // === Обработка сенсорных событий (touch) ===
  let previousTouchPosition = { x: 0, y: 0 }

  handler?.addEventListener('touchstart', (event) => {
    if (event.touches.length === 1) {
      isDragging = true
      previousTouchPosition.x = event.touches[0].clientX
      previousTouchPosition.y = event.touches[0].clientY
    }
  })

  handler?.addEventListener('touchmove', (event) => {
    if (!isDragging || event.touches.length !== 1) return

    const touch = event.touches[0]
    const deltaMove = {
      x: touch.clientX - previousTouchPosition.x,
      y: touch.clientY - previousTouchPosition.y
    }

    event.preventDefault()
    // Вращение куба и сферы при движении пальцем
    inputAcceleration.x = deltaMove.x * 100;
    inputAcceleration.y = deltaMove.y * 100
    inputAcceleration.z = calculateHeight(deltaMove.x, deltaMove.y) * 100;    

    previousTouchPosition.x = touch.clientX
    previousTouchPosition.y = touch.clientY
  })

  handler?.addEventListener('dblclick', () => {
    createBoxObject()
  })

  handler?.addEventListener('touchend', () => {
    isDragging = false
    inputAcceleration.x = 0
    inputAcceleration.z = 0
    inputAcceleration.y = 0
  })

  handler?.addEventListener('touchcancel', () => {
    isDragging = false
    inputAcceleration.x = 0
    inputAcceleration.z = 0
    inputAcceleration.y = 0
  })


  /**
   * Основной цикл анимации
   */
  function animate() {
    try {
        requestAnimationFrame(animate)
        deltaTime = clock.getDelta()
        moveMesh(cube)
        
        
        // Камера смотрит на сферу
        // camera.position.copy(cube.position).add(cameraOffset);
        // camera.lookAt(cube.position)
        // console.log(
        //     cube_position
        // )
        renderer.render(scene, camera)
    } catch (err) {
      console.error('Animation error:', err)
    }
  }
  

  // Возвращаем функцию анимации для запуска извне
  return {
    animate,
    cube_position
  }
}
