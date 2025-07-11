<script setup lang='ts'>
import GyroGame from '@/components/Canvas/GyroGame/GyroGame.vue';


</script>

<template>
    <div id="gyrogamepage" class="container mt-60">
        <h1>GyroGame</h1>
        <div class="container">
            <p class="mb-60">
                While on pc use arrows, "wasd" or mouse to control the sphere movement, for phone users you could use
                gyro or
                just
                your finger.
            </p>
        </div>
        <div class="blueprint horizontal">
            <span class="arrow-top"></span>
            <span class="arrow-bottom"></span>
            <GyroGame></GyroGame>
        </div>
    </div>
</template>

<style type="scss" scoped>
#gyrogamepage {
    @media (max-width: 600px) {
        margin-top: 100px;
    }
}

div.blueprint {
    min-width: 360px;
    min-height: 360px;
    width: 100%;
    height: 100%;
    max-width: 50vh;
    max-height: 50vh;
    margin: 0 auto;
}
</style>