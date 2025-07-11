<script setup lang='ts'>
import router from '@/router/router';


</script>

<template>
    <div class="container mt-60 mb-60">
        <h1>THIS IS 404 PAGE <br> THAT MEANS SOMETHING WENT WRONG AND YOU'VE GOT LOST</h1>
        <h3>Don't worry i've got you. Click this to go back to main page</h3>
        <button @click="() => { router.push('/') }">RETURN HOME</button>
    </div>
</template>

<style scoped></style>