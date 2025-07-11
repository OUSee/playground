import * as THREE from 'three'
import { ref } from 'vue'

export const useGyroGameEngine = () => {

  // Создаём экземпляр часов
  const clock = new THREE.Clock()
  let deltaTime = 0
  // Объект для хранения направления движения (например, из клавиатуры)
  const inputAcceleration = new THREE.Vector3(0, 0, 0)
  // Объект для хранения текущей дельты движения по осям
  const velocity = new THREE.Vector3(0, 0, 0)
  const acceleration = new THREE.Vector3(0, 0, 0)
  // Смещение камеры относительно сферы
  const cameraOffset = new THREE.Vector3(0, 5, 5); // x, y (высота), z (отдаление)

  // Получаем контейнер для канваса
  const handler = document.getElementById('gyrogamewindow')

  // Размеры канваса с минимальным значением 360px
  const sizes = {
    width: (handler?.offsetWidth && handler?.offsetWidth > 360) ? handler.offsetWidth : 360,
    height: (handler?.offsetHeight && handler?.offsetHeight > 360) ? handler.offsetHeight : 360
  }

  // === Создание сцены ===
  const scene = new THREE.Scene()

  // === Настройка камеры ===
  const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
  camera.position.set(0, 5, 0)
  camera.rotation.set(-0.8, 45, 0) 
  scene.add(camera)

  // === Создание материалов ===
  const wiredMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
//   const solidMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false })

  // === Куб (пока не добавлен в сцену) ===
  const cubeGeometry = new THREE.BoxGeometry(3, 3, 3)
  const cube = new THREE.Mesh(cubeGeometry, wiredMaterial)
  cube.position.y = 1
  // scene.add(cube)

  // === Сфера ===
  const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 8)
  const sphereMesh = new THREE.Mesh(sphereGeometry, wiredMaterial)
  sphereMesh.position.y = 1.5
  scene.add(sphereMesh)


  // Функция для обновления ускорения на основе ввода
  const updateAccelerationFromInput = () => {
    acceleration.copy(inputAcceleration).multiplyScalar(0.1) // масштабируем ускорение
  }


  // Функция движения сферы с учётом дельты движения и ускорения
  const moveSphere = () => {
    // обновляем ускорение
    updateAccelerationFromInput()

    // Интегрируем ускорение, чтобы получить скорость
    velocity.add(acceleration.clone().multiplyScalar(deltaTime))

    // Интегрируем скорость, чтобы получить смещение
    const displacement = velocity.clone().multiplyScalar(deltaTime)

    // Обновляем позицию сферы
    sphereMesh.position.add(displacement)
    velocity.multiplyScalar(0.985) // как быстро движение затухает

     // Вращаем сферу для визуализации движения
    sphereMesh.rotation.x += velocity.z * 0.06
    sphereMesh.rotation.z -= velocity.x * 0.06
  }

  // === Сетка для ориентации в пространстве ===
  const grid = new THREE.GridHelper(100, 100, 0x888888)
  scene.add(grid)

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

  /**
   * Основной цикл анимации
   */
  function animate() {
    try {
      requestAnimationFrame(animate)
      deltaTime = clock.getDelta()
      moveSphere()
       // Получаем позицию сферы
    const spherePos = sphereMesh.position;

    // Устанавливаем позицию камеры выше и позади сферы
    camera.position.copy(spherePos).add(cameraOffset);

    // Камера смотрит на сферу
    camera.lookAt(spherePos);
      renderer.render(scene, camera)
    } catch (err) {
      console.error('Animation error:', err)
    }
  }

  // === Переменные для управления взаимодействием ===
  let isDragging = false
  let cameraDragging = false

  // Обработчик изменения размера окна и контейнера
  window.addEventListener('resize', () => {
    sizes.width = (handler?.offsetWidth && handler.offsetWidth > 360) ? handler.offsetWidth : 360
    sizes.height = (handler?.offsetHeight && handler.offsetHeight > 360) ? handler.offsetHeight : 360

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(window.devicePixelRatio)
  })

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
      camera.rotation.y += deltaMove.x * cameraRotationSpeed
      camera.rotation.x += deltaMove.y * cameraRotationSpeed
    } else {
      // Иначе двигаем сферу
      inputAcceleration.x = e.movementX * 100;
      inputAcceleration.z = e.movementY * 100
    }
  })


  // Обработчик нажатия клавиш
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') {
      cameraDragging = true
    }

    switch (e.key) {
      case 'a':
      case 'ArrowLeft':
        inputAcceleration.x = -100
        break
      case 'w':
      case 'ArrowUp':
        inputAcceleration.z = -100
        break
      case 's':
      case 'ArrowDown':
        inputAcceleration.z = 100
        break
      case 'd':
      case 'ArrowRight':
        inputAcceleration.x = 100
        break
      default:
        break
    }

    moveSphere()
  })

  // Обработчик отпускания клавиш
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
      cameraDragging = false
    }

    switch (e.key) {
      case 'a':
      case 'ArrowLeft':
      case 'd':
      case 'ArrowRight':
        inputAcceleration.x = 0
        break
      case 'w':
      case 'ArrowUp':
      case 's':
      case 'ArrowDown':
        inputAcceleration.z = 0
        break
      
      default:
        break
    }

    moveSphere()
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
    inputAcceleration.z = deltaMove.y * 100    

    previousTouchPosition.x = touch.clientX
    previousTouchPosition.y = touch.clientY
  })

  handler?.addEventListener('touchend', () => {
    isDragging = false
    inputAcceleration.x = 0
    inputAcceleration.z = 0
  })

  handler?.addEventListener('touchcancel', () => {
    isDragging = false
    inputAcceleration.x = 0
    inputAcceleration.z = 0
  })

  // === Обработка ориентации устройства (гироскоп) ===

  const gyroscope = ref({ a: 0, b: 0, g: 0 })

  type DeviceMotionEventWithPermission = typeof DeviceMotionEvent & {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  };

  const { requestPermission } = DeviceMotionEvent as DeviceMotionEventWithPermission;

  if (typeof requestPermission === 'function') {
    requestPermission()
      .then((response) => {
        if (response === 'granted') {
          // Разрешение получено, можно подписываться на события
          window.addEventListener('deviceorientation', (event) => {
            console.log('Device orientation:', event.alpha, event.beta, event.gamma)
            gyroscope.value = getGyroScope(event)
          })
        } else {
          alert('no permission granted')
        }
      })
      .catch((error) => {
       console.log(`=> err:`, error);
      });
  } else {
    // Для других платформ — fallback
    window.addEventListener('deviceorientation', (event) => {
        console.log('Device orientation:', event.alpha, event.beta, event.gamma)
        gyroscope.value = getGyroScope(event)
    })
  }
  

  const getGyroScope = (event: DeviceOrientationEvent): any => {
    const gyroData = { a: 0, b: 0, g: 0 }
    gyroData.a = event.alpha ?? 0;
    gyroData.b = event.beta ?? 0;
    gyroData.g = event.gamma ?? 0;

    // добавляем акселерацию на гироскоп
    inputAcceleration.x = gyroData.g * 10;
    inputAcceleration.z = gyroData.b * 10;

    return (gyroData)
  }

  // Возвращаем функцию анимации для запуска извне
  return {
    animate,
    gyroscope
  }
}
