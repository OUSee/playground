<script setup lang='ts'>
import { onMounted, ref, watchEffect } from 'vue';
import { useBoxGameEngine } from './BoxGameEngine'

const position = ref({ x: 0, y: 0, z: 0 })

onMounted(() => {
    const Engine = useBoxGameEngine();
    Engine.animate()
    watchEffect(() => {
        position.value = Engine.cube_position.value
    })
})
</script>

<template>
    <div id="boxgamewindow"></div>
    <p>x: {{ position.x.toFixed(1) }} | y: {{ position.y.toFixed(1) }} | z: {{ position.z.toFixed(1) }}</p>
</template>

<style type="scss" scoped>
#boxgamewindow {}
</style>