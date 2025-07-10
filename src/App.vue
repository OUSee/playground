<script setup lang="ts">
import Header from '@/components/Header/Header.vue';
import Footer from '@/components/Footer/Footer.vue';
</script>

<template>
  <Header />

  <main>
    <router-view />
  </main>

  <Footer />
</template>

<style scoped></style>
