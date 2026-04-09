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


  const movableCubes: THREE.Mesh[] = []

  const createBoxObject = () => {
     const cubeGeometry = new THREE.BoxGeometry(3, 3, 3)
     const cube = new THREE.Mesh(cubeGeometry, wiredMaterial)
     cube.position.y = 3 
     cube.position.x = THREE.MathUtils.randInt(0, 5) 
     cube.position.z = THREE.MathUtils.randInt(0, 5) 
     scene.add(cube)   
     movableCubes.push(cube) 
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

  // === Изначальный Куб  ===
  createBoxObject()


  // Функция для обновления ускорения на основе ввода
  const updateAccelerationFromInput = () => {
    acceleration.copy(inputAcceleration).multiplyScalar(0.1) // масштабируем ускорение
  }


  // Функция движения сферы с учётом дельты движения и ускорения
  const moveAllCubes = () => {
    updateAccelerationFromInput()
    velocity.add(acceleration.clone().multiplyScalar(deltaTime))
    
    // Проецируем движение только на плоскость XZ (игнорируем Y)
    const displacementXZ = new THREE.Vector3(velocity.x, 0, velocity.z).multiplyScalar(deltaTime)
    
    movableCubes.forEach(cube => {
      cube.position.add(displacementXZ)
      // Вращение для визуального эффекта
      cube.rotation.x += velocity.z * 0.01
      cube.rotation.z -= velocity.x * 0.01
    })
    
    velocity.multiplyScalar(0.92) // Затухание
  }

  // === Сетка для ориентации в пространстве ===
  const grid = new THREE.GridHelper(100, 100, 0x888888)
  scene.add(grid)
  
  // Управление камерой
  let targetPoint = new THREE.Vector3(0, 3, 0) // Точка вращения камеры
  let cameraDistance = 15
  let cameraPhi = 0.8 // угол по вертикали
  let cameraTheta = 0  // угол по горизонтали
  let isCameraDragging = false
  let isShiftPressed = false

  // Обновление позиции камеры
  const updateCameraPosition = () => {
    const x = targetPoint.x + cameraDistance * Math.sin(cameraPhi) * Math.cos(cameraTheta)
    const y = targetPoint.y + cameraDistance * Math.sin(cameraPhi) * Math.sin(cameraTheta)
    const z = targetPoint.z + cameraDistance * Math.cos(cameraPhi)
    
    camera.position.set(x, y, z)
    camera.lookAt(targetPoint)
  }

  const calculateHeight = (a: number, b: number): number => {
    const c = Math.sqrt(a*a + b*b);
    const h = (a*b)/c
    return h
  }

  // Обработчики событий
  let isDragging = false
  let previousMouse = { x: 0, y: 0 }

  // Обработчик начала перетаскивания мышью
  handler?.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Левая кнопка
      isDragging = true
      previousMouse.x = e.clientX
      previousMouse.y = e.clientY
    }
  })

  // Обработчик отпускания мыши
  document.addEventListener('mouseup', () => {
    isDragging = false
    handler?.classList.remove('isDragging')
    inputAcceleration.x = 0
    inputAcceleration.z = 0
    inputAcceleration.y = 0
  })

  document.addEventListener('mouseup', () => {
    isDragging = false
    inputAcceleration.set(0, 0, 0)
  })

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return

    const deltaX = e.clientX - previousMouse.x
    const deltaY = e.clientY - previousMouse.y

    if (isShiftPressed || isCameraDragging) {
      // Вращение камеры вокруг targetPoint
      cameraTheta -= deltaX * 0.005
      cameraPhi += deltaY * 0.005
      cameraPhi = Math.max(0.1, Math.min(Math.PI / 2, cameraPhi))
    } else {
      // Движение кубов в плоскости камеры
      const right = new THREE.Vector3()
      const up = new THREE.Vector3(0, 1, 0)
      
      camera.getWorldDirection(right)
      right.cross(up).normalize()
      
      inputAcceleration.copy(right.multiplyScalar(deltaX * 0.01))
      inputAcceleration.z = deltaY * 0.01
    }

    previousMouse.x = e.clientX
    previousMouse.y = e.clientY
  })

// Колесико мыши для движения камеры вверх/вниз
  handler?.addEventListener('wheel', (e) => {
    e.preventDefault()
    if (isShiftPressed) {
      targetPoint.y += e.deltaY * 0.01
    } else {
      cameraDistance += e.deltaY * 0.01
      cameraDistance = Math.max(5, Math.min(50, cameraDistance))
    }
    updateCameraPosition()
  })

  // Двойной клик - новый куб
  handler?.addEventListener('dblclick', createBoxObject)

  // Клавиши
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') {
      isShiftPressed = true
      isCameraDragging = true
    }
  })

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
      isShiftPressed = false
      isCameraDragging = false
    }
  })

  // === Обработка сенсорных событий (touch) ===
  // Touch события (упрощенные)
  let previousTouch = { x: 0, y: 0 }
  handler?.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true
      previousTouch.x = e.touches[0].clientX
      previousTouch.y = e.touches[0].clientY
    }
  })

  handler?.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return
    const deltaX = e.touches[0].clientX - previousTouch.x
    const deltaY = e.touches[0].clientY - previousTouch.y
    inputAcceleration.set(deltaX * 0.1, 0, deltaY * 0.1)
    previousTouch.x = e.touches[0].clientX
    previousTouch.y = e.touches[0].clientY
  })

  handler?.addEventListener('touchend', () => {
    isDragging = false
    inputAcceleration.set(0, 0, 0)
  })

  // Resize
  const adjustViewport = () => {
    sizes.width = Math.max(handler?.offsetWidth || 700, 700)
    sizes.height = Math.max(handler?.offsetHeight || 700, 700)
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
  }

  window.addEventListener('resize', adjustViewport)
  adjustViewport()

  const cube_position = ref({ x: 0, y: 0, z: 0 })

  /**
   * Основной цикл анимации
   */
   const animate = () => {
    requestAnimationFrame(animate)
    deltaTime = clock.getDelta()
    
    moveAllCubes()
    updateCameraPosition()
    
    // Обновляем позицию первого куба для Vue
    if (movableCubes[0]) {
      cube_position.value = {
        x: movableCubes[0].position.x,
        y: movableCubes[0].position.y,
        z: movableCubes[0].position.z
      }
    }
    
    renderer.render(scene, camera)
  }
  

  // Возвращаем функцию анимации для запуска извне
  return {
    animate,
    cube_position,
    createBoxObject
  }
}
