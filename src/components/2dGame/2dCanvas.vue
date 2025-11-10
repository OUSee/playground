<script
    setup
    lang="ts"
>
import { onMounted, ref } from 'vue';
import { Use2dGameEngine } from './2dGameEngine';


const GE = Use2dGameEngine()
const canvas = ref<HTMLCanvasElement>()

defineExpose({
    startDemo() {
        if (canvas.value) {
            const ctx = canvas.value.getContext('2d');
            GE.testGameClasses(ctx, canvas.value, true)
        } else {
            alert('no canvas')
        }
    }
})


onMounted(() => {
    setTimeout(() => {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (canvas.value) {
                    console.log(`=> should start: ${canvas.value}`);
                    const ctx = canvas.value.getContext("2d");
                    GE.testGameClasses(ctx, canvas.value, true)
                }
            }
        })
    }, 500)
})

</script>

<template>
    <canvas
        ref="canvas"
        id="myCanvas"
        style="width: 600px; height: 600px; border: 1px solid lightgrey; object-fit: none; background-color: #12438f;"
    ></canvas>
</template>

<style scoped></style>