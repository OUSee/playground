<script setup lang='ts'>

</script>

<template>
    <div class="container">
        <h1>MAIN PAGE</h1>

        <div class="blueprint horizontal test-blueprint">
            <span class="arrow-top"></span>
            <span class="arrow-bottom"></span>
            <div class="blueprint vertical test-blueprint2">
                <span class="arrow-top"></span>
                <span class="arrow-bottom"></span>
                <div class="img-wrapper">
                    <img src="@/assets/img/blueprint.svg" alt="">
                </div>
            </div>
        </div>
    </div>
</template>

<style type="scss" scoped>
.test-blueprint {
    width: 50vw;
    height: 50vh;
}

.test-blueprint2 {
    width: 100%;
    height: 100%;
}
</style>