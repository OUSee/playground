<script setup lang='ts'>
import BoxTowerGame from '@/components/Canvas/BoxTowerGame/BoxTowerGame.vue';

</script>

<template>
    <div class="container">
        <h1>TEST PAGE</h1>
        <div class="blueprint horizontal">
            <span class="arrow-top"></span>
            <span class="arrow-bottom"></span>
            <BoxTowerGame></BoxTowerGame>
        </div>
    </div>
</template>

<style scoped>
div.blueprint {
    min-width: 360px;
    min-height: 360px;
    margin: 0 auto;
}
</style>