import { createRouter, createWebHistory } from 'vue-router';

import MainPage from '@/Pages/MainPage.vue';
import TestPage from '@/Pages/TestPage.vue';
import LostPage from '@/Pages/LostPage.vue';
import GyroGamePage from '@/Pages/GyroGamePage.vue';
import DGamePage from '@/Pages/2dGamePage.vue';

const routes = [
  { path: '/', name: 'HOME', component: MainPage },
  { path: '/test', name: 'TEST', component: TestPage},
  { path: '/gyrogame', name: 'GYRO', component: GyroGamePage},
  { path: '/2dgame', name: '2d', component: DGamePage},
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: LostPage,
  }
];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;