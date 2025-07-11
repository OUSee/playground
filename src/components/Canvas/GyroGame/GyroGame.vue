<script setup lang='ts'>
import { onMounted, ref, watchEffect } from 'vue';
import { useGyroGameEngine } from './GyroGameEngine';


const orientation = ref({ a: 0, b: 0, g: 0 })

onMounted(() => {
    const Engine = useGyroGameEngine();
    Engine.animate()
    watchEffect(() => {
        orientation.value = Engine.gyroscope.value;
    })
})
</script>

<template>
    <div id="gyrogamewindow"></div>
    <p>x: {{ orientation.b.toFixed(1) }} | y: {{ orientation.a.toFixed(1) }} | z: {{ orientation.g.toFixed(1) }}</p>
</template>

<style type="scss" scoped>
#gyrogamewindow {}
</style>