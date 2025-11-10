<script
    setup
    lang='ts'
>
import DCanvas from '@/components/2dGame/2dCanvas.vue';
import { ref } from 'vue';

const demoRef = ref()


const handlePlayDemo = () => {
    demoRef.value.startDemo()
}
</script>

<template>
    <div
        id="2dGamepage"
        class="container mt-60"
    >
        <h1>2dGame</h1>
        <div class="container">
            <p class="mb-60">
                2d game test still in production
            </p>
            <button @click="handlePlayDemo">Play demo</button>
        </div>
        <div class="blueprint horizontal">
            <span class="arrow-top"></span>
            <span class="arrow-bottom"></span>
            <DCanvas ref="demoRef" />
        </div>
    </div>
</template>

<style
    type="scss"
    scoped
>
#gyrogamepage {
    @media (max-width: 600px) {
        margin-top: 100px;
    }
}

div.blueprint {
    min-width: 600px;
    min-height: 600px;
    width: 100%;
    height: 100%;
    max-width: 50vh;
    max-height: 50vh;
    margin: 0 auto;
}
</style>