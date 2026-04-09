import * as THREE from 'three'
import { ref } from 'vue'


/**
 * Композабл для создания 3D гироскопической игры на Three.js
 * Поддерживает управление мышью, клавиатурой, тач-событиями и гироскопом устройства
 * Реализует физику движения сферы с гравитацией, трением и прыжками
 */
export const useGyroGameEngine = () => {
  // === ФИЗИКА ДВИЖЕНИЯ ===
  /** экземпляр часов */
  const clock = new THREE.Clock()
  let deltaTime = 0

  /**
  * Вектор ускорения от пользовательского ввода (мышь/клавиатура/гироскоп/тач)
  */
  const inputAcceleration = new THREE.Vector3(0, 0, 0)

  /** Текущая скорость движения сферы (интегрируется из ускорения) */
  const velocity = new THREE.Vector3(0, 0, 0)

  /** Текущее ускорение (input + гравитация) */ 
  const acceleration = new THREE.Vector3(0, 0, 0)

  /**  Вектор гравитации (направлен вниз по оси Y)*/
  const gravity = new THREE.Vector3(0, -10, 0);

  /** Относительное смещение камеры от сферы (вид сверху-сзади); x, y (высота), z (отдаление)*/
  const cameraOffset = new THREE.Vector3(0, 5, 5); 

  /** Флаг если обьект находится в воздухе */
  const midair = ref<Boolean>(true)

  // === КОНТЕЙНЕР И РАЗМЕРЫ ===
  // Получаем контейнер для канваса
  const handler = document.getElementById('gyrogamewindow')

  // Размеры канваса с минимальным значением 360px
  const sizes = {
    // Адаптивные размеры с защитой от слишком маленьких значений
    width: (handler?.offsetWidth && handler?.offsetWidth > 360) ? handler.offsetWidth : 360,
    height: (handler?.offsetHeight && handler?.offsetHeight > 360) ? handler.offsetHeight : 360
  }

  // === ОСНОВНЫЕ ОБЪЕКТЫ СЦЕНЫ ===
  // === Создание сцены ===
  const scene = new THREE.Scene()

  // === КАМЕРА ===
  /** Перспективная камера с FOV 75°, ближняя/дальняя плоскости отсечения */
  const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
  camera.position.set(0, 5, 0)
  camera.rotation.set(-0.8, 45, 0) // Начальный наклон и поворот
  scene.add(camera)

  // === МАТЕРИАЛЫ ===
  // Wireframe материал для "проволочного" эффекта
  const wiredMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
//   const solidMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false })

  // === ОБЪЕКТЫ МИРА ===
  // Куб (заготовка, пока не добавлен в сцену - можно раскомментировать)
  const cubeGeometry = new THREE.BoxGeometry(3, 3, 3)
  const cube = new THREE.Mesh(cubeGeometry, wiredMaterial)
  cube.position.y = 1
  scene.add(cube)

  // === Сфера ===
  // Главный объект - сфера игрока
  const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 8)
  const sphereMesh = new THREE.Mesh(sphereGeometry, wiredMaterial)
  sphereMesh.position.y = 1.5
  scene.add(sphereMesh)

  // === ФУНКЦИИ ФИЗИКИ ===
  /**
   * Обновляет ускорение на основе пользовательского ввода
   * Масштабирует inputAcceleration для плавного движения
   */
  const updateAccelerationFromInput = () => {
    acceleration.copy(inputAcceleration).multiplyScalar(0.1) // масштабируем ускорение
  }


  /**
   * Основная функция физики движения сферы
   * Использует численное интегрирование (Euler method):
   * 1. acceleration → velocity (интегрирование)
   * 2. velocity → position (интегрирование)
   * Применяет гравитацию, трение и вращение сферы
   */
  const moveSphere = () => {
    // обновляем ускорение
    updateAccelerationFromInput()

    const t_acceleration = acceleration.clone().add(gravity)

    if(midair.value){
      t_acceleration.y = 0
    }

    // Интегрируем ускорение, чтобы получить скорость
    velocity.add(t_acceleration.multiplyScalar(deltaTime))

    // ✅ Прыжок как ВЕЛИЧИНА СКОРОСТИ (импульс), не ускорение
    if (!midair.value && inputAcceleration.y > 0) {
      velocity.y = 8.0 // ✅ Фиксированная скорость прыжка (высота ~3-4 единицы)
      inputAcceleration.y = 0 // Сбрасываем флаг
      midair.value = true
    }

    // Интегрируем скорость, чтобы получить смещение
    const displacement = velocity.clone().multiplyScalar(deltaTime)

    const newY = sphereMesh.position.y + displacement.y

    if (newY <= 0.5) {
    // Столкновение! Сбрасываем Y позицию на пол + радиус
    sphereMesh.position.y = 0.5
    
    midair.value = false

    // ✅ Сохраняем горизонтальную скорость, гасим только вертикальную
    velocity.y = Math.max(0, velocity.y * 0.1) // Лёгкий отскок
    
    // ✅ Трение только на полу (горизонталь)
    velocity.x *= 0.85
    velocity.z *= 0.85
  } else {
    // В воздухе — перемещаем полностью
    sphereMesh.position.add(displacement)
    midair.value = true
    
    // ✅ Минимальное сопротивление воздуха (НЕ 0.5!)
    velocity.multiplyScalar(0.98)
  }

    // Обновляем только X/Z если на полу (сдвигаем горизонтально)
  if (sphereMesh.position.y <= 0.5) {
    sphereMesh.position.x += displacement.x
    sphereMesh.position.z += displacement.z
  }

     // Вращаем сферу для визуализации движения
    sphereMesh.rotation.x += velocity.z * 0.06
    sphereMesh.rotation.z -= velocity.x * 0.06
  }

  // === ВИЗУАЛЬНЫЕ ПОМОЩНИКИ ===
  // Сетка для ориентации в пространстве (100x100 единиц)
  const grid = new THREE.GridHelper(100, 100, 0x888888)
  scene.add(grid)

  /**
   * Создаёт и настраивает WebGL canvas
   * @returns HTMLCanvasElement - Готовый canvas элемент
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

  // === РЕНДЕРЕР ===
  const renderer = new THREE.WebGLRenderer({ canvas: getCanvas(), antialias: true }) // Сглаживание для лучшего качества
  renderer.setPixelRatio(window.devicePixelRatio) // Поддержка HiDPI экранов
  renderer.setClearColor(0x12438f, 0) // Тёмно-синий фон

  /**
   * Главный игровой цикл (60 FPS)
   * Обновляет физику, позицию камеры и рендерит сцену
   */
  function animate() {
    try {
      requestAnimationFrame(animate)
      deltaTime = clock.getDelta() // Точное время кадра

      moveSphere() // Физика

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

  // === УПРАВЛЕНИЕ ===
  let isDragging = false // Флаг перетаскивания
  let cameraDragging = false // Режим вращения камеры (Shift)

  // === АДАПТИВНОСТЬ ===
  // Обработчик изменения размера окна и контейнера
  window.addEventListener('resize', () => {
    sizes.width = (handler?.offsetWidth && handler.offsetWidth > 360) ? handler.offsetWidth : 360
    sizes.height = (handler?.offsetHeight && handler.offsetHeight > 360) ? handler.offsetHeight : 360

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(window.devicePixelRatio)
  })

  // === МЫШЬ ===
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

  // === КЛАВИАТУРА ===
  const jump_timer = ref<any | number | null | undefined>(null) // Дебounce для прыжков

  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') {
      cameraDragging = true // Режим камеры
    }

    // WASD + стрелки для движения
    switch (e.key) {
      case 'a':
      case 'ArrowLeft':
        inputAcceleration.x = -150
        break
      case 'w':
      case 'ArrowUp':
        inputAcceleration.z = -150
        break
      case 's':
      case 'ArrowDown':
        inputAcceleration.z = 150
        break
      case 'd':
      case 'ArrowRight':
        inputAcceleration.x = 150
        break
      case " ":
        // Прыжок (Space) с 500мс cooldown
        if (e.code == "Space" && !midair.value && !jump_timer.value) {
          inputAcceleration.y = 1 // Простой триггер
          jump_timer.value = setTimeout(() => {
            inputAcceleration.y = 0
            jump_timer.value = null
          }, 300) // Более длинный cooldown
        }
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
        if(!midair.value) inputAcceleration.x = 0
        break
      case 'w':
      case 'ArrowUp':
      case 's':
      case 'ArrowDown':
        if(!midair.value) inputAcceleration.z = 0
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
  
  /**
   * Парсит данные гироскопа и преобразует в ускорение
   * alpha (a) - поворот по оси Z
   * beta (b)  - наклон вперёд-назад (ось X)  
   * gamma (g) - наклон влево-вправо (ось Y)
   */
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
