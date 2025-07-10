import { createRouter, createWebHistory } from 'vue-router';

import MainPage from '@/Pages/MainPage.vue';
import TestPage from '@/Pages/TestPage.vue';
import LostPage from '@/Pages/LostPage.vue';

const routes = [
  { path: '/', name: 'Home', component: MainPage },
  { path: '/test', name: 'TEST', component: TestPage},
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: LostPage,
  }
];
console.log(`=> : ${import.meta.env.BASE_URL}`);
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;