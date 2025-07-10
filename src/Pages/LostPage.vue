<script setup lang='ts'>
import router from '@/router';


</script>

<template>
    <div class="container">
        <h1>THIS IS 404 PAGE MEANS SOMETHING WENT WRON AND YOU'VE GOT LOST</h1>
        <h3>Don't worry i've got u click this to go back to main page</h3>
        <button @click="() => { router.push('/') }">RETURN HOME</button>
    </div>
</template>

<style scoped></style>