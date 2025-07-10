<script setup lang='ts'>
import Canvas from '@/components/Canvas/Canvas.vue';


</script>

<template>
    <div class="container">
        <h1>TEST PAGE</h1>
        <div class="blueprint horizontal">
            <span class="arrow-top"></span>
            <span class="arrow-bottom"></span>
            <Canvas></Canvas>
        </div>
    </div>
</template>

<style scoped>
div.blueprint {
    min-width: 360px;
    min-height: 360px;
    max-width: 50vh;
    max-height: 50vh;
    margin: 0 auto;
}
</style>