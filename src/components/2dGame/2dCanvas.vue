<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';
import { Use2dGameEngine } from './2dGameEngine';


const GE = Use2dGameEngine()
const canvas = ref<HTMLCanvasElement>()


onMounted(() => {
    setTimeout(() => {
        if (canvas.value) {
            console.log(`=> should start: ${canvas.value}`);
            const ctx = canvas.value.getContext("2d");
            GE.testGameClasses(canvas.value, ctx)
        }
    }, 500)
})

</script>

<template>
    <canvas ref="canvas" id="myCanvas"
        style="width: 600px; height: 600px; border: 1px solid lightgrey; object-fit: none; background-color: white;"></canvas>
</template>

<style scoped></style>