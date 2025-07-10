<script setup lang='ts'>
import { useThreeHandler } from '@/hooks/treeHandler';
import { onMounted } from 'vue';

onMounted(() => {
    const { animate } = useThreeHandler();
    animate()
})
</script>

<template>
    <div id="canvasHandler"></div>
</template>

<style type="scss" scoped>
#canvasHandler {
    min-width: 100%;
    min-height: 100%;
    cursor: pointer;

    &.isDraggin {
        cursor: all-scroll;
    }
}
</style>