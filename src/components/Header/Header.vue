<script setup lang='ts'>
import router from '@/router';
import './Header.scss'


</script>

<template>
    <header>
        <div class="container header">
            <div class="logo-wrapper" @click="() => router.push('/')">
                THE PLAYGROUND
            </div>
            <nav>
                <router-link to="/works">Work</router-link>
                <router-link to="/about">About</router-link>
                <router-link to="/contact">Contact</router-link>
                <router-link to="/test">Test</router-link>
            </nav>
        </div>
        <div class="container">
            <hr>
        </div>
    </header>
</template>

<style scoped></style>